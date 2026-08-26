'use client';

import { motion, AnimatePresence } from 'framer-motion';
import PortfolioCard from './PortfolioCard';
import type { PortfolioItem, PortfolioService } from '@/data/portfolioData';

interface PortfolioGridProps {
  service: PortfolioService;
  onOpen: (item: PortfolioItem) => void;
}

export default function PortfolioGrid({ service, onOpen }: PortfolioGridProps) {
  return (
    <div id="portfolio-panel" role="tabpanel" aria-labelledby={`tab-${service.id}`}>
      <AnimatePresence mode="wait">
        <motion.div
          key={service.id}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
        >
          {service.items.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05, ease: [0.4, 0, 0.2, 1] }}
            >
              <PortfolioCard
                item={item}
                accent={service.accent}
                accentSoft={service.accentSoft}
                onOpen={onOpen}
              />
            </motion.div>
          ))}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
