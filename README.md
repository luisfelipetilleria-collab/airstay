# Airstay — Getting Started

This is the starting skeleton of your site: home page, listing page, and a
database schema matching your hosts/guests/listings.

## Step 1 — Set up the database

1. Go to your Supabase project: https://supabase.com/dashboard
2. Open **SQL Editor** → **New query**
3. Paste in the contents of `supabase/schema.sql`, click **Run**
4. Open a new query, paste in `supabase/seed.sql`, click **Run**
   - This creates your 3 demo hosts, 3 demo guests, and all listings
     (Presi's studios, Mila's rooms + beds, Lucho's rooms + beds)

## Step 2 — Push this code to GitHub

1. Create a new empty repository on GitHub called `airstay`
2. In a terminal (or Termius), inside this project folder, run:
   ```
   git init
   git add .
   git commit -m "Initial Airstay skeleton"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/airstay.git
   git push -u origin main
   ```

## Step 3 — Connect to Vercel

1. Go to https://vercel.com/new
2. Import the `airstay` GitHub repo
3. Before deploying, add these Environment Variables (from `.env.local.example`):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Click **Deploy**

## Step 4 — Point your domain

Once deployed, in Vercel go to your project → **Settings** → **Domains**,
add `airstay.uk`, and follow Vercel's instructions to update the DNS
records in Namecheap.

## Local development (optional, if you want to preview before deploying)

```
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```
Then open http://localhost:3000

## What's built so far
- Home page showing all active listings, pulled live from Supabase
- Individual listing detail pages
- Database schema: users, listings, availability, bookings, payments, reviews

## What's next
- Booking flow (date picker + Stripe/PayPal checkout)
- Host dashboard
- Guest dashboard
- Admin panel
- Sign up / login (WhatsApp-based host signup)
