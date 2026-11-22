import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const reservation = await resortDb.getReservationById(id)

    if (!reservation) {
      return NextResponse.json({ error: 'Reservation not found' }, { status: 404 })
    }

    // Get access logs for this reservation
    const allLogs = await resortDb.getAccessLogs()
    const logs = allLogs.filter((l) => l.reservation_id === id)

    return NextResponse.json({
      reservation,
      logs,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()

    const updated = await resortDb.saveReservation({
      id,
      ...body,
    })

    return NextResponse.json({ reservation: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
