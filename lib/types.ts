export type UserRole = 'admin' | 'receptionist' | 'management'

export interface Profile {
  id: string
  email: string
  full_name: string
  role: UserRole
  phone?: string
  avatar_url?: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export type GuestCategory = 'Regular' | 'VIP' | 'Day Guest' | 'Overnight Guest'

export interface Guest {
  id: string
  full_name: string
  email: string
  phone: string
  address?: string
  category: GuestCategory
  notes?: string
  registration_date: string
  created_at: string
  updated_at: string
}

export type ReservationStatus = 'Pending' | 'Confirmed' | 'Checked In' | 'Checked Out' | 'Cancelled'
export type PaymentStatus = 'Pending' | 'Partial' | 'Paid' | 'Refunded'
export type AccommodationType = 'ROOM' | 'VILLA' | 'COTTAGE' | 'CABANA' | 'PACKAGE'

export interface Reservation {
  id: string
  reference_number: string
  guest_id: string
  check_in_date: string // YYYY-MM-DD
  check_out_date: string // YYYY-MM-DD
  room_or_accommodation: string
  accommodation_type: AccommodationType
  adults_count: number
  children_count: number
  status: ReservationStatus
  payment_status: PaymentStatus
  total_amount: number
  amount_paid: number
  special_requests?: string
  assigned_wristband_id?: string
  actual_check_in_time?: string
  actual_check_out_time?: string
  checked_in_by?: string
  checked_out_by?: string
  created_at: string
  updated_at: string
  // Joins
  guest?: Guest
  wristband?: Wristband
}

export type WristbandStatus = 'Available' | 'Assigned' | 'Lost' | 'Disabled' | 'Retired'
export type WristbandCondition = 'Good' | 'Fair' | 'Damaged'

export interface Wristband {
  id: string
  wristband_code: string // Human-readable e.g. WB-801
  nfc_token: string // Secure opaque random token e.g. nfc_tok_a1b2c3d4e5f6
  status: WristbandStatus
  condition: WristbandCondition
  assigned_guest_id?: string
  assigned_reservation_id?: string
  assigned_at?: string
  last_scanned_at?: string
  notes?: string
  created_at: string
  updated_at: string
  // Joins
  guest?: Guest
  reservation?: Reservation
}

export type ActionType =
  | 'Check In'
  | 'Check Out'
  | 'Wristband Assigned'
  | 'Wristband Replaced'
  | 'Wristband Disabled'
  | 'Manual Verification'

export type VerificationMethod = 'NFC' | 'QR_CODE' | 'MANUAL'

export interface GuestAccessLog {
  id: string
  guest_id: string
  reservation_id?: string
  wristband_id?: string
  action_type: ActionType
  verification_method: VerificationMethod
  timestamp: string
  receptionist_id: string
  receptionist_name: string
  notes?: string
  created_at: string
  // Joins
  guest_name?: string
  reservation_ref?: string
  wristband_code?: string
  room_name?: string
}

export interface AuditLog {
  id: string
  staff_id: string
  staff_name: string
  action: string
  entity_type: string
  entity_id: string
  details?: any
  ip_address?: string
  created_at: string
}

export interface ResortSettings {
  id: string
  resort_name: string
  timezone: string
  default_check_in_time: string
  default_check_out_time: string
  require_deposit: boolean
  nfc_encryption_enabled: boolean
  max_resort_capacity: number
  contact_email: string
  contact_phone: string
  updated_at: string
}

export interface DashboardMetrics {
  totalGuestsInside: number
  expectedArrivalsToday: number
  expectedDeparturesToday: number
  activeReservations: number
  checkedInGuests: number
  checkedOutGuests: number
  availableWristbands: number
  lostOrDisabledWristbands: number
}
