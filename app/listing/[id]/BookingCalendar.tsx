'use client'

import { useMemo, useState } from 'react'
import { computePricing, nightsBetween } from '@/lib/pricing'

interface Props {
  listingId: string
  pricePerNight: number
  cleaningFee: number
  blockedDates: string[]
}

type Step = 'pick-dates' | 'details' | 'redirecting'

export default function BookingCalendar({ listingId, pricePerNight, cleaningFee, blockedDates }: Props) {
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)
  const [step, setStep] = useState<Step>('pick-dates')
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [payingWith, setPayingWith] = useState<'stripe' | 'paypal' | null>(null)

  const blockedSet = useMemo(() => new Set(blockedDates || []), [blockedDates])

  const days = useMemo(() => {
    const start = new Date()
    start.setHours(0, 0, 0, 0)
    const result: Date[] = []
    for (let i = 0; i < 60; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      result.push(d)
    }
    return result
  }, [])

  function toISO(d: Date) {
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${y}-${m}-${day}`
  }

  function isBlocked(d: Date) {
    return blockedSet.has(toISO(d))
  }

  const months = useMemo(() => {
    const map = new Map<string, Date[]>()
    for (const d of days) {
      const key = `${d.getFullYear()}-${d.getMonth()}`
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(d)
    }
    return Array.from(map.entries())
  }, [days])

  function handleDayClick(iso: string) {
    setError(null)
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(iso)
      setCheckOut(null)
      setStep('pick-dates')
      return
    }
    if (iso <= checkIn) {
      setCheckIn(iso)
      setCheckOut(null)
      return
    }
    setCheckOut(iso)
  }

  function isInRange(iso: string) {
    if (!checkIn || !checkOut) return false
    return iso > checkIn && iso < checkOut
  }

  const rangeHasBlockedDate = useMemo(() => {
    if (!checkIn || !checkOut) return false
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    const d = new Date(start)
    while (d < end) {
      if (blockedSet.has(toISO(d))) return true
      d.setDate(d.getDate() + 1)
    }
    return false
  }, [checkIn, checkOut, blockedSet])

  const nights = checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0
  const pricing = nights > 0 ? computePricing(pricePerNight, cleaningFee, nights) : null
  const canBook = Boolean(checkIn && checkOut && !rangeHasBlockedDate && nights > 0)

  function resetSelection() {
    setCheckIn(null)
    setCheckOut(null)
    setStep('pick-dates')
    setError(null)
  }

  async function startCheckout(method: 'stripe' | 'paypal') {
    setError(null)

    if (!guestName.trim() || !guestEmail.trim()) {
      setError('Please enter your name and email.')
      return
    }
    if (!checkIn || !checkOut) return

    setPayingWith(method)
    setStep('redirecting')

    try {
      const bookingRes = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          listingId,
          checkIn,
          checkOut,
          guestName: guestName.trim(),
          guestEmail: guestEmail.trim(),
          guestPhone: guestPhone.trim() || null,
        }),
      })
      const bookingData = await bookingRes.json()
      if (!bookingRes.ok) {
        throw new Error(bookingData.error || 'Could not start booking.')
      }

      const checkoutPath = method === 'stripe' ? '/api/checkout/stripe' : '/api/checkout/paypal/create-order'
      const checkoutRes = await fetch(checkoutPath, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId: bookingData.bookingId }),
      })
      const checkoutData = await checkoutRes.json()
      if (!checkoutRes.ok || !checkoutData.url) {
        throw new Error(checkoutData.error || 'Could not start payment.')
      }

      window.location.href = checkoutData.url
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.')
      setStep('details')
      setPayingWith(null)
    }
  }

  return (
    <div className="border rounded-lg p-4 mb-6">
      <h3 className="font-semibold mb-3">Availability (next 2 months)</h3>

      <div className="space-y-4 mb-4">
        {months.map(([key, monthDays]) => {
          const first = monthDays[0]
          const monthLabel = first.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })
          return (
            <div key={key}>
              <p className="text-sm font-medium text-gray-600 mb-1">{monthLabel}</p>
              <div className="grid grid-cols-7 gap-1">
                {monthDays.map((d) => {
                  const iso = toISO(d)
                  const blocked = isBlocked(d)
                  const isStart = iso === checkIn
                  const isEnd = iso === checkOut
                  const inRange = isInRange(iso)

                  let style: React.CSSProperties | undefined
                  let className = 'text-xs rounded p-1.5 font-medium '

                  if (blocked) {
                    className += 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                  } else if (isStart) {
                    style = { background: 'linear-gradient(to right, white 50%, #1d4ed8 50%)' }
                    className += 'text-gray-900'
                  } else if (isEnd) {
                    style = { background: 'linear-gradient(to left, white 50%, #1d4ed8 50%)' }
                    className += 'text-gray-900'
                  } else if (inRange) {
                    className += 'bg-blue-100 text-blue-800'
                  } else {
                    className += 'bg-green-50 text-green-800 hover:bg-green-100'
                  }

                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={blocked}
                      onClick={() => handleDayClick(iso)}
                      style={style}
                      className={className}
                    >
                      {d.getDate()}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      <p className="text-xs text-gray-500 mb-4">
        Green = available. Click a date for check-in, then click another date for check-out.
      </p>

      <div className="mb-4 text-sm text-gray-700 flex items-center gap-4 flex-wrap">
        <span>
          Check-in: <span className="font-medium">{checkIn ?? '—'}</span>
        </span>
        <span>
          Check-out: <span className="font-medium">{checkOut ?? '—'}</span>{' '}
          <span className="text-xs text-gray-400">(by 10:30am)</span>
        </span>
        {(checkIn || checkOut) && (
          <button type="button" onClick={resetSelection} className="text-xs text-blue-700 underline">
            Clear selection
          </button>
        )}
      </div>

      {checkIn && checkOut && rangeHasBlockedDate && (
        <p className="text-red-600 text-sm mb-4">
          One or more nights in this range aren&apos;t available. Please choose different dates.
        </p>
      )}

      {pricing && !rangeHasBlockedDate && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1 mb-4">
          <div className="flex justify-between">
            <span>
              £{pricing.pricePerNight} x {pricing.nights} night{pricing.nights > 1 ? 's' : ''}
            </span>
            <span>£{pricing.nightsTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cleaning fee</span>
            <span>£{pricing.cleaningFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Service fee (5%)</span>
            <span>£{pricing.guestServiceFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-1 mt-1">
            <span>Total</span>
            <span>£{pricing.total.toFixed(2)}</span>
          </div>
        </div>
      )}

      {canBook && step === 'pick-dates' && (
        <button
          type="button"
          onClick={() => setStep('details')}
          className="bg-blue-700 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-800"
        >
          Continue
        </button>
      )}

      {canBook && (step === 'details' || step === 'redirecting') && (
        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="Jane Smith"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={guestEmail}
              onChange={(e) => setGuestEmail(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="jane@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (optional)</label>
            <input
              type="tel"
              value={guestPhone}
              onChange={(e) => setGuestPhone(e.target.value)}
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="+44 7..."
            />
          </div>

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <div className="flex flex-wrap gap-3 pt-1">
            <button
              type="button"
              disabled={step === 'redirecting'}
              onClick={() => startCheckout('stripe')}
              className="bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-800 disabled:opacity-50"
            >
              {step === 'redirecting' && payingWith === 'stripe' ? 'Redirecting…' : 'Pay with card'}
            </button>
            <button
              type="button"
              disabled={step === 'redirecting'}
              onClick={() => startCheckout('paypal')}
              className="bg-amber-400 text-blue-900 px-5 py-2.5 rounded-lg font-medium hover:bg-amber-300 disabled:opacity-50"
            >
              {step === 'redirecting' && payingWith === 'paypal' ? 'Redirecting…' : 'Pay with PayPal'}
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-gray-400 mt-4">
        The full address, check-in details, and access codes will be shared once your booking is confirmed.
      </p>
    </div>
  )
}
