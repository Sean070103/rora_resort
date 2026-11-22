import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { getCurrentUser, hasRole } from '@/lib/auth'

export async function PUT(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!hasRole(user, ['ADMIN'])) {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const payload = await req.json()
    const existing = await db.getRoomById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    const updated = {
      ...existing,
      ...payload,
      id, // Preserve id
    }

    const saved = await db.saveRoom(updated)
    return NextResponse.json({ success: true, room: saved })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()
    if (!hasRole(user, ['ADMIN'])) {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const deleted = await db.deleteRoom(id)
    if (!deleted) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 })
    }

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
