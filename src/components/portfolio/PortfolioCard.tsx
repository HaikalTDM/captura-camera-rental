'use client';

import Image from 'next/image';
import { Star, Play } from 'lucide-react';
import type { PortfolioItem } from '@/data/portfolioData';

interface PortfolioCardProps {
  item: PortfolioItem;
  accent: string;
  accentSoft: string;
  onOpen: (item: PortfolioItem) => void;
}

export default function PortfolioCard({ item, accent, accentSoft, onOpen }: PortfolioCardProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={`Play video: ${item.title}`}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onOpen(item);
        }
      }}
      className="group relative rounded-2xl overflow-hidden aspect-[4/3] cursor-pointer bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black transition-transform duration-300 ease-out hover:scale-[1.02] hover:shadow-2xl touch-manipulation active:scale-[0.98]"
    >
      {/* Thumbnail */}
      <Image
        src={item.thumbnail}
        alt={item.title}
        fill
        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
        quality={80}
      />

      {/* Base gradient for text legibility */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

      {/* Hover dark overlay 0 → 40% */}
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
        aria-hidden="true"
      />

      {/* Center play button */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <div
          className="w-14 h-14 sm:w-16 sm:h-16 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center ring-1 ring-white/30 group-hover:scale-110 transition-transform duration-300"
        >
          <Play className="w-6 h-6 text-white ml-0.5" fill="currentColor" strokeWidth={0} aria-hidden="true" />
        </div>
      </div>

      {/* Bottom content — title + description */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 transition-opacity duration-300 group-hover:opacity-0">
        <h3 className="text-white font-bold text-sm sm:text-base leading-snug drop-shadow-lg">{item.title}</h3>
        <p className="text-white/70 text-xs sm:text-sm mt-1 line-clamp-1">{item.description}</p>
      </div>

      {/* Testimonial overlay — slides up on hover */}
      <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 translate-y-[20px] opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 ease-out">
        <div className="flex items-center gap-0.5 mb-2" aria-label={`${item.rating} out of 5 stars`}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`w-3.5 h-3.5 ${i < item.rating ? 'text-[#d4af37]' : 'text-white/30'}`}
              fill={i < item.rating ? '#d4af37' : 'none'}
              strokeWidth={1.5}
              aria-hidden="true"
            />
          ))}
        </div>
        <p className="text-white/90 text-xs sm:text-sm italic leading-relaxed line-clamp-2">
          &ldquo;{item.testimonial}&rdquo;
        </p>
        <p className="text-white/60 text-[11px] sm:text-xs mt-1.5 font-medium">
          &mdash; {item.clientName}, {item.clientRole}
        </p>
      </div>

      {/* Service accent tag */}
      <span
        className="absolute top-3 left-3 inline-block px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm"
        style={{ backgroundColor: accentSoft, color: accent, border: `1px solid ${accent}33` }}
      >
        {item.tags[0]}
      </span>
    </div>
  );
}
