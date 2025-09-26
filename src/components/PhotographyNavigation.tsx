'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function PhotographyNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const navigationItems = [
    { name: 'Home', href: '/photography', icon: '🏠' },
    { name: 'Gallery', href: '/photography/gallery', icon: '🖼️' },
    { name: 'Packages', href: '/photography/packages', icon: '📦' },
    { name: 'Testimonials', href: '/testimonials', icon: '⭐' },
    { name: 'FAQ', href: '/faq', icon: '❓' },
    { name: 'Contact', href: '/photography/contact', icon: '📞' }
  ];

  const isActive = (href: string) => {
    if (href === '/photography') {
      return pathname === '/photography';
    }
    return pathname.startsWith(href);
  };

  return (
    <nav className="bg-black sticky top-0 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/photography" className="flex items-center space-x-3 group">
            <div className="relative w-12 h-12 group-hover:scale-110 transition-transform duration-300">
              <Image
                src="/images/captura_logo_big.png"
                alt="Captura Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-2xl font-bold text-white font-serif group-hover:text-[#d4af37] transition-colors duration-300">
                CAPTURA
              </span>
              <div className="text-xs text-white/60 uppercase tracking-wider font-medium">
                Photography
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-widest transition-all duration-300 ${
                  isActive(item.href)
                    ? 'bg-[#d4af37] text-black'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                {item.name}
              </Link>
            ))}
            
            {/* Back to Landing & CTA */}
            <div className="flex items-center space-x-3">
              <Link
                href="/"
                className="px-4 py-2 text-white/80 hover:text-white border border-white/20 hover:border-white/40 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Home</span>
              </Link>
              
              <button
                onClick={() => {
                  const message = "Hi! I'm interested in your photography services. Can you provide more details?";
                  window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
                }}
                className="px-6 py-2 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#d4af37]/90 transition-all duration-300 transform hover:scale-105"
              >
                Book Now
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-white hover:text-[#d4af37] transition-colors p-2"
              aria-label="Toggle menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden border-t border-white/10">
            <div className="py-4 space-y-2">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#d4af37] text-black'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
              
              {/* Mobile Back to Landing */}
              <Link
                href="/"
                className="w-full mt-4 px-4 py-3 border border-white/20 text-white hover:bg-white/10 rounded-lg text-base font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Home</span>
              </Link>
              
              {/* Mobile CTA */}
              <button
                onClick={() => {
                  const message = "Hi! I'm interested in your photography services. Can you provide more details?";
                  window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
                  setIsMenuOpen(false);
                }}
                className="w-full mt-3 px-4 py-3 bg-[#d4af37] text-black font-bold text-base uppercase tracking-widest rounded-lg hover:bg-[#d4af37]/90 transition-all duration-300 flex items-center justify-center space-x-2"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.687"/>
                </svg>
                <span>Book Now</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
