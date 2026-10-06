import LegalPage from '@/components/LegalPage'
import { COMPANY } from '@/lib/company'

export const metadata = { title: 'Privacy Policy | Airstay' }

export default function PrivacyPage() {
  return (
    <LegalPage title="Privacy Policy">
      <p>
        This policy explains what personal information {COMPANY.tradingName} collects, why we collect it,
        who we share it with and your rights. We follow the UK General Data Protection Regulation (UK GDPR)
        and the Data Protection Act 2018.
      </p>

      <h2>1. Who we are</h2>
      <p>
        The data controller is {COMPANY.legalName} (trading as {COMPANY.tradingName}), company number{' '}
        {COMPANY.companyNumber}, registered office: {COMPANY.registeredAddress}. For any privacy question,
        email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>
          <strong>Guests:</strong> your name, email address and phone number (if given), your booking
          details (listing, dates, number of guests, prices) and payment status.
        </li>
        <li>
          <strong>Hosts:</strong> your name, email address, phone or WhatsApp number, your listings and
          the information needed to pay you.
        </li>
        <li>
          <strong>Messages:</strong> anything you send us by email or WhatsApp.
        </li>
        <li>
          <strong>Technical data:</strong> basic information our hosting provider records automatically
          when you visit the site, such as your IP address and browser type, used for security and to
          keep the site working.
        </li>
      </ul>
      <p>
        We do <strong>not</strong> receive or store your card details. Card payments are handled by Stripe
        and PayPal payments by PayPal, on their own secure pages.
      </p>

      <h2>3. Why we use it (and our legal basis)</h2>
      <ul>
        <li>
          To take and manage your booking, take payment, send your confirmation and put you in touch with
          your host: <em>to perform our contract with you</em>.
        </li>
        <li>
          To keep accounting and tax records: <em>legal obligation</em>.
        </li>
        <li>
          To prevent fraud, keep the site secure and deal with complaints or disputes:{' '}
          <em>our legitimate interests</em>.
        </li>
      </ul>
      <p>We do not sell your data and we do not send marketing emails unless you have asked us to.</p>

      <h2>4. Who we share it with</h2>
      <ul>
        <li>
          <strong>Your host</strong>, who receives your name, email, phone number and booking details so
          they can prepare for and manage your stay. A host receives a guest&apos;s details only once a
          booking is confirmed.
        </li>
        <li>
          <strong>Service providers</strong> who process data on our behalf: Supabase (database, servers in
          Ireland), Vercel (website hosting), Stripe and PayPal (payments), and Resend (sending booking
          emails, servers in Ireland).
        </li>
        <li>
          <strong>Authorities</strong>, where we are legally required to, for example HMRC or the police.
        </li>
      </ul>
      <p>
        Some of these providers may process data outside the UK (for example in the USA). Where this
        happens, it is protected by safeguards approved under UK law, such as the UK International Data
        Transfer Addendum or the UK–US data bridge.
      </p>

      <h2>5. How long we keep it</h2>
      <p>
        We keep booking and payment records for 6 years after the end of the tax year they relate to,
        because UK tax law requires it. Other information, such as messages, is kept for as long as it
        is needed to deal with your booking or any question or complaint, and then deleted.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We only use cookies that are strictly necessary for the website to work. We do not use
        advertising or tracking cookies. Stripe and PayPal may set their own cookies on their payment
        pages to process payments securely and prevent fraud.
      </p>

      <h2>7. Your rights</h2>
      <p>You have the right to:</p>
      <ul>
        <li>ask for a copy of the personal data we hold about you;</li>
        <li>ask us to correct anything that is wrong;</li>
        <li>ask us to delete your data, where we do not need to keep it by law;</li>
        <li>object to or ask us to restrict how we use your data; and</li>
        <li>ask us to transfer your data to you or another organisation.</li>
      </ul>
      <p>
        To use any of these rights, email <a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a>. We will
        reply within one month. If you are not happy with how we have handled your data, you can
        complain to the Information Commissioner&apos;s Office (ICO) at{' '}
        <a href="https://ico.org.uk">ico.org.uk</a> or on 0303 123 1113.
      </p>

      <h2>8. Keeping your data safe</h2>
      <p>
        Your data is stored with reputable providers using encryption in transit, and access is limited
        to the people who need it to run Airstay.
      </p>

      <h2>9. Changes</h2>
      <p>We may update this policy from time to time. The latest version will always be on this page.</p>
    </LegalPage>
  )
}
