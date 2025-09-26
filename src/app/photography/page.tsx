'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import PhotographyNavigation from '@/components/PhotographyNavigation';
import PhotographyCalendar from '@/components/PhotographyCalendar';
import SocialMediaSection from '@/components/SocialMediaSection';
import PhotographyGallery from '@/components/PhotographyGallery';
import FloatingWhatsAppButton from '@/components/FloatingWhatsAppButton';

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

// Gallery Images - Admin-friendly structure for easy management
interface GalleryImage {
  id: number;
  url: string;
  alt: string;
  aspect: 'portrait' | 'landscape' | 'square';
  category: 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event';
  featured: boolean;
  order: number;
}

const galleryImages: GalleryImage[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Wedding ceremony celebration',
    aspect: 'portrait',
    category: 'wedding',
    featured: true,
    order: 1
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Wedding reception dance celebration',
    aspect: 'landscape',
    category: 'wedding',
    featured: true,
    order: 2
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Bride portrait with bouquet',
    aspect: 'portrait',
    category: 'wedding',
    featured: false,
    order: 3
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Corporate conference presentation',
    aspect: 'landscape',
    category: 'corporate',
    featured: true,
    order: 4
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Professional headshot portrait',
    aspect: 'portrait',
    category: 'corporate',
    featured: true,
    order: 5
  },
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400',
    alt: 'Wedding ceremony moment',
    aspect: 'landscape',
    category: 'wedding',
    featured: false,
    order: 6
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1594736797933-d0b22ce71b10?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=600',
    alt: 'Bride getting ready',
    aspect: 'portrait',
    category: 'wedding',
    featured: true,
    order: 7
  },
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400',
    alt: 'Wedding venue decoration',
    aspect: 'landscape',
    category: 'wedding',
    featured: false,
    order: 8
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=600',
    alt: 'Professional portrait session',
    aspect: 'portrait',
    category: 'portrait',
    featured: true,
    order: 9
  },
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&h=400',
    alt: 'Corporate headshot',
    aspect: 'square',
    category: 'corporate',
    featured: false,
    order: 10
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&h=400',
    alt: 'Graduation ceremony',
    aspect: 'landscape',
    category: 'graduation',
    featured: false,
    order: 11
  },
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Traditional wedding ceremony',
    aspect: 'portrait',
    category: 'wedding',
    featured: true,
    order: 12
  },
  // Additional portfolio images for variety
  {
    id: 13,
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Graduation celebration moment',
    aspect: 'portrait',
    category: 'graduation',
    featured: true,
    order: 13
  },
  {
    id: 14,
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Professional portrait session outdoor',
    aspect: 'portrait',
    category: 'portrait',
    featured: true,
    order: 14
  },
  {
    id: 15,
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Private event celebration',
    aspect: 'landscape',
    category: 'event',
    featured: true,
    order: 15
  },
  {
    id: 16,
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Wedding rings close-up',
    aspect: 'portrait',
    category: 'wedding',
    featured: false,
    order: 16
  },
  {
    id: 17,
    url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Corporate team collaboration',
    aspect: 'landscape',
    category: 'corporate',
    featured: false,
    order: 17
  },
  {
    id: 18,
    url: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Event candid moments',
    aspect: 'portrait',
    category: 'event',
    featured: false,
    order: 18
  }
];

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
      
      <div className="p-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h3 className="text-3xl font-bold text-black mb-6 font-serif tracking-wide">{pkg.name}</h3>
          <div className="text-5xl font-bold text-[#d4af37] mb-4">{pkg.price}</div>
          <div className="flex items-center justify-center text-black/70 text-base uppercase tracking-widest">
            <svg className="w-5 h-5 mr-3 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {pkg.duration}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-5 mb-10">
          {pkg.features.map((feature, index) => (
            <div key={index} className="flex items-start text-black">
              <div className="w-2 h-2 bg-[#d4af37] rounded-full mt-2 mr-4 flex-shrink-0"></div>
              <span className="text-base leading-relaxed">{feature}</span>
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
  
  // Filter gallery images based on selected category
  const filteredImages = galleryFilter === 'all' 
    ? galleryImages.sort((a, b) => a.order - b.order)
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
      <section className="py-32 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-7xl md:text-8xl font-bold mb-8 font-serif text-black leading-tight">
              Professional
              <br />
              <span className="italic">Photography</span>
            </h1>
            
            <div className="w-24 h-px bg-[#d4af37] mx-auto mb-8"></div>
            
            <p className="text-xl text-black/80 mb-4 font-medium">
              Capture your moments
            </p>
            
            <p className="text-lg text-black/60 max-w-3xl mx-auto mb-16 leading-relaxed">
              Weddings, Graduations, Corporate Events & More — Cinematic storytelling through the lens. 
              Every frame crafted with precision, every moment captured with purpose.
            </p>

            {/* Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
              <div className="bg-white rounded-lg p-8 shadow-lg border border-[#d4af37]/20 hover:border-[#d4af37] hover:shadow-xl transition-all duration-300 text-center group">
                <div className="w-16 h-16 border-2 border-[#d4af37] rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:bg-[#d4af37] transition-colors duration-300">
                  <svg className="w-8 h-8 text-[#d4af37] group-hover:text-white transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-bold text-black mb-3 uppercase tracking-widest text-sm">Coverage Area</h3>
                <p className="text-black/70 text-base leading-relaxed">30km from Seri Kembangan</p>
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

          {/* Professional Masonry Gallery */}
          <PhotographyGallery 
            images={filteredImages}
            currentFilter={galleryFilter}
            isLoading={isGalleryLoading}
          />

          {/* Load More Button */}
          <div className="text-center mt-16">
            <button className="inline-flex items-center px-8 py-4 bg-white border-2 border-[#d4af37] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#d4af37] hover:text-white transition-all duration-300 group">
              <svg className="w-5 h-5 mr-3 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
              View More Work
            </button>
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
          <div className="flex justify-center mb-12">
            <div className="bg-white rounded-lg border-2 border-[#d4af37]/20 p-2 shadow-lg">
              <button
                onClick={() => setActiveTab('main')}
                className={`px-10 py-4 font-bold text-sm uppercase tracking-widest rounded-lg transition-all duration-300 ${
                  activeTab === 'main'
                    ? 'bg-black text-white shadow-lg'
                    : 'text-black hover:bg-[#d4af37]/10 hover:text-[#d4af37]'
                }`}
              >
                Main Shooter
              </button>
              <button
                onClick={() => setActiveTab('second')}
                className={`px-10 py-4 font-bold text-sm uppercase tracking-widest rounded-lg transition-all duration-300 ${
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
              className="inline-flex items-center px-12 py-6 bg-[#d4af37] text-black font-bold text-lg uppercase tracking-widest rounded-2xl hover:bg-[#d4af37]/90 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <svg className="w-6 h-6 mr-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Check Availability & Book
            </button>
          </div>

          {/* Packages Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {(activeTab === 'main' ? mainShooterPackages : secondShooterPackages).map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} type={activeTab} />
            ))}
          </div>


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
      <section className="py-20 bg-black/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#d4af37]/30 p-12">
            <div className="text-center mb-12">
              <h3 className="text-4xl font-bold text-black mb-4 font-serif">Terms & Conditions</h3>
              <div className="w-16 h-px bg-[#d4af37] mx-auto mb-6"></div>
              <p className="text-black/60">Professional service guidelines</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
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

      {/* Social Media Section */}
      <SocialMediaSection />

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

      {/* Floating WhatsApp Button */}
      <FloatingWhatsAppButton />
    </div>
  );
}