export type UserRole = 'ADMIN' | 'RECEPTIONIST' | 'CASHIER' | 'GUEST'

export interface User {
  id: string
  name: string
  email: string
  phone: string
  role: UserRole
  passwordHash: string
  loyaltyTier?: LoyaltyTierName
  createdAt: string
}

export type AccommodationType = 'ROOM' | 'COTTAGE' | 'PACKAGE'

export interface Room {
  id: string
  name: string
  type: AccommodationType
  description: string
  capacity: number
  basePrice: number // Price per night or per day pass in PHP
  seasonalMultiplier: number // e.g. 1.0 = regular, 1.2 = peak season
  amenities: string[]
  photos: string[]
  status: 'AVAILABLE' | 'MAINTENANCE'
  isActive: boolean
}

export type ReservationStatus = 
  | 'PENDING'
  | 'CONFIRMED'
  | 'CHECKED_IN'
  | 'COMPLETED'
  | 'CANCELLED'

export interface Reservation {
  id: string
  referenceNumber: string // e.g. QA-89214
  guestId?: string
  guestName: string
  guestEmail: string
  guestPhone: string
  roomId: string
  roomName: string
  checkInDate: string // YYYY-MM-DD
  checkOutDate: string // YYYY-MM-DD
  guestsCount: number
  status: ReservationStatus
  nights: number
  baseRate: number
  subtotal: number
  loyaltyTierApplied: string
  discountPercentage: number
  discountAmount: number
  totalAmount: number
  amountPaid: number
  balanceDue: number
  assignedWristbandUid?: string
  wristbandId?: string
  notes?: string
  checkedInAt?: string
  checkedOutAt?: string
  createdAt: string
  updatedAt: string
}

export type WristbandStatus = 'AVAILABLE' | 'ACTIVE' | 'DEACTIVATED' | 'LOST' | 'DAMAGED'

export interface Wristband {
  id: string
  uid: string // e.g. 04:A3:8C:F2:10:5B:80
  label: string // e.g. WB-0104
  status: WristbandStatus
  currentGuestId?: string
  currentGuestName?: string
  currentReservationId?: string
  lastAssignedAt?: string
  lastScannedAt?: string
  notes?: string
  createdAt: string
}

export type WristbandAction = 
  | 'REGISTER'
  | 'ASSIGN'
  | 'CHECK_IN'
  | 'CHECK_OUT'
  | 'DEACTIVATE'
  | 'REASSIGN'
  | 'FLAG_LOST'
  | 'FLAG_DAMAGED'

export interface WristbandLog {
  id: string
  wristbandId: string
  wristbandUid: string
  action: WristbandAction
  staffId?: string
  staffName?: string
  guestName?: string
  reservationId?: string
  referenceNumber?: string
  timestamp: string
  details: string
}

export type LoyaltyTierName = 'Standard' | 'Silver' | 'Gold' | 'Platinum'

export interface LoyaltyTierConfig {
  tier: LoyaltyTierName
  minCompletedVisits: number
  discountPercentage: number
  badgeColor: string
  perks: string[]
}

export interface LoyaltySettings {
  tiers: LoyaltyTierConfig[]
  updatedAt: string
  updatedBy?: string
}

export interface LoyaltyAuditLog {
  id: string
  guestPhone: string
  guestName: string
  previousCompletedVisits: number
  newCompletedVisits: number
  reason: string
  performedBy: string
  timestamp: string
}

export type PaymentMethod = 'CASH' | 'GCASH' | 'CARD' | 'BANK_TRANSFER'
export type PaymentType = 'DEPOSIT' | 'BALANCE' | 'FULL_PAYMENT' | 'REFUND'

export interface Payment {
  id: string
  reservationId: string
  referenceNumber: string
  guestName: string
  amount: number
  paymentMethod: PaymentMethod
  paymentType: PaymentType
  status: 'COMPLETED' | 'PENDING'
  transactionRef: string
  notes?: string
  recordedBy: string
  createdAt: string
}

export interface DatabaseSchema {
  users: User[]
  rooms: Room[]
  reservations: Reservation[]
  wristbands: Wristband[]
  wristbandLogs: WristbandLog[]
  loyaltySettings: LoyaltySettings
  loyaltyAuditLogs: LoyaltyAuditLog[]
  payments: Payment[]
}
