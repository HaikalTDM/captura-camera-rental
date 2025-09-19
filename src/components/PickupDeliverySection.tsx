'use client';

import { useState } from 'react';

export default function PickupDeliverySection() {
  const [activeTab, setActiveTab] = useState<'pickup' | 'delivery'>('pickup');
  const [mapType, setMapType] = useState<'roadmap' | 'satellite'>('roadmap');

  // Caltex Selayang Pandang coordinates
  const pickupLocation = {
    lat: 3.2597,
    lng: 101.6497,
    name: 'Caltex Selayang Pandang',
    address: 'Lot 1, 2, Batu 8, Jalan Rawang, Selayang Pandang, 68100 Batu Caves, Selangor'
  };



  const toggleMapType = () => {
    const newMapType = mapType === 'roadmap' ? 'satellite' : 'roadmap';
    setMapType(newMapType);
  };

  const pickupLocations = [
    {
      id: 1,
      name: 'Selayang',
      icon: '📍',
      description: 'Main pickup point',
      available: true
    },
    {
      id: 2,
      name: 'Batu Caves',
      icon: '📍',
      description: 'Secondary location',
      available: true
    }
  ];

  const deliveryOptions = [
    {
      id: 1,
      name: 'Lalamove',
      icon: '🚚',
      description: 'Fast delivery service',
      available: true
    },
    {
      id: 2,
      name: 'GrabExpress',
      icon: '🛵',
      description: 'Quick motorcycle delivery',
      available: true
    }
  ];

  return (
    <section id="pickup-delivery" className="py-20 bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-500 rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-purple-500 rounded-full animate-bounce"></div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 bg-pink-500 rounded-full animate-ping"></div>
        <div className="absolute bottom-40 right-1/3 w-14 h-14 bg-green-500 rounded-full animate-pulse"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full mb-6 animate-pulse">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            📍 Available Pickup & Delivery Options
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Choose your preferred method to receive your camera rental equipment
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8 px-4">
          <div className="bg-white rounded-xl p-2 shadow-lg border border-gray-200 w-full max-w-md">
            <div className="flex gap-1 sm:gap-2">
              <button
                onClick={() => setActiveTab('pickup')}
                className={`flex-1 px-3 py-3 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 min-h-[48px] flex items-center justify-center ${
                  activeTab === 'pickup'
                    ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                📍 <span className="hidden sm:inline">Pickup Locations</span><span className="sm:hidden">Pickup</span>
              </button>
              <button
                onClick={() => setActiveTab('delivery')}
                className={`flex-1 px-3 py-3 sm:px-6 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 min-h-[48px] flex items-center justify-center ${
                  activeTab === 'delivery'
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg transform scale-105'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                🚚 <span className="hidden sm:inline">Delivery Options</span><span className="sm:hidden">Delivery</span>
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Column - Options List */}
          <div className="space-y-4">
            {activeTab === 'pickup' ? (
              <>
                {pickupLocations.map((location, index) => (
                  <div
                    key={location.id}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-500 rounded-full flex items-center justify-center text-white text-xl animate-pulse">
                        {location.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{location.name}</h3>
                        <p className="text-gray-600">{location.description}</p>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ))}
                
                {/* Main Pickup Point */}
                <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-xl p-6 text-white shadow-xl">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-8 h-8 bg-pink-500 rounded-full flex items-center justify-center animate-pulse">
                      📍
                    </div>
                    <h3 className="text-xl font-bold">Main Pickup Point: Caltex Selayang Pandang</h3>
                  </div>
                  <div className="bg-white/10 rounded-lg p-4 backdrop-blur-sm">
                    <p className="text-gray-200 mb-2">📍 Lot 1, 2, Batu 8, Jalan Rawang</p>
                    <p className="text-gray-200 mb-2">Selayang Pandang, 68100 Batu Caves, Selangor</p>
                    <div className="flex items-center space-x-2 mt-3">
                      <span className="text-yellow-400">⭐ 3.8</span>
                      <span className="text-gray-200">• 991 reviews</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {deliveryOptions.map((option, index) => (
                  <div
                    key={option.id}
                    className="bg-white rounded-xl p-6 shadow-lg border border-gray-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full flex items-center justify-center text-white text-xl animate-pulse">
                        {option.icon}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900">{option.name}</h3>
                        <p className="text-gray-600">{option.description}</p>
                      </div>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>

          {/* Right Column - Info Cards */}
          <div className="space-y-6">
            {activeTab === 'pickup' ? (
              <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    🗺️ Interactive Map
                  </h3>
                  <div className="flex gap-2">
                    <button
                      onClick={toggleMapType}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                        mapType === 'roadmap'
                          ? 'bg-blue-500 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🗺️ Map
                    </button>
                    <button
                      onClick={toggleMapType}
                      className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                        mapType === 'satellite'
                          ? 'bg-green-500 text-white shadow-lg'
                          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      🛰️ Satellite
                    </button>
                  </div>
                </div>

                <div className="relative">
                  {/* Embedded Google Map with correct location and pinpoint */}
                  <div className="w-full h-80 rounded-lg overflow-hidden border-2 border-gray-200 shadow-inner" style={{ minHeight: '320px' }}>
                    <iframe
                      src={mapType === 'satellite'
                        ? "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.4279366027276!2d101.65798711138099!3d3.2432656525515404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc46e263540b19%3A0x82899e19753dd951!2sCaltex%20Selayang%20Pandang!5e1!3m2!1sen!2smy!4v1758201820338!5m2!1sen!2smy"
                        : "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.4279366027276!2d101.65798711138099!3d3.2432656525515404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc46e263540b19%3A0x82899e19753dd951!2sCaltex%20Selayang%20Pandang!5e0!3m2!1sen!2smy!4v1758201820338!5m2!1sen!2smy"
                      }
                      width="100%"
                      height="100%"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      className="rounded-lg"
                      key={mapType} // Force re-render when map type changes
                      title="Caltex Selayang Pandang Location"
                    />
                  </div>

                  {/* Map overlay with location info */}
                  <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-gray-200 max-w-xs">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white text-xs animate-pulse">
                        📍
                      </div>
                      <span className="font-semibold text-gray-900 text-sm">Main Pickup Point</span>
                    </div>
                    <p className="text-xs text-gray-600 mb-1">{pickupLocation.name}</p>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-yellow-500">⭐ 3.8</span>
                      <span className="text-gray-500">• 991 reviews</span>
                    </div>
                  </div>

                  {/* Map controls info */}
                  <div className="absolute bottom-4 right-4 bg-black/80 text-white rounded-lg p-2 text-xs">
                    <p className="mb-1">🖱️ Click & drag to move</p>
                    <p className="mb-1">🔍 Scroll to zoom</p>
                    <p>📍 Click marker for details</p>
                  </div>
                </div>

                {/* Quick directions */}
                <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
                  <h4 className="font-semibold text-gray-900 mb-2 flex items-center gap-2">
                    🧭 Quick Directions
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${pickupLocation.lat},${pickupLocation.lng}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3 text-center transition-colors duration-200 flex items-center justify-center gap-1 text-gray-900 font-semibold hover:text-blue-600 min-h-[44px]"
                    >
                      📱 Google Maps
                    </a>
                    <a
                      href={`https://waze.com/ul?ll=${pickupLocation.lat},${pickupLocation.lng}&navigate=yes`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-white hover:bg-gray-50 border border-gray-200 rounded-lg p-3 text-center transition-colors duration-200 flex items-center justify-center gap-1 text-gray-900 font-semibold hover:text-purple-600 min-h-[44px]"
                    >
                      🚗 Waze
                    </a>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Delivery Rates Card */}
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-6 border-2 border-yellow-200 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-500 rounded-full flex items-center justify-center animate-pulse">
                      💰
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Delivery Rates</h3>
                  </div>
                  <p className="text-gray-700">
                    Delivery rates apply depending on distance (RM10-RM20, based on rider availability).
                  </p>
                </div>

                {/* Free Guidance Card */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border-2 border-green-200 shadow-lg">
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center animate-pulse">
                      ✅
                    </div>
                    <h3 className="text-xl font-bold text-gray-900">Free Guidance Included!</h3>
                  </div>
                  <p className="text-gray-700">
                    Complete guidance on location and delivery process will be provided upon booking confirmation. We're here to help!
                  </p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
