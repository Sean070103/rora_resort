import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')
    const date = searchParams.get('date')
    const query = searchParams.get('q')

    let reservations = await resortDb.getReservations()

    if (status && status !== 'ALL') {
      reservations = reservations.filter((r) => r.status === status)
    }

    if (date) {
      reservations = reservations.filter((r) => r.check_in_date === date || r.check_out_date === date)
    }

    if (query) {
      const q = query.toLowerCase().trim()
      reservations = reservations.filter(
        (r) =>
          r.reference_number.toLowerCase().includes(q) ||
          r.guest?.full_name.toLowerCase().includes(q) ||
          r.guest?.phone.toLowerCase().includes(q) ||
          r.room_or_accommodation.toLowerCase().includes(q)
      )
    }

    return NextResponse.json({ reservations })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      guest_id,
      check_in_date,
      check_out_date,
      room_or_accommodation,
      accommodation_type = 'VILLA',
      adults_count = 2,
      children_count = 0,
      total_amount = 0,
      amount_paid = 0,
      payment_status = 'Paid',
      special_requests,
      assigned_wristband_id,
    } = body

    if (!guest_id || !check_in_date || !check_out_date || !room_or_accommodation) {
      return NextResponse.json(
        { error: 'guest_id, check_in_date, check_out_date, and room_or_accommodation are required' },
        { status: 400 }
      )
    }

    const reservation = await resortDb.saveReservation({
      guest_id,
      check_in_date,
      check_out_date,
      room_or_accommodation,
      accommodation_type,
      adults_count: Number(adults_count),
      children_count: Number(children_count),
      total_amount: Number(total_amount),
      amount_paid: Number(amount_paid),
      payment_status,
      special_requests,
      assigned_wristband_id,
      status: 'Confirmed',
    })

    // If wristband was assigned at creation time
    if (assigned_wristband_id) {
      await resortDb.assignWristband(assigned_wristband_id, guest_id, reservation.id, 'Front Desk')
    }

    return NextResponse.json({ reservation }, { status: 201 })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
