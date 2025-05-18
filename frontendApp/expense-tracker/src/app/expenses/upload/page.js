"use client"
import React, { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function UploadReceipt() {
  const [file, setFile] = useState(null)
  const [dragActive, setDragActive] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [result, setResult] = useState(null)
  const inputRef = useRef()

  // Get user name from localStorage (set at register)
  const [userName, setUserName] = useState('Freelancer');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('expensewise_name');
      if (stored) setUserName(stored);
    }
  }, []);

  // Sidebar navigation
  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: '📋' },
    { label: 'Upload Receipt', href: '/expenses/upload', icon: '➕' },
    { label: 'Tax Reports', href: '/tax-report', icon: '📄' },
    { label: 'My Profile', href: '/profile', icon: '👤' },
  ]

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  }
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }
  const handleChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  }
  const handleClick = () => inputRef.current.click();

  // Upload and categorize
  const handleCategorize = async () => {
    if (!file) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const apiKey = "sk-5b8d998434524363936311d878c90a4a";
      const formData = new FormData();
      formData.append('file', file);
      formData.append('api_key', apiKey);
      const res = await fetch('http://localhost:8000/api/receipt/extract', {
        method: 'POST', body: formData,
      });
      if (!res.ok) throw new Error('Extraction failed');
      setResult(await res.json());
    } catch (err) {
      setError('Failed to extract receipt data. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-[#F5F7FA]">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r flex flex-col justify-between py-6 px-4 min-h-screen">
        <div>
          <div className="flex items-center gap-2 mb-10">
            <span className="icon text-3xl" role="img" aria-label="logo">🧾</span>
            <span className="text-2xl font-bold" style={{ color: 'var(--primary)' }}>ExpenseWise</span>
          </div>
          <nav className="flex flex-col gap-2">
            {navItems.map(item => (
              <Link key={item.label} href={item.href} className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium ${item.label === 'Upload Receipt' ? 'bg-blue-50 text-blue-600' : ''}`}>
                <span className="text-xl">{item.icon}</span> {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border text-gray-500 hover:bg-gray-100 mt-8">
          <span className="text-lg">↩️</span> Logout
        </button>
      </aside>
      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Top Bar */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Welcome, {userName}!</h2>
          <div className="bg-blue-100 rounded-full p-2">
            <span className="text-xl text-blue-400">🔍</span>
          </div>
        </div>
        {/* Upload Card */}
        <div className="bg-white rounded-xl shadow p-8 max-w-3xl mx-auto mb-6">
          <h2 className="text-2xl font-bold mb-1">Upload Your Receipt</h2>
          <div className="text-gray-500 mb-6">Let our AI categorize your expense. Your profile: MY / software_developer.</div>
          <div className="mb-2 font-semibold">Upload Receipt</div>
          <div
            className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center py-12 mb-4 cursor-pointer transition ${dragActive ? 'border-blue-400 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}
            onClick={handleClick}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            style={{ minHeight: 140 }}
          >
            <input
              ref={inputRef}
              type="file"
              accept="image/*,application/pdf"
              className="hidden"
              onChange={handleChange}
            />
            <div className="flex flex-col items-center">
              <span className="text-5xl text-gray-400 mb-2">⤴️</span>
              <span className="text-blue-400 font-semibold underline cursor-pointer">Upload a file</span> or drag and drop
              <div className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP, PDF up to 5MB</div>
            </div>
            {file && <div className="mt-2 text-sm text-gray-700">Selected: {file.name}</div>}
          </div>
          <div className="text-xs text-gray-400 mb-4">Supported formats: PNG, JPG, WEBP. Max file size: 5MB.</div>
          <button
            className="w-full py-3 rounded bg-[#64B5F6] text-white font-bold text-lg shadow hover:bg-blue-400 transition"
            onClick={handleCategorize}
            disabled={!file || loading}
          >
            {loading ? 'Categorizing...' : 'Categorize Expense'}
          </button>
          {error && <div className="mt-4 text-red-500 text-center">{error}</div>}
          {result && (
            <div className="mt-6 bg-green-50 border border-green-200 rounded p-4">
              <div className="font-semibold mb-2">Extracted Expense</div>
              <div><b>Vendor:</b> {result.vendor}</div>
              <div><b>Amount:</b> {result.amount} {result.currency ? <span>({result.currency})</span> : null}</div>
              <div><b>Date:</b> {result.date}</div>
              <div><b>Category:</b> {result.category}</div>
              {typeof result.deductible !== 'undefined' && (
                <div><b>Deductible:</b> {result.deductible}%</div>
              )}
            </div>
          )}
        </div>
        {/* How It Works */}
        <div className="bg-blue-50 border border-blue-200 rounded p-6 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold"><span>ℹ️</span> How It Works</div>
          <ol className="list-decimal list-inside text-sm text-blue-900">
            <li>Upload a clear image or PDF of your receipt.</li>
            <li>Our AI extracts details like vendor, amount, and date.</li>
            <li>The expense is categorized based on your profile (country: MY, business type: software_developer).</li>
            <li>We suggest a tax-deductible percentage. Always verify with a tax professional.</li>
          </ol>
        </div>
      </main>
    </div>
  )
}
