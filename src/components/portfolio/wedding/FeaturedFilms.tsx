'use client';

import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
import { Play, Clock, ArrowRight } from 'lucide-react';
import type { PortfolioItem } from '@/data/portfolioData';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] },
  },
};

interface FeaturedFilmsProps {
  items: PortfolioItem[];
  accent: string;
  onOpen: (item: PortfolioItem) => void;
}

export default function FeaturedFilms({ items, accent, onOpen }: FeaturedFilmsProps) {
  const film = items[0];

  return (
    <section id="wedding-featured" className="relative bg-[#0d0d0d] scroll-mt-20 py-16 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-10 sm:mb-14"
        >
          <p className="font-handwriting text-3xl sm:text-4xl mb-2" style={{ color: accent }}>
            psst… our very first film ↓
          </p>
          <h2 className="font-friendly text-4xl sm:text-6xl font-extrabold text-white">
            Fresh off the <span className="italic" style={{ color: accent }}>timeline</span>
          </h2>
        </motion.div>

        {/* One film + "You, next?" */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid lg:grid-cols-2 gap-4 sm:gap-6 items-stretch"
        >
          {film && (
            <motion.div key={film.id} variants={fadeUp}>
              <div
                role="button"
                tabIndex={0}
                aria-label={`Play video: ${film.title}`}
                onClick={() => onOpen(film)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onOpen(film);
                  }
                }}
                className="group relative overflow-hidden rounded-2xl bg-stone-900 cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-300 ease-out hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-white/60 aspect-video h-full"
              >
                <Image
                  src={film.thumbnail}
                  alt={film.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />

                {/* Gradients */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/30" />
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ backgroundColor: 'rgba(0,0,0,0.45)' }}
                  aria-hidden="true"
                />

                {/* Duration + style badge */}
                {film.duration && (
                  <span
                    className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-md"
                    style={{ backgroundColor: 'rgba(13,13,13,0.6)', color: accent, border: `1px solid ${accent}66` }}
                  >
                    <Clock className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
                    {film.duration} &middot; {film.style}
                  </span>
                )}

                {/* Play button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <span
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${accent}cc`, backdropFilter: 'blur(6px)' }}
                  >
                    <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-0.5" fill="currentColor" strokeWidth={0} aria-hidden="true" />
                  </span>
                </div>

                {/* Name + year */}
                <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
                  <p className="text-white font-friendly font-extrabold drop-shadow-lg leading-tight text-2xl sm:text-3xl">
                    {film.clientName}
                  </p>
                  <p className="font-handwriting text-lg sm:text-xl mt-0.5 leading-tight" style={{ color: '#f4e7a1' }}>
                    {film.year}
                    {film.location ? ` · ${film.location}` : ''}
                  </p>
                  <p className="text-white/0 group-hover:text-white/80 transition-colors duration-300 text-xs sm:text-sm mt-2 line-clamp-1">
                    {film.description}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* You, next? */}
          <motion.div variants={fadeUp}>
            <a
              href="#founding-couples"
              className="group flex flex-col items-center justify-center text-center rounded-2xl p-8 sm:p-12 min-h-[220px] sm:aspect-video h-full transition-all duration-300 hover:scale-[1.01] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-white/60"
              style={{ border: `2px dashed ${accent}55`, backgroundColor: '#111111' }}
              aria-label="Be our next wedding film, see the founder deal"
            >
              <p className="font-handwriting text-5xl sm:text-6xl mb-4 rotate-[-3deg]" style={{ color: accent }}>
                you, next?
              </p>
              <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-xs mb-7">
                That&apos;s our only film so far, and we&apos;re looking for couple number two.
                The first 10 get the founder deal: special price, VIP edit, bragging rights.
              </p>
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-black font-extrabold text-xs tracking-[0.2em] uppercase transition-all duration-200 group-hover:scale-[1.03] shadow-lg"
                style={{ backgroundColor: accent, boxShadow: `0 10px 26px ${accent}40` }}
              >
                Claim your spot
                <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={2.5} aria-hidden="true" />
              </span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
