import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'

export default async function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from('listings')
    .select('*')
    .eq('id', id)
    .single()

  if (!listing) return notFound()

  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <div className="text-xs uppercase text-blue-700 font-semibold mb-1">
        {listing.listing_type}
      </div>
      <h1 className="text-2xl font-bold">{listing.title}</h1>
      <p className="text-gray-500 mb-4">{listing.address_line}, {listing.postcode}</p>

      <div className="border rounded-lg p-4 mb-6">
        <p className="text-xl font-semibold">£{listing.price_per_night} / night</p>
        <p className="text-sm text-gray-500">+£{listing.cleaning_fee} cleaning fee</p>
      </div>

      <button className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800">
        Book this stay
      </button>
    </div>
  )
}
