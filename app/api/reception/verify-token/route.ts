import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { token, mode = 'CHECK_IN' } = body

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 })
    }

    const cleanToken = token.trim()

    // 1. Try finding wristband by opaque NFC token
    let wristband = await resortDb.getWristbandByToken(cleanToken)

    // Fallback: check if token is wristband_code (e.g. WB-801)
    if (!wristband) {
      wristband = await resortDb.getWristbandByCode(cleanToken)
    }

    // 2. Fallback: check if token is a reservation reference or ID (e.g. from QR code)
    let reservation = null
    if (!wristband) {
      reservation = await resortDb.getReservationByRef(cleanToken)
      if (!reservation) {
        reservation = await resortDb.getReservationById(cleanToken)
      }
      if (reservation && reservation.assigned_wristband_id) {
        wristband = await resortDb.getWristbandById(reservation.assigned_wristband_id)
      }
    } else if (wristband.assigned_reservation_id) {
      reservation = await resortDb.getReservationById(wristband.assigned_reservation_id)
    }

    // If wristband exists:
    if (wristband) {
      // Check wristband status constraints
      if (wristband.status === 'Disabled') {
        return NextResponse.json({
          status: 'WRISTBAND_DISABLED',
          canConfirm: false,
          message: `Wristband ${wristband.wristband_code} is DISABLED (${wristband.notes || 'Compromised or damaged'}). Access is denied.`,
          wristband,
          reservation: reservation || undefined,
          guest: wristband.guest || reservation?.guest,
        })
      }

      if (wristband.status === 'Lost') {
        return NextResponse.json({
          status: 'WRISTBAND_LOST',
          canConfirm: false,
          message: `Wristband ${wristband.wristband_code} was reported LOST. Do not honor access. Issue a replacement.`,
          wristband,
          reservation: reservation || undefined,
          guest: wristband.guest || reservation?.guest,
        })
      }

      if (wristband.status === 'Retired') {
        return NextResponse.json({
          status: 'WRISTBAND_RETIRED',
          canConfirm: false,
          message: `Wristband ${wristband.wristband_code} is RETIRED from resort service.`,
          wristband,
        })
      }

      if (wristband.status === 'Available' && !reservation) {
        return NextResponse.json({
          status: 'WRISTBAND_AVAILABLE_UNASSIGNED',
          canConfirm: false,
          message: `Wristband ${wristband.wristband_code} is currently unassigned and available in inventory. Assign to a reservation before check-in.`,
          wristband,
        })
      }
    }

    // If no wristband and no reservation found
    if (!wristband && !reservation) {
      return NextResponse.json({
        status: 'UNKNOWN_WRISTBAND',
        canConfirm: false,
        message: 'Unrecognized NFC tag or token. This wristband is not registered in the resort system.',
      })
    }

    // If reservation found, check business rules
    if (reservation) {
      const guest = reservation.guest || (await resortDb.getGuestById(reservation.guest_id))

      // Check Cancelled
      if (reservation.status === 'Cancelled') {
        return NextResponse.json({
          status: 'INVALID_RESERVATION',
          canConfirm: false,
          message: 'Reservation has been cancelled. Staff supervisor clearance required.',
          wristband,
          reservation,
          guest,
        })
      }

      // Check-In Mode Rules
      if (mode === 'CHECK_IN') {
        if (reservation.status === 'Checked In') {
          return NextResponse.json({
            status: 'ALREADY_CHECKED_IN',
            canConfirm: false,
            message: `Guest is already checked in (Checked in on ${new Date(reservation.actual_check_in_time || reservation.updated_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} by ${reservation.checked_in_by || 'Front Desk'}).`,
            wristband,
            reservation,
            guest,
          })
        }

        if (reservation.status === 'Checked Out') {
          return NextResponse.json({
            status: 'ALREADY_CHECKED_OUT',
            canConfirm: false,
            message: 'Guest has already completed their stay and checked out for this reservation.',
            wristband,
            reservation,
            guest,
          })
        }

        // Ready for Check-in confirmation!
        return NextResponse.json({
          status: 'GUEST_IDENTIFIED',
          canConfirm: true,
          action: 'CHECK_IN',
          message: 'Guest and reservation verified. Awaiting receptionist confirmation.',
          wristband,
          reservation,
          guest,
        })
      }

      // Check-Out Mode Rules
      if (mode === 'CHECK_OUT') {
        if (reservation.status === 'Checked Out') {
          return NextResponse.json({
            status: 'ALREADY_CHECKED_OUT',
            canConfirm: false,
            message: 'Guest is already checked out.',
            wristband,
            reservation,
            guest,
          })
        }

        if (reservation.status !== 'Checked In') {
          return NextResponse.json({
            status: 'CANNOT_CHECK_OUT_YET',
            canConfirm: false,
            message: 'Guest cannot check out before checking in.',
            wristband,
            reservation,
            guest,
          })
        }

        // Ready for Check-Out confirmation!
        return NextResponse.json({
          status: 'GUEST_IDENTIFIED',
          canConfirm: true,
          action: 'CHECK_OUT',
          message: 'Guest is currently checked in. Ready for checkout confirmation.',
          wristband,
          reservation,
          guest,
        })
      }
    }

    return NextResponse.json({
      status: 'UNKNOWN_STATE',
      canConfirm: false,
      message: 'Unable to verify wristband credentials.',
      wristband,
      reservation,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
