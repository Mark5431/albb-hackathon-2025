"use client"
import Link from 'next/link'

export default function Onboarding() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4">
      <header className="flex items-center gap-2 mb-8">
        <span className="icon text-3xl" role="img" aria-label="logo">🧾</span>
        <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>ExpenseWise</span>
      </header>
      <main className="flex flex-col items-center text-center">
        <h1 className="text-5xl sm:text-6xl font-extrabold mb-4" style={{ color: 'var(--foreground)' }}>
          Simplify Your <span style={{ color: 'var(--primary)' }}>Freelance<br className="hidden sm:block" /> Finances</span>
        </h1>
        <p className="text-lg text-gray-600 mb-8 max-w-xl">
          Track expenses, categorize with AI, and generate tax reports effortlessly. Focus on your craft, not your spreadsheets.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Link href="/register">
            <button className="button-primary text-lg px-8 py-3 shadow-md">Get Started Now <span className="ml-1">→</span></button>
          </Link>
          <Link href="/dashboard">
            <button className="bg-white border border-gray-200 text-lg px-8 py-3 rounded shadow-md hover:bg-gray-50">View Demo Dashboard</button>
          </Link>
        </div>
        <div className="text-xs text-gray-500 mt-8">
          Powered by Intelligent AI. Designed for Modern Freelancers.<br />
          <span className="block mt-1">Your data is handled responsibly. We prioritize your privacy and security.</span>
        </div>
      </main>
    </div>
  )
}
