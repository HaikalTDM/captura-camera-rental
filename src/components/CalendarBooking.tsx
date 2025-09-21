'use client';

import { useState } from 'react';
import { Camera, CustomerDetails } from '@/types';
import CustomCalendar from './CustomCalendar';
import CalendarPricing from './CalendarPricing';

interface CalendarBookingProps {
  camera: Camera;
  onBookNow?: (camera: Camera, startDate: Date, endDate: Date, totalCost: number, customerDetails: CustomerDetails, totalDays: number, dailyRate: number) => void;
  className?: string;
}

export default function CalendarBooking({ camera, onBookNow, className = "" }: CalendarBookingProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalCost, setTotalCost] = useState(0);
  const [totalDays, setTotalDays] = useState(0);
  const [dailyRate, setDailyRate] = useState(0);

  const handleDateRangeSelect = (start: Date | null, end: Date | null, cost: number, days?: number, rate?: number) => {
    setStartDate(start);
    setEndDate(end);
    setTotalCost(cost);
    setTotalDays(days || 0);
    setDailyRate(rate || 0);
  };

  const handleBookNow = (customerDetails: CustomerDetails) => {
    if (startDate && endDate && onBookNow) {
      onBookNow(camera, startDate, endDate, totalCost, customerDetails, totalDays, dailyRate);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Calendar Component */}
      <CustomCalendar
        camera={camera}
        onDateRangeSelect={handleDateRangeSelect}
        className="w-full"
      />
      
      {/* Pricing Component */}
      <CalendarPricing
        camera={camera}
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
