import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db'
import { getCurrentUser, hasRole } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()
    if (!hasRole(user, ['ADMIN', 'CASHIER', 'RECEPTIONIST'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const payments = await db.getPayments()
    return NextResponse.json({ payments })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser()
    if (!hasRole(user, ['ADMIN', 'CASHIER', 'RECEPTIONIST'])) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const payload = await req.json()
    const { reservationId, amount, paymentMethod, paymentType, transactionRef, notes } = payload

    if (!reservationId || !amount || !paymentMethod || !paymentType) {
      return NextResponse.json({ error: 'Missing required payment details' }, { status: 400 })
    }

    const result = await db.recordPayment({
      reservationId,
      amount: Number(amount),
      paymentMethod,
      paymentType,
      transactionRef,
      notes,
      recordedBy: user?.name || 'Cashier',
    })

    return NextResponse.json({ success: true, ...result })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
}
