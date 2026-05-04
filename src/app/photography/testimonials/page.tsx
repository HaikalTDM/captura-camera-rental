'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import PhotographyNavigation from '@/components/PhotographyNavigation';
import MobileTestimonialsGrid from '@/components/MobileTestimonialsGrid';
import type { PublicReview } from '@/lib/reviews/types';

type ReviewFilter = 'all' | 'featured' | '5' | '4plus';

function renderStars(rating: number) {
  return Array.from({ length: 5 }).map((_, index) => (
    <svg
      key={`${rating}-${index}`}
      className={`h-5 w-5 ${index < rating ? 'text-[#d4af37]' : 'text-gray-300'}`}
      fill="currentColor"
      viewBox="0 0 20 20"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  ));
}

export default function TestimonialsPage() {
  const [reviews, setReviews] = useState<PublicReview[]>([])
  const [filter, setFilter] = useState<ReviewFilter>('all')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadReviews() {
      try {
        setIsLoading(true)
        const response = await fetch('/api/reviews/public', { cache: 'no-store' })
        const result = await response.json()
        setReviews((result.reviews || []) as PublicReview[])
      } catch (error) {
        console.error('Error loading public reviews:', error)
        setReviews([])
      } finally {
        setIsLoading(false)
      }
    }

    loadReviews()
  }, [])

  const filteredReviews = useMemo(() => {
    switch (filter) {
      case 'featured':
        return reviews.filter((review) => review.featured)
      case '5':
        return reviews.filter((review) => review.rating === 5)
      case '4plus':
        return reviews.filter((review) => review.rating >= 4)
      default:
        return reviews
    }
  }, [filter, reviews])

  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0
    return reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
  }, [reviews])

  return (
    <div className="min-h-screen bg-white">
      <PhotographyNavigation />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <p className="text-xs font-bold uppercase tracking-[0.4em] text-[#d4af37]">Verified Reviews</p>
          <h1 className="mt-6 text-4xl font-bold leading-tight text-black sm:text-6xl md:text-7xl lg:text-8xl font-serif">
            Real Rental
            <br />
            <span className="italic">Experiences</span>
          </h1>
          <div className="mx-auto mb-8 mt-6 h-px w-20 bg-[#d4af37] sm:w-24" />
          <p className="mx-auto max-w-3xl text-base leading-relaxed text-black/60 sm:text-lg">
            Feedback from verified CAPTURA customers who rented gear and shared how the experience actually felt.
          </p>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-[#d4af37]/15 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-black/50">Approved Reviews</p>
              <p className="mt-3 text-4xl font-black text-black">{reviews.length}</p>
            </div>
            <div className="rounded-2xl border border-[#d4af37]/15 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-black/50">Average Rating</p>
              <p className="mt-3 text-4xl font-black text-black">{averageRating.toFixed(1)}</p>
            </div>
            <div className="rounded-2xl border border-[#d4af37]/15 bg-white p-6 shadow-sm">
              <p className="text-sm font-bold uppercase tracking-[0.24em] text-black/50">Featured Picks</p>
              <p className="mt-3 text-4xl font-black text-black">{reviews.filter((review) => review.featured).length}</p>
            </div>
          </div>

          <div className="mt-12 flex flex-wrap justify-center gap-2 sm:gap-4">
            {[
              { label: 'All', value: 'all' as const },
              { label: 'Featured', value: 'featured' as const },
              { label: '5 Stars', value: '5' as const },
              { label: '4+ Stars', value: '4plus' as const },
            ].map((item) => (
              <button
                key={item.value}
                onClick={() => setFilter(item.value)}
                className={`rounded-full border-2 px-4 py-3 text-xs font-bold uppercase tracking-widest transition-all duration-300 sm:px-6 sm:text-sm ${
                  filter === item.value
                    ? 'border-[#d4af37] bg-[#d4af37] text-black'
                    : 'border-[#d4af37]/30 bg-white text-black hover:border-[#d4af37] hover:text-[#d4af37]'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <div className="mt-12">
            <MobileTestimonialsGrid testimonials={filteredReviews} isLoading={isLoading} />
          </div>

          <div className="hidden sm:grid sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {isLoading ? (
              Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={`review-skeleton-${index}`}
                  className="rounded-2xl border border-[#d4af37]/10 bg-white p-8 shadow-lg animate-pulse"
                >
                  <div className="mb-4 h-4 w-24 rounded bg-gray-200" />
                  <div className="mb-3 h-3 w-32 rounded bg-gray-200" />
                  <div className="space-y-3">
                    <div className="h-3 rounded bg-gray-200" />
                    <div className="h-3 rounded bg-gray-200" />
                    <div className="h-3 w-3/4 rounded bg-gray-200" />
                  </div>
                </div>
              ))
            ) : filteredReviews.length > 0 ? (
              filteredReviews.map((review) => (
                <article
                  key={review.id}
                  className={`relative rounded-2xl border bg-white p-8 shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl ${
                    review.featured
                      ? 'border-[#d4af37] ring-2 ring-[#d4af37]/10'
                      : 'border-[#d4af37]/10 hover:border-[#d4af37]'
                  }`}
                >
                  {review.featured && (
                    <div className="absolute -top-3 left-6">
                      <span className="rounded-full bg-[#d4af37] px-3 py-1 text-xs font-bold uppercase tracking-wider text-black">
                        Featured
                      </span>
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-black">{review.name}</h3>
                    <p className="mt-2 text-sm text-black/60">
                      {review.cameraName || 'Verified CAPTURA customer'}
                    </p>
                  </div>

                  <div className="mb-4 flex items-center justify-between">
                    <div className="flex items-center">{renderStars(review.rating)}</div>
                    <span className="text-sm text-black/50">
                      {new Date(review.date).toLocaleDateString('en-US', {
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="mb-4 italic leading-relaxed text-black/80">
                    &quot;{review.review}&quot;
                  </p>

                  <div className="flex justify-between items-center">
                    <span className="inline-block rounded-full bg-[#d4af37]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                      Verified review
                    </span>
                  </div>
                </article>
              ))
            ) : (
              <div className="col-span-full rounded-2xl border-2 border-dashed border-[#d4af37]/20 bg-white px-6 py-16 text-center">
                <p className="text-2xl font-bold text-black">No approved reviews yet</p>
                <p className="mt-3 text-sm text-black/60">
                  Reviews will appear here after customers submit feedback and CAPTURA approves them.
                </p>
              </div>
            )}
          </div>

          <div className="mt-16 text-center">
            <div className="mx-4 rounded-2xl border border-[#d4af37]/20 bg-white p-6 shadow-xl sm:mx-0 sm:p-12">
              <h3 className="font-serif text-2xl font-bold text-black sm:text-3xl">Need Help Choosing Your Gear?</h3>
              <p className="mx-auto mt-4 max-w-2xl text-sm text-black/60 sm:text-base">
                Explore the rental lineup or talk to CAPTURA directly for recommendations based on your shoot.
              </p>
              <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:gap-4">
                <Link
                  href="/rental/cameras"
                  className="inline-flex items-center justify-center rounded-lg bg-[#d4af37] px-6 py-4 text-xs font-bold uppercase tracking-widest text-black transition-all duration-300 hover:scale-105 hover:bg-[#d4af37]/90 sm:px-8 sm:text-sm"
                >
                  Explore Cameras
                </Link>
                <Link
                  href="/rental/support"
                  className="inline-flex items-center justify-center rounded-lg bg-black px-6 py-4 text-xs font-bold uppercase tracking-widest text-white transition-all duration-300 hover:bg-[#d4af37] hover:text-black sm:px-8 sm:text-sm"
                >
                  Contact Support
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
