// Works out which dates are already spoken for, combining:
//   1. Dates a host manually blocked (listings.blocked_dates)
//   2. Dates covered by a CONFIRMED booking
//   3. Dates covered by a booking that's mid-checkout (pending_payment and
//      started less than HOLD_MINUTES ago) — a short hold so two guests
//      can't both be paying for the same dates at the same time.
//
// Used both to render the calendar (what shows as unavailable) and, more
// importantly, on the server when a new booking is created (what to reject).

export const HOLD_MINUTES = 20

export interface BookingRow {
  check_in: string
  check_out: string
  status: string
  created_at: string
}

function eachDateISO(checkIn: string, checkOut: string): string[] {
  const dates: string[] = []
  const d = new Date(checkIn + 'T00:00:00Z')
  const end = new Date(checkOut + 'T00:00:00Z')
  while (d < end) {
    dates.push(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return dates
}

function isActiveHold(booking: BookingRow): boolean {
  if (booking.status === 'confirmed') return true
  if (booking.status !== 'pending_payment') return false
  const ageMs = Date.now() - new Date(booking.created_at).getTime()
  return ageMs < HOLD_MINUTES * 60 * 1000
}

export function getBlockedDateSet(
  manualBlockedDates: string[] | null | undefined,
  bookings: BookingRow[]
): Set<string> {
  const set = new Set<string>(manualBlockedDates || [])
  for (const booking of bookings) {
    if (!isActiveHold(booking)) continue
    for (const date of eachDateISO(booking.check_in, booking.check_out)) {
      set.add(date)
    }
  }
  return set
}

export function rangeOverlapsBlocked(
  checkIn: string,
  checkOut: string,
  blocked: Set<string>
): boolean {
  return eachDateISO(checkIn, checkOut).some((date) => blocked.has(date))
}
