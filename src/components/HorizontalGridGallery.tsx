'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

export interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  aspect: 'portrait' | 'landscape' | 'square';
  category: 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event';
  featured: boolean;
  order: number;
  title?: string;
  description?: string;
}

interface HorizontalGridGalleryProps {
  images: GalleryImage[];
  currentFilter?: string;
  isLoading?: boolean;
}

const Lightbox = ({ 
  image, 
  isOpen, 
  onClose, 
  onNext, 
  onPrev,
  currentIndex,
  totalImages
}: {
  image: GalleryImage;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  currentIndex: number;
  totalImages: number;
}) => {
  useEffect(() => {
    if (isOpen) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
        if (e.key === 'ArrowRight') onNext();
        if (e.key === 'ArrowLeft') onPrev();
      };
      
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 text-white hover:text-[#d4af37] transition-colors z-10 p-2"
        aria-label="Close lightbox"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation Arrows */}
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-[#d4af37] transition-colors p-2"
        aria-label="Previous image"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-[#d4af37] transition-colors p-2"
        aria-label="Next image"
      >
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      {/* Image */}
      <div className="relative max-w-full max-h-full">
        <Image
          src={image.url}
          alt={image.alt}
          width={1200}
          height={800}
          className="object-contain max-w-full max-h-[80vh]"
          priority
        />
        
        {/* Image Info */}
        <div className="absolute bottom-4 left-4 text-white">
          <p className="text-sm opacity-75">
            {currentIndex + 1} of {totalImages}
          </p>
          {image.title && (
            <h3 className="text-lg font-semibold">{image.title}</h3>
          )}
          {image.description && (
            <p className="text-sm opacity-90 max-w-md">{image.description}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default function HorizontalGridGallery({ images, currentFilter, isLoading = false }: HorizontalGridGalleryProps) {
  const [currentMobileGridIndex, setCurrentMobileGridIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const mobileAutoSlideRef = useRef<NodeJS.Timeout>();

  // Mobile: 2x2 = 4 images per grid
  const mobileImagesPerGrid = 4;
  const totalMobileGrids = Math.ceil(images.length / mobileImagesPerGrid);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Auto-slide functionality for mobile only with smooth transition
  useEffect(() => {
    if (totalMobileGrids > 1 && !isTransitioning) {
      mobileAutoSlideRef.current = setTimeout(() => {
        setIsTransitioning(true);
        
        // Start fade out
        setTimeout(() => {
          setCurrentMobileGridIndex((prev) => (prev + 1) % totalMobileGrids);
          
          // End transition after fade in completes
          setTimeout(() => {
            setIsTransitioning(false);
          }, 400); // Half of transition duration for fade in
        }, 400); // Half of transition duration for fade out
      }, 3000); // 3 seconds for automatic transition
    }

    return () => {
      if (mobileAutoSlideRef.current) {
        clearTimeout(mobileAutoSlideRef.current);
      }
    };
  }, [currentMobileGridIndex, totalMobileGrids, isTransitioning]);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    document.body.style.overflow = 'unset';
  };

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? images.length - 1 : lightboxIndex - 1);
    }
  };

  // Get images for current mobile grid
  const getCurrentMobileGridImages = () => {
    const startIndex = currentMobileGridIndex * mobileImagesPerGrid;
    const endIndex = startIndex + mobileImagesPerGrid;
    return images.slice(startIndex, endIndex);
  };

  // Create masonry columns for desktop
  const createMasonryColumns = (images: GalleryImage[], columnCount: number) => {
    const columns: GalleryImage[][] = Array.from({ length: columnCount }, () => []);
    
    images.forEach((image, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(image);
    });
    
    return columns;
  };

  if (!mounted) {
    return (
      <>
        {/* Mobile Loading */}
        <div className="block sm:hidden">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`mobile-skeleton-${index}`}
                className="aspect-square bg-gray-200 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
        
        {/* Desktop Loading */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 12 }).map((_, index) => (
              <div
                key={`desktop-skeleton-${index}`}
                className="group relative overflow-hidden bg-gray-100 rounded-xl border border-[#d4af37]/10 aspect-square animate-pulse"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  if (isLoading) {
    return (
      <>
        {/* Mobile Loading */}
        <div className="block sm:hidden">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div
                key={`mobile-loading-${index}`}
                className="aspect-square bg-gray-100 rounded-xl animate-pulse flex items-center justify-center"
              >
                <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Desktop Loading */}
        <div className="hidden sm:block">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`desktop-loading-${index}`}
                className="group relative overflow-hidden bg-gray-100 rounded-xl border border-[#d4af37]/10 aspect-square animate-pulse"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  }

  const currentMobileGridImages = getCurrentMobileGridImages();
  
  // Desktop masonry layout
  const desktopColumns = createMasonryColumns(images, 4);

  return (
    <>
      {/* Mobile Layout: 2x2 Auto-Slide Grid */}
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
              const image = currentMobileGridImages[index];
              
              if (!image) {
                return (
                  <div
                    key={`mobile-empty-${index}`}
                    className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200"
                  />
                );
              }

              const globalIndex = currentMobileGridIndex * mobileImagesPerGrid + index;

              return (
                <div
                  key={image.id}
                  className={`group relative aspect-square overflow-hidden bg-white rounded-xl border border-[#d4af37]/10 hover:border-[#d4af37] transition-all duration-300 hover:shadow-xl cursor-pointer hover:scale-105 ${
                    isTransitioning ? 'opacity-0' : 'opacity-100'
                  }`}
                  style={{
                    animationDelay: `${index * 100}ms`,
                    transition: 'opacity 0.5s ease-in-out'
                  }}
                  onClick={() => openLightbox(globalIndex)}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-110"
                    sizes="50vw"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                      </svg>
                    </div>
                  </div>

                  {/* Featured Badge */}
                  {image.featured && (
                    <div className="absolute top-2 right-2">
                      <div className="w-2 h-2 bg-[#d4af37] rounded-full"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Mobile Progress Bar */}
          {totalMobileGrids > 1 && (
            <div className="mt-6 px-4">
              <div className="flex space-x-1">
                {Array.from({ length: totalMobileGrids }).map((_, index) => (
                  <div
                    key={index}
                    className="flex-1 h-1 bg-gray-200 rounded-full overflow-hidden"
                  >
                    <div
                      className={`h-full transition-all duration-700 ease-in-out rounded-full ${
                        index === currentMobileGridIndex
                          ? 'bg-[#d4af37] animate-pulse'
                          : index < currentMobileGridIndex
                          ? 'bg-[#d4af37]'
                          : 'bg-gray-200'
                      }`}
                      style={{
                        width: index === currentMobileGridIndex ? '100%' : index < currentMobileGridIndex ? '100%' : '0%'
                      }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Desktop Layout: Original Masonry Grid */}
      <div className="hidden sm:block">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {desktopColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-6">
              {column.map((image, imageIndex) => {
                const globalIndex = images.findIndex(img => img.id === image.id);
                return (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden bg-white rounded-2xl border border-[#d4af37]/10 hover:border-[#d4af37] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                    onClick={() => openLightbox(globalIndex)}
                  >
                    <Image
                      src={image.url}
                      alt={image.alt}
                      width={400}
                      height={image.aspect === 'portrait' ? 600 : image.aspect === 'landscape' ? 300 : 400}
                      className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    
                    {/* Desktop Hover Overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-500 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 text-center text-white p-6">
                        <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                        {image.title && (
                          <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
                        )}
                        <p className="text-sm opacity-90 uppercase tracking-wider">{image.category}</p>
                      </div>
                    </div>

                    {/* Desktop Featured Badge */}
                    {image.featured && (
                      <div className="absolute top-4 right-4">
                        <div className="w-4 h-4 bg-[#d4af37] rounded-full border-2 border-white shadow-lg"></div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && images[lightboxIndex] && (
        <Lightbox
          image={images[lightboxIndex]}
          isOpen={lightboxIndex !== null}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
          currentIndex={lightboxIndex}
          totalImages={images.length}
        />
      )}
    </>
  );
}
