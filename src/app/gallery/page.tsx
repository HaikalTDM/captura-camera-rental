'use client';

import Navigation from '@/components/Navigation';
import CustomerGallery from '@/components/CustomerGallery';
import TikTokEmbed from '@/components/TikTokEmbed';
import Footer from '@/components/Footer';
import Link from 'next/link';

export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Page Header */}
      <section className="bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
              Customer Gallery
            </span>
          </h1>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto mb-8">
            See amazing content created by our customers using CAPTURA rental cameras. Get inspired for your next project!
          </p>
          <Link 
            href="/cameras"
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            📷 Rent Your Camera
          </Link>
        </div>
      </section>

      {/* Customer Gallery */}
      <CustomerGallery />
      
      {/* TikTok Embed */}
      <TikTokEmbed />
      
      {/* Call to Action */}
      <section className="py-16 bg-gradient-to-br from-purple-50 to-pink-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Create Your Own Amazing Content
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            Join our community of creators and capture professional-quality content with our premium cameras.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/cameras"
              className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              📷 Book Your Camera
            </Link>
            <Link 
              href="/equipment"
              className="inline-flex items-center px-8 py-4 bg-white text-gray-700 font-semibold rounded-full border-2 border-gray-300 hover:border-purple-500 hover:text-purple-600 transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              🔧 View Equipment Specs
            </Link>
          </div>
        </div>
      </section>
      
      <Footer />
    </div>
  );
}
