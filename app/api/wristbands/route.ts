import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'
import crypto from 'crypto'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const query = searchParams.get('q')

    let wristbands = await resortDb.getWristbands()

    if (status && status !== 'ALL') {
      wristbands = wristbands.filter((w) => w.status === status)
    }

    if (query) {
      const q = query.toLowerCase().trim()
      wristbands = wristbands.filter(
        (w) =>
          w.wristband_code.toLowerCase().includes(q) ||
          w.nfc_token.toLowerCase().includes(q) ||
          w.guest?.full_name.toLowerCase().includes(q) ||
          w.reservation?.reference_number.toLowerCase().includes(q)
      )
    }

    return NextResponse.json({ wristbands })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { wristband_code, nfc_token, condition = 'Good', notes } = body

    if (!wristband_code) {
      return NextResponse.json({ error: 'Wristband code (e.g. WB-810) is required' }, { status: 400 })
    }

    // Generate secure opaque random token if none provided
    const secureToken = nfc_token?.trim() || `nfc_tok_${crypto.randomBytes(8).toString('hex')}`

    // Check unique wristband code
    const existing = await resortDb.getWristbandByCode(wristband_code)
    if (existing) {
      return NextResponse.json({ error: `Wristband code ${wristband_code} already exists` }, { status: 400 })
    }

    const wristband = await resortDb.saveWristband({
      wristband_code: wristband_code.trim().toUpperCase(),
      nfc_token: secureToken,
      condition,
      status: 'Available',
      notes,
    })

    return NextResponse.json({ wristband }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
