'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import TrustSection from '@/components/TrustSection';
import CameraCatalog from '@/components/CameraCatalog';
import RentalSummary from '@/components/RentalSummary';
import WelcomeModal from '@/components/WelcomeModal';
import PickupDeliverySection from '@/components/PickupDeliverySection';
import Footer from '@/components/Footer';
import { Camera, BookingDetails, CustomerDetails } from '@/types';

export default function RentalHome() {
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


  const handleCameraBookingComplete = (camera: Camera, startDate?: Date, endDate?: Date, totalCost?: number, customerDetails?: CustomerDetails, totalDays?: number, dailyRate?: number) => {
    if (startDate && endDate && totalCost && customerDetails && totalDays && dailyRate) {
      const bookingDetails: BookingDetails = {
        camera,
        startDate,
        endDate,
        totalDays,
        totalCost,
        dailyRate,
        customerDetails
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

  const handleCloseWelcomeModal = () => {
    setShowWelcomeModal(false);
  };

  const handleDontShowWelcomeAgain = () => {
    localStorage.setItem('hasSeenWelcome', 'true');
    setShowWelcomeModal(false);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navigation />
      <HeroSection />
      <TrustSection />
      
      {/* Camera Catalog Section - App Style */}
      <section id="cameras" className="py-12 bg-white">
        <CameraCatalog onBookCamera={handleCameraBookingComplete} />
      </section>

      {/* App-Style Quick Actions */}
      <section className="py-12 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6">
          {/* Section Header - Minimal */}
          <div className="mb-8">
            <h2 className="text-2xl font-black text-black mb-2">Quick Actions</h2>
            <p className="text-sm text-slate-600 font-semibold">Everything you need</p>
          </div>
          
          {/* Action Cards Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <a
              href="/rental/how-to-book"
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200 hover:scale-105 hover:shadow-xl hover:border-blue-300 transition-all duration-300 group active:scale-95 animate-fadeIn"
              style={{ animationDelay: '0ms' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1">How to Book</h3>
              <p className="text-xs text-slate-600 font-semibold leading-snug">Simple steps</p>
            </a>

            <a
              href="/rental/gallery"
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200 hover:scale-105 hover:shadow-xl hover:border-pink-300 transition-all duration-300 group active:scale-95 animate-fadeIn"
              style={{ animationDelay: '100ms' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-pink-500/30 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1">Gallery</h3>
              <p className="text-xs text-slate-600 font-semibold leading-snug">Real results</p>
            </a>

            <a
              href="/rental/equipment"
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200 hover:scale-105 hover:shadow-xl hover:border-emerald-300 transition-all duration-300 group active:scale-95 animate-fadeIn"
              style={{ animationDelay: '200ms' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                </svg>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1">Equipment</h3>
              <p className="text-xs text-slate-600 font-semibold leading-snug">Full specs</p>
            </a>

            <a
              href="/rental/support"
              className="bg-white rounded-2xl p-6 shadow-lg border-2 border-slate-200 hover:scale-105 hover:shadow-xl hover:border-purple-300 transition-all duration-300 group active:scale-95 animate-fadeIn"
              style={{ animationDelay: '300ms' }}
            >
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center mb-4 shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-base font-black text-slate-900 mb-1">Support</h3>
              <p className="text-xs text-slate-600 font-semibold leading-snug">24/7 help</p>
            </a>
          </div>
        </div>
      </section>

      {/* Pickup & Delivery Section - App Style */}
      <PickupDeliverySection />

      <Footer />

      {/* Welcome Modal */}
      <WelcomeModal
        isOpen={showWelcomeModal}
        onClose={handleCloseWelcomeModal}
        onDontShowAgain={handleDontShowWelcomeAgain}
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
