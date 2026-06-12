'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import QuoteRequestModal from './QuoteRequestModal';

const services = [
  { name: 'Wedding Films', href: '/studio/videography', accent: 'text-purple-400' },
  { name: 'Photography', href: '/studio/photography', accent: 'text-[#d4af37]' },
];

const navigationItems = [
  { name: 'Services', href: '/studio', hasDropdown: true },
  { name: 'Portfolio', href: '/studio/portfolio' },
  { name: 'Contact', href: '/studio/contact' },
];

export default function StudioNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isServicesOpen, setIsServicesOpen] = useState(false);
  const [isServicesPinned, setIsServicesPinned] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const servicesRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (servicesRef.current && !servicesRef.current.contains(e.target as Node)) {
        setIsServicesOpen(false);
        setIsServicesPinned(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setIsServicesOpen(false);
    setIsServicesPinned(false);
  }, [pathname]);

  const isActive = (href: string) => {
    if (href === '/studio') return pathname === '/studio';
    return pathname.startsWith(href);
  };

  const isServiceActive = () => {
    return services.some(s => pathname.startsWith(s.href));
  };

  return (
    <nav className="bg-black sticky top-0 z-50 shadow-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/studio" className="flex items-center space-x-3 group">
            <div className="relative w-9 h-9 sm:w-11 sm:h-11 group-hover:scale-110 transition-transform duration-300">
              <Image
                src="/images/captura_logo_big.png"
                alt="Captura Logo"
                fill
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-white font-serif group-hover:text-[#d4af37] transition-colors duration-300">
                CAPTURA
              </span>
              <div className="text-[10px] sm:text-xs text-white/50 uppercase tracking-[0.2em] font-medium">
                Studio
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            {/* Services Dropdown */}
            <div
              ref={servicesRef}
              className="relative"
              onMouseEnter={() => { if (!isServicesPinned) setIsServicesOpen(true); }}
              onMouseLeave={() => { if (!isServicesPinned) setIsServicesOpen(false); }}
            >
              <button
                onClick={() => {
                  if (isServicesPinned) {
                    setIsServicesPinned(false);
                    setIsServicesOpen(false);
                  } else {
                    setIsServicesPinned(true);
                    setIsServicesOpen(true);
                  }
                }}
                className={`px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-widest transition-all duration-300 flex items-center space-x-1 ${
                  isServiceActive()
                    ? 'bg-[#d4af37] text-black'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
              >
                <span>Services</span>
                <svg className={`w-3.5 h-3.5 transition-transform duration-200 ${isServicesOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown Menu */}
              {isServicesOpen && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl py-2 animate-fadeIn">
                  {services.map((service) => (
                    <Link
                      key={service.name}
                      href={service.href}
                      className={`block px-5 py-3 text-sm font-medium transition-all duration-200 ${
                        pathname.startsWith(service.href)
                          ? `bg-white/10 ${service.accent}`
                          : 'text-white/70 hover:text-white hover:bg-white/5'
                      }`}
                    >
                      {service.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Other Nav Items */}
            {navigationItems.filter(item => !item.hasDropdown).map((item) => (
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

            {/* Back to Home & CTA */}
            <div className="flex items-center space-x-3 ml-2">
              <Link
                href="/"
                className="px-3 py-2 text-white/60 hover:text-white border border-white/15 hover:border-white/30 rounded-lg text-sm font-medium transition-all duration-300 flex items-center space-x-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Home</span>
              </Link>

              <button
                onClick={() => setIsQuoteModalOpen(true)}
                className="px-5 py-2 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#d4af37]/90 transition-all duration-300 transform hover:scale-105"
              >
                Get Quote
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white hover:text-[#d4af37] transition-colors p-2"
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

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/10 animate-fadeIn">
            <div className="py-4 space-y-1">
              {/* Services Section */}
              <div className="px-4 py-2 text-xs font-bold text-white/40 uppercase tracking-widest">
                Services
              </div>
              {services.map((service) => (
                <Link
                  key={service.name}
                  href={service.href}
                  className={`block px-6 py-3 rounded-lg text-base font-medium transition-colors ${
                    pathname.startsWith(service.href)
                      ? `bg-white/10 ${service.accent}`
                      : 'text-white/80 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {service.name}
                </Link>
              ))}

              <div className="my-3 border-t border-white/10"></div>

              {/* Other Pages */}
              {navigationItems.filter(item => !item.hasDropdown).map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-[#d4af37] text-black'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              <div className="my-3 border-t border-white/10"></div>

              {/* Mobile Back + CTA */}
              <Link
                href="/"
                className="flex items-center justify-center space-x-2 mx-4 py-3 border border-white/20 text-white hover:bg-white/10 rounded-lg text-base font-medium transition-all"
                onClick={() => setIsMenuOpen(false)}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Back to Home</span>
              </Link>

              <button
                onClick={() => {
                  setIsQuoteModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className="flex items-center justify-center space-x-2 w-[calc(100%-2rem)] mx-4 mt-2 py-3 bg-[#d4af37] text-black font-bold text-base uppercase tracking-widest rounded-lg hover:bg-[#d4af37]/90 transition-all"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                <span>Get Quote</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quote Request Modal */}
      <QuoteRequestModal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} />
    </nav>
  );
}
