import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const ref = searchParams.get('ref')
    const query = searchParams.get('query')

    if (ref) {
      const reservation = await db.getReservationByReference(ref)
      if (!reservation) {
        return NextResponse.json({ error: 'Reservation not found with reference ' + ref }, { status: 404 })
      }
      return NextResponse.json({ reservation })
    }

    if (query) {
      const reservations = await db.getGuestReservations(query)
      return NextResponse.json({ reservations })
    }

    return NextResponse.json({ error: 'Please provide a reference number or phone/email' }, { status: 400 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
