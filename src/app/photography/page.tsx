'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PhotographyNavigation from '@/components/PhotographyNavigation';
import PhotographyCalendar from '@/components/PhotographyCalendar';
import PhotographyGallery from '@/components/PhotographyGallery';
import HorizontalGridGallery from '@/components/HorizontalGridGallery';
import MobilePackageCarousel from '@/components/MobilePackageCarousel';
import { type PhotographyGalleryImage } from '@/lib/api/photography-gallery';

interface Package {
  id: string;
  name: string;
  price: string;
  duration: string;
  features: string[];
  isPopular?: boolean;
}

const mainShooterPackages: Package[] = [
  {
    id: 'private-event',
    name: 'Private Event',
    price: 'RM250',
    duration: '1 Hour Coverage',
    features: [
      'Unlimited Shots',
      'Edited Highlights',
      'Delivered via Google Drive'
    ]
  },
  {
    id: 'tunang',
    name: 'Tunang (Engagement)',
    price: 'RM350',
    duration: '2 Hours Coverage',
    features: [
      'Unlimited Shots',
      'Edited Highlights',
      'Delivered via Google Drive'
    ]
  },
  {
    id: 'nikah',
    name: 'Nikah (Solemnization)',
    price: 'RM450',
    duration: '3 Hours Coverage',
    features: [
      'Including Outdoor Session',
      'Unlimited Shots',
      'Edited Highlights',
      'Delivered via Google Drive'
    ]
  },
  {
    id: 'sanding',
    name: 'Sanding (Reception)',
    price: 'RM650',
    duration: '5 Hours Coverage',
    features: [
      'Including Outdoor Session',
      'Unlimited Shots',
      'Edited Highlights',
      'Delivered via Google Drive'
    ],
    isPopular: true
  },
  {
    id: 'combo-nikah-sanding',
    name: 'Combo Nikah + Sanding',
    price: 'RM950',
    duration: 'Full-day Coverage',
    features: [
      'Both Sessions Covered',
      'Unlimited Shots',
      'Edited Highlights',
      'Delivered via Google Drive'
    ]
  }
];

const secondShooterPackages: Package[] = [
  {
    id: 'nikah-second',
    name: 'Nikah',
    price: 'RM250',
    duration: '2 Hours Coverage',
    features: [
      'Unlimited Shots',
      'Edited Highlights',
      'Delivered via Google Drive'
    ]
  },
  {
    id: 'sanding-second',
    name: 'Sanding',
    price: 'RM450',
    duration: '4 Hours Coverage',
    features: [
      'Unlimited Shots',
      'Edited Highlights',
      'Delivered via Google Drive'
    ]
  },
  {
    id: 'combo-second',
    name: 'Combo Nikah + Sanding',
    price: 'RM550',
    duration: 'Full Coverage',
    features: [
      'Both Sessions Covered',
      'Unlimited Shots',
      'Edited Highlights',
      'Delivered via Google Drive'
    ]
  }
];

// Gallery Image interface compatible with HorizontalGridGallery
interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  aspect: 'portrait' | 'landscape' | 'square';
  category: 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event';
  featured: boolean;
  order: number;
}

// Helper function to convert simplified API response to GalleryImage
const convertToGalleryImage = (img: any, index: number): GalleryImage => {
  // Default aspect ratio since we're not fetching complex metadata
  const aspect: 'portrait' | 'landscape' | 'square' = index % 3 === 0 ? 'portrait' : index % 2 === 0 ? 'landscape' : 'square';

  return {
    id: parseInt(img.id) || index,
    url: img.image_url,
    alt: img.alt_text || img.title || `Photography image ${index + 1}`,
    aspect,
    category: 'wedding', // Default category - can be enhanced later
    featured: img.is_featured || false,
    order: index + 1
  };
};

const PackageCard = ({ pkg, type }: { pkg: Package; type: 'main' | 'second' }) => {
  return (
    <div className={`group relative bg-white rounded-lg border-2 transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 ${
      pkg.isPopular 
        ? 'border-[#d4af37] shadow-xl ring-2 ring-[#d4af37]/10 scale-105' 
        : 'border-[#d4af37]/20 hover:border-[#d4af37] hover:shadow-[0_0_40px_rgba(212,175,55,0.15)]'
    }`}>
      {pkg.isPopular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
          <span className="bg-black text-white px-6 py-2 text-sm font-bold tracking-widest rounded-full shadow-lg">
            MOST POPULAR
          </span>
        </div>
      )}
      
      <div className="p-6 sm:p-8 lg:p-10">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-black mb-4 sm:mb-6 font-serif tracking-wide">{pkg.name}</h3>
          <div className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#d4af37] mb-3 sm:mb-4">{pkg.price}</div>
          <div className="flex items-center justify-center text-black/70 text-sm sm:text-base uppercase tracking-widest">
            <svg className="w-5 h-5 mr-3 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pkg.duration}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
          {pkg.features.map((feature, index) => (
            <div key={index} className="flex items-start text-black">
              <div className="w-2 h-2 bg-[#d4af37] rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <span className="text-sm sm:text-base leading-relaxed">{feature}</span>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <button
          onClick={() => {
            const message = `Hi! I'm interested in booking the ${pkg.name} photography package (${pkg.price}). Can you provide more details?`;
            window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
          }}
          className="w-full py-5 px-8 bg-black text-white font-bold text-base uppercase tracking-widest rounded-lg transition-all duration-300 hover:bg-[#d4af37] hover:text-black hover:shadow-lg group-hover:transform group-hover:scale-105"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};

export default function PhotographyPage() {
  const [activeTab, setActiveTab] = useState<'main' | 'second'>('main');
  const [galleryFilter, setGalleryFilter] = useState<'all' | 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event'>('all');
  const [isGalleryLoading, setIsGalleryLoading] = useState(false);
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Load gallery images from API with retry logic
  useEffect(() => {
    const loadGalleryImages = async () => {
      try {
        setIsInitialLoading(true);
        
        // No timeout - let the API handle its own timeout logic
        const response = await fetch('/api/photography/gallery-homepage');
        
        if (!response.ok) {
          console.warn('API response not OK, will retry if needed');
          // Don't immediately give up - the API might be handling timeouts gracefully
        }
        
        const data = await response.json();
        
        // Convert PhotographyGalleryImage[] to GalleryImage[]
        const convertedImages = (data.images || []).map((img: PhotographyGalleryImage, index: number) => 
          convertToGalleryImage(img, index)
        );
        
        if (convertedImages.length === 0 && retryCount < 2) {
          // If no images and we haven't retried much, try again after a delay
          console.log(`No images loaded, retry attempt ${retryCount + 1}/2`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            // Keep loading state active during retry
          }, 3000); // Retry after 3 seconds
          return; // Don't set isInitialLoading to false yet
        }
        
        setGalleryImages(convertedImages);
        console.log(`Loaded ${convertedImages.length} images for photography homepage`);
        // Only stop loading if we have images or exhausted retries
        setIsInitialLoading(false);
      } catch (error) {
        console.error('Error loading gallery images:', error);
        // If we get an error and haven't retried much, try again
        if (retryCount < 2) {
          console.log(`Error occurred, retry attempt ${retryCount + 1}/2`);
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
            // Keep loading state active during retry
          }, 5000); // Retry after 5 seconds on error
          return; // Don't set isInitialLoading to false yet
        }
        // Only stop loading if we've exhausted all retries
        setIsInitialLoading(false);
      }
    };

    loadGalleryImages();
  }, [retryCount]);
  
  // Filter gallery images based on selected category
  const filteredImages = galleryFilter === 'all' 
    ? [...galleryImages].sort((a, b) => a.order - b.order)
    : galleryImages.filter(img => img.category === galleryFilter).sort((a, b) => a.order - b.order);

  const handleFilterChange = (filter: typeof galleryFilter) => {
    if (filter !== galleryFilter) {
      setIsGalleryLoading(true);
      // Simulate loading time for smooth UX
      setTimeout(() => {
        setGalleryFilter(filter);
        setIsGalleryLoading(false);
      }, 300);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Photography Navigation */}
      <PhotographyNavigation />

      {/* Hero Section */}
      <section className="py-16 sm:py-24 lg:py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold mb-6 sm:mb-8 font-serif text-black leading-tight">
              Professional
              <br />
              <span className="italic">Photography</span>
            </h1>
            
            <div className="w-16 sm:w-24 h-px bg-[#d4af37] mx-auto mb-6 sm:mb-8"></div>
            
            <p className="text-lg sm:text-xl text-black/80 mb-3 sm:mb-4 font-medium">
              Capture your moments
            </p>
            
            <p className="text-base sm:text-lg text-black/60 max-w-3xl mx-auto mb-12 sm:mb-16 leading-relaxed px-4">
              Weddings, Graduations, Corporate Events & More — Cinematic storytelling through the lens. 
              Every frame crafted with precision, every moment captured with purpose.
            </p>

            {/* Info Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-20">
              <div className="bg-white rounded-lg p-6 sm:p-8 shadow-lg border border-[#d4af37]/20 hover:border-[#d4af37] hover:shadow-xl transition-all duration-300 text-center group">
                <div className="w-16 h-16 border-2 border-[#d4af37] rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d4af37] transition-colors duration-300">
                  <svg className="w-8 h-8 text-[#d4af37] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-black mb-3 uppercase tracking-widest text-sm">Coverage Area</h3>
                <p className="text-black/70 text-base leading-relaxed">30km from Selayang / KL</p>
              </div>
              
              <div className="bg-white rounded-lg p-8 shadow-lg border border-[#d4af37]/20 hover:border-[#d4af37] hover:shadow-xl transition-all duration-300 text-center group">
                <div className="w-16 h-16 border-2 border-[#d4af37] rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d4af37] transition-colors duration-300">
                  <svg className="w-8 h-8 text-[#d4af37] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="font-bold text-black mb-3 uppercase tracking-widest text-sm">Travel Charges</h3>
                <p className="text-black/70 text-base leading-relaxed">Extended coverage available beyond 30km</p>
              </div>
              
              <div className="bg-white rounded-lg p-8 shadow-lg border border-[#d4af37]/20 hover:border-[#d4af37] hover:shadow-xl transition-all duration-300 text-center group">
                <div className="w-16 h-16 border-2 border-[#d4af37] rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d4af37] transition-colors duration-300">
                  <svg className="w-8 h-8 text-[#d4af37] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-black mb-3 uppercase tracking-widest text-sm">Additional Hours</h3>
                <p className="text-black/70 text-base leading-relaxed">RM100 per additional hour of coverage</p>
              </div>
              
              <div className="bg-white rounded-lg p-8 shadow-lg border border-[#d4af37]/20 hover:border-[#d4af37] hover:shadow-xl transition-all duration-300 text-center group">
                <div className="w-16 h-16 border-2 border-[#d4af37] rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d4af37] transition-colors duration-300">
                  <svg className="w-8 h-8 text-[#d4af37] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="font-bold text-black mb-3 uppercase tracking-widest text-sm">Negotiable Rates</h3>
                <p className="text-black/70 text-base leading-relaxed">Pricing tailored to your budget and needs</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-black mb-4 font-serif">Portfolio</h2>
            <div className="w-16 h-px bg-[#d4af37] mx-auto mb-6"></div>
            <p className="text-black/60 text-lg max-w-2xl mx-auto mb-8">
              A collection of moments that tell stories. Each image crafted with cinematic precision.
            </p>
            
            {/* Category Filter */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              {(['all', 'wedding', 'corporate', 'graduation', 'portrait', 'event'] as const).map((category) => (
                <button
                  key={category}
                  onClick={() => handleFilterChange(category)}
                  className={`px-6 py-2 text-sm font-bold uppercase tracking-widest rounded-full border-2 transition-all duration-300 ${
                    galleryFilter === category
                      ? 'bg-[#d4af37] text-black border-[#d4af37]'
                      : 'bg-white text-black border-[#d4af37]/30 hover:border-[#d4af37] hover:text-[#d4af37]'
                  }`}
                >
                  {category === 'all' ? 'All Work' : category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Professional Horizontal Grid Gallery */}
          {isInitialLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center max-w-md mx-auto">
                {/* Beautiful Loading Animation */}
                <div className="relative mb-8">
                  {/* Outer rotating ring */}
                  <div className="w-20 h-20 mx-auto border-4 border-gray-200 rounded-full animate-spin">
                    <div className="w-full h-full border-4 border-transparent border-t-[#d4af37] rounded-full animate-pulse"></div>
                  </div>
                  {/* Inner pulsing dot */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3 h-3 bg-[#d4af37] rounded-full animate-ping"></div>
                  </div>
                  {/* Camera icon in center */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-8 h-8 text-[#d4af37] animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"/>
                      <path d="M17 5h-2l-2-2H9L7 5H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z"/>
                    </svg>
                  </div>
                </div>
                
                {/* Loading Text with Animation */}
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-black animate-pulse">Loading Our Portfolio</h3>
                  <p className="text-black/70 leading-relaxed">
                    {retryCount === 0 
                      ? "We're preparing our finest photography work for you..."
                      : retryCount === 1
                      ? "Still loading... Our high-quality images are worth the wait!"
                      : "Almost there... Loading the best photography for you!"
                    }
                  </p>
                  
                  {/* Animated dots */}
                  <div className="flex justify-center space-x-2 mt-4">
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{animationDelay: '0ms'}}></div>
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-[#d4af37] rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="w-full bg-gray-200 rounded-full h-1 mt-6">
                    <div className="bg-gradient-to-r from-[#d4af37] to-yellow-500 h-1 rounded-full animate-pulse" 
                         style={{width: `${30 + (retryCount * 30)}%`}}></div>
                  </div>
                  
                  <p className="text-sm text-black/50 mt-3">
                    ✨ High-quality images are worth the wait
                    {retryCount > 0 && (
                      <span className="block mt-1 text-[#d4af37]">
                        📡 Attempt {retryCount + 1}/3 - Database working hard for you!
                      </span>
                    )}
                  </p>
                </div>
              </div>
            </div>
          ) : galleryImages.length === 0 ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No Images Yet</h3>
                <p className="text-gray-500 max-w-md mx-auto">
                  The photography gallery is currently empty. Images will appear here once they are uploaded through the admin panel.
                </p>
              </div>
            </div>
          ) : (
            <HorizontalGridGallery 
              images={filteredImages}
              currentFilter={galleryFilter}
              isLoading={isGalleryLoading}
            />
          )}

          {/* View More Work Button */}
          <div className="text-center mt-16">
            <Link href="/photography/gallery" className="inline-flex items-center px-8 py-4 bg-white border-2 border-[#d4af37] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#d4af37] hover:text-white transition-all duration-300 group">
              <svg className="w-5 h-5 mr-3 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              View More Work
            </Link>
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-bold text-black mb-4 font-serif">Investment</h2>
            <div className="w-16 h-px bg-[#d4af37] mx-auto mb-6"></div>
            <p className="text-black/60 text-lg max-w-2xl mx-auto">
              Professional photography packages designed to capture your story with cinematic excellence.
            </p>
          </div>

          {/* Package Type Tabs */}
          <div className="flex justify-center items-center mb-12 px-4">
            <div className="bg-white rounded-lg border-2 border-[#d4af37]/20 p-2 shadow-lg inline-flex">
              <button
                onClick={() => setActiveTab('main')}
                className={`px-6 sm:px-10 py-3 sm:py-4 font-bold text-xs sm:text-sm uppercase tracking-widest rounded-lg transition-all duration-300 ${
                  activeTab === 'main'
                    ? 'bg-black text-white shadow-lg'
                    : 'text-black hover:bg-[#d4af37]/10 hover:text-[#d4af37]'
                }`}
              >
                Main Shooter
              </button>
              <button
                onClick={() => setActiveTab('second')}
                className={`px-6 sm:px-10 py-3 sm:py-4 font-bold text-xs sm:text-sm uppercase tracking-widest rounded-lg transition-all duration-300 ${
                  activeTab === 'second'
                    ? 'bg-black text-white shadow-lg'
                    : 'text-black hover:bg-[#d4af37]/10 hover:text-[#d4af37]'
                }`}
              >
                Second Shooter
              </button>
            </div>
          </div>

          {/* Check Availability CTA */}
          <div className="text-center mb-16">
            <button
              onClick={() => {
                const calendarSection = document.querySelector('#availability-calendar');
                if (calendarSection) {
                  calendarSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="inline-flex items-center px-8 sm:px-12 py-4 sm:py-6 bg-[#d4af37] text-black font-bold text-base sm:text-lg uppercase tracking-widest rounded-2xl hover:bg-[#d4af37]/90 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <svg className="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Check Availability & Book
            </button>
          </div>

          {/* Packages Grid - Desktop */}
          <div className="hidden lg:grid lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8 mb-12 sm:mb-20">
            {(activeTab === 'main' ? mainShooterPackages : secondShooterPackages).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} type={activeTab} />
            ))}
          </div>

          {/* Mobile Package Carousel */}
          {activeTab === 'main' && (
            <MobilePackageCarousel 
              key="main-carousel"
              packages={mainShooterPackages}
              type="main"
            />
          )}
          {activeTab === 'second' && (
            <MobilePackageCarousel 
              key="second-carousel"
              packages={secondShooterPackages}
              type="second"
            />
          )}


          {/* Availability Calendar */}
          <div id="availability-calendar" className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-black mb-4 font-serif">Select Your Date</h3>
              <div className="w-16 h-px bg-[#d4af37] mx-auto mb-6"></div>
              <p className="text-black/60 text-lg max-w-2xl mx-auto">
                Choose your preferred date to start the booking process. Available dates are highlighted in green.
              </p>
            </div>

            <PhotographyCalendar 
              showAvailabilityOnly={false}
              className="max-w-2xl mx-auto"
            />
          </div>
        </div>
      </section>

      {/* Terms Section */}
      <section className="py-12 sm:py-20 bg-black/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#d4af37]/30 p-6 sm:p-12">
            <div className="text-center mb-8 sm:mb-12">
              <h3 className="text-2xl sm:text-4xl font-bold text-black mb-4 font-serif">Terms & Conditions</h3>
              <div className="w-16 h-px bg-[#d4af37] mx-auto mb-4 sm:mb-6"></div>
              <p className="text-black/60">Professional service guidelines</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-4xl mx-auto">
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-[#d4af37] mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-bold text-black mb-2 uppercase tracking-wide text-sm">Deposit</h4>
                  <p className="text-black/70 text-sm leading-relaxed">Non-refundable deposit required to secure your date</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-[#d4af37] mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-bold text-black mb-2 uppercase tracking-wide text-sm">Flexibility</h4>
                  <p className="text-black/70 text-sm leading-relaxed">Date changes allowed subject to availability</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-[#d4af37] mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-bold text-black mb-2 uppercase tracking-wide text-sm">Payment</h4>
                  <p className="text-black/70 text-sm leading-relaxed">Final balance due 7 days before event</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="w-2 h-2 bg-[#d4af37] mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-bold text-black mb-2 uppercase tracking-wide text-sm">Delivery</h4>
                  <p className="text-black/70 text-sm leading-relaxed">Edited photos via Google Drive within 1 week</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4 md:col-span-2">
                <div className="w-2 h-2 bg-[#d4af37] mt-2 flex-shrink-0"></div>
                <div>
                  <h4 className="font-bold text-black mb-2 uppercase tracking-wide text-sm">Customization</h4>
                  <p className="text-black/70 text-sm leading-relaxed">Communicate specific requests and styles in advance for optimal results</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl md:text-6xl font-bold text-white mb-8 font-serif leading-tight">
            Let's Create
            <br />
            <span className="text-[#d4af37] italic">Something Cinematic</span>
          </h2>
          
          <div className="w-24 h-px bg-[#d4af37] mx-auto mb-8"></div>
          
          <p className="text-xl text-white/70 mb-12 leading-relaxed max-w-2xl mx-auto">
            Every story deserves to be told with precision and artistry. 
            Let's craft your visual narrative together.
          </p>
          
          <button
            onClick={() => {
              const message = "Hi! I'm interested in your wedding photography services. Can you provide more information about packages and availability?";
              window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
            }}
            className="group inline-flex items-center px-12 py-6 bg-white text-black font-bold text-sm uppercase tracking-widest transition-all duration-300 hover:bg-[#d4af37] hover:text-black"
          >
            <svg className="w-5 h-5 mr-4 group-hover:text-black transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.687"/>
            </svg>
            Start Your Story
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-black/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="relative w-10 h-10">
                <Image
                  src="/images/captura_logo_big.png"
                  alt="Captura Logo"
                  fill
                  className="object-contain"
                />
              </div>
              <span className="text-2xl font-bold text-black font-serif">CAPTURA</span>
            </div>
            
            <div className="text-center md:text-right">
              <p className="text-black/60 font-medium uppercase tracking-wide text-sm">Wedding Photography</p>
              <p className="text-black/40 text-sm">by @shotbymirul</p>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}