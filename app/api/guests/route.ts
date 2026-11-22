import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const query = searchParams.get('q')
    const category = searchParams.get('category')

    let guests = query ? await resortDb.searchGuests(query) : await resortDb.getGuests()

    if (category) {
      guests = guests.filter((g) => g.category === category)
    }

    return NextResponse.json({ guests })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { full_name, email, phone, address, category, notes } = body

    if (!full_name || !email || !phone) {
      return NextResponse.json({ error: 'Name, email, and phone are required' }, { status: 400 })
    }

    const guest = await resortDb.saveGuest({
      full_name,
      email,
      phone,
      address,
      category,
      notes,
    })

    return NextResponse.json({ guest }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
