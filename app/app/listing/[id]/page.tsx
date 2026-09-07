import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookingCalendar from './BookingCalendar'
import { getBlockedDateSet } from '@/lib/availability'

export default async function ListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ booking?: string }>
}) {
  const { id } = await params
  const { booking: bookingStatus } = await searchParams
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (!listing) return notFound()

  const { data: host } = await supabase
    .from('host_names')
    .select('name')
    .eq('id', listing.host_id)
    .single()

  const { data: existingBookings } = await supabase
    .from('bookings')
    .select('check_in, check_out, status, created_at')
    .eq('listing_id', id)
    .in('status', ['pending_payment', 'confirmed'])

  const blockedDates = Array.from(getBlockedDateSet(listing.blocked_dates, existingBookings || []))

  const streetOnly = listing.address_line?.replace(/^\d+\s*/, '') ?? listing.address_line

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      {bookingStatus === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-800 rounded-lg px-4 py-3 mb-6 text-sm">
          Payment received — your booking is confirmed! A confirmation has been sent to your email.
        </div>
      )}
      {bookingStatus === 'cancelled' && (
        <div className="bg-gray-50 border border-gray-200 text-gray-700 rounded-lg px-4 py-3 mb-6 text-sm">
          Checkout was cancelled — no payment was taken. Feel free to try again whenever you're ready.
        </div>
      )}
      {bookingStatus === 'failed' && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-6 text-sm">
          We couldn't confirm that payment. You haven't been charged — please try again.
        </div>
      )}

      {listing.photos && listing.photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2 mb-6">
          <img
            src={listing.photos[0]}
            alt={listing.title}
            className="col-span-2 w-full h-64 object-cover rounded-lg"
          />
          {listing.photos.slice(1, 5).map((url: string, i: number) => (
            <img
              key={i}
              src={url}
              alt={`${listing.title} photo ${i + 2}`}
              className="w-full h-32 object-cover rounded-lg"
            />
          ))}
        </div>
      )}

      <div className="text-xs uppercase text-blue-700 font-semibold mb-1">
        {listing.listing_type}
      </div>
      <h1 className="text-2xl font-bold">{listing.title}</h1>
      <p className="text-gray-500 mb-1">{streetOnly}, {listing.postcode}</p>

      {host?.name && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-gray-600">Hosted by {host.name}</span>
          {host.name !== 'Lucho' && (
            <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
              🏅 SuperHost
            </span>
          )}
        </div>
      )}

      {listing.description && (
        <p className="text-gray-700 mb-6">{listing.description}</p>
      )}

      <BookingCalendar
        listingId={listing.id}
        pricePerNight={listing.price_per_night}
        cleaningFee={listing.cleaning_fee}
        blockedDates={blockedDates}
      />
    </div>
  )
}
