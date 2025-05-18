"use client"
import { useState } from 'react'
import Link from 'next/link'
import jsPDF from 'jspdf'
import 'jspdf-autotable'

const dummyReport = {
  year: 2025,
  totalDeductible: 2340,
  recommendedForm: 'Form B (Self-Employed)',
  summary: [
    { category: 'Software', amount: 1000, deductible: 100 },
    { category: 'Travel', amount: 600, deductible: 100 },
    { category: 'Food & Beverage', amount: 200, deductible: 50 },
    { category: 'Coworking Space', amount: 200, deductible: 100 },
  ],
  totalIncome: 12000,
  totalExpenses: 2000,
}

function generateCSV(expenses) {
  if (!expenses.length) return ''
  // Group by category for deductible
  const byCategory = {}
  let total = 0
  expenses.forEach(e => {
    const cat = e.category || 'Other'
    byCategory[cat] = byCategory[cat] || { amount: 0, deductible: 0 }
    byCategory[cat].amount += parseFloat(e.amount) || 0
    byCategory[cat].deductible = e.deductible || 0
    total += parseFloat(e.amount) || 0
  })
  const rows = [
    ['Category', 'Total Amount', 'Deductible %', 'Deductible Amount'],
    ...Object.entries(byCategory).map(([cat, v]) => [
      cat,
      v.amount.toFixed(2),
      v.deductible,
      ((v.amount * (v.deductible/100))).toFixed(2)
    ]),
    [],
    ['Total Expenses', total.toFixed(2)],
    ['Total Deductible', Object.values(byCategory).reduce((s, v) => s + v.amount * (v.deductible/100), 0).toFixed(2)],
  ]
  return rows.map(r => r.join(',')).join('\n')
}

function downloadCSV(expenses) {
  const csv = generateCSV(expenses)
  const blob = new Blob([csv], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `tax_report_${new Date().toISOString().slice(0,10)}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

async function downloadPDF(expenses) {
  // Dynamically import jsPDF and autoTable for Next.js compatibility
  const jsPDFModule = await import('jspdf');
  const jsPDF = jsPDFModule.default;
  // Import as side effect to ensure autoTable attaches to jsPDF prototype
  if (typeof window !== 'undefined') {
    await import('jspdf-autotable');
  }
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Tax Report', 14, 18);
  doc.setFontSize(12);
  let y = 28;
  const total = expenses.reduce((s, e) => s + parseFloat(e.amount), 0);
  const totalDeductible = expenses.reduce((s, e) => s + (parseFloat(e.amount) * (e.deductible||0)/100), 0);
  doc.text(`Total Expenses: RM ${total.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`, 14, y);
  y += 8;
  doc.text(`Total Deductible: RM ${totalDeductible.toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`, 14, y);
  y += 12;
  doc.setFontSize(14);
  doc.text('Expense Details', 14, y);
  y += 6;
  doc.setFontSize(10);
  // Defensive: check if autoTable is available
  if (typeof doc.autoTable === 'function') {
    doc.autoTable({
      startY: y,
      head: [["Vendor", "Date", "Category", "Amount", "Deductible"]],
      body: expenses.map(r => [
        r.vendor,
        r.date,
        r.category,
        `RM ${parseFloat(r.amount).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}`,
        r.deductible ? `${r.deductible}%` : '-'
      ]),
      theme: 'striped',
      headStyles: { fillColor: [100, 181, 246] },
      styles: { cellPadding: 2, fontSize: 10 },
      margin: { left: 14, right: 14 }
    });
  } else {
    doc.text('Error: PDF table export is not available.', 14, y + 10);
  }
  doc.save(`tax_report_${new Date().toISOString().slice(0,10)}.pdf`);
}

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: '📋' },
  { label: 'Upload Receipt', href: '/expenses/upload', icon: '➕' },
  { label: 'Tax Reports', href: '/tax-report', icon: '📄' },
  { label: 'My Profile', href: '/profile', icon: '👤' },
]

export default function TaxReport() {
  const [range, setRange] = useState({ from: '2025-01-01', to: '2025-05-18' })
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(false)
  const [generated, setGenerated] = useState(false)
  const [aiSummary, setAiSummary] = useState("")

  // Fetch expenses for the selected range
  const handleGenerate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setGenerated(false)
    setAiSummary("")
    try {
      const res = await fetch(`http://localhost:8000/api/receipts?from=${range.from}&to=${range.to}`)
      const data = await res.json()
      setExpenses(data)
      // Call AI summary if there are expenses
      if (data.length > 0) {
        const aiRes = await fetch('http://localhost:8000/api/tax/ai-summary', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ expenses: data, profile: { country: 'Malaysia', business_type: 'Consultant' } })
        })
        const aiData = await aiRes.json()
        setAiSummary(aiData.summary)
      }
    } catch {
      setExpenses([])
      setAiSummary("")
    }
    setGenerated(true)
    setLoading(false)
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
              <Link key={item.label} href={item.href} className={`flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-blue-50 text-gray-700 font-medium ${item.label === 'Tax Reports' ? 'bg-blue-50 text-blue-600' : ''}`}>
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
        <div className="max-w-2xl mx-auto mt-10">
          <h2 className="text-2xl font-bold mb-6" style={{ color: 'var(--primary)' }}>Generate Tax Report</h2>
          <div className="bg-white rounded-xl shadow p-8 mb-6">
            <form onSubmit={handleGenerate}>
              <div className="mb-4">
                <label className="block font-semibold mb-1">Select Date Range</label>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    className="border rounded px-3 py-2"
                    value={range.from}
                    max={range.to}
                    onChange={e => setRange({ ...range, from: e.target.value })}
                    required
                  />
                  <span className="mx-2 text-gray-500">-</span>
                  <input
                    type="date"
                    className="border rounded px-3 py-2"
                    value={range.to}
                    min={range.from}
                    max={new Date().toISOString().slice(0, 10)}
                    onChange={e => setRange({ ...range, to: e.target.value })}
                    required
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">Select the start and end dates for your tax report.</div>
              </div>
              <button
                className="w-full py-3 rounded bg-[#64B5F6] text-white font-bold text-lg shadow hover:bg-blue-400 transition flex items-center justify-center gap-2"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Generating...' : <><span className="text-lg">📄</span> Generate Report</>}
              </button>
            </form>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded p-6 mb-8">
            <div className="flex items-center gap-2 mb-2 text-blue-700 font-semibold"><span>ℹ️</span> Tax Rule Explanations</div>
            <div className="text-sm text-blue-900">
              Hover over deductible percentages in the report for AI-powered explanations based on your profile.<br />
              Example: <span className="italic">&quot;Software tools are often 100% deductible for freelancers in Malaysia (Consultant).&quot;</span> <br />
              <span className="text-xs">(Note: This is a general example. Actual rules vary. Always consult a tax professional.)</span>
            </div>
          </div>
          {generated && (
            <div className="bg-white rounded-xl shadow p-8 text-center">
              {expenses.length === 0 ? (
                <div className="text-gray-400 text-lg font-semibold py-12">No Expenses Found</div>
              ) : (
                <>
                  <div className="mb-4 text-left">
                    <div className="font-bold text-lg mb-2">Summary for Tax Filing</div>
                    <div>Total Expenses: <span className="font-bold">RM {expenses.reduce((s, e) => s + parseFloat(e.amount), 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span></div>
                    <div>Total Deductible: <span className="font-bold">RM {expenses.reduce((s, e) => s + (parseFloat(e.amount) * (e.deductible||0)/100), 0).toLocaleString(undefined, {minimumFractionDigits:2, maximumFractionDigits:2})}</span></div>
                  </div>
                  <div className="overflow-x-auto mb-4">
                    <table className="min-w-full text-sm text-left">
                      <thead>
                        <tr className="border-b">
                          <th className="py-2 pr-4">Vendor</th>
                          <th className="py-2 pr-4">Date</th>
                          <th className="py-2 pr-4">Category</th>
                          <th className="py-2 pr-4">Amount</th>
                          <th className="py-2 pr-4">Deductible</th>
                        </tr>
                      </thead>
                      <tbody>
                        {expenses.map(r => (
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
                  <div className="flex gap-4 justify-center">
                    <button className="button-primary" onClick={() => downloadCSV(expenses)}>Download CSV</button>
                    <button className="button-accent" onClick={() => downloadPDF(expenses)}>Download PDF</button>
                  </div>
                  <div className="mt-6 text-left">
                    <div className="font-semibold mb-1">AI Tax Check</div>
                    {aiSummary ? (
                      <div className="text-sm whitespace-pre-line bg-blue-50 border border-blue-200 rounded p-4">{aiSummary}</div>
                    ) : (
                      <div className="text-xs text-gray-500">A comprehensive summary and check for tax limits and compliance will appear here.</div>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
