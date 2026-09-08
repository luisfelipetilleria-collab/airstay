// Shared pricing math — used both server-side (when a booking is created,
// so the price actually charged is never trusted from the browser) and
// client-side (to show the guest a live price breakdown as they pick dates).

// Both guests and hosts are charged a 5% service fee.
export const GUEST_SERVICE_FEE_RATE = 0.05
export const HOST_SERVICE_FEE_RATE = 0.05

export function nightsBetween(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn + 'T00:00:00Z')
  const end = new Date(checkOut + 'T00:00:00Z')
  return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
}

export interface Pricing {
  pricePerNight: number
  nights: number
  nightsTotal: number
  cleaningFee: number
  guestServiceFee: number
  total: number
}

export function computePricing(pricePerNight: number, cleaningFee: number, nights: number): Pricing {
  const nightsTotal = Math.round(pricePerNight * nights * 100) / 100
  const fee = Math.round(cleaningFee * 100) / 100
  const guestServiceFee = Math.round((nightsTotal + fee) * GUEST_SERVICE_FEE_RATE * 100) / 100
  const total = Math.round((nightsTotal + fee + guestServiceFee) * 100) / 100
  return {
    pricePerNight,
    nights,
    nightsTotal,
    cleaningFee: fee,
    guestServiceFee,
    total,
  }
}
