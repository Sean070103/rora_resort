import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { getCurrentUser, hasRole } from '@/lib/auth'

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = searchParams.get('guests') ? parseInt(searchParams.get('guests')!, 10) : undefined

    let rooms = await db.getRooms()

    if (guests) {
      rooms = rooms.filter((r) => r.capacity >= guests)
    }

    // If dates are provided, mark availability for each room
    if (checkIn && checkOut) {
      const results = await Promise.all(
        rooms.map(async (room) => {
          const avail = await db.checkRoomAvailability(room.id, checkIn, checkOut)
          return {
            ...room,
            isAvailable: avail.available,
            conflict: avail.conflict ? { id: avail.conflict.id, dates: `${avail.conflict.checkInDate} to ${avail.conflict.checkOutDate}` } : undefined,
          }
        })
      )
      return NextResponse.json({ rooms: results })
    }

    return NextResponse.json({ rooms })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!hasRole(user, ['ADMIN'])) {
      return NextResponse.json({ error: 'Unauthorized: Admin role required' }, { status: 403 })
    }

    const payload = await req.json()
    if (!payload.name || !payload.basePrice || !payload.capacity) {
      return NextResponse.json({ error: 'Missing required accommodation details' }, { status: 400 })
    }

    const newRoom = {
      id: `rm_${Date.now()}`,
      name: payload.name,
      type: payload.type || 'ROOM',
      description: payload.description || '',
      capacity: Number(payload.capacity),
      basePrice: Number(payload.basePrice),
      seasonalMultiplier: Number(payload.seasonalMultiplier || 1.0),
      amenities: Array.isArray(payload.amenities) ? payload.amenities : [],
      photos: Array.isArray(payload.photos) && payload.photos.length > 0
        ? payload.photos
        : ['https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-ptJYAW4Nc0nc5uSjXobR2m1gYIIkIx.png'],
      status: payload.status || 'AVAILABLE',
      isActive: payload.isActive !== false,
    }

    const saved = await db.saveRoom(newRoom as any)
    return NextResponse.json({ success: true, room: saved })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
