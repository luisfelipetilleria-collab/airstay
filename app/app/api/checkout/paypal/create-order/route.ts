import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteUrl } from '@/lib/site-url'
import { createPayPalOrder, getPayPalAccessToken } from '@/lib/paypal'

export async function POST(req: Request) {
  const { bookingId } = await req.json().catch(() => ({}))
  if (!bookingId) {
    return NextResponse.json({ error: 'Missing bookingId.' }, { status: 400 })
  }

  if (!process.env.PAYPAL_CLIENT_ID || !process.env.PAYPAL_CLIENT_SECRET) {
    return NextResponse.json(
      { error: 'PayPal is not set up yet. Add PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET in Vercel.' },
      { status: 500 }
    )
  }

  const supabase = createAdminClient()

  const { data: booking } = await supabase
    .from('bookings')
    .select('id, listing_id, total, status')
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

  const siteUrl = getSiteUrl(req)

  let order
  try {
    const accessToken = await getPayPalAccessToken()
    order = await createPayPalOrder({
      accessToken,
      amount: booking.total,
      description: listing?.title ?? 'Airstay booking',
      returnUrl: `${siteUrl}/api/checkout/paypal/return?bookingId=${booking.id}`,
      cancelUrl: `${siteUrl}/listing/${booking.listing_id}?booking=cancelled`,
    })
  } catch (err: any) {
    return NextResponse.json({ error: `PayPal error: ${err.message}` }, { status: 502 })
  }

  const approveUrl = (order.links || []).find((l: any) => l.rel === 'approve')?.href
  if (!approveUrl) {
    return NextResponse.json({ error: 'PayPal did not return an approval link.' }, { status: 502 })
  }

  await supabase
    .from('bookings')
    .update({ payment_method: 'paypal', paypal_order_id: order.id })
    .eq('id', booking.id)

  return NextResponse.json({ url: approveUrl })
}
