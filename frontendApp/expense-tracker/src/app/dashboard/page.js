"use client"
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { PieChart, Pie, Cell, Legend, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📋' },
  { label: 'Upload Receipt', href: '/expenses/upload', icon: '➕' },
  { label: 'Tax Reports', href: '/tax-report', icon: '📄' },
  { label: 'My Profile', href: '/profile', icon: '👤' },
]

const categoryColors = {
  'Software': '#60a5fa',
  'Travel': '#fbbf24',
  'Food & Beverage': '#34d399',
  'Meals & Entertainment': '#34d399',
  'Office Supplies': '#a78bfa',
  'Coworking Space': '#a78bfa',
  'Transport': '#f472b6',
  'Other': '#ddd',
}

function getPieChartData(receipts) {
  const totals = {}
  receipts.forEach(e => {
    const cat = e.category || 'Other'
    totals[cat] = (totals[cat] || 0) + (parseFloat(e.amount) || 0)
  })
  return Object.entries(totals).map(([cat, amt]) => ({ category: cat, amount: amt }))
}

function getMonthlyTrends(receipts) {
  // Get current year
  const now = new Date()
  const year = now.getFullYear()
  // Prepare all months
  const months = Array.from({ length: 12 }, (_, i) => {
    const m = (i + 1).toString().padStart(2, '0')
    return `${year}-${m}`
  })
  // Aggregate spending by month
  const totals = {}
  receipts.forEach(e => {
    if (!e.date) return
    const month = e.date.slice(0, 7)
    if (month.startsWith(year.toString())) {
      totals[month] = (totals[month] || 0) + (parseFloat(e.amount) || 0)
    }
  })
  // Build data for all months
  return months.map(month => ({ month, amount: totals[month] || 0 }))
}

export default function Dashboard() {
  // Try to get user name from localStorage (set at register)
  const [userName, setUserName] = useState('Freelancer');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('expensewise_name');
      if (stored) setUserName(stored);
    }
  }, []);

  const user = { name: 'qgega' }
  const [summary, setSummary] = useState({
    total_spent: 0,
    total_deductible: 0,
    num_reports: 0,
    budget_alerts: []
  })
  const [receipts, setReceipts] = useState([])
  useEffect(() => {
    fetch('http://localhost:8000/api/dashboard/summary')
      .then(res => res.json())
      .then(setSummary)
      .catch(() => {})
    fetch('http://localhost:8000/api/receipts')
      .then(res => res.json())
      .then(setReceipts)
      .catch(() => {})
  }, [])

  const pieData = getPieChartData(receipts)
  const total = pieData.reduce((s, e) => s + e.amount, 0)
  const monthlyData = getMonthlyTrends(receipts)

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
              <Link key={item.label} href={item.href} className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium">
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
        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <Link href="/expenses/upload" className="bg-[#64B5F6] text-white rounded-xl p-6 flex flex-col items-center shadow-md cursor-pointer transition-transform duration-200 hover:scale-105 hover:bg-[#42a5f5]">
            <div className="text-3xl mb-2">＋</div>
            <div className="font-bold text-lg mb-1">Upload New Receipt</div>
            <div className="text-sm opacity-90">Quickly add and categorize</div>
          </Link>
          <Link href="/tax-report" className="bg-white rounded-xl p-6 flex flex-col items-center shadow-md border cursor-pointer transition-transform duration-200 hover:scale-105 hover:bg-blue-50">
            <div className="text-2xl mb-2">📄</div>
            <div className="font-bold text-lg mb-1">Generate Tax Report</div>
            <div className="text-sm text-gray-500">Prepare for filing</div>
          </Link>
        </div>
        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-xl p-5 shadow border flex flex-col">
            <div className="text-gray-500 text-sm mb-1">Total Spent This Month</div>
            <div className="text-2xl font-bold text-blue-500">RM {summary.total_spent.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
            <div className="text-xs text-gray-400 mt-1">Across all categories</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow border flex flex-col">
            <div className="text-gray-500 text-sm mb-1">Potential Tax Deductibles</div>
            <div className="text-2xl font-bold text-green-600">RM {summary.total_deductible.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</div>
            <div className="text-xs text-gray-400 mt-1">Estimated for this year</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow border flex flex-col">
            <div className="text-gray-500 text-sm mb-1">Generated Reports</div>
            <div className="text-2xl font-bold text-blue-900">{summary.num_reports}</div>
            <div className="text-xs text-gray-400 mt-1">Tax reports created</div>
          </div>
          <div className="bg-white rounded-xl p-5 shadow border flex flex-col">
            <div className="flex items-center gap-2 text-gray-500 text-sm mb-1">Budget Alerts <span className="text-red-500 text-lg">⚠️</span></div>
            <div className="text-2xl font-bold text-red-500">{summary.budget_alerts.length}</div>
            <div className="text-xs text-gray-400 mt-1">Categories nearing budget</div>
          </div>
        </div>
        {/* Analytics Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-xl p-6 shadow border flex flex-col min-h-[340px]">
            <div className="font-bold text-lg mb-2">Spending Breakdown</div>
            {pieData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="amount"
                    nameKey="category"
                    cx="50%"
                    cy="50%"
                    outerRadius={90}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, idx) => (
                      <Cell key={`cell-${entry.category}`} fill={categoryColors[entry.category] || '#ddd'} />
                    ))}
                  </Pie>
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm flex-1">No spending data available for this period.<br/>Upload expenses to see your breakdown.</div>
            )}
          </div>
          <div className="bg-white rounded-xl p-6 shadow border flex flex-col">
            <div className="font-bold text-lg mb-2">Monthly Spending Trends</div>
            {monthlyData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={monthlyData} margin={{ top: 16, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip formatter={v => `RM ${v.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`} />
                  <Bar dataKey="amount" fill="#64B5F6" radius={[8,8,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="text-gray-400 text-sm flex-1">No spending data available for trend analysis.<br/>Track expenses over time to see trends.</div>
            )}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-xl p-6 shadow border flex flex-col">
            <div className="font-bold text-lg mb-2 flex items-center gap-2"> <span className="text-blue-400">📋</span> All Recent Expenses</div>
            {receipts.length === 0 ? (
              <div className="text-gray-400 text-sm flex-1">Your categorized expenses will appear here.<br/><Link href="/expenses/upload" className="text-blue-500 underline">Upload your first receipt</Link></div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left border-b">
                      <th className="py-2 pr-4">Vendor</th>
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Category</th>
                      <th className="py-2 pr-4">Amount</th>
                      <th className="py-2 pr-4">Deductible</th>
                    </tr>
                  </thead>
                  <tbody>
                    {receipts.slice().reverse().slice(0, 8).map(r => (
                      <tr key={r.id} className="border-b last:border-0">
                        <td className="py-2 pr-4 font-medium">{r.vendor}</td>
                        <td className="py-2 pr-4">{r.date}</td>
                        <td className="py-2 pr-4">{r.category}</td>
                        <td className="py-2 pr-4">RM {parseFloat(r.amount).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</td>
                        <td className="py-2 pr-4">{r.deductible ? `${r.deductible}%` : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          <div className="bg-white rounded-xl p-6 shadow border flex flex-col">
            <div className="font-bold text-lg mb-2 flex items-center gap-2 text-red-500"> <span>⚠️</span> Budget Alerts</div>
            <div className="text-gray-500 text-sm mb-2">Keep an eye on categories approaching their budget limits.</div>
            {summary.budget_alerts.map(alert => (
              <div key={alert.category} className="mb-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span>{alert.category}</span>
                  <span className="text-orange-500">{Math.round(alert.spent/500*100)}% of budget</span>
                </div>
                <div className="w-full bg-gray-200 rounded h-2 mt-1 mb-1">
                  <div className="bg-orange-400 h-2 rounded" style={{ width: `${Math.min(Math.round(alert.spent/500*100), 100)}%` }}></div>
                </div>
                <div className="text-xs text-gray-400">Spent: ${alert.spent.toFixed(2)} &nbsp; Budget: $500.00</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
