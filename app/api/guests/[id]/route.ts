import { NextRequest, NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const guest = await resortDb.getGuestById(id)

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Get guest reservations
    const allReservations = await resortDb.getReservations()
    const reservations = allReservations.filter((r) => r.guest_id === id)

    // Get wristbands
    const allWristbands = await resortDb.getWristbands()
    const wristbands = allWristbands.filter((w) => w.assigned_guest_id === id)

    // Get access logs
    const allLogs = await resortDb.getAccessLogs()
    const logs = allLogs.filter((l) => l.guest_id === id)

    return NextResponse.json({
      guest,
      reservations,
      wristbands,
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

    const updated = await resortDb.saveGuest({
      id,
      ...body,
    })

    return NextResponse.json({ guest: updated })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
