'use client';

import { motion, type Variants } from 'framer-motion';
import { MessageCircle, ArrowDown } from 'lucide-react';
import { whatsappLinks } from '@/utils/whatsapp';
import OfficeCaption from './OfficeCaption';
import { BlankBoard, PolaroidCard, TikTokCard } from './ServiceMedia';
import type { PortfolioItem } from '@/data/portfolioData';

const NOISE =
  'url("data:image/svg+xml,%3Csvg viewBox=%270 0 256 256%27 xmlns=%27http://www.w3.org/2000/svg%27%3E%3Cfilter id=%27n%27%3E%3CfeTurbulence type=%27fractalNoise%27 baseFrequency=%270.85%27 numOctaves=%274%27 stitchTiles=%27stitch%27/%3E%3C/filter%3E%3Crect width=%27100%25%27 height=%27100%25%27 filter=%27url(%23n)%27/%3E%3C/svg%3E")';

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

export interface ServiceHeroConfig {
  headingFont: string;
  handwritingFont: string;
  eyebrow: string;
  heading: [string, string];
  copy: string[];
  caption: string;
  media: 'blank' | 'polaroid' | 'tiktok';
  mediaItem?: PortfolioItem;
  mediaCaption?: string;
  mediaPlayable?: boolean;
  tiktokHandle?: string;
  tiktokUrl?: string;
}

interface ServiceHeroProps {
  config: ServiceHeroConfig;
  accent: string;
  waMessage: string;
  waSource: string;
  ctaLabel?: string;
  light?: boolean;
  onOpen?: (item: PortfolioItem) => void;
}

export default function ServiceHero({
  config,
  accent,
  waMessage,
  waSource,
  ctaLabel = 'Count Me In',
  light = false,
  onOpen,
}: ServiceHeroProps) {
  const handlePM = () => {
    window.open(whatsappLinks.custom(waMessage, waSource), '_blank');
  };

  return (
    <section className={`relative overflow-hidden ${light ? 'bg-[#fdfcfa]' : 'bg-[#0d0d0d]'}`}>
      {/* Ambient glows — wedding-style, slowly breathing */}
      {!light && (
        <>
          <motion.div
            className="absolute -top-44 -right-24 w-[540px] h-[540px] rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: accent, opacity: 0.13 }}
            animate={{ opacity: [0.1, 0.17, 0.1], scale: [1, 1.08, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
          <motion.div
            className="absolute -bottom-52 -left-24 w-[480px] h-[480px] rounded-full blur-3xl pointer-events-none"
            style={{ backgroundColor: accent, opacity: 0.08 }}
            animate={{ opacity: [0.06, 0.11, 0.06] }}
            transition={{ duration: 9, repeat: Infinity, ease: 'easeInOut' }}
            aria-hidden="true"
          />
        </>
      )}

      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.05]"
        style={{ backgroundImage: NOISE }}
        aria-hidden="true"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 sm:pt-24 pb-16 sm:pb-24">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid lg:grid-cols-[1.15fr_1fr] gap-10 lg:gap-14 items-center"
        >
          {/* Copy */}
          <div>
            <motion.p
              variants={fadeUp}
              className={`${config.handwritingFont} text-2xl sm:text-3xl mb-4`}
              style={{ color: accent }}
            >
              {config.eyebrow}
            </motion.p>

            <motion.h2
              variants={fadeUp}
              className={`${config.headingFont} font-bold text-4xl sm:text-6xl leading-[1.05] mb-6 ${
                light ? 'text-stone-900' : 'text-white'
              }`}
            >
              {config.heading[0]}{' '}
              <span className="italic" style={{ color: accent }}>
                {config.heading[1]}
              </span>
            </motion.h2>

            <motion.div variants={fadeUp} className="space-y-3 mb-8">
              {config.copy.map((para) => (
                <p
                  key={para}
                  className={`text-sm sm:text-base leading-relaxed max-w-md ${
                    light ? 'text-stone-600' : 'text-white/60'
                  }`}
                >
                  {para}
                </p>
              ))}
            </motion.div>

            {/* CTAs */}
            <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={handlePM}
                className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full text-black font-extrabold text-xs tracking-[0.2em] uppercase transition-all duration-200 hover:scale-[1.03] hover:brightness-110 shadow-lg"
                style={{ backgroundColor: accent, boxShadow: `0 10px 30px ${accent}40` }}
              >
                <MessageCircle className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
                {ctaLabel}
              </button>
              <a
                href="#founder-deal"
                className={`inline-flex items-center gap-1.5 text-sm font-semibold transition-colors ${
                  light ? 'text-stone-400 hover:text-stone-800' : 'text-white/50 hover:text-white'
                }`}
              >
                see the founder deal
                <ArrowDown className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
              </a>
            </motion.div>
          </div>

          {/* Media */}
          <motion.div variants={fadeUp} className="flex flex-col items-center gap-5">
            {config.media === 'blank' && (
              <BlankBoard accent={accent} handwritingFont={config.handwritingFont} light={light} />
            )}
            {config.media === 'polaroid' && config.mediaItem && (
              <PolaroidCard
                item={config.mediaItem}
                handwritingFont={config.handwritingFont}
                caption={config.mediaCaption ?? 'the one so far'}
                onOpen={config.mediaPlayable !== false ? onOpen : undefined}
              />
            )}
            {config.media === 'tiktok' && config.mediaItem && (
              <TikTokCard
                item={config.mediaItem}
                accent={accent}
                handle={config.tiktokHandle ?? '@handle'}
                href={config.tiktokUrl}
              />
            )}
            <OfficeCaption text={config.caption} />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
