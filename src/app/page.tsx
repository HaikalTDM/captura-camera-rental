'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function GatewayHome() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="relative w-32 h-32 mx-auto mb-8 animate-pulse">
            <Image
              src="/images/captura_logo_big.png"
              alt="Captura Logo"
              fill
              className="object-contain"
            />
          </div>
          <div className="text-2xl font-bold text-black animate-pulse">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="relative w-24 sm:w-32 h-24 sm:h-32 mx-auto mb-6">
            <Image
              src="/images/captura_logo_big.png"
              alt="Captura Logo"
              fill
              className="object-contain"
            />
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-black mb-4 font-serif tracking-tight">
            CAPTURA
          </h1>
          <p className="text-lg sm:text-xl text-gray-700 max-w-2xl mx-auto">
            Choose your perfect visual experience <br className="sm:hidden" />
            with our premium services
          </p>
        </div>
      </header>

      {/* Main Services Section */}
      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12 sm:py-20">
        <div className="max-w-6xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            
            {/* Camera Rental Service */}
            <Link href="/rental" className="group">
              <div className="relative bg-gradient-to-br from-gray-900 via-black to-gray-900 rounded-3xl p-8 sm:p-12 overflow-hidden h-80 sm:h-96 flex flex-col justify-between transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl touch-manipulation active:scale-[0.98]">
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-4 left-4 w-16 h-16 border-2 border-white rounded-full"></div>
                  <div className="absolute bottom-8 right-8 w-24 h-24 border border-white rounded-lg rotate-12"></div>
                  <div className="absolute top-1/2 right-4 w-8 h-8 bg-white rounded-full"></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center mb-6 group-hover:bg-white/20 transition-all duration-300">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  </div>
                  
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-3 sm:mb-4 font-serif">
                    Camera Rental
            </h2>
                  <p className="text-base sm:text-lg text-gray-300 mb-6 sm:mb-8">
                    Professional equipment for photographers and content creators
            </p>
          </div>

                {/* CTA */}
                <div className="relative z-10">
                  <div className="inline-flex items-center text-white font-semibold group-hover:text-gray-200 transition-colors">
                    <span className="text-base sm:text-lg mr-3">Explore Equipment</span>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
                  </div>
                </div>
              </div>
            </Link>

            {/* Photography Service */}
            <Link href="/photography" className="group">
              <div className="relative bg-white border-2 border-gray-200 rounded-3xl p-8 sm:p-12 overflow-hidden h-80 sm:h-96 flex flex-col justify-between transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl hover:border-[#d4af37] touch-manipulation active:scale-[0.98]">
                
                {/* Background Pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-4 right-4 w-16 h-16 border-2 border-[#d4af37] rounded-full"></div>
                  <div className="absolute bottom-8 left-8 w-24 h-24 border border-black rounded-lg rotate-12"></div>
                  <div className="absolute top-1/2 left-4 w-8 h-8 bg-[#d4af37] rounded-full"></div>
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 bg-black/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-[#d4af37]/10 transition-all duration-300">
                    <svg className="w-8 h-8 sm:w-10 sm:h-10 text-black group-hover:text-[#d4af37] transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </div>
                  
                  <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-black mb-3 sm:mb-4 font-serif">
                    Photography Services
                  </h2>
                  <p className="text-base sm:text-lg text-gray-700 mb-6 sm:mb-8">
                    Capturing life's most precious moments with artistic excellence
                  </p>
                </div>

                {/* CTA */}
                <div className="relative z-10">
                  <div className="inline-flex items-center text-black font-semibold group-hover:text-[#d4af37] transition-colors">
                    <span className="text-base sm:text-lg mr-3">View Portfolio</span>
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 transform group-hover:translate-x-2 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </div>
                </div>
              </div>
            </Link>

          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-4 sm:px-6 lg:px-8 pb-8 sm:pb-12">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-8 text-sm text-gray-600">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              <span>+60 19-888 1706</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span>captura.my@gmail.com</span>
            </div>
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>Kuala Lumpur, Malaysia</span>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-gray-500 text-sm">
              © 2024 CAPTURA. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}