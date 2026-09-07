import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { computePricing, nightsBetween } from '@/lib/pricing'
import { getBlockedDateSet, rangeOverlapsBlocked } from '@/lib/availability'

// Creates a "pending_payment" booking, after re-checking everything
// server-side (never trust dates or prices sent from the browser). The
// booking becomes real ("confirmed") only once a payment webhook/return
// confirms money actually moved — see /api/webhooks/stripe and
// /api/checkout/paypal/return.
export async function POST(req: Request) {
  const body = await req.json().catch(() => null)
  const { listingId, checkIn, checkOut, guestName, guestEmail, guestPhone } = body || {}

  if (!listingId || !checkIn || !checkOut || !guestName || !guestEmail) {
    return NextResponse.json({ error: 'Missing required fields.' }, { status: 400 })
  }

  const dateRe = /^\d{4}-\d{2}-\d{2}$/
  if (!dateRe.test(checkIn) || !dateRe.test(checkOut) || checkOut <= checkIn) {
    return NextResponse.json({ error: 'Invalid date range.' }, { status: 400 })
  }

  const today = new Date().toISOString().slice(0, 10)
  if (checkIn < today) {
    return NextResponse.json({ error: 'Check-in date is in the past.' }, { status: 400 })
  }

  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRe.test(guestEmail)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const supabase = createAdminClient()

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .select('id, price_per_night, cleaning_fee, active, blocked_dates')
    .eq('id', listingId)
    .single()

  if (listingError || !listing || !listing.active) {
    return NextResponse.json({ error: 'This listing is not available.' }, { status: 404 })
  }

  const { data: existingBookings, error: bookingsError } = await supabase
    .from('bookings')
    .select('check_in, check_out, status, created_at')
    .eq('listing_id', listingId)
    .in('status', ['pending_payment', 'confirmed'])

  if (bookingsError) {
    return NextResponse.json({ error: 'Could not check availability.' }, { status: 500 })
  }

  const blocked = getBlockedDateSet(listing.blocked_dates, existingBookings || [])
  if (rangeOverlapsBlocked(checkIn, checkOut, blocked)) {
    return NextResponse.json(
      { error: 'Sorry, one or more of those nights just became unavailable. Please pick different dates.' },
      { status: 409 }
    )
  }

  const nights = nightsBetween(checkIn, checkOut)
  const pricing = computePricing(listing.price_per_night, listing.cleaning_fee, nights)

  const { data: booking, error: insertError } = await supabase
    .from('bookings')
    .insert({
      listing_id: listingId,
      guest_name: guestName,
      guest_email: guestEmail,
      guest_phone: guestPhone || null,
      check_in: checkIn,
      check_out: checkOut,
      nights: pricing.nights,
      price_per_night: pricing.pricePerNight,
      cleaning_fee: pricing.cleaningFee,
      guest_service_fee: pricing.guestServiceFee,
      total: pricing.total,
    })
    .select('id')
    .single()

 if (insertError) {
    console.error('Booking insert error:', insertError)
    return NextResponse.json({ error: 'Could not create booking. Please try again.' }, { status: 500 })
  }

  return NextResponse.json({ bookingId: booking.id, pricing })
}
