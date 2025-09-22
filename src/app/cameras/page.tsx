'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import CameraCatalog from '@/components/CameraCatalog';
import BookingModal from '@/components/BookingModal';
import RentalSummary from '@/components/RentalSummary';
import Footer from '@/components/Footer';
import { Camera, BookingDetails, CustomerDetails } from '@/types';

export default function CamerasPage() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<BookingDetails | null>(null);
  const [showSummary, setShowSummary] = useState(false);

  const handleBookCamera = (camera: Camera, startDate?: Date, endDate?: Date, totalCost?: number, customerDetails?: CustomerDetails, totalDays?: number, dailyRate?: number) => {
    if (startDate && endDate && totalCost && customerDetails && totalDays !== undefined && dailyRate !== undefined) {
      // Direct booking with dates and customer details
      const booking: BookingDetails = {
        camera,
        startDate,
        endDate,
        totalDays,
        totalCost,
        dailyRate,
        customerDetails
      };
      handleBookingComplete(booking);
    } else {
      // Open modal for date selection
      setSelectedCamera(camera);
      setIsBookingModalOpen(true);
    }
  };

  const handleCloseBookingModal = () => {
    setIsBookingModalOpen(false);
    setSelectedCamera(null);
  };

  const handleBookingComplete = (booking: BookingDetails) => {
    setCompletedBooking(booking);
    setIsBookingModalOpen(false);
    setShowSummary(true);
  };

  const handleCloseSummary = () => {
    setShowSummary(false);
    setCompletedBooking(null);
  };

  const handleNewBooking = () => {
    setShowSummary(false);
    setCompletedBooking(null);
    // Scroll to cameras section
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Choose Your Camera
            </span>
          </h1>
          <p className="text-xl text-gray-200 max-w-2xl mx-auto">
            Professional cameras available for daily rental. Select your preferred camera and book your dates.
          </p>
        </div>
      </section>

      {/* Camera Catalog */}
      <CameraCatalog onBookCamera={handleBookCamera} />
      
      <Footer />

      {/* Booking Modal */}
      <BookingModal
        camera={selectedCamera}
        isOpen={isBookingModalOpen}
        onClose={handleCloseBookingModal}
        onBookingComplete={handleBookingComplete}
      />

      {/* Rental Summary */}
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
