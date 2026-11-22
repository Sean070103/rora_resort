import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'

export async function GET() {
  try {
    const profiles = await resortDb.getProfiles()
    return NextResponse.json({ profiles })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, full_name, role = 'receptionist', phone } = body

    if (!email || !full_name) {
      return NextResponse.json({ error: 'Email and Full Name are required' }, { status: 400 })
    }

    const saved = await resortDb.saveProfile({
      email,
      full_name,
      role,
      phone,
    })

    return NextResponse.json({ profile: saved }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
