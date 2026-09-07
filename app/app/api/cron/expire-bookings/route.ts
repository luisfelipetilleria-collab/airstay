import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { HOLD_MINUTES } from '@/lib/availability'

// Housekeeping only — dates already stop counting as "held" after
// HOLD_MINUTES (see lib/availability.ts), so this doesn't change what guests
// can book. It just tidies up abandoned checkouts so they don't sit around
// forever as "pending_payment" in the bookings table/admin views.
// Wired up in vercel.json to run automatically every 15 minutes.
export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createAdminClient()
  const cutoff = new Date(Date.now() - HOLD_MINUTES * 60 * 1000).toISOString()

  const { data, error } = await supabase
    .from('bookings')
    .update({ status: 'expired' })
    .eq('status', 'pending_payment')
    .lt('created_at', cutoff)
    .select('id')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ expired: data?.length ?? 0 })
}
