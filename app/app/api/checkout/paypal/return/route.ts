import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getSiteUrl } from '@/lib/site-url'
import { capturePayPalOrder, getPayPalAccessToken } from '@/lib/paypal'

// PayPal redirects the guest's browser back here (GET) after they approve
// payment on paypal.com. `token` is the PayPal order id.
export async function GET(req: Request) {
  const url = new URL(req.url)
  const orderId = url.searchParams.get('token')
  const bookingId = url.searchParams.get('bookingId')
  const siteUrl = getSiteUrl(req)

  const supabase = createAdminClient()

  const { data: booking } = bookingId
    ? await supabase.from('bookings').select('id, listing_id, status').eq('id', bookingId).single()
    : { data: null }

  const failUrl = booking
    ? `${siteUrl}/listing/${booking.listing_id}?booking=failed`
    : `${siteUrl}/?booking=failed`

  if (!orderId || !booking) {
    return NextResponse.redirect(failUrl)
  }

  try {
    const accessToken = await getPayPalAccessToken()
    const capture = await capturePayPalOrder({ accessToken, orderId })

    if (capture.status === 'COMPLETED') {
      await supabase
        .from('bookings')
        .update({ payment_status: 'paid' })
        .eq('id', booking.id)

      const { error } = await supabase
        .from('bookings')
        .update({ status: 'confirmed' })
        .eq('id', booking.id)
        .eq('status', 'pending_payment')

      if (error) {
        console.error(`Booking ${booking.id} paid but could not be confirmed:`, error.message)
      }

      return NextResponse.redirect(`${siteUrl}/listing/${booking.listing_id}?booking=success`)
    }
  } catch (err: any) {
    console.error('PayPal capture failed:', err.message)
  }

  return NextResponse.redirect(failUrl)
}
