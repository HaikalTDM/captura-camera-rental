'use client';

import { motion, type Variants } from 'framer-motion';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] },
  },
};

export interface HowStep {
  step: string;
  title: string;
  body: string;
}

interface HowItWorksProps {
  headingFont: string;
  handwritingFont: string;
  accent: string;
  eyebrow: string;
  heading: [string, string];
  steps: HowStep[];
  light?: boolean;
}

export default function HowItWorks({
  headingFont,
  handwritingFont,
  accent,
  eyebrow,
  heading,
  steps,
  light = false,
}: HowItWorksProps) {
  return (
    <section className={`relative py-16 sm:py-24 ${light ? 'bg-white' : 'bg-[#111111]'}`}>
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
          className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12"
        >
          {steps.map((item) => (
            <motion.div key={item.step} variants={fadeUp} className="text-center">
              <p
                className={`${handwritingFont} text-6xl sm:text-7xl mb-3`}
                style={{ color: accent, opacity: 0.55 }}
              >
                {item.step}
              </p>
              <h3
                className={`${headingFont} text-2xl sm:text-3xl font-bold mb-3 ${
                  light ? 'text-stone-900' : 'text-white'
                }`}
              >
                {item.title}
              </h3>
              <p
                className={`text-sm leading-relaxed max-w-xs mx-auto ${
                  light ? 'text-stone-500' : 'text-white/50'
                }`}
              >
                {item.body}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
