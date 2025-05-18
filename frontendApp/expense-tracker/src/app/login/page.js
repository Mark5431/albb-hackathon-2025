"use client"
import Link from 'next/link'
import { useState } from 'react'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Dummy login logic
    if (!email || !password) {
      setError('Please enter your email and password.')
    } else {
      setError('')
      window.location.href = '/dashboard'
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4">
      <header className="flex items-center gap-2 mb-8">
        <span className="icon text-3xl" role="img" aria-label="logo">🧾</span>
        <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>ExpenseWise</span>
      </header>
      <main className="w-full max-w-xl">
        <div className="bg-white card shadow-lg rounded-xl p-8 mx-auto">
          <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Log In</h2>
          <p className="mb-6 text-gray-500">Access your dashboard and manage your freelance finances.</p>
          <form onSubmit={handleSubmit}>
            <label className="block mb-1 font-semibold" htmlFor="email">Email</label>
            <input
              className="w-full mb-4 p-2 bg-gray-100 border border-gray-200 rounded"
              type="email"
              name="email"
              id="email"
              placeholder="e.g., sarah@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <label className="block mb-1 font-semibold" htmlFor="password">Password</label>
            <input
              className="w-full mb-6 p-2 bg-gray-100 border border-gray-200 rounded"
              type="password"
              name="password"
              id="password"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            {error && <div className="mb-4 text-red-500 text-sm">{error}</div>}
            <button className="button-primary w-full text-lg" type="submit">Log In</button>
            <div className="mt-4 text-sm text-center text-gray-500">
              Don’t have an account? <Link href="/register" className="text-blue-500 underline">Sign up</Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}
