'use client';

import { useState, useEffect } from 'react';
import { getActiveGalleryImages, type GalleryImage } from '../lib/api/gallery';
import Image from 'next/image';

export default function CustomerGallery() {
  const [customerImages, setCustomerImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  // Load images from database
  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      const images = await getActiveGalleryImages();
      setCustomerImages(images);
    } catch (error) {
      console.error('Error loading gallery images:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="gallery" className="py-12 bg-gradient-to-br from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-lg border border-slate-200">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📸</span>
                <span className="text-lg font-black text-black">Happy Customers</span>
                <span className="text-2xl">✨</span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-black text-black mb-4">
            📷 See Our Cameras in Action! 📷
          </h2>
          <p className="text-lg text-slate-600 font-semibold max-w-2xl mx-auto">
            Real customers, real moments, real memories captured with CAPTURA&apos;s professional camera equipment
          </p>
        </div>

        {/* Loading State */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 animate-fadeIn">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[4/5] bg-slate-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : customerImages.length > 0 ? (
          <>
            {/* Bento Box Grid - Responsive Masonry */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {customerImages.map((image, index) => {
                // Create varied heights for visual interest
                const isLarge = index % 7 === 0 || index % 11 === 0;
                const isMedium = index % 5 === 0;
                
                return (
                  <div
                    key={image.id}
                    className={`
                      relative rounded-2xl overflow-hidden group cursor-pointer border-2 border-slate-200 hover:border-black transition-all duration-300 shadow-md hover:shadow-2xl animate-fadeIn
                      ${isLarge ? 'col-span-2 row-span-2' : isMedium ? 'row-span-2' : ''}
                      ${isLarge ? 'h-[400px] sm:h-[500px]' : isMedium ? 'h-[300px] sm:h-[400px]' : 'h-[180px] sm:h-[240px]'}
                    `}
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedImage(image)}
                  >
                    {/* Image */}
                    <Image
                      src={image.image_url}
                      alt={image.alt_text || `Photo by ${image.customer_name}`}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                    {/* Camera Badge - Always visible */}
                    <div className="absolute top-3 right-3">
                      <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-black text-black shadow-lg flex items-center gap-1.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        </svg>
                        <span>{image.camera_used}</span>
                      </div>
                    </div>

                    {/* Info Overlay - Shows on hover */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-white">
                        <div className="text-base font-black mb-1">{image.customer_name}</div>
                        {image.location && (
                          <div className="text-xs text-white/80 font-semibold flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            {image.location}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Expand Icon - Shows on hover */}
                    <div className="absolute top-3 left-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center">
                        <svg className="w-4 h-4 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          /* No Images Fallback */
          <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-slate-600 font-bold mb-1">No gallery images yet</p>
            <p className="text-sm text-slate-500 font-semibold mb-4">Upload photos to showcase your work</p>
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-16">
          <div className="bg-gradient-to-br from-black to-slate-900 rounded-2xl p-8 shadow-xl max-w-2xl mx-auto">
            <h3 className="text-2xl font-black text-white mb-3">
              🌟 Join Our Happy Customers! 🌟
            </h3>
            <p className="text-slate-300 font-semibold mb-6">
              Rent professional cameras and create your own amazing memories. Your photo could be featured here next!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
              <div className="flex items-center gap-2 text-sm text-slate-300 font-semibold">
                <span className="text-green-400">✓</span>
                <span>Professional Equipment</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300 font-semibold">
                <span className="text-green-400">✓</span>
                <span>Affordable Rates</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-slate-300 font-semibold">
                <span className="text-green-400">✓</span>
                <span>Quick Booking</span>
              </div>
            </div>
            <a
              href="https://wa.me/601157119090"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-green-500 text-white font-black py-4 px-8 rounded-xl hover:scale-105 transition-all duration-300 shadow-2xl active:scale-95"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Image Modal - Full Screen View */}
      {selectedImage && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-6 right-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-all"
            onClick={() => setSelectedImage(null)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <div className="max-w-4xl w-full">
            <div className="relative aspect-[4/5] sm:aspect-[16/10] rounded-2xl overflow-hidden">
              <Image
                src={selectedImage.image_url}
                alt={selectedImage.alt_text || `Photo by ${selectedImage.customer_name}`}
                fill
                className="object-contain"
                sizes="(max-width: 1024px) 100vw, 1024px"
              />
            </div>

            {/* Image Info */}
            <div className="mt-6 text-center text-white">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full mb-3">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
                <span className="text-sm font-black">{selectedImage.camera_used}</span>
              </div>
              <h3 className="text-2xl font-black mb-2">{selectedImage.customer_name}</h3>
              {selectedImage.location && (
                <div className="text-sm text-white/80 font-semibold flex items-center justify-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
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
          opacity: 0;
        }
      `}</style>
    </section>
  );
}
