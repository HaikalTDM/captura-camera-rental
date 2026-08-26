'use client';

import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Plus } from 'lucide-react';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] },
  },
};

export interface FaqItem {
  q: string;
  a: string;
}

interface ServiceFaqProps {
  headingFont: string;
  handwritingFont: string;
  accent: string;
  accentSoft: string;
  eyebrow: string;
  heading: [string, string];
  items: FaqItem[];
  light?: boolean;
}

export default function ServiceFaq({
  headingFont,
  handwritingFont,
  accent,
  accentSoft,
  eyebrow,
  heading,
  items,
  light = false,
}: ServiceFaqProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section
      className={`relative py-16 sm:py-24 ${
        light ? 'bg-[#fdfcfa] border-t border-black/5' : 'bg-[#0d0d0d] border-t border-white/5'
      }`}
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-10"
        >
          <p className={`${handwritingFont} text-3xl sm:text-4xl mb-2`} style={{ color: accent }}>
            {eyebrow}
          </p>
          <h2
            className={`${headingFont} font-bold text-4xl sm:text-5xl ${
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
          className="space-y-3"
        >
          {items.map((faq, i) => {
            const isOpen = openIndex === i;
            return (
              <motion.div
                key={faq.q}
                variants={fadeUp}
                className={`rounded-xl ring-1 overflow-hidden ${
                  light ? 'bg-white ring-stone-200' : 'bg-[#111111] ring-white/10 hover:ring-white/25 transition-colors duration-300'
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-button-${i}`}
                  className={`w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-4 sm:py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset ${
                    light ? 'text-stone-900 focus-visible:ring-stone-400' : 'text-white focus-visible:ring-white/40'
                  }`}
                >
                  <span className="text-sm sm:text-base font-bold">{faq.q}</span>
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}
                    style={{ backgroundColor: accentSoft }}
                    aria-hidden="true"
                  >
                    <Plus className="w-4 h-4" style={{ color: accent }} strokeWidth={2.5} />
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`faq-panel-${i}`}
                      role="region"
                      aria-labelledby={`faq-button-${i}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                      className="overflow-hidden"
                    >
                      <p className={`px-5 sm:px-7 pb-5 sm:pb-6 text-sm leading-relaxed ${light ? 'text-stone-500' : 'text-white/55'}`}>
                        {faq.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}
