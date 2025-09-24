'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import EquipmentSpecs from '@/components/EquipmentSpecs';

export default function EquipmentPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Page Header */}
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Equipment Specifications
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Detailed technical specifications and included accessories for all our camera equipment. 
              Know exactly what you're getting with your rental.
            </p>
          </div>
        </div>
      </div>

      {/* Equipment Specs Content */}
      <EquipmentSpecs />

      {/* CTA Section */}
      <div className="bg-blue-50 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Ready to rent professional equipment?
          </h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Browse our available cameras and book your rental today. 
            All equipment comes with complete accessories and technical support.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/#cameras"
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              Browse Cameras
            </a>
            <a
              href="/how-to-book"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 px-8 rounded-lg transition-colors duration-200"
            >
              How to Book
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
