'use client';

import { useState } from 'react';
import { Camera, CustomerDetails } from '@/types';
import CustomCalendar from './CustomCalendar';
import CalendarPricing from './CalendarPricing';

interface CalendarBookingProps {
  camera: Camera;
  onBookNow?: (camera: Camera, startDate: Date, endDate: Date, totalCost: number, customerDetails: CustomerDetails) => void;
  className?: string;
}

export default function CalendarBooking({ camera, onBookNow, className = "" }: CalendarBookingProps) {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [totalCost, setTotalCost] = useState(0);

  const handleDateRangeSelect = (start: Date | null, end: Date | null, cost: number) => {
    setStartDate(start);
    setEndDate(end);
    setTotalCost(cost);
  };

  const handleBookNow = (customerDetails: CustomerDetails) => {
    if (startDate && endDate && onBookNow) {
      onBookNow(camera, startDate, endDate, totalCost, customerDetails);
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
        onBookNow={startDate && endDate ? handleBookNow : undefined}
        className="w-full"
      />
    </div>
  );
}
