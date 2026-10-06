// Sends email through Resend (resend.com) using its REST API, so no extra
// package is needed. Requires RESEND_API_KEY and EMAIL_FROM in Vercel.
// Never throws — an email problem must never break a booking or payment.

interface SendEmailArgs {
  to: string | string[]
  subject: string
  html: string
  replyTo?: string
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailArgs): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY
  const from = process.env.EMAIL_FROM || 'Airstay <bookings@airstay.uk>'

  if (!apiKey) {
    console.warn('RESEND_API_KEY is not set — skipping email:', subject)
    return false
  }

  try {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: Array.isArray(to) ? to : [to],
        subject,
        html,
        ...(replyTo ? { reply_to: replyTo } : {}),
      }),
    })
    if (!res.ok) {
      console.error('Email send failed:', res.status, await res.text())
      return false
    }
    return true
  } catch (err: any) {
    console.error('Email send error:', err?.message)
    return false
  }
}

export function escapeHtml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
