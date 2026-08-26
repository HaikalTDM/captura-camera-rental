'use client';

import { motion, type Variants } from 'framer-motion';
import { Play, ChevronDown } from 'lucide-react';
import type { PortfolioItem } from '@/data/portfolioData';

interface WeddingHeroProps {
  reel: PortfolioItem;
  accent: string;
  accentSoft: string;
  onOpen: (item: PortfolioItem) => void;
}

const container: Variants = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.12, delayChildren: 0.05 },
  },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.22, 0.61, 0.36, 1] },
  },
};

export default function WeddingHero({ reel, accent, accentSoft, onOpen }: WeddingHeroProps) {
  return (
    <section className="relative bg-[#0d0d0d] overflow-hidden">
      {/* Ambient gold glow — slowly breathing */}
      <motion.div
        className="absolute -top-48 -right-24 w-[560px] h-[560px] rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: accent, opacity: 0.14 }}
        animate={{ opacity: [0.1, 0.18, 0.1], scale: [1, 1.08, 1] }}
        transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute -bottom-56 -left-24 w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: accent, opacity: 0.08 }}
        animate={{ opacity: [0.06, 0.11, 0.06] }}
        transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 sm:pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-2 gap-10 lg:gap-14 items-center mt-4"
        >
          {/* Copy */}
          <div>
            {/* Eyebrow + handwritten sticker */}
            <motion.div variants={fadeUp} className="flex items-center justify-between gap-4 mb-4">
              <p className="font-handwriting text-2xl sm:text-3xl" style={{ color: accent }}>
                wedding films, the fun kind
              </p>
              <span
                className="shrink-0 rotate-[-5deg] font-handwriting text-xl sm:text-2xl text-white/85 px-2 py-1"
                style={{ backgroundColor: accentSoft, borderRadius: '8px' }}
              >
                founder spots open!
              </span>
            </motion.div>

            <motion.h1
              variants={fadeUp}
              className="font-friendly text-5xl sm:text-7xl font-extrabold text-white leading-[1.02] mb-6"
            >
              Love, in <span className="italic" style={{ color: accent }}>motion.</span>
            </motion.h1>

            <motion.div variants={fadeUp}>
              <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-md mb-8">
                Three to four minutes of your best day. No stiff poses, no awkward directing. Just
                your people being themselves, captured like a mockumentary.
                <span className="block mt-3 text-white/70">
                  We just opened, and we&apos;re looking for our first 10 founder couples. PM us
                  for the founder price.
                </span>
              </p>
            </motion.div>

            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => onOpen(reel)}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-black font-bold text-xs tracking-[0.25em] uppercase transition-all duration-200 hover:scale-[1.03] shadow-lg"
                style={{ backgroundColor: accent, boxShadow: `0 10px 30px ${accent}40` }}
              >
                <Play className="w-4 h-4" fill="currentColor" strokeWidth={0} aria-hidden="true" />
                Watch the Showreel
              </button>
              <a
                href="#wedding-packages"
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-white/80 border border-white/20 font-bold text-xs tracking-[0.25em] uppercase transition-all duration-200 hover:border-white/50 hover:text-white hover:scale-[1.03]"
              >
                See Packages
              </a>
            </motion.div>
          </div>

          {/* Reel */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
            className="relative"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 group">
              <video
                src={reel.videoUrl}
                poster={reel.thumbnail}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                className="absolute inset-0 w-full h-full object-cover"
                aria-label="Captura wedding showreel (sample)"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30" />

              {/* Play overlay */}
              <button
                type="button"
                onClick={() => onOpen(reel)}
                aria-label="Open the wedding showreel"
                className="absolute inset-0 flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60"
              >
                <span
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                  style={{ backgroundColor: `${accent}cc`, backdropFilter: 'blur(6px)' }}
                >
                  <Play className="w-6 h-6 sm:w-7 sm:h-7 text-white ml-0.5" fill="currentColor" strokeWidth={0} aria-hidden="true" />
                </span>
              </button>

              {/* Reel meta */}
              <div className="absolute bottom-4 left-5 right-5 flex items-end justify-between">
                <div>
                  <p className="text-white/90 text-sm font-bold">{reel.title}</p>
                  <p className="font-handwriting text-lg text-white/60 leading-tight">{reel.duration} &middot; {reel.style}</p>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm"
                  style={{ backgroundColor: accentSoft, color: accent, border: `1px solid ${accent}55` }}
                >
                  {reel.year}
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Scroll hint */}
        <motion.a
          href="#wedding-featured"
          aria-label="Scroll to featured films"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="mt-12 hidden sm:flex flex-col items-center gap-1 text-white/30 hover:text-white/70 transition-colors"
        >
          <span className="font-handwriting text-lg leading-none">keep scrolling…</span>
          <ChevronDown className="w-4 h-4 animate-bounce" strokeWidth={2} />
        </motion.a>
      </div>
    </section>
  );
}
