import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const staffName = user?.full_name || 'Front Desk Staff'

    const body = await req.json()
    const { wristbandId, reason = 'Flagged compromised or damaged by staff' } = body

    if (!wristbandId) {
      return NextResponse.json({ error: 'wristbandId is required' }, { status: 400 })
    }

    const disabled = await resortDb.disableWristband(wristbandId, reason, staffName)
    return NextResponse.json({
      success: true,
      message: `Wristband ${disabled.wristband_code} is now disabled.`,
      wristband: disabled,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
