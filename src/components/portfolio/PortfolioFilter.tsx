'use client';

import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  Film,
  Briefcase,
  Sparkles,
  Smartphone,
  GraduationCap,
  type LucideIcon,
} from 'lucide-react';
import type { PortfolioService, ServiceId } from '@/data/portfolioData';

const ICONS: Record<string, LucideIcon> = {
  film: Film,
  briefcase: Briefcase,
  sparkles: Sparkles,
  smartphone: Smartphone,
  'graduation-cap': GraduationCap,
};

interface PortfolioFilterProps {
  services: PortfolioService[];
  activeId: ServiceId;
  onChange: (id: ServiceId) => void;
}

export default function PortfolioFilter({ services, activeId, onChange }: PortfolioFilterProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const didScan = useRef(false);

  // Mobile-only: one gentle auto-scan left to right and back,
  // so users notice there are more services beyond the fold.
  useEffect(() => {
    const el = scrollRef.current;
    if (!el || window.innerWidth >= 640) return;
    if (didScan.current) return;
    didScan.current = true;

    const timer = setTimeout(() => {
      const max = el.scrollWidth - el.clientWidth;
      if (max <= 0) return;

      const scrollTo = (to: number, ms: number) =>
        new Promise<void>((resolve) => {
          el.scrollTo({ left: to, behavior: 'smooth' });
          setTimeout(resolve, ms);
        });

      (async () => {
        await scrollTo(max, 650);
        await scrollTo(0, 650);
      })();
    }, 900);

    return () => clearTimeout(timer);
  }, []);

  // Keep the active pill visible when switching tabs (e.g. after a scroll).
  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const tab = el.querySelector<HTMLElement>(`#tab-${activeId}`);
    tab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }, [activeId]);

  return (
    <div className="relative">
      <div
        ref={scrollRef}
        role="tablist"
        aria-label="Filter portfolio by service"
        className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide snap-x pb-2 -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:justify-center"
      >
        {services.map((service) => {
          const Icon = ICONS[service.icon];
          const isActive = activeId === service.id;
          return (
            <button
              key={service.id}
              role="tab"
              id={`tab-${service.id}`}
              aria-selected={isActive}
              aria-controls="portfolio-panel"
              onClick={() => onChange(service.id)}
              className={[
                'group relative shrink-0 snap-start inline-flex items-center gap-2 px-5 py-2.5 sm:px-6 sm:py-3 rounded-full border-2 text-sm sm:text-base font-bold whitespace-nowrap transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-black min-h-[44px]',
                isActive
                  ? 'text-white border-transparent'
                  : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400 hover:text-gray-800',
              ].join(' ')}
            >
              {/* Sliding active pill */}
              {isActive && (
                <motion.span
                  layoutId="portfolio-active-tab"
                  className="absolute inset-0 rounded-full"
                  style={{ backgroundColor: service.accent, boxShadow: `0 8px 20px ${service.accentSoft}` }}
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                  aria-hidden="true"
                />
              )}

              <Icon
                className={`relative z-10 w-4 h-4 sm:w-5 sm:h-5 transition-all duration-200 ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-400 group-hover:text-gray-700 group-hover:rotate-6 group-hover:scale-110'
                }`}
                strokeWidth={2}
                aria-hidden="true"
              />
              <span className="relative z-10 sm:hidden">{service.shortLabel}</span>
              <span className="relative z-10 hidden sm:inline">{service.label}</span>
            </button>
          );
        })}
      </div>

      {/* Right edge fade hint (mobile only) */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-[#fdfcfa] to-transparent sm:hidden"
        aria-hidden="true"
      />
    </div>
  );
}
