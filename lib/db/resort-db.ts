import fs from 'fs'
import path from 'path'
import {
  Profile,
  Guest,
  Reservation,
  Wristband,
  GuestAccessLog,
  AuditLog,
  ResortSettings,
  DashboardMetrics,
  VerificationMethod,
  ActionType,
} from '@/lib/types'

const DB_DIR = path.join(process.cwd(), 'data')
const DB_FILE = path.join(DB_DIR, 'resort_database.json')

export interface ResortDatabaseSchema {
  profiles: Profile[]
  guests: Guest[]
  reservations: Reservation[]
  wristbands: Wristband[]
  accessLogs: GuestAccessLog[]
  auditLogs: AuditLog[]
  settings: ResortSettings
}

function getInitialResortSeed(): ResortDatabaseSchema {
  const today = new Date().toISOString().split('T')[0]
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]
  const in3Days = new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const threeDaysAgo = new Date(Date.now() - 86400000 * 3).toISOString().split('T')[0]

  return {
    settings: {
      id: 'resort_config',
      resort_name: 'Rora Haven Resort & Spa',
      timezone: 'Asia/Manila',
      default_check_in_time: '14:00',
      default_check_out_time: '12:00',
      require_deposit: true,
      nfc_encryption_enabled: true,
      max_resort_capacity: 350,
      contact_email: 'frontdesk@roraresort.ph',
      contact_phone: '+63 917 888 7672',
      updated_at: new Date().toISOString(),
    },
    profiles: [
      {
        id: 'usr_admin_01',
        email: 'admin@roraresort.ph',
        full_name: 'Elena Rostova',
        role: 'admin',
        phone: '+63 917 111 0001',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        is_active: true,
        created_at: '2026-01-01T08:00:00Z',
        updated_at: '2026-01-01T08:00:00Z',
      },
      {
        id: 'usr_rec_01',
        email: 'receptionist@roraresort.ph',
        full_name: 'Marco Valerio',
        role: 'receptionist',
        phone: '+63 917 222 0002',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        is_active: true,
        created_at: '2026-01-05T08:00:00Z',
        updated_at: '2026-01-05T08:00:00Z',
      },
      {
        id: 'usr_mgmt_01',
        email: 'management@roraresort.ph',
        full_name: 'Sofia Alcantara',
        role: 'management',
        phone: '+63 917 333 0003',
        avatar_url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
        is_active: true,
        created_at: '2026-01-10T08:00:00Z',
        updated_at: '2026-01-10T08:00:00Z',
      },
    ],
    guests: [
      {
        id: 'gst_vip_01',
        full_name: 'Alexander Vance',
        email: 'alexander.vance@solaris.io',
        phone: '+63 917 999 1234',
        address: 'Makati City, Metro Manila',
        category: 'VIP',
        notes: 'VIP Founder guest. Prefers high-floor garden villa. Complimentary champagne.',
        registration_date: '2026-01-10T09:00:00Z',
        created_at: '2026-01-10T09:00:00Z',
        updated_at: '2026-01-10T09:00:00Z',
      },
      {
        id: 'gst_reg_02',
        full_name: 'Camila Rodriguez',
        email: 'camila.r@outlook.com',
        phone: '+63 918 888 2345',
        address: 'BGC, Taguig City',
        category: 'Regular',
        notes: 'Anniversary getaway. Requested early check-in if possible.',
        registration_date: '2026-01-15T10:30:00Z',
        created_at: '2026-01-15T10:30:00Z',
        updated_at: '2026-01-15T10:30:00Z',
      },
      {
        id: 'gst_day_03',
        full_name: 'David Benjamin',
        email: 'dbenjamin@innovate.co',
        phone: '+63 920 777 3456',
        address: 'Angeles City, Pampanga',
        category: 'Day Guest',
        notes: 'Day pass access to lagoon pool and seaside cabana #4.',
        registration_date: '2026-02-01T08:15:00Z',
        created_at: '2026-02-01T08:15:00Z',
        updated_at: '2026-02-01T08:15:00Z',
      },
      {
        id: 'gst_ovn_04',
        full_name: 'Isabella Soriano',
        email: 'isabella.soriano@gmail.com',
        phone: '+63 917 666 4567',
        address: 'Quezon City, Metro Manila',
        category: 'Overnight Guest',
        notes: 'Family trip with 2 kids. Extra towels and cot provided.',
        registration_date: '2026-02-05T14:20:00Z',
        created_at: '2026-02-05T14:20:00Z',
        updated_at: '2026-02-05T14:20:00Z',
      },
      {
        id: 'gst_vip_05',
        full_name: 'Dr. Julian Morales',
        email: 'jmorales@cardio.med',
        phone: '+63 919 555 5678',
        address: 'Cebu City, Central Visayas',
        category: 'VIP',
        notes: 'Repeat VIP guest. Frequent wellness spa patron.',
        registration_date: '2026-02-10T11:00:00Z',
        created_at: '2026-02-10T11:00:00Z',
        updated_at: '2026-02-10T11:00:00Z',
      },
    ],
    wristbands: [
      {
        id: 'wb_801',
        wristband_code: 'WB-801',
        nfc_token: 'nfc_tok_a1b2c3d4e5f601',
        status: 'Assigned',
        condition: 'Good',
        assigned_guest_id: 'gst_vip_01',
        assigned_reservation_id: 'res_2026_01',
        assigned_at: new Date(Date.now() - 7200000).toISOString(),
        last_scanned_at: new Date(Date.now() - 7200000).toISOString(),
        notes: 'Assigned to Alexander Vance (VIP)',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'wb_802',
        wristband_code: 'WB-802',
        nfc_token: 'nfc_tok_f7e8d9c0b1a202',
        status: 'Assigned',
        condition: 'Good',
        assigned_guest_id: 'gst_reg_02',
        assigned_reservation_id: 'res_2026_02',
        assigned_at: new Date(Date.now() - 86400000).toISOString(),
        last_scanned_at: undefined,
        notes: 'Assigned to Camila Rodriguez',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'wb_803',
        wristband_code: 'WB-803',
        nfc_token: 'nfc_tok_3c4d5e6f7a8b03',
        status: 'Available',
        condition: 'Good',
        notes: 'Ready for incoming arrivals',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'wb_804',
        wristband_code: 'WB-804',
        nfc_token: 'nfc_tok_9e8d7c6b5a4f04',
        status: 'Available',
        condition: 'Good',
        notes: 'Ready for incoming arrivals',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'wb_805',
        wristband_code: 'WB-805',
        nfc_token: 'nfc_tok_11223344556605',
        status: 'Available',
        condition: 'Good',
        notes: 'Sanitized in charging dock',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'wb_806',
        wristband_code: 'WB-806',
        nfc_token: 'nfc_tok_778899aabbcc06',
        status: 'Disabled',
        condition: 'Damaged',
        notes: 'Disabled due to chipped casing and antenna defect',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'wb_807',
        wristband_code: 'WB-807',
        nfc_token: 'nfc_tok_ddeeff00112207',
        status: 'Lost',
        condition: 'Good',
        notes: 'Reported lost by guest at pool bar; deactivated',
        created_at: '2026-01-01T00:00:00Z',
        updated_at: new Date().toISOString(),
      },
    ],
    reservations: [
      {
        id: 'res_2026_01',
        reference_number: 'RR-84910',
        guest_id: 'gst_vip_01',
        check_in_date: today,
        check_out_date: in3Days,
        room_or_accommodation: 'Royal Palm Villa 101',
        accommodation_type: 'VILLA',
        adults_count: 2,
        children_count: 0,
        status: 'Checked In',
        payment_status: 'Paid',
        total_amount: 28500,
        amount_paid: 28500,
        special_requests: 'Ocean view, late checkout, champagne on arrival',
        assigned_wristband_id: 'wb_801',
        actual_check_in_time: new Date(Date.now() - 7200000).toISOString(),
        checked_in_by: 'Marco Valerio',
        created_at: '2026-02-10T12:00:00Z',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'res_2026_02',
        reference_number: 'RR-84911',
        guest_id: 'gst_reg_02',
        check_in_date: today,
        check_out_date: tomorrow,
        room_or_accommodation: 'Seaside Horizon Suite 204',
        accommodation_type: 'ROOM',
        adults_count: 2,
        children_count: 0,
        status: 'Confirmed',
        payment_status: 'Paid',
        total_amount: 14200,
        amount_paid: 14200,
        special_requests: 'King size bed, non-smoking floor',
        assigned_wristband_id: 'wb_802',
        created_at: '2026-02-12T14:30:00Z',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'res_2026_03',
        reference_number: 'RR-84912',
        guest_id: 'gst_day_03',
        check_in_date: today,
        check_out_date: today,
        room_or_accommodation: 'Cabana Azure 04',
        accommodation_type: 'CABANA',
        adults_count: 1,
        children_count: 0,
        status: 'Confirmed',
        payment_status: 'Paid',
        total_amount: 3500,
        amount_paid: 3500,
        special_requests: 'All-day lagoon pool towel and cocktail service',
        created_at: '2026-02-14T09:00:00Z',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'res_2026_04',
        reference_number: 'RR-84913',
        guest_id: 'gst_ovn_04',
        check_in_date: yesterday,
        check_out_date: today,
        room_or_accommodation: 'Family Bungalow 302',
        accommodation_type: 'COTTAGE',
        adults_count: 2,
        children_count: 2,
        status: 'Checked In',
        payment_status: 'Paid',
        total_amount: 19800,
        amount_paid: 19800,
        special_requests: 'Crib request for toddler, poolside location',
        actual_check_in_time: new Date(Date.now() - 79200000).toISOString(),
        checked_in_by: 'Marco Valerio',
        created_at: '2026-02-08T10:00:00Z',
        updated_at: new Date().toISOString(),
      },
      {
        id: 'res_2026_05',
        reference_number: 'RR-84914',
        guest_id: 'gst_vip_05',
        check_in_date: threeDaysAgo,
        check_out_date: yesterday,
        room_or_accommodation: 'Presidential Lotus Suite',
        accommodation_type: 'VILLA',
        adults_count: 2,
        children_count: 0,
        status: 'Checked Out',
        payment_status: 'Paid',
        total_amount: 34000,
        amount_paid: 34000,
        special_requests: 'Private butler, airport transfer',
        actual_check_in_time: new Date(Date.now() - 86400000 * 3).toISOString(),
        actual_check_out_time: new Date(Date.now() - 86400000).toISOString(),
        checked_in_by: 'Elena Rostova',
        checked_out_by: 'Marco Valerio',
        created_at: '2026-02-01T08:00:00Z',
        updated_at: new Date().toISOString(),
      },
    ],
    accessLogs: [
      {
        id: 'log_seed_01',
        guest_id: 'gst_vip_01',
        reservation_id: 'res_2026_01',
        wristband_id: 'wb_801',
        action_type: 'Wristband Assigned',
        verification_method: 'NFC',
        timestamp: new Date(Date.now() - 7500000).toISOString(),
        receptionist_id: 'usr_rec_01',
        receptionist_name: 'Marco Valerio',
        notes: 'Initial wristband pairing at welcome desk',
        created_at: new Date(Date.now() - 7500000).toISOString(),
      },
      {
        id: 'log_seed_02',
        guest_id: 'gst_vip_01',
        reservation_id: 'res_2026_01',
        wristband_id: 'wb_801',
        action_type: 'Check In',
        verification_method: 'NFC',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        receptionist_id: 'usr_rec_01',
        receptionist_name: 'Marco Valerio',
        notes: 'NFC scan check-in verified. Welcome drink served.',
        created_at: new Date(Date.now() - 7200000).toISOString(),
      },
      {
        id: 'log_seed_03',
        guest_id: 'gst_ovn_04',
        reservation_id: 'res_2026_04',
        action_type: 'Check In',
        verification_method: 'QR_CODE',
        timestamp: new Date(Date.now() - 79200000).toISOString(),
        receptionist_id: 'usr_rec_01',
        receptionist_name: 'Marco Valerio',
        notes: 'Checked in via confirmation voucher QR code',
        created_at: new Date(Date.now() - 79200000).toISOString(),
      },
    ],
    auditLogs: [
      {
        id: 'aud_seed_01',
        staff_id: 'usr_admin_01',
        staff_name: 'Elena Rostova',
        action: 'System Initialized',
        entity_type: 'system',
        entity_id: 'resort_config',
        details: { version: '2.0-NFC-Production' },
        created_at: '2026-01-01T08:00:00Z',
      },
    ],
  }
}

// In-memory Mutex lock queue for atomic operations to prevent double check-ins and race conditions
let writeLock = Promise.resolve()

function ensureResortDb(): ResortDatabaseSchema {
  if (!fs.existsSync(DB_DIR)) {
    fs.mkdirSync(DB_DIR, { recursive: true })
  }

  if (!fs.existsSync(DB_FILE)) {
    const seed = getInitialResortSeed()
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8')
    return seed
  }

  try {
    const raw = fs.readFileSync(DB_FILE, 'utf-8')
    return JSON.parse(raw) as ResortDatabaseSchema
  } catch (err) {
    console.error('Error reading resort DB, re-seeding:', err)
    const seed = getInitialResortSeed()
    fs.writeFileSync(DB_FILE, JSON.stringify(seed, null, 2), 'utf-8')
    return seed
  }
}

async function saveResortDb(data: ResortDatabaseSchema): Promise<void> {
  const tmpFile = `${DB_FILE}.tmp.${Date.now()}`
  await fs.promises.writeFile(tmpFile, JSON.stringify(data, null, 2), 'utf-8')
  await fs.promises.rename(tmpFile, DB_FILE)
}

function runWithMutex<T>(operation: () => Promise<T>): Promise<T> {
  const nextLock = writeLock.then(async () => {
    return operation()
  })
  writeLock = nextLock.then(() => {}, () => {})
  return nextLock
}

export const resortDb = {
  // SETTINGS
  async getSettings(): Promise<ResortSettings> {
    const data = ensureResortDb()
    return data.settings
  },

  async updateSettings(settings: Partial<ResortSettings>): Promise<ResortSettings> {
    return runWithMutex(async () => {
      const data = ensureResortDb()
      data.settings = {
        ...data.settings,
        ...settings,
        updated_at: new Date().toISOString(),
      }
      await saveResortDb(data)
      return data.settings
    })
  },

  // PROFILES
  async getProfiles(): Promise<Profile[]> {
    const data = ensureResortDb()
    return data.profiles
  },

  async getProfileById(id: string): Promise<Profile | undefined> {
    const data = ensureResortDb()
    return data.profiles.find((p) => p.id === id)
  },

  async getProfileByEmail(email: string): Promise<Profile | undefined> {
    const data = ensureResortDb()
    return data.profiles.find((p) => p.email.toLowerCase() === email.toLowerCase().trim())
  },

  async saveProfile(profile: Partial<Profile> & { email: string; full_name: string; role: any }): Promise<Profile> {
    return runWithMutex(async () => {
      const data = ensureResortDb()
      const now = new Date().toISOString()
      const existingIndex = data.profiles.findIndex((p) => p.id === profile.id || p.email.toLowerCase() === profile.email.toLowerCase())
      
      let saved: Profile
      if (existingIndex >= 0) {
        saved = {
          ...data.profiles[existingIndex],
          ...profile,
          updated_at: now,
        }
        data.profiles[existingIndex] = saved
      } else {
        saved = {
          id: profile.id || `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          email: profile.email,
          full_name: profile.full_name,
          role: profile.role || 'receptionist',
          phone: profile.phone || '',
          avatar_url: profile.avatar_url || '',
          is_active: profile.is_active ?? true,
          created_at: now,
          updated_at: now,
        }
        data.profiles.push(saved)
      }
      await saveResortDb(data)
      return saved
    })
  },

  // GUESTS
  async getGuests(): Promise<Guest[]> {
    const data = ensureResortDb()
    return data.guests
  },

  async getGuestById(id: string): Promise<Guest | undefined> {
    const data = ensureResortDb()
    return data.guests.find((g) => g.id === id)
  },

  async searchGuests(query: string): Promise<Guest[]> {
    const data = ensureResortDb()
    const q = query.toLowerCase().trim()
    if (!q) return data.guests
    return data.guests.filter((g) =>
      g.full_name.toLowerCase().includes(q) ||
      g.email.toLowerCase().includes(q) ||
      g.phone.toLowerCase().includes(q)
    )
  },

  async saveGuest(guest: Partial<Guest> & { full_name: string; email: string; phone: string }): Promise<Guest> {
    return runWithMutex(async () => {
      const data = ensureResortDb()
      const now = new Date().toISOString()
      const existingIndex = data.guests.findIndex((g) => g.id === guest.id)

      let saved: Guest
      if (existingIndex >= 0) {
        saved = {
          ...data.guests[existingIndex],
          ...guest,
          updated_at: now,
        }
        data.guests[existingIndex] = saved
      } else {
        saved = {
          id: guest.id || `gst_${Math.random().toString(36).substring(2, 10)}`,
          full_name: guest.full_name,
          email: guest.email,
          phone: guest.phone,
          address: guest.address || '',
          category: guest.category || 'Regular',
          notes: guest.notes || '',
          registration_date: guest.registration_date || now,
          created_at: now,
          updated_at: now,
        }
        data.guests.push(saved)
      }
      await saveResortDb(data)
      return saved
    })
  },

  // RESERVATIONS
  async getReservations(): Promise<Reservation[]> {
    const data = ensureResortDb()
    // Join guests and wristbands
    return data.reservations.map((r) => {
      const guest = data.guests.find((g) => g.id === r.guest_id)
      const wristband = r.assigned_wristband_id
        ? data.wristbands.find((w) => w.id === r.assigned_wristband_id)
        : undefined
      return {
        ...r,
        guest,
        wristband,
      }
    })
  },

  async getReservationById(id: string): Promise<Reservation | undefined> {
    const list = await this.getReservations()
    return list.find((r) => r.id === id)
  },

  async getReservationByRef(ref: string): Promise<Reservation | undefined> {
    const list = await this.getReservations()
    return list.find((r) => r.reference_number.toLowerCase().trim() === ref.toLowerCase().trim())
  },

  async saveReservation(res: Partial<Reservation> & { guest_id: string; check_in_date: string; check_out_date: string; room_or_accommodation: string }): Promise<Reservation> {
    return runWithMutex(async () => {
      const data = ensureResortDb()
      const now = new Date().toISOString()
      const existingIndex = data.reservations.findIndex((r) => r.id === res.id)

      let saved: Reservation
      if (existingIndex >= 0) {
        saved = {
          ...data.reservations[existingIndex],
          ...res,
          updated_at: now,
        }
        data.reservations[existingIndex] = saved
      } else {
        const refCount = data.reservations.length + 10
        saved = {
          id: res.id || `res_${Math.random().toString(36).substring(2, 10)}`,
          reference_number: res.reference_number || `RR-${84900 + refCount}`,
          guest_id: res.guest_id,
          check_in_date: res.check_in_date,
          check_out_date: res.check_out_date,
          room_or_accommodation: res.room_or_accommodation,
          accommodation_type: res.accommodation_type || 'VILLA',
          adults_count: res.adults_count ?? 2,
          children_count: res.children_count ?? 0,
          status: res.status || 'Confirmed',
          payment_status: res.payment_status || 'Paid',
          total_amount: res.total_amount ?? 0,
          amount_paid: res.amount_paid ?? 0,
          special_requests: res.special_requests || '',
          assigned_wristband_id: res.assigned_wristband_id,
          created_at: now,
          updated_at: now,
        }
        data.reservations.push(saved)
      }
      await saveResortDb(data)
      return saved
    })
  },

  // WRISTBANDS
  async getWristbands(): Promise<Wristband[]> {
    const data = ensureResortDb()
    return data.wristbands.map((w) => {
      const guest = w.assigned_guest_id ? data.guests.find((g) => g.id === w.assigned_guest_id) : undefined
      const reservation = w.assigned_reservation_id
        ? data.reservations.find((r) => r.id === w.assigned_reservation_id)
        : undefined
      return {
        ...w,
        guest,
        reservation,
      }
    })
  },

  async getWristbandById(id: string): Promise<Wristband | undefined> {
    const list = await this.getWristbands()
    return list.find((w) => w.id === id)
  },

  async getWristbandByToken(token: string): Promise<Wristband | undefined> {
    const list = await this.getWristbands()
    return list.find((w) => w.nfc_token.trim() === token.trim())
  },

  async getWristbandByCode(code: string): Promise<Wristband | undefined> {
    const list = await this.getWristbands()
    return list.find((w) => w.wristband_code.toLowerCase().trim() === code.toLowerCase().trim())
  },

  async saveWristband(wristband: Partial<Wristband> & { wristband_code: string; nfc_token: string }): Promise<Wristband> {
    return runWithMutex(async () => {
      const data = ensureResortDb()
      const now = new Date().toISOString()
      const existingIndex = data.wristbands.findIndex((w) => w.id === wristband.id || w.wristband_code === wristband.wristband_code)

      let saved: Wristband
      if (existingIndex >= 0) {
        saved = {
          ...data.wristbands[existingIndex],
          ...wristband,
          updated_at: now,
        }
        data.wristbands[existingIndex] = saved
      } else {
        saved = {
          id: wristband.id || `wb_${Math.random().toString(36).substring(2, 10)}`,
          wristband_code: wristband.wristband_code,
          nfc_token: wristband.nfc_token,
          status: wristband.status || 'Available',
          condition: wristband.condition || 'Good',
          assigned_guest_id: wristband.assigned_guest_id,
          assigned_reservation_id: wristband.assigned_reservation_id,
          assigned_at: wristband.assigned_at,
          last_scanned_at: wristband.last_scanned_at,
          notes: wristband.notes || '',
          created_at: now,
          updated_at: now,
        }
        data.wristbands.push(saved)
      }
      await saveResortDb(data)
      return saved
    })
  },

  // ASSIGN WRISTBAND
  async assignWristband(wristbandId: string, guestId: string, reservationId: string, staffName: string): Promise<Wristband> {
    return runWithMutex(async () => {
      const data = ensureResortDb()
      const now = new Date().toISOString()
      const wb = data.wristbands.find((w) => w.id === wristbandId)
      if (!wb) throw new Error('Wristband not found')
      if (wb.status === 'Disabled') throw new Error('Cannot assign a disabled wristband')
      if (wb.status === 'Lost') throw new Error('Cannot assign a lost wristband')

      wb.status = 'Assigned'
      wb.assigned_guest_id = guestId
      wb.assigned_reservation_id = reservationId
      wb.assigned_at = now
      wb.updated_at = now

      // Also link reservation
      const res = data.reservations.find((r) => r.id === reservationId)
      if (res) {
        res.assigned_wristband_id = wb.id
        res.updated_at = now
      }

      // Log activity
      data.accessLogs.unshift({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        guest_id: guestId,
        reservation_id: reservationId,
        wristband_id: wb.id,
        action_type: 'Wristband Assigned',
        verification_method: 'NFC',
        timestamp: now,
        receptionist_id: 'staff',
        receptionist_name: staffName,
        notes: `Wristband ${wb.wristband_code} paired with reservation ${res?.reference_number}`,
        created_at: now,
      })

      await saveResortDb(data)
      return wb
    })
  },

  // REPLACE LOST WRISTBAND (RULE 7 & TEST 5)
  async replaceWristband(oldWristbandId: string, newWristbandId: string, reason: string, staffName: string): Promise<{ oldWristband: Wristband; newWristband: Wristband }> {
    return runWithMutex(async () => {
      const data = ensureResortDb()
      const now = new Date().toISOString()
      const oldWb = data.wristbands.find((w) => w.id === oldWristbandId)
      const newWb = data.wristbands.find((w) => w.id === newWristbandId)

      if (!oldWb) throw new Error('Existing wristband not found')
      if (!newWb) throw new Error('Replacement wristband not found')
      if (newWb.status !== 'Available') throw new Error('Replacement wristband must be Available')

      const guestId = oldWb.assigned_guest_id
      const reservationId = oldWb.assigned_reservation_id

      // 1. Invalidate old wristband
      oldWb.status = 'Lost'
      oldWb.assigned_guest_id = undefined
      oldWb.assigned_reservation_id = undefined
      oldWb.notes = `${oldWb.notes ? oldWb.notes + ' | ' : ''}Replaced due to: ${reason}`
      oldWb.updated_at = now

      // 2. Assign new wristband
      newWb.status = 'Assigned'
      newWb.assigned_guest_id = guestId
      newWb.assigned_reservation_id = reservationId
      newWb.assigned_at = now
      newWb.notes = `Replacement for ${oldWb.wristband_code}`
      newWb.updated_at = now

      // 3. Update reservation
      if (reservationId) {
        const res = data.reservations.find((r) => r.id === reservationId)
        if (res) {
          res.assigned_wristband_id = newWb.id
          res.updated_at = now
        }
      }

      // 4. Log immutable replacement
      if (guestId) {
        data.accessLogs.unshift({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          guest_id: guestId,
          reservation_id: reservationId,
          wristband_id: newWb.id,
          action_type: 'Wristband Replaced',
          verification_method: 'MANUAL',
          timestamp: now,
          receptionist_id: 'staff',
          receptionist_name: staffName,
          notes: `Replaced lost wristband ${oldWb.wristband_code} with ${newWb.wristband_code}. Reason: ${reason}`,
          created_at: now,
        })
      }

      await saveResortDb(data)
      return { oldWristband: oldWb, newWristband: newWb }
    })
  },

  // DISABLE WRISTBAND (RULE 3 & TEST 4)
  async disableWristband(wristbandId: string, reason: string, staffName: string): Promise<Wristband> {
    return runWithMutex(async () => {
      const data = ensureResortDb()
      const now = new Date().toISOString()
      const wb = data.wristbands.find((w) => w.id === wristbandId)
      if (!wb) throw new Error('Wristband not found')

      wb.status = 'Disabled'
      wb.notes = `${wb.notes ? wb.notes + ' | ' : ''}Disabled: ${reason}`
      wb.updated_at = now

      if (wb.assigned_guest_id) {
        data.accessLogs.unshift({
          id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          guest_id: wb.assigned_guest_id,
          reservation_id: wb.assigned_reservation_id,
          wristband_id: wb.id,
          action_type: 'Wristband Disabled',
          verification_method: 'MANUAL',
          timestamp: now,
          receptionist_id: 'staff',
          receptionist_name: staffName,
          notes: `Wristband ${wb.wristband_code} disabled: ${reason}`,
          created_at: now,
        })
      }

      await saveResortDb(data)
      return wb
    })
  },

  // ATOMIC CHECK-IN WITH ROW LOCKING & CONCURRENCY GUARD (TEST 1, 2, 8)
  async confirmCheckInAtomic({
    reservationId,
    wristbandToken,
    staffId,
    staffName,
    verificationMethod = 'NFC',
    notes,
  }: {
    reservationId: string
    wristbandToken?: string
    staffId: string
    staffName: string
    verificationMethod?: VerificationMethod
    notes?: string
  }): Promise<{ success: boolean; code?: string; message: string; reservation?: Reservation; wristband?: Wristband }> {
    return runWithMutex(async () => {
      const data = ensureResortDb()
      const now = new Date().toISOString()

      // 1. Validate reservation
      const res = data.reservations.find((r) => r.id === reservationId)
      if (!res) {
        return { success: false, code: 'RESERVATION_NOT_FOUND', message: 'Reservation not found.' }
      }

      // Check duplicate check-in (TEST 2 & TEST 8)
      if (res.status === 'Checked In') {
        return {
          success: false,
          code: 'ALREADY_CHECKED_IN',
          message: `Guest is already checked in (Checked in at ${res.actual_check_in_time ? new Date(res.actual_check_in_time).toLocaleTimeString() : 'earlier today'}).`,
        }
      }

      if (res.status === 'Checked Out') {
        return { success: false, code: 'ALREADY_CHECKED_OUT', message: 'This reservation is already completed and checked out.' }
      }

      if (res.status === 'Cancelled') {
        return { success: false, code: 'RESERVATION_CANCELLED', message: 'Cannot check in a cancelled reservation.' }
      }

      // 2. Validate wristband if token provided
      let matchedWb: Wristband | undefined
      if (wristbandToken) {
        matchedWb = data.wristbands.find((w) => w.nfc_token.trim() === wristbandToken.trim())
        if (!matchedWb) {
          return { success: false, code: 'UNKNOWN_WRISTBAND', message: 'Scanned NFC wristband token is not recognized.' }
        }

        if (matchedWb.status === 'Disabled') {
          return { success: false, code: 'WRISTBAND_DISABLED', message: 'Wristband is disabled and cannot authorize access.' }
        }

        if (matchedWb.status === 'Lost') {
          return { success: false, code: 'WRISTBAND_LOST', message: 'Wristband was flagged as lost and cannot authorize access.' }
        }

        if (matchedWb.status === 'Retired') {
          return { success: false, code: 'WRISTBAND_RETIRED', message: 'Wristband is retired from service.' }
        }

        // Wristband must either be assigned to this reservation, or available
        if (matchedWb.assigned_reservation_id && matchedWb.assigned_reservation_id !== res.id) {
          return { success: false, code: 'WRISTBAND_ASSIGNED_TO_OTHER', message: 'Wristband is actively assigned to another guest.' }
        }

        // Update wristband
        matchedWb.status = 'Assigned'
        matchedWb.assigned_guest_id = res.guest_id
        matchedWb.assigned_reservation_id = res.id
        matchedWb.last_scanned_at = now
        matchedWb.updated_at = now
      } else if (res.assigned_wristband_id) {
        matchedWb = data.wristbands.find((w) => w.id === res.assigned_wristband_id)
        if (matchedWb) {
          matchedWb.last_scanned_at = now
          matchedWb.updated_at = now
        }
      }

      // 3. Atomically update reservation
      res.status = 'Checked In'
      res.actual_check_in_time = now
      res.checked_in_by = staffName
      if (matchedWb) {
        res.assigned_wristband_id = matchedWb.id
      }
      res.updated_at = now

      // 4. Record immutable Guest Access Log
      const accessLog: GuestAccessLog = {
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        guest_id: res.guest_id,
        reservation_id: res.id,
        wristband_id: matchedWb?.id,
        action_type: 'Check In',
        verification_method: verificationMethod,
        timestamp: now,
        receptionist_id: staffId,
        receptionist_name: staffName,
        notes: notes || `Check-in verified via ${verificationMethod}`,
        created_at: now,
      }
      data.accessLogs.unshift(accessLog)

      await saveResortDb(data)

      const guest = data.guests.find((g) => g.id === res.guest_id)
      return {
        success: true,
        message: 'Guest successfully checked in.',
        reservation: { ...res, guest, wristband: matchedWb },
        wristband: matchedWb,
      }
    })
  },

  // ATOMIC CHECK-OUT (TEST 3)
  async confirmCheckOutAtomic({
    reservationId,
    wristbandToken,
    staffId,
    staffName,
    releaseWristband = true,
    verificationMethod = 'NFC',
    notes,
  }: {
    reservationId: string
    wristbandToken?: string
    staffId: string
    staffName: string
    releaseWristband?: boolean
    verificationMethod?: VerificationMethod
    notes?: string
  }): Promise<{ success: boolean; code?: string; message: string; reservation?: Reservation }> {
    return runWithMutex(async () => {
      const data = ensureResortDb()
      const now = new Date().toISOString()

      const res = data.reservations.find((r) => r.id === reservationId)
      if (!res) {
        return { success: false, code: 'RESERVATION_NOT_FOUND', message: 'Reservation not found.' }
      }

      if (res.status === 'Checked Out') {
        return { success: false, code: 'ALREADY_CHECKED_OUT', message: 'Guest is already checked out.' }
      }

      // Rule 5: Cannot check out before checking in
      if (res.status !== 'Checked In') {
        return {
          success: false,
          code: 'NOT_CHECKED_IN',
          message: 'Guest cannot check out before checking in.',
        }
      }

      // Find associated wristband
      let wb: Wristband | undefined
      if (wristbandToken) {
        wb = data.wristbands.find((w) => w.nfc_token.trim() === wristbandToken.trim())
      } else if (res.assigned_wristband_id) {
        wb = data.wristbands.find((w) => w.id === res.assigned_wristband_id)
      }

      // Rule 6: Checked-out wristband can be released and reused after verification
      if (wb) {
        if (releaseWristband) {
          wb.status = 'Available'
          wb.assigned_guest_id = undefined
          wb.assigned_reservation_id = undefined
          wb.last_scanned_at = now
          wb.notes = `${wb.notes ? wb.notes + ' | ' : ''}Returned at checkout on ${new Date().toLocaleDateString()}`
          wb.updated_at = now
        } else {
          wb.last_scanned_at = now
          wb.updated_at = now
        }
      }

      // Update reservation
      res.status = 'Checked Out'
      res.actual_check_out_time = now
      res.checked_out_by = staffName
      res.updated_at = now

      // Record immutable log
      data.accessLogs.unshift({
        id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        guest_id: res.guest_id,
        reservation_id: res.id,
        wristband_id: wb?.id,
        action_type: 'Check Out',
        verification_method: verificationMethod,
        timestamp: now,
        receptionist_id: staffId,
        receptionist_name: staffName,
        notes: notes || `Check-out confirmed. Wristband ${wb ? (releaseWristband ? 'released for reuse' : 'retained') : 'none'}.`,
        created_at: now,
      })

      await saveResortDb(data)

      const guest = data.guests.find((g) => g.id === res.guest_id)
      return {
        success: true,
        message: 'Guest successfully checked out.',
        reservation: { ...res, guest, wristband: wb },
      }
    })
  },

  // ACCESS LOGS
  async getAccessLogs(): Promise<GuestAccessLog[]> {
    const data = ensureResortDb()
    return data.accessLogs.map((log) => {
      const guest = data.guests.find((g) => g.id === log.guest_id)
      const res = log.reservation_id ? data.reservations.find((r) => r.id === log.reservation_id) : undefined
      const wb = log.wristband_id ? data.wristbands.find((w) => w.id === log.wristband_id) : undefined
      return {
        ...log,
        guest_name: guest?.full_name || 'Unknown Guest',
        reservation_ref: res?.reference_number,
        wristband_code: wb?.wristband_code,
        room_name: res?.room_or_accommodation,
      }
    })
  },

  // AUDIT LOGS
  async getAuditLogs(): Promise<AuditLog[]> {
    const data = ensureResortDb()
    return data.auditLogs
  },

  async logAudit(staffId: string, staffName: string, action: string, entityType: string, entityId: string, details?: any): Promise<void> {
    return runWithMutex(async () => {
      const data = ensureResortDb()
      data.auditLogs.unshift({
        id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        staff_id: staffId,
        staff_name: staffName,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        created_at: new Date().toISOString(),
      })
      await saveResortDb(data)
    })
  },

  // DASHBOARD METRICS
  async getDashboardMetrics(): Promise<DashboardMetrics> {
    const data = ensureResortDb()
    const today = new Date().toISOString().split('T')[0]

    const checkedInGuests = data.reservations.filter((r) => r.status === 'Checked In').length
    const expectedArrivalsToday = data.reservations.filter(
      (r) => r.check_in_date === today && r.status === 'Confirmed'
    ).length
    const expectedDeparturesToday = data.reservations.filter(
      (r) => r.check_out_date === today && r.status === 'Checked In'
    ).length
    const activeReservations = data.reservations.filter(
      (r) => r.status === 'Confirmed' || r.status === 'Checked In'
    ).length
    const checkedOutGuests = data.reservations.filter((r) => r.status === 'Checked Out').length

    const availableWristbands = data.wristbands.filter((w) => w.status === 'Available').length
    const lostOrDisabledWristbands = data.wristbands.filter(
      (w) => w.status === 'Lost' || w.status === 'Disabled'
    ).length

    // Total guests currently inside accounts for adults + children of all Checked In reservations
    const totalGuestsInside = data.reservations
      .filter((r) => r.status === 'Checked In')
      .reduce((sum, r) => sum + (r.adults_count || 1) + (r.children_count || 0), 0)

    return {
      totalGuestsInside,
      expectedArrivalsToday,
      expectedDeparturesToday,
      activeReservations,
      checkedInGuests,
      checkedOutGuests,
      availableWristbands,
      lostOrDisabledWristbands,
    }
  },
}
