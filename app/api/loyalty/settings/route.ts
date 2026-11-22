import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { getCurrentUser, hasRole } from '@/lib/auth'

export async function GET() {
  try {
    const settings = await db.getLoyaltySettings()
    return NextResponse.json({ settings })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!hasRole(user, ['ADMIN'])) {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const { tiers } = await req.json()
    if (!Array.isArray(tiers) || tiers.length === 0) {
      return NextResponse.json({ error: 'Invalid tiers configuration' }, { status: 400 })
    }

    const updated = await db.updateLoyaltySettings(tiers, user?.name || 'Admin')
    return NextResponse.json({ success: true, settings: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
