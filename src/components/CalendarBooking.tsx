'use client';

import { useState } from 'react';
import { Camera, CustomerDetails } from '@/types';
import CustomCalendar from './CustomCalendar';
import CalendarPricing from './CalendarPricing';

interface CalendarBookingProps {
  camera: Camera;
  onBookingComplete?: (camera: Camera, startDate: Date, endDate: Date, totalCost: number, customerDetails: CustomerDetails, totalDays: number, dailyRate: number) => void;
  className?: string;
}

export default function CalendarBooking({ camera, onBookingComplete, className = "" }: CalendarBookingProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [dailyRate, setDailyRate] = useState(0);

  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    camera.variants && camera.variants.length > 0 ? camera.variants[0].id : null
  );

  const activeVariant = camera.variants?.find(v => v.id === selectedVariantId);
  const activeCamera: Camera = activeVariant ? {
    ...camera,
    name: `${camera.name} (${activeVariant.name})`,
    dailyRate: activeVariant.dailyRate,
    discountRate: activeVariant.discountRate
  } : camera;

  const handleDateRangeSelect = (start: Date | null, end: Date | null, cost: number, days?: number, rate?: number) => {
    setStartDate(start);
    setEndDate(end);
    setTotalCost(cost);
    setTotalDays(days || 0);
    setDailyRate(rate || 0);
  };

  const handleBookNow = (customerDetails: CustomerDetails) => {
    if (startDate && endDate && onBookingComplete) {
      onBookingComplete(activeCamera, startDate, endDate, totalCost, customerDetails, totalDays, dailyRate);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Variant Selector */}
      {camera.variants && camera.variants.length > 0 && (
        <div className="bg-zinc-900 rounded-2xl border border-white/5 p-4 mb-4">
          <h4 className="text-sm font-bold text-white mb-3">Select Package Option</h4>
          <div className="space-y-2">
            {camera.variants.map((variant) => (
              <label 
                key={variant.id} 
                className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedVariantId === variant.id 
                    ? 'border-white bg-white/5' 
                    : 'border-white/5 bg-zinc-800 hover:border-white/20 hover:bg-zinc-800/80'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                    selectedVariantId === variant.id ? 'border-white bg-white' : 'border-zinc-500'
                  }`}>
                    {selectedVariantId === variant.id && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                  </div>
                  <div>
                    <div className={`font-bold text-sm ${selectedVariantId === variant.id ? 'text-white' : 'text-zinc-300'}`}>{variant.name}</div>
                    <div className="text-xs text-zinc-500">RM{variant.dailyRate}/day <span className="text-zinc-600">| RM{variant.discountRate}/day ({(camera.discountThreshold || 3)}+ days)</span></div>
                  </div>
                </div>
                <input
                  type="radio"
                  name="variant_selection"
                  value={variant.id}
                  checked={selectedVariantId === variant.id}
                  onChange={() => setSelectedVariantId(variant.id)}
                  className="hidden"
                />
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Calendar Component */}
      <CustomCalendar
        camera={activeCamera}
        onDateRangeSelect={handleDateRangeSelect}
        className="w-full"
      />

      {/* Pricing Component */}
      <CalendarPricing
        camera={activeCamera}
        startDate={startDate}
        endDate={endDate}
        totalCost={totalCost}
        totalDays={totalDays}
        dailyRate={dailyRate}
        onBookNow={startDate && endDate ? handleBookNow : undefined}
        className="w-full"
      />
    </div>
  );
}
