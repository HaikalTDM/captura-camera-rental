'use client';

import { useEffect, useRef, useState } from 'react';
import { Camera } from '@/types';
import CalendarBooking from './CalendarBooking';

interface BookingBottomSheetProps {
  camera: Camera;
  isOpen: boolean;
  onClose: () => void;
  onBookNow: (camera: Camera, startDate?: Date, endDate?: Date, totalCost?: number, customerDetails?: any, totalDays?: number, dailyRate?: number) => void;
}

export default function BookingBottomSheet({ camera, isOpen, onClose, onBookNow }: BookingBottomSheetProps) {
  const scrollPositionRef = useRef(0);
  const [isClosing, setIsClosing] = useState(false);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false); // Reset closing state when opening
      // Simply prevent scrolling without changing position
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift from scrollbar
      
      return () => {
        // Just restore scrolling - position stays the same
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      };
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 400); // Match animation duration
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] flex items-end ${
          isClosing ? 'animate-backdropFadeOut' : 'animate-backdropFadeIn'
        }`}
        onClick={handleClose}
        style={{ touchAction: 'none' }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" style={{ touchAction: 'none' }}></div>
        
        {/* Bottom Sheet */}
        <div 
          className={`relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[90vh] overflow-y-auto border-t-4 border-blue-500 ${
            isClosing ? 'animate-modalSlideDown' : 'animate-modalSlideUp'
          }`}
          onClick={(e) => e.stopPropagation()}
          style={{ touchAction: 'auto' }}
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
                onClick={handleClose}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-all active:scale-95"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Calendar Content - Fade In */}
          <div className="px-6 py-6 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
            <CalendarBooking
              camera={camera}
              onBookingComplete={(startDate, endDate, totalCost, customerDetails, totalDays, dailyRate) => {
                onBookNow(camera, startDate, endDate, totalCost, customerDetails, totalDays, dailyRate);
                handleClose();
              }}
            />
          </div>
        </div>
      </div>

      {/* Animations - Slower & More Elegant */}
      <style jsx global>{`
        @keyframes backdropFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes backdropFadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes modalSlideDown {
          from {
            opacity: 1;
            transform: translateY(0);
          }
          to {
            opacity: 0;
            transform: translateY(100%);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-backdropFadeIn {
          animation: backdropFadeIn 0.5s ease-out forwards;
        }
        .animate-backdropFadeOut {
          animation: backdropFadeOut 0.4s ease-out forwards;
        }
        .animate-modalSlideUp {
          animation: modalSlideUp 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
        }
        .animate-modalSlideDown {
          animation: modalSlideDown 0.4s cubic-bezier(0.36, 0, 0.66, -0.56) forwards;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
}

