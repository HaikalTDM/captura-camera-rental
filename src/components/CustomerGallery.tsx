'use client';

import { useState, useEffect } from 'react';
import { getActiveImages } from '@/data/galleryData';

export default function CustomerGallery() {
  const [customerImages, setCustomerImages] = useState(getActiveImages());

  // Listen for storage changes (when admin updates images)
  useEffect(() => {
    const handleStorageChange = () => {
      setCustomerImages(getActiveImages());
    };

    // Listen for storage events
    window.addEventListener('storage', handleStorageChange);

    // Also listen for custom storage events (same-tab updates)
    const handleCustomStorageChange = (e: StorageEvent) => {
      if (e.key === 'captura_gallery_images') {
        setCustomerImages(getActiveImages());
      }
    };

    window.addEventListener('storage', handleCustomStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('storage', handleCustomStorageChange);
    };
  }, []);

  return (
    <section id="gallery" className="py-16 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-16 h-16 bg-blue-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-12 h-12 bg-indigo-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-purple-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-14 h-14 bg-blue-500 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-white/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">📸</span>
                <span className="text-lg font-bold text-gray-900">Happy Customers</span>
                <span className="text-2xl animate-pulse">✨</span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            📷 See Our Cameras in Action! 📷
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Real customers, real moments, real memories captured with CAPTURA's professional camera equipment
          </p>
        </div>

        {/* Infinite Image Carousel */}
        <div className="w-full overflow-hidden">
          <div className="relative">
            {/* Carousel Track */}
            <div className="flex animate-scroll-infinite-images transform-gpu">
              {/* Triple set of images for smooth infinite scroll */}
              {customerImages.concat(customerImages, customerImages).map((image, index) => (
                <div key={index} className="flex-shrink-0 w-64 sm:w-72 mx-2 sm:mx-3">
                  <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 overflow-hidden hover:scale-105 transition-all duration-300 ease-out group transform-gpu">
                    {/* Image Container */}
                    <div className="relative overflow-hidden">
                      <div className="aspect-[3/4] bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        {/* Placeholder for actual images */}
                        <div className="text-center text-gray-500">
                          <div className="text-4xl mb-2">📷</div>
                          <div className="text-sm font-medium">Customer Photo</div>
                          <div className="text-xs">{image.customer}</div>
                        </div>
                      </div>
                      
                      {/* Overlay with camera info */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="absolute bottom-4 left-4 right-4 text-white">
                          <div className="text-sm font-semibold">{image.customer}</div>
                          <div className="text-xs opacity-90">📍 {image.location}</div>
                        </div>
                      </div>

                      {/* Camera badge */}
                      <div className="absolute top-3 right-3">
                        <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-medium text-gray-800 shadow-lg">
                          📷 {image.camera}
                        </div>
                      </div>

                      {/* Sparkle effect */}
                      <div className="absolute top-3 left-3 text-yellow-400 animate-pulse">✨</div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {image.customer.charAt(0)}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{image.customer}</div>
                            <div className="text-xs text-gray-600">📍 {image.location}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-blue-600 font-medium">{image.camera}</div>
                          <div className="flex text-yellow-400 text-xs">
                            {'⭐'.repeat(5)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Gradient overlays for smooth edges */}
            <div className="absolute top-0 left-0 w-20 h-full bg-gradient-to-r from-blue-50 to-transparent pointer-events-none z-10"></div>
            <div className="absolute top-0 right-0 w-20 h-full bg-gradient-to-l from-purple-50 to-transparent pointer-events-none z-10"></div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-12">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl border border-white/20 max-w-2xl mx-auto">
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              🌟 Join Our Happy Customers! 🌟
            </h3>
            <p className="text-gray-600 mb-4">
              Rent professional cameras and create your own amazing memories. Your photo could be featured here next!
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✅</span>
                <span>Professional Equipment</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✅</span>
                <span>Affordable Rates</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500">✅</span>
                <span>Quick Booking</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
