'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star } from 'lucide-react';
import type { PortfolioItem } from '@/data/portfolioData';

interface VideoModalProps {
  item: PortfolioItem | null;
  accent: string;
  onClose: () => void;
}

export default function VideoModal({ item, accent, onClose }: VideoModalProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Lock body scroll + ESC to close + focus management
  useEffect(() => {
    if (!item) return;

    previouslyFocused.current = document.activeElement as HTMLElement;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKey);
      previouslyFocused.current?.focus();
    };
  }, [item, onClose]);

  return (
    <AnimatePresence>
      {item && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6"
          role="dialog"
          aria-modal="true"
          aria-label={`${item.title} video preview`}
        >
          {/* Backdrop fade-in 200ms */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
          />

          {/* Content slide-up 300ms */}
          <motion.div
            className="relative w-full max-w-4xl bg-[#121212] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh] ring-1 ring-white/10"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 px-5 sm:px-8 py-4 sm:py-5 border-b border-white/10 flex-shrink-0">
              <div className="min-w-0">
                <span
                  className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest mb-2"
                  style={{ backgroundColor: `${accent}1f`, color: accent }}
                >
                  {item.tags[0]}
                </span>
                <h2 className="font-friendly text-lg sm:text-2xl font-extrabold text-white leading-tight truncate">
                  {item.title}
                </h2>
                <p className="text-white/50 text-xs sm:text-sm mt-0.5 truncate">{item.description}</p>
              </div>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                aria-label="Close video"
                className="flex-shrink-0 w-11 h-11 inline-flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors duration-200"
              >
                <X className="w-5 h-5" strokeWidth={2} />
              </button>
            </div>

            {/* Video */}
            <div className="bg-black relative">
              <video
                key={item.id}
                src={item.videoUrl}
                poster={item.thumbnail}
                controls
                autoPlay
                playsInline
                preload="metadata"
                className="w-full aspect-video object-contain"
              >
                Your browser does not support video playback.{' '}
                <a href={item.videoUrl} target="_blank" rel="noopener noreferrer" className="underline">
                  Open the film directly
                </a>
                .
              </video>
            </div>

            {/* Details + full testimonial */}
            <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-5 sm:py-6">
              <div className="flex items-center gap-0.5 mb-3" aria-label={`${item.rating} out of 5 stars`}>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`w-4 h-4 ${i < item.rating ? 'text-[#f4e7a1]' : 'text-white/20'}`}
                    fill={i < item.rating ? '#f4e7a1' : 'none'}
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                ))}
                <span className="ml-2 text-xs text-white/40 font-medium">{item.rating}.0</span>
              </div>

              {item.testimonial && (
                <>
                  <blockquote className="text-sm sm:text-base text-white/70 italic leading-relaxed">
                    {item.testimonial.split('\n\n').map((para, i, paras) => (
                      <p key={i} className={i > 0 ? 'mt-4' : ''}>
                        {i === 0 && <span aria-hidden="true">&ldquo;</span>}
                        {para}
                        {i === paras.length - 1 && <span aria-hidden="true">&rdquo;</span>}
                      </p>
                    ))}
                  </blockquote>
                  <p className="text-white/50 text-xs sm:text-sm mt-3 font-medium">
                    &mdash; {item.clientName}
                    <span className="text-white/30">, {item.clientRole}</span>
                  </p>
                </>
              )}

              <div className="flex flex-wrap gap-2 mt-4">
                {item.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 rounded-full text-xs font-medium border"
                    style={{ backgroundColor: `${accent}14`, color: accent, borderColor: `${accent}40` }}
                  >
                    {tag}
                  </span>
                ))}
                {item.duration && (
                  <span className="px-3 py-1 rounded-full text-xs font-medium border border-white/15 text-white/50">
                    {item.duration}
                  </span>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
