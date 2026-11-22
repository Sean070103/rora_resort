import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { getCurrentUser, hasRole } from '@/lib/auth'

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!hasRole(user, ['ADMIN', 'RECEPTIONIST'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const { uid, status, reason } = await req.json()
    if (!uid || !status) {
      return NextResponse.json({ error: 'UID and status are required' }, { status: 400 })
    }

    const wristband = await db.updateWristbandStatus(
      uid,
      status,
      reason,
      user?.name || 'Staff'
    )

    return NextResponse.json({ success: true, wristband })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
