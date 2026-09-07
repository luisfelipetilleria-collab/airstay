import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createAdminClient } from '@/lib/supabase/admin'

// Stripe dashboard → Developers → Webhooks → Add endpoint:
//   URL:    https://airstay.uk/api/webhooks/stripe   (or your Vercel URL)
//   Events: checkout.session.completed
// Copy the "Signing secret" it gives you into STRIPE_WEBHOOK_SECRET.
export async function POST(req: Request) {
  if (!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 })
  }

  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
  const signature = req.headers.get('stripe-signature')
  const rawBody = await req.text()

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature!, process.env.STRIPE_WEBHOOK_SECRET)
  } catch (err: any) {
    return NextResponse.json({ error: `Webhook signature invalid: ${err.message}` }, { status: 400 })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const bookingId = session.metadata?.bookingId
    if (bookingId) {
      const supabase = createAdminClient()
      // Two steps: always record that money arrived, even in the rare case
      // the second step (below) is rejected by the database.
      await supabase
        .from('bookings')
        .update({
          payment_status: 'paid',
          stripe_payment_intent_id:
            typeof session.payment_intent === 'string' ? session.payment_intent : session.payment_intent?.id,
        })
        .eq('id', bookingId)

      // This can fail if the dates got confirmed for someone else in the
      // meantime (the database's overlap guard rejects it) — extremely
      // unlikely given the 20-minute hold, but if it happens the booking is
      // left paid-but-not-confirmed for a human to sort out (refund or
      // rebook), instead of silently double-booking the listing.
      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', bookingId)
        .eq('status', 'pending_payment')

      if (error) {
        console.error(`Booking ${bookingId} paid but could not be confirmed:`, error.message)
      }
    }
  }

  return NextResponse.json({ received: true })
}
