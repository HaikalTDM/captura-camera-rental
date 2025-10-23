'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { type PhotographyGalleryImage } from '../lib/api/photography-gallery';

interface PhotographyGalleryProps {
  currentFilter?: string;
}

export default function PhotographyGalleryNew({ currentFilter = 'all' }: PhotographyGalleryProps) {
  const [images, setImages] = useState<PhotographyGalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setIsLoading(true);
      // No timeout - let the database take its time
      const response = await fetch('/api/photography/gallery-new');
      if (!response.ok) {
        console.warn('Failed to load gallery images, will keep trying...');
        return;
      }
      const data = await response.json();
      setImages(data.images || []);
    } catch (error) {
      console.error('Error loading photography gallery images:', error);
      // Don't hide loading state on error - let user know we're still trying
    } finally {
      setIsLoading(false);
    }
  };

  // Filter images by category
  const filteredImages = currentFilter === 'all' 
    ? images 
    : images.filter(image => image.category === currentFilter);

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    try {
      document.body.style.overflow = 'hidden';
    } catch (e) {
      // Ignore DOM errors
    }
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
    try {
      document.body.style.overflow = 'unset';
    } catch (e) {
      // Ignore DOM errors
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      try {
        document.body.style.overflow = 'unset';
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, []);

  const nextImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % filteredImages.length);
    }
  };

  const prevImage = () => {
    if (lightboxIndex !== null) {
      setLightboxIndex(lightboxIndex === 0 ? filteredImages.length - 1 : lightboxIndex - 1);
    }
  };

  // Smart masonry layout that distributes images evenly
  const createSmartMasonryColumns = (images: PhotographyGalleryImage[], columnCount: number) => {
    const columns: PhotographyGalleryImage[][] = Array.from({ length: columnCount }, () => []);
    
    // Simple round-robin distribution for natural image flow
    images.forEach((image, index) => {
      const columnIndex = index % columnCount;
      columns[columnIndex].push(image);
    });
    
    return columns;
  };

  if (!mounted) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="group relative overflow-hidden bg-gray-100 rounded-xl border border-[#d4af37]/10 aspect-square animate-pulse"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (isLoading) {
    return (
      <>
        {/* Loading Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-3 px-6 py-3 bg-[#d4af37]/10 rounded-full border border-[#d4af37]/20">
            <div className="w-5 h-5 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[#d4af37] font-medium">Loading beautiful photography...</span>
          </div>
          <p className="text-gray-600 text-sm mt-3">
            ✨ Taking time to load high-quality images for the best experience
          </p>
        </div>
        
        {/* Mobile Skeleton (2 columns) */}
        <div className="block md:hidden">
          <div className="grid grid-cols-2 gap-3 px-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`mobile-skeleton-${index}`}
                className={`group relative overflow-hidden bg-gray-100 rounded-2xl border border-[#d4af37]/10 animate-pulse
                  ${index % 3 === 0 ? 'aspect-[3/4]' : index % 3 === 1 ? 'aspect-square' : 'aspect-[4/3]'}
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#d4af37] border-t-transparent rounded-full animate-spin"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Desktop Skeleton */}
        <div className="hidden md:block">
          <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={`desktop-skeleton-${index}`}
                className="group relative overflow-hidden bg-gray-100 rounded-xl border border-[#d4af37]/10 aspect-square animate-pulse"
                style={{ animationDelay: `${index * 150}ms` }}
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

  // Empty state
  if (!filteredImages || filteredImages.length === 0) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="text-center">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No Images Yet</h3>
          <p className="text-gray-500 mb-6 max-w-md">
            The photography gallery is currently empty. Images will appear here once they are uploaded through the admin panel.
          </p>
          <div className="space-y-2">
            <p className="text-sm text-gray-400">
              To add images, go to the admin panel and upload photos to the gallery.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Responsive smart masonry layout
  const mobileColumns = createSmartMasonryColumns(filteredImages, 2); // Changed to 2 columns for mobile
  const tabletColumns = createSmartMasonryColumns(filteredImages, 2);
  const desktopColumns = createSmartMasonryColumns(filteredImages, 3);
  const wideColumns = createSmartMasonryColumns(filteredImages, 4);

  return (
    <>
      {/* Mobile Layout (2 columns) - Optimized masonry layout */}
      <div className="block md:hidden">
        <div className="grid grid-cols-2 gap-3 px-2">
          {mobileColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-3" style={{ animationDelay: `${columnIndex * 100}ms` }}>
              {column.map((image, imageIndex) => {
                const globalIndex = filteredImages.findIndex(img => img.id === image.id);
                
                // Calculate dynamic height based on image aspect ratio for better mobile experience
                const aspectRatio = image.aspect_ratio || 1;
                const isPortrait = aspectRatio < 0.9;
                const isLandscape = aspectRatio > 1.3;
                const isSquare = !isPortrait && !isLandscape;
                
                return (
                  <div
                    key={image.id}
                    className={`group relative overflow-hidden bg-white rounded-2xl shadow-md hover:shadow-xl active:scale-95 transition-all duration-300 cursor-pointer touch-manipulation
                      ${isPortrait ? 'aspect-[3/4]' : isLandscape ? 'aspect-[4/3]' : 'aspect-square'}
                    `}
                    onClick={() => openLightbox(globalIndex)}
                    onTouchStart={() => {}} // Enable active states on iOS
                  >
                    <div className="relative w-full h-full overflow-hidden rounded-2xl">
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || image.title}
                        fill
                        className="object-cover transition-all duration-300 group-hover:scale-105 group-active:scale-100"
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 50vw, 33vw"
                        loading="lazy"
                        quality={85}
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+Rw="
                      />
                      
                      {/* Mobile-optimized overlay with minimal info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <span className="inline-block px-2 py-1 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wide rounded-full mb-1 shadow-sm">
                                {image.category}
                              </span>
                              <h3 className="text-white font-semibold text-sm mb-1 truncate">{image.title}</h3>
                              {image.description && (
                                <p className="text-white/80 text-xs leading-tight overflow-hidden"
                                   style={{
                                     display: '-webkit-box',
                                     WebkitLineClamp: 2,
                                     WebkitBoxOrient: 'vertical'
                                   }}
                                >
                                  {image.description}
                                </p>
                              )}
                            </div>
                            
                            {/* Compact view icon for mobile */}
                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white ml-2 shadow-sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tablet Layout (2 columns) - Beautiful masonry */}
      <div className="hidden md:block lg:hidden">
        <div className="grid grid-cols-2 gap-8">
          {tabletColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-8">
              {column.map((image, imageIndex) => {
                const globalIndex = filteredImages.findIndex(img => img.id === image.id);
                
                return (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 cursor-pointer"
                    onClick={() => openLightbox(globalIndex)}
                  >
                    <div className="relative w-full overflow-hidden rounded-3xl">
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || image.title}
                        width={600}
                        height={400}
                        className="w-full h-auto transition-all duration-700 group-hover:scale-105"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                      
                      {/* Elegant Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="inline-block px-3 py-1.5 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-full mb-2 shadow-lg">
                                {image.category}
                              </span>
                              <h3 className="text-white font-bold text-lg mb-1">{image.title}</h3>
                              {image.description && (
                                <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{image.description}</p>
                              )}
                            </div>
                            
                            {/* Elegant View Icon */}
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Desktop Layout (3 columns) - Beautiful masonry */}
      <div className="hidden lg:block xl:hidden">
        <div className="grid grid-cols-3 gap-8">
          {desktopColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-8">
              {column.map((image, imageIndex) => {
                const globalIndex = filteredImages.findIndex(img => img.id === image.id);
                
                return (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 cursor-pointer"
                    onClick={() => openLightbox(globalIndex)}
                  >
                    <div className="relative w-full overflow-hidden rounded-3xl">
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || image.title}
                        width={500}
                        height={400}
                        className="w-full h-auto transition-all duration-700 group-hover:scale-105"
                        sizes="33vw"
                      />
                      
                      {/* Elegant Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="inline-block px-3 py-1.5 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-full mb-2 shadow-lg">
                                {image.category}
                              </span>
                              <h3 className="text-white font-bold text-lg mb-1">{image.title}</h3>
                              {image.description && (
                                <p className="text-white/90 text-sm leading-relaxed line-clamp-2">{image.description}</p>
                              )}
                            </div>
                            
                            {/* Elegant View Icon */}
                            <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Wide Layout (4 columns) - Beautiful masonry */}
      <div className="hidden xl:block">
        <div className="grid grid-cols-4 gap-8">
          {wideColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-8">
              {column.map((image, imageIndex) => {
                const globalIndex = filteredImages.findIndex(img => img.id === image.id);
                
                return (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 cursor-pointer"
                    onClick={() => openLightbox(globalIndex)}
                  >
                    <div className="relative w-full overflow-hidden rounded-3xl">
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || image.title}
                        width={400}
                        height={300}
                        className="w-full h-auto transition-all duration-700 group-hover:scale-105"
                        sizes="25vw"
                      />
                      
                      {/* Elegant Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <span className="inline-block px-2.5 py-1 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-full mb-2 shadow-lg">
                                {image.category}
                              </span>
                              <h3 className="text-white font-bold text-base mb-1">{image.title}</h3>
                              {image.description && (
                                <p className="text-white/90 text-xs leading-relaxed line-clamp-2">{image.description}</p>
                              )}
                            </div>
                            
                            {/* Elegant View Icon */}
                            <div className="w-9 h-9 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
          <div className="relative max-w-7xl max-h-full">
            <button
              onClick={closeLightbox}
              className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div className="relative">
              <Image
                src={filteredImages[lightboxIndex].image_url}
                alt={filteredImages[lightboxIndex].alt_text || filteredImages[lightboxIndex].title}
                width={1200}
                height={800}
                className="max-w-full max-h-[80vh] object-contain rounded-lg"
                priority
              />
              
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-lg">
                <div className="text-white">
                  <span className="inline-block px-3 py-1 bg-[#d4af37] text-black text-sm font-bold uppercase tracking-wider rounded-full mb-3">
                    {filteredImages[lightboxIndex].category}
                  </span>
                  <h3 className="text-2xl font-bold mb-2">{filteredImages[lightboxIndex].title}</h3>
                  {filteredImages[lightboxIndex].description && (
                    <p className="text-white/90 text-lg leading-relaxed">{filteredImages[lightboxIndex].description}</p>
                  )}
                  <p className="text-white/70 text-sm mt-3">
                    {lightboxIndex + 1} of {filteredImages.length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
