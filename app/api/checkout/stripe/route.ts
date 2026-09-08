import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteUrl } from '@/lib/site-url'
import { nightsBetween } from '@/lib/pricing'

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
    .select('id, listing_id, check_in, check_out, total_price, status, guests(email)')
    .eq('id', bookingId)
    .single()

  if (!booking || booking.status !== 'pending_payment') {
    return NextResponse.json({ error: 'This booking is no longer available.' }, { status: 404 })
  }

  const nights = nightsBetween(booking.check_in, booking.check_out)
  const guestEmail = (booking as any).guests?.email as string | undefined

  const { data: listing } = await supabase
    .from('listings')
    .select('title')
    .eq('id', booking.listing_id)
    .single()

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const siteUrl = getSiteUrl(req)

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    customer_email: guestEmail,
    line_items: [
      {
        price_data: {
          currency: 'gbp',
          unit_amount: Math.round(booking.total_price * 100),
          product_data: {
            name: `${listing?.title ?? 'Airstay booking'} — ${nights} night${nights > 1 ? 's' : ''}`,
          },
        },
        quantity: 1,
      },
    ],
    metadata: { bookingId: booking.id },
    success_url: `${siteUrl}/listing/${booking.listing_id}?booking=success`,
    cancel_url: `${siteUrl}/listing/${booking.listing_id}?booking=cancelled`,
  })

   const { data: updateData, error: updateError } = await supabase
    .from('bookings')
    .update({ payment_method: 'stripe', stripe_checkout_session_id: session.id })
    .eq('id', booking.id)
    .select()
  console.log('Checkout session update result:', JSON.stringify({ bookingId: booking.id, updateData, updateError }))

  return NextResponse.json({ url: session.url })
}
