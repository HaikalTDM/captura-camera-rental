'use client';

import { useState } from 'react';
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
      className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col border border-slate-200"
      data-camera-id={camera.id}
    >
      {/* Image Gallery */}
      <div className="p-4 sm:p-5">
        <div className="relative overflow-hidden rounded-xl">
          <ImageGallery
            mainImage={camera.image}
            galleryImages={camera.images}
            alt={camera.name}
            className="w-full"
          />
        </div>
      </div>

      <div className="px-4 sm:px-6 pb-6 flex-1 flex flex-col">
        {/* Pricing - FIRST and PROMINENT */}
        <div className="mb-4 text-center pb-4 border-b border-slate-200">
          <div className="text-5xl font-bold text-black mb-1">
            {formatCurrency(camera.dailyRate)}
          </div>
          <div className="text-lg text-slate-600 font-medium mb-3">/day</div>
          <div className="inline-block bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full text-sm font-bold">
            Save 10% for 3+ days • {formatCurrency(camera.discountRate)}/day
          </div>
        </div>

        {/* Camera Name & Description */}
        <h3 className="text-2xl font-bold text-black mb-3">{camera.name}</h3>
        <p className="text-slate-600 mb-4 text-base leading-relaxed font-medium">{camera.description}</p>

        {/* Key Features - Icon Based */}
        <div className="mb-6">
          <div className="grid grid-cols-1 gap-2">
            {camera.features.slice(0, 3).map((feature, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <svg className="w-3 h-3 text-emerald-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-sm font-semibold text-slate-700">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-auto space-y-3">
          {/* Primary CTA - Book Now */}
          <button
            onClick={handleBookClick}
            className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:shadow-xl hover:shadow-blue-500/30 text-white font-bold py-4 rounded-xl text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Book Now
          </button>

          {/* Secondary CTA - View Details */}
          {onViewSpecs && (
            <button
              onClick={() => onViewSpecs(camera)}
              className="w-full bg-slate-100 hover:bg-slate-200 text-black font-bold py-4 rounded-xl text-base transition-all duration-200 active:scale-95 flex items-center justify-center gap-2 border border-slate-300"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Full Specs
            </button>
          )}
        </div>

        {/* Calendar Booking - Only shows when user clicks "Book Now" */}
        {showBooking && (
          <div className="mt-6 pt-6 border-t border-slate-200 animate-modalSlideUp" data-booking-section>
            <h4 className="text-lg font-bold text-black mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
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
