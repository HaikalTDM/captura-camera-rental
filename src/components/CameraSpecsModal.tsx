'use client';

import { useState, useEffect } from 'react';
import { Camera } from '@/types';

interface CameraSpecsModalProps {
  camera: Camera | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function CameraSpecsModal({ camera, isOpen, onClose }: CameraSpecsModalProps) {
  const [activeTab, setActiveTab] = useState<'specs' | 'accessories' | 'features'>('specs');

  // Prevent body scroll when modal is open
  useEffect(() => {
    try {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = 'unset';
      }
    } catch (e) {
      // Ignore DOM errors
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      try {
        document.body.style.overflow = 'unset';
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [isOpen]);

  if (!isOpen || !camera) return null;

  // Sample specifications data - in real app, this would come from the camera object
  const getSpecifications = (cameraName: string) => {
    const name = cameraName.toLowerCase();
    
    if (name.includes('osmo') && name.includes('pocket')) {
      return {
        specs: {
          'Sensor': '1-inch CMOS',
          'Video Resolution': '4K/120fps, 1080p/240fps',
          'Photo Resolution': '9.4MP',
          'Stabilization': '3-axis mechanical gimbal',
          'Battery Life': '2 hours',
          'Weight': '116g',
          'Storage': 'microSD card (up to 256GB)',
          'Connectivity': 'Wi-Fi, Bluetooth'
        },
        accessories: [
          'DJI Osmo Pocket 3 Camera',
          'Battery Handle',
          'USB-C Cable',
          'Protective Case',
          'MicroSD Card (64GB)',
          'Lens Cleaning Kit',
          'Quick Start Guide'
        ],
        features: [
          '4K/120fps recording',
          '3-axis mechanical gimbal',
          'ActiveTrack 6.0',
          'Compact and portable design',
          'Professional image quality',
          'Easy-to-use interface',
          'Multiple shooting modes',
          'Live streaming capability'
        ]
      };
    } else if (name.includes('action')) {
      return {
        specs: {
          'Sensor': '1/1.3-inch CMOS',
          'Video Resolution': '4K/120fps, 1080p/240fps',
          'Photo Resolution': '40MP',
          'Waterproof': '10m without housing',
          'Battery Life': '4 hours',
          'Weight': '145g',
          'Storage': 'microSD card (up to 256GB)',
          'Connectivity': 'Wi-Fi, Bluetooth'
        },
        accessories: [
          'DJI Action 5 Pro Camera',
          'Rechargeable Battery',
          'USB-C Cable',
          'Waterproof Housing',
          'MicroSD Card (64GB)',
          'Mounting Accessories',
          'Lens Cleaning Kit',
          'Quick Start Guide'
        ],
        features: [
          '4K/120fps recording',
          'Waterproof to 10m',
          'Superior low-light performance',
          'HorizonSteady stabilization',
          'Dual touchscreens',
          'Rugged design',
          'Multiple mounting options',
          'Voice control'
        ]
      };
    } else if (name.includes('canon') && name.includes('r50')) {
      return {
        specs: {
          'Sensor': '24.2MP APS-C CMOS',
          'Processor': 'DIGIC X',
          'Video Resolution': '4K/30fps, 1080p/120fps',
          'Photo Resolution': '24.2MP (6000 x 4000)',
          'ISO Range': '100-32000 (expandable to 51200)',
          'Autofocus': 'Dual Pixel CMOS AF II',
          'Continuous Shooting': 'Up to 15 fps',
          'Battery Life': 'Approx. 370 shots',
          'Weight': '328g',
          'Storage': 'SD/SDHC/SDXC card',
          'Connectivity': 'Wi-Fi, Bluetooth, USB-C',
          'Daily Capacity': '1000 snaps/day'
        },
        accessories: [
          'Canon R50 Camera Body',
          'Professional Tripod',
          'UV Filter Lens',
          'Premium Carrying Bag',
          '64GB SD Card (ready to use)',
          'Battery Charger',
          'USB-C Cable',
          'Lens Cap',
          'Camera Strap',
          'Quick Start Guide'
        ],
        features: [
          '24.2MP APS-C sensor',
          '4K/30fps video recording',
          'Dual Pixel CMOS AF II with Eye Detection',
          'Up to 15 fps continuous shooting',
          '1000 snaps per day capacity',
          'Vari-angle touchscreen LCD',
          'Creative Assist mode',
          'Wi-Fi & Bluetooth connectivity',
          'Compact mirrorless design',
          'Perfect for weddings & events'
        ]
      };
    }
    
    // Default specs
    return {
      specs: {
        'Type': 'Professional Camera',
        'Video': '4K Recording',
        'Photo': 'High Resolution',
        'Battery': 'Long lasting',
        'Weight': 'Lightweight'
      },
      accessories: [
        'Camera Body',
        'Battery',
        'Charger',
        'Memory Card',
        'Carrying Case'
      ],
      features: [
        'Professional quality',
        'Easy to use',
        'Reliable performance'
      ]
    };
  };

  const cameraData = getSpecifications(camera.name);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-0 sm:p-4 z-50 animate-fadeIn">
      <div className="bg-white rounded-none sm:rounded-3xl max-w-5xl w-full h-full sm:h-auto sm:max-h-[90vh] overflow-y-auto shadow-2xl border-2 border-slate-200 animate-modalSlideUp">
        {/* Premium Header with Gradient */}
        <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 p-6 sm:p-8 text-white overflow-hidden">
          {/* Decorative Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl"></div>
          </div>

          <div className="relative z-10 flex justify-between items-start">
            <div>
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-4">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-black uppercase tracking-wide">Professional Equipment</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black mb-2 leading-tight">
                {camera.name}
              </h2>
              <p className="text-white/90 text-lg font-semibold">Complete Specifications & Details</p>
            </div>
            <button
              onClick={onClose}
              className="bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full p-3 transition-all duration-200 active:scale-95 group"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Modern Tabs with Pills */}
        <div className="bg-gradient-to-b from-slate-50 to-white border-b-2 border-slate-200">
          <nav className="flex space-x-2 px-4 sm:px-8 py-4 overflow-x-auto">
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-3 px-6 rounded-full font-black text-sm whitespace-nowrap transition-all duration-300 ${
                activeTab === 'specs'
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30 scale-105'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-2 border-slate-200'
              }`}
            >
              📊 Specifications
            </button>
            <button
              onClick={() => setActiveTab('accessories')}
              className={`py-3 px-6 rounded-full font-black text-sm whitespace-nowrap transition-all duration-300 ${
                activeTab === 'accessories'
                  ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30 scale-105'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-2 border-slate-200'
              }`}
            >
              📦 What's Included
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`py-3 px-6 rounded-full font-black text-sm whitespace-nowrap transition-all duration-300 ${
                activeTab === 'features'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/30 scale-105'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border-2 border-slate-200'
              }`}
            >
              ⭐ Key Features
            </button>
          </nav>
        </div>

        {/* Content with Smooth Transitions */}
        <div className="p-6 sm:p-8 bg-gradient-to-b from-white to-slate-50 min-h-[400px]">
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 animate-fadeIn">
              {Object.entries(cameraData.specs).map(([key, value], index) => (
                <div 
                  key={key} 
                  className="bg-white rounded-2xl p-6 border-2 border-slate-200 hover:shadow-xl hover:scale-105 hover:border-blue-300 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <dt className="font-black text-slate-900 mb-2 text-sm uppercase tracking-wide">{key}</dt>
                      <dd className="text-slate-700 font-bold text-lg">{value}</dd>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'accessories' && (
            <div>
              <div className="mb-6 p-6 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl border-2 border-emerald-200">
                <h3 className="font-black text-emerald-900 mb-2 flex items-center gap-2">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Everything You Need Included
                </h3>
                <p className="text-emerald-800 font-semibold text-sm">All items are professionally cleaned and tested before each rental</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-fadeIn">
                {cameraData.accessories.map((accessory, index) => (
                  <div 
                    key={index} 
                    className="flex items-center gap-4 p-5 bg-white rounded-2xl border-2 border-slate-200 hover:shadow-lg hover:scale-105 hover:border-emerald-300 transition-all duration-300"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                      <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="font-bold text-slate-800">{accessory}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'features' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 animate-fadeIn">
              {cameraData.features.map((feature, index) => (
                <div 
                  key={index} 
                  className="flex items-start gap-4 p-6 bg-white rounded-2xl border-2 border-slate-200 hover:shadow-xl hover:scale-105 hover:border-purple-300 transition-all duration-300 group"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-purple-500/30 group-hover:rotate-12 transition-transform">
                    <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                  <span className="font-bold text-slate-800 leading-relaxed">{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Premium Footer with Pricing & CTA */}
        <div className="border-t-2 border-slate-200 p-6 sm:p-8 bg-gradient-to-r from-slate-50 to-white">
          <div className="flex flex-col lg:flex-row gap-6 justify-between items-center">
            {/* Pricing Info */}
            <div className="text-center lg:text-left">
              <div className="flex items-baseline gap-3 justify-center lg:justify-start mb-2">
                <span className="text-2xl text-slate-400 line-through font-bold">
                  RM{Math.round(camera.dailyRate * 1.3)}
                </span>
                <span className="text-5xl font-black text-black">
                  RM{camera.dailyRate}
                </span>
                <span className="text-xl text-slate-600 font-bold">/day</span>
              </div>
              <div className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-100 to-teal-100 border-2 border-emerald-300 text-emerald-800 px-5 py-2 rounded-full text-sm font-black shadow-lg">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                </svg>
                Save 10% for 3+ days • RM{camera.discountRate}/day
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
              <button
                onClick={onClose}
                className="bg-white hover:bg-slate-50 text-black font-bold py-4 px-8 rounded-2xl transition-all duration-200 active:scale-95 border-2 border-slate-300 hover:border-slate-400 shadow-md"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  setTimeout(() => {
                    const cameraCards = document.querySelectorAll('[data-camera-id]');
                    let targetCard = null;

                    cameraCards.forEach(card => {
                      const cardElement = card as HTMLElement;
                      if (cardElement.dataset.cameraId === camera.id) {
                        targetCard = cardElement;
                      }
                    });

                    if (targetCard) {
                      const bookingSection = targetCard.querySelector('[data-booking-section]');
                      if (bookingSection) {
                        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else {
                        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    } else {
                      const camerasSection = document.getElementById('cameras');
                      if (camerasSection) {
                        camerasSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }, 100);
                }}
                className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:shadow-2xl hover:shadow-blue-500/50 text-white font-black py-4 px-10 rounded-2xl transition-all duration-300 active:scale-[0.97] flex items-center justify-center gap-3 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 transform -skew-x-12 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                <svg className="w-6 h-6 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Book This Camera
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
