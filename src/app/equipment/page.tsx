'use client';

import Navigation from '@/components/Navigation';
import EquipmentSpecs from '@/components/EquipmentSpecs';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function EquipmentPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Equipment Specifications
            </span>
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Detailed technical specifications and included accessories for all our professional cameras.
          </p>
          <Link 
            href="/cameras"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            📷 Browse Cameras
          </Link>
        </div>
      </section>

      {/* Equipment Specifications */}
      <EquipmentSpecs />
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Book Your Camera?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Now that you know the specifications, choose your camera and book your rental dates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/cameras"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📷 Book Now
            </Link>
            <Link 
              href="/logistics"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-300 hover:border-blue-500 hover:text-blue-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              📍 Pickup & Delivery Info
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
