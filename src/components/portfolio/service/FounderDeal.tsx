'use client';

import { motion, type Variants } from 'framer-motion';
import { MessageCircle, Check } from 'lucide-react';
import { whatsappLinks } from '@/utils/whatsapp';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] },
  },
};

interface FounderDealProps {
  headingFont: string;
  handwritingFont: string;
  accent: string;
  eyebrow: string;
  heading: [string, string];
  copy: string;
  perks: string[];
  smallPrint: string;
  waMessage: string;
  waSource: string;
  ctaLabel?: string;
  light?: boolean;
}

export default function FounderDeal({
  headingFont,
  handwritingFont,
  accent,
  eyebrow,
  heading,
  copy,
  perks,
  smallPrint,
  waMessage,
  waSource,
  ctaLabel = 'COUNT ME IN',
  light = false,
}: FounderDealProps) {
  const handlePM = () => {
    window.open(whatsappLinks.custom(waMessage, waSource), '_blank');
  };

  return (
    <section
      id="founder-deal"
      className={`relative py-16 sm:py-24 scroll-mt-20 ${
        light ? 'bg-white border-t border-black/5' : 'bg-[#111111] border-y border-white/5'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className={`${handwritingFont} text-3xl sm:text-4xl mb-3`} style={{ color: accent }}>
            {eyebrow}
          </p>
          <h2
            className={`${headingFont} font-bold text-4xl sm:text-6xl mb-6 ${
              light ? 'text-stone-900' : 'text-white'
            }`}
          >
            {heading[0]}{' '}
            <span className="italic" style={{ color: accent }}>
              {heading[1]}
            </span>
          </h2>
          <p
            className={`text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mb-10 ${
              light ? 'text-stone-600' : 'text-white/60'
            }`}
          >
            {copy}
          </p>
        </motion.div>

        {/* Deal panel — dark slab with glow */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative rounded-3xl p-7 sm:p-10 text-left max-w-2xl mx-auto"
          style={{
            border: `2px dashed ${accent}66`,
            backgroundColor: '#0d0d0d',
            boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 60px ${accent}14`,
          }}
        >
          <span
            className="absolute -top-4 left-1/2 -translate-x-1/2 rotate-[-3deg] whitespace-nowrap px-4 py-0.5 text-black font-bold text-sm sm:text-base"
            style={{ backgroundColor: accent, borderRadius: '8px' }}
          >
            {eyebrow}
          </span>

          <ul className="mt-4 space-y-4">
            {perks.map((perk, i) => (
              <motion.li
                key={perk}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.1, ease: [0.22, 0.61, 0.36, 1] }}
                className="flex items-start gap-3 text-white/75 text-sm sm:text-base leading-relaxed"
              >
                <Check
                  className="w-5 h-5 mt-0.5 shrink-0"
                  style={{ color: accent }}
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
                {perk}
              </motion.li>
            ))}
          </ul>

          <div className="text-center mt-8">
            {/* Pulsing halo behind the CTA */}
            <div className="relative inline-flex">
              <motion.span
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{ backgroundColor: accent }}
                animate={{ scale: [1, 1.12, 1], opacity: [0.35, 0.12, 0.35] }}
                transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                aria-hidden="true"
              />
              <button
                type="button"
                onClick={handlePM}
                className="relative inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-black font-extrabold text-sm tracking-[0.15em] uppercase transition-all duration-200 hover:scale-[1.03] hover:brightness-110 shadow-xl"
                style={{ backgroundColor: accent, boxShadow: `0 12px 34px ${accent}45` }}
              >
                <MessageCircle className="w-5 h-5" strokeWidth={2.5} aria-hidden="true" />
                {ctaLabel}
              </button>
            </div>
            <p className={`${handwritingFont} text-xl sm:text-2xl text-white/50 mt-3`}>
              pm us for the founder price
            </p>
            <p className={`text-xs mt-3 ${light ? 'text-stone-400' : 'text-white/25'}`}>{smallPrint}</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
