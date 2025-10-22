'use client';

import { useState, useEffect } from 'react';
import { Camera } from '@/types';
import { formatCurrency } from '@/lib/pricing';
import ImageGallery from './ImageGallery';

interface CameraCardProps {
  camera: Camera;
  onBookNow: (camera: Camera) => void;
  onViewSpecs?: (camera: Camera) => void;
}

export default function CameraCard({ camera, onBookNow, onViewSpecs }: CameraCardProps) {
  const [viewerCount, setViewerCount] = useState(0);

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

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-2xl hover:scale-[1.01] transition-all duration-300 h-full flex flex-col border-2 border-slate-200 hover:border-blue-300 relative group">
        {/* Top Badges Row */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-start justify-between gap-2 pointer-events-none">
          <div className="flex items-center gap-2">
            {/* Availability Badge */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5 animate-fadeIn">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
              <span className="text-[10px] font-black uppercase tracking-wide">Available</span>
            </div>

            {/* Rental Stats Badge */}
            <div className="bg-white/95 backdrop-blur-sm rounded-full px-3 py-1.5 shadow-lg flex items-center gap-1.5">
              <svg className="w-3 h-3 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[10px] font-black text-slate-700">{rentalCount}</span>
            </div>
          </div>

          {/* Most Popular Badge (only for Osmo) */}
          {camera.name.includes('Osmo') && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-3 py-1.5 shadow-lg">
              <span className="text-[10px] font-black uppercase tracking-wide">🔥 Popular</span>
            </div>
          )}
        </div>

        {/* Image Gallery - Pure White Background */}
        <div className="bg-white p-5 pb-3">
          <div className="relative overflow-hidden rounded-xl bg-white">
            <ImageGallery
              mainImage={camera.image}
              galleryImages={camera.images}
              alt={camera.name}
              className="w-full"
            />
          </div>
        </div>

        <div className="px-5 pb-5 flex-1 flex flex-col">
          {/* Live Viewing Status - Subtle FOMO */}
          <div className="mb-3 flex items-center gap-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-blue-600 animate-pulse">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span className="font-bold">{viewerCount} people viewing now</span>
            </div>
          </div>

          {/* Camera Name - LARGER for rental focus */}
          <h3 className="text-3xl font-black text-black mb-3 leading-tight tracking-tight">{camera.name}</h3>

          {/* Rental Pricing - Emphasis */}
          <div className="mb-4 pb-4 border-b border-slate-200">
            <div className="flex items-baseline gap-2.5 mb-2.5">
              <span className="text-base text-slate-400 line-through font-semibold">
                {formatCurrency(Math.round(camera.dailyRate * 1.3))}
              </span>
              <span className="text-4xl sm:text-5xl font-black text-black tracking-tight">
                {formatCurrency(camera.dailyRate)}
              </span>
              <span className="text-lg text-slate-600 font-bold">/day</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-300 text-emerald-800 px-4 py-2 rounded-full text-xs font-black shadow-sm">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              SAVE 10% • 3+ DAYS
            </div>
          </div>

          {/* One-line Value Prop */}
          <p className="text-slate-700 mb-4 text-sm font-semibold line-clamp-1">{camera.features[0] || camera.description}</p>

          {/* Rental Includes - What you get */}
          <div className="mb-5 bg-gradient-to-br from-slate-50 to-blue-50/30 rounded-xl p-4 border border-slate-200">
            <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-wider mb-3">Rental Includes</h4>
            <div className="grid grid-cols-1 gap-2.5">
              {camera.features.slice(1, 4).map((feature, index) => (
                <div key={index} className="flex items-start gap-2.5">
                  <div className="w-5 h-5 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-700 leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons - Rental Focused */}
          <div className="mt-auto space-y-3">
            {/* Primary CTA - Reserve Rental */}
            <button
              onClick={handleBookClick}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-2xl hover:shadow-purple-500/40 text-white font-black py-4.5 sm:py-5 rounded-xl text-base sm:text-lg transition-all duration-300 active:scale-[0.98] flex items-center justify-center gap-3 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <svg className="w-5 h-5 sm:w-6 sm:h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>Reserve Now</span>
              <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            {/* Secondary CTA - Full Specs */}
            <button
              onClick={handleSpecsClick}
              className="w-full bg-white hover:bg-slate-50 text-slate-600 font-semibold py-3 rounded-xl text-sm transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2 border border-slate-200 hover:border-slate-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>Full Specifications</span>
            </button>
          </div>
        </div>
      </div>
  );
}
