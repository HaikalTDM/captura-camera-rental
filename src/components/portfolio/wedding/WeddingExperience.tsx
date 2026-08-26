'use client';

import { motion, type Variants } from 'framer-motion';

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.14 } },
};

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 24 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 0.61, 0.36, 1] },
  },
};

interface WeddingExperienceProps {
  accent: string;
}

const steps = [
  {
    step: '01',
    title: 'Reach out',
    body: 'Tell us your date and your vibe. We reply within 24 hours with availability and a tailored quote.',
  },
  {
    step: '02',
    title: 'We capture',
    body: 'Five to eight hours of your day. No stiff poses, no awkward directing. We blend in and keep it fun.',
  },
  {
    step: '03',
    title: 'You receive',
    body: 'A polished 3–4 minute film in 2–4 weeks, delivered in full quality and ready to post.',
  },
];

export default function WeddingExperience({ accent }: WeddingExperienceProps) {
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
          <p className="font-handwriting text-3xl sm:text-4xl mb-2" style={{ color: accent }}>
            how it works
          </p>
          <h2 className="font-friendly text-4xl sm:text-6xl font-extrabold text-white">
            Simple from start <span className="italic" style={{ color: accent }}>to finish.</span>
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
                className="font-handwriting text-6xl sm:text-7xl mb-3"
                style={{ color: accent, opacity: 0.55 }}
              >
                {item.step}
              </p>
              <h3 className="font-friendly text-2xl sm:text-3xl font-extrabold text-white mb-3">
                {item.title}
              </h3>
              <p className="text-white/50 text-sm leading-relaxed max-w-xs mx-auto">{item.body}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
