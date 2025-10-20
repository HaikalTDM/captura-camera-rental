'use client';

import { useState, useEffect } from 'react';
import { getAllCameras } from '@/lib/api/bookings';
import type { Camera } from '@/lib/supabase';

export default function MobileCameras() {
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [filter, setFilter] = useState<'all' | 'available' | 'rented'>('all');

  useEffect(() => {
    loadCameras();
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
  }, []);

  const loadCameras = async () => {
    setIsLoading(true);
    try {
      const camerasData = await getAllCameras();
      setCameras(camerasData);
    } catch (error) {
      console.error('Error loading cameras:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCameras = cameras.filter(c => {
    if (filter === 'all') return true;
    if (filter === 'available') return c.is_available;
    if (filter === 'rented') return !c.is_available;
    return true;
  });

  const availableCount = cameras.filter(c => c.is_available).length;
  const rentedCount = cameras.filter(c => !c.is_available).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`px-4 pt-4 space-y-4 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'available', 'rented'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`flex-1 py-2 px-3 rounded-lg text-xs font-medium transition-all ${
              filter === tab
                ? 'bg-black text-white'
                : 'text-gray-500'
            }`}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        } rounded-xl p-3 border shadow-sm text-center`}>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {cameras.length}
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total
          </p>
        </div>
        <div className={`${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        } rounded-xl p-3 border shadow-sm text-center`}>
          <p className="text-2xl font-bold text-green-600">
            {availableCount}
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Available
          </p>
        </div>
        <div className={`${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        } rounded-xl p-3 border shadow-sm text-center`}>
          <p className="text-2xl font-bold text-blue-600">
            {rentedCount}
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Rented
          </p>
        </div>
      </div>

      {/* Cameras Grid */}
      <div className="grid grid-cols-1 gap-3">
        {filteredCameras.map((camera) => {
          const availabilityPercent = camera.total_quantity > 0 
            ? (camera.available_quantity / camera.total_quantity) * 100 
            : 0;
          
          return (
            <div
              key={camera.id}
              className={`${
                isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
              } rounded-2xl border shadow-sm overflow-hidden`}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-14 h-14 ${
                      isDarkMode ? 'bg-gray-700' : 'bg-gray-100'
                    } rounded-xl flex items-center justify-center flex-shrink-0`}>
                      <span className="text-2xl">📷</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                        {camera.name}
                      </p>
                      <p className={`text-sm mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                        {camera.brand}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-2 ${
                    camera.is_available
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
                      : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                  }`}>
                    {camera.is_available ? 'Available' : 'Rented'}
                  </span>
                </div>

                {/* Availability Bar */}
                <div className="mb-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Availability
                    </p>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {camera.available_quantity}/{camera.total_quantity}
                    </p>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        availabilityPercent > 50
                          ? 'bg-green-500'
                          : availabilityPercent > 20
                          ? 'bg-yellow-500'
                          : 'bg-red-500'
                      }`}
                      style={{ width: `${availabilityPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3">
                  <div className={`${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  } rounded-lg p-3`}>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Daily Rate
                    </p>
                    <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      RM{camera.daily_rate}
                    </p>
                  </div>
                  <div className={`${
                    isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                  } rounded-lg p-3`}>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Category
                    </p>
                    <p className={`text-sm font-medium mt-1 truncate ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {camera.category}
                    </p>
                  </div>
                </div>

                {/* Features */}
                {camera.features && camera.features.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <p className={`text-xs mb-2 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                      Features
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {camera.features.slice(0, 3).map((feature, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-md text-xs ${
                            isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {feature}
                        </span>
                      ))}
                      {camera.features.length > 3 && (
                        <span className={`px-2 py-1 rounded-md text-xs ${
                          isDarkMode ? 'text-gray-400' : 'text-gray-600'
                        }`}>
                          +{camera.features.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {filteredCameras.length === 0 && (
        <div className={`${
          isDarkMode ? 'bg-gray-800' : 'bg-white'
        } rounded-2xl p-12 text-center`}>
          <p className={`text-lg ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            No cameras found
          </p>
          <p className={`text-sm mt-2 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
            Try changing the filter
          </p>
        </div>
      )}
    </div>
  );
}

