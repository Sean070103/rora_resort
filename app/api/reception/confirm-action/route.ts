import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const staffId = user?.id || 'usr_rec_01'
    const staffName = user?.full_name || 'Front Desk Staff'

    const body = await req.json()
    const {
      action,
      reservationId,
      wristbandToken,
      releaseWristband = true,
      verificationMethod = 'NFC',
      notes,
    } = body

    if (!reservationId) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 })
    }

    if (action === 'CHECK_IN') {
      const result = await resortDb.confirmCheckInAtomic({
        reservationId,
        wristbandToken,
        staffId,
        staffName,
        verificationMethod,
        notes,
      })

      if (!result.success) {
        const status = result.code === 'ALREADY_CHECKED_IN' ? 409 : 400
        return NextResponse.json(result, { status })
      }

      const metrics = await resortDb.getDashboardMetrics()
      return NextResponse.json({
        ...result,
        metrics,
      })
    }

    if (action === 'CHECK_OUT') {
      const result = await resortDb.confirmCheckOutAtomic({
        reservationId,
        wristbandToken,
        staffId,
        staffName,
        releaseWristband,
        verificationMethod,
        notes,
      })

      if (!result.success) {
        const status = result.code === 'ALREADY_CHECKED_OUT' ? 409 : 400
        return NextResponse.json(result, { status })
      }

      const metrics = await resortDb.getDashboardMetrics()
      return NextResponse.json({
        ...result,
        metrics,
      })
    }

    return NextResponse.json({ error: `Invalid action: ${action}` }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
