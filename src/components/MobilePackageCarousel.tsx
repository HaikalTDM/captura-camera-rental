'use client';

import { useState, useRef, useEffect } from 'react';

interface Package {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
}

interface MobilePackageCarouselProps {
  packages: Package[];
  type: 'main' | 'second';
}

export default function MobilePackageCarousel({ packages, type }: MobilePackageCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const autoSlideRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset carousel to first slide when type or packages change
  useEffect(() => {
    setCurrentIndex(0);
  }, [type, packages]);

  // Auto-slide functionality
  useEffect(() => {
    if (!isPaused && packages.length > 1) {
      autoSlideRef.current = setTimeout(() => {
        setCurrentIndex((prev) => (prev + 1) % packages.length);
      }, 3000); // 3 seconds
    }

    return () => {
      if (autoSlideRef.current) {
        clearTimeout(autoSlideRef.current);
      }
    };
  }, [currentIndex, isPaused, packages.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % packages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  // Touch/drag handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
    setIsPaused(true); // Pause auto-slide when user interacts
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return;
    
    const currentX = e.touches[0].clientX;
    const diff = startX - currentX;
    
    // Threshold for swipe detection
    if (Math.abs(diff) > 50) {
      e.preventDefault();
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      setIsDragging(false);
    }
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    // Resume auto-slide after 1 second of inactivity
    setTimeout(() => setIsPaused(false), 1000);
  };

  // Mouse drag handlers for desktop testing
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    e.preventDefault();
    
    const currentX = e.clientX;
    const diff = startX - currentX;
    
    if (Math.abs(diff) > 50) {
      if (diff > 0) {
        nextSlide();
      } else {
        prevSlide();
      }
      setIsDragging(false);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // No need for scroll-based approach, using transform instead

  const getWhatsAppMessage = (pkg: Package) => {
    return encodeURIComponent(
      `Hi! I'm interested in the ${pkg.name} photography package (${pkg.price}). Can you provide more details about availability and booking?`
    );
  };

  return (
    <div className="lg:hidden mb-12 sm:mb-20">
      {/* Carousel Container */}
      <div
        className="relative overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="flex transition-transform duration-300 ease-out"
          style={{ 
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {packages.map((pkg) => (
            <div 
              key={pkg.id} 
              className="w-full flex-shrink-0 px-4"
            >
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden h-auto">
                {/* Package Header */}
                <div className="p-6 pb-4">
                  <div className="text-center mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-black mb-2 font-serif">
                      {pkg.name}
                    </h3>
                    <div className="text-3xl sm:text-4xl font-bold text-[#d4af37] mb-2">
                      {pkg.price}
                    </div>
                    <div className="flex items-center justify-center text-gray-600 text-sm">
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {pkg.duration}
                    </div>
                  </div>


                  {/* Features */}
                  <div className="space-y-3 mb-6">
                    {pkg.features.map((feature, index) => (
                      <div key={index} className="flex items-center text-sm">
                        <div className="w-5 h-5 rounded-full bg-[#d4af37]/20 flex items-center justify-center mr-3 flex-shrink-0">
                          <svg className="w-3 h-3 text-[#d4af37]" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Book Now Button */}
                  <a
                    href={`https://wa.me/60177464121?text=${getWhatsAppMessage(pkg)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-black text-white py-4 px-6 rounded-xl font-bold text-center uppercase tracking-wider hover:bg-gray-800 transition-all duration-300 flex items-center justify-center"
                  >
                    <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.687"/>
                    </svg>
                    Book Now
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mt-6 px-4">
        <div className="flex space-x-1">
          {packages.map((_, index) => (
            <div
              key={index}
              className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden cursor-pointer"
              onClick={() => {
                goToSlide(index);
                setIsPaused(true);
                setTimeout(() => setIsPaused(false), 1000);
              }}
            >
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? 'bg-[#d4af37] animate-pulse'
                    : index < currentIndex
                    ? 'bg-[#d4af37]'
                    : 'bg-gray-200'
                }`}
                style={{
                  width: index === currentIndex ? '100%' : index < currentIndex ? '100%' : '0%'
                }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Package Counter */}
      <div className="text-center mt-4">
        <span className="text-sm text-gray-500 font-medium">
          {currentIndex + 1} of {packages.length}
        </span>
      </div>
    </div>
  );
}
