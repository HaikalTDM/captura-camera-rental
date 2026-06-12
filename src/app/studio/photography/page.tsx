'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StudioNavigation from '@/components/StudioNavigation';

// Stock images — Unsplash (free for commercial use)
const stockImg = {
  hero: 'https://images.unsplash.com/photo-1606216794074-735e91aa2c92?w=1400&q=80&auto=format&fit=crop',
  heroSmall: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80&auto=format&fit=crop',
  nikah: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80&auto=format&fit=crop',
  sanding: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80&auto=format&fit=crop',
  tunang: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80&auto=format&fit=crop',
  portrait: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80&auto=format&fit=crop',
  gallery1: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=600&q=80&auto=format&fit=crop',
  gallery2: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80&auto=format&fit=crop',
  gallery3: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=600&q=80&auto=format&fit=crop',
  gallery4: 'https://images.unsplash.com/photo-1606800052052-a08af7148866?w=600&q=80&auto=format&fit=crop',
};

const coverageTypes = [
  { name: 'Nikah', desc: 'Solemnization ceremony coverage', img: stockImg.nikah },
  { name: 'Sanding', desc: 'Reception & dais photography', img: stockImg.sanding },
  { name: 'Tunang', desc: 'Engagement session', img: stockImg.tunang },
  { name: 'Portraits', desc: 'Pre-wedding & couple sessions', img: stockImg.portrait },
];

const packages = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'RM450',
    duration: 'Nikah · 3 Hours',
    description: 'Perfect for intimate solemnization ceremonies.',
    features: [
      'Up to 3 hours coverage',
      'Outdoor session included',
      'Unlimited shots',
      '50+ edited highlights',
      'Online gallery delivery',
      '1-week turnaround',
    ],
  },
  {
    id: 'popular',
    name: 'Sanding',
    price: 'RM650',
    duration: '5 Hours · Most Booked',
    description: 'Full reception coverage with cinematic editing.',
    features: [
      'Up to 5 hours coverage',
      'Outdoor session included',
      'Unlimited shots',
      '100+ edited highlights',
      'Online gallery delivery',
      '1-week turnaround',
      'Same-day preview teaser',
    ],
    isPopular: true,
  },
  {
    id: 'full-day',
    name: 'Full Day',
    price: 'RM950',
    duration: 'Nikah + Sanding',
    description: 'Complete coverage from morning to night.',
    features: [
      'Both ceremonies covered',
      'Outdoor session included',
      'Unlimited shots',
      '200+ edited highlights',
      'Online gallery delivery',
      '1-week turnaround',
      'Same-day preview teaser',
      'Custom highlight reel',
    ],
  },
];

const faqs = [
  { q: 'How far in advance should I book?', a: 'We recommend 2-3 months ahead for weddings. Popular dates fill up fast, especially weekends in peak wedding seasons (March-June, October-December).' },
  { q: 'Do you cover areas outside KL?', a: 'Yes. Our base is in Selayang / Kuala Lumpur and we cover all of KL & most of Selangor as standard. Travel beyond 30km incurs an additional fee — we\'ll quote transparently upfront.' },
  { q: 'When will I receive my photos?', a: 'Edited highlights are delivered within 1 week via online gallery. Same-day preview teasers are included with Sanding and Full Day packages.' },
  { q: 'Can I customize a package?', a: 'Absolutely. The packages above are starting points — message us with your specific needs and we\'ll tailor a quote that fits your day.' },
  { q: 'What if it rains?', a: 'We\'ve got it covered. We bring backup gear, plan for indoor alternatives, and our team has shot through plenty of Malaysian downpours. Your day will look beautiful regardless.' },
];

export default function StudioPhotographyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleWA = (msg: string) => {
    window.open(`https://wa.me/60177464121?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#fdfcfa]">
      <StudioNavigation />

      {/* HERO — clear value prop, single primary CTA */}
      <section className="relative bg-[#fdfcfa] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-12 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left: copy */}
            <div className="lg:col-span-6">
              <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-6">
                Wedding Photography &middot; KL
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-900 leading-[1.05] mb-6">
                Beautiful photos<br />
                of <span className="italic text-[#a08520]">your</span> wedding.
              </h1>
              <p className="text-stone-500 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                Cinematic photography for nikah, sanding, tunang, and everything in between.
                Honest pricing, fast delivery, and frames that feel like memories.
              </p>

              {/* Primary CTA */}
              <div className="flex flex-wrap items-center gap-4 mb-10">
                <button
                  onClick={() => handleWA("Hi! I'd like to book a photography session. Can we discuss?")}
                  className="px-7 py-3.5 bg-stone-900 text-white font-semibold text-sm rounded-full hover:bg-[#a08520] transition-all duration-300"
                >
                  Check availability
                </button>
                <a
                  href="#packages"
                  className="text-[10px] tracking-[0.3em] uppercase font-bold text-stone-700 border-b border-stone-700 pb-1 hover:text-[#a08520] hover:border-[#a08520] transition-colors"
                >
                  View packages &rarr;
                </a>
              </div>

              {/* Quick trust signals */}
              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-stone-400">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" /></svg>
                  50+ weddings captured
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" /></svg>
                  1-week delivery
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" /></svg>
                  KL & Selangor coverage
                </span>
              </div>
            </div>

            {/* Right: hero image */}
            <div className="lg:col-span-6">
              <div className="relative">
                <div className="aspect-[4/5] rounded-sm overflow-hidden bg-stone-200 shadow-xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stockImg.hero}
                    alt="Wedding photography"
                    className="w-full h-full object-cover"
                    loading="eager"
                  />
                </div>
                {/* Floating small image accent */}
                <div className="absolute -bottom-8 -left-8 w-32 sm:w-40 aspect-square rounded-sm overflow-hidden bg-stone-200 shadow-xl border-4 border-[#fdfcfa] hidden md:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stockImg.heroSmall} alt="Wedding moment" className="w-full h-full object-cover" />
                </div>
                {/* Gold star accent */}
                <div className="absolute -top-4 -right-4 hidden md:block">
                  <svg className="w-10 h-10 text-[#d4af37]/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COVERAGE TYPES — visual scannable cards */}
      <section className="bg-[#f5f1e8] px-6 sm:px-10 lg:px-16 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">What we cover</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-stone-900">
              Every part of your <span className="italic">day.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {coverageTypes.map((item) => (
              <div key={item.name} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-sm overflow-hidden bg-stone-200 shadow-md mb-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                </div>
                <h3 className="text-lg sm:text-xl font-serif text-stone-900 mb-1">{item.name}</h3>
                <p className="text-stone-500 text-xs sm:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* GALLERY PREVIEW */}
      <section className="bg-[#fdfcfa] px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between mb-10 gap-4">
            <div>
              <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">Recent work</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-stone-900">
                Real moments, <span className="italic">real couples.</span>
              </h2>
            </div>
            <Link
              href="/studio/portfolio"
              className="text-[10px] tracking-[0.3em] uppercase font-bold text-stone-700 border-b border-stone-700 pb-1 hover:text-[#a08520] hover:border-[#a08520] transition-colors self-start sm:self-end"
            >
              See full portfolio &rarr;
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[stockImg.gallery1, stockImg.gallery2, stockImg.gallery3, stockImg.gallery4].map((src, i) => (
              <div
                key={i}
                className={`rounded-sm overflow-hidden bg-stone-200 shadow-md ${
                  i === 0 || i === 3 ? 'aspect-[3/4]' : 'aspect-square lg:aspect-[3/4] lg:mt-8'
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
        </div>
      </section>

      {/* PACKAGES — 3-tier comparison */}
      <section id="packages" className="bg-[#f5f1e8] px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">Investment</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-stone-900 mb-4">
              Honest <span className="italic">pricing.</span>
            </h2>
            <p className="text-stone-500 text-base max-w-md mx-auto">
              Pick the package that fits your day. Every package can be customized — just message us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl border-2 overflow-hidden flex flex-col transition-all hover:shadow-xl ${
                  pkg.isPopular
                    ? 'border-[#d4af37] shadow-lg md:scale-105'
                    : 'border-stone-200'
                }`}
              >
                {pkg.isPopular && (
                  <div className="bg-[#d4af37] text-black text-[10px] font-bold uppercase tracking-[0.3em] py-2 text-center">
                    Most Booked
                  </div>
                )}
                <div className="p-8 flex flex-col flex-1">
                  <h3 className="text-2xl font-serif text-stone-900 mb-1">{pkg.name}</h3>
                  <p className="text-stone-400 text-xs uppercase tracking-wider mb-6">{pkg.duration}</p>

                  <div className="mb-6">
                    <p className="text-4xl font-serif text-stone-900 mb-1">{pkg.price}</p>
                    <p className="text-stone-400 text-xs">starting price</p>
                  </div>

                  <p className="text-stone-500 text-sm leading-relaxed mb-6 pb-6 border-b border-stone-100">
                    {pkg.description}
                  </p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {pkg.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-stone-600">
                        <svg className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleWA(`Hi! I'm interested in the ${pkg.name} package (${pkg.price}). Can we discuss?`)}
                    className={`w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      pkg.isPopular
                        ? 'bg-stone-900 text-white hover:bg-[#a08520]'
                        : 'bg-stone-100 text-stone-900 hover:bg-stone-900 hover:text-white'
                    }`}
                  >
                    Book this package
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10 text-center">
            <Link
              href="/studio/photography/packages"
              className="inline-block text-[10px] tracking-[0.3em] uppercase font-bold text-stone-700 border-b border-stone-700 pb-1 hover:text-[#a08520] hover:border-[#a08520] transition-colors"
            >
              See all packages &amp; add-ons &rarr;
            </Link>
          </div>
        </div>
      </section>

      {/* PROCESS — simple 3-step */}
      <section className="bg-[#fdfcfa] px-6 sm:px-10 lg:px-16 py-16 sm:py-20">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900">
              Booking is <span className="italic">simple.</span>
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 sm:gap-12">
            {[
              { step: '01', title: 'Reach out', body: 'Send us a WhatsApp with your date and any questions. We reply within 24 hours.' },
              { step: '02', title: 'Confirm date', body: 'Pay a small deposit to lock in your date. We send a contract for your records.' },
              { step: '03', title: 'Show up & smile', body: 'On the day, just be present. We handle the rest and deliver in 1 week.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <p className="text-5xl font-serif text-[#d4af37]/40 mb-4">{item.step}</p>
                <h3 className="text-xl font-serif text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIAL */}
      <section className="bg-[#1a1612] px-6 sm:px-10 lg:px-16 py-20 sm:py-24 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 256 256\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.85\' numOctaves=\'4\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }}></div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="flex justify-center gap-1 mb-8">
            {[...Array(5)].map((_, i) => (
              <svg key={i} className="w-5 h-5 text-[#d4af37]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <blockquote className="text-2xl sm:text-3xl font-serif italic text-white/85 leading-relaxed mb-8">
            &ldquo;The team made us feel so comfortable. They captured emotions we didn&apos;t
            even know we had on our faces. Worth every ringgit.&rdquo;
          </blockquote>
          <p className="text-[#d4af37] text-xs tracking-[0.3em] uppercase font-bold">
            &mdash; Aisha &amp; Farhan, Sanding 2025
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#fdfcfa] px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-3">Common questions</p>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900">
              Things couples often <span className="italic">ask.</span>
            </h2>
          </div>
          <div className="space-y-3">
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} className="bg-white border border-stone-200 rounded-lg overflow-hidden">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left hover:bg-stone-50 transition-colors"
                  >
                    <span className="text-stone-900 font-medium text-sm sm:text-base">{faq.q}</span>
                    <svg
                      className={`w-5 h-5 text-[#a08520] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5">
                      <p className="text-stone-500 text-sm leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-[#f5f1e8] px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        <div className="max-w-3xl mx-auto text-center">
          <svg className="w-8 h-8 text-[#d4af37]/60 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
          </svg>
          <p className="text-[#a08520] text-[10px] tracking-[0.4em] uppercase font-medium mb-4">Ready when you are</p>
          <h2 className="text-3xl sm:text-5xl font-serif text-stone-900 mb-6 leading-tight">
            Let&apos;s capture your <span className="italic text-[#a08520]">day.</span>
          </h2>
          <p className="text-stone-500 text-base sm:text-lg leading-relaxed mb-10">
            Tell us about your wedding. We&apos;ll send a custom quote within 24 hours.
          </p>
          <button
            onClick={() => handleWA("Hi! I'd like to discuss photography for my wedding.")}
            className="inline-flex items-center gap-2 px-10 py-4 bg-stone-900 text-white text-xs tracking-[0.3em] uppercase font-bold rounded-full hover:bg-[#a08520] transition-colors"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Message us on WhatsApp
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1a1612] px-6 sm:px-10 lg:px-16 py-10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7">
              <Image src="/images/captura_logo_big.png" alt="Captura" fill className="object-contain" />
            </div>
            <span className="text-sm font-bold text-white/70 font-serif">CAPTURA</span>
            <span className="text-white/30 text-xs">/ Photography</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <span>+60 17-746 4121</span>
            <span>KL, Malaysia</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}


