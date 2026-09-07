// Single source of truth for price math, used both for the on-page preview
// and (again, authoritatively) on the server when a booking is created.
// Never trust a price sent from the browser — always recompute it here from
// the listing's real price_per_night / cleaning_fee before charging anyone.

export const GUEST_SERVICE_FEE_RATE = 0.05

function round2(n: number) {
  return Math.round(n * 100) / 100
}

export function nightsBetween(checkIn: string, checkOut: string) {
  const start = new Date(checkIn + 'T00:00:00Z')
  const end = new Date(checkOut + 'T00:00:00Z')
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export interface PriceBreakdown {
  nights: number
  pricePerNight: number
  nightsTotal: number
  cleaningFee: number
  guestServiceFee: number
  total: number
}

export function computePricing(
  pricePerNight: number,
  cleaningFee: number,
  nights: number
): PriceBreakdown {
  const nightsTotal = round2(pricePerNight * nights)
  const subtotal = nightsTotal + cleaningFee
  const guestServiceFee = round2(subtotal * GUEST_SERVICE_FEE_RATE)
  const total = round2(subtotal + guestServiceFee)

  return { nights, pricePerNight, nightsTotal, cleaningFee, guestServiceFee, total }
}
