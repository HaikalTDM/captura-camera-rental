'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StudioNavigation from '@/components/StudioNavigation';

const categories = [
  { id: 'all', label: 'All Work' },
  { id: 'photography', label: 'Photography', accent: 'text-[#d4af37]' },
  { id: 'videography', label: 'Videography', accent: 'text-purple-500' },
  { id: 'marketing', label: 'Marketing', accent: 'text-emerald-500' },
  { id: 'content', label: 'Content', accent: 'text-amber-500' },
];

const portfolioItems = [
  {
    id: 1,
    title: 'Wedding of Amir & Sarah',
    category: 'photography',
    type: 'Wedding Photography',
    image: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 2,
    title: 'Corporate Brand Film',
    category: 'videography',
    type: 'Brand Video',
    image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 3,
    title: 'Social Media Campaign',
    category: 'marketing',
    type: 'Instagram Strategy',
    image: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 4,
    title: 'Product Launch Reels',
    category: 'content',
    type: 'TikTok Content',
    image: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 5,
    title: 'Nikah Ceremony',
    category: 'photography',
    type: 'Event Photography',
    image: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 6,
    title: 'Restaurant Promo Video',
    category: 'videography',
    type: 'Commercial',
    image: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 7,
    title: 'E-commerce Product Shoot',
    category: 'content',
    type: 'Product Photography',
    image: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 8,
    title: 'Brand Identity Campaign',
    category: 'marketing',
    type: 'Full Campaign',
    image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=900&q=80&auto=format&fit=crop',
  },
  {
    id: 9,
    title: 'Graduation Portraits',
    category: 'photography',
    type: 'Portrait Session',
    image: 'https://images.unsplash.com/photo-1523289333742-be1143f6b766?w=900&q=80&auto=format&fit=crop',
  },
];

const categoryColors: Record<string, string> = {
  photography: 'bg-[#d4af37]/10 text-[#d4af37] border-[#d4af37]/20',
  videography: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
  marketing: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  content: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
};

export default function StudioPortfolioPage() {
  const [activeFilter, setActiveFilter] = useState('all');

  const filteredItems = activeFilter === 'all'
    ? portfolioItems
    : portfolioItems.filter(item => item.category === activeFilter);

  return (
    <div className="min-h-screen bg-white">
      <StudioNavigation />

      {/* Hero */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-black/40 mb-8">
            <Link href="/studio" className="hover:text-[#d4af37] transition-colors">Studio</Link>
            <span>/</span>
            <span className="text-black/70">Portfolio</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-black mb-6 font-serif">
            Our <span className="italic text-[#d4af37]">Work</span>
          </h1>
          <div className="w-16 h-px bg-[#d4af37] mx-auto mb-6"></div>
          <p className="text-lg text-black/60 max-w-2xl mx-auto">
            A curated collection of projects across photography, videography, marketing & content creation.
          </p>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="pb-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveFilter(cat.id)}
                className={`px-5 py-2 text-sm font-bold uppercase tracking-widest rounded-full border-2 transition-all duration-300 ${
                  activeFilter === cat.id
                    ? 'bg-black text-white border-black'
                    : 'bg-white text-black/70 border-gray-200 hover:border-black/30'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Portfolio Grid */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="group relative bg-gray-100 rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer hover:shadow-xl transition-all duration-300">
                {/* Image */}
                <Image
                  src={item.image}
                  alt={item.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-100 transition-all duration-300" />
                <div className="absolute inset-0 flex items-end">
                  <div className="p-6 w-full">
                    <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wider rounded-full border mb-2 backdrop-blur-sm ${categoryColors[item.category]}`}>
                      {item.type}
                    </span>
                    <h3 className="text-white font-bold text-lg drop-shadow-lg">{item.title}</h3>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-20">
              <p className="text-black/40 text-lg">No projects in this category yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-serif">
            Want to be our next project?
          </h2>
          <p className="text-white/60 mb-8">Let&apos;s create something remarkable together.</p>
          <button
            onClick={() => {
              const message = "Hi! I've seen your portfolio and I'd love to discuss a project.";
              window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
            }}
            className="px-8 py-4 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#d4af37]/90 transition-all duration-300"
          >
            Start a Project
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-black/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="relative w-10 h-10">
                <Image src="/images/captura_logo_big.png" alt="Captura Logo" fill className="object-contain" />
              </div>
              <span className="text-2xl font-bold text-black font-serif">CAPTURA</span>
            </div>
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} CAPTURA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}