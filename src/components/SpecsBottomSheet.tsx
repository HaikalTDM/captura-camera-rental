'use client';

import { useEffect, useRef } from 'react';
import { Camera } from '@/types';

interface SpecsBottomSheetProps {
  camera: Camera | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function SpecsBottomSheet({ camera, isOpen, onClose }: SpecsBottomSheetProps) {
  const scrollPositionRef = useRef(0);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
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

  if (!isOpen || !camera) return null;

  const specs = camera.specifications;
  const hasSpecs = specs && Object.keys(specs).length > 0;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100] flex items-end animate-backdropFadeIn"
        onClick={onClose}
        style={{ touchAction: 'none' }}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-md" style={{ touchAction: 'none' }}></div>
        
        {/* Bottom Sheet */}
        <div 
          className="relative w-full bg-white rounded-t-3xl shadow-2xl max-h-[85vh] overflow-y-auto animate-modalSlideUp border-t-4 border-purple-500"
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
                <h3 className="text-xl font-black text-black">{camera.name}</h3>
                <p className="text-sm text-slate-600 font-semibold mt-0.5">
                  Technical Specifications
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

          {/* Specs Content */}
          <div className="px-6 py-6 space-y-6">
            {/* Key Features */}
            <div>
              <h4 className="text-base font-black text-black mb-3 uppercase tracking-wide">Key Features</h4>
              <div className="grid grid-cols-1 gap-2">
                {camera.features.slice(0, 6).map((feature, index) => (
                  <div 
                    key={index}
                    className="flex items-start gap-3 bg-slate-50 rounded-xl p-3 animate-fadeIn"
                    style={{ animationDelay: `${0.3 + (index * 0.08)}s` }}
                  >
                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-semibold text-slate-700 leading-snug">{feature}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Technical Specs */}
            {hasSpecs && (
              <div>
                <h4 className="text-base font-black text-black mb-3 uppercase tracking-wide">Technical Details</h4>
                <div className="bg-gradient-to-br from-slate-50 to-white rounded-2xl border-2 border-slate-200 overflow-hidden">
                  {Object.entries(specs).map(([key, value], index) => (
                    <div 
                      key={index}
                      className={`flex items-center justify-between p-4 ${
                        index !== Object.entries(specs).length - 1 ? 'border-b border-slate-200' : ''
                      } animate-fadeIn`}
                      style={{ animationDelay: `${0.8 + (index * 0.08)}s` }}
                    >
                      <span className="text-sm font-bold text-slate-600 uppercase tracking-wide">{key}</span>
                      <span className="text-sm font-black text-black">{String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* What's Included */}
            <div className="animate-fadeIn" style={{ animationDelay: '1.4s' }}>
              <h4 className="text-base font-black text-black mb-3 uppercase tracking-wide">What's Included</h4>
              <div className="bg-gradient-to-br from-emerald-50 to-white rounded-2xl border-2 border-emerald-200 p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Camera Body</p>
                      <p className="text-xs text-slate-600 font-semibold">Fully tested & maintained</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Batteries & Charger</p>
                      <p className="text-xs text-slate-600 font-semibold">Multiple batteries included</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900">Memory Card & Case</p>
                      <p className="text-xs text-slate-600 font-semibold">Protective carrying case</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Insurance Badge */}
            <div className="bg-gradient-to-r from-slate-900 to-black rounded-2xl p-6 text-white text-center animate-fadeIn" style={{ animationDelay: '1.6s' }}>
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h4 className="text-lg font-black mb-2">Fully Insured</h4>
              <p className="text-sm text-white/80 font-semibold leading-relaxed">
                All equipment is covered by comprehensive insurance for your peace of mind
              </p>
            </div>
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
        @keyframes fadeIn {
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
        .animate-modalSlideUp {
          animation: modalSlideUp 0.6s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </>
  );
}

