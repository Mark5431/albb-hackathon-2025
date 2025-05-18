"use client"
import { useState } from 'react'

export default function Feedback() {
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [feedback, setFeedback] = useState('')
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="max-w-md mx-auto mt-10 card text-center">
      <h2 className="text-xl font-bold mb-4" style={{ color: 'var(--primary)' }}>Feedback & Support</h2>
      {submitted ? (
        <div className="text-green-700 font-semibold">Thank you for your feedback!</div>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <div className="mb-2">Did we save you time? Rate us!</div>
            <div className="flex justify-center gap-1 mb-2">
              {[1,2,3,4,5].map(star => (
                <span
                  key={star}
                  className={`text-2xl cursor-pointer ${star <= (hover || rating) ? 'text-yellow-400' : 'text-gray-300'}`}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  role="img"
                  aria-label={`${star} star${star > 1 ? 's' : ''}`}
                >★</span>
              ))}
            </div>
          </div>
          <textarea
            className="w-full p-2 border rounded mb-4"
            placeholder="Suggest a feature or tell us how we can improve!"
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            rows={3}
          />
          <button className="button-primary w-full font-bold" type="submit">Submit</button>
        </form>
      )}
    </div>
  )
}
