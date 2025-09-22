'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import HeroSection from '@/components/HeroSection';
import TrustSection from '@/components/TrustSection';
import CustomerGallery from '@/components/CustomerGallery';
import BookingStepsSection from '@/components/BookingStepsSection';
import WelcomeModal from '@/components/WelcomeModal';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function Home() {
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

  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      <HeroSection />
      <TrustSection />
      <BookingStepsSection />
      <CustomerGallery />

      {/* Call to Action Section */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Ready to Start Creating?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Choose from our professional camera collection and book your rental dates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/cameras"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📷 Browse Cameras
            </Link>
            <Link
              href="/equipment"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              🔧 View Specifications
            </Link>
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
    </div>
  );
}
