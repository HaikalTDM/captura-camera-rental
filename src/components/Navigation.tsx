'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleCamerasClick = () => {
    setIsMenuOpen(false);

    // If we're not on the home page, navigate to home first
    if (pathname !== '/') {
      router.push('/#cameras');
      return;
    }

    // If we're on the home page, just scroll to cameras section
    const section = document.getElementById('cameras');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
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
              <button
                onClick={handleCamerasClick}
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Cameras
              </button>
              <Link
                href="/gallery"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Gallery
              </Link>
              <Link
                href="/how-to-book"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                How to Book
              </Link>
              <Link
                href="/equipment"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Equipment
              </Link>
              <Link
                href="/faq"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                FAQ
              </Link>
              <Link
                href="/support"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Support
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
              <button
                onClick={handleCamerasClick}
                className="text-gray-600 hover:text-gray-900 block px-4 py-3 rounded-md text-base font-medium transition-colors w-full text-left min-h-[48px] flex items-center"
              >
                Cameras
              </button>
              <Link
                href="/gallery"
                className="text-gray-600 hover:text-gray-900 block px-4 py-3 rounded-md text-base font-medium transition-colors w-full text-left min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Gallery
              </Link>
              <Link
                href="/how-to-book"
                className="text-gray-600 hover:text-gray-900 block px-4 py-3 rounded-md text-base font-medium transition-colors w-full text-left min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                How to Book
              </Link>
              <Link
                href="/equipment"
                className="text-gray-600 hover:text-gray-900 block px-4 py-3 rounded-md text-base font-medium transition-colors w-full text-left min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Equipment
              </Link>
              <Link
                href="/faq"
                className="text-gray-600 hover:text-gray-900 block px-4 py-3 rounded-md text-base font-medium transition-colors w-full text-left min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                FAQ
              </Link>
              <Link
                href="/support"
                className="text-gray-600 hover:text-gray-900 block px-4 py-3 rounded-md text-base font-medium transition-colors w-full text-left min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                Support
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
