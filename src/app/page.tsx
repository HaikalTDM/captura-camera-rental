'use client';

import Image from 'next/image';
import Link from 'next/link';

// Stock images — Unsplash (free for commercial use)
const stockImg = {
  rental: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=80&auto=format&fit=crop',
  studio: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&q=80&auto=format&fit=crop',
  detail: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80&auto=format&fit=crop',
};

export default function GatewayHome() {
  return (
    <div className="min-h-screen bg-[#fdfcfa] flex flex-col">
      {/* Header */}
      <header className="px-6 sm:px-10 lg:px-16 pt-8 sm:pt-12">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 sm:w-12 sm:h-12">
              <Image
                src="/images/captura_logo_big.png"
                alt="Captura"
                fill
                sizes="48px"
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-stone-900 font-serif tracking-tight">
                CAPTURA
              </h1>
              <p className="text-[10px] text-stone-400 uppercase tracking-[0.3em] font-medium">
                Selayang &middot; KL
              </p>
            </div>
          </div>
          <p className="hidden md:block text-xs text-stone-400 uppercase tracking-[0.3em]">
            Est. 2024
          </p>
        </div>
      </header>

      {/* HERO */}
      <main className="flex-1 px-6 sm:px-10 lg:px-16 pt-10 sm:pt-16 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto relative">
          {/* Decorative gold star — top right */}
          <div className="absolute -top-4 right-0 hidden lg:block">
            <svg className="w-10 h-10 text-[#d4af37]/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
            </svg>
          </div>

          {/* Centered editorial heading */}
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[#a08520] text-[10px] sm:text-xs tracking-[0.4em] uppercase font-medium mb-6">
              Camera Rentals &middot; Wedding Films &middot; Photography
            </p>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-stone-900 leading-[1.05] mb-4">
              Beautiful gear.
            </h1>
            <h2 className="text-2xl sm:text-4xl lg:text-5xl font-serif italic text-stone-500 mb-6">
              Stories worth keeping.
            </h2>
            <p className="text-stone-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
              Rent professional cameras or hire us to capture your day.
              Two ways to make your moments unforgettable.
            </p>
          </div>

          {/* Two paths — asymmetric editorial cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 max-w-6xl mx-auto">
            {/* Camera Rental */}
            <Link href="/rental" className="group block">
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-stone-200 shadow-md mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stockImg.rental}
                  alt="Camera rental"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <p className="text-[#d4af37] text-[10px] tracking-[0.4em] uppercase font-medium mb-2">
                    Equipment
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-serif text-white leading-tight mb-2">
                    Camera Rental
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm">
                    From RM50/day
                  </p>
                </div>
              </div>
              <div className="px-1">
                <p className="text-stone-500 text-sm leading-relaxed mb-3">
                  DJI Osmo Pocket 3, Action 5 Pro, Insta360 X5 &amp; more.
                  Daily and weekly rates with same-day pickup in KL.
                </p>
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-stone-900 border-b border-stone-900 pb-1 group-hover:text-[#a08520] group-hover:border-[#a08520] transition-colors">
                  Browse equipment &rarr;
                </span>
              </div>
            </Link>

            {/* Creative Studio — offset down for asymmetry */}
            <Link href="/studio" className="group block md:mt-16">
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-stone-200 shadow-md mb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stockImg.studio}
                  alt="Creative studio"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent"></div>
                <div className="absolute top-4 right-4">
                  <svg className="w-6 h-6 text-[#d4af37]/80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
                  </svg>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                  <p className="text-[#d4af37] text-[10px] tracking-[0.4em] uppercase font-medium mb-2">
                    Wedding Films &amp; Photography
                  </p>
                  <h3 className="text-3xl sm:text-4xl font-serif text-white leading-tight mb-2">
                    Creative Studio
                  </h3>
                  <p className="text-white/70 text-xs sm:text-sm italic">
                    Stories worth telling.
                  </p>
                </div>
              </div>
              <div className="px-1">
                <p className="text-stone-500 text-sm leading-relaxed mb-3">
                  Cinematic wedding films and photography for nikah, sanding,
                  and life&apos;s most meaningful moments.
                </p>
                <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-stone-900 border-b border-stone-900 pb-1 group-hover:text-[#a08520] group-hover:border-[#a08520] transition-colors">
                  Explore studio &rarr;
                </span>
              </div>
            </Link>
          </div>

          {/* Editorial testimonial — bottom */}
          <div className="mt-16 sm:mt-24 max-w-3xl mx-auto text-center">
            <svg className="w-6 h-6 text-[#d4af37]/50 mx-auto mb-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
            </svg>
            <blockquote className="text-lg sm:text-xl lg:text-2xl font-serif italic text-stone-600 leading-relaxed mb-4">
              &ldquo;They captured moments we didn&apos;t even know happened. Worth every ringgit.&rdquo;
            </blockquote>
            <p className="text-[#a08520] text-[10px] tracking-[0.3em] uppercase font-bold">
              &mdash; Nurul &amp; Hafiz, Wedding 2025
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1612] px-6 sm:px-10 lg:px-16 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-7 h-7">
                <Image
                  src="/images/captura_logo_big.png"
                  alt="Captura"
                  fill
                  sizes="28px"
                  className="object-contain"
                />
              </div>
              <div>
                <span className="text-sm font-bold text-white/80 font-serif">CAPTURA</span>
                <p className="text-white/30 text-[10px] uppercase tracking-[0.3em] mt-0.5">
                  Beautiful moments, captured.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/30">
              <a href="tel:+60177464121" className="hover:text-white/60 transition-colors">+60 17-746 4121</a>
              <a href="mailto:captura.my@gmail.com" className="hover:text-white/60 transition-colors hidden sm:inline">captura.my@gmail.com</a>
              <span>Selayang, KL</span>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-white/25 tracking-wider uppercase">
            <span>&copy; {new Date().getFullYear()} Captura. All rights reserved.</span>
            <span>Made with care in Kuala Lumpur</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
