'use client';

import { useState, useEffect } from 'react';
import { Camera, CustomerDetails } from '@/types';
import { calculateRentalCost, formatCurrency } from '@/lib/pricing';
import TermsModal from './TermsModal';
import CustomerDetailsModal from './CustomerDetailsModal';

interface CalendarPricingProps {
  camera: Camera;
  startDate: Date | null;
  endDate: Date | null;
  totalCost: number;
  onBookNow?: (customerDetails: CustomerDetails) => void;
  className?: string;
}

export default function CalendarPricing({
  camera,
  startDate,
  endDate,
  totalCost,
  onBookNow,
  className = ""
}: CalendarPricingProps) {
  const [pricing, setPricing] = useState<{
    totalDays: number;
    dailyRate: number;
    totalCost: number;
    savings: number;
    isDiscounted: boolean;
  } | null>(null);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);

  useEffect(() => {
    if (startDate && endDate) {
      const calculatedPricing = calculateRentalCost(camera, startDate, endDate);
      const isDiscounted = calculatedPricing.totalDays >= 3;
      const savings = isDiscounted ? 
        (camera.dailyRate - camera.discountRate) * calculatedPricing.totalDays : 0;
      
      setPricing({
        ...calculatedPricing,
        savings,
        isDiscounted
      });
    } else {
      setPricing(null);
    }
  }, [camera, startDate, endDate]);

  if (!pricing || !startDate || !endDate) {
    return (
      <div className={`bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-4 ${className}`}>
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h4 className="font-bold text-gray-900 mb-2">Select Your Dates</h4>
          <p className="text-sm text-gray-800 mb-4">
            Choose your rental period to see pricing
          </p>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-800">Daily Rate:</span>
              <span className="font-semibold text-gray-900">{formatCurrency(camera.dailyRate)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-800">3+ Days Rate:</span>
              <span className="font-semibold text-green-600">{formatCurrency(camera.discountRate)}</span>
            </div>
            <div className="text-xs text-gray-700 mt-3 p-2 bg-blue-50 rounded">
              💡 Book for 3+ days and save {formatCurrency(camera.dailyRate - camera.discountRate)} per day!
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h4 className="font-bold text-gray-900 flex items-center">
          <svg className="w-5 h-5 text-blue-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16a2 2 0 002 2z" />
          </svg>
          Rental Summary
        </h4>
        {pricing.isDiscounted && (
          <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded-full">
            💰 SAVINGS!
          </span>
        )}
      </div>

      {/* Rental Details */}
      <div className="space-y-3 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-gray-800 font-medium">Camera:</span>
          <span className="font-bold text-gray-900">{camera.name}</span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-800 font-medium">Duration:</span>
          <span className="font-bold text-gray-900">
            {pricing.totalDays} day{pricing.totalDays > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-800 font-medium">Daily Rate:</span>
          <div className="text-right">
            <span className="font-bold text-gray-900">
              {formatCurrency(pricing.dailyRate)}
            </span>
            {pricing.isDiscounted && (
              <div className="text-xs text-green-600 font-medium">
                (Bulk discount applied)
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-gray-800 font-medium">Dates:</span>
          <div className="text-right">
            <div className="font-medium text-gray-900 text-sm">
              {startDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {endDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </div>
            <div className="text-xs text-gray-800">
              {startDate.getFullYear()}
            </div>
          </div>
        </div>

        {pricing.isDiscounted && pricing.savings > 0 && (
          <div className="flex justify-between items-center text-green-600 bg-green-50 p-2 rounded">
            <span className="font-medium">You Save:</span>
            <span className="font-bold">-{formatCurrency(pricing.savings)}</span>
          </div>
        )}
      </div>

      {/* Total Cost */}
      <div className="border-t border-blue-200 pt-4 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">Total Cost:</span>
          <div className="text-right">
            <span className="text-2xl font-bold text-blue-600">
              {formatCurrency(pricing.totalCost)}
            </span>
            {pricing.isDiscounted && (
              <div className="text-xs text-green-600 font-medium">
                🎉 {formatCurrency(pricing.savings)} saved!
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Book Now Button */}
      {onBookNow && (
        <button
          onClick={() => setShowTermsModal(true)}
          className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
        >
          📋 Book {camera.name}
        </button>
      )}

      {/* Additional Info */}
      {pricing.isDiscounted && (
        <div className="mt-3 text-center">
          <div className="text-xs text-green-700 bg-green-100 p-2 rounded">
            💡 Great choice! You're saving {formatCurrency(camera.dailyRate - camera.discountRate)} per day with our bulk discount.
          </div>
        </div>
      )}

      {/* Terms & Conditions Modal */}
      <TermsModal
        isOpen={showTermsModal}
        onAccept={() => {
          setShowTermsModal(false);
          setShowCustomerModal(true);
        }}
        onCancel={() => setShowTermsModal(false)}
      />

      {/* Customer Details Modal */}
      {startDate && endDate && pricing && (
        <CustomerDetailsModal
          isOpen={showCustomerModal}
          camera={camera}
          startDate={startDate}
          endDate={endDate}
          totalCost={pricing.totalCost}
          totalDays={pricing.totalDays}
          onSubmit={() => {
            // WhatsApp integration handles the booking flow
            setShowCustomerModal(false);
          }}
          onCancel={() => setShowCustomerModal(false)}
        />
      )}
    </div>
  );
}
