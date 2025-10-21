'use client';

import { useEffect } from 'react';
import { Camera } from '@/types';
import CalendarBooking from './CalendarBooking';

interface BookingBottomSheetProps {
  camera: Camera;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (camera: Camera, startDate?: Date, endDate?: Date, totalCost?: number, customerDetails?: any, totalDays?: number, dailyRate?: number) => void;
}

export default function BookingBottomSheet({ camera, isOpen, onClose, onBookNow }: BookingBottomSheetProps) {
  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] flex items-end animate-backdropFadeIn"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
        
        {/* Bottom Sheet */}
        <div 
          className="relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto animate-modalSlideUp border-t-4 border-blue-500"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Handle Bar */}
          <div className="flex justify-center pt-3 pb-2 sticky top-0 bg-white z-10">
            <div className="w-10 h-1 rounded-full bg-slate-300"></div>
          </div>

          {/* Header */}
          <div className="sticky top-6 bg-white/95 backdrop-blur-lg px-6 py-4 border-b border-slate-200 z-10">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-black">Book {camera.name}</h3>
                <p className="text-sm text-slate-600 font-semibold mt-0.5">
                  RM{camera.dailyRate}/day • Professional Equipment
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all active:scale-95"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Content */}
          <div className="px-6 py-6">
            <CalendarBooking
              camera={camera}
              onBookingComplete={(startDate, endDate, totalCost, customerDetails, totalDays, dailyRate) => {
                onBookNow(camera, startDate, endDate, totalCost, customerDetails, totalDays, dailyRate);
                onClose();
              }}
            />
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes backdropFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalSlideUp {
          from {
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        .animate-backdropFadeIn {
          animation: backdropFadeIn 0.3s ease-out forwards;
        }
        .animate-modalSlideUp {
          animation: modalSlideUp 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </>
  );
}

