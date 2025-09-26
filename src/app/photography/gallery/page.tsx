'use client';

import { useState } from 'react';
import PhotographyNavigation from '@/components/PhotographyNavigation';
import PhotographyGallery from '@/components/PhotographyGallery';

interface GalleryImage {
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

const galleryImages: GalleryImage[] = [
  // Featured Wedding Collection
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Wedding ceremony celebration - exchanging vows',
    aspect: 'portrait',
    category: 'wedding',
    featured: true,
    order: 1,
    title: 'Sacred Vows',
    description: 'Capturing the most important promise between two hearts'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Wedding reception dance celebration',
    aspect: 'landscape',
    category: 'wedding',
    featured: true,
    order: 2,
    title: 'First Dance',
    description: 'The magical moment where everything else fades away'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Bride portrait with bouquet',
    aspect: 'portrait',
    category: 'wedding',
    featured: true,
    order: 3,
    title: 'Bridal Elegance',
    description: 'Timeless beauty captured in perfect light'
  },
  
  // Corporate Photography
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Corporate conference presentation',
    aspect: 'landscape',
    category: 'corporate',
    featured: false,
    order: 4,
    title: 'Executive Vision',
    description: 'Professional moments that define leadership'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1556157382-97eda2d62296?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Professional headshot portrait',
    aspect: 'portrait',
    category: 'corporate',
    featured: true,
    order: 5,
    title: 'Professional Presence',
    description: 'Headshots that open doors and create opportunities'
  },
  
  // Graduation Moments
  {
    id: 6,
    url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9d1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Graduation celebration moment',
    aspect: 'portrait',
    category: 'graduation',
    featured: true,
    order: 6,
    title: 'Achievement Unlocked',
    description: 'Celebrating years of dedication and hard work'
  },
  {
    id: 7,
    url: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Graduation ceremony family photo',
    aspect: 'landscape',
    category: 'graduation',
    featured: false,
    order: 7,
    title: 'Family Pride',
    description: 'Generations coming together to celebrate success'
  },
  
  // Portrait Sessions
  {
    id: 8,
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Professional portrait session outdoor',
    aspect: 'portrait',
    category: 'portrait',
    featured: true,
    order: 8,
    title: 'Natural Confidence',
    description: 'Authentic portraits that capture your true essence'
  },
  {
    id: 9,
    url: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Family portrait session',
    aspect: 'landscape',
    category: 'portrait',
    featured: false,
    order: 9,
    title: 'Family Legacy',
    description: 'Timeless family portraits that tell your story'
  },
  
  // Event Photography
  {
    id: 10,
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Private event celebration',
    aspect: 'landscape',
    category: 'event',
    featured: true,
    order: 10,
    title: 'Celebration Moments',
    description: 'Every milestone deserves to be remembered'
  },
  {
    id: 11,
    url: 'https://images.unsplash.com/photo-1515169067868-5387ec356754?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Event candid moments',
    aspect: 'portrait',
    category: 'event',
    featured: false,
    order: 11,
    title: 'Candid Joy',
    description: 'Unguarded moments of pure happiness'
  },
  
  // Additional Wedding Shots
  {
    id: 12,
    url: 'https://images.unsplash.com/photo-1594736797933-d0b22ce71b10?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Bride getting ready detail shot',
    aspect: 'portrait',
    category: 'wedding',
    featured: false,
    order: 12,
    title: 'Getting Ready',
    description: 'The quiet anticipation before the big moment'
  },
  {
    id: 13,
    url: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Wedding venue decoration details',
    aspect: 'landscape',
    category: 'wedding',
    featured: false,
    order: 13,
    title: 'Perfect Details',
    description: 'Every element carefully crafted for your special day'
  },
  {
    id: 14,
    url: 'https://images.unsplash.com/photo-1465495976277-4387d4b0e4a6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Wedding rings close-up',
    aspect: 'portrait',
    category: 'wedding',
    featured: false,
    order: 14,
    title: 'Symbol of Forever',
    description: 'The rings that represent eternal commitment'
  },
  
  // More Corporate & Professional
  {
    id: 15,
    url: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&h=800',
    alt: 'Corporate team collaboration',
    aspect: 'landscape',
    category: 'corporate',
    featured: false,
    order: 15,
    title: 'Team Synergy',
    description: 'Capturing the energy of collaboration and innovation'
  },
  {
    id: 16,
    url: 'https://images.unsplash.com/photo-1542744094-3a31f272c490?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Professional business portrait',
    aspect: 'portrait',
    category: 'corporate',
    featured: false,
    order: 16,
    title: 'Executive Leadership',
    description: 'Portraits that command respect and inspire confidence'
  },

  // Additional Graduation
  {
    id: 17,
    url: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Traditional graduation ceremony',
    aspect: 'portrait',
    category: 'graduation',
    featured: true,
    order: 17,
    title: 'Commencement',
    description: 'The beginning of a new chapter in life'
  },

  // Extra Portraits
  {
    id: 18,
    url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=1200',
    alt: 'Artistic portrait with dramatic lighting',
    aspect: 'portrait',
    category: 'portrait',
    featured: true,
    order: 18,
    title: 'Artistic Vision',
    description: 'Where photography meets fine art'
  }
];

export default function GalleryPage() {
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

      {/* Gallery Header */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-black mb-4 sm:mb-6 font-serif">
              Photography Gallery
            </h1>
            <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-[#d4af37] to-[#b8941f] mx-auto mb-6 sm:mb-8 rounded-full"></div>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-4">
              Browse our complete portfolio of wedding, corporate, and portrait photography. 
              Each image tells a story, crafted with cinematic precision and artistic vision.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-2 sm:gap-4 mb-12 sm:mb-16 px-4">
            {(['all', 'wedding', 'corporate', 'graduation', 'portrait', 'event'] as const).map((category) => (
              <button
                key={category}
                onClick={() => handleFilterChange(category)}
                className={`px-3 sm:px-6 py-2 sm:py-3 text-xs sm:text-sm font-bold uppercase tracking-widest rounded-full border-2 transition-all duration-300 ${
                  galleryFilter === category
                    ? 'bg-[#d4af37] text-black border-[#d4af37] shadow-lg'
                    : 'bg-white text-black border-[#d4af37]/30 hover:border-[#d4af37] hover:text-[#d4af37] hover:shadow-md'
                }`}
              >
                {category === 'all' ? 'All' : category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>

          {/* Gallery Count Display */}
          <div className="text-center mb-12">
            <p className="text-gray-500 text-lg">
              {galleryFilter === 'all' ? 'Showing all' : `Showing ${galleryFilter}`} photos
              <span className="text-[#d4af37] font-bold ml-2">({filteredImages.length} images)</span>
            </p>
          </div>

          {/* Professional Masonry Gallery */}
          <PhotographyGallery 
            images={filteredImages}
            currentFilter={galleryFilter}
            isLoading={isGalleryLoading}
          />

          {/* Gallery Statistics */}
          <div className="mt-20 pt-16 border-t border-gray-200">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[#d4af37] mb-2">{galleryImages.filter(img => img.category === 'wedding').length}</div>
                <div className="text-gray-600 uppercase tracking-wider text-sm font-medium">Wedding Photos</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#d4af37] mb-2">{galleryImages.filter(img => img.category === 'corporate').length}</div>
                <div className="text-gray-600 uppercase tracking-wider text-sm font-medium">Corporate Shoots</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#d4af37] mb-2">{galleryImages.filter(img => img.category === 'portrait').length}</div>
                <div className="text-gray-600 uppercase tracking-wider text-sm font-medium">Portrait Sessions</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#d4af37] mb-2">{galleryImages.filter(img => img.featured).length}</div>
                <div className="text-gray-600 uppercase tracking-wider text-sm font-medium">Featured Works</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="mt-20 text-center">
            <h2 className="text-4xl font-bold text-black mb-4 font-serif">Ready to Create Your Story?</h2>
            <p className="text-gray-600 text-lg mb-8 max-w-2xl mx-auto">
              Let's discuss your vision and create something beautiful together.
            </p>
            <button
              onClick={() => {
                const message = "Hi! I saw your gallery and would love to discuss my photography needs.";
                window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
              }}
              className="inline-flex items-center px-8 py-4 bg-[#d4af37] text-black font-bold text-lg uppercase tracking-widest rounded-xl hover:bg-[#d4af37]/90 transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
            >
              <svg className="w-6 h-6 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Book Your Session
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}