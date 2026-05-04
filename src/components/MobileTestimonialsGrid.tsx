'use client';

import { useEffect, useRef, useState } from 'react';
import type { PublicReview } from '@/lib/reviews/types';

interface MobileTestimonialsGridProps {
  testimonials: PublicReview[];
  isLoading?: boolean;
}

export default function MobileTestimonialsGrid({ testimonials, isLoading = false }: MobileTestimonialsGridProps) {
  const [currentGridIndex, setCurrentGridIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const autoSlideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const testimonialsPerGrid = 4;
  const totalGrids = Math.ceil(testimonials.length / testimonialsPerGrid);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (totalGrids > 1 && !isTransitioning) {
      autoSlideRef.current = setTimeout(() => {
        setIsTransitioning(true);

        setTimeout(() => {
          setCurrentGridIndex((prev) => (prev + 1) % totalGrids);

          setTimeout(() => {
            setIsTransitioning(false);
          }, 400);
        }, 400);
      }, 4000);
    }

    return () => {
      if (autoSlideRef.current) {
        clearTimeout(autoSlideRef.current);
      }
    };
  }, [currentGridIndex, totalGrids, isTransitioning]);

  const currentGridTestimonials = testimonials.slice(
    currentGridIndex * testimonialsPerGrid,
    currentGridIndex * testimonialsPerGrid + testimonialsPerGrid,
  );

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        className={`h-3 w-3 ${index < rating ? 'text-[#d4af37]' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (!mounted || isLoading) {
    return (
      <div className="block sm:hidden">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`mobile-loading-${index}`}
              className="min-h-[200px] rounded-xl border border-[#d4af37]/10 bg-white p-4 shadow-lg animate-pulse"
            >
              <div className="mb-3 h-3 w-20 rounded bg-gray-200" />
              <div className="mb-3 h-2 w-24 rounded bg-gray-200" />
              <div className="space-y-2">
                <div className="h-2 rounded bg-gray-200" />
                <div className="h-2 rounded bg-gray-200" />
                <div className="h-2 w-3/4 rounded bg-gray-200" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="block sm:hidden">
      <div className="relative">
        <div className={`grid grid-cols-2 gap-4 ${isTransitioning ? 'gallery-fade-out' : 'gallery-fade-in'}`}>
          {Array.from({ length: 4 }).map((_, index) => {
            const testimonial = currentGridTestimonials[index];

            if (!testimonial) {
              return (
                <div
                  key={`mobile-empty-${index}`}
                  className="flex min-h-[200px] items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50"
                >
                  <span className="text-xs text-gray-400">No more reviews</span>
                </div>
              );
            }

            return (
              <div
                key={testimonial.id}
                className={`relative rounded-xl border bg-white p-4 shadow-lg transition-all duration-300 ${
                  testimonial.featured
                    ? 'border-[#d4af37] ring-2 ring-[#d4af37]/10'
                    : 'border-[#d4af37]/10'
                } ${isTransitioning ? 'opacity-0' : 'opacity-100'}`}
              >
                {testimonial.featured && (
                  <div className="absolute -top-2 left-2">
                    <span className="rounded-full bg-[#d4af37] px-2 py-1 text-xs font-bold uppercase tracking-wider text-black">
                      Featured
                    </span>
                  </div>
                )}

                <div className="mb-3">
                  <h3 className="truncate text-xs font-bold text-black">{testimonial.name}</h3>
                  <p className="mt-1 truncate text-xs text-black/60">
                    {testimonial.cameraName || 'Camera rental customer'}
                  </p>
                </div>

                <div className="mb-2 flex items-center justify-between">
                  <div className="flex items-center">{renderStars(testimonial.rating)}</div>
                  <span className="text-xs text-black/50">
                    {new Date(testimonial.date).toLocaleDateString('en-US', {
                      month: 'short',
                      year: '2-digit',
                    })}
                  </span>
                </div>

                <p className="mb-3 line-clamp-4 text-xs italic leading-relaxed text-black/80">
                  &quot;{testimonial.review.length > 80 ? `${testimonial.review.substring(0, 80)}...` : testimonial.review}&quot;
                </p>

                <div className="flex justify-center">
                  <span className="inline-block rounded-full bg-[#d4af37]/10 px-2 py-1 text-xs font-bold uppercase tracking-wider text-[#d4af37]">
                    Verified review
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {totalGrids > 1 && (
          <div className="mt-6 px-4">
            <div className="flex space-x-1">
              {Array.from({ length: totalGrids }).map((_, index) => (
                <div
                  key={index}
                  className="h-1 flex-1 overflow-hidden rounded-full bg-gray-200"
                >
                  <div
                    className={`h-full rounded-full transition-all duration-700 ease-in-out ${
                      index === currentGridIndex
                        ? 'bg-[#d4af37] animate-pulse'
                        : index < currentGridIndex
                        ? 'bg-[#d4af37]'
                        : 'bg-gray-200'
                    }`}
                    style={{
                      width: index === currentGridIndex ? '100%' : index < currentGridIndex ? '100%' : '0%',
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {totalGrids > 1 && (
          <div className="mt-4 text-center">
            <span className="text-sm font-medium text-gray-500">
              Grid {currentGridIndex + 1} of {totalGrids} • {testimonials.length} reviews
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
