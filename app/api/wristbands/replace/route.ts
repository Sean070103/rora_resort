import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'
import { getCurrentUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser()
    const staffName = user?.full_name || 'Front Desk Staff'

    const body = await req.json()
    const { oldWristbandId, newWristbandId, reason = 'Lost wristband replacement' } = body

    if (!oldWristbandId || !newWristbandId) {
      return NextResponse.json(
        { error: 'oldWristbandId and newWristbandId are required' },
        { status: 400 }
      )
    }

    const result = await resortDb.replaceWristband(oldWristbandId, newWristbandId, reason, staffName)
    return NextResponse.json({
      success: true,
      message: `Wristband replaced. Old wristband marked Lost/Invalidated. New wristband assigned.`,
      ...result,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
