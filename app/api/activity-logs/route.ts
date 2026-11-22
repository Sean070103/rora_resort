import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const action = searchParams.get('action')
    const method = searchParams.get('method')
    const query = searchParams.get('q')

    let logs = await resortDb.getAccessLogs()

    if (action && action !== 'ALL') {
      logs = logs.filter((l) => l.action_type === action)
    }

    if (method && method !== 'ALL') {
      logs = logs.filter((l) => l.verification_method === method)
    }

    if (query) {
      const q = query.toLowerCase().trim()
      logs = logs.filter(
        (l) =>
          l.guest_name?.toLowerCase().includes(q) ||
          l.reservation_ref?.toLowerCase().includes(q) ||
          l.wristband_code?.toLowerCase().includes(q) ||
          l.receptionist_name.toLowerCase().includes(q) ||
          l.notes?.toLowerCase().includes(q)
      )
    }

    return NextResponse.json({ logs })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
