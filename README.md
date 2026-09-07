# Airstay — Getting Started

This is the site so far: home page, listing pages, and a full booking +
payment flow (Stripe card payments and PayPal), backed by Supabase.

## Step 1 — Set up the database

1. Go to your Supabase project: https://supabase.com/dashboard
2. Open **SQL Editor** → **New query**
3. Paste in the contents of `supabase/schema.sql`, click **Run** (skip if
   you've already run this before)
4. New query → paste in `supabase/seed.sql` → **Run** (skip if already run)
5. New query → paste in `supabase/booking_schema.sql` → **Run**
   - This adds the `bookings` table that the new booking/payment flow uses

## Step 2 — Environment variables

Copy `.env.local.example` to `.env.local` for local development, and add
the same names/values in Vercel → your project → **Settings** →
**Environment Variables** for the live site. See the comments in that file
for exactly where to find each value. At minimum, for booking + payments
you'll need to add (existing Supabase ones should already be set):

- `SUPABASE_SERVICE_ROLE_KEY` — Supabase → Settings → API
- `STRIPE_SECRET_KEY` — Stripe Dashboard → Developers → API keys
- `STRIPE_WEBHOOK_SECRET` — see Step 4 below
- `PAYPAL_CLIENT_ID` / `PAYPAL_CLIENT_SECRET` — developer.paypal.com → Apps & Credentials
- `PAYPAL_ENV` — `sandbox` while testing, `live` when ready for real money
- `CRON_SECRET` — any random string, protects the housekeeping endpoint

## Step 3 — Push this code to GitHub

In a terminal (or Termius), inside this project folder:
```
git add .
git commit -m "Add booking and payment flow"
git push
```
(If this is the very first push, see the previous version of this README
for the full `git init` / `git remote add` steps.)

## Step 4 — Turn on the Stripe webhook

Stripe needs a way to tell Airstay "the payment went through". After your
first deploy with this code:

1. Stripe Dashboard → **Developers** → **Webhooks** → **Add endpoint**
2. Endpoint URL: `https://airstay.uk/api/webhooks/stripe` (or your
   `*.vercel.app` URL if the domain isn't pointed yet)
3. Select event: `checkout.session.completed`
4. Copy the **Signing secret** it gives you into `STRIPE_WEBHOOK_SECRET` in
   Vercel, then redeploy

PayPal doesn't need this step — it confirms payment when the guest is
redirected back to the site.

## Step 5 — Test before going live

- Stripe: use [test card 4242 4242 4242 4242](https://docs.stripe.com/testing),
  any future expiry date, any CVC, while `STRIPE_SECRET_KEY` is a **test**
  key (starts with `sk_test_`)
- PayPal: set `PAYPAL_ENV=sandbox` and pay with a
  [sandbox buyer account](https://developer.paypal.com/dashboard/accounts)
- Once both work end-to-end, switch to live Stripe keys and `PAYPAL_ENV=live`

## Local development (optional)

```
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```
Then open http://localhost:3000. Stripe/PayPal redirects work locally too
(no need to set `NEXT_PUBLIC_SITE_URL` — it falls back to localhost
automatically). Stripe webhooks need the
[Stripe CLI](https://docs.stripe.com/stripe-cli) (`stripe listen --forward-to
localhost:3000/api/webhooks/stripe`) to reach your machine while testing
locally.

## What's built so far
- Home page showing all active listings, pulled live from Supabase
- Individual listing detail pages
- Booking calendar with live availability (manual host blocks + real bookings)
- Guest details form, price breakdown (nightly rate + cleaning fee + 5% service fee)
- Checkout via Stripe (card) or PayPal, each as a hosted redirect — no card
  details ever touch this site's own servers
- A booking only becomes "confirmed" once payment is actually verified
  (Stripe webhook / PayPal return), with a 20-minute hold on chosen dates
  while a guest is mid-checkout so two people can't pay for the same dates
- Database-level guarantee that two confirmed bookings can never overlap
- Automatic cleanup of abandoned/unpaid bookings (Vercel Cron, every 15 min)

## What's next
- Host dashboard (see upcoming bookings, block dates manually)
- Guest dashboard (see/manage their own bookings)
- Admin panel
- Sign up / login (WhatsApp-based host signup)
- Automated booking confirmation emails to guest + host
- Reviews
