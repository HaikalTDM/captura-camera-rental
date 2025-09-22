'use client';

import Navigation from '@/components/Navigation';
import PickupDeliverySection from '@/components/PickupDeliverySection';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function LogisticsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Pickup & Delivery
            </span>
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            Find our pickup location and learn about our delivery options. We make camera rental convenient for you.
          </p>
          <Link 
            href="/cameras"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            📷 Book Camera First
          </Link>
        </div>
      </section>

      {/* Pickup & Delivery Information */}
      <PickupDeliverySection />
      
      {/* Process Timeline */}
      <section className="py-16 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📋 Rental Process Timeline
            </h2>
            <p className="text-lg text-gray-600">
              Here's what happens after you book your camera
            </p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Book Online</h3>
              <p className="text-gray-600">Complete your booking on our website</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-green-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">WhatsApp Confirmation</h3>
              <p className="text-gray-600">We'll contact you via WhatsApp to confirm details</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Pickup/Delivery</h3>
              <p className="text-gray-600">Collect your camera or arrange delivery</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-500 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                4
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Create & Return</h3>
              <p className="text-gray-600">Use the camera and return on agreed date</p>
            </div>
          </div>
        </div>
      </section>
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Start Your Rental?
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Now that you know the process, choose your camera and book your dates.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/cameras"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📷 Book Camera Now
            </Link>
            <Link 
              href="/support"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-300 hover:border-green-500 hover:text-green-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              ❓ Have Questions?
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
