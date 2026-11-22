import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { getCurrentUser, hasRole } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!hasRole(user, ['ADMIN', 'RECEPTIONIST'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { reservationId } = await req.json()
    if (!reservationId) {
      return NextResponse.json({ error: 'Reservation ID is required' }, { status: 400 })
    }

    const result = await db.performCheckOut({
      reservationId,
      staffName: user?.name || 'Receptionist',
    })

    return NextResponse.json({ success: true, ...result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
