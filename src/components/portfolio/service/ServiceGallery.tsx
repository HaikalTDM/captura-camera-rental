'use client';

import Image from 'next/image';
import { motion, type Variants } from 'framer-motion';
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

export interface GalleryPhoto {
  src: string;
  title: string;
}

interface ServiceGalleryProps {
  headingFont: string;
  handwritingFont: string;
  accent: string;
  eyebrow: string;
  heading: [string, string];
  photos: GalleryPhoto[];
  light?: boolean;
}

export default function ServiceGallery({
  headingFont,
  handwritingFont,
  accent,
  eyebrow,
  heading,
  photos,
  light = false,
}: ServiceGalleryProps) {
  return (
    <section
      className={`relative py-16 sm:py-24 ${
        light ? 'bg-[#fdfcfa]' : 'bg-[#0d0d0d] border-y border-white/5'
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
          {photos.map((photo) => (
            <motion.div key={photo.title} variants={fadeUp}>
              <SpotlightCard
                accent={accent}
                className="rounded-2xl overflow-hidden ring-1 ring-white/10 hover:ring-white/25 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={photo.src}
                    alt={photo.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="object-cover transition-transform duration-700 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  <p className="absolute bottom-3 left-4 right-4 font-handwriting text-2xl text-white drop-shadow">
                    {photo.title}
                  </p>
                </div>
              </SpotlightCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
