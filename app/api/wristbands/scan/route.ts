import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { getCurrentUser, hasRole } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!hasRole(user, ['ADMIN', 'RECEPTIONIST', 'CASHIER'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { uid } = await req.json()
    if (!uid) {
      return NextResponse.json({ error: 'NFC UID is required' }, { status: 400 })
    }

    const cleanUid = uid.trim().toUpperCase()
    const wristband = await db.getWristbandByUid(cleanUid)

    if (!wristband) {
      return NextResponse.json({
        found: false,
        registered: false,
        uid: cleanUid,
        message: 'Wristband is not yet registered in the system.',
      })
    }

    // Update lastScannedAt
    wristband.lastScannedAt = new Date().toISOString()
    const allWristbands = await db.getWristbands()
    const idx = allWristbands.findIndex((w) => w.uid.toUpperCase() === cleanUid)
    if (idx >= 0) {
      allWristbands[idx].lastScannedAt = wristband.lastScannedAt
    }

    // Look up active reservation
    let activeReservation = null
    if (wristband.currentReservationId) {
      activeReservation = await db.getReservationById(wristband.currentReservationId)
    }

    // If no currentReservationId on wristband, search if any active reservation is linked to this wristband UID
    if (!activeReservation) {
      const allRes = await db.getReservations()
      activeReservation = allRes.find(
        (r) =>
          r.assignedWristbandUid?.toUpperCase() === cleanUid &&
          (r.status === 'CONFIRMED' || r.status === 'CHECKED_IN')
      ) || null
    }

    // Get guest loyalty info if guest identified
    let guestLoyalty = null
    if (activeReservation) {
      guestLoyalty = await db.getGuestLoyalty(
        activeReservation.guestPhone,
        activeReservation.guestEmail
      )
    } else if (wristband.currentGuestName) {
      // Look up past reservations by guest name
      const allRes = await db.getReservations()
      const past = allRes.find((r) => r.guestName.toLowerCase() === wristband.currentGuestName?.toLowerCase())
      if (past) {
        guestLoyalty = await db.getGuestLoyalty(past.guestPhone, past.guestEmail)
      }
    }

    return NextResponse.json({
      found: true,
      registered: true,
      wristband,
      activeReservation,
      guestLoyalty,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
