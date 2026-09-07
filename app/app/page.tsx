import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, listing_type, address_line, postcode, price_per_night, cleaning_fee, photos, host_id')
    .eq('active', true)
    .order('price_per_night', { ascending: true })

  const { data: hostNames } = await supabase.from('host_names').select('id, name')
  const hostMap = new Map((hostNames || []).map((h: any) => [h.id, h.name]))

  return (
    <div className="max-w-5xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-2">Find your next stay</h1>
      <p className="text-gray-600 mb-8">Rooms and beds across London, ready when you are.</p>

      {error && (
        <p className="text-red-600">
          Could not load listings yet — make sure schema.sql and seed.sql have been run in Supabase.
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {listings?.map((listing: any) => {
          const hostName = hostMap.get(listing.host_id)
          return (
            <Link
              key={listing.id}
              href={`/listing/${listing.id}`}
              className="border rounded-lg overflow-hidden hover:shadow-md transition"
            >
              {listing.photos?.[0] && (
                <img
                  src={listing.photos[0]}
                  alt={listing.title}
                  className="w-full h-40 object-cover"
                />
              )}
              <div className="p-4">
                <div className="text-xs uppercase text-blue-700 font-semibold mb-1">
                  {listing.listing_type}
                </div>
                <h2 className="font-semibold">{listing.title}</h2>

                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {hostName && (
                    <span className="text-sm text-gray-600">Hosted by {hostName}</span>
                  )}
                  {hostName && hostName !== 'Lucho' && (
                    <span className="inline-flex items-center gap-1 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-medium">
                      🏅 SuperHost
                    </span>
                  )}
                </div>

                <p className="text-sm text-gray-500 mt-1">{listing.postcode}</p>
                <p className="mt-2 font-medium">
                  £{listing.price_per_night} <span className="text-gray-500 text-sm">/ night</span>
                </p>
                <p className="text-xs text-gray-400">+£{listing.cleaning_fee} cleaning fee</p>
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
