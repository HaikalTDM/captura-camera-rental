'use client';

import { useState } from 'react';
import CameraCatalog from '@/components/CameraCatalog';
import RentalSummary from '@/components/RentalSummary';
import { Camera, BookingDetails, CustomerDetails } from '@/types';

export default function CamerasPage() {
  const [completedBooking, setCompletedBooking] = useState<BookingDetails | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const handleCameraBookingComplete = (
    camera: Camera,
    startDate?: Date,
    endDate?: Date,
    totalCost?: number,
    customerDetails?: CustomerDetails,
    totalDays?: number,
    dailyRate?: number
  ) => {
    if (startDate && endDate && totalCost && customerDetails && totalDays && dailyRate) {
      const bookingDetails: BookingDetails = {
        camera,
        startDate,
        endDate,
        totalDays,
        totalCost,
        dailyRate,
        customerDetails,
      };
      handleBookingComplete(bookingDetails);
    }
  };

  const handleBookingComplete = (booking: BookingDetails) => {
    setCompletedBooking(booking);
    setShowSummary(true);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setCompletedBooking(null);
  };

  const handleNewBooking = () => {
    setShowSummary(false);
    setCompletedBooking(null);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white pt-16 pb-8 px-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-2xl font-black mb-2">Available Cameras</h1>
          <p className="text-sm text-slate-300 font-semibold">
            Professional equipment • Ready to rent
          </p>
        </div>
      </div>

      {/* Camera Catalog */}
      <section className="py-8">
        <CameraCatalog onBookCamera={handleCameraBookingComplete} />
      </section>

      {/* Rental Summary Modal */}
      {showSummary && completedBooking && (
        <RentalSummary
          booking={completedBooking}
          onClose={handleCloseSummary}
          onNewBooking={handleNewBooking}
        />
      )}
    </div>
  );
}

