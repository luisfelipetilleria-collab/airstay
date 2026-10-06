import LegalPage from '@/components/LegalPage'
import { COMPANY } from '@/lib/company'

export const metadata = { title: 'Terms and Conditions | Airstay' }

export default function TermsPage() {
  return (
    <LegalPage title="Terms and Conditions">
      <p>
        These terms apply when you use {COMPANY.website} or book a stay through {COMPANY.tradingName}.
        Please read them, together with our <a href="/cancellation-policy">Cancellation Policy</a> and{' '}
        <a href="/privacy">Privacy Policy</a>, before you book. By making a booking you agree to them.
      </p>

      <h2>1. About us</h2>
      <p>
        {COMPANY.tradingName} is a trading name of {COMPANY.legalName}, a company registered in England and
        Wales (company number {COMPANY.companyNumber}), registered office: {COMPANY.registeredAddress}.
        Contact: <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a> or WhatsApp{' '}
        <a href={COMPANY.whatsappLink}>{COMPANY.whatsapp}</a>.
      </p>

      <h2>2. How Airstay works</h2>
      <p>
        Airstay is an online platform that lets independent hosts list rooms, studios and beds for
        short stays, and lets guests book and pay for them. Unless a listing says otherwise, the
        accommodation is provided by the host named on the listing, and your stay is an agreement
        between you and that host. Airstay manages the listing, the booking and the payment on the
        host&apos;s behalf.
      </p>

      <h2>3. Booking and payment</h2>
      <ul>
        <li>You must be at least 18 years old to make a booking.</li>
        <li>
          The price shown before you pay includes the nightly rate (with any extra-guest charge), the
          cleaning fee and a 5% Airstay service fee. There are no hidden charges.
        </li>
        <li>
          Payment is taken in full at the time of booking by card (processed by Stripe) or PayPal. We
          never see or store your full card details.
        </li>
        <li>
          Your booking is confirmed only when payment has been received and you get a confirmation
          email. The full address and check-in details are shared after confirmation.
        </li>
        <li>
          Please make sure your contact details are correct, as we and the host will use them to send
          you important information about your stay.
        </li>
      </ul>

      <h2>4. Cancellations and refunds</h2>
      <p>
        All bookings are <strong>non-refundable</strong>. Full details, including what happens if the host
        cancels or there is a serious problem with your stay, are in our{' '}
        <a href="/cancellation-policy">Cancellation Policy</a>.
      </p>

      <h2>5. Your stay</h2>
      <ul>
        <li>
          Check-out is by <strong>10:30am</strong> on your departure day unless the host agrees otherwise.
          Your host will send check-in times and access instructions before you arrive.
        </li>
        <li>
          Only the number of guests you booked and paid for may stay. Each listing shows its maximum
          number of guests.
        </li>
        <li>
          Some listings are <strong>female only</strong>. Only women may book or stay in those listings, and
          the host may ask for reasonable confirmation of this.
        </li>
        <li>
          Shared rooms and shared houses are homes shared with other people. Please be respectful,
          keep noise down (especially at night), keep shared areas clean, and follow any house rules
          your host gives you.
        </li>
        <li>
          Smoking, illegal drugs, parties, events and extra unregistered visitors are not allowed unless
          the listing clearly says otherwise.
        </li>
        <li>
          The host may ask to see photo ID on arrival so they know who is staying in their property.
        </li>
      </ul>
      <p>
        If you seriously or repeatedly break these rules, the host or Airstay may end your stay early.
        In that case no refund is due for unused nights.
      </p>

      <h2>6. Damage and loss</h2>
      <p>
        You are responsible for any damage you, or anyone staying with you, cause to the property
        beyond normal wear and tear, and for any lost keys or access cards. We or the host will contact
        you with details and evidence of any costs before asking you to pay them.
      </p>

      <h2>7. Listings</h2>
      <p>
        Hosts are responsible for making sure their listings are accurate and that their property is
        safe and legally allowed to be let for short stays. We check listings in good faith, but photos
        and descriptions are a guide and small differences may occur. If something is significantly
        different from the listing, please contact us straight away.
      </p>

      <h2>8. Our responsibility to you</h2>
      <p>
        We will provide our booking service with reasonable care and skill. We are not responsible for
        losses that were not foreseeable, for problems caused by events outside our reasonable control,
        or for losses caused by your own actions. Nothing in these terms limits our liability for death
        or personal injury caused by our negligence, for fraud, or for anything else that cannot be
        limited by law, and nothing affects your statutory rights as a consumer.
      </p>

      <h2>9. Information for hosts</h2>
      <ul>
        <li>
          Airstay charges hosts a 5% service fee on the accommodation and cleaning amount of each
          confirmed booking. The remaining amount is paid out to the host.
        </li>
        <li>
          Hosts must keep their calendar, prices and listing details up to date, honour confirmed
          bookings, and have any permissions required to let their property (for example from a landlord,
          freeholder, mortgage lender or insurer, and in London the 90-night yearly limit for short lets
          of whole homes where it applies).
        </li>
        <li>
          If a host cancels a confirmed booking, the guest receives a full refund and Airstay may
          suspend or remove the host&apos;s listings.
        </li>
      </ul>

      <h2>10. Complaints</h2>
      <p>
        If you are unhappy with anything, please contact us at{' '}
        <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. We aim to reply within 2 working days and to
        resolve complaints as quickly as possible.
      </p>

      <h2>11. Changes to these terms</h2>
      <p>
        We may update these terms from time to time. The version shown on this page when you make your
        booking is the one that applies to that booking.
      </p>

      <h2>12. Law</h2>
      <p>
        These terms are governed by the law of England and Wales. If you live in Scotland or Northern
        Ireland you may also bring proceedings in your local courts.
      </p>
    </LegalPage>
  )
}
