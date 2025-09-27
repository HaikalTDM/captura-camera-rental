'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

interface PhotographyGalleryProps {
  images: GalleryImage[];
  currentFilter: string;
  isLoading?: boolean;
}

interface LightboxProps {
  images: GalleryImage[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const Lightbox: React.FC<LightboxProps> = ({ images, currentIndex, isOpen, onClose, onNext, onPrev }) => {
  if (!isOpen || currentIndex < 0 || currentIndex >= images.length) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
      <div className="relative max-w-7xl max-h-full">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <button
          onClick={onPrev}
          className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={onNext}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-white/30 transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        <div className="relative">
          <Image
            src={currentImage.url}
            alt={currentImage.alt}
            width={1200}
            height={800}
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
            priority
          />
          
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-6 rounded-b-lg">
            <div className="text-white">
              <span className="inline-block px-3 py-1 bg-[#d4af37] text-black text-sm font-bold uppercase tracking-wider rounded-full mb-3">
                {currentImage.category}
              </span>
              <h3 className="text-2xl font-bold mb-2">{currentImage.title || currentImage.alt}</h3>
              {currentImage.description && (
                <p className="text-white/90 text-lg leading-relaxed">{currentImage.description}</p>
              )}
              <p className="text-white/70 text-sm mt-3">
                {currentIndex + 1} of {images.length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PhotographyGallery({ images, currentFilter, isLoading = false }: PhotographyGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Smart masonry layout that distributes images evenly
  const createSmartMasonryColumns = (images: GalleryImage[], columnCount: number) => {
    const columns: GalleryImage[][] = Array.from({ length: columnCount }, () => []);
    
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, index) => (
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

  // Empty state
  if (!images || images.length === 0) {
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
            The gallery is currently empty. Images will appear here once they are uploaded through the admin panel.
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
  const mobileColumns = createSmartMasonryColumns(images, 1);
  const tabletColumns = createSmartMasonryColumns(images, 2);
  const desktopColumns = createSmartMasonryColumns(images, 3);
  const wideColumns = createSmartMasonryColumns(images, 4);

  return (
    <>
      {/* Mobile Layout (1 column) - Beautiful responsive layout */}
      <div className="block sm:hidden">
        <div className="space-y-8">
          {images.map((image, index) => {
            return (
              <div
                key={image.id}
                className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-1 cursor-pointer"
                onClick={() => openLightbox(index)}
              >
                <div className="relative w-full overflow-hidden rounded-3xl">
                  <Image
                    src={image.url}
                    alt={image.alt}
                    width={800}
                    height={600}
                    className="w-full h-auto transition-all duration-700 group-hover:scale-105"
                    sizes="100vw"
                  />
                  
                  {/* Elegant Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="inline-block px-4 py-2 bg-[#d4af37] text-black text-sm font-bold uppercase tracking-wider rounded-full mb-3 shadow-lg">
                            {image.category}
                          </span>
                          <h3 className="text-white font-bold text-xl mb-2">{image.title || image.alt}</h3>
                          {image.description && (
                            <p className="text-white/90 text-sm leading-relaxed">{image.description}</p>
                          )}
                        </div>
                        
                        {/* Elegant View Icon */}
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white shadow-lg">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
      </div>

      {/* Tablet Layout (2 columns) - Beautiful masonry */}
      <div className="hidden sm:block lg:hidden">
        <div className="grid grid-cols-2 gap-8">
          {tabletColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-8">
              {column.map((image, imageIndex) => {
                const globalIndex = images.findIndex(img => img.id === image.id);
                
                return (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 cursor-pointer"
                    onClick={() => openLightbox(globalIndex)}
                  >
                    <div className="relative w-full overflow-hidden rounded-3xl">
                      <Image
                        src={image.url}
                        alt={image.alt}
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
                              <h3 className="text-white font-bold text-lg mb-1">{image.title || image.alt}</h3>
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
                const globalIndex = images.findIndex(img => img.id === image.id);
                
                return (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 cursor-pointer"
                    onClick={() => openLightbox(globalIndex)}
                  >
                    <div className="relative w-full overflow-hidden rounded-3xl">
                      <Image
                        src={image.url}
                        alt={image.alt}
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
                              <h3 className="text-white font-bold text-lg mb-1">{image.title || image.alt}</h3>
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
                const globalIndex = images.findIndex(img => img.id === image.id);
                
                return (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-700 hover:-translate-y-2 cursor-pointer"
                    onClick={() => openLightbox(globalIndex)}
                  >
                    <div className="relative w-full overflow-hidden rounded-3xl">
                      <Image
                        src={image.url}
                        alt={image.alt}
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
                              <h3 className="text-white font-bold text-base mb-1">{image.title || image.alt}</h3>
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
        <Lightbox
          images={images}
          currentIndex={lightboxIndex}
          isOpen={lightboxIndex !== null}
          onClose={closeLightbox}
          onNext={nextImage}
          onPrev={prevImage}
        />
      )}
    </>
  );
}