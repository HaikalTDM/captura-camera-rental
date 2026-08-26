'use client';

import { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { Star, Plus } from 'lucide-react';
import {
  weddingFaqs,
  GOOGLE_RATING,
  GOOGLE_REVIEWS_URL,
  type PortfolioItem,
} from '@/data/portfolioData';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 0.61, 0.36, 1] },
  },
};

interface WeddingTestimonialsProps {
  items: PortfolioItem[];
  accent: string;
  accentSoft: string;
}

export default function WeddingTestimonials({ items, accent, accentSoft }: WeddingTestimonialsProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [showFullReview, setShowFullReview] = useState(false);
  const testimonial = items[0];

  return (
    <section className="relative bg-[#111111] py-16 sm:py-24 border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ===== Kind words — one review, honest ===== */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-12 sm:mb-16"
        >
          <p className="font-handwriting text-3xl sm:text-4xl mb-2" style={{ color: accent }}>
            kind words
          </p>
          <h2 className="font-friendly text-4xl sm:text-6xl font-extrabold text-white">
            One down, <span className="italic" style={{ color: accent }}>many more to go.</span>
          </h2>
        </motion.div>

        {testimonial && (
          <motion.figure
            initial={{ opacity: 0, y: 26 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.6, ease: [0.22, 0.61, 0.36, 1] }}
            className="max-w-3xl mx-auto text-center"
          >
            <div
              className="rounded-3xl p-8 sm:p-12"
              style={{
                border: `2px dashed ${accent}40`,
                backgroundColor: '#0d0d0d',
                boxShadow: `0 24px 60px rgba(0,0,0,0.4), 0 0 50px ${accent}10`,
              }}
            >
              <div className="flex items-center justify-center gap-0.5 mb-6" aria-label={`${testimonial.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, s) => (
                  <Star
                    key={s}
                    className={`w-5 h-5 ${s < testimonial.rating ? 'text-[#f4e7a1]' : 'text-white/15'}`}
                    fill={s < testimonial.rating ? '#f4e7a1' : 'none'}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                ))}
              </div>
              <blockquote className="text-white/85 text-lg sm:text-2xl leading-relaxed italic mb-8">
                &ldquo;{testimonial.testimonialShort ?? testimonial.testimonial}&rdquo;
              </blockquote>
              <figcaption>
                <p className="font-handwriting text-3xl sm:text-4xl leading-tight" style={{ color: accent }}>
                  {testimonial.clientName}
                </p>
                <p className="text-white/40 text-xs mt-1.5">
                  {testimonial.clientRole} &middot; {testimonial.year}
                </p>
              </figcaption>

              {/* Google rating */}
              <div className="mt-8 pt-6 border-t border-white/10 flex items-center justify-center gap-3">
                <div className="flex items-center gap-0.5" aria-label={`${GOOGLE_RATING} out of 5 on Google`}>
                  {Array.from({ length: 5 }).map((_, s) => (
                    <Star
                      key={s}
                      className="w-3.5 h-3.5 text-[#f4e7a1]"
                      fill="#f4e7a1"
                      strokeWidth={1}
                      aria-hidden="true"
                    />
                  ))}
                </div>
                <span className="text-white/50 text-xs font-semibold">
                  {GOOGLE_RATING} &middot; Google Reviews
                </span>
              </div>

              {/* Leave us a review */}
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-3 font-handwriting text-xl sm:text-2xl text-white/40 hover:text-white transition-colors"
              >
                enjoyed your film? leave us a review on google
                <span style={{ color: accent }}> &rarr;</span>
              </a>
            </div>

            {/* Humour + expandable full review */}
            <button
              type="button"
              onClick={() => setShowFullReview((v) => !v)}
              aria-expanded={showFullReview}
              aria-controls="full-review"
              className="mt-8 inline-flex items-center gap-1.5 font-handwriting text-2xl sm:text-3xl text-white/60 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 rounded-lg px-2 py-1"
            >
              {showFullReview
                ? 'okay, that\u2019s the whole review. yes, we teared up too'
                : 'psst\u2026 to read the whole review, click here'}
              <span style={{ color: accent }}>{showFullReview ? '\u2191' : '\u2193'}</span>
            </button>

            <AnimatePresence initial={false}>
              {showFullReview && (
                <motion.div
                  id="full-review"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <blockquote className="mt-4 rounded-2xl bg-[#0d0d0d] ring-1 ring-white/10 p-6 sm:p-8 text-left text-white/70 text-sm sm:text-base leading-relaxed italic max-w-2xl mx-auto">
                    {testimonial.testimonial.split('\n\n').map((para, i, paras) => (
                      <p key={i} className={i > 0 ? 'mt-4' : ''}>
                        {i === 0 && <span aria-hidden="true">&ldquo;</span>}
                        {para}
                        {i === paras.length - 1 && <span aria-hidden="true">&rdquo;</span>}
                      </p>
                    ))}
                  </blockquote>
                </motion.div>
              )}
            </AnimatePresence>

            <a
              href="#founding-couples"
              className="block mt-6 font-handwriting text-2xl sm:text-3xl text-white/60 hover:text-white transition-colors"
            >
              want to be our second? <span style={{ color: accent }}>↓</span>
            </a>
          </motion.figure>
        )}

        {/* ===== FAQ ===== */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-10 mt-20 sm:mt-28"
        >
          <p className="font-handwriting text-3xl sm:text-4xl mb-2" style={{ color: accent }}>
            things couples ask us
          </p>
          <h2 className="font-friendly text-4xl sm:text-5xl font-extrabold text-white">
            Questions, <span className="italic" style={{ color: accent }}>answered</span>
          </h2>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="max-w-3xl mx-auto space-y-3"
        >
          {weddingFaqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <motion.div
                key={faq.q}
                variants={fadeUp}
                className="bg-[#0d0d0d] rounded-xl ring-1 ring-white/10 hover:ring-white/25 transition-colors duration-300 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${i}`}
                  id={`faq-button-${i}`}
                  className="w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-4 sm:py-5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/40"
                >
                  <span className="text-sm sm:text-base font-bold text-white">{faq.q}</span>
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
                      <p className="px-5 sm:px-7 pb-5 sm:pb-6 text-white/55 text-sm leading-relaxed">
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
