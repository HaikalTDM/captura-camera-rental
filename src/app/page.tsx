'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import TrustSection from '@/components/TrustSection';
import CustomerGallery from '@/components/CustomerGallery';
import BookingStepsSection from '@/components/BookingStepsSection';
import CameraCatalog from '@/components/CameraCatalog';
import EquipmentSpecs from '@/components/EquipmentSpecs';
import PickupDeliverySection from '@/components/PickupDeliverySection';
import FAQSection from '@/components/FAQSection';
import TikTokEmbed from '@/components/TikTokEmbed';
import FloatingNav from '@/components/FloatingNav';
import BookingModal from '@/components/BookingModal';
import RentalSummary from '@/components/RentalSummary';
import WelcomeModal from '@/components/WelcomeModal';
import Footer from '@/components/Footer';
import { Camera, BookingDetails, CustomerDetails } from '@/types';

export default function Home() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<BookingDetails | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Check if user has seen the welcome modal before
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('captura-welcome-seen');
    if (!hasSeenWelcome) {
      setShowWelcomeModal(true);
    }
  }, []);

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  const handleDontShowWelcomeAgain = () => {
    localStorage.setItem('captura-welcome-seen', 'true');
    setShowWelcomeModal(false);
  };

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
    const camerasSection = document.getElementById('cameras');
    if (camerasSection) {
      camerasSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <TrustSection />
      <CustomerGallery />
      <BookingStepsSection />
      <CameraCatalog onBookCamera={handleBookCamera} />
      <EquipmentSpecs />
      <PickupDeliverySection />
      <FAQSection />
      <TikTokEmbed />
      <Footer />

      {/* Floating Navigation */}
      <FloatingNav />

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
        onDontShowAgain={handleDontShowWelcomeAgain}
      />

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
