'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { AnimatedToastContainer, useAnimatedToast } from '@/components/ui/animated-toast'
import type { AdminReviewRecord, CustomerReviewStatus } from '@/lib/reviews/types'

interface ReviewsResponse {
  success: boolean
  reviews: AdminReviewRecord[]
  summary: {
    total: number
    pending: number
    approved: number
    rejected: number
    featured: number
  }
  error?: string
}

type ReviewFilter = 'all' | CustomerReviewStatus

function renderStars(rating: number) {
  return Array.from({ length: 5 }).map((_, index) => (
    <span
      key={`${rating}-${index}`}
      className={index < rating ? 'text-amber-300' : 'text-stone-700'}
    >
      ★
    </span>
  ))
}

function statusClasses(status: CustomerReviewStatus) {
  switch (status) {
    case 'approved':
      return 'border-emerald-500/20 bg-emerald-500/10 text-emerald-200'
    case 'rejected':
      return 'border-red-500/20 bg-red-500/10 text-red-200'
    case 'hidden':
      return 'border-stone-500/20 bg-stone-500/10 text-stone-300'
    default:
      return 'border-orange-500/20 bg-orange-500/10 text-orange-200'
  }
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<AdminReviewRecord[]>([])
  const [filter, setFilter] = useState<ReviewFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [busyReviewId, setBusyReviewId] = useState<string | null>(null)
  const [pendingDeleteReviewId, setPendingDeleteReviewId] = useState<string | null>(null)
  const { toasts, success, error, removeToast } = useAnimatedToast()

  const loadReviews = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/admin/reviews', { cache: 'no-store' })
      const result = (await response.json()) as ReviewsResponse

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to load reviews')
      }

      setReviews(result.reviews)
    } catch (loadError) {
      console.error('Error loading reviews:', loadError)
      error('Failed to load reviews', loadError instanceof Error ? loadError.message : 'Please try again.')
    } finally {
      setIsLoading(false)
    }
  }, [error])

  useEffect(() => {
    loadReviews()
  }, [loadReviews])

  const summary = useMemo(() => ({
    total: reviews.length,
    pending: reviews.filter((review) => review.status === 'pending').length,
    approved: reviews.filter((review) => review.status === 'approved').length,
    rejected: reviews.filter((review) => review.status === 'rejected').length,
    featured: reviews.filter((review) => review.featured).length,
  }), [reviews])

  const filteredReviews = useMemo(() => {
    if (filter === 'all') return reviews
    return reviews.filter((review) => review.status === filter)
  }, [filter, reviews])

  const updateReview = async (
    reviewId: string,
    endpoint: string,
    payload: Record<string, unknown> | null,
    successMessage: string,
  ) => {
    try {
      setBusyReviewId(reviewId)
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload ? JSON.stringify(payload) : null,
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Review update failed')
      }

      success(successMessage)
      await loadReviews()
    } catch (updateError) {
      console.error('Error updating review:', updateError)
      error('Review update failed', updateError instanceof Error ? updateError.message : 'Please try again.')
    } finally {
      setBusyReviewId(null)
    }
  }

  const deleteReview = async (reviewId: string) => {
    try {
      setBusyReviewId(reviewId)
      const response = await fetch(`/api/admin/reviews/${reviewId}/delete`, {
        method: 'DELETE',
      })
      const result = await response.json()

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete review')
      }

      success('Review deleted')
      await loadReviews()
    } catch (deleteError) {
      console.error('Error deleting review:', deleteError)
      error('Delete failed', deleteError instanceof Error ? deleteError.message : 'Please try again.')
    } finally {
      setBusyReviewId(null)
      setPendingDeleteReviewId(null)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-orange-400/80">Customer Reviews</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-stone-100">Moderate Public Reviews</h1>
          <p className="mt-2 max-w-2xl text-sm text-stone-400">
            Every submitted review stays private until you approve it. Feature the strongest ones to push them to the top of the public page.
          </p>
        </div>
        <Link
          href="/admin/customers"
          className="inline-flex items-center justify-center rounded-xl border border-[#342d27] bg-[#171412] px-4 py-3 text-sm font-bold text-stone-200 transition-colors hover:bg-[#211c18]"
        >
          Back to Customers
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {[
          { label: 'Total Reviews', value: summary.total },
          { label: 'Pending Approval', value: summary.pending },
          { label: 'Approved', value: summary.approved },
          { label: 'Featured', value: summary.featured },
        ].map((item) => (
          <div key={item.label} className="rounded-2xl border border-[#2b2520] bg-[#151311] p-5">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-stone-500">{item.label}</p>
            <p className="mt-3 text-3xl font-black text-stone-100">{item.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2">
        {[
          { label: 'All', value: 'all' as const },
          { label: 'Pending', value: 'pending' as const },
          { label: 'Approved', value: 'approved' as const },
          { label: 'Rejected', value: 'rejected' as const },
        ].map((item) => (
          <button
            key={item.value}
            type="button"
            onClick={() => setFilter(item.value)}
            className={`rounded-full px-4 py-2 text-sm font-black transition-colors ${
              filter === item.value
                ? 'bg-[#f3efe8] text-[#11100f]'
                : 'border border-[#312923] bg-[#171412] text-stone-300 hover:bg-[#211c18]'
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex min-h-[240px] items-center justify-center rounded-3xl border border-[#2b2520] bg-[#151311]">
          <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-orange-500" />
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#3a3129] bg-[#151311] px-6 py-16 text-center">
          <p className="text-lg font-bold text-stone-100">No reviews in this view yet</p>
          <p className="mt-2 text-sm text-stone-500">Once customers submit feedback, it will appear here for approval.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review) => {
            const isBusy = busyReviewId === review.id

            return (
              <article key={review.id} className="rounded-3xl border border-[#2b2520] bg-[#151311] p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-xl font-black text-stone-100">{review.customerName}</h2>
                      <span className={`rounded-full border px-3 py-1 text-xs font-black uppercase tracking-[0.24em] ${statusClasses(review.status)}`}>
                        {review.status}
                      </span>
                      {review.featured && (
                        <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-black uppercase tracking-[0.24em] text-amber-200">
                          Featured
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-stone-400">
                      <span>{renderStars(review.rating)}</span>
                      {review.customerEmail && <span>{review.customerEmail}</span>}
                      {review.cameraName && <span>{review.cameraName}</span>}
                      <span>{new Date(review.submittedAt).toLocaleDateString('en-MY', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    </div>

                    <p className="mt-4 text-sm leading-7 text-stone-300">{review.review}</p>

                    <div className="mt-4 flex flex-wrap items-center gap-3 text-xs font-semibold text-stone-500">
                      {review.tokenLast4 && <span>Link ending: {review.tokenLast4}</span>}
                      {review.requestStatus && <span>Request: {review.requestStatus}</span>}
                      {review.requestExpiresAt && (
                        <span>Expires: {new Date(review.requestExpiresAt).toLocaleDateString('en-MY')}</span>
                      )}
                    </div>
                  </div>

                  <div className="grid shrink-0 gap-2 sm:grid-cols-2 lg:flex lg:w-[260px] lg:grid-cols-1 lg:flex-col">
                    <Link
                      href={`/admin/customers/${review.customerId}`}
                      className="inline-flex items-center justify-center rounded-xl border border-[#342d27] bg-[#181512] px-4 py-3 text-sm font-bold text-stone-200 transition-colors hover:bg-[#221d18]"
                    >
                      Open Customer
                    </Link>
                    <button
                      type="button"
                      onClick={() => updateReview(review.id, `/api/admin/reviews/${review.id}/approve`, null, 'Review approved')}
                      disabled={isBusy || review.status === 'approved'}
                      className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-black transition-colors hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isBusy && review.status !== 'approved' ? 'Working...' : 'Approve'}
                    </button>
                    <button
                      type="button"
                      onClick={() => updateReview(review.id, `/api/admin/reviews/${review.id}/reject`, null, 'Review rejected')}
                      disabled={isBusy || review.status === 'rejected'}
                      className="rounded-xl bg-red-500/90 px-4 py-3 text-sm font-black text-white transition-colors hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Reject
                    </button>
                    <button
                      type="button"
                      onClick={() => updateReview(
                        review.id,
                        `/api/admin/reviews/${review.id}/feature`,
                        { featured: !review.featured },
                        review.featured ? 'Review removed from featured' : 'Review featured on public page',
                      )}
                      disabled={isBusy || review.status !== 'approved'}
                      className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm font-black text-amber-100 transition-colors hover:bg-amber-500/20 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {review.featured ? 'Unfeature' : 'Feature'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setPendingDeleteReviewId(review.id)}
                      disabled={isBusy}
                      className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm font-black text-red-200 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:col-span-2"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {pendingDeleteReviewId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setPendingDeleteReviewId(null)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className="relative w-full max-w-md rounded-3xl border border-[#2b2520] bg-[#151311] p-6 shadow-[0_24px_55px_rgba(0,0,0,0.28)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-center">
              <p className="text-xs font-black uppercase tracking-[0.28em] text-red-300/80">Delete Review</p>
              <h2 className="mt-3 text-2xl font-black text-stone-100">Remove this review permanently?</h2>
              <p className="mt-3 text-sm leading-7 text-stone-400">
                This deletes both the review and its linked review request. This action cannot be undone.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPendingDeleteReviewId(null)}
                className="rounded-2xl border border-[#3d342d] bg-[#1d1916] px-4 py-3 text-sm font-semibold text-stone-100 transition hover:border-[#56473c] hover:bg-[#24201c]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => deleteReview(pendingDeleteReviewId)}
                disabled={busyReviewId === pendingDeleteReviewId}
                className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-black text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {busyReviewId === pendingDeleteReviewId ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatedToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  )
}
