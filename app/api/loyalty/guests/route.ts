import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { getCurrentUser, hasRole } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!hasRole(user, ['ADMIN', 'RECEPTIONIST'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const reservations = await db.getReservations()
    const wristbands = await db.getWristbands()
    const auditLogs = await db.getLoyaltyAuditLogs()

    // Aggregate guests by phone number
    const guestsMap = new Map<string, any>()

    for (const res of reservations) {
      const key = res.guestPhone.trim()
      if (!guestsMap.has(key)) {
        guestsMap.set(key, {
          phone: res.guestPhone,
          name: res.guestName,
          email: res.guestEmail,
          totalBookings: 0,
          completedBookings: 0,
          totalSpent: 0,
          reservations: [],
          activeWristband: null,
          lastVisitDate: null,
        })
      }

      const guest = guestsMap.get(key)
      guest.totalBookings += 1
      if (res.status === 'COMPLETED') {
        guest.completedBookings += 1
        guest.totalSpent += res.totalAmount
        if (!guest.lastVisitDate || new Date(res.checkOutDate) > new Date(guest.lastVisitDate)) {
          guest.lastVisitDate = res.checkOutDate
        }
      }
      guest.reservations.push({
        id: res.id,
        referenceNumber: res.referenceNumber,
        roomName: res.roomName,
        checkInDate: res.checkInDate,
        checkOutDate: res.checkOutDate,
        status: res.status,
        totalAmount: res.totalAmount,
      })
    }

    // Attach current active wristbands and loyalty tiers
    const guestList = await Promise.all(
      Array.from(guestsMap.values()).map(async (guest) => {
        const loyalty = await db.getGuestLoyalty(guest.phone, guest.email)
        const wb = wristbands.find(
          (w) =>
            w.currentGuestName?.toLowerCase() === guest.name.toLowerCase() ||
            guest.reservations.some((r: any) => r.id === w.currentReservationId)
        )

        return {
          ...guest,
          loyaltyTier: loyalty.tier,
          effectiveCompletedVisits: loyalty.completedVisits,
          nextTier: loyalty.nextTier,
          visitsUntilNextTier: loyalty.visitsUntilNextTier,
          assignedWristband: wb
            ? { uid: wb.uid, label: wb.label, status: wb.status }
            : null,
        }
      })
    )

    return NextResponse.json({ guests: guestList, auditLogs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
