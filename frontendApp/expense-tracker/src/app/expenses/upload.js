"use client"
import { useState } from 'react'

export default function UploadReceipt() {
  const [files, setFiles] = useState([])
  const [extractedList, setExtractedList] = useState([])
  const [notes, setNotes] = useState([])
  const [editIndex, setEditIndex] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Call backend API for each file
  const handleUpload = async (e) => {
    const uploaded = Array.from(e.target.files)
    setFiles(uploaded)
    setLoading(true)
    setError("")
    try {
      const apiKey = prompt("Enter your Dashscope API key:") || "" // Or use a secure method
      const results = await Promise.all(uploaded.map(async (file) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('api_key', apiKey)
        const res = await fetch('http://localhost:8000/api/receipt/extract', {
          method: 'POST',
          body: formData,
        })
        if (!res.ok) throw new Error('Extraction failed')
        return await res.json()
      }))
      setExtractedList(results)
      setNotes(uploaded.map(() => ''))
    } catch (err) {
      setError('Failed to extract receipt data. Please try again.')
      setExtractedList([])
    } finally {
      setLoading(false)
      setEditIndex(null)
    }
  }

  const handleEdit = (idx) => setEditIndex(idx)
  const handleSave = () => setEditIndex(null)

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F5F5] px-4">
      <div className="bg-white card shadow-lg rounded-xl p-8 mx-auto w-full max-w-xl">
        <h2 className="text-2xl font-bold mb-4 text-center" style={{ color: 'var(--foreground)' }}>Upload Receipts</h2>
        <input type="file" accept="image/*,application/pdf" onChange={handleUpload} className="mb-6 w-full" multiple />
        {loading && <div className="mb-4 text-blue-500 text-center">Extracting receipt data...</div>}
        {error && <div className="mb-4 text-red-500 text-center">{error}</div>}
        {extractedList.map((extracted, idx) => (
          <div className="bg-gray-100 p-4 rounded mb-4" key={idx}>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <span className="icon" role="img" aria-label="receipt">🧾</span> Extracted Expense
            </h3>
            {editIndex === idx ? (
              <div className="flex flex-col gap-2">
                <input className="p-1 border rounded" value={extracted.vendor} onChange={e => setExtractedList(list => list.map((item, i) => i === idx ? { ...item, vendor: e.target.value } : item))} />
                <input className="p-1 border rounded" type="number" value={extracted.amount} onChange={e => setExtractedList(list => list.map((item, i) => i === idx ? { ...item, amount: e.target.value } : item))} />
                <input className="p-1 border rounded" type="date" value={extracted.date} onChange={e => setExtractedList(list => list.map((item, i) => i === idx ? { ...item, date: e.target.value } : item))} />
                <input className="p-1 border rounded" value={extracted.category} onChange={e => setExtractedList(list => list.map((item, i) => i === idx ? { ...item, category: e.target.value } : item))} />
                <input className="p-1 border rounded" type="number" value={extracted.deductible || ''} onChange={e => setExtractedList(list => list.map((item, i) => i === idx ? { ...item, deductible: e.target.value } : item))} />
                <textarea className="p-1 border rounded" placeholder="Add notes (e.g., Client meeting)" value={notes[idx]} onChange={e => setNotes(arr => arr.map((n, i) => i === idx ? e.target.value : n))} />
                <button className="button-primary" onClick={handleSave}>Save</button>
              </div>
            ) : (
              <div>
                <div><b>Vendor:</b> {extracted.vendor}</div>
                <div><b>Amount:</b> ${extracted.amount}</div>
                <div><b>Date:</b> {extracted.date}</div>
                <div><b>Category:</b> {extracted.category}</div>
                {typeof extracted.deductible !== 'undefined' && <div><b>Deductible:</b> {extracted.deductible}%</div>}
                {notes[idx] && <div><b>Notes:</b> {notes[idx]}</div>}
                <button className="mt-2 button-accent" onClick={() => handleEdit(idx)}>Edit</button>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <button className="button-primary">Copy</button>
              <button className="button-accent">Download</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
