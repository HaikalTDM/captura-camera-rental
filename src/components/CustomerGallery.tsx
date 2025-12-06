'use client';

import { useState, useEffect } from 'react';
import { getActiveGalleryImages, type GalleryImage } from '../lib/api/gallery';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export default function CustomerGallery() {
  const [customerImages, setCustomerImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const images = await getActiveGalleryImages();
      setCustomerImages(images);
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleImageLoad = (imageId: string) => {
    setLoadedImages(prev => new Set([...prev, imageId]));
  };

  // Lock body scroll when modal open
  useEffect(() => {
    if (selectedImage) {
      try {
        const scrollY = window.scrollY;
        document.body.style.position = 'fixed';
        document.body.style.top = `-${scrollY}px`;
        document.body.style.width = '100%';
      } catch {
        // Ignore DOM errors
      }
    } else {
      try {
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      } catch {
        // Ignore scroll errors
      }
    }
    return () => {
      try {
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
      } catch {
        // Ignore cleanup errors
      }
    };
  }, [selectedImage]);

  // Determine grid position for varied layout
  const getGridClass = (index: number) => {
    // Create visual interest with varied sizes
    // Every 7th image is featured (2x2)
    if (index % 7 === 0) return 'col-span-2 row-span-2';
    return 'col-span-1 row-span-1';
  };

  return (
    <section className="min-h-screen bg-zinc-950 py-8 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header with Personality */}
        <div className="text-center mb-10 sm:mb-16 animate-fadeIn">
          <div className="inline-flex items-center gap-2 bg-zinc-900 text-white px-4 py-2 rounded-full text-xs font-black mb-4 shadow-lg border border-white/10">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
            <span>Customer Gallery</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            Shot with Our Cameras
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base font-semibold max-w-2xl mx-auto">
            Real creators. Real moments. See what our customers captured with CAPTURA equipment.
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                className={`w-full aspect-square bg-zinc-900 rounded-2xl animate-pulse border border-white/5 ${getGridClass(i)}`}
              ></div>
            ))}
          </div>
        ) : customerImages.length > 0 ? (
          <>
            {/* Dynamic Grid with Visual Hierarchy */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 sm:gap-6 auto-rows-fr">
              {customerImages.map((image, index) => {
                const isFeatured = index % 7 === 0;

                return (
                  <div
                    key={image.id}
                    className={`group cursor-pointer relative overflow-hidden bg-zinc-900 aspect-square rounded-2xl sm:rounded-3xl border border-white/5 hover:border-white/20 transition-all duration-500 animate-scaleIn ${getGridClass(index)}`}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedImage(image)}
                  >
                    {/* Loading Skeleton */}
                    {!loadedImages.has(image.id) && (
                      <div className="absolute inset-0 bg-zinc-800 animate-pulse rounded-2xl sm:rounded-3xl"></div>
                    )}

                    {/* Image - Cover to fill square */}
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || `Photo by ${image.customer_name}`}
                      fill
                      className={`transition-all duration-700 object-cover rounded-2xl sm:rounded-3xl ${loadedImages.has(image.id) ? 'opacity-100' : 'opacity-0'
                        } group-hover:scale-110`}
                      quality={isFeatured ? 90 : 85}
                      loading={index < 6 ? 'eager' : 'lazy'}
                      priority={index < 6}
                      sizes={isFeatured ? "(max-width: 640px) 100vw, 66vw" : "(max-width: 640px) 50vw, 33vw"}
                      onLoad={() => handleImageLoad(image.id)}
                    />

                    {/* Gradient Overlay - Subtle Always, Strong on Hover */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl sm:rounded-3xl"></div>

                    {/* Info - Bottom Left, Only on Hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 md:p-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-y-4 group-hover:translate-y-0">
                      <div className="text-white">
                        <div className="text-sm sm:text-base md:text-lg font-black mb-1">{image.customer_name}</div>
                        {image.location && (
                          <div className="text-xs sm:text-sm text-white/80 font-semibold flex items-center gap-1.5">
                            <svg className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            </svg>
                            <span className="truncate text-zinc-300">{image.location}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Camera Badge - Top Right */}
                    <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl border border-white/10 opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-95 group-hover:scale-100">
                        <div className="flex items-center gap-2">
                          <svg className="w-3 h-3 sm:w-4 sm:h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                          </svg>
                          <span className="text-xs sm:text-sm text-white font-black">{image.camera_used}</span>
                        </div>
                      </div>
                    </div>

                    {/* Expand Icon - Center */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
                      <div className="w-14 h-14 sm:w-16 sm:h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center transform scale-75 group-hover:scale-100 transition-transform border border-white/20">
                        <svg className="w-6 h-6 sm:w-7 sm:h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Eye-Catching CTA */}
            <div className="text-center mt-16 sm:mt-24 animate-fadeIn" style={{ animationDelay: '400ms' }}>
              <div className="max-w-2xl mx-auto bg-gradient-to-br from-zinc-900 via-black to-zinc-900 rounded-3xl p-8 sm:p-12 shadow-2xl border border-white/10 relative overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>

                <div className="relative z-10">
                  <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md px-4 py-2 rounded-full text-xs font-black text-white mb-6 border border-white/10">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                    <span>Available Now</span>
                  </div>

                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-black text-white mb-3 tracking-tight">
                    Ready to Create?
                  </h3>
                  <p className="text-zinc-400 text-sm sm:text-base font-semibold mb-8 max-w-lg mx-auto">
                    Rent professional cameras and start capturing moments that matter. No commitment, just creativity.
                  </p>

                  <Button
                    onClick={() => window.open("https://wa.me/60177464121", "_blank")}
                    className="inline-flex items-center gap-3 bg-white text-black hover:bg-zinc-200 font-black h-auto py-4 px-8 sm:py-5 sm:px-10 rounded-2xl hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-95 text-sm sm:text-base group"
                  >
                    <svg className="w-6 h-6 group-hover:rotate-12 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                    </svg>
                    <span>Book Your Camera Now</span>
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Button>

                  <p className="text-zinc-500 text-xs sm:text-sm font-semibold mt-6">
                    🔒 Secure booking • 📦 Same day pickup • 💬 24/7 support
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-20 bg-zinc-900 rounded-3xl border border-dashed border-white/5">
            <div className="w-20 h-20 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-white/5">
              <svg className="w-10 h-10 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-zinc-500 text-base font-bold">No images yet</p>
          </div>
        )}
      </div>

      {/* Full Screen Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fadeIn cursor-zoom-out backdrop-blur-md"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all z-10 border border-white/10"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="max-w-6xl w-full max-h-[90vh] animate-scaleIn cursor-default" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full flex items-center justify-center">
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.alt_text || `Photo by ${selectedImage.customer_name}`}
                width={1400}
                height={1800}
                className="w-auto h-auto max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl"
                quality={95}
                priority
              />
            </div>

            {/* Image Info */}
            <div className="mt-8 text-center text-white animate-slideUp">
              <div className="inline-flex items-center gap-3 bg-white/5 backdrop-blur-md px-6 py-3 rounded-full mb-3 border border-white/10">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <span className="text-sm font-black">{selectedImage.camera_used}</span>
              </div>
              <h3 className="text-3xl font-black mb-2">{selectedImage.customer_name}</h3>
              {selectedImage.location && (
                <div className="text-sm text-zinc-400 font-semibold flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  </svg>
                  {selectedImage.location}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        
        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
          opacity: 0;
        }
        
        .animate-slideUp {
          animation: slideUp 0.6s ease-out 0.2s forwards;
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
