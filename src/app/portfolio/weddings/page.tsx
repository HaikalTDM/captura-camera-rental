'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import PortfolioNav from '@/components/portfolio/PortfolioNav';
import TickerMarquee from '@/components/portfolio/service/TickerMarquee';
import VideoModal from '@/components/portfolio/VideoModal';
import ServiceInquiryForm from '@/components/portfolio/ServiceInquiryForm';
import WeddingHero from '@/components/portfolio/wedding/WeddingHero';
import FeaturedFilms from '@/components/portfolio/wedding/FeaturedFilms';
import FoundingCouples from '@/components/portfolio/wedding/FoundingCouples';
import WeddingExperience from '@/components/portfolio/wedding/WeddingExperience';
import WeddingPackages from '@/components/portfolio/wedding/WeddingPackages';
import WeddingTestimonials from '@/components/portfolio/wedding/WeddingTestimonials';
import {
  getServiceById,
  weddingShowreel,
  type PortfolioItem,
} from '@/data/portfolioData';

const tickerItems = [
  'first 10 founder couples',
  'the fun kind of film',
  'special founder price',
  'you, next?',
  'be our second',
];

export default function WeddingFilmsPage() {
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const weddings = getServiceById('weddings');

  const featuredWeddings = weddings.items.filter((item) => item.featured);
  const weddingItems = featuredWeddings.length > 0 ? featuredWeddings : weddings.items;

  return (
    <div className="min-h-screen bg-[#0d0d0d] font-friendly">
      <PortfolioNav />

      {/* Back to all work */}
      <div className="bg-[#0d0d0d] px-4 sm:px-6 lg:px-8 pt-6 pb-2">
        <div className="max-w-7xl mx-auto">
          <Link
            href="/portfolio"
            className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
          >
            <ArrowLeft className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            Back to all work
          </Link>
        </div>
      </div>

      {/* Showreel hero */}
      <WeddingHero
        reel={weddingShowreel}
        accent={weddings.accent}
        accentSoft={weddings.accentSoft}
        onOpen={setSelectedItem}
      />

      {/* Ticker */}
      <TickerMarquee accent={weddings.accent} items={tickerItems} />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      >
        <FeaturedFilms
          items={weddingItems}
          accent={weddings.accent}
          onOpen={setSelectedItem}
        />
        <FoundingCouples accent={weddings.accent} />
        <WeddingExperience accent={weddings.accent} />
        <WeddingPackages accent={weddings.accent} accentSoft={weddings.accentSoft} />
        <WeddingTestimonials
          items={weddings.items}
          accent={weddings.accent}
          accentSoft={weddings.accentSoft}
        />
      </motion.div>

      {/* Wedding inquiry */}
      <section id="inquiry" className="py-16 sm:py-24 bg-[#fdfcfa] scroll-mt-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="font-handwriting text-2xl sm:text-3xl mb-2" style={{ color: weddings.accent }}>
              got a date in mind?
            </p>
            <h2 className="text-3xl sm:text-5xl font-serif text-stone-900">
              Let&apos;s plan your film
            </h2>
          </div>
          <ServiceInquiryForm serviceId="weddings" accent={weddings.accent} />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black px-6 sm:px-10 lg:px-16 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-7 h-7">
                <Image src="/images/captura_logo_big.png" alt="Captura" fill className="object-contain" />
              </div>
              <span className="text-sm font-bold text-white/70 font-serif">CAPTURA</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/30">
              <span>+60 17-746 4121</span>
              <span>KL, Malaysia</span>
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Lightbox */}
      <VideoModal
        item={selectedItem}
        accent={weddings.accent}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
