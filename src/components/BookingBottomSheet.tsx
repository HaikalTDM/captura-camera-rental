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

  // Lock body scroll when modal is open - Enhanced for mobile
  useEffect(() => {
    if (isOpen) {
      setIsClosing(false); // Reset closing state when opening
      
      // Save current scroll position
      const scrollY = window.scrollY;
      scrollPositionRef.current = scrollY;
      
      // Lock scroll - works on both desktop and mobile
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      document.body.style.touchAction = 'none';
      
      return () => {
        // Restore scroll position and body styles
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        document.body.style.touchAction = '';
        window.scrollTo(0, scrollPositionRef.current);
      };
    }
  }, [isOpen]);

  // Handle close with animation
  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
      setIsClosing(false);
    }, 450); // Match animation duration (400ms + 50ms buffer)
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[200] flex items-end ${
          isClosing ? 'animate-backdropFadeOut' : 'animate-backdropFadeIn'
        }`}
        onClick={handleClose}
        style={{ touchAction: 'none' }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" style={{ touchAction: 'none' }}></div>
        
        {/* Bottom Sheet */}
        <div 
          className={`relative w-full bg-white rounded-t-3xl shadow-2xl h-[95vh] overflow-y-auto border-t-4 border-blue-500 ${
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
          <div className="px-6 py-6 pb-24 animate-fadeInUp" style={{ animationDelay: '0.2s' }}>
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

      {/* Animations - Elegant & Smooth */}
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
            transform: translateY(100%);
          }
          to {
            transform: translateY(0);
          }
        }
        @keyframes modalSlideDown {
          from {
            transform: scaleY(1);
            transform-origin: bottom center;
          }
          to {
            transform: scaleY(0);
            transform-origin: bottom center;
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
          animation: backdropFadeIn 0.4s ease-out forwards;
        }
        .animate-backdropFadeOut {
          animation: backdropFadeOut 0.3s ease-in forwards;
        }
        .animate-modalSlideUp {
          animation: modalSlideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-modalSlideDown {
          animation: modalSlideDown 0.4s cubic-bezier(0.7, 0, 0.84, 0) forwards;
          transform-origin: bottom center;
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
}

