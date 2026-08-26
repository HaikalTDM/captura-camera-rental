'use client';

import { motion, type Variants } from 'framer-motion';
import { MessageCircle, ArrowDown } from 'lucide-react';
import { whatsappLinks } from '@/utils/whatsapp';

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: [0.22, 0.61, 0.36, 1] },
  },
};

interface FoundingCouplesProps {
  accent: string;
}

const perks = [
  {
    num: '1.',
    title: 'The founder price',
    body: 'Our lowest price, ever. Even better than what\u2019s on the packages page. PM us and we\u2019ll reveal it. We cannot afford to do this twice: inflation is real, and so is our rent.',
  },
  {
    num: '2.',
    title: 'The VIP edit',
    body: 'Your film gets extra care, extra takes, extra everything, edited like our reputation depends on it. Because it does.',
  },
  {
    num: '3.',
    title: 'Founder bragging rights',
    body: 'You get to say "we were their first clients" at every family gathering, forever. That alone is worth it, honestly.',
  },
];

export default function FoundingCouples({ accent }: FoundingCouplesProps) {
  const handlePM = () => {
    const message =
      'COUNT ME IN! 👀 We want to be one of the First 10 Founder Couples. Tell us everything!';
    window.open(whatsappLinks.custom(message, 'wedding-founding-couples'), '_blank');
  };

  return (
    <section id="founding-couples" className="relative bg-[#0d0d0d] overflow-hidden py-16 sm:py-24 scroll-mt-20">
      {/* Gold glow */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] rounded-full blur-3xl pointer-events-none"
        style={{ backgroundColor: accent, opacity: 0.08 }}
        aria-hidden="true"
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Eyebrow + heading */}
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-80px' }}
        >
          <p className="font-handwriting text-3xl sm:text-4xl mb-3" style={{ color: accent }}>
            a very honest offer
          </p>
          <h2 className="font-friendly text-4xl sm:text-6xl font-extrabold text-white mb-6">
            Help us get <span className="italic" style={{ color: accent }}>famous.</span>
          </h2>
          <p className="text-white/60 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-10">
            Here&apos;s the truth: we just opened, and we&apos;ve filmed exactly one wedding so
            far. It was amazing. Watch it above if you don&apos;t believe us. But one film isn&apos;t
            a portfolio, and we&apos;d rather be honest than pretend otherwise. So here&apos;s the deal:
          </p>
        </motion.div>

        {/* The deal panel */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.6, delay: 0.15, ease: [0.22, 0.61, 0.36, 1] }}
          className="relative rounded-3xl p-7 sm:p-10 text-left"
          style={{
            border: `2px dashed ${accent}55`,
            backgroundColor: '#111111',
            boxShadow: `0 24px 60px rgba(0,0,0,0.5), 0 0 60px ${accent}14`,
          }}
        >
          {/* Sticker */}
          <span
            className="absolute -top-4 left-1/2 -translate-x-1/2 rotate-[-3deg] whitespace-nowrap px-4 py-0.5 font-handwriting text-2xl sm:text-3xl text-black"
            style={{ backgroundColor: accent, borderRadius: '8px' }}
          >
            the first 10 founder deal
          </span>

          <div className="mt-4 space-y-6">
            {perks.map((perk, i) => (
              <motion.div
                key={perk.num}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-60px' }}
                transition={{ duration: 0.5, delay: 0.25 + i * 0.12, ease: [0.22, 0.61, 0.36, 1] }}
                className="flex items-start gap-4"
              >
                <span className="font-handwriting text-4xl sm:text-5xl leading-none shrink-0 mt-0.5" style={{ color: accent }}>
                  {perk.num}
                </span>
                <div>
                  <h3 className="font-friendly text-lg sm:text-xl font-extrabold text-white mb-1">
                    {perk.title}
                  </h3>
                  <p className="text-white/55 text-sm leading-relaxed">{perk.body}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Honesty footer */}
          <p className="font-handwriting text-2xl sm:text-3xl text-center mt-8" style={{ color: '#f4e7a1' }}>
            yes, we&apos;re new. yes, that&apos;s why it&apos;s cheap. yes, you&apos;ll still cry at your film. fair trade, right?
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-60px' }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
          className="mt-10"
        >
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
              COUNT ME IN: I want to be a Founder Couple
            </button>
          </div>
          <p className="font-handwriting text-xl sm:text-2xl text-white/50 mt-3">
            pm us on WhatsApp, it&apos;s the fastest way to lock your spot
          </p>
          <p className="text-white/25 text-xs mt-4">
            First 10 couples only. After that, prices go up and we&apos;ll pretend this conversation never happened.
          </p>

          <a
            href="#wedding-packages"
            className="inline-flex items-center gap-1.5 mt-6 text-white/50 hover:text-white transition-colors text-sm font-semibold"
          >
            curious? see our normal prices first
            <ArrowDown className="w-4 h-4" strokeWidth={2.5} aria-hidden="true" />
          </a>
        </motion.div>
      </div>
    </section>
  );
}
