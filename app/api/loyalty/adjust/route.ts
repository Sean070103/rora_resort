import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { getCurrentUser, hasRole } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!hasRole(user, ['ADMIN'])) {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const { guestPhone, guestName, newCompletedVisits, reason } = await req.json()
    if (!guestPhone || !guestName || newCompletedVisits === undefined || !reason) {
      return NextResponse.json({ error: 'Missing required adjustment parameters' }, { status: 400 })
    }

    const log = await db.adjustGuestLoyalty({
      guestPhone,
      guestName,
      newCompletedVisits: Number(newCompletedVisits),
      reason,
      performedBy: user?.name || 'Admin',
    })

    return NextResponse.json({ success: true, log })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
