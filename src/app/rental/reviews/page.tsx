'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import type { PublicReview } from '@/lib/reviews/types';

type ReviewFilter = 'all' | 'featured' | '5' | '4plus';

function renderStars(rating: number) {
  return Array.from({ length: 5 }).map((_, index) => (
    <span
      key={`${rating}-${index}`}
      className={`text-lg ${index < rating ? 'text-yellow-400' : 'text-zinc-700'}`}
    >
      ★
    </span>
  ));
}

export default function RentalReviewsPage() {
  const [reviews, setReviews] = useState<PublicReview[]>([]);
  const [filter, setFilter] = useState<ReviewFilter>('all');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadReviews() {
      try {
        setIsLoading(true);
        const response = await fetch('/api/reviews/public', { cache: 'no-store' });
        const result = await response.json();
        setReviews((result.reviews || []) as PublicReview[]);
      } catch (error) {
        console.error('Error loading rental reviews:', error);
        setReviews([]);
      } finally {
        setIsLoading(false);
      }
    }

    loadReviews();
  }, []);

  const filteredReviews = useMemo(() => {
    switch (filter) {
      case 'featured':
        return reviews.filter((review) => review.featured);
      case '5':
        return reviews.filter((review) => review.rating === 5);
      case '4plus':
        return reviews.filter((review) => review.rating >= 4);
      default:
        return reviews;
    }
  }, [filter, reviews]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <section className="border-b border-white/5 bg-[radial-gradient(circle_at_top,_rgba(234,179,8,0.14),_transparent_32%),linear-gradient(180deg,#0a0a0b_0%,#111114_58%,#16161a_100%)] px-6 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.34em] text-yellow-400/80">CAPTURA Rental Reviews</p>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-6xl">
                What Renters Say
              </h1>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <Link
                href="/rental"
                className="inline-flex w-full items-center justify-center rounded-2xl border border-white/10 bg-zinc-900 px-5 py-3 text-sm font-black text-white transition-colors hover:bg-zinc-800 sm:w-auto"
              >
                Back to Rental
              </Link>
              <Link
                href="/rental/cameras"
                className="inline-flex w-full items-center justify-center rounded-2xl bg-white px-5 py-3 text-sm font-black text-black transition-colors hover:bg-zinc-200 sm:w-auto"
              >
                Rent a Camera
              </Link>
            </div>
          </div>

        </div>
      </section>

      <section className="px-6 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-wrap gap-2">
            {[
              { label: 'All', value: 'all' as const },
              { label: 'Featured', value: 'featured' as const },
              { label: '5 Stars', value: '5' as const },
              { label: '4+ Stars', value: '4plus' as const },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => setFilter(item.value)}
                className={`rounded-full px-4 py-2 text-sm font-black transition-colors ${
                  filter === item.value
                    ? 'bg-white text-black'
                    : 'border border-white/10 bg-zinc-900 text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="mt-10 flex min-h-[280px] items-center justify-center rounded-3xl border border-white/5 bg-zinc-900/50">
              <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-yellow-400" />
            </div>
          ) : filteredReviews.length > 0 ? (
            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {filteredReviews.map((review) => (
                <article
                  key={review.id}
                  className={`rounded-3xl border p-6 ${
                    review.featured
                      ? 'border-yellow-400/20 bg-yellow-400/[0.06]'
                      : 'border-white/5 bg-zinc-900/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-white">{review.name}</h2>
                      <p className="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-zinc-500">
                        {review.cameraName || 'Verified rental customer'}
                      </p>
                    </div>
                    {review.featured && (
                      <span className="rounded-full bg-yellow-400/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-yellow-300">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">{renderStars(review.rating)}</div>
                    <span className="text-xs font-semibold text-zinc-500">
                      {new Date(review.date).toLocaleDateString('en-MY', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-7 text-zinc-300">
                    "{review.review}"
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-3xl border border-dashed border-white/10 bg-zinc-900/40 px-6 py-16 text-center">
              <p className="text-xl font-black text-white">No approved rental reviews yet</p>
              <p className="mt-3 text-sm text-zinc-500">
                Reviews will appear here automatically after customers submit feedback and CAPTURA approves it.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
