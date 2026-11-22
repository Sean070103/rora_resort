import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'
import { setSessionUser } from '@/lib/auth'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, role } = body

    const profiles = await resortDb.getProfiles()
    let user = null

    if (email) {
      user = profiles.find((p) => p.email.toLowerCase() === email.toLowerCase().trim())
    } else if (role) {
      user = profiles.find((p) => p.role === role)
    }

    if (!user) {
      user = profiles[0]
    }

    await setSessionUser(user)
    return NextResponse.json({ success: true, user })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
