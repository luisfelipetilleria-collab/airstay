import './globals.css'
import type { Metadata } from 'next'
import { COMPANY } from '@/lib/company'

export const metadata: Metadata = {
  title: 'Airstay | Living for Travelling',
  description: 'Short-term rooms and beds across London.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-gray-900">
        <header className="border-b px-6 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-blue-700">Airstay</span>
          <nav className="text-sm space-x-4">
            <a href="/">Browse</a>
            <a href="/login">Log in</a>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="border-t mt-12 px-6 py-8 text-sm text-gray-500">
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <nav className="flex flex-wrap gap-x-5 gap-y-2">
              <a href="/terms" className="hover:text-gray-800">Terms</a>
              <a href="/privacy" className="hover:text-gray-800">Privacy</a>
              <a href="/cancellation-policy" className="hover:text-gray-800">Cancellation policy</a>
              <a href={`mailto:${COMPANY.email}`} className="hover:text-gray-800">{COMPANY.email}</a>
            </nav>
            <p className="text-xs text-gray-400">
              © {new Date().getFullYear()} {COMPANY.tradingName} · {COMPANY.legalName}
            </p>
          </div>
        </footer>
      </body>
    </html>
  )
}
