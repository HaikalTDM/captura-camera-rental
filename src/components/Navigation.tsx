'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const handleCamerasClick = () => {
    setIsMenuOpen(false);

    // If we're not on the rental page, navigate to rental first
    if (pathname !== '/rental') {
      router.push('/rental#cameras');
      return;
    }

    // If we're on the rental page, just scroll to cameras section
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
    <nav className="bg-black sticky top-0 z-40 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/rental" className="flex items-center space-x-3 group">
              <div className="relative w-10 h-10 group-hover:scale-110 transition-transform duration-300">
                <Image
                  src="/images/captura_logo_big.png"
                  alt="Captura Logo"
                  fill
                  className="object-contain brightness-0 invert"
                />
              </div>
              <div>
                <span className="text-2xl font-bold text-white group-hover:text-gray-300 transition-colors">
                  CAPTURA
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-center space-x-1">
              <button
                onClick={handleCamerasClick}
                className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                Cameras
              </button>
              <Link
                href="/rental/gallery"
                className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                Gallery
              </Link>
              <Link
                href="/rental/how-to-book"
                className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                How to Book
              </Link>
              <Link
                href="/rental/support"
                className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200"
              >
                Support
              </Link>
              
              {/* Contact Button */}
              <a
                href="https://wa.me/60177464121"
                target="_blank"
                rel="noopener noreferrer"
                className="ml-3 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-sm font-bold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 active:scale-95 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Contact</span>
              </a>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-gray-300 focus:outline-none transition-colors p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg hover:bg-white/10"
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
          <div className="md:hidden animate-modalSlideDown">
            <div className="px-2 pt-2 pb-4 space-y-2 bg-black border-t border-white/10">
              <button
                onClick={handleCamerasClick}
                className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg text-base font-semibold transition-all w-full text-left min-h-[48px] flex items-center"
              >
                📷 Cameras
              </button>
              <Link
                href="/rental/gallery"
                className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg text-base font-semibold transition-all w-full text-left min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                🖼️ Gallery
              </Link>
              <Link
                href="/rental/how-to-book"
                className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg text-base font-semibold transition-all w-full text-left min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                📖 How to Book
              </Link>
              <Link
                href="/rental/support"
                className="text-gray-300 hover:text-white hover:bg-white/10 px-4 py-3 rounded-lg text-base font-semibold transition-all w-full text-left min-h-[48px] flex items-center"
                onClick={() => setIsMenuOpen(false)}
              >
                💬 Support
              </Link>
              
              {/* Mobile Contact Button */}
              <a
                href="https://wa.me/60177464121"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full mt-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-lg text-base font-bold transition-all duration-200 hover:shadow-lg hover:shadow-blue-500/30 flex items-center justify-center space-x-2 min-h-[48px]"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>WhatsApp Us</span>
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
