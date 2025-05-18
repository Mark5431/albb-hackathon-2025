"use client"
import { useState } from 'react'

// Dummy data for expenses
const dummyExpenses = [
  { id: 1, category: 'Software', amount: 800, month: '2025-04', deductible: 100 },
  { id: 2, category: 'Travel', amount: 600, month: '2025-04', deductible: 100 },
  { id: 3, category: 'Food & Beverage', amount: 200, month: '2025-05', deductible: 50 },
  { id: 4, category: 'Coworking Space', amount: 200, month: '2025-05', deductible: 100 },
  { id: 5, category: 'Software', amount: 200, month: '2025-05', deductible: 100 },
]

const categoryColors = {
  'Software': '#60a5fa',
  'Travel': '#fbbf24',
  'Food & Beverage': '#34d399',
  'Coworking Space': '#a78bfa',
}

function getPieChartData(expenses) {
  const totals = {}
  expenses.forEach(e => {
    totals[e.category] = (totals[e.category] || 0) + e.amount
  })
  return Object.entries(totals).map(([cat, amt]) => ({ category: cat, amount: amt }))
}

function getMonthlyTrends(expenses) {
  const months = {}
  expenses.forEach(e => {
    months[e.month] = (months[e.month] || 0) + e.amount
  })
  return Object.entries(months).map(([month, amt]) => ({ month, amount: amt }))
}

export default function ExpensesDashboard() {
  const [expenses] = useState(dummyExpenses)
  const pieData = getPieChartData(expenses)
  const monthlyData = getMonthlyTrends(expenses)
  const deductibleTotal = expenses.reduce((sum, e) => sum + (e.amount * e.deductible / 100), 0)
  const softwareSpent = expenses.filter(e => e.category === 'Software').reduce((sum, e) => sum + e.amount, 0)
  const softwareBudget = 1000
  const softwarePct = Math.round((softwareSpent / softwareBudget) * 100)

  return (
    <div className="max-w-2xl mx-auto mt-10 card">
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--primary)' }}>Expenses Overview</h2>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Spending Breakdown</h3>
        <div className="flex gap-4 items-center">
          {/* Pie chart (dummy) */}
          <div className="w-32 h-32 relative">
            {/* Simple pie chart using SVG */}
            <svg viewBox="0 0 32 32" width="100%" height="100%">
              {pieData.reduce((acc, slice, i) => {
                const prev = acc.prev
                const value = slice.amount / expenses.reduce((s, e) => s + e.amount, 0)
                const angle = value * 360
                const x = 16 + 16 * Math.cos(2 * Math.PI * prev / 360)
                const y = 16 + 16 * Math.sin(2 * Math.PI * prev / 360)
                const x2 = 16 + 16 * Math.cos(2 * Math.PI * (prev + angle) / 360)
                const y2 = 16 + 16 * Math.sin(2 * Math.PI * (prev + angle) / 360)
                const large = angle > 180 ? 1 : 0
                const path = `M16,16 L${x},${y} A16,16 0 ${large} 1 ${x2},${y2} Z`
                acc.slices.push(
                  <path key={slice.category} d={path} fill={categoryColors[slice.category] || '#ddd'} />
                )
                acc.prev += angle
                return acc
              }, { prev: 0, slices: [] }).slices}
            </svg>
            <div className="absolute top-0 left-0 w-full h-full flex flex-col items-center justify-center text-xs">
              {pieData.map(slice => (
                <div key={slice.category} className="flex items-center gap-1">
                  <span style={{ background: categoryColors[slice.category] || '#ddd', width: 10, height: 10, display: 'inline-block', borderRadius: 2 }}></span>
                  {slice.category}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="font-bold text-lg">Tax Deductible Total:</div>
            <div className="text-green-700 text-2xl mb-2">${deductibleTotal.toLocaleString()}</div>
            <div className="text-gray-500">“$2,340 deductible this year!”</div>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="font-semibold mb-2">Monthly Trends</h3>
        {/* Bar chart (dummy) */}
        <div className="flex gap-2 items-end h-32">
          {monthlyData.map(md => (
            <div key={md.month} className="flex flex-col items-center">
              <div className="bg-blue-400 w-8" style={{ height: md.amount / 10 }}></div>
              <div className="text-xs mt-1">{md.month}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="mb-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-3 rounded">
          <b>Budget Alert:</b> You’ve spent {softwarePct}% of your Software budget.
        </div>
      </div>
      <div className="mb-2">
        <div className="bg-green-100 border-l-4 border-green-500 p-3 rounded">
          <b>Insight:</b> Sarah, you spent $200 on coworking spaces this month — 100% tax-deductible!
        </div>
      </div>
    </div>
  )
}
