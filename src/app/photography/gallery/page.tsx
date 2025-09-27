'use client';

import { useState } from 'react';
import PhotographyNavigation from '@/components/PhotographyNavigation';
import PhotographyGalleryNew from '@/components/PhotographyGalleryNew';

export default function PhotographyGalleryPage() {
  const [currentFilter, setCurrentFilter] = useState<string>('all');

  const handleFilterChange = (filter: string) => {
    setCurrentFilter(filter);
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
        </div>
      </section>

      {/* Gallery Component */}
      <PhotographyGalleryNew currentFilter={currentFilter} />
    </div>
  );
}