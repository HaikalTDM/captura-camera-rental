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
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    // Cleanup function to restore scroll when component unmounts
    return () => {
      document.body.style.overflow = 'unset';
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            {camera.name} - Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('specs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'specs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Specifications
            </button>
            <button
              onClick={() => setActiveTab('accessories')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'accessories'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Included Accessories
            </button>
            <button
              onClick={() => setActiveTab('features')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'features'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              Key Features
            </button>
          </nav>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === 'specs' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(cameraData.specs).map(([key, value]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <dt className="font-medium text-gray-900 mb-1">{key}</dt>
                  <dd className="text-gray-600">{value}</dd>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'accessories' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cameraData.accessories.map((accessory, index) => (
                <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{accessory}</span>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'features' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {cameraData.features.map((feature, index) => (
                <div key={index} className="flex items-start p-3 bg-blue-50 rounded-lg">
                  <svg className="w-5 h-5 text-blue-500 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
            <div className="text-center sm:text-left">
              <p className="text-lg font-semibold text-gray-900">
                Daily Rate: RM{camera.dailyRate}
              </p>
              <p className="text-sm text-green-600">
                RM{camera.discountRate}/day for 3+ days
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Close
              </button>
              <button
                onClick={() => {
                  onClose();
                  // Scroll to the specific camera card's booking section
                  setTimeout(() => {
                    // First try to find the specific camera card
                    const cameraCards = document.querySelectorAll('[data-camera-id]');
                    let targetCard = null;

                    cameraCards.forEach(card => {
                      const cardElement = card as HTMLElement;
                      if (cardElement.dataset.cameraId === camera.id) {
                        targetCard = cardElement;
                      }
                    });

                    if (targetCard) {
                      // Scroll to the calendar booking section within the card
                      const bookingSection = targetCard.querySelector('[data-booking-section]');
                      if (bookingSection) {
                        bookingSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      } else {
                        // Fallback to scrolling to the card itself
                        targetCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }
                    } else {
                      // Fallback to cameras section
                      const camerasSection = document.getElementById('cameras');
                      if (camerasSection) {
                        camerasSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }
                  }, 100);
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors duration-200"
              >
                Book This Camera
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
