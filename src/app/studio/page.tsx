'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StudioNavigation from '@/components/StudioNavigation';

// Stock images — Unsplash (free for commercial use)
const stockImg = {
  hero1: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80&auto=format&fit=crop',
  hero2: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80&auto=format&fit=crop',
  recent1: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=900&q=80&auto=format&fit=crop',
  recent2: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=900&q=80&auto=format&fit=crop',
  grid1: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80&auto=format&fit=crop',
  grid2: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80&auto=format&fit=crop',
  grid3: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80&auto=format&fit=crop',
  showreel: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1400&q=80&auto=format&fit=crop',
};

export default function StudioPage() {
  const handleWA = (msg: string) => {
    window.open(`https://wa.me/60177464121?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#fdfcfa]">
      <StudioNavigation />

      {/* HERO — overlapping editorial intro */}
      <section className="relative bg-[#fdfcfa] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-16 sm:pt-24 pb-20 sm:pb-32 relative">
          {/* Decorative gold star — top right */}
          <div className="absolute top-12 right-12 hidden lg:block">
            <svg className="w-12 h-12 text-[#d4af37]/40" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
            </svg>
          </div>

          <div className="grid grid-cols-12 gap-4 sm:gap-6 items-center">
            {/* Left tall image */}
            <div className="col-span-5 lg:col-span-3 aspect-[3/4] rounded-sm overflow-hidden bg-stone-200 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stockImg.hero1}
                alt="Wedding rings"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>

            {/* Center text */}
            <div className="col-span-7 lg:col-span-6 text-center px-2 sm:px-6 lg:px-10">
              <p className="text-[#a08520] text-[10px] sm:text-xs tracking-[0.4em] uppercase font-medium mb-6 sm:mb-10">
                Wedding Films &middot; Photography
              </p>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-stone-900 leading-[1.05] mb-4">
                Stories worth telling.
              </h1>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-serif italic text-stone-500 mb-8 sm:mb-10 leading-snug">
                Frames that hold them forever.
              </h2>
              <button
                onClick={() => handleWA("Hi! I'd like to discuss a project with Captura Studio.")}
                className="inline-block text-[10px] sm:text-xs tracking-[0.3em] uppercase font-bold text-stone-900 border-b border-stone-900 pb-1 hover:text-[#a08520] hover:border-[#a08520] transition-colors"
              >
                Start a Project &rarr;
              </button>
            </div>

            {/* Right tall image */}
            <div className="col-span-12 lg:col-span-3 aspect-[3/4] rounded-sm overflow-hidden bg-stone-200 hidden lg:block shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stockImg.hero2}
                alt="Bride portrait"
                className="w-full h-full object-cover"
                loading="eager"
              />
            </div>
          </div>

          {/* Decorative gold star — bottom left */}
          <div className="absolute bottom-12 left-12 hidden lg:block">
            <svg className="w-8 h-8 text-[#d4af37]/30" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
            </svg>
          </div>
        </div>
      </section>

      {/* SHOWREEL — cinematic placeholder with overlay */}
      <section className="bg-[#1a1612] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
          <div className="text-center mb-10">
            <p className="text-[#d4af37] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">Showreel 2025</p>
            <h2 className="text-3xl sm:text-5xl font-serif italic text-white/80">
              A glimpse of what we do.
            </h2>
          </div>
          <div className="relative aspect-video rounded-sm overflow-hidden shadow-2xl group cursor-pointer">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={stockImg.showreel}
              alt="Showreel preview"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-black/40"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-500 ring-1 ring-white/20">
                <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
              <div>
                <p className="text-white/90 text-sm font-medium">Captura Studio Reel</p>
                <p className="text-white/40 text-xs mt-0.5">Coming soon &middot; 2:30 min</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RECENT WORK — flowing showcase */}
      <section className="bg-[#f5f1e8] px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">Recent work</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif italic text-stone-700">
              Get inspired...
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10">
            <div className="aspect-[4/5] rounded-sm overflow-hidden bg-stone-200 shadow-md">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stockImg.recent1}
                alt="Recent wedding"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="aspect-[4/5] rounded-sm overflow-hidden bg-stone-200 shadow-md md:mt-12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={stockImg.recent2}
                alt="Recent ceremony"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          </div>

          <div className="text-center mt-12">
            <Link
              href="/studio/portfolio"
              className="inline-block text-[10px] tracking-[0.3em] uppercase font-bold text-stone-900 border-b border-stone-900 pb-1 hover:text-[#a08520] hover:border-[#a08520] transition-colors"
            >
              Visit the Portfolio &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* TAGLINE 1 — Every story */}
      <section className="bg-[#fdfcfa] px-6 sm:px-10 lg:px-16 py-20 sm:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <svg className="w-6 h-6 text-[#d4af37]/50 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
          </svg>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-stone-900 mb-8 leading-tight">
            Every story is <span className="italic text-[#a08520]">unique.</span>
          </h2>
          <p className="text-stone-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            From your nikah ceremony to your sanding reception, from the first look
            to the last dance &mdash; we capture the moments that make your day yours.
            No two weddings are alike, and neither is our approach.
          </p>
          <div className="mt-12">
            <Link
              href="/studio/photography"
              className="inline-block text-[10px] tracking-[0.3em] uppercase font-bold text-stone-900 border-b border-stone-900 pb-1 hover:text-[#a08520] hover:border-[#a08520] transition-colors"
            >
              Photography Packages &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* THREE-IMAGE GRID */}
      <section className="bg-[#fdfcfa] px-6 sm:px-10 lg:px-16 pb-16 sm:pb-24">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          {[stockImg.grid1, stockImg.grid2, stockImg.grid3].map((src, i) => (
            <div
              key={i}
              className={`aspect-[3/4] rounded-sm overflow-hidden bg-stone-200 shadow-md ${
                i === 1 ? 'sm:mt-12' : ''
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                alt={`Wedding moment ${i + 1}`}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
          ))}
        </div>
      </section>

      {/* TAGLINE 2 — Cinema in motion */}
      <section className="bg-[#f5f1e8] px-6 sm:px-10 lg:px-16 py-20 sm:py-32">
        <div className="max-w-5xl mx-auto text-center">
          <svg className="w-6 h-6 text-[#d4af37]/50 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
          </svg>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-stone-900 mb-8 leading-tight">
            Cinema in <span className="italic text-[#a08520]">motion.</span>
          </h2>
          <p className="text-stone-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Wedding films that play like memories. Highlight reels you&apos;ll watch
            on every anniversary. Full ceremony films your kids will see one day.
            We craft them all with the same cinematic care.
          </p>
          <div className="mt-12">
            <Link
              href="/studio/videography"
              className="inline-block text-[10px] tracking-[0.3em] uppercase font-bold text-stone-900 border-b border-stone-900 pb-1 hover:text-[#a08520] hover:border-[#a08520] transition-colors"
            >
              Wedding Films &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* TESTIMONIAL — vintage feel */}
      <section className="bg-[#1a1612] px-6 sm:px-10 lg:px-16 py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n3\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n3)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <p className="text-[#d4af37] text-[10px] tracking-[0.4em] uppercase font-medium mb-8">Kind words</p>
          <blockquote className="text-2xl sm:text-3xl lg:text-4xl font-serif italic text-white/85 leading-relaxed mb-10">
            &ldquo;They captured moments we didn&apos;t even know happened. Watching our
            highlight reel still gives us goosebumps &mdash; it&apos;s like reliving
            the best day of our lives.&rdquo;
          </blockquote>
          <p className="text-[#d4af37] text-xs tracking-[0.3em] uppercase font-bold">
            &mdash; Nurul &amp; Hafiz
          </p>
        </div>
      </section>

      {/* SERVICES — two paths */}
      <section className="bg-[#fdfcfa] px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">What we offer</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-stone-900">
              Two ways to <span className="italic">remember.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 max-w-5xl mx-auto">
            <Link href="/studio/videography" className="group">
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-stone-200 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stockImg.showreel}
                  alt="Wedding films"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-[#d4af37] text-[10px] tracking-[0.4em] uppercase font-medium mb-2">Primary</p>
                  <h3 className="text-3xl sm:text-4xl font-serif text-white mb-2">Wedding Films</h3>
                  <p className="text-white/60 text-sm mb-4">Cinematic highlights & full-day films.</p>
                  <span className="text-white/80 text-xs tracking-wider uppercase font-bold border-b border-white/40 pb-0.5 group-hover:text-[#d4af37] group-hover:border-[#d4af37] transition-colors">
                    Explore films &rarr;
                  </span>
                </div>
              </div>
            </Link>

            <Link href="/studio/photography" className="group md:mt-12">
              <div className="relative aspect-[4/5] rounded-sm overflow-hidden bg-stone-200 shadow-md">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={stockImg.recent1}
                  alt="Photography"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-8">
                  <p className="text-[#d4af37] text-[10px] tracking-[0.4em] uppercase font-medium mb-2">Photography</p>
                  <h3 className="text-3xl sm:text-4xl font-serif text-white mb-2">Frames That Linger</h3>
                  <p className="text-white/60 text-sm mb-4">Weddings, nikah, sanding & portraits.</p>
                  <span className="text-white/80 text-xs tracking-wider uppercase font-bold border-b border-white/40 pb-0.5 group-hover:text-[#d4af37] group-hover:border-[#d4af37] transition-colors">
                    Explore photos &rarr;
                  </span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* PROCESS — three steps editorial */}
      <section className="bg-[#f5f1e8] px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">How it works</p>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif text-stone-900">
              Simple from start <span className="italic">to finish.</span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 sm:gap-12">
            {[
              { step: '01', title: 'Reach out', body: 'Tell us about your day. We&apos;ll send a tailored quote within 24 hours.' },
              { step: '02', title: 'We capture', body: 'On the day, we&apos;re there start to finish &mdash; relaxed, attentive, ready.' },
              { step: '03', title: 'You receive', body: 'Polished films and photos delivered within 1&ndash;3 weeks.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <p className="text-5xl sm:text-6xl font-serif text-[#d4af37]/40 mb-4">{item.step}</p>
                <h3 className="text-xl sm:text-2xl font-serif text-stone-900 mb-3">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: item.body }}></p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#fdfcfa] px-6 sm:px-10 lg:px-16 py-20 sm:py-32">
        <div className="max-w-4xl mx-auto text-center">
          <svg className="w-8 h-8 text-[#d4af37]/60 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
          </svg>
          <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-4">Currently booking</p>
          <h2 className="text-4xl sm:text-6xl lg:text-7xl font-serif text-stone-900 mb-6 leading-tight">
            2025 &amp; <span className="italic text-[#a08520]">2026.</span>
          </h2>
          <p className="text-stone-500 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto mb-12">
            We take a limited number of weddings each month so we can give every couple
            our full attention. Reach out early to secure your date.
          </p>
          <button
            onClick={() => handleWA("Hi! I'd like to check availability for my wedding date.")}
            className="inline-block text-[10px] tracking-[0.3em] uppercase font-bold text-white bg-stone-900 hover:bg-[#a08520] transition-colors px-10 py-4 rounded-full"
          >
            Check Availability
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1612] px-6 sm:px-10 lg:px-16 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <p className="text-[#d4af37] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">Captura Studio</p>
            <h3 className="text-2xl sm:text-3xl font-serif italic text-white/80 mb-2">Stories worth telling.</h3>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/[0.06]">
            <div className="flex items-center gap-3">
              <div className="relative w-7 h-7">
                <Image src="/images/captura_logo_big.png" alt="Captura" fill className="object-contain" />
              </div>
              <span className="text-sm font-bold text-white/70 font-serif">CAPTURA</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-white/30">
              <span>+60 17-746 4121</span>
              <span>KL, Malaysia</span>
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

