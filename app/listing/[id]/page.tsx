import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import BookingCalendar from './BookingCalendar'

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
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

  const streetOnly = listing.address_line?.replace(/^\d+\s*/, '') ?? listing.address_line

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
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
        pricePerNight={listing.price_per_night}
        cleaningFee={listing.cleaning_fee}
        blockedDates={listing.blocked_dates || []}
      />

      <button className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800">
        Book this stay
      </button>

      <p className="text-xs text-gray-400 mt-4">
        The full address, check-in details, and access codes will be shared once your booking is confirmed.
      </p>
    </div>
  )
}
