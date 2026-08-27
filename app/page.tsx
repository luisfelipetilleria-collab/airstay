import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: listings, error } = await supabase
    .from('listings')
    .select('id, title, listing_type, address_line, postcode, price_per_night, cleaning_fee')
    .eq('active', true)
    .order('price_per_night', { ascending: true })

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
        {listings?.map((listing) => (
          <Link
            key={listing.id}
            href={`/listing/${listing.id}`}
            className="border rounded-lg p-4 hover:shadow-md transition"
          >
            <div className="text-xs uppercase text-blue-700 font-semibold mb-1">
              {listing.listing_type}
            </div>
            <h2 className="font-semibold">{listing.title}</h2>
            <p className="text-sm text-gray-500">{listing.postcode}</p>
            <p className="mt-2 font-medium">
              £{listing.price_per_night} <span className="text-gray-500 text-sm">/ night</span>
            </p>
            <p className="text-xs text-gray-400">+£{listing.cleaning_fee} cleaning fee</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
