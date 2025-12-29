'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Camera, CustomerDetails } from '@/types';
import { calculateRentalCost, formatCurrency } from '@/lib/pricing';
import TermsModal from './TermsModal';
import BookingForm from './BookingForm';
import BookingSuccess from './BookingSuccess';

interface CalendarPricingProps {
  camera: Camera;
  startDate: Date | null;
  endDate: Date | null;
  totalCost: number;
  totalDays?: number;
  dailyRate?: number;
  onBookNow?: (customerDetails: CustomerDetails) => void;
  className?: string;
}

export default function CalendarPricing({
  camera,
  startDate,
  endDate,
  totalCost,
  totalDays = 0,
  dailyRate = 0,
  onBookNow,
  className = ""
}: CalendarPricingProps) {
  const [pricing, setPricing] = useState<{
    totalDays: number;
    dailyRate: number;
    totalCost: number;
    savings: number;
    isDiscounted: boolean;
  } | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [showBookingSuccess, setShowBookingSuccess] = useState(false);
  const [bookingSuccessData, setBookingSuccessData] = useState<{
    confirmationNumber: string;
    booking: any;
    customer: any;
    bookingData: any;
  } | null>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    try {
      if (showBookingForm) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    } catch (e) {
      // Ignore DOM errors
    }

    return () => {
      try {
        document.body.style.overflow = 'unset';
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [showBookingForm]);

  useEffect(() => {
    if (startDate && endDate && totalDays > 0) {
      const discountThreshold = camera.discountThreshold || 3;
      const isDiscounted = totalDays >= discountThreshold;
      const savings = isDiscounted ?
        (camera.dailyRate - camera.discountRate) * totalDays : 0;

      setPricing({
        totalDays,
        dailyRate,
        totalCost,
        savings,
        isDiscounted
      });
    } else {
      setPricing(null);
    }
  }, [camera, startDate, endDate, totalCost, totalDays, dailyRate]);

  if (!pricing || !startDate || !endDate) {
    return (
      <div className={`bg-zinc-900/50 rounded-2xl p-6 border border-white/5 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 bg-zinc-800 rounded-full flex items-center justify-center border border-white/10">
            <svg className="w-5 h-5 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="font-bold text-white mb-2">Select Your Dates</h4>
          <p className="text-sm text-zinc-500 mb-6">
            Choose your rental period to see pricing
          </p>
          <div className="space-y-3 text-sm bg-zinc-900 rounded-xl p-4 border border-white/5">
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">Daily Rate</span>
              <span className="font-bold text-white">{formatCurrency(camera.dailyRate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-zinc-400">{(camera.discountThreshold || 3)}+ Days Rate</span>
              <span className="font-bold text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-2 py-0.5 rounded text-xs">{formatCurrency(camera.discountRate)}</span>
            </div>
            <div className="text-xs text-zinc-500 mt-3 pt-3 border-t border-white/5 text-center">
              Book for {(camera.discountThreshold || 3)}+ days and save {formatCurrency(camera.dailyRate - camera.discountRate)} per day
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-zinc-900 rounded-2xl p-5 border border-white/5 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h4 className="font-bold text-white flex items-center text-lg tracking-tight">
          Rental Summary
        </h4>
        {pricing.isDiscounted && (
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded">
            Savings Applied
          </span>
        )}
      </div>

      {/* Rental Details */}
      <div className="space-y-4 mb-6">
        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-400">Camera</span>
          <span className="font-bold text-white">{camera.name}</span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-400">Duration</span>
          <span className="font-bold text-white">
            {pricing.totalDays} day{pricing.totalDays > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-400">Daily Rate</span>
          <div className="text-right flex items-center gap-2">
            {pricing.isDiscounted && (
              <span className="text-xs line-through text-zinc-600 font-medium">
                {formatCurrency(camera.dailyRate)}
              </span>
            )}
            <span className={`font-bold ${pricing.isDiscounted ? 'text-emerald-400' : 'text-white'}`}>
              {formatCurrency(pricing.dailyRate)}
            </span>
          </div>
        </div>

        <div className="flex justify-between items-center text-sm">
          <span className="text-zinc-400">Dates</span>
          <div className="text-right">
            <div className="font-bold text-white">
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-[10px] text-zinc-600 font-bold uppercase mt-0.5">
              {startDate.getFullYear()}
            </div>
          </div>
        </div>

        {pricing.isDiscounted && pricing.savings > 0 && (
          <div className="flex justify-between items-center text-emerald-400 bg-emerald-500/5 border border-emerald-500/10 p-3 rounded-xl text-sm">
            <span className="font-medium">You Save</span>
            <span className="font-black">-{formatCurrency(pricing.savings)}</span>
          </div>
        )}
      </div>

      {/* Total Cost */}
      <div className="border-t border-white/5 pt-5 mb-5">
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-zinc-400">Total Cost</span>
          <div className="text-right">
            <span className="text-3xl font-black text-white tracking-tight">
              {formatCurrency(pricing.totalCost)}
            </span>
          </div>
        </div>
      </div>

      {/* Book Now Button */}
      {onBookNow && (
        <button
          onClick={() => setShowTermsModal(true)}
          className="w-full bg-white hover:bg-zinc-200 text-black font-black text-lg py-4 rounded-xl transition-all duration-200 shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98]"
        >
          Book {camera.name}
        </button>
      )}

      {/* Additional Info */}
      {pricing.isDiscounted && (
        <div className="mt-4 text-center">
          <p className="text-[10px] text-zinc-500 font-medium">
            Great choice! You're saving {formatCurrency(camera.dailyRate - camera.discountRate)} per day.
          </p>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onAccept={() => {
          setShowTermsModal(false);
          setShowBookingForm(true);
        }}
        onCancel={() => setShowTermsModal(false)}
      />

      {/* Booking Form Modal */}
      {showBookingForm && startDate && endDate && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="w-full max-w-xs sm:max-w-sm">
            <BookingForm
              camera={camera}
              startDate={startDate}
              endDate={endDate}
              totalDays={totalDays}
              totalCost={totalCost}
              dailyRate={dailyRate}
              onSuccess={(confirmationNumber, booking, customer, bookingData) => {
                setShowBookingForm(false);
                setBookingSuccessData({
                  confirmationNumber,
                  booking,
                  customer,
                  bookingData
                });
                setShowBookingSuccess(true);
              }}
              onCancel={() => setShowBookingForm(false)}
            />
          </div>
        </div>,
        document.body
      )}

      {/* Booking Success Modal */}
      {showBookingSuccess && bookingSuccessData && createPortal(
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[9999]">
          <div className="w-full max-w-sm sm:max-w-md">
            <BookingSuccess
              confirmationNumber={bookingSuccessData.confirmationNumber}
              booking={bookingSuccessData.booking}
              customer={bookingSuccessData.customer}
              bookingData={bookingSuccessData.bookingData}
              onNewBooking={() => {
                const customer = bookingSuccessData.customer; // Capture for callback
                setShowBookingSuccess(false);
                setBookingSuccessData(null);
                if (onBookNow) onBookNow(customer);
              }}
              onClose={() => {
                const customer = bookingSuccessData.customer; // Capture for callback
                setShowBookingSuccess(false);
                setBookingSuccessData(null);
                if (onBookNow) onBookNow(customer);
              }}
            />
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}
