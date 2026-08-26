'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import PortfolioNav from '@/components/portfolio/PortfolioNav';
import PortfolioFilter from '@/components/portfolio/PortfolioFilter';
import WeddingTeaser from '@/components/portfolio/wedding/WeddingTeaser';
import HonestServiceTeaser from '@/components/portfolio/HonestServiceTeaser';
import TickerMarquee from '@/components/portfolio/service/TickerMarquee';
import VideoModal from '@/components/portfolio/VideoModal';
import ServiceInquiryForm from '@/components/portfolio/ServiceInquiryForm';
import {
  portfolioServices,
  getServiceById,
  type PortfolioItem,
  type ServiceId,
} from '@/data/portfolioData';

const tickerItems = [
  'wedding films',
  'corporate & brand',
  'events',
  'content creation',
  'founder spots open',
  'special prices',
  'no boring videos',
];

export default function PortfolioPage() {
  const [activeId, setActiveId] = useState<ServiceId>('weddings');
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);

  const activeService = getServiceById(activeId);
  const heroAccent = activeService.accent;

  return (
    <div className="min-h-screen bg-[#fdfcfa]">
      <PortfolioNav />

      {/* Hero — animated */}
      <section className="relative overflow-hidden bg-[#fdfcfa] pt-16 sm:pt-24 pb-14 sm:pb-20">
        {/* Breathing accent glows */}
        <motion.div
          className="absolute -top-40 right-[10%] w-[420px] h-[420px] rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: heroAccent, opacity: 0.12 }}
          animate={{ opacity: [0.08, 0.15, 0.08], scale: [1, 1.1, 1] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />
        <motion.div
          className="absolute -bottom-48 left-[5%] w-[380px] h-[380px] rounded-full blur-3xl pointer-events-none"
          style={{ backgroundColor: heroAccent, opacity: 0.08 }}
          animate={{ opacity: [0.05, 0.1, 0.05] }}
          transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex items-center justify-center space-x-2 text-sm text-black/40 mb-8"
          >
            <Link href="/" className="hover:text-[#d4af37] transition-colors">Home</Link>
            <span>/</span>
            <span className="text-black/70">Production Portfolio</span>
          </motion.div>

          {/* Word-by-word reveal */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-black mb-6 font-serif">
            <span className="inline-block overflow-hidden align-top">
              <motion.span
                className="inline-block"
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1], delay: 0.1 }}
              >
                Our
              </motion.span>
            </span>{' '}
            <span className="inline-block overflow-hidden align-top">
              <motion.span
                className="inline-block italic transition-colors duration-300"
                style={{ color: heroAccent }}
                initial={{ y: '110%' }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: [0.22, 0.61, 0.36, 1], delay: 0.22 }}
              >
                Work
              </motion.span>
            </span>
          </h1>

          {/* Animated divider */}
          <motion.div
            className="w-16 h-px mx-auto mb-6 origin-center"
            style={{ backgroundColor: heroAccent }}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.4, ease: [0.22, 0.61, 0.36, 1] }}
          />

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="text-lg text-black/60 max-w-2xl mx-auto"
          >
            From intimate weddings to corporate campaigns
          </motion.p>
        </div>
      </section>

      {/* Brand ticker */}
      <TickerMarquee accent="#d4af37" items={tickerItems} />

      {/* Filter Tabs */}
      <section className="pt-10 pb-10 bg-[#fdfcfa]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <PortfolioFilter services={portfolioServices} activeId={activeId} onChange={setActiveId} />
        </div>
      </section>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          id="portfolio-panel"
          role="tabpanel"
          aria-labelledby={`tab-${activeId}`}
          initial={{ opacity: 0, y: 14, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -10, scale: 0.995 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
        >
          {activeId === 'weddings' ? (
            <section className="pt-2 pb-10 bg-[#fdfcfa]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <WeddingTeaser
                  film={activeService.items[0]}
                  accent={activeService.accent}
                  onOpen={setSelectedItem}
                />
              </div>
            </section>
          ) : (
            <section className="pt-2 pb-10 bg-[#fdfcfa]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <HonestServiceTeaser
                  id={activeId}
                  accent={activeService.accent}
                  onOpen={setSelectedItem}
                />
              </div>
            </section>
          )}

          {/* Inquiry */}
          <section id="inquiry" className="py-16 sm:py-24 bg-white border-t border-black/5 scroll-mt-24">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
                className="text-center mb-10"
              >
                <p
                  className="text-[10px] tracking-[0.4em] uppercase font-medium mb-3 transition-colors duration-300"
                  style={{ color: activeService.accent }}
                >
                  {activeService.label}
                </p>
                <h2 className="text-3xl sm:text-5xl font-serif text-stone-900">
                  Let&apos;s talk about your project
                </h2>
              </motion.div>
              <ServiceInquiryForm serviceId={activeId} accent={activeService.accent} />
            </div>
          </section>
        </motion.div>
      </AnimatePresence>

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
        accent={selectedItem ? getAccentForItem(selectedItem.id) : '#111111'}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}

const getAccentForItem = (itemId: string): string => {
  const service = portfolioServices.find((s) => s.items.some((i) => i.id === itemId));
  return service?.accent ?? '#111111';
};
