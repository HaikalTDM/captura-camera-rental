'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import type { ReviewFormContext } from '@/lib/reviews/types'

function renderStars(currentRating: number, onSelect: (rating: number) => void) {
  return Array.from({ length: 5 }).map((_, index) => {
    const value = index + 1

    return (
      <button
        key={value}
        type="button"
        onClick={() => onSelect(value)}
        className={`text-3xl transition-transform hover:scale-110 sm:text-4xl ${
          value <= currentRating ? 'text-amber-400' : 'text-zinc-700'
        }`}
        aria-label={`Rate ${value} star${value > 1 ? 's' : ''}`}
      >
        ★
      </button>
    )
  })
}

export default function ReviewFormPage() {
  const params = useParams<{ token: string }>()
  const token = typeof params?.token === 'string' ? params.token : ''
  const [context, setContext] = useState<ReviewFormContext | null>(null)
  const [rating, setRating] = useState(5)
  const [reviewText, setReviewText] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  useEffect(() => {
    async function loadForm() {
      if (!token) return

      try {
        setIsLoading(true)
        const response = await fetch(`/api/reviews/form/${token}`, { cache: 'no-store' })
        const result = await response.json()

        if (!response.ok || !result.success) {
          throw new Error(result.error || 'Failed to load review form')
        }

        setContext(result.context as ReviewFormContext)
      } catch (loadError) {
        console.error('Error loading review form:', loadError)
        setError(loadError instanceof Error ? loadError.message : 'Failed to load review form')
      } finally {
        setIsLoading(false)
      }
    }

    loadForm()
  }, [token])

  const helperText = useMemo(() => {
    if (!context) return null

    if (context.cameraName && context.rentalPeriod) {
      return `${context.cameraName} • ${context.rentalPeriod}`
    }

    return context.cameraName || context.rentalPeriod || null
  }, [context])

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (reviewText.trim().length < 10) {
      setError('Please write at least 10 characters so your review has enough detail.')
      return
    }

    try {
      setIsSubmitting(true)
      setError(null)

      const response = await fetch('/api/reviews/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          rating,
          reviewText: reviewText.trim(),
        }),
      })

      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit review')
      }

      setSuccessMessage(result.message || 'Thanks for your review.')
      setReviewText('')
    } catch (submitError) {
      console.error('Error submitting review:', submitError)
      setError(submitError instanceof Error ? submitError.message : 'Failed to submit review')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(251,191,36,0.16),_transparent_30%),linear-gradient(180deg,#09090b_0%,#111113_52%,#18181b_100%)] px-4 py-12 text-white sm:px-6">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <p className="text-xs font-black uppercase tracking-[0.34em] text-orange-300/80">CAPTURA Reviews</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Share Your Rental Experience</h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-7 text-zinc-400 sm:text-base">
            A quick review helps future customers trust the service before they book.
          </p>
        </div>

        <div className="rounded-[32px] border border-white/10 bg-zinc-950/80 p-6 shadow-[0_24px_80px_rgba(0,0,0,0.4)] backdrop-blur-xl sm:p-8">
          {isLoading ? (
            <div className="flex min-h-[320px] items-center justify-center">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-400" />
            </div>
          ) : successMessage ? (
            <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-3xl text-emerald-300">
                ✓
              </div>
              <h2 className="mt-5 text-3xl font-black text-white">Review Submitted</h2>
              <p className="mt-3 text-sm leading-7 text-emerald-100/90">{successMessage}</p>
              <Link
                href="/"
                className="mt-6 inline-flex items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition-colors hover:bg-zinc-200"
              >
                Back to CAPTURA
              </Link>
            </div>
          ) : error && !context ? (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
              <h2 className="text-2xl font-black text-white">This Review Link Isn’t Available</h2>
              <p className="mt-3 text-sm leading-7 text-red-100/90">{error}</p>
            </div>
          ) : (
            <form className="space-y-8" onSubmit={handleSubmit}>
              <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-zinc-500">Review Request</p>
                <h2 className="mt-2 text-2xl font-black text-white">
                  {context ? `Hi ${context.customerName}, how was your experience?` : 'How was your experience?'}
                </h2>
                {helperText && (
                  <p className="mt-3 text-sm font-semibold text-zinc-400">{helperText}</p>
                )}
              </section>

              <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 sm:p-6">
                <p className="text-[11px] font-black uppercase tracking-[0.32em] text-zinc-500">Your Rating</p>
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {renderStars(rating, setRating)}
                </div>
                <p className="mt-3 text-sm text-zinc-400">
                  Pick the rating that best matches the overall rental experience.
                </p>
              </section>

              <section className="rounded-3xl border border-white/5 bg-white/[0.03] p-5 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-[0.32em] text-zinc-500">Your Review</p>
                    <p className="mt-2 text-sm text-zinc-400">This will be checked by CAPTURA before it appears publicly.</p>
                  </div>
                  <span className="text-xs font-bold text-zinc-500">{reviewText.trim().length} chars</span>
                </div>
                <textarea
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  rows={6}
                  className="mt-4 w-full rounded-2xl border border-white/10 bg-zinc-900 px-4 py-4 text-sm font-medium text-white outline-none transition-colors focus:border-white/20"
                  placeholder="Tell us what stood out for you, what the booking experience felt like, and whether you'd recommend CAPTURA."
                />
              </section>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm font-bold text-red-200">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full rounded-2xl bg-white px-5 py-4 text-sm font-black text-black transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
                >
                  {isSubmitting ? 'Submitting Review...' : 'Submit Review'}
                </button>
                <Link
                  href="/"
                  className="w-full rounded-2xl border border-white/10 bg-zinc-900 px-5 py-4 text-center text-sm font-black text-white transition-colors hover:bg-zinc-800 sm:w-auto"
                >
                  Cancel
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
