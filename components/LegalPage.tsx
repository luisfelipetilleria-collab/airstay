import { COMPANY } from '@/lib/company'

// Shared layout for the Terms, Privacy and Cancellation pages.
export default function LegalPage({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="max-w-3xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-1">{title}</h1>
      <p className="text-sm text-gray-500 mb-8">Last updated: {COMPANY.lastUpdated}</p>
      <div className="text-gray-700 leading-relaxed space-y-4 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-2 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-1 [&_a]:text-blue-700 [&_a]:underline">
        {children}
      </div>
    </div>
  )
}
