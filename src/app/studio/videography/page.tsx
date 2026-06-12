'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StudioNavigation from '@/components/StudioNavigation';

// Stock images — Unsplash (free for commercial use)
const stockImg = {
  hero: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?w=1400&q=80&auto=format&fit=crop',
  heroSmall: 'https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=600&q=80&auto=format&fit=crop',
  highlight: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?w=600&q=80&auto=format&fit=crop',
  fullFilm: 'https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=80&auto=format&fit=crop',
  corporate: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=600&q=80&auto=format&fit=crop',
  reels: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&q=80&auto=format&fit=crop',
  showreel: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?w=1400&q=80&auto=format&fit=crop',
  testimonialBg: 'https://images.unsplash.com/photo-1519741497674-611481863552?w=1400&q=80&auto=format&fit=crop',
};

const services = [
  { name: 'Wedding Highlight', desc: '3-5 min cinematic reel', img: stockImg.highlight, duration: '3-5 min' },
  { name: 'Full Wedding Film', desc: '15-30 min documentary', img: stockImg.fullFilm, duration: '15-30 min' },
  { name: 'Corporate Video', desc: 'Brand profiles & promos', img: stockImg.corporate, duration: '1-3 min' },
  { name: 'Social Reels', desc: 'Vertical content for IG/TikTok', img: stockImg.reels, duration: '15-60 sec' },
];

const packages = [
  {
    id: 'highlight',
    name: 'Highlight',
    price: 'RM800',
    duration: 'Wedding · Full Day',
    description: 'Cinematic 3-5 minute highlight reel of your wedding day.',
    features: [
      'Full-day coverage',
      '3-5 min cinematic edit',
      'Professional color grading',
      'Licensed music',
      'Online gallery delivery',
      '2-week turnaround',
    ],
  },
  {
    id: 'full-film',
    name: 'Full Film',
    price: 'RM1,500',
    duration: 'Wedding · Most Complete',
    description: 'Full documentary plus highlight reel — every moment preserved.',
    features: [
      'Full-day multi-camera coverage',
      '15-30 min documentary film',
      'Highlight reel included',
      'Pro color grading & audio mix',
      'Drone footage (where permitted)',
      'Online gallery delivery',
      '3-week turnaround',
    ],
    isPopular: true,
  },
  {
    id: 'corporate',
    name: 'Corporate',
    price: 'RM1,200',
    duration: 'Brand · 1-3 min',
    description: 'Professional video for company profiles, recaps & testimonials.',
    features: [
      'Half or full-day shoot',
      'Script consultation',
      'Pro lighting setup',
      'Motion graphics & titles',
      '2 revision rounds',
      'Multi-format exports',
      '2-3 week turnaround',
    ],
  },
];

const faqs = [
  { q: 'Do you provide raw footage?', a: 'Raw footage isn\'t included by default — what you receive is a polished, color-graded film. We can include raw files as an add-on if requested upfront.' },
  { q: 'How many revisions are included?', a: 'Standard packages include 2 rounds of revisions. Most films get approved on the first or second pass — we work closely with you on style direction before editing.' },
  { q: 'Can you film outdoor weddings?', a: 'Yes, and we love them. We bring backup gear and have shot through plenty of weather. Drone footage is available where local regulations permit.' },
  { q: 'How long until I receive the final film?', a: 'Highlight reels: 2 weeks. Full films: 3 weeks. We send a preview teaser the day after the wedding so you have something to share immediately.' },
  { q: 'Do you offer photo + video combo?', a: 'Yes! Combo packages give you both services with a single team coordinating coverage. Message us for tailored pricing.' },
];

export default function StudioVideographyPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const handleWA = (msg: string) => {
    window.open(`https://wa.me/60177464121?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#fdfcfa]">
      <StudioNavigation />

      {/* HERO — clear value prop with cinematic feel */}
      <section className="relative bg-[#fdfcfa] overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 sm:px-10 lg:px-16 pt-12 sm:pt-20 pb-16 sm:pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
            {/* Left: copy */}
            <div className="lg:col-span-6">
              <p className="text-purple-700 text-[10px] tracking-[0.4em] uppercase font-medium mb-6">
                Wedding Films &middot; Cinematic
              </p>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-serif text-stone-900 leading-[1.05] mb-6">
                Films that play<br />
                like <span className="italic text-purple-700">memories.</span>
              </h1>
              <p className="text-stone-500 text-base sm:text-lg leading-relaxed mb-8 max-w-md">
                Cinematic wedding films, brand videos, and social reels.
                Stories told with motion, sound, and intention.
              </p>

              <div className="flex flex-wrap items-center gap-4 mb-10">
                <button
                  onClick={() => handleWA("Hi! I'd like to book videography for my wedding. Can we discuss?")}
                  className="px-7 py-3.5 bg-stone-900 text-white font-semibold text-sm rounded-full hover:bg-purple-700 transition-all duration-300"
                >
                  Check availability
                </button>
                <a
                  href="#packages"
                  className="text-[10px] tracking-[0.3em] uppercase font-bold text-stone-700 border-b border-stone-700 pb-1 hover:text-purple-700 hover:border-purple-700 transition-colors"
                >
                  View packages &rarr;
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-xs text-stone-400">
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" /></svg>
                  4K cinematic quality
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" /></svg>
                  Pro color grading
                </span>
                <span className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" /></svg>
                  2-week delivery
                </span>
              </div>
            </div>

            {/* Right: hero with play button overlay */}
            <div className="lg:col-span-6">
              <div className="relative">
                <div className="aspect-[4/5] rounded-sm overflow-hidden bg-stone-200 shadow-xl group cursor-pointer">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={stockImg.hero}
                    alt="Wedding videography"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    loading="eager"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white/15 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/25 group-hover:scale-110 transition-all duration-500 ring-2 ring-white/30">
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="absolute -bottom-8 -left-8 w-32 sm:w-40 aspect-square rounded-sm overflow-hidden bg-stone-200 shadow-xl border-4 border-[#fdfcfa] hidden md:block">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={stockImg.heroSmall} alt="Behind the scenes" className="w-full h-full object-cover" />
                </div>
                <div className="absolute -top-4 -right-4 hidden md:block">
                  <svg className="w-10 h-10 text-purple-500/60" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SERVICES — 4 visual cards */}
      <section className="bg-[#f5f1e8] px-6 sm:px-10 lg:px-16 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-purple-700 text-[10px] tracking-[0.4em] uppercase font-medium mb-3">What we make</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-stone-900">
              Films for every <span className="italic">moment.</span>
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {services.map((item) => (
              <div key={item.name} className="group cursor-pointer">
                <div className="aspect-[3/4] rounded-sm overflow-hidden bg-stone-200 shadow-md mb-4 relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent"></div>
                  <div className="absolute top-3 right-3 px-2 py-0.5 bg-black/40 backdrop-blur-sm text-white text-[9px] tracking-wider uppercase rounded-full">
                    {item.duration}
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center ring-1 ring-white/30">
                      <svg className="w-4 h-4 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <h3 className="text-lg sm:text-xl font-serif text-stone-900 mb-1">{item.name}</h3>
                <p className="text-stone-500 text-xs sm:text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOWREEL — wide cinematic */}
      <section className="bg-[#1a1612] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
          <div className="text-center mb-10">
            <p className="text-purple-500 text-[10px] tracking-[0.4em] uppercase font-medium mb-3">Our Showreel</p>
            <h2 className="text-3xl sm:text-5xl font-serif italic text-white/85">
              See us in motion.
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
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center group-hover:bg-white/20 group-hover:scale-110 transition-all duration-500 ring-2 ring-white/20">
                <svg className="w-7 h-7 sm:w-9 sm:h-9 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            <div className="absolute bottom-5 left-6 right-6 flex items-end justify-between">
              <div>
                <p className="text-white/90 text-sm font-medium">Captura Wedding Films 2025</p>
                <p className="text-white/40 text-xs mt-0.5">Coming soon &middot; 2:30 min</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PACKAGES — 3-tier comparison */}
      <section id="packages" className="bg-[#f5f1e8] px-6 sm:px-10 lg:px-16 py-20 sm:py-28">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <p className="text-purple-700 text-[10px] tracking-[0.4em] uppercase font-medium mb-3">Investment</p>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-serif text-stone-900 mb-4">
              Honest <span className="italic">pricing.</span>
            </h2>
            <p className="text-stone-500 text-base max-w-md mx-auto">
              Transparent packages. Custom quotes available — just message us with your needs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {packages.map((pkg) => (
              <div
                key={pkg.id}
                className={`bg-white rounded-2xl border-2 overflow-hidden flex flex-col transition-all hover:shadow-xl ${
                  pkg.isPopular
                    ? 'border-purple-500 shadow-lg md:scale-105'
                    : 'border-stone-200'
                }`}
              >
                {pkg.isPopular && (
                  <div className="bg-purple-500 text-white text-[10px] font-bold uppercase tracking-[0.3em] py-2 text-center">
                    Most Complete
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
                    onClick={() => handleWA(`Hi! I'm interested in the ${pkg.name} video package (${pkg.price}). Can we discuss?`)}
                    className={`w-full py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                      pkg.isPopular
                        ? 'bg-stone-900 text-white hover:bg-purple-700'
                        : 'bg-stone-100 text-stone-900 hover:bg-stone-900 hover:text-white'
                    }`}
                  >
                    Book this package
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROCESS — 4-step workflow */}
      <section className="bg-[#fdfcfa] px-6 sm:px-10 lg:px-16 py-16 sm:py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-purple-700 text-[10px] tracking-[0.4em] uppercase font-medium mb-3">How it works</p>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900">
              From concept to <span className="italic">final cut.</span>
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
            {[
              { step: '01', title: 'Pre-production', body: 'Concept, shot planning, timeline & logistics.' },
              { step: '02', title: 'Production', body: 'Multi-camera shoot with cinema-grade gear.' },
              { step: '03', title: 'Post-production', body: 'Editing, color grading, sound design.' },
              { step: '04', title: 'Delivery', body: 'Final review & multi-format export.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <p className="text-4xl sm:text-5xl font-serif text-purple-500/40 mb-3">{item.step}</p>
                <h3 className="text-base sm:text-lg font-serif text-stone-900 mb-2">{item.title}</h3>
                <p className="text-stone-500 text-xs sm:text-sm leading-relaxed">{item.body}</p>
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
              <svg key={i} className="w-5 h-5 text-purple-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <blockquote className="text-2xl sm:text-3xl font-serif italic text-white/85 leading-relaxed mb-8">
            &ldquo;Watching our highlight reel still gives us goosebumps. They captured
            moments we didn&apos;t even know happened &mdash; it&apos;s like reliving the day.&rdquo;
          </blockquote>
          <p className="text-purple-500 text-xs tracking-[0.3em] uppercase font-bold">
            &mdash; Nurul &amp; Hafiz, Wedding 2025
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-[#fdfcfa] px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <p className="text-purple-700 text-[10px] tracking-[0.4em] uppercase font-medium mb-3">Common questions</p>
            <h2 className="text-3xl sm:text-4xl font-serif text-stone-900">
              Things clients often <span className="italic">ask.</span>
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
                      className={`w-5 h-5 text-purple-700 flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
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
          <svg className="w-8 h-8 text-purple-500/60 mx-auto mb-8" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2l1.5 6.5L20 10l-6.5 1.5L12 18l-1.5-6.5L4 10l6.5-1.5L12 2z" />
          </svg>
          <p className="text-purple-700 text-[10px] tracking-[0.4em] uppercase font-medium mb-4">Ready when you are</p>
          <h2 className="text-3xl sm:text-5xl font-serif text-stone-900 mb-6 leading-tight">
            Let&apos;s tell your <span className="italic text-purple-700">story.</span>
          </h2>
          <p className="text-stone-500 text-base sm:text-lg leading-relaxed mb-10">
            Tell us about your project. We&apos;ll send a custom quote within 24 hours.
          </p>
          <button
            onClick={() => handleWA("Hi! I'd like to discuss a videography project.")}
            className="inline-flex items-center gap-2 px-10 py-4 bg-stone-900 text-white text-xs tracking-[0.3em] uppercase font-bold rounded-full hover:bg-purple-700 transition-colors"
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
            <span className="text-white/30 text-xs">/ Videography</span>
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

