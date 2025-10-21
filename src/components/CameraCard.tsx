'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Camera, CustomerDetails } from '@/types';
import { formatCurrency } from '@/lib/pricing';
import ImageGallery from './ImageGallery';
import CalendarBooking from './CalendarBooking';

interface CameraCardProps {
  camera: Camera;
  onBookNow: (camera: Camera, startDate?: Date, endDate?: Date, totalCost?: number, customerDetails?: CustomerDetails, totalDays?: number, dailyRate?: number) => void;
  onViewSpecs?: (camera: Camera) => void;
}

export default function CameraCard({ camera, onBookNow, onViewSpecs }: CameraCardProps) {
  const [showBooking, setShowBooking] = useState(false);
  const [viewerCount, setViewerCount] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Simulate active viewers for urgency (3-7 random viewers)
  useEffect(() => {
    const randomViewers = Math.floor(Math.random() * 5) + 3;
    setViewerCount(randomViewers);

    // Update viewer count every 10-15 seconds
    const interval = setInterval(() => {
      const newCount = Math.floor(Math.random() * 5) + 3;
      setViewerCount(newCount);
    }, (Math.random() * 5 + 10) * 1000);

    return () => clearInterval(interval);
  }, []);

  // Simulate rental count (150-400 based on camera name)
  const rentalCount = camera.name.includes('Osmo') ? 347 : 276;

  const handleBookClick = () => {
    setShowBooking(true);
    // Scroll to booking section
    setTimeout(() => {
      const bookingSection = document.querySelector(`[data-camera-id="${camera.id}"] [data-booking-section]`);
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }, 100);
  };

  return (
    <div
      className="bg-white rounded-3xl shadow-xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 h-full flex flex-col border-2 border-slate-200 hover:border-blue-300 relative group"
      data-camera-id={camera.id}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Top Badges Row */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-start justify-between gap-2 pointer-events-none">
        {/* Availability Badge */}
        <div className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-full px-4 py-2 shadow-xl flex items-center gap-2 animate-fadeIn">
          <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
          <span className="text-xs font-black uppercase tracking-wide">Available Now</span>
        </div>

        {/* Most Popular Badge (only for Osmo) */}
        {camera.name.includes('Osmo') && (
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full px-4 py-2 shadow-xl">
            <span className="text-xs font-black uppercase tracking-wide">🔥 Most Popular</span>
          </div>
        )}
      </div>

      {/* Image Gallery */}
      <div className="p-4 sm:p-5">
        <div className="relative overflow-hidden rounded-2xl">
          <ImageGallery
            mainImage={camera.image}
            galleryImages={camera.images}
            alt={camera.name}
            className="w-full"
          />
          
          {/* Hover Overlay with Quick Info */}
          <div className={`absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'} pointer-events-none rounded-2xl flex items-end p-6`}>
            <div className="text-white space-y-2">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="text-sm font-bold">4K/60fps • 10-bit Color</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-sm font-bold">3-Axis Stabilization</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-6 flex-1 flex flex-col">
        {/* Social Proof & Urgency - Above Pricing */}
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
            <span>{viewerCount} viewing now</span>
          </div>
        </div>

        {/* Pricing - FIRST and PROMINENT */}
        <div className="mb-6 text-center pb-6 border-b-2 border-slate-200">
          <div className="flex items-baseline justify-center gap-2 mb-2">
            <span className="text-2xl text-slate-400 line-through font-bold">
              {formatCurrency(Math.round(camera.dailyRate * 1.3))}
            </span>
            <span className="text-6xl font-black text-black">
              {formatCurrency(camera.dailyRate)}
            </span>
          </div>
          <div className="text-lg text-slate-600 font-bold mb-4">/day</div>
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-300 text-emerald-800 px-5 py-2.5 rounded-full text-sm font-black shadow-lg">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
            </svg>
            Save 10% for 3+ days • {formatCurrency(camera.discountRate)}/day
          </div>
        </div>

        {/* Camera Name & Description */}
        <h3 className="text-2xl sm:text-3xl font-black text-black mb-3 leading-tight">{camera.name}</h3>
        <p className="text-slate-600 mb-6 text-base leading-relaxed font-medium">{camera.description}</p>

        {/* Key Features - Icon Based with Better Styling */}
        <div className="mb-6 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl p-5 border border-slate-200">
          <div className="grid grid-cols-1 gap-3">
            {camera.features.slice(0, 4).map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-bold text-slate-800">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-3">
          {/* Primary CTA - Book Now */}
          <button
            onClick={handleBookClick}
            className="w-full bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-2xl hover:shadow-blue-500/50 text-white font-black py-5 rounded-2xl text-lg transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-3 group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
            <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Now
            <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </button>

          {/* Secondary CTA - View Details */}
          {onViewSpecs && (
            <button
              onClick={() => onViewSpecs(camera)}
              className="w-full bg-white hover:bg-slate-50 text-black font-bold py-4 rounded-2xl text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border-2 border-slate-300 hover:border-slate-400 shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Full Specifications
            </button>
          )}
        </div>

        {/* Trust Badge */}
        <div className="mt-4 pt-4 border-t border-slate-200 flex items-center justify-center gap-6 text-xs font-bold text-slate-600">
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <span>Fully Insured</span>
          </div>
          <div className="flex items-center gap-1.5">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Fast Delivery</span>
          </div>
        </div>

        {/* Calendar Booking - Only shows when user clicks "Book Now" */}
        {showBooking && (
          <div className="mt-6 pt-6 border-t-2 border-slate-200 animate-modalSlideUp" data-booking-section>
            <h4 className="text-xl font-black text-black mb-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              Select Your Rental Dates
            </h4>
            <CalendarBooking
              camera={camera}
              onBookNow={(camera, startDate, endDate, totalCost, customerDetails, totalDays, dailyRate) =>
                onBookNow(camera, startDate, endDate, totalCost, customerDetails, totalDays, dailyRate)
              }
              className="w-full"
            />
          </div>
        )}
      </div>
    </div>
  );
}
