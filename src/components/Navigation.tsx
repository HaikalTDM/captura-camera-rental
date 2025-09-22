'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold text-gray-900">
              CAPTURA
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-4">
              <Link
                href="/cameras"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/cameras'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cameras
              </Link>
              <Link
                href="/equipment"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/equipment'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Equipment
              </Link>
              <Link
                href="/gallery"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/gallery'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Gallery
              </Link>
              <Link
                href="/support"
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  pathname === '/support'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Support
              </Link>
              <Link
                href="/cameras"
                className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                Book Now
              </Link>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-gray-900 focus:outline-none focus:text-gray-900 transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label="Toggle menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              <Link
                href="/cameras"
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-md text-base font-medium transition-colors w-full text-left min-h-[48px] flex items-center ${
                  pathname === '/cameras'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Cameras
              </Link>
              <Link
                href="/equipment"
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-md text-base font-medium transition-colors w-full text-left min-h-[48px] flex items-center ${
                  pathname === '/equipment'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Equipment
              </Link>
              <Link
                href="/gallery"
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-md text-base font-medium transition-colors w-full text-left min-h-[48px] flex items-center ${
                  pathname === '/gallery'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Gallery
              </Link>
              <Link
                href="/support"
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-md text-base font-medium transition-colors w-full text-left min-h-[48px] flex items-center ${
                  pathname === '/support'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Support
              </Link>
              <Link
                href="/cameras"
                onClick={closeMenu}
                className="block px-4 py-3 rounded-md text-base font-medium transition-colors w-full text-left min-h-[48px] flex items-center bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700"
              >
                📷 Book Now
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
