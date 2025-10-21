'use client';

import { useState, useEffect } from 'react';
import { Camera, CustomerDetails } from '@/types';
import { formatCurrency } from '@/lib/pricing';
import ImageGallery from './ImageGallery';
import BookingBottomSheet from './BookingBottomSheet';
import SpecsBottomSheet from './SpecsBottomSheet';

interface CameraCardProps {
  camera: Camera;
  onBookNow: (camera: Camera, startDate?: Date, endDate?: Date, totalCost?: number, customerDetails?: CustomerDetails, totalDays?: number, dailyRate?: number) => void;
  onViewSpecs?: (camera: Camera) => void;
}

export default function CameraCard({ camera, onBookNow, onViewSpecs }: CameraCardProps) {
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showSpecsModal, setShowSpecsModal] = useState(false);
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

  // Simulate rental count (150-400 based on camera name)
  const rentalCount = camera.name.includes('Osmo') ? 347 : 276;

  const handleBookClick = () => {
    setShowBookingModal(true);
  };

  const handleSpecsClick = () => {
    setShowSpecsModal(true);
    if (onViewSpecs) onViewSpecs(camera);
  };

  return (
    <>
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-full flex flex-col border-2 border-slate-200 hover:border-blue-300 relative group">
        {/* Top Badges Row */}
        <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between gap-2 pointer-events-none">
          {/* Availability Badge */}
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full px-4 py-2 shadow-xl flex items-center gap-2 animate-fadeIn">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wide">Available</span>
          </div>

          {/* Most Popular Badge (only for Osmo) */}
          {camera.name.includes('Osmo') && (
            <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-4 py-2 shadow-xl">
              <span className="text-xs font-black uppercase tracking-wide">🔥 Popular</span>
            </div>
          )}
        </div>

        {/* Image Gallery */}
        <div className="p-4">
          <div className="relative overflow-hidden rounded-2xl">
            <ImageGallery
              mainImage={camera.image}
              galleryImages={camera.images}
              alt={camera.name}
              className="w-full"
            />
          </div>
        </div>

        <div className="px-5 pb-5 flex-1 flex flex-col">
          {/* Social Proof */}
          <div className="mb-4 flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-2 text-slate-600">
              <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-slate-700">{rentalCount} rentals</span>
            </div>
            <div className="flex items-center gap-1.5 text-blue-600 animate-pulse">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              <span>{viewerCount} viewing</span>
            </div>
          </div>

          {/* Camera Name */}
          <h3 className="text-2xl font-black text-black mb-2 leading-tight">{camera.name}</h3>

          {/* Pricing - Compact */}
          <div className="mb-4 pb-4 border-b-2 border-slate-200">
            <div className="flex items-baseline gap-2 mb-2">
              <span className="text-lg text-slate-400 line-through font-bold">
                {formatCurrency(Math.round(camera.dailyRate * 1.3))}
              </span>
              <span className="text-4xl font-black text-black">
                {formatCurrency(camera.dailyRate)}
              </span>
              <span className="text-base text-slate-600 font-bold">/day</span>
            </div>
            <div className="inline-flex items-center gap-2 bg-emerald-50 border border-emerald-300 text-emerald-800 px-3 py-1.5 rounded-full text-xs font-black">
              <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
              </svg>
              Save 10% for 3+ days
            </div>
          </div>

          {/* Description - Short */}
          <p className="text-slate-600 mb-4 text-sm leading-relaxed font-medium line-clamp-2">{camera.description}</p>

          {/* Key Features - Compact */}
          <div className="mb-4 bg-slate-50 rounded-xl p-4 border border-slate-200">
            <div className="grid grid-cols-1 gap-2">
              {camera.features.slice(0, 3).map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0">
                    <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-xs font-bold text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-auto space-y-2.5">
            {/* Primary CTA - Book Now */}
            <button
              onClick={handleBookClick}
              className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-2xl hover:shadow-blue-500/50 text-white font-black py-4 rounded-xl text-base transition-all duration-300 active:scale-95 flex items-center justify-center gap-2.5 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Book Now
              <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </button>

            {/* Secondary CTA - View Specs */}
            <button
              onClick={handleSpecsClick}
              className="w-full bg-white hover:bg-slate-50 text-slate-700 font-bold py-3.5 rounded-xl text-sm transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border-2 border-slate-200 hover:border-slate-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Specifications
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Sheet Modals */}
      <BookingBottomSheet
        camera={camera}
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        onBookNow={onBookNow}
      />

      <SpecsBottomSheet
        camera={camera}
        isOpen={showSpecsModal}
        onClose={() => setShowSpecsModal(false)}
      />
    </>
  );
}
