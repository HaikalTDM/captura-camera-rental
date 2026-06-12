'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

const stockImg = {
  rental: 'https://images.unsplash.com/photo-1502920917128-1aa500764cbd?w=900&q=80&auto=format&fit=crop',
  studio: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=900&q=80&auto=format&fit=crop',
};

function FadeIn({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div
      className={`opacity-0 animate-gateway-fade-in ${className}`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: 'forwards' }}
    >
      {children}
    </div>
  );
}

export default function GatewayHome() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/95 backdrop-blur-sm shadow-sm border-b border-stone-100'
            : 'bg-white'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-10 lg:px-16 py-3 sm:py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="relative w-7 h-7 sm:w-8 sm:h-8 group-hover:opacity-90 transition-opacity">
              <Image
                src="/images/captura_logo_big.png"
                alt="CAPTURA"
                fill
                sizes="32px"
                className="object-contain"
              />
            </div>
            <div>
              <span className="text-base sm:text-lg font-bold text-stone-900 font-serif tracking-tight">
                CAPTURA
              </span>
            </div>
          </Link>
          <p className="text-[10px] text-stone-400 uppercase tracking-[0.3em] font-medium hidden sm:block">
            Selayang &middot; KL
          </p>
        </div>
      </header>

      {/* Main */}
      <main className="flex-1">
        {/* Hero */}
        <section className="px-4 sm:px-10 lg:px-16 pt-8 sm:pt-16 md:pt-20 pb-8 sm:pb-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Large centered logo */}
            <FadeIn delay={0}>
              <div className="relative w-16 h-16 sm:w-24 sm:h-24 md:w-28 md:h-28 mx-auto">
                <Image
                  src="/images/captura_logo_big.png"
                  alt="CAPTURA"
                  fill
                  sizes="(max-width: 640px) 64px, (max-width: 1024px) 96px, 112px"
                  className="object-contain"
                  priority
                />
              </div>
            </FadeIn>

            {/* Eyebrow */}
            <FadeIn delay={150}>
              <p className="text-[#a08520] text-[10px] sm:text-xs tracking-[0.4em] uppercase font-medium mt-4 sm:mt-8 mb-4">
                Camera Rentals &middot; Wedding Films &middot; Photography
              </p>
            </FadeIn>

            {/* Headline */}
            <FadeIn delay={300}>
              <h1 className="text-[2.25rem] sm:text-[3.5rem] lg:text-[4.25rem] font-serif text-stone-900 leading-[1.05] mb-3">
                Beautiful gear.
              </h1>
            </FadeIn>

            {/* Subheadline */}
            <FadeIn delay={450}>
              <h2 className="text-[1.5rem] sm:text-[2.25rem] lg:text-[2.75rem] font-serif italic text-stone-500 mb-6">
                Stories worth keeping.
              </h2>
            </FadeIn>

            {/* Body */}
            <FadeIn delay={600}>
              <p className="text-stone-500 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                Rent professional cameras or hire us to capture your day.
                Two ways to make your moments unforgettable.
              </p>
            </FadeIn>
          </div>
        </section>

        {/* Service Cards */}
        <section className="px-4 sm:px-10 lg:px-16 pb-12 sm:pb-24">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
              {/* Camera Rental */}
              <FadeIn delay={750}>
                <Link href="/rental" className="group block">
                  <div className="relative aspect-[3/2] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stockImg.rental}
                      alt="Camera rental"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-1 mt-3 sm:mt-5">
                    <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-2">
                      Equipment
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-serif text-stone-900 leading-tight mb-2">
                      Camera Rental
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                      DJI Osmo Pocket 3, Action 5 Pro, Insta360 X5 &amp; more.
                      Daily and weekly rates with same-day pickup in KL.
                    </p>
                    <p className="text-[#a08520] text-xs font-bold mb-1">From RM50/day</p>
                    <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-stone-900 border-b border-stone-900 pb-1 group-hover:text-[#a08520] group-hover:border-[#a08520] transition-colors">
                      Browse equipment &rarr;
                    </span>
                  </div>
                </Link>
              </FadeIn>

              {/* Creative Studio */}
              <FadeIn delay={900}>
                <Link href="/studio" className="group block">
                  <div className="relative aspect-[3/2] sm:aspect-[4/5] rounded-2xl overflow-hidden bg-stone-100 shadow-sm group-hover:shadow-md transition-shadow duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stockImg.studio}
                      alt="Creative studio"
                      className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700"
                      loading="lazy"
                    />
                  </div>
                  <div className="px-1 mt-3 sm:mt-5">
                    <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-2">
                      Wedding Films &amp; Photography
                    </p>
                    <h3 className="text-2xl sm:text-3xl font-serif text-stone-900 leading-tight mb-2">
                      Creative Studio
                    </h3>
                    <p className="text-stone-500 text-sm leading-relaxed mb-3">
                      Cinematic wedding films and photography for nikah, sanding,
                      and life&apos;s most meaningful moments.
                    </p>
                    <p className="text-[#a08520] text-xs font-bold italic mb-1">Stories worth telling.</p>
                    <span className="text-[10px] tracking-[0.3em] uppercase font-bold text-stone-900 border-b border-stone-900 pb-1 group-hover:text-[#a08520] group-hover:border-[#a08520] transition-colors">
                      Explore studio &rarr;
                    </span>
                  </div>
                </Link>
              </FadeIn>
            </div>
          </div>
        </section>

        {/* Testimonial */}
        <section className="px-4 sm:px-10 lg:px-16 pb-12 sm:pb-24">
          <FadeIn delay={1050}>
            <div className="max-w-2xl mx-auto text-center">
              <blockquote className="text-lg sm:text-xl lg:text-2xl font-serif italic text-stone-600 leading-relaxed mb-4">
                &ldquo;They captured moments we didn&apos;t even know happened. Worth every ringgit.&rdquo;
              </blockquote>
              <p className="text-[#a08520] text-[10px] tracking-[0.3em] uppercase font-bold">
                &mdash; Nurul &amp; Hafiz, Wedding 2025
              </p>
            </div>
          </FadeIn>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#1a1612] px-4 sm:px-10 lg:px-16 py-8 sm:py-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative w-7 h-7">
                <Image
                  src="/images/captura_logo_big.png"
                  alt="CAPTURA"
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
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-6 text-xs text-white/30">
              <a href="tel:+60177464121" className="hover:text-white/60 transition-colors">+60 17-746 4121</a>
              <a href="mailto:captura.my@gmail.com" className="hover:text-white/60 transition-colors">captura.my@gmail.com</a>
              <span>Selayang, KL</span>
            </div>
          </div>
          <div className="pt-6 mt-6 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-white/25 tracking-wider uppercase">
            <span>&copy; {new Date().getFullYear()} CAPTURA. All rights reserved.</span>
            <span>Made with care in Kuala Lumpur</span>
          </div>
        </div>
      </footer>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/60177464121?text=Hi%20CAPTURA%2C%20I%27d%20like%20to%20know%20more%20about%20your%20services"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Chat on WhatsApp"
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-50 w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center whatsapp-pulse"
      >
        <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>
    </div>
  );
}
