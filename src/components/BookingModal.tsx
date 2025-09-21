'use client';

import { useState, useEffect } from 'react';
import { BookingModalProps, BookingDetails } from '@/types';
import PricingCalculator from './PricingCalculator';

export default function BookingModal({ 
  camera, 
  isOpen, 
  onClose, 
  onBookingComplete 
}: BookingModalProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [dailyRate, setDailyRate] = useState(0);
  const [showTidyCal, setShowTidyCal] = useState(false);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setStartDate(null);
      setEndDate(null);
      setTotalCost(0);
      setTotalDays(0);
      setDailyRate(0);
      setShowTidyCal(false);
    }
  }, [isOpen]);

  const handlePriceChange = (cost: number, days: number, rate: number) => {
    setTotalCost(cost);
    setTotalDays(days);
    setDailyRate(rate);
  };

  const handleDateSelection = () => {
    setShowTidyCal(true);
  };

  const handleBookingConfirm = () => {
    if (camera && startDate && endDate) {
      const booking: BookingDetails = {
        camera,
        startDate,
        endDate,
        totalDays,
        totalCost,
        dailyRate,
      };
      onBookingComplete(booking);
      onClose();
    }
  };

  if (!isOpen || !camera) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">
            Book {camera.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6">
          {!showTidyCal ? (
            /* Initial booking form */
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Camera Details */}
              <div>
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Camera Details</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <h4 className="font-bold text-gray-900 mb-2">{camera.name}</h4>
                    <p className="text-sm text-gray-800 mb-3">{camera.description}</p>
                    
                    <div className="space-y-2">
                      <h5 className="text-sm font-bold text-gray-900">Key Features:</h5>
                      <ul className="text-sm text-gray-800 space-y-1">
                        {camera.features.map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <svg className="w-3 h-3 text-green-600 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className="text-gray-800">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Date Selection */}
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">Select Rental Dates</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={startDate ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}` : ''}
                        onChange={(e) => setStartDate(e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
                        min={`${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-800 mb-2">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={endDate ? `${endDate.getFullYear()}-${String(endDate.getMonth() + 1).padStart(2, '0')}-${String(endDate.getDate()).padStart(2, '0')}` : ''}
                        onChange={(e) => setEndDate(e.target.value ? new Date(e.target.value + 'T00:00:00') : null)}
                        min={startDate ? `${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}-${String(startDate.getDate()).padStart(2, '0')}` : `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}-${String(new Date().getDate()).padStart(2, '0')}`}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div>
                <PricingCalculator
                  camera={camera}
                  startDate={startDate}
                  endDate={endDate}
                  onPriceChange={handlePriceChange}
                />
                
                {startDate && endDate && (
                  <div className="mt-6">
                    <button
                      onClick={handleDateSelection}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                    >
                      Continue to Calendar Booking
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TidyCal Integration */
            <div>
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Select Your Booking Time</h3>
                <p className="text-gray-600">
                  Choose your preferred pickup time for {camera.name} rental 
                  ({startDate?.toLocaleDateString()} - {endDate?.toLocaleDateString()})
                </p>
              </div>
              
              {/* TidyCal Embed */}
              <div className="bg-gray-50 rounded-lg p-6 mb-6">
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Select Your Booking Time</h4>
                  <p className="text-gray-600 mb-4">
                    Choose your preferred pickup time slot from the available options below.
                  </p>
                </div>

                {/* TidyCal Embed Container */}
                <div className="bg-white rounded-lg p-4 min-h-[500px]">
                  {/* Replace this with your actual TidyCal embed code */}
                  <div className="text-center py-16">
                    <svg className="w-16 h-16 text-blue-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <h5 className="text-lg font-semibold text-gray-900 mb-2">TidyCal Integration Ready</h5>
                    <p className="text-gray-600 mb-4 max-w-md mx-auto">
                      Replace this placeholder with your TidyCal embed code to enable live booking.
                    </p>

                    {/* Sample TidyCal embed code */}
                    <div className="bg-gray-50 rounded-lg p-4 text-left">
                      <p className="text-sm font-medium text-gray-700 mb-2">Sample TidyCal Embed Code:</p>
                      <code className="text-xs text-gray-600 block whitespace-pre-wrap">
{`<script src="https://asset-tidycal.b-cdn.net//js/embed.js"></script>
<div id="tidycal-embed" data-path="your-username/booking-type"></div>`}
                      </code>
                      <p className="text-xs text-gray-700 mt-2">
                        Get your embed code from TidyCal Dashboard → Booking Type → "Embed on your website"
                      </p>
                    </div>
                  </div>

                  {/* Uncomment and replace with your actual TidyCal embed code:
                  <script src="https://asset-tidycal.b-cdn.net//js/embed.js"></script>
                  <div id="tidycal-embed" data-path="your-username/camera-pickup"></div>
                  */}
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowTidyCal(false)}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Back to Date Selection
                </button>
                <button
                  onClick={handleBookingConfirm}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Confirm Booking
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
