// Minimal PayPal REST client — just what's needed to create and capture an
// order. No SDK dependency; PayPal's REST API is plain JSON over fetch.
//
// Set PAYPAL_ENV=sandbox while testing, PAYPAL_ENV=live once real payments
// are ready to flow to the receiving PayPal account.

function paypalBaseUrl() {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com'
}

export async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.PAYPAL_CLIENT_ID
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET
  if (!clientId || !clientSecret) {
    throw new Error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET are not set')
  }

  const res = await fetch(`${paypalBaseUrl()}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: 'grant_type=client_credentials',
  })

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status} ${await res.text()}`)
  }

  const data = await res.json()
  return data.access_token as string
}

export async function createPayPalOrder(opts: {
  accessToken: string
  amount: number
  description: string
  returnUrl: string
  cancelUrl: string
}) {
  const res = await fetch(`${paypalBaseUrl()}/v2/checkout/orders`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${opts.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: { currency_code: 'GBP', value: opts.amount.toFixed(2) },
          description: opts.description,
        },
      ],
      application_context: {
        brand_name: 'Airstay',
        user_action: 'PAY_NOW',
        return_url: opts.returnUrl,
        cancel_url: opts.cancelUrl,
      },
    }),
  })

  if (!res.ok) {
    throw new Error(`PayPal create order failed: ${res.status} ${await res.text()}`)
  }

  return res.json()
}

export async function capturePayPalOrder(opts: { accessToken: string; orderId: string }) {
  const res = await fetch(
    `${paypalBaseUrl()}/v2/checkout/orders/${opts.orderId}/capture`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${opts.accessToken}`,
        'Content-Type': 'application/json',
      },
    }
  )

  if (!res.ok) {
    throw new Error(`PayPal capture failed: ${res.status} ${await res.text()}`)
  }

  return res.json()
}
