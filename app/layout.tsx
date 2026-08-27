import './globals.css'
import type { Metadata } from 'next'

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
      </body>
    </html>
  )
}
