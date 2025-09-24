'use client';

import Image from 'next/image';
import { Camera, CustomerDetails } from '@/types';
import { formatCurrency } from '@/lib/pricing';
import ImageGallery from './ImageGallery';
import CalendarBooking from './CalendarBooking';

interface CameraCardProps {
  camera: Camera;
  onBookNow: (camera: Camera, startDate?: Date, endDate?: Date, totalCost?: number, customerDetails?: CustomerDetails, totalDays?: number, dailyRate?: number) => void;
  onViewSpecs?: (camera: Camera) => void;
}

export default function CameraCard({ camera, onBookNow, onViewSpecs }: CameraCardProps) {
  return (
    <div
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 h-full flex flex-col"
      data-camera-id={camera.id}
    >
      {/* Image Gallery */}
      <div className="p-4 pb-2">
        <ImageGallery
          mainImage={camera.image}
          galleryImages={camera.images}
          alt={camera.name}
          className="w-full"
        />
      </div>

      <div className="px-4 pb-4 flex-1 flex flex-col">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{camera.name}</h3>
        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{camera.description}</p>

        {/* Features */}
        <div className="mb-4">
          <h4 className="text-sm font-semibold text-gray-900 mb-2">Key Features:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            {camera.features.slice(0, 3).map((feature, index) => (
              <li key={index} className="flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Pricing */}
        <div className="mb-6">
          <div className="flex items-baseline space-x-2">
            <span className="text-2xl font-bold text-gray-900">
              {formatCurrency(camera.dailyRate)}
            </span>
            <span className="text-gray-600">/day</span>
          </div>
          <p className="text-sm text-green-600 font-medium">
            {formatCurrency(camera.discountRate)}/day for 3+ days
          </p>
        </div>

        {/* Specifications Button */}
        {onViewSpecs && (
          <div className="mb-4">
            <button
              onClick={() => onViewSpecs(camera)}
              className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 hover:from-indigo-100 hover:to-purple-100 text-indigo-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 text-sm flex items-center justify-center border border-indigo-200 hover:border-indigo-300 shadow-sm hover:shadow-md"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Camera Details & Specs
            </button>
          </div>
        )}

        {/* Custom Calendar Booking */}
        <div className="mb-4" data-booking-section>
          <h4 className="text-sm font-semibold text-gray-900 mb-3">📅 Book Your Rental</h4>
          <CalendarBooking
            camera={camera}
            onBookNow={(camera, startDate, endDate, totalCost, customerDetails, totalDays, dailyRate) =>
              onBookNow(camera, startDate, endDate, totalCost, customerDetails, totalDays, dailyRate)
            }
            className="w-full"
          />
        </div>
      </div>
    </div>
  );
}
