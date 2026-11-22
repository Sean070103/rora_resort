import { NextResponse } from 'next/server'
import { resortDb } from '@/lib/db/resort-db'

export async function GET() {
  try {
    const metrics = await resortDb.getDashboardMetrics()
    return NextResponse.json({ metrics })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
