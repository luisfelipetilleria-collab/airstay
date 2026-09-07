import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteUrl } from '@/lib/site-url'

export async function POST(req: Request) {
  const { bookingId } = await req.json().catch(() => ({}))
  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId.' }, { status: 400 })
  }

  if (!process.env.STRIPE_SECRET_KEY) {
    return NextResponse.json(
      { error: 'Card payments are not set up yet. Add STRIPE_SECRET_KEY in Vercel.' },
      { status: 500 }
    )
  }

  const supabase = createAdminClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, listing_id, nights, total, status, guest_email')
    .eq('id', bookingId)
    .single()

  if (!booking || booking.status !== 'pending_payment') {
    return NextResponse.json({ error: 'This booking is no longer available.' }, { status: 404 })
  }

  const { data: listing } = await supabase
    .from('listings')
    .select('title')
    .eq('id', booking.listing_id)
    .single()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const siteUrl = getSiteUrl(req)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: booking.guest_email,
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          unit_amount: Math.round(booking.total * 100),
          product_data: {
            name: `${listing?.title ?? 'Airstay booking'} — ${booking.nights} night${booking.nights > 1 ? 's' : ''}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: booking.id },
    success_url: `${siteUrl}/listing/${booking.listing_id}?booking=success`,
    cancel_url: `${siteUrl}/listing/${booking.listing_id}?booking=cancelled`,
  })

  await supabase
    .from('bookings')
    .update({ payment_method: 'stripe', stripe_checkout_session_id: session.id })
    .eq('id', booking.id)

  return NextResponse.json({ url: session.url })
}
