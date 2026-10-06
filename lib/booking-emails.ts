import { createAdminClient } from '@/lib/supabase/admin'
import { nightsBetween } from '@/lib/pricing'
import { sendEmail, escapeHtml } from '@/lib/email'

// Sends the "booking confirmed" emails: one to the guest (with the full
// address), one to the host, and a copy to the Airstay admin (ADMIN_EMAIL).
// Call this ONLY right after a booking has switched to "confirmed", so each
// booking gets its emails once. Never throws.

const WHATSAPP_DISPLAY = '07593 765972'
const WHATSAPP_LINK = 'https://wa.me/447593765972'

function money(n: unknown) {
  return `£${(Number(n) || 0).toFixed(2)}`
}

function prettyDate(iso: string) {
  return new Date(iso + 'T12:00:00Z').toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  })
}

function layout(title: string, body: string) {
  return `<!doctype html>
<html><body style="margin:0;padding:0;background:#f3f4f6;font-family:Arial,Helvetica,sans-serif;color:#111827;">
  <div style="max-width:560px;margin:0 auto;padding:24px 16px;">
    <div style="background:#1d4ed8;color:#ffffff;padding:18px 24px;border-radius:12px 12px 0 0;">
      <div style="font-size:22px;font-weight:bold;">Airstay</div>
      <div style="font-size:13px;opacity:.85;">Living for Travelling</div>
    </div>
    <div style="background:#ffffff;padding:24px;border-radius:0 0 12px 12px;">
      <h1 style="font-size:20px;margin:0 0 16px;">${title}</h1>
      ${body}
    </div>
    <p style="font-size:12px;color:#6b7280;text-align:center;margin-top:16px;">
      Airstay · airstay.uk · WhatsApp <a href="${WHATSAPP_LINK}" style="color:#6b7280;">${WHATSAPP_DISPLAY}</a>
    </p>
  </div>
</body></html>`
}

function row(label: string, value: string, bold = false) {
  const w = bold ? 'font-weight:bold;' : ''
  return `<tr>
    <td style="padding:6px 0;color:#4b5563;${w}">${label}</td>
    <td style="padding:6px 0;text-align:right;${w}">${value}</td>
  </tr>`
}

export async function sendBookingConfirmationEmails(bookingId: string): Promise<void> {
  try {
    const supabase = createAdminClient()

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('*, guests(name, email, phone)')
      .eq('id', bookingId)
      .single()
    if (bookingError || !booking) {
      console.error('Confirmation email: booking not found', bookingId, bookingError?.message)
      return
    }

    const { data: listing } = await supabase
      .from('listings')
      .select('id, title, listing_type, address_line, postcode, host_id')
      .eq('id', booking.listing_id)
      .single()

    const { data: host } = listing?.host_id
      ? await supabase.from('hosts').select('*').eq('id', listing.host_id).maybeSingle()
      : { data: null as any }

    const guest = (booking as any).guests || {}
    const nights = nightsBetween(booking.check_in, booking.check_out)
    const guestsCount = Number(booking.guests) || 1
    const ref = String(booking.id).slice(0, 8).toUpperCase()
    const fullAddress = [listing?.address_line, listing?.postcode].filter(Boolean).join(', ')
    const listingTitle = listing?.title || 'your Airstay booking'
    const hostName = host?.name || 'your host'
    const hostEmail: string | undefined = host?.email || undefined
    const hostPhone: string | undefined = host?.whatsapp || host?.phone || undefined
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://airstay.uk'

    const stayRows =
      row('Booking reference', escapeHtml(ref)) +
      row('Check-in', escapeHtml(prettyDate(booking.check_in))) +
      row('Check-out', `${escapeHtml(prettyDate(booking.check_out))} (by 10:30am)`) +
      row('Nights', String(nights)) +
      row('Guests', String(guestsCount))

    // ---------- Guest email ----------
    if (guest.email) {
      const guestBody = `
        <p>Hi ${escapeHtml(guest.name || 'there')},</p>
        <p>Great news: your payment was received and your stay is <strong>confirmed</strong>.</p>
        <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:14px 16px;margin:16px 0;">
          <div style="font-size:13px;color:#1d4ed8;font-weight:bold;margin-bottom:4px;">YOUR STAY</div>
          <div style="font-weight:bold;">${escapeHtml(listingTitle)}</div>
          <div style="margin-top:6px;">📍 ${escapeHtml(fullAddress)}</div>
          <div style="margin-top:4px;font-size:13px;color:#4b5563;">Hosted by ${escapeHtml(hostName)}</div>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">${stayRows}</table>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${row('Accommodation', money(booking.nightly_total))}
          ${row('Cleaning fee', money(booking.cleaning_fee))}
          ${row('Service fee', money(booking.guest_service_fee))}
          ${row('Total paid', money(booking.total_price), true)}
        </table>
        <p style="margin-top:20px;">Your host will be in touch before arrival with check-in instructions and access details.
        If you have any questions, just reply to this email or message us on WhatsApp at
        <a href="${WHATSAPP_LINK}">${WHATSAPP_DISPLAY}</a>.</p>
        <p>We hope you enjoy your stay!<br>The Airstay team</p>
        <p style="font-size:12px;color:#6b7280;"><a href="${siteUrl}/listing/${escapeHtml(listing?.id || '')}">View the listing</a></p>`

      await sendEmail({
        to: guest.email,
        subject: `Booking confirmed: ${listingTitle} (${ref})`,
        html: layout('Your booking is confirmed 🎉', guestBody),
        replyTo: process.env.ADMIN_EMAIL || undefined,
      })
    }

    // ---------- Host email (+ copy to admin) ----------
    const hostPayout =
      (Number(booking.nightly_total) || 0) +
      (Number(booking.cleaning_fee) || 0) -
      (Number(booking.host_service_fee) || 0)

    const hostBody = `
      <p>Hi ${escapeHtml(hostName)},</p>
      <p>You have a new <strong>confirmed and paid</strong> booking.</p>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:14px 16px;margin:16px 0;">
        <div style="font-weight:bold;">${escapeHtml(listingTitle)}</div>
        <div style="margin-top:4px;font-size:13px;color:#4b5563;">${escapeHtml(fullAddress)}</div>
      </div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">${stayRows}</table>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
      <div style="font-size:13px;color:#1d4ed8;font-weight:bold;margin-bottom:4px;">GUEST</div>
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${row('Name', escapeHtml(guest.name || '—'))}
        ${row('Email', escapeHtml(guest.email || '—'))}
        ${row('Phone', escapeHtml(guest.phone || '—'))}
      </table>
      <hr style="border:none;border-top:1px solid #e5e7eb;margin:16px 0;">
      <table style="width:100%;border-collapse:collapse;font-size:14px;">
        ${row('Accommodation', money(booking.nightly_total))}
        ${row('Cleaning fee', money(booking.cleaning_fee))}
        ${row('Airstay host fee (5%)', '−' + money(booking.host_service_fee))}
        ${row('Your payout', money(hostPayout), true)}
      </table>
      <p style="margin-top:20px;">Please contact your guest before arrival with check-in instructions and access details.</p>
      <p>Thanks for hosting with Airstay!</p>`

    const hostHtml = layout('New booking confirmed', hostBody)
    const hostSubject = `New booking: ${listingTitle}, ${prettyDate(booking.check_in)} (${ref})`

    if (hostEmail) {
      await sendEmail({ to: hostEmail, subject: hostSubject, html: hostHtml, replyTo: guest.email || undefined })
    } else {
      console.warn('Confirmation email: host has no email address', listing?.host_id)
    }

    if (process.env.ADMIN_EMAIL) {
      const adminNote = `<p style="background:#fef3c7;padding:8px 12px;border-radius:6px;font-size:13px;">
        Admin copy. Host: ${escapeHtml(hostName)} (${escapeHtml(hostEmail || 'no email')}, ${escapeHtml(hostPhone || 'no phone')})</p>`
      await sendEmail({
        to: process.env.ADMIN_EMAIL,
        subject: `[Admin] ${hostSubject}`,
        html: layout('New booking confirmed', adminNote + hostBody),
      })
    }
  } catch (err: any) {
    console.error('Confirmation emails failed for booking', bookingId, err?.message)
  }
}
