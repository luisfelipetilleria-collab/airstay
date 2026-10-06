import LegalPage from '@/components/LegalPage'
import { COMPANY } from '@/lib/company'

export const metadata = { title: 'Cancellation Policy | Airstay' }

export default function CancellationPolicyPage() {
  return (
    <LegalPage title="Cancellation Policy">
      <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-amber-900">
        <strong>All Airstay bookings are non-refundable.</strong> Once your payment is confirmed, the
        amount you paid will not be refunded if you cancel, change your dates, arrive late, leave early
        or do not turn up. Please check your dates, the number of guests and the listing details
        carefully before you pay.
      </div>

      <h2>1. Why bookings are non-refundable</h2>
      <p>
        Our prices are kept low because each booking reserves a room or bed for specific nights that the
        host cannot then offer to anyone else. Under the Consumer Contracts (Information, Cancellation
        and Additional Charges) Regulations 2013, the usual 14-day &ldquo;cooling-off&rdquo; period does
        not apply to accommodation booked for specific dates.
      </p>

      <h2>2. If you cancel</h2>
      <ul>
        <li>No refund is due for the accommodation, the cleaning fee or the Airstay service fee.</li>
        <li>
          Please still tell us as soon as possible at <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>{' '}
          or on WhatsApp (<a href={COMPANY.whatsappLink}>{COMPANY.whatsapp}</a>) so the host knows not to
          expect you.
        </li>
        <li>
          In exceptional circumstances we may, at our discretion, offer a partial refund or a change of
          dates if the host is able to re-book the nights. Any such goodwill refund covers the
          accommodation and cleaning fee only; the Airstay service fee is not refunded.
        </li>
      </ul>

      <h2>3. If the host or Airstay cancels</h2>
      <p>
        If your booking is cancelled by the host or by us, or the accommodation is not available when you
        arrive, you will receive a <strong>full refund of everything you paid</strong>, including the
        Airstay service fee. Where we can, we will also try to help you find similar alternative
        accommodation.
      </p>

      <h2>4. If something is wrong with your stay</h2>
      <p>
        If the accommodation is significantly different from the listing, or there is a serious problem
        (for example, no access, no working heating or hot water, or a safety issue), contact us straight
        away so we and the host have a chance to put it right. If it cannot be fixed, we will look at an
        appropriate full or partial refund. These rights are in addition to your statutory rights as a
        consumer, which this policy does not affect.
      </p>

      <h2>5. Refunds</h2>
      <p>
        Any refund is made to the original payment method (card or PayPal), normally within 5–10 working
        days of being approved.
      </p>

      <h2>6. Contact</h2>
      <p>
        {COMPANY.legalName}, trading as {COMPANY.tradingName}. Email{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or WhatsApp{' '}
        <a href={COMPANY.whatsappLink}>{COMPANY.whatsapp}</a>.
      </p>
    </LegalPage>
  )
}
