'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { Play, Volume2, VolumeX } from 'lucide-react';
import {
  TIKTOK_HANDLE_SECONDARY,
  TIKTOK_URL_SECONDARY,
  type PortfolioItem,
} from '@/data/portfolioData';

// ===== Blank board: honest "nothing yet" =====

export function BlankBoard({
  accent,
  handwritingFont,
  light,
}: {
  accent: string;
  handwritingFont: string;
  light?: boolean;
}) {
  return (
    <div className="w-full max-w-sm">
      <div
        className={`relative rounded-2xl p-10 text-center ring-1 ${
          light ? 'bg-white ring-stone-200' : 'bg-[#111111] ring-white/10'
        }`}
      >
        <div
          className={`absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 rotate-[-2deg] backdrop-blur-sm ${
            light ? 'bg-stone-300/60' : 'bg-white/20'
          }`}
          style={{ clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0 100%)' }}
          aria-hidden="true"
        />
        <p className={`${handwritingFont} text-7xl sm:text-8xl leading-none mb-2`} style={{ color: accent }}>
          0
        </p>
        <p className={`${handwritingFont} text-xl sm:text-2xl ${light ? 'text-stone-500' : 'text-white/60'}`}>
          corporate films so far…
        </p>
        <p className={`text-xs mt-4 tracking-wide uppercase ${light ? 'text-stone-400' : 'text-white/30'}`}>
          portfolio coming soon. be the first
        </p>
      </div>
    </div>
  );
}

// ===== Polaroid: playable film still =====

interface PolaroidCardProps {
  item: PortfolioItem;
  handwritingFont: string;
  caption: string;
  onOpen?: (item: PortfolioItem) => void;
}

export function PolaroidCard({ item, handwritingFont, caption, onOpen }: PolaroidCardProps) {
  const handleClick = () => onOpen?.(item);
  return (
    <div className="w-full max-w-sm">
      <div
        role="button"
        tabIndex={onOpen ? 0 : -1}
        aria-label={onOpen ? `Play video: ${item.title}` : undefined}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (onOpen && (e.key === 'Enter' || e.key === ' ')) {
            e.preventDefault();
            handleClick();
          }
        }}
        className={`relative rotate-[2deg] bg-white rounded-sm p-3 pb-4 shadow-2xl ${onOpen ? 'cursor-pointer hover:scale-[1.02] transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white' : ''}`}
      >
        <div
          className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 rotate-[-3deg] bg-white/25 backdrop-blur-sm"
          style={{ clipPath: 'polygon(5% 0, 95% 0, 100% 100%, 0 100%)' }}
          aria-hidden="true"
        />
        <div className="relative aspect-[4/3] overflow-hidden rounded-sm bg-stone-200">
          <Image src={item.thumbnail} alt={item.title} fill sizes="(max-width: 640px) 100vw, 400px" className="object-cover" />
          {onOpen && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/0 hover:bg-black/20 transition-colors duration-300">
              <span className="w-12 h-12 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-sm">
                <Play className="w-5 h-5 text-white ml-0.5" fill="currentColor" strokeWidth={0} aria-hidden="true" />
              </span>
            </div>
          )}
        </div>
        <p className={`${handwritingFont} text-lg text-stone-700 text-center mt-2 -rotate-1`}>
          {caption}
        </p>
      </div>
    </div>
  );
}

// ===== TikTok card: phone-style post =====

interface TikTokCardProps {
  item: PortfolioItem;
  accent: string;
  handle: string;
  href?: string;
}

// Autoplaying portrait TikTok-style card: muted loop, plays inline, no lightbox
export function TikTokCard({ item, accent, handle, href }: TikTokCardProps) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const toggleMute = () => {
    setMuted((m) => {
      const next = !m;
      if (videoRef.current) {
        videoRef.current.muted = next;
        videoRef.current.volume = 1;
      }
      return next;
    });
  };

  return (
    <div className="w-full max-w-[320px]">
      <div className="relative rounded-2xl overflow-hidden bg-stone-900 shadow-2xl ring-1 ring-white/15">
        <div className="relative aspect-[9/16]">
          <video
            ref={videoRef}
            src={item.videoUrl}
            poster={item.thumbnail}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            className="absolute inset-0 w-full h-full object-cover"
            aria-label={item.title}
          />
          <div
            className="absolute inset-x-0 bottom-0 h-2/5 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none"
            aria-hidden="true"
          />

          {/* Handle bar */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-4 py-2.5 bg-gradient-to-b from-black/60 to-transparent">
            <span className="font-mono text-xs text-white font-bold drop-shadow">{handle}</span>
            {href ? (
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2 py-0.5 rounded text-[10px] font-bold text-black hover:brightness-110 transition-all"
                style={{ backgroundColor: accent }}
              >
                FOLLOW
              </a>
            ) : (
              <span
                className="px-2 py-0.5 rounded text-[10px] font-bold text-black"
                style={{ backgroundColor: accent }}
              >
                FOLLOW
              </span>
            )}
          </div>

          {/* Sound toggle — TikTok-style side rail */}
          <button
            type="button"
            onClick={toggleMute}
            aria-label={muted ? 'Unmute video' : 'Mute video'}
            aria-pressed={!muted}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center text-white hover:bg-black/60 hover:scale-105 transition-all duration-200 z-10"
          >
            {muted ? (
              <VolumeX className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            ) : (
              <Volume2 className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
            )}
          </button>

          {/* Bottom info */}
          <div className="absolute bottom-3 left-4 right-4 pointer-events-none">
            <p className="font-mono text-white text-xs tracking-wide drop-shadow">{item.title}</p>
          </div>
        </div>
      </div>

      {/* Secondary account */}
      <p className="mt-3 text-center font-mono text-[11px] text-white/40">
        also on{' '}
        <a
          href={TIKTOK_URL_SECONDARY}
          target="_blank"
          rel="noopener noreferrer"
          className="text-white/70 hover:text-white transition-colors"
        >
          {TIKTOK_HANDLE_SECONDARY}
        </a>
      </p>
    </div>
  );
}
