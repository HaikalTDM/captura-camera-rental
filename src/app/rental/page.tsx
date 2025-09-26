'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import TrustSection from '@/components/TrustSection';
import CameraCatalog from '@/components/CameraCatalog';
import BookingModal from '@/components/BookingModal';
import RentalSummary from '@/components/RentalSummary';
import WelcomeModal from '@/components/WelcomeModal';
import Footer from '@/components/Footer';
import { Camera, BookingDetails, CustomerDetails } from '@/types';

export default function RentalHome() {
  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [completedBooking, setCompletedBooking] = useState<BookingDetails | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);

  // Check if welcome modal should be shown
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('hasSeenWelcome');
    if (!hasSeenWelcome) {
      const timer = setTimeout(() => {
        setShowWelcomeModal(true);
      }, 2000); // Show after 2 seconds

      return () => clearTimeout(timer);
    }
  }, []);

  const handleRentNowClick = (camera: Camera) => {
    setSelectedCamera(camera);
    setIsBookingModalOpen(true);
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
    setSelectedCamera(null);
  };

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  const handleDontShowWelcomeAgain = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcomeModal(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection onRentNowClick={handleRentNowClick} />
      <TrustSection />
      <CameraCatalog onRentNowClick={handleRentNowClick} />

      {/* Quick Links Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Quick Links</h2>
            <p className="text-xl text-gray-600">Everything you need to know</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <a
              href="/how-to-book"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 text-center group"
            >
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">How to Book</h3>
              <p className="text-gray-600 text-sm">Step-by-step booking guide</p>
            </a>

            <a
              href="/gallery"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 text-center group"
            >
              <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-pink-200 transition-colors">
                <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Gallery</h3>
              <p className="text-gray-600 text-sm">See our equipment in action</p>
            </a>

            <a
              href="/equipment"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 text-center group"
            >
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2V7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Equipment</h3>
              <p className="text-gray-600 text-sm">Full equipment specifications</p>
            </a>

            <a
              href="/faq"
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow duration-200 text-center group"
            >
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">FAQ</h3>
              <p className="text-gray-600 text-sm">Common questions & answers</p>
            </a>
          </div>
        </div>
      </section>


      <Footer />

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
