'use client';

import { motion, type Variants } from 'framer-motion';
import { Check } from 'lucide-react';
import { weddingPackages } from '@/data/portfolioData';
import SpotlightCard from '@/components/portfolio/service/SpotlightCard';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] },
  },
};

interface WeddingPackagesProps {
  accent: string;
  accentSoft: string;
}

const fmt = (n: number) => `RM ${n.toLocaleString('en-MY')}`;

export default function WeddingPackages({ accent, accentSoft }: WeddingPackagesProps) {
  return (
    <section id="wedding-packages" className="relative bg-[#0d0d0d] scroll-mt-20 py-16 sm:py-24">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
          className="text-center mb-4"
        >
          <p className="font-handwriting text-3xl sm:text-4xl mb-2" style={{ color: accent }}>
            packages, but friendly
          </p>
          <h2 className="font-friendly text-4xl sm:text-6xl font-extrabold text-white">
            Pick your <span className="italic" style={{ color: accent }}>vibe</span>
          </h2>
        </motion.div>

        {/* Handwritten note — founder price via PM */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="text-center mb-12"
        >
          <span
            className="inline-block rotate-[-2deg] px-5 py-1.5 font-handwriting text-2xl sm:text-3xl text-white"
            style={{ backgroundColor: accentSoft, borderRadius: '10px', boxShadow: '0 2px 0 rgba(0,0,0,0.2)' }}
          >
            these are our normal prices. founder couples pm us for the special one!
          </span>
        </motion.div>

        {/* Cards */}
        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 items-stretch"
        >
          {weddingPackages.map((pkg) => (
            <motion.div key={pkg.id} variants={fadeUp} className="relative h-full">
              {pkg.popular && (
                <span
                  className="absolute -top-4 left-1/2 -translate-x-1/2 rotate-[-3deg] px-4 py-0.5 font-handwriting text-2xl text-black shadow-lg whitespace-nowrap z-10"
                  style={{ backgroundColor: accent, borderRadius: '8px' }}
                >
                  most popular!
                </span>
              )}

              <SpotlightCard
                accent={accent}
                style={
                  pkg.popular
                    ? { boxShadow: `0 0 0 2px ${accent}, 0 24px 60px rgba(0,0,0,0.6)` }
                    : undefined
                }
                className="flex flex-col rounded-2xl p-7 sm:p-8 transition-all duration-300 hover:-translate-y-1.5 h-full bg-[#111111] ring-1 ring-white/10 hover:ring-white/25 hover:shadow-[0_28px_70px_rgba(0,0,0,0.6)]"
              >
                <h3 className="font-friendly text-2xl sm:text-3xl font-extrabold text-white">
                  {pkg.name}
                </h3>
                <p className="font-handwriting text-xl text-white/50 mt-1 mb-6">{pkg.tagline}</p>

                {/* Price */}
                <div className="mb-6">
                  <div className="flex items-baseline gap-3 flex-wrap">
                    <span className="font-friendly text-4xl sm:text-5xl font-extrabold text-white">
                      {fmt(pkg.price)}
                    </span>
                    <span className="text-white/40 text-sm line-through decoration-2">
                      {fmt(pkg.originalPrice)}
                    </span>
                  </div>
                  <p className="font-handwriting text-xl mt-1" style={{ color: accent }}>
                    you save {fmt(pkg.originalPrice - pkg.price)}!
                  </p>
                  <p className="font-handwriting text-lg text-white/50 mt-0.5">
                    founder couples: pm us for the founder price ✨
                  </p>
                </div>

                {/* Features */}
                <ul className="flex-1 space-y-2.5 mb-8">
                  {pkg.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm text-white/70">
                      <Check
                        className="w-4 h-4 mt-0.5 shrink-0"
                        style={{ color: accent }}
                        strokeWidth={2.5}
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <div className="relative">
                  {pkg.popular && (
                    <motion.span
                      className="absolute inset-0 rounded-full pointer-events-none"
                      style={{ backgroundColor: accent }}
                      animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.1, 0.3] }}
                      transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                      aria-hidden="true"
                    />
                  )}
                  <a
                    href="#inquiry"
                    className={[
                      'relative block text-center rounded-full py-3.5 text-xs font-bold uppercase tracking-[0.25em] transition-all duration-200 hover:scale-[1.02]',
                      pkg.popular ? 'text-black shadow-lg' : 'text-white/80 border border-white/20 hover:border-white/50 hover:text-white',
                    ].join(' ')}
                    style={
                      pkg.popular
                        ? { backgroundColor: accent, boxShadow: `0 10px 28px ${accent}40` }
                        : undefined
                    }
                  >
                    Book This Package
                  </a>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>

        <p className="text-center text-white/35 text-xs mt-8">
          Extra hours RM 200/hr &middot; Drone add-on RM 300 (Fun Highlight+) &middot; Travel outside KL &amp; Selangor at cost
        </p>
      </div>
    </section>
  );
}
