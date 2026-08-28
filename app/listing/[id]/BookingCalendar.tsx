'use client'

import { useMemo, useState } from 'react'

interface Props {
  pricePerNight: number
  cleaningFee: number
  blockedDates: string[]
}

export default function BookingCalendar({ pricePerNight, cleaningFee, blockedDates }: Props) {
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [nights, setNights] = useState(1)

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
    return d.toISOString().split('T')[0]
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

  const rangeHasBlockedDate = useMemo(() => {
    if (!checkIn) return false
    const start = new Date(checkIn)
    for (let i = 0; i < nights; i++) {
      const d = new Date(start)
      d.setDate(start.getDate() + i)
      if (blockedSet.has(toISO(d))) return true
    }
    return false
  }, [checkIn, nights, blockedSet])

  const nightsTotal = pricePerNight * nights
  const subtotal = nightsTotal + cleaningFee
  const platformFee = subtotal * 0.05
  const total = subtotal + platformFee

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
                  const selected = checkIn === iso
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={blocked}
                      onClick={() => setCheckIn(iso)}
                      className={
                        'text-xs rounded p-1.5 ' +
                        (blocked
                          ? 'bg-gray-100 text-gray-300 cursor-not-allowed line-through'
                          : selected
                          ? 'bg-blue-700 text-white'
                          : 'bg-green-50 text-green-800 hover:bg-green-100')
                      }
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
        Green = available, grey/crossed-out = unavailable. Click a date to select check-in.
      </p>

      <div className="mb-4 text-sm text-gray-700">
        Check-in date: <span className="font-medium">{checkIn ?? 'Select a date above'}</span>
      </div>

      <div className="flex items-center gap-3 mb-4">
        <label htmlFor="nights" className="text-sm text-gray-600">
          Number of nights
        </label>
        <input
          id="nights"
          type="number"
          min={1}
          value={nights}
          onChange={(e) => setNights(Math.max(1, parseInt(e.target.value) || 1))}
          className="border rounded px-2 py-1 w-20"
        />
      </div>

      {checkIn && rangeHasBlockedDate && (
        <p className="text-red-600 text-sm mb-4">
          One or more nights in this range aren&apos;t available. Please choose different dates.
        </p>
      )}

      {checkIn && !rangeHasBlockedDate && (
        <div className="bg-gray-50 rounded-lg p-4 text-sm space-y-1">
          <div className="flex justify-between">
            <span>
              £{pricePerNight} x {nights} night{nights > 1 ? 's' : ''}
            </span>
            <span>£{nightsTotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Cleaning fee</span>
            <span>£{cleaningFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between">
            <span>Platform fee (5%)</span>
            <span>£{platformFee.toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold border-t pt-1 mt-1">
            <span>Total</span>
            <span>£{total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  )
}
