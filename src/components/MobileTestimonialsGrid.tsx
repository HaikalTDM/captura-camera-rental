'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  company?: string;
  rating: number;
  review: string;
  image?: string;
  eventType: 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event';
  date: string;
  featured: boolean;
}

interface MobileTestimonialsGridProps {
  testimonials: Testimonial[];
  isLoading?: boolean;
}

export default function MobileTestimonialsGrid({ testimonials, isLoading = false }: MobileTestimonialsGridProps) {
  const [currentGridIndex, setCurrentGridIndex] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoSlideRef = useRef<NodeJS.Timeout>();

  // Mobile: 2x2 = 4 testimonials per grid
  const testimonialsPerGrid = 4;
  const totalGrids = Math.ceil(testimonials.length / testimonialsPerGrid);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-slide functionality with smooth transition
  useEffect(() => {
    if (totalGrids > 1 && !isTransitioning) {
      autoSlideRef.current = setTimeout(() => {
        setIsTransitioning(true);
        
        // Start fade out
        setTimeout(() => {
          setCurrentGridIndex((prev) => (prev + 1) % totalGrids);
          
          // End transition after fade in completes
          setTimeout(() => {
            setIsTransitioning(false);
          }, 400); // Half of transition duration for fade in
        }, 400); // Half of transition duration for fade out
      }, 4000); // 4 seconds for testimonials (longer than gallery)
    }

    return () => {
      if (autoSlideRef.current) {
        clearTimeout(autoSlideRef.current);
      }
    };
  }, [currentGridIndex, totalGrids, isTransitioning]);

  // Get testimonials for current grid
  const getCurrentGridTestimonials = () => {
    const startIndex = currentGridIndex * testimonialsPerGrid;
    const endIndex = startIndex + testimonialsPerGrid;
    return testimonials.slice(startIndex, endIndex);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, index) => (
      <svg
        key={index}
        className={`w-3 h-3 ${index < rating ? 'text-[#d4af37]' : 'text-gray-300'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (!mounted) {
    return (
      <div className="block sm:hidden">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`mobile-skeleton-${index}`}
              className="bg-white rounded-xl p-4 shadow-lg animate-pulse"
            >
              <div className="flex items-center mb-3">
                <div className="w-8 h-8 bg-gray-200 rounded-full mr-2"></div>
                <div>
                  <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-12"></div>
                </div>
              </div>
              <div className="space-y-2">
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-full"></div>
                <div className="h-2 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="block sm:hidden">
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={`mobile-loading-${index}`}
              className="bg-white rounded-xl p-4 shadow-lg animate-pulse flex items-center justify-center min-h-[200px]"
            >
              <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const currentGridTestimonials = getCurrentGridTestimonials();

  return (
    <div className="block sm:hidden">
      <div className="relative">
        <div 
          ref={containerRef}
          className={`grid grid-cols-2 gap-4 ${
            isTransitioning 
              ? 'gallery-fade-out' 
              : 'gallery-fade-in'
          }`}
        >
          {Array.from({ length: 4 }).map((_, index) => {
            const testimonial = currentGridTestimonials[index];
            
            if (!testimonial) {
              return (
                <div
                  key={`mobile-empty-${index}`}
                  className="bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 min-h-[200px] flex items-center justify-center"
                >
                  <span className="text-gray-400 text-xs">No more reviews</span>
                </div>
              );
            }

            return (
              <div
                key={testimonial.id}
                className={`bg-white rounded-xl shadow-lg border transition-all duration-300 p-4 relative ${
                  testimonial.featured 
                    ? 'border-[#d4af37] ring-2 ring-[#d4af37]/10' 
                    : 'border-[#d4af37]/10'
                } ${
                  isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}
                style={{
                  animationDelay: `${index * 100}ms`,
                  transition: 'opacity 0.5s ease-in-out'
                }}
              >
                {/* Featured Badge */}
                {testimonial.featured && (
                  <div className="absolute -top-2 left-2">
                    <span className="bg-[#d4af37] text-black text-xs font-bold px-2 py-1 rounded-full uppercase tracking-wider">
                      Featured
                    </span>
                  </div>
                )}
                
                {/* Client Info */}
                <div className="flex items-center mb-3">
                  {testimonial.image && (
                    <div className="relative w-8 h-8 rounded-full overflow-hidden mr-2 border border-[#d4af37]/20 flex-shrink-0">
                      <Image
                        src={testimonial.image}
                        alt={testimonial.name}
                        fill
                        className="object-cover"
                        sizes="32px"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="font-bold text-black text-xs truncate">{testimonial.name}</h3>
                    <p className="text-black/60 text-xs truncate">
                      {testimonial.role}
                    </p>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    {renderStars(testimonial.rating)}
                  </div>
                  <span className="text-xs text-black/50">
                    {new Date(testimonial.date).toLocaleDateString('en-US', { 
                      month: 'short', 
                      year: '2-digit' 
                    })}
                  </span>
                </div>

                {/* Review - Truncated */}
                <p className="text-black/80 text-xs leading-relaxed mb-3 italic line-clamp-4">
                  "{testimonial.review.length > 80 
                    ? testimonial.review.substring(0, 80) + '...' 
                    : testimonial.review}"
                </p>

                {/* Event Type Badge */}
                <div className="flex justify-center">
                  <span className="inline-block px-2 py-1 bg-[#d4af37]/10 text-[#d4af37] text-xs font-bold rounded-full uppercase tracking-wider">
                    {testimonial.eventType}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress Bar */}
        {totalGrids > 1 && (
          <div className="mt-6 px-4">
            <div className="flex space-x-1">
              {Array.from({ length: totalGrids }).map((_, index) => (
                <div
                  key={index}
                  className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden"
                >
                  <div
                    className={`h-full transition-all duration-700 ease-in-out rounded-full ${
                      index === currentGridIndex
                        ? 'bg-[#d4af37] animate-pulse'
                        : index < currentGridIndex
                        ? 'bg-[#d4af37]'
                        : 'bg-gray-200'
                    }`}
                    style={{
                      width: index === currentGridIndex ? '100%' : index < currentGridIndex ? '100%' : '0%'
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Grid Counter */}
        {totalGrids > 1 && (
          <div className="text-center mt-4">
            <span className="text-sm text-gray-500 font-medium">
              Grid {currentGridIndex + 1} of {totalGrids} • {testimonials.length} reviews
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
