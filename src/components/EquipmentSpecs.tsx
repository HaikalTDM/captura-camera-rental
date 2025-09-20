'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function EquipmentSpecs() {
  const [activeCamera, setActiveCamera] = useState<'osmo' | 'action'>('osmo');

  const cameraSpecs = {
    osmo: {
      name: "DJI Osmo Pocket 3 Creator Combo",
      image: "/images/osmo-pocket-3.jpg",
      price: "RM 50/day",
      discountPrice: "RM 45/day (3+ days)",
      description: "Ultra-compact handheld camera with 4K/120fps recording and 3-axis mechanical gimbal",
      keyFeatures: [
        "Ultra-compact handheld camera",
        "Professional 4K video recording",
        "Built-in 3-axis gimbal stabilization",
        "Rotatable touchscreen",
        "Wireless microphone system included",
        "Perfect for content creation"
      ],
      includedAccessories: [
        "DJI Osmo Pocket 3 Camera",
        "DJI Mic 2 Transmitter",
        
        "Wireless Microphone Windscreen",
        "1/4-inch Thread to Hot Shoe Adapter",
        "Wide-Angle Lens",
        "DJI Osmo Pocket 3 Handle",
        "DJI Osmo Pocket 3 Battery Handle",
        "Protective Case",
        "256GB microSD Card",
        "USB-C Cable",
        "Wrist Strap",
        "Carrying Case"
      ]
    },
    action: {
      name: "DJI Action 5 Pro Adventure Combo",
      image: "/images/action-5-pro.jpg", 
      price: "RM 50/day",
      discountPrice: "RM 45/day (3+ days)",
      description: "Rugged action camera with 4K/120fps recording, 13.5m waterproof, and dual touchscreens",
      keyFeatures: [
        "Rugged waterproof action camera",
        "Professional 4K video recording",
        "Waterproof up to 13.5m depth",
        "Front and rear touchscreens",
        "Ultra-wide angle recording",
        "Long-lasting battery performance"
      ],
      includedAccessories: [
        "DJI Action 5 Pro Camera",
        "DJI Action 5 Pro Multifunctional Battery Handle",
        "DJI Action 5 Pro Extension Rod (1.5m)",
        "DJI Action 5 Pro Magnetic Ball-Joint Adapter Set",
        "Protective Frame",
        "Lens Protector (2x)",
        "256GB microSD Card",
        "USB-C Cable",
        "Cleaning Cloth",
        "Waterproof Carrying Case"
      ]
    }
  };

  const currentSpec = cameraSpecs[activeCamera];

  return (
    <section id="equipment-specs" className="py-16 bg-gradient-to-br from-slate-50 via-gray-50 to-blue-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-16 h-16 bg-slate-400 rounded-full animate-pulse"></div>
        <div className="absolute top-32 right-20 w-12 h-12 bg-gray-400 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-10 h-10 bg-blue-400 rounded-full animate-ping"></div>
        <div className="absolute bottom-32 right-1/3 w-14 h-14 bg-slate-500 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center mb-6">
            <div className="bg-white/80 backdrop-blur-sm rounded-full px-6 py-3 shadow-xl border border-white/20">
              <div className="flex items-center gap-3">
                <span className="text-2xl animate-bounce">📋</span>
                <span className="text-lg font-bold text-gray-900">Equipment Specifications</span>
                <span className="text-2xl animate-pulse">⚙️</span>
              </div>
            </div>
          </div>

          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            📦 What You Get in the Bag 📦
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Complete package contents and accessories included with each camera rental - everything you need to start creating!
          </p>
        </div>

        {/* Camera Selection Tabs */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-2 shadow-xl border border-white/20 w-full max-w-2xl">
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setActiveCamera('osmo')}
                className={`flex-1 flex items-center gap-2 sm:gap-3 px-3 py-3 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                  activeCamera === 'osmo'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <div className="relative w-8 h-6 sm:w-10 sm:h-8 flex-shrink-0">
                  <Image
                    src="/images/osmo_pocket_3_creator_combo.jpg"
                    alt="Osmo Pocket 3"
                    fill
                    className="object-contain rounded"
                    sizes="40px"
                  />
                </div>
                <span className="hidden sm:inline">Osmo Pocket 3</span>
                <span className="sm:hidden">Osmo</span>
              </button>
              <button
                onClick={() => setActiveCamera('action')}
                className={`flex-1 flex items-center gap-2 sm:gap-3 px-3 py-3 sm:px-6 rounded-xl font-semibold text-sm sm:text-base transition-all duration-300 ${
                  activeCamera === 'action'
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
                }`}
              >
                <div className="relative w-8 h-6 sm:w-10 sm:h-8 flex-shrink-0">
                  <Image
                    src="/images/osmo_action_5_pro_adventure_combo.jpg"
                    alt="Action 5 Pro"
                    fill
                    className="object-contain rounded"
                    sizes="40px"
                  />
                </div>
                <span className="hidden sm:inline">Action 5 Pro</span>
                <span className="sm:hidden">Action</span>
              </button>
            </div>
          </div>
        </div>

        {/* Camera Specifications */}
        <div className="max-w-6xl mx-auto">
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-2xl border border-white/20 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-600 to-gray-700 text-white p-4 sm:p-8">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                <div className="flex-1">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2">{currentSpec.name}</h3>
                  <p className="text-slate-200 mb-4 text-sm sm:text-base">{currentSpec.description}</p>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                    <div className="text-lg sm:text-xl font-bold">{currentSpec.price}</div>
                    <div className="text-green-300 text-sm">{currentSpec.discountPrice}</div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <div className="relative w-48 h-32 sm:w-56 sm:h-36 lg:w-64 lg:h-40 bg-white/10 rounded-xl p-4 backdrop-blur-sm">
                    <Image
                      src={activeCamera === 'osmo'
                        ? '/images/osmo_pocket_3_creator_combo.jpg'
                        : '/images/osmo_action_5_pro_adventure_combo.jpg'
                      }
                      alt={activeCamera === 'osmo'
                        ? 'DJI Osmo Pocket 3 Creator Combo'
                        : 'DJI Action 5 Pro Adventure Combo'
                      }
                      fill
                      className="object-contain rounded-lg"
                      sizes="(max-width: 640px) 192px, (max-width: 1024px) 224px, 256px"
                      priority
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-8">
              {/* Product Showcase */}
              <div className="mb-8">
                <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-6 border border-gray-200">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-center">
                    <div className="order-2 lg:order-1">
                      <h4 className="text-xl sm:text-2xl font-bold text-gray-900 mb-4">
                        📦 Complete {activeCamera === 'osmo' ? 'Creator' : 'Adventure'} Package
                      </h4>
                      <p className="text-gray-700 mb-4 text-sm sm:text-base">
                        {activeCamera === 'osmo'
                          ? 'Professional content creation setup with everything you need for cinematic shots and smooth footage.'
                          : 'Ultimate adventure filming kit designed for extreme conditions and action-packed scenarios.'
                        }
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          Professional Grade
                        </span>
                        <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          Complete Kit
                        </span>
                        <span className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-xs font-medium">
                          Ready to Use
                        </span>
                      </div>
                    </div>
                    <div className="order-1 lg:order-2">
                      <div className="relative w-full h-64 sm:h-80 bg-white rounded-xl shadow-lg overflow-hidden">
                        <Image
                          src={activeCamera === 'osmo'
                            ? '/images/osmo_pocket_3_creator_combo.jpg'
                            : '/images/osmo_action_5_pro_adventure_combo.jpg'
                          }
                          alt={activeCamera === 'osmo'
                            ? 'DJI Osmo Pocket 3 Creator Combo - Complete Package'
                            : 'DJI Action 5 Pro Adventure Combo - Complete Package'
                          }
                          fill
                          className="object-contain p-4"
                          sizes="(max-width: 1024px) 100vw, 50vw"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Key Features */}
              <div className="mb-8">
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  ⭐ What Makes This Camera Special
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  {currentSpec.keyFeatures.map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-colors duration-200">
                      <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse flex-shrink-0"></div>
                      <span className="text-gray-800 font-medium text-sm sm:text-base">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Included Accessories */}
              <div>
                <h4 className="text-lg sm:text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  📦 Everything Included in Your Rental
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  {currentSpec.includedAccessories.map((accessory, index) => (
                    <div key={index} className="flex items-center gap-3 p-3 sm:p-4 bg-green-50 rounded-lg border border-green-200 hover:bg-green-100 transition-colors duration-200">
                      <div className="text-green-500 text-lg flex-shrink-0">✅</div>
                      <span className="text-gray-800 font-medium text-sm sm:text-base">{accessory}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Call to Action */}
              <div className="mt-8 text-center">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl p-4 sm:p-6 border border-blue-200">
                  <h5 className="text-lg font-bold text-gray-900 mb-2">
                    🎒 Grab & Go - Everything Ready!
                  </h5>
                  <p className="text-gray-600 mb-4 text-sm sm:text-base">
                    Complete package with all accessories included. Just pick up and start creating amazing content!
                  </p>
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      <span>Complete package</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      <span>Ready to use</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-green-500">✅</span>
                      <span>No extra costs</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
