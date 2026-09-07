// Works out the site's own base URL for building Stripe/PayPal redirect
// links. Uses NEXT_PUBLIC_SITE_URL when it's set (set this in Vercel to
// https://airstay.uk once the domain is live); otherwise falls back to
// whatever host the request actually came in on, so it also works from
// http://localhost:3000 during local development without any setup.
export function getSiteUrl(req: Request): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }
  return new URL(req.url).origin
}
