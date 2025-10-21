'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getActiveGalleryImages } from '@/lib/api/gallery';
import type { GalleryImage } from '@/lib/api/gallery';
import Image from 'next/image';

export default function RentalHome() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0 });
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isLoadingGallery, setIsLoadingGallery] = useState(true);

  useEffect(() => {
    // Countdown to CNY 2025
    const calculateTimeLeft = () => {
      const cnyDate = new Date('2025-01-29').getTime();
      const now = new Date().getTime();
      const difference = cnyDate - now;

      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000 * 60 * 60); // Update every hour

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    loadGalleryImages();
  }, []);

  const loadGalleryImages = async () => {
    try {
      const images = await getActiveGalleryImages();
      setGalleryImages(images.slice(0, 6)); // Show max 6 images
    } catch (error) {
      console.error('Error loading gallery:', error);
    } finally {
      setIsLoadingGallery(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero Section - Emotional & Focused */}
      <section className="bg-gradient-to-br from-black via-slate-900 to-black text-white pt-20 pb-16 px-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-lg mx-auto relative z-10">
          {/* Brand Logo */}
          <div className="text-center mb-8 animate-fadeIn">
            <div className="inline-flex items-center justify-center gap-3 bg-white/10 backdrop-blur-md px-6 py-3 rounded-full border border-white/20 mb-8">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="text-lg font-black tracking-tight">CAPTURA</span>
            </div>
          </div>

          {/* Main Headline - Emotional */}
          <div className="text-center mb-8">
            <h1 className="text-5xl sm:text-6xl font-black mb-4 leading-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent animate-fadeIn">
              Create Content<br />That Stands Out
            </h1>
            <p className="text-slate-300 font-semibold text-base mb-2 animate-fadeIn" style={{ animationDelay: '0.2s' }}>
              Professional DJI cameras without the commitment
            </p>
            <p className="text-slate-400 font-medium text-sm animate-fadeIn" style={{ animationDelay: '0.3s' }}>
              Kuala Lumpur's trusted camera rental
            </p>
          </div>

          {/* Trust Stats - Inline */}
          <div className="flex items-center justify-center gap-6 mb-8 animate-fadeIn" style={{ animationDelay: '0.4s' }}>
            <div className="text-center">
              <div className="text-3xl font-black mb-1">15+</div>
              <div className="text-xs text-slate-400 font-bold">Happy Clients</div>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <div className="text-3xl font-black mb-1">20+</div>
              <div className="text-xs text-slate-400 font-bold">Rentals</div>
            </div>
            <div className="w-px h-12 bg-white/20"></div>
            <div className="text-center">
              <div className="text-3xl font-black mb-1">4.9</div>
              <div className="text-xs text-slate-400 font-bold">Rating</div>
            </div>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => router.push('/rental/cameras')}
            className="w-full bg-white text-black font-black py-5 px-6 rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl active:scale-95 mb-4 animate-fadeIn"
            style={{ animationDelay: '0.5s' }}
          >
            View Available Cameras →
          </button>

          {/* Secondary Info */}
          <div className="text-center">
            <p className="text-sm text-slate-400 font-semibold">
              ✓ Free pickup • ✓ Fully insured • ✓ 24/7 support
            </p>
          </div>
        </div>
      </section>

      {/* Event Spotlight - Urgency Creator */}
      {timeLeft.days > 0 && timeLeft.days < 30 && (
        <section className="py-6 px-6 bg-gradient-to-r from-red-500 to-orange-600">
          <div className="max-w-lg mx-auto">
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-2xl">🎊</span>
                  <h3 className="text-lg font-black text-white">CNY 2025 Special</h3>
                </div>
                <p className="text-sm text-white/90 font-semibold">
                  15% off all bookings • Perfect for family gatherings
                </p>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/30">
                  <div className="text-2xl font-black text-white">{timeLeft.days}</div>
                  <div className="text-xs text-white/80 font-bold">days left</div>
                </div>
              </div>
            </div>
            <button
              onClick={() => router.push('/rental/events')}
              className="w-full bg-white text-red-600 font-black py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300 active:scale-95 mt-4 shadow-xl"
            >
              View Event Details →
            </button>
          </div>
        </section>
      )}

      {/* Customer Proof - Social Validation */}
      <section className="py-12 px-6 bg-white">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-black mb-2">Shot With Our Cameras</h2>
            <p className="text-sm text-slate-600 font-semibold">
              Real content from real creators
            </p>
          </div>

          {/* Loading State */}
          {isLoadingGallery ? (
            <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex-shrink-0 w-[280px]"
                >
                  <div className="bg-slate-200 rounded-2xl aspect-[4/5] relative overflow-hidden animate-pulse">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <svg className="w-16 h-16 text-slate-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : galleryImages.length > 0 ? (
            <>
              {/* Horizontal Scroll Gallery - Real Images */}
              <div className="flex gap-4 overflow-x-auto scrollbar-hide pb-4 -mx-6 px-6 snap-x snap-mandatory">
                {galleryImages.map((image, index) => (
                  <div
                    key={image.id}
                    className="flex-shrink-0 w-[280px] snap-center animate-fadeIn"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl aspect-[4/5] relative overflow-hidden group cursor-pointer border-2 border-slate-200 hover:border-black transition-all duration-300">
                      {/* Real Customer Photo */}
                      <Image
                        src={image.image_url}
                        alt={image.alt_text || `Photo by ${image.customer_name}`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                        sizes="280px"
                      />

                      {/* Info Overlay */}
                      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                        <div className="text-white">
                          <div className="text-xs font-bold text-white/70 mb-1">Shot with</div>
                          <div className="text-sm font-black">{image.camera_used}</div>
                          <div className="text-xs font-semibold text-white/80 mt-1">
                            {image.customer_name}
                            {image.location && ` • ${image.location}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* View Gallery CTA */}
              <div className="text-center mt-6">
                <button
                  onClick={() => router.push('/rental/gallery')}
                  className="text-black font-black hover:underline"
                >
                  View Full Gallery →
                </button>
              </div>
            </>
          ) : (
            /* No Images Fallback */
            <div className="text-center py-12 bg-slate-50 rounded-2xl">
              <svg className="w-16 h-16 text-slate-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-slate-600 font-semibold mb-4">No gallery images yet</p>
              <button
                onClick={() => router.push('/rental/cameras')}
                className="bg-black text-white font-black py-3 px-6 rounded-xl hover:scale-105 transition-all duration-300 active:scale-95"
              >
                Browse Cameras
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Why Choose Us - Key Differentiators */}
      <section className="py-12 px-6">
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-black mb-2">Why Rent From Us</h2>
            <p className="text-sm text-slate-600 font-semibold">
              Professional service you can trust
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center animate-fadeIn" style={{ animationDelay: '0ms' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-blue-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-black mb-1">Fully Insured</h3>
              <p className="text-xs text-slate-600 font-semibold leading-snug">Comprehensive coverage included</p>
            </div>

            <div className="text-center animate-fadeIn" style={{ animationDelay: '100ms' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-emerald-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-black mb-1">Available</h3>
              <p className="text-xs text-slate-600 font-semibold leading-snug">Ready when you need them</p>
            </div>

            <div className="text-center animate-fadeIn" style={{ animationDelay: '200ms' }}>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-lg shadow-purple-500/30">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-sm font-black text-black mb-1">24/7 Support</h3>
              <p className="text-xs text-slate-600 font-semibold leading-snug">We're here when you need us</p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA - Strong Close */}
      <section className="py-12 px-6 bg-gradient-to-br from-black to-slate-900 text-white">
        <div className="max-w-lg mx-auto text-center">
          <h2 className="text-3xl font-black mb-3">Ready to Create?</h2>
          <p className="text-slate-300 font-semibold text-sm mb-8">
            Book your camera today and start capturing amazing moments
          </p>

          <div className="space-y-3">
            <button
              onClick={() => router.push('/rental/cameras')}
              className="w-full bg-white text-black font-black py-5 px-6 rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl active:scale-95"
            >
              Browse Cameras →
            </button>

            <a
              href="https://wa.me/601157119090"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full bg-green-500 text-white font-black py-5 px-6 rounded-2xl hover:scale-105 transition-all duration-300 shadow-2xl active:scale-95 flex items-center justify-center gap-2"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>

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
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
