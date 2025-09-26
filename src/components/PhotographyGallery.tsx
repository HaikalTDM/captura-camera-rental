'use client';

import { useState, useEffect } from 'react';
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

// Gallery Images - Admin-friendly structure for easy management
export const galleryImages: GalleryImage[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=600',
    alt: 'Wedding ceremony celebration',
    aspect: 'portrait',
    category: 'wedding',
    featured: true,
    order: 1,
    title: 'Joyful Celebration',
    description: 'Capturing the pure joy of a wedding ceremony.'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400',
    alt: 'Wedding bouquet details',
    aspect: 'landscape',
    category: 'wedding',
    featured: true,
    order: 2,
    title: 'Elegant Bouquet',
    description: 'Intricate details of the bridal bouquet.'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=600',
    alt: 'Bride and groom portrait',
    aspect: 'portrait',
    category: 'wedding',
    featured: false,
    order: 3,
    title: 'Timeless Love',
    description: 'A classic portrait of the happy couple.'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400',
    alt: 'Corporate event networking',
    aspect: 'landscape',
    category: 'corporate',
    featured: true,
    order: 4,
    title: 'Professional Networking',
    description: 'Capturing dynamic interactions at a corporate event.'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1556155092-490a1ba162f2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=600',
    alt: 'Graduation ceremony moment',
    aspect: 'portrait',
    category: 'graduation',
    featured: false,
    order: 5,
    title: 'Moment of Achievement',
    description: 'A proud graduate celebrating their success.'
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400',
    alt: 'Wedding ceremony moment',
    aspect: 'landscape',
    category: 'wedding',
    featured: false,
    order: 6,
    title: 'Vows Exchanged',
    description: 'The solemn moment of exchanging vows.'
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1594736797933-d0b22ce71b10?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=600',
    alt: 'Bride getting ready',
    aspect: 'portrait',
    category: 'wedding',
    featured: true,
    order: 7,
    title: 'Bridal Preparations',
    description: 'Intimate moments of the bride getting ready.'
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400',
    alt: 'Wedding venue decoration',
    aspect: 'landscape',
    category: 'wedding',
    featured: false,
    order: 8,
    title: 'Venue Elegance',
    description: 'Beautifully decorated wedding venue.'
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=600',
    alt: 'Professional portrait session outdoor',
    aspect: 'portrait',
    category: 'portrait',
    featured: true,
    order: 9,
    title: 'Outdoor Portrait',
    description: 'A captivating portrait session in natural light.'
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400',
    alt: 'Corporate headshot',
    aspect: 'square',
    category: 'corporate',
    featured: false,
    order: 10,
    title: 'Executive Headshot',
    description: 'Sharp and professional corporate headshot.'
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400',
    alt: 'Graduation ceremony',
    aspect: 'landscape',
    category: 'graduation',
    featured: false,
    order: 11,
    title: 'Graduation Day',
    description: 'Celebrating the milestone of graduation.'
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=1200',
    alt: 'Traditional wedding ceremony',
    aspect: 'portrait',
    category: 'wedding',
    featured: true,
    order: 12,
    title: 'Cultural Nuptials',
    description: 'Capturing the beauty of a traditional wedding.'
  },
  {
    id: 13,
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Graduation celebration moment',
    aspect: 'portrait',
    category: 'graduation',
    featured: true,
    order: 13,
    title: 'Triumphant Graduate',
    description: 'A candid shot of a joyous graduation moment.'
  },
  {
    id: 14,
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Professional portrait session outdoor',
    aspect: 'portrait',
    category: 'portrait',
    featured: true,
    order: 14,
    title: 'Nature Portrait',
    description: 'A stunning portrait captured in an outdoor setting.'
  },
  {
    id: 15,
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Private event celebration',
    aspect: 'landscape',
    category: 'event',
    featured: true,
    order: 15,
    title: 'Lively Event',
    description: 'Capturing the energy of a private celebration.'
  },
  {
    id: 16,
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Wedding rings close-up',
    aspect: 'portrait',
    category: 'wedding',
    featured: false,
    order: 16,
    title: 'Symbol of Love',
    description: 'A close-up of the beautiful wedding rings.'
  },
  {
    id: 17,
    url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Corporate team collaboration',
    aspect: 'landscape',
    category: 'corporate',
    featured: false,
    order: 17,
    title: 'Team Synergy',
    description: 'Documenting collaboration in a corporate environment.'
  },
  {
    id: 18,
    url: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Event candid moments',
    aspect: 'portrait',
    category: 'event',
    featured: false,
    order: 18,
    title: 'Candid Event Shot',
    description: 'Capturing genuine moments at an event.'
  }
];

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

const Lightbox = ({ images, currentIndex, isOpen, onClose, onNext, onPrev }: LightboxProps) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          onPrev();
          break;
        case 'ArrowRight':
          onNext();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrev]);

  if (!isOpen || !images[currentIndex]) return null;

  const currentImage = images[currentIndex];

  return (
    <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm" 
        onClick={onClose}
      />
      
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Navigation */}
      {images.length > 1 && (
        <>
          <button
            onClick={onPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <button
            onClick={onNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 backdrop-blur-sm"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </>
      )}

      {/* Image Container */}
      <div className="relative z-10 max-w-[90vw] max-h-[90vh] flex items-center justify-center">
        <div className="relative">
          <Image
            src={currentImage.url}
            alt={currentImage.alt}
            width={1200}
            height={800}
            className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg shadow-2xl"
            priority
          />
          
          {/* Image Info */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 rounded-b-lg">
            <h3 className="text-white font-bold text-lg mb-1">
              {currentImage.title || currentImage.alt}
            </h3>
            {currentImage.description && (
              <p className="text-white/80 text-sm">{currentImage.description}</p>
            )}
            <div className="flex items-center justify-between mt-3">
              <span className="text-[#d4af37] text-xs font-bold uppercase tracking-wider">
                {currentImage.category}
              </span>
              <span className="text-white/60 text-xs">
                {currentIndex + 1} / {images.length}
              </span>
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

  // Masonry layout groups for different screen sizes
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {Array.from({ length: 12 }).map((_, index) => (
          <div
            key={`skeleton-${index}`}
            className="group relative overflow-hidden bg-gray-100 rounded-xl border border-[#d4af37]/10 aspect-square animate-pulse"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-gray-200 to-gray-300"></div>
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

  // Responsive masonry layout
  const mobileColumns = createMasonryColumns(images, 1);
  const tabletColumns = createMasonryColumns(images, 2);
  const desktopColumns = createMasonryColumns(images, 3);
  const wideColumns = createMasonryColumns(images, 4);

  return (
    <>
      {/* Mobile Layout (1 column) */}
      <div className="block sm:hidden">
        <div className="space-y-6">
          {images.map((image, index) => (
            <div
              key={image.id}
              className="group relative overflow-hidden bg-white rounded-2xl border border-[#d4af37]/10 hover:border-[#d4af37] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
              onClick={() => openLightbox(index)}
            >
              <div className="relative w-full h-80 overflow-hidden rounded-2xl">
                <Image
                  src={image.url}
                  alt={image.alt}
                  fill
                  className="object-cover transition-all duration-700 group-hover:scale-110"
                  sizes="100vw"
                />
                
                {/* Hover Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <span className="inline-block px-3 py-1 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                      {image.category}
                    </span>
                    <h3 className="text-white font-bold text-lg">{image.title || image.alt}</h3>
                  </div>
                  
                  {/* View Icon */}
                  <div className="absolute top-4 right-4 w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tablet Layout (2 columns) */}
      <div className="hidden sm:block lg:hidden">
        <div className="grid grid-cols-2 gap-6">
          {tabletColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-6">
              {column.map((image, imageIndex) => {
                const globalIndex = images.findIndex(img => img.id === image.id);
                return (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden bg-white rounded-2xl border border-[#d4af37]/10 hover:border-[#d4af37] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                    onClick={() => openLightbox(globalIndex)}
                  >
                    <div className={`relative w-full overflow-hidden rounded-2xl ${
                      image.aspect === 'portrait' ? 'h-80' :
                      image.aspect === 'landscape' ? 'h-60' : 'h-72'
                    }`}>
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110"
                        sizes="(max-width: 1024px) 50vw, 33vw"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="inline-block px-2 py-1 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                            {image.category}
                          </span>
                          <h3 className="text-white font-bold text-sm">{image.title || image.alt}</h3>
                        </div>
                        
                        {/* View Icon */}
                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
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

      {/* Desktop Layout (3 columns) */}
      <div className="hidden lg:block xl:hidden">
        <div className="grid grid-cols-3 gap-6">
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
                    <div className={`relative w-full overflow-hidden rounded-2xl ${
                      image.aspect === 'portrait' ? 'h-80' :
                      image.aspect === 'landscape' ? 'h-60' : 'h-72'
                    }`}>
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110"
                        sizes="33vw"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="inline-block px-2 py-1 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                            {image.category}
                          </span>
                          <h3 className="text-white font-bold text-sm">{image.title || image.alt}</h3>
                        </div>
                        
                        {/* View Icon */}
                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
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

      {/* Wide Layout (4 columns) */}
      <div className="hidden xl:block">
        <div className="grid grid-cols-4 gap-6">
          {wideColumns.map((column, columnIndex) => (
            <div key={columnIndex} className="space-y-6">
              {column.map((image, imageIndex) => {
                const globalIndex = images.findIndex(img => img.id === image.id);
                return (
                  <div
                    key={image.id}
                    className="group relative overflow-hidden bg-white rounded-2xl border border-[#d4af37]/10 hover:border-[#d4af37] transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer"
                    onClick={() => openLightbox(globalIndex)}
                  >
                    <div className={`relative w-full overflow-hidden rounded-2xl ${
                      image.aspect === 'portrait' ? 'h-72' :
                      image.aspect === 'landscape' ? 'h-56' : 'h-64'
                    }`}>
                      <Image
                        src={image.url}
                        alt={image.alt}
                        fill
                        className="object-cover transition-all duration-700 group-hover:scale-110"
                        sizes="25vw"
                      />
                      
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                          <span className="inline-block px-2 py-1 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-full mb-2">
                            {image.category}
                          </span>
                          <h3 className="text-white font-bold text-sm">{image.title || image.alt}</h3>
                        </div>
                        
                        {/* View Icon */}
                        <div className="absolute top-4 right-4 w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
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
