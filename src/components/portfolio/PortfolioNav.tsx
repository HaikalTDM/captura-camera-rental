'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';

export default function PortfolioNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const pathname = usePathname();

  const isPortfolio = pathname.startsWith('/portfolio');
  const inquiryHref = pathname === '/' ? '/portfolio#inquiry' : '#inquiry';

  return (
    <nav className="bg-black sticky top-0 z-50 shadow-lg border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
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
                Production
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-1">
            <Link
              href="/portfolio"
              className={`px-4 py-2 rounded-lg text-sm font-medium uppercase tracking-widest transition-all duration-300 ${
                isPortfolio
                  ? 'bg-[#d4af37] text-black'
                  : 'text-white/80 hover:text-white hover:bg-white/10'
              }`}
            >
              Our Work
            </Link>

            <a
              href={inquiryHref}
              className="ml-3 px-5 py-2 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#d4af37]/90 transition-all duration-300 transform hover:scale-105"
            >
              Get Quote
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden text-white hover:text-[#d4af37] transition-colors p-2"
            aria-label="Toggle menu"
            aria-expanded={isMenuOpen}
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMenuOpen && (
          <div className="lg:hidden border-t border-white/10 animate-fadeIn">
            <div className="py-4 space-y-1">
              <Link
                href="/portfolio"
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-colors ${
                  isPortfolio
                    ? 'bg-[#d4af37] text-black'
                    : 'text-white/80 hover:text-white hover:bg-white/5'
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                Our Work
              </Link>

              <a
                href={inquiryHref}
                onClick={() => setIsMenuOpen(false)}
                className="flex items-center justify-center w-[calc(100%-2rem)] mx-4 mt-2 py-3 bg-[#d4af37] text-black font-bold text-base uppercase tracking-widest rounded-lg hover:bg-[#d4af37]/90 transition-all"
              >
                Get Quote
              </a>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
