'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play, ArrowRight, Clock } from 'lucide-react';
import type { PortfolioItem } from '@/data/portfolioData';

interface WeddingTeaserProps {
  film: PortfolioItem;
  accent: string;
  onOpen: (item: PortfolioItem) => void;
}

// Subtle film grain so dark sections feel tactile, not "glowy"
const NOISE =
  'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")';

export default function WeddingTeaser({ film, accent, onOpen }: WeddingTeaserProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="relative overflow-hidden rounded-3xl bg-[#0d0d0d] shadow-xl"
    >
      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{ backgroundImage: NOISE }}
        aria-hidden="true"
      />

      <div className="relative grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center px-6 sm:px-10 lg:px-14 py-10 sm:py-14">
        {/* Copy */}
        <div>
          <p className="font-handwriting text-2xl sm:text-3xl mb-4" style={{ color: accent }}>
            wedding films, the fun kind
          </p>

          <h2 className="font-friendly text-4xl sm:text-6xl font-extrabold text-white leading-[1.05] mb-6">
            Love, in <span className="italic" style={{ color: accent }}>motion.</span>
          </h2>

          <div className="space-y-3 mb-8">
            <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-md">
              Three to four minutes of your best day. No stiff poses, just your people being
              themselves. This is our first wedding film, and honestly? We&apos;re pretty proud
              of it.
            </p>
            <p className="text-white/60 text-sm sm:text-base leading-relaxed max-w-md">
              We&apos;re looking for our first 10 founder couples. Showreel, packages, the lot,
              one click away.
            </p>
          </div>

          {/* CTA */}
          <div>
            <Link
              href="/portfolio/weddings"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-full text-black font-extrabold text-xs tracking-[0.2em] uppercase transition-all duration-200 hover:scale-[1.03] hover:brightness-110 shadow-lg"
              style={{ backgroundColor: accent, boxShadow: `0 10px 30px ${accent}40` }}
            >
              Explore Wedding Films
              <ArrowRight
                className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1"
                strokeWidth={2.5}
                aria-hidden="true"
              />
            </Link>
            <p className="font-handwriting text-xl sm:text-2xl text-white/50 mt-3">
              the full show is one click away →
            </p>
          </div>
        </div>

        {/* Film — portrait poster + caption card */}
        <div className="flex flex-col items-center gap-5">
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
            className="group relative w-full max-w-sm aspect-[4/5] overflow-hidden rounded-2xl bg-stone-900 cursor-pointer shadow-2xl ring-1 ring-white/10 hover:scale-[1.01] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-black focus-visible:ring-white/60"
          >
            {/* Tape */}
            <div
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 rotate-[-2deg] bg-white/20 backdrop-blur-sm z-10"
              style={{ clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0 100%)' }}
              aria-hidden="true"
            />

            <Image
              src={film.thumbnail}
              alt={film.title}
              fill
              sizes="(max-width: 1024px) 100vw, 480px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-black/20" />

            {film.duration && (
              <span
                className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide backdrop-blur-md"
                style={{ backgroundColor: 'rgba(13,13,13,0.6)', color: accent, border: `1px solid ${accent}66` }}
              >
                <Clock className="w-3 h-3" strokeWidth={2} aria-hidden="true" />
                {film.duration} &middot; {film.style}
              </span>
            )}

            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                style={{ backgroundColor: `${accent}cc`, backdropFilter: 'blur(6px)' }}
              >
                <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-0.5" fill="currentColor" strokeWidth={0} aria-hidden="true" />
              </span>
            </div>

            <div className="absolute inset-x-0 bottom-0 p-5">
              <p className="text-white font-friendly font-extrabold drop-shadow-lg leading-tight text-2xl">
                {film.clientName}
              </p>
                <p className="font-handwriting text-xl text-white/60 leading-tight">
                  {film.year}
                  {film.location ? ` · ${film.location}` : ''}
                </p>
            </div>
          </div>

          {/* Office-style caption */}
          <div className="w-full max-w-sm rotate-[-1deg]">
            <div className="bg-black border border-white/25 px-4 py-2.5 text-center shadow-lg">
              <p className="font-mono text-white text-xs sm:text-sm tracking-[0.2em] uppercase">
                Wedding film #1: more coming
              </p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
