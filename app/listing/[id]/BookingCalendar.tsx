'use client'

import { useMemo, useState } from 'react'

interface Props {
  pricePerNight: number
  cleaningFee: number
  blockedDates: string[]
}

export default function BookingCalendar({ pricePerNight, cleaningFee, blockedDates }: Props) {
  const [checkIn, setCheckIn] = useState<string | null>(null)
  const [checkOut, setCheckOut] = useState<string | null>(null)

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
    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(iso)
      setCheckOut(null)
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

  const nights = useMemo(() => {
    if (!checkIn || !checkOut) return 0
    const start = new Date(checkIn)
    const end = new Date(checkOut)
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
  }, [checkIn, checkOut])

  const nightsTotal = pricePerNight * nights
  const subtotal = nightsTotal + cleaningFee
  const platformFee = subtotal * 0.05
  const total = subtotal + platformFee

  function resetSelection() {
    setCheckIn(null)
    setCheckOut(null)
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

      {checkIn && checkOut && !rangeHasBlockedDate && nights > 0 && (
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
