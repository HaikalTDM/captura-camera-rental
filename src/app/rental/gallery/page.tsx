'use client';

import Navigation from '@/components/Navigation';
import Footer from '@/components/Footer';
import CustomerGallery from '@/components/CustomerGallery';


export default function GalleryPage() {
  return (
    <div className="min-h-screen bg-white">
      <Navigation />
      
      {/* Page Header */}
      <div className="bg-gradient-to-br from-pink-50 via-white to-purple-50 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4">
              Customer Gallery
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              See the amazing content our customers create with CAPTURA equipment. 
              From professional shoots to creative projects, get inspired!
            </p>
          </div>
        </div>
      </div>

      {/* Customer Gallery Content */}
      <CustomerGallery />

      <Footer />
    </div>
  );
}
