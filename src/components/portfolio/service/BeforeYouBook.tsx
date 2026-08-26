'use client';

import { motion, type Variants } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import SpotlightCard from './SpotlightCard';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] },
  },
};

export interface BeforeYouBookBlock {
  icon: LucideIcon;
  title: string;
  lines: string[];
}

interface BeforeYouBookProps {
  headingFont: string;
  handwritingFont: string;
  accent: string;
  eyebrow: string;
  heading: [string, string];
  intro: string;
  blocks: BeforeYouBookBlock[];
  outro: string;
}

export default function BeforeYouBook({
  headingFont,
  handwritingFont,
  accent,
  eyebrow,
  heading,
  intro,
  blocks,
  outro,
}: BeforeYouBookProps) {
  return (
    <section className="relative bg-[#111111] py-16 sm:py-24 border-y border-white/5">
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
          <h2 className={`${headingFont} font-bold text-4xl sm:text-6xl text-white`}>
            {heading[0]}{' '}
            <span className="italic" style={{ color: accent }}>
              {heading[1]}
            </span>
          </h2>
          <p className="text-white/50 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto mt-6">
            {intro}
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
        >
          {blocks.map((block) => {
            const Icon = block.icon;
            return (
              <motion.div key={block.title} variants={fadeUp}>
                <SpotlightCard
                  accent={accent}
                  className="rounded-2xl p-6 sm:p-7 ring-1 ring-white/10 hover:ring-white/25 transition-all duration-300 hover:-translate-y-1 bg-[#0d0d0d] h-full"
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${accent}1a` }}
                  >
                    <Icon className="w-5 h-5" style={{ color: accent }} strokeWidth={2} aria-hidden="true" />
                  </div>
                  <h3 className={`${headingFont} text-xl font-bold text-white mb-3`}>
                    {block.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {block.lines.map((line) => (
                      <li key={line} className="flex items-start gap-2.5 text-sm text-white/60 leading-relaxed">
                        <span
                          className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0"
                          style={{ backgroundColor: accent }}
                          aria-hidden="true"
                        />
                        {line}
                      </li>
                    ))}
                  </ul>
                </SpotlightCard>
              </motion.div>
            );
          })}
        </motion.div>

        <motion.p
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className={`${handwritingFont} text-2xl sm:text-3xl text-center mt-10 max-w-3xl mx-auto leading-snug`}
          style={{ color: accent }}
        >
          {outro}
        </motion.p>
      </div>
    </section>
  );
}
