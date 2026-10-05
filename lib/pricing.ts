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
  pricePerNight: number // nightly rate for the whole party (base + extra guests)
  basePrice: number // price for the first guest
  guests: number
  extraGuests: number
  extraGuestFee: number // per extra guest, per night
  nights: number
  nightsTotal: number
  cleaningFee: number
  guestServiceFee: number
  total: number
}

// The listing price covers 1 guest. Every guest from the 2nd onwards adds
// the listing's extra_guest_fee per night.
export function computePricing(
  basePrice: number,
  cleaningFee: number,
  nights: number,
  guests: number = 1,
  extraGuestFee: number = 0
): Pricing {
  const base = Number(basePrice) || 0
  const extraFee = Number(extraGuestFee) || 0
  const partySize = Math.max(1, Math.floor(Number(guests) || 1))
  const extraGuests = partySize - 1
  const pricePerNight = Math.round((base + extraGuests * extraFee) * 100) / 100
  const nightsTotal = Math.round(pricePerNight * nights * 100) / 100
  const fee = Math.round((Number(cleaningFee) || 0) * 100) / 100
  const guestServiceFee = Math.round((nightsTotal + fee) * GUEST_SERVICE_FEE_RATE * 100) / 100
  const total = Math.round((nightsTotal + fee + guestServiceFee) * 100) / 100
  return {
    pricePerNight,
    basePrice: base,
    guests: partySize,
    extraGuests,
    extraGuestFee: extraFee,
    nights,
    nightsTotal,
    cleaningFee: fee,
    guestServiceFee,
    total,
  }
}
