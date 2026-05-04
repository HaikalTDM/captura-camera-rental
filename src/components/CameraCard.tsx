'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Camera } from '@/types';

interface CameraCardProps {
  camera: Camera;
  onBookNow: (camera: Camera) => void;
  onAddToKit?: (camera: Camera) => void;
  onViewSpecs?: (camera: Camera) => void;
  variant?: 'default' | 'dark';
  tags?: string[];
  isInKit?: boolean;
  canAddToKit?: boolean;
}

export default function CameraCard({
  camera,
  onBookNow,
  onAddToKit,
  onViewSpecs,
  variant = 'default',
  tags = [],
  isInKit = false,
  canAddToKit = true,
}: CameraCardProps) {
  const [viewerCount, setViewerCount] = useState(0);
  const [currentImage, setCurrentImage] = useState(camera.image);
  const isDark = variant === 'dark';

  useEffect(() => {
    setCurrentImage(camera.image);
  }, [camera.image]);

  // Simulate active viewers for urgency (3-7 random viewers)
  useEffect(() => {
    const randomViewers = Math.floor(Math.random() * 5) + 3;
    setViewerCount(randomViewers);

    const interval = setInterval(() => {
      const newCount = Math.floor(Math.random() * 5) + 3;
      setViewerCount(newCount);
    }, (Math.random() * 5 + 10) * 1000);

    return () => clearInterval(interval);
  }, []);

  // Realistic rental count
  const rentalCount = camera.name.includes('Osmo') ? 24 : 18;

  const handleBookClick = () => {
    onBookNow(camera);
  };

  const handleSpecsClick = () => {
    if (onViewSpecs) {
      onViewSpecs(camera);
    }
  };

  const handleAddToKitClick = () => {
    if (onAddToKit) {
      onAddToKit(camera);
    }
  };

  const fallbackImage = camera.images.find((image) => image && image !== currentImage) || currentImage;

  const handleImageError = () => {
    if (fallbackImage !== currentImage) {
      setCurrentImage(fallbackImage);
    }
  };

  return (
    <div className={`
      rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 h-full flex flex-col relative group
      ${isDark
        ? 'bg-zinc-900 border border-white/10 hover:border-white/20'
        : 'bg-white border-2 border-slate-200 hover:border-blue-300'
      }
    `}>
      {/* Top Badges Row */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {camera.display_order && (
          <div className="bg-zinc-800 text-white px-2 py-1 rounded-full text-[10px] font-bold border border-white/10 flex items-center gap-1">
            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            {camera.display_order}
          </div>
        )}
      </div>
      <div className="absolute top-3 right-3 z-20 flex items-start justify-end gap-2 pointer-events-none">
        <div className="flex items-center gap-2">
          {/* Rental Stats Badge */}
          <div className={`
              backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5
              ${isDark ? 'bg-black/60 text-white' : 'bg-white/95 text-slate-700'}
            `}>
            <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-[10px] font-black">{rentalCount}</span>
          </div>
        </div>


      </div>

      {/* Image Gallery */}
      <div className={`relative aspect-[4/3] w-full overflow-hidden ${isDark ? 'bg-zinc-800' : 'bg-slate-100'}`}>
        {camera.images && camera.images.length > 0 ? (
          <div className="w-full h-full relative group-hover:scale-105 transition-transform duration-500">
            <Image
              src={currentImage}
              alt={camera.name}
              fill
              className="object-contain p-4 z-10 relative"
              sizes="(max-width: 768px) 50vw, 33vw"
              priority
              onError={handleImageError}
            />
            {/* Background Blur Effect */}
            <div
              className="absolute inset-0 opacity-30 transform scale-150 blur-3xl"
              style={{
                backgroundImage: `url(${currentImage})`,
                backgroundPosition: 'center',
                backgroundSize: 'cover'
              }}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <span className="text-slate-400">No Image</span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-col flex-grow ${isDark ? 'p-3' : 'p-3 sm:p-5'}`}>

        {/* Social Proof - Hide on minimalist dark mode to save space, or make ultra subtle */}
        {!isDark && (
          <div className="flex items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2 text-[10px] sm:text-xs">
            <svg className="w-3 h-3 sm:w-4 sm:h-4 text-blue-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            <span className="font-semibold text-blue-500">{viewerCount} viewing</span>
          </div>
        )}

        {/* Use Case Tags (Dark Mode Only) */}
        {isDark && tags.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1">
            {tags.slice(0, 1).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] font-bold text-zinc-400 uppercase tracking-wider border border-white/5">
                {tag}
              </span>
            ))}
          </div>
        )}

        <div className="flex justify-between items-start mb-1">
          <h3 className={`font-black tracking-tight leading-tight line-clamp-2 ${isDark ? 'text-[13px] text-white sm:text-sm' : 'text-sm sm:text-2xl text-slate-800'}`}>
            {camera.name}
          </h3>
        </div>

        <div className={`flex flex-wrap items-end gap-x-1.5 gap-y-1 ${isDark ? 'mb-3' : 'mb-2 sm:mb-4'}`}>
          {camera.discountRate && (
            <span className={`font-bold line-through ${isDark ? 'text-xs text-zinc-600' : 'text-xs sm:text-sm text-slate-400'}`}>
              RM{Math.round(camera.dailyRate * 1.3)}
            </span>
          )}
          {camera.variants && camera.variants.length > 0 && (
            <span className={`font-bold ${isDark ? 'text-[10px] text-zinc-500' : 'text-xs text-slate-500'}`}>
              From
            </span>
          )}
          <span className={`font-black ${isDark ? 'text-base text-white sm:text-lg' : 'text-lg sm:text-3xl text-slate-900'}`}>
            RM{camera.dailyRate}
          </span>
          <span className={`font-bold ${isDark ? 'text-[11px] text-zinc-500' : 'text-xs sm:text-sm text-slate-500'}`}>/day</span>
        </div>

        {/* Savings Badge - Hide on minimalist dark mobile to save vertical space if needed, or keep petite */}
        {!isDark && camera.discountThreshold && (
          <div className="mb-3 sm:mb-4 inline-flex self-start">
            <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-[10px] sm:text-xs font-black uppercase tracking-wide flex items-center gap-1">
              <svg className="w-2.5 h-2.5 sm:w-3 sm:h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
              Save 10%
            </div>
          </div>
        )}

        {/* Feature List - Only show in Default Mode */}
        {!isDark && (
          <div className={`rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 flex-grow ${isDark ? 'bg-zinc-800/50' : 'bg-slate-50'}`}>
            <p className={`text-[10px] font-black uppercase tracking-wider mb-2 sm:mb-3 ${isDark ? 'text-zinc-500' : 'text-slate-400'}`}>
              Rental Includes
            </p>
            <ul className="space-y-1.5 sm:space-y-2">
              {['Professional grade equipment', 'Includes basic accessories', 'Full insurance coverage'].map((item, i) => (
                <li key={i} className="flex items-start gap-1.5 sm:gap-2">
                  <div className="mt-0.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <svg className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                  </div>
                  <span className={`text-[10px] sm:text-xs font-bold ${isDark ? 'text-zinc-300' : 'text-slate-700'}`}>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-auto">
          {/* Primary CTA */}
          <Button
            onClick={handleBookClick}
            className={`
              w-full font-black h-auto rounded-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-2 group relative overflow-hidden
              ${isDark
                ? 'py-2.5 text-[11px] bg-white text-black hover:bg-zinc-200'
                : 'py-3 sm:py-5 text-xs sm:text-lg rounded-xl sm:gap-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white hover:shadow-2xl hover:shadow-purple-500/40'
              }
            `}
          >
            {isDark ? (
              <span>Book Now</span>
            ) : (
              <>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                <span className="hidden sm:inline">Reserve Now</span>
                <span className="sm:hidden">Book</span>
              </>
            )}
          </Button>

          {onAddToKit && (
            <Button
              type="button"
              onClick={handleAddToKitClick}
              variant="outline"
              disabled={isInKit || !canAddToKit}
              className={`
                mt-2 w-full border rounded-lg font-bold h-auto transition-all
                ${isDark
                  ? isInKit
                    ? 'border-emerald-500/20 bg-emerald-500/10 py-2 text-[10px] text-emerald-300'
                    : !canAddToKit
                      ? 'border-red-500/20 bg-red-500/10 py-2 text-[10px] text-red-300'
                      : 'border-white/10 bg-transparent py-2 text-[10px] text-zinc-300 hover:bg-white/5 hover:text-white'
                  : 'rounded-xl border-slate-200 py-2.5 text-xs text-slate-700 hover:bg-slate-50 hover:border-slate-300 disabled:border-emerald-200 disabled:bg-emerald-50 disabled:text-emerald-700'
                }
              `}
            >
              {isInKit ? 'Added to Kit' : canAddToKit ? 'Add to Rental Kit' : 'Kit Full'}
            </Button>
          )}

          {/* Secondary CTA - Only for Default Mode */}
          {!isDark && (
            <Button
              onClick={handleSpecsClick}
              variant="outline"
              className="w-full font-semibold h-auto py-2.5 sm:py-3 mt-2 sm:mt-3 rounded-lg sm:rounded-xl text-[10px] sm:text-sm hover:bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300"
            >
              Full Specifications
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
