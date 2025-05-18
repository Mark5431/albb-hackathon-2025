"use client"
import Link from 'next/link'
import { useState } from 'react'

const countries = [
  { code: 'MY', name: 'Malaysia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'US', name: 'United States' },
]

const businessTypes = [
  'Graphic Designer',
  'Consultant',
  'Software Developer',
  'Writer',
  'Other',
]

export default function Register() {
  const [step, setStep] = useState(1)
  const [profile, setProfile] = useState({ name: '', email: '', country: '', businessType: '' })

  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    // Save name to localStorage for dashboard greeting
    if (typeof window !== 'undefined') {
      localStorage.setItem('expensewise_name', profile.name || 'Freelancer');
    }
    setStep(2)
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4">
      <header className="flex items-center gap-2 mb-8">
        <span className="icon text-3xl" role="img" aria-label="logo">🧾</span>
        <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>ExpenseWise</span>
      </header>
      <main className="w-full max-w-xl">
        <div className="bg-white card shadow-lg rounded-xl p-8 mx-auto">
          {step === 1 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-2xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Setup Your Profile</h2>
              <p className="mb-6 text-gray-500">This information helps us tailor tax rules and expense categorization for you.</p>
              <label className="block mb-1 font-semibold" htmlFor="name">Full Name</label>
              <input
                className="w-full mb-4 p-2 bg-gray-100 border border-gray-200 rounded"
                type="text"
                name="name"
                id="name"
                placeholder="e.g., Sarah Miller"
                value={profile.name}
                onChange={handleChange}
                required
              />
              <label className="block mb-1 font-semibold" htmlFor="email">Email (Optional)</label>
              <input
                className="w-full mb-4 p-2 bg-gray-100 border border-gray-200 rounded"
                type="email"
                name="email"
                id="email"
                placeholder="e.g., sarah@example.com"
                value={profile.email}
                onChange={handleChange}
              />
              <label className="block mb-1 font-semibold" htmlFor="country">Country of Residence</label>
              <select
                className="w-full mb-4 p-2 bg-gray-100 border border-gray-200 rounded"
                name="country"
                id="country"
                value={profile.country}
                onChange={handleChange}
                required
              >
                <option value="">Select your country</option>
                {countries.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
              <label className="block mb-1 font-semibold" htmlFor="businessType">Primary Business Type</label>
              <select
                className="w-full mb-6 p-2 bg-gray-100 border border-gray-200 rounded"
                name="businessType"
                id="businessType"
                value={profile.businessType}
                onChange={handleChange}
                required
              >
                <option value="">Select your business type</option>
                {businessTypes.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <button className="button-primary w-full text-lg" type="submit">Save Profile & Continue</button>
              <div className="mt-4 text-sm text-center text-gray-500">
                Already have an account? <Link href="/login" className="text-blue-500 underline">Log in</Link>
              </div>
            </form>
          )}
          {step === 2 && (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Welcome, {profile.name || 'Freelancer'}!</h2>
              <p className="mb-4">Profile setup complete.</p>
              <Link href="/dashboard" className="button-primary inline-block">Go to Dashboard</Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
