import { NextResponse } from 'next/server'
import { db } from '@/lib/db/db'

export async function POST(req: Request) {
  try {
    const { phone, email, subtotal } = await req.json()
    if (!phone) {
      return NextResponse.json({ error: 'Phone number is required' }, { status: 400 })
    }

    const loyalty = await db.getGuestLoyalty(phone, email)
    const amount = Number(subtotal) || 0
    const discountAmount = Math.round((amount * loyalty.tier.discountPercentage) / 100)
    const totalAmount = amount - discountAmount

    return NextResponse.json({
      loyalty,
      calculation: {
        subtotal: amount,
        discountPercentage: loyalty.tier.discountPercentage,
        discountAmount,
        totalAmount,
      },
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
