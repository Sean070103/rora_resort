import fs from 'fs'
import path from 'path'
import {
  DatabaseSchema,
  User,
  Room,
  Reservation,
  Wristband,
  WristbandLog,
  LoyaltySettings,
  LoyaltyAuditLog,
  Payment,
  LoyaltyTierConfig,
} from './types'
import { getInitialSeedData } from './seed'

const DB_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DB_DIR, 'database.json')

let writeQueue = Promise.resolve()

function ensureDbFile(): DatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }

  if (!fs.existsSync(DB_FILE)) {
    const seed = getInitialSeedData()
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8')
    return seed
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw) as DatabaseSchema
  } catch (err) {
    console.error('Error reading database file, regenerating with seed:', err)
    const seed = getInitialSeedData()
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8')
    return seed
  }
}

function saveDb(data: DatabaseSchema): Promise<void> {
  writeQueue = writeQueue.then(async () => {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true })
      }
      const tmpFile = `${DB_FILE}.tmp.${Date.now()}`
      await fs.promises.writeFile(tmpFile, JSON.stringify(data, null, 2), 'utf-8')
      await fs.promises.rename(tmpFile, DB_FILE)
    } catch (err) {
      console.error('Failed to write database file:', err)
      throw err
    }
  })
  return writeQueue
}

export const db = {
  // Read database snapshot
  async getSnapshot(): Promise<DatabaseSchema> {
    return ensureDbFile()
  },

  // USERS
  async getUsers(): Promise<User[]> {
    const data = ensureDbFile()
    return data.users
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    const data = ensureDbFile()
    return data.users.find((u) => u.email.toLowerCase() === email.toLowerCase().trim())
  },

  async getUserById(id: string): Promise<User | undefined> {
    const data = ensureDbFile()
    return data.users.find((u) => u.id === id)
  },

  // ROOMS & COTTAGES
  async getRooms(): Promise<Room[]> {
    const data = ensureDbFile()
    return data.rooms
  },

  async getRoomById(id: string): Promise<Room | undefined> {
    const data = ensureDbFile()
    return data.rooms.find((r) => r.id === id)
  },

  async saveRoom(room: Room): Promise<Room> {
    const data = ensureDbFile()
    const index = data.rooms.findIndex((r) => r.id === room.id)
    if (index >= 0) {
      data.rooms[index] = room
    } else {
      data.rooms.push(room)
    }
    await saveDb(data)
    return room
  },

  async deleteRoom(id: string): Promise<boolean> {
    const data = ensureDbFile()
    const index = data.rooms.findIndex((r) => r.id === id)
    if (index >= 0) {
      data.rooms.splice(index, 1)
      await saveDb(data)
      return true
    }
    return false
  },

  // CHECK ROOM AVAILABILITY (Prevent double bookings)
  async checkRoomAvailability(
    roomId: string,
    checkIn: string,
    checkOut: string,
    excludeReservationId?: string
  ): Promise<{ available: boolean; conflict?: Reservation }> {
    const data = ensureDbFile()
    const room = data.rooms.find((r) => r.id === roomId)
    if (!room || !room.isActive || room.status === 'MAINTENANCE') {
      return { available: false }
    }

    const start = new Date(checkIn).getTime()
    const end = new Date(checkOut).getTime()

    if (isNaN(start) || isNaN(end) || start >= end) {
      return { available: false }
    }

    // Active or upcoming reservations that are not cancelled
    const conflicts = data.reservations.filter((res) => {
      if (res.roomId !== roomId) return false
      if (res.status === 'CANCELLED' || res.status === 'COMPLETED') return false
      if (excludeReservationId && res.id === excludeReservationId) return false

      const resStart = new Date(res.checkInDate).getTime()
      const resEnd = new Date(res.checkOutDate).getTime()

      // Dates overlap if start < resEnd and end > resStart
      return start < resEnd && end > resStart
    })

    if (conflicts.length > 0) {
      return { available: false, conflict: conflicts[0] }
    }

    return { available: true }
  },

  // RESERVATIONS
  async getReservations(): Promise<Reservation[]> {
    const data = ensureDbFile()
    return data.reservations.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async getReservationById(id: string): Promise<Reservation | undefined> {
    const data = ensureDbFile()
    return data.reservations.find((r) => r.id === id)
  },

  async getReservationByReference(referenceNumber: string): Promise<Reservation | undefined> {
    const data = ensureDbFile()
    return data.reservations.find(
      (r) => r.referenceNumber.toUpperCase() === referenceNumber.toUpperCase().trim()
    )
  },

  async getGuestReservations(phoneOrEmail: string): Promise<Reservation[]> {
    const data = ensureDbFile()
    const term = phoneOrEmail.toLowerCase().trim()
    return data.reservations
      .filter((r) => r.guestPhone.includes(term) || r.guestEmail.toLowerCase().includes(term))
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  },

  async createReservation(payload: {
    guestName: string
    guestEmail: string
    guestPhone: string
    roomId: string
    checkInDate: string
    checkOutDate: string
    guestsCount: number
    notes?: string
    guestId?: string
  }): Promise<Reservation> {
    const data = ensureDbFile()
    const room = data.rooms.find((r) => r.id === payload.roomId)
    if (!room) {
      throw new Error('Selected accommodation not found')
    }

    // Verify availability
    const avail = await this.checkRoomAvailability(
      payload.roomId,
      payload.checkInDate,
      payload.checkOutDate
    )
    if (!avail.available) {
      throw new Error('Accommodation is not available for the selected dates')
    }

    // Calculate nights
    const start = new Date(payload.checkInDate)
    const end = new Date(payload.checkOutDate)
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const nights = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))

    // Calculate pricing & loyalty discount
    const baseRate = room.basePrice * room.seasonalMultiplier
    const subtotal = baseRate * nights

    const loyalty = await this.getGuestLoyalty(payload.guestPhone, payload.guestEmail)
    const discountPercentage = loyalty.tier.discountPercentage
    const discountAmount = Math.round((subtotal * discountPercentage) / 100)
    const totalAmount = subtotal - discountAmount

    // Unique reference number: QA-#####
    const randNum = Math.floor(10000 + Math.random() * 90000)
    const referenceNumber = `QA-${randNum}`

    const newReservation: Reservation = {
      id: `res_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      referenceNumber,
      guestId: payload.guestId,
      guestName: payload.guestName,
      guestEmail: payload.guestEmail,
      guestPhone: payload.guestPhone,
      roomId: room.id,
      roomName: room.name,
      checkInDate: payload.checkInDate,
      checkOutDate: payload.checkOutDate,
      guestsCount: payload.guestsCount,
      status: 'PENDING',
      nights,
      baseRate,
      subtotal,
      loyaltyTierApplied: loyalty.tier.tier,
      discountPercentage,
      discountAmount,
      totalAmount,
      amountPaid: 0,
      balanceDue: totalAmount,
      notes: payload.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    data.reservations.unshift(newReservation)
    await saveDb(data)
    return newReservation
  },

  async updateReservation(reservation: Reservation): Promise<Reservation> {
    const data = ensureDbFile()
    const index = data.reservations.findIndex((r) => r.id === reservation.id)
    if (index >= 0) {
      reservation.updatedAt = new Date().toISOString()
      data.reservations[index] = reservation
      await saveDb(data)
      return reservation
    }
    throw new Error('Reservation not found')
  },

  // NFC WRISTBANDS
  async getWristbands(): Promise<Wristband[]> {
    const data = ensureDbFile()
    return data.wristbands
  },

  async getWristbandByUid(uid: string): Promise<Wristband | undefined> {
    const data = ensureDbFile()
    const cleanUid = uid.trim().toUpperCase()
    return data.wristbands.find((w) => w.uid.toUpperCase() === cleanUid)
  },

  async registerWristband(payload: { uid: string; label: string; notes?: string }): Promise<Wristband> {
    const data = ensureDbFile()
    const cleanUid = payload.uid.trim().toUpperCase()

    if (data.wristbands.some((w) => w.uid.toUpperCase() === cleanUid)) {
      throw new Error(`Wristband with NFC UID ${cleanUid} is already registered.`)
    }

    const newWristband: Wristband = {
      id: `wb_${Date.now()}`,
      uid: cleanUid,
      label: payload.label.trim().toUpperCase(),
      status: 'AVAILABLE',
      notes: payload.notes,
      createdAt: new Date().toISOString(),
    }

    data.wristbands.push(newWristband)

    // Audit log
    data.wristbandLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      wristbandId: newWristband.id,
      wristbandUid: cleanUid,
      action: 'REGISTER',
      timestamp: new Date().toISOString(),
      details: `Registered new wristband ${newWristband.label} (UID: ${cleanUid}).`,
    })

    await saveDb(data)
    return newWristband
  },

  async assignWristband(payload: {
    wristbandUid: string
    reservationId: string
    staffName?: string
  }): Promise<{ wristband: Wristband; reservation: Reservation }> {
    const data = ensureDbFile()
    const cleanUid = payload.wristbandUid.trim().toUpperCase()
    const wristband = data.wristbands.find((w) => w.uid.toUpperCase() === cleanUid)
    if (!wristband) {
      throw new Error(`Wristband UID ${cleanUid} not found. Register it first.`)
    }

    if (wristband.status === 'LOST' || wristband.status === 'DAMAGED') {
      throw new Error(`Wristband is flagged as ${wristband.status} and cannot be assigned.`)
    }

    const reservation = data.reservations.find((r) => r.id === payload.reservationId)
    if (!reservation) {
      throw new Error('Reservation not found.')
    }

    // Check if wristband is currently assigned to another active guest
    if (
      wristband.status === 'ACTIVE' &&
      wristband.currentReservationId &&
      wristband.currentReservationId !== reservation.id
    ) {
      throw new Error(
        `Wristband is already ACTIVE and assigned to another guest (${wristband.currentGuestName}). Reassign or check out previous guest first.`
      )
    }

    // Update wristband
    wristband.status = 'ACTIVE'
    wristband.currentGuestId = reservation.guestId
    wristband.currentGuestName = reservation.guestName
    wristband.currentReservationId = reservation.id
    wristband.lastAssignedAt = new Date().toISOString()
    wristband.lastScannedAt = new Date().toISOString()

    // Link in reservation
    reservation.assignedWristbandUid = wristband.uid
    reservation.wristbandId = wristband.id
    reservation.updatedAt = new Date().toISOString()

    // Audit log
    data.wristbandLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      wristbandId: wristband.id,
      wristbandUid: wristband.uid,
      action: 'ASSIGN',
      staffName: payload.staffName || 'Staff',
      guestName: reservation.guestName,
      reservationId: reservation.id,
      referenceNumber: reservation.referenceNumber,
      timestamp: new Date().toISOString(),
      details: `Assigned wristband ${wristband.label} (${wristband.uid}) to guest ${reservation.guestName} for reservation ${reservation.referenceNumber}.`,
    })

    await saveDb(data)
    return { wristband, reservation }
  },

  async performCheckIn(payload: {
    reservationId: string
    wristbandUid?: string
    staffName?: string
  }): Promise<{ reservation: Reservation; wristband?: Wristband }> {
    const data = ensureDbFile()
    const reservation = data.reservations.find((r) => r.id === payload.reservationId)
    if (!reservation) {
      throw new Error('Reservation not found.')
    }

    if (reservation.status === 'CHECKED_IN') {
      throw new Error('Guest is already checked in.')
    }

    let wristband: Wristband | undefined

    if (payload.wristbandUid) {
      const cleanUid = payload.wristbandUid.trim().toUpperCase()
      wristband = data.wristbands.find((w) => w.uid.toUpperCase() === cleanUid)
      if (!wristband) {
        throw new Error(`Wristband UID ${cleanUid} not found.`)
      }

      wristband.status = 'ACTIVE'
      wristband.currentGuestName = reservation.guestName
      wristband.currentGuestId = reservation.guestId
      wristband.currentReservationId = reservation.id
      wristband.lastScannedAt = new Date().toISOString()
      wristband.lastAssignedAt = new Date().toISOString()

      reservation.assignedWristbandUid = wristband.uid
      reservation.wristbandId = wristband.id

      // Audit log
      data.wristbandLogs.unshift({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        wristbandId: wristband.id,
        wristbandUid: wristband.uid,
        action: 'CHECK_IN',
        staffName: payload.staffName || 'Receptionist',
        guestName: reservation.guestName,
        reservationId: reservation.id,
        referenceNumber: reservation.referenceNumber,
        timestamp: new Date().toISOString(),
        details: `NFC check-in verified. Wristband ${wristband.label} is now ACTIVE for ${reservation.guestName}.`,
      })
    }

    reservation.status = 'CHECKED_IN'
    reservation.checkedInAt = new Date().toISOString()
    reservation.updatedAt = new Date().toISOString()

    await saveDb(data)
    return { reservation, wristband }
  },

  async performCheckOut(payload: {
    reservationId: string
    staffName?: string
  }): Promise<{ reservation: Reservation; wristband?: Wristband }> {
    const data = ensureDbFile()
    const reservation = data.reservations.find((r) => r.id === payload.reservationId)
    if (!reservation) {
      throw new Error('Reservation not found.')
    }

    if (reservation.status === 'COMPLETED') {
      throw new Error('Reservation is already completed.')
    }

    let wristband: Wristband | undefined
    if (reservation.wristbandId || reservation.assignedWristbandUid) {
      wristband = data.wristbands.find(
        (w) => w.id === reservation.wristbandId || w.uid === reservation.assignedWristbandUid
      )
    }

    if (wristband) {
      // Reusable wristband workflow:
      // Released and marked AVAILABLE FOR REUSE
      wristband.status = 'AVAILABLE'
      const prevGuest = wristband.currentGuestName
      wristband.currentReservationId = undefined
      // Note: We can preserve currentGuestId for past linkage, but clear currentReservationId
      wristband.lastScannedAt = new Date().toISOString()

      // Audit log
      data.wristbandLogs.unshift({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        wristbandId: wristband.id,
        wristbandUid: wristband.uid,
        action: 'CHECK_OUT',
        staffName: payload.staffName || 'Receptionist',
        guestName: reservation.guestName,
        reservationId: reservation.id,
        referenceNumber: reservation.referenceNumber,
        timestamp: new Date().toISOString(),
        details: `Guest ${reservation.guestName} checked out. Wristband ${wristband.label} (${wristband.uid}) released and marked AVAILABLE FOR REUSE.`,
      })
    }

    reservation.status = 'COMPLETED'
    reservation.checkedOutAt = new Date().toISOString()
    reservation.updatedAt = new Date().toISOString()

    // Automatically update guest loyalty count
    const completedVisits = data.reservations.filter(
      (r) =>
        (r.guestPhone === reservation.guestPhone ||
          r.guestEmail.toLowerCase() === reservation.guestEmail.toLowerCase()) &&
        (r.status === 'COMPLETED' || r.id === reservation.id)
    ).length

    data.loyaltyAuditLogs.unshift({
      id: `aud_${Date.now()}`,
      guestPhone: reservation.guestPhone,
      guestName: reservation.guestName,
      previousCompletedVisits: Math.max(0, completedVisits - 1),
      newCompletedVisits: completedVisits,
      reason: `Automated loyalty visit increment upon completed check-out of ${reservation.referenceNumber}`,
      performedBy: payload.staffName || 'System Check-out',
      timestamp: new Date().toISOString(),
    })

    await saveDb(data)
    return { reservation, wristband }
  },

  async updateWristbandStatus(
    uid: string,
    status: 'AVAILABLE' | 'ACTIVE' | 'DEACTIVATED' | 'LOST' | 'DAMAGED',
    reason?: string,
    staffName?: string
  ): Promise<Wristband> {
    const data = ensureDbFile()
    const cleanUid = uid.trim().toUpperCase()
    const wristband = data.wristbands.find((w) => w.uid.toUpperCase() === cleanUid)
    if (!wristband) {
      throw new Error(`Wristband UID ${cleanUid} not found.`)
    }

    const prevStatus = wristband.status
    wristband.status = status
    if (status === 'AVAILABLE') {
      wristband.currentReservationId = undefined
    }

    const actionMap: Record<string, any> = {
      DEACTIVATED: 'DEACTIVATE',
      LOST: 'FLAG_LOST',
      DAMAGED: 'FLAG_DAMAGED',
      AVAILABLE: 'REASSIGN',
      ACTIVE: 'ASSIGN',
    }

    data.wristbandLogs.unshift({
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      wristbandId: wristband.id,
      wristbandUid: wristband.uid,
      action: actionMap[status] || 'DEACTIVATE',
      staffName: staffName || 'Staff',
      timestamp: new Date().toISOString(),
      details: `Status changed from ${prevStatus} to ${status}. ${reason ? `Reason: ${reason}` : ''}`,
    })

    await saveDb(data)
    return wristband
  },

  async getWristbandLogs(): Promise<WristbandLog[]> {
    const data = ensureDbFile()
    return data.wristbandLogs
  },

  // LOYALTY & DISCOUNTS
  async getLoyaltySettings(): Promise<LoyaltySettings> {
    const data = ensureDbFile()
    return data.loyaltySettings
  },

  async updateLoyaltySettings(
    newTiers: LoyaltyTierConfig[],
    staffName?: string
  ): Promise<LoyaltySettings> {
    const data = ensureDbFile()
    data.loyaltySettings = {
      tiers: newTiers,
      updatedAt: new Date().toISOString(),
      updatedBy: staffName,
    }
    await saveDb(data)
    return data.loyaltySettings
  },

  async getGuestLoyalty(
    phone: string,
    email?: string
  ): Promise<{
    completedVisits: number
    tier: LoyaltyTierConfig
    allTiers: LoyaltyTierConfig[]
    nextTier?: LoyaltyTierConfig
    visitsUntilNextTier?: number
  }> {
    const data = ensureDbFile()
    const cleanPhone = phone.trim()
    const cleanEmail = email ? email.trim().toLowerCase() : ''

    // Count COMPLETED reservations
    const completedReservations = data.reservations.filter((r) => {
      if (r.status !== 'COMPLETED') return false
      const matchPhone = cleanPhone && r.guestPhone.includes(cleanPhone)
      const matchEmail = cleanEmail && r.guestEmail.toLowerCase() === cleanEmail
      return matchPhone || matchEmail
    })

    // Manual audit adjustment offset if any
    const manualAdjustments = data.loyaltyAuditLogs.filter(
      (a) => a.guestPhone === cleanPhone && a.reason.includes('Manual adjustment')
    )
    const manualPoints = manualAdjustments.length > 0 ? manualAdjustments[0].newCompletedVisits - manualAdjustments[0].previousCompletedVisits : 0

    const totalCompleted = Math.max(0, completedReservations.length + manualPoints)

    const tiers = [...data.loyaltySettings.tiers].sort(
      (a, b) => b.minCompletedVisits - a.minCompletedVisits
    )

    let currentTier = tiers[tiers.length - 1] // lowest tier default
    for (const t of tiers) {
      if (totalCompleted >= t.minCompletedVisits) {
        currentTier = t
        break
      }
    }

    // Determine next tier
    const ascendingTiers = [...data.loyaltySettings.tiers].sort(
      (a, b) => a.minCompletedVisits - b.minCompletedVisits
    )
    const currentIndex = ascendingTiers.findIndex((t) => t.tier === currentTier.tier)
    const nextTier = ascendingTiers[currentIndex + 1]
    const visitsUntilNextTier = nextTier
      ? Math.max(0, nextTier.minCompletedVisits - totalCompleted)
      : undefined

    return {
      completedVisits: totalCompleted,
      tier: currentTier,
      allTiers: ascendingTiers,
      nextTier,
      visitsUntilNextTier,
    }
  },

  async adjustGuestLoyalty(payload: {
    guestPhone: string
    guestName: string
    newCompletedVisits: number
    reason: string
    performedBy: string
  }): Promise<LoyaltyAuditLog> {
    const data = ensureDbFile()
    const current = await this.getGuestLoyalty(payload.guestPhone)
    const log: LoyaltyAuditLog = {
      id: `aud_${Date.now()}`,
      guestPhone: payload.guestPhone,
      guestName: payload.guestName,
      previousCompletedVisits: current.completedVisits,
      newCompletedVisits: payload.newCompletedVisits,
      reason: `Manual adjustment: ${payload.reason}`,
      performedBy: payload.performedBy,
      timestamp: new Date().toISOString(),
    }
    data.loyaltyAuditLogs.unshift(log)
    await saveDb(data)
    return log
  },

  async getLoyaltyAuditLogs(): Promise<LoyaltyAuditLog[]> {
    const data = ensureDbFile()
    return data.loyaltyAuditLogs
  },

  // PAYMENTS
  async getPayments(): Promise<Payment[]> {
    const data = ensureDbFile()
    return data.payments.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
  },

  async recordPayment(payload: {
    reservationId: string
    amount: number
    paymentMethod: Payment['paymentMethod']
    paymentType: Payment['paymentType']
    transactionRef?: string
    notes?: string
    recordedBy: string
  }): Promise<{ payment: Payment; reservation: Reservation }> {
    const data = ensureDbFile()
    const reservation = data.reservations.find((r) => r.id === payload.reservationId)
    if (!reservation) {
      throw new Error('Reservation not found.')
    }

    const payment: Payment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      reservationId: reservation.id,
      referenceNumber: reservation.referenceNumber,
      guestName: reservation.guestName,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
      paymentType: payload.paymentType,
      status: 'COMPLETED',
      transactionRef:
        payload.transactionRef || `TXN-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
      notes: payload.notes,
      recordedBy: payload.recordedBy,
      createdAt: new Date().toISOString(),
    }

    data.payments.unshift(payment)

    // Update reservation balance
    reservation.amountPaid = (reservation.amountPaid || 0) + payload.amount
    reservation.balanceDue = Math.max(0, reservation.totalAmount - reservation.amountPaid)
    reservation.updatedAt = new Date().toISOString()

    // If fully paid or deposit paid, confirm if still pending
    if (reservation.status === 'PENDING' && reservation.amountPaid > 0) {
      reservation.status = 'CONFIRMED'
    }

    await saveDb(data)
    return { payment, reservation }
  },
}
