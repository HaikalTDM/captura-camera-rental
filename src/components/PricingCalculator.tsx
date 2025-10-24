'use client';

import { useState, useEffect } from 'react';
import { Camera } from '@/types';
import { calculateRentalCost, formatCurrency } from '@/lib/pricing';

interface PricingCalculatorProps {
  camera: Camera;
  startDate: Date | null;
  endDate: Date | null;
  onPriceChange: (totalCost: number, totalDays: number, dailyRate: number) => void;
}

export default function PricingCalculator({ 
  camera, 
  startDate, 
  endDate, 
  onPriceChange 
}: PricingCalculatorProps) {
  const [pricing, setPricing] = useState<{
    totalDays: number;
    dailyRate: number;
    totalCost: number;
  } | null>(null);

  useEffect(() => {
    if (startDate && endDate) {
      const calculatedPricing = calculateRentalCost(camera, startDate, endDate);
      setPricing(calculatedPricing);
      onPriceChange(calculatedPricing.totalCost, calculatedPricing.totalDays, calculatedPricing.dailyRate);
    } else {
      setPricing(null);
      onPriceChange(0, 0, camera.dailyRate);
    }
  }, [camera, startDate, endDate, onPriceChange]);

  if (!pricing || !startDate || !endDate) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-bold text-gray-900 mb-2">Pricing</h4>
        <div className="space-y-2 text-sm text-gray-800">
          <div className="flex justify-between">
            <span className="font-medium">Daily Rate:</span>
            <span className="font-semibold">{formatCurrency(camera.dailyRate)}</span>
          </div>
          <div className="flex justify-between">
            <span className="font-medium">{(camera.discountThreshold || 3)}+ Days Rate:</span>
            <span className="font-semibold">{formatCurrency(camera.discountRate)}</span>
          </div>
          <div className="text-xs text-gray-700 mt-2 font-medium">
            Select dates to see total cost
          </div>
        </div>
      </div>
    );
  }

  const discountThreshold = camera.discountThreshold || 3;
  const isDiscounted = pricing.totalDays >= discountThreshold;
  const savings = isDiscounted ? (camera.dailyRate - camera.discountRate) * pricing.totalDays : 0;

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h4 className="font-bold text-gray-900 mb-3">Rental Summary</h4>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-800 font-medium">Camera:</span>
          <span className="font-bold text-gray-900">{camera.name}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-800 font-medium">Duration:</span>
          <span className="font-bold text-gray-900">{pricing.totalDays} day{pricing.totalDays > 1 ? 's' : ''}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-800 font-medium">Daily Rate:</span>
          <span className="font-bold text-gray-900">
            {formatCurrency(pricing.dailyRate)}
            {isDiscounted && (
              <span className="text-green-600 text-xs ml-1 font-semibold">(Discounted)</span>
            )}
          </span>
        </div>
        
        {isDiscounted && savings > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Bulk Discount:</span>
            <span>-{formatCurrency(savings)}</span>
          </div>
        )}
        
        <hr className="my-2" />
        
        <div className="flex justify-between text-lg font-bold">
          <span className="text-gray-900">Total Cost:</span>
          <span className="text-blue-600">{formatCurrency(pricing.totalCost)}</span>
        </div>
        
        {isDiscounted && (
          <div className="text-xs text-green-600 text-center mt-2">
            🎉 You saved {formatCurrency(savings)} with our bulk discount!
          </div>
        )}
      </div>
    </div>
  );
}
