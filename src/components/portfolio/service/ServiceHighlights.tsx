'use client';

import { motion, type Variants } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] },
  },
};

export interface HighlightItem {
  icon: LucideIcon;
  title: string;
  body: string;
}

interface ServiceHighlightsProps {
  headingFont: string;
  handwritingFont: string;
  accent: string;
  eyebrow: string;
  heading: [string, string];
  items: HighlightItem[];
  light?: boolean;
}

export default function ServiceHighlights({
  headingFont,
  handwritingFont,
  accent,
  eyebrow,
  heading,
  items,
  light = false,
}: ServiceHighlightsProps) {
  return (
    <section
      className={`relative py-16 sm:py-24 ${
        light ? 'bg-[#fdfcfa] border-t border-black/5' : 'bg-[#0d0d0d] border-y border-white/5'
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className={`${handwritingFont} text-3xl sm:text-4xl mb-2`} style={{ color: accent }}>
            {eyebrow}
          </p>
          <h2
            className={`${headingFont} font-bold text-4xl sm:text-6xl ${
              light ? 'text-stone-900' : 'text-white'
            }`}
          >
            {heading[0]}{' '}
            <span className="italic" style={{ color: accent }}>
              {heading[1]}
            </span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        >
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <motion.div key={item.title} variants={fadeUp}>
                <SpotlightCard
                  accent={accent}
                  className={`rounded-2xl p-6 sm:p-7 ring-1 transition-all duration-300 hover:-translate-y-1.5 h-full ${
                    light
                      ? 'bg-white ring-stone-200 hover:ring-stone-400 shadow-sm'
                      : 'bg-[#111111] ring-white/10 hover:ring-white/25 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)]'
                  }`}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
                    style={{ backgroundColor: `${accent}1a` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: accent }} strokeWidth={2} aria-hidden="true" />
                  </div>
                  <h3
                    className={`${headingFont} text-lg font-bold mb-2 ${
                      light ? 'text-stone-900' : 'text-white'
                    }`}
                  >
                    {item.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${light ? 'text-stone-500' : 'text-white/50'}`}>
                    {item.body}
                  </p>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
