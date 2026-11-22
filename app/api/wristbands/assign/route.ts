import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const staffName = user?.full_name || 'Front Desk Staff'

    const body = await req.json()
    const { wristbandId, guestId, reservationId } = body

    if (!wristbandId || !guestId || !reservationId) {
      return NextResponse.json(
        { error: 'wristbandId, guestId, and reservationId are required' },
        { status: 400 }
      )
    }

    const updated = await resortDb.assignWristband(wristbandId, guestId, reservationId, staffName)
    return NextResponse.json({ success: true, wristband: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
