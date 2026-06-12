'use client';

import Link from 'next/link';
import Image from 'next/image';
import StudioNavigation from '@/components/StudioNavigation';

const contentServices = [
  {
    title: 'TikTok & Reels Production',
    description: 'Scroll-stopping short-form content designed to go viral and grow your following.',
    features: ['Trend research & scripting', 'Professional shooting', 'Dynamic editing & effects', 'Platform-optimized exports'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Product Photography',
    description: 'E-commerce ready product shots that convert browsers into buyers.',
    features: ['Flat-lay & lifestyle shots', 'White background studio', '360-degree product views', 'Batch editing & retouching'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
  },
  {
    title: 'Brand Content Days',
    description: 'Full-day shoots producing a month\'s worth of content in one session.',
    features: ['Pre-shoot planning & moodboard', 'Full-day professional shoot', 'Multiple outfit/scene changes', '30+ edited assets delivered'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Podcast & Interview Setup',
    description: 'Studio-quality audio and video for podcasts, interviews, and talking-head content.',
    features: ['Professional lighting & audio', 'Multi-camera setup', 'Clip editing for social', 'Thumbnail & cover design'],
    icon: (
      <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
  },
];

const contentPackages = [
  {
    name: 'Starter Pack',
    price: 'RM500',
    description: 'Perfect for testing the waters with professional content.',
    deliverables: ['3 short-form videos (15-60s)', '5 static posts', '1 carousel design', '2-hour shoot session'],
  },
  {
    name: 'Creator Pack',
    price: 'RM1,200',
    description: 'A full content batch for serious brand builders.',
    deliverables: ['8 short-form videos', '10 static posts', '3 carousel designs', 'Full-day shoot session', 'Content calendar template', 'Caption copywriting'],
    isPopular: true,
  },
  {
    name: 'Brand Partner',
    price: 'RM2,500',
    description: 'Ongoing content partnership with monthly deliverables.',
    deliverables: ['15 short-form videos/month', '20 static posts/month', '5 carousel designs', '2 shoot days/month', 'Strategy & planning', 'Performance tracking', 'Priority turnaround'],
  },
];

export default function StudioContentCreationPage() {
  return (
    <div className="min-h-screen bg-white">
      <StudioNavigation />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 lg:py-36 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-black to-black"></div>
        <div className="absolute inset-0 opacity-15">
          <div className="absolute bottom-10 left-20 w-72 h-72 bg-amber-500/40 rounded-full blur-[100px]"></div>
          <div className="absolute top-20 right-10 w-64 h-64 bg-orange-500/20 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-white/40 mb-8">
            <Link href="/studio" className="hover:text-[#d4af37] transition-colors">Studio</Link>
            <span>/</span>
            <span className="text-white/70">Content Creation</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 sm:mb-8 font-serif leading-[1.1]">
            Feed
            <br />
            <span className="text-amber-400 italic">Ready</span>
          </h1>
          <div className="w-16 sm:w-24 h-px bg-amber-400 mx-auto mb-6 sm:mb-8"></div>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Scroll-stopping content for TikTok, Instagram, and beyond. 
            We produce, you post, your audience grows.
          </p>

          <button
            onClick={() => {
              const message = "Hi! I need content creation services for my brand. Can we discuss?";
              window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
            }}
            className="px-8 py-4 bg-amber-500 text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-amber-500/20"
          >
            Let&apos;s Create
          </button>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-black mb-4 font-serif">What We Create</h2>
            <div className="w-16 h-px bg-amber-400 mx-auto mb-6"></div>
            <p className="text-black/60 text-lg max-w-2xl mx-auto">
              Content that stops the scroll and starts conversations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {contentServices.map((service) => (
              <div key={service.title} className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl hover:border-amber-200 transition-all duration-300 group">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-5 text-amber-600 group-hover:bg-amber-500 group-hover:text-white transition-all duration-300">
                  {service.icon}
                </div>
                <h3 className="text-xl font-bold text-black mb-3 font-serif">{service.title}</h3>
                <p className="text-black/60 text-sm mb-5 leading-relaxed">{service.description}</p>
                <ul className="space-y-2">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-black/70">{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Packages Section */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-black mb-4 font-serif">Content Packages</h2>
            <div className="w-16 h-px bg-amber-400 mx-auto mb-6"></div>
            <p className="text-black/60 text-lg max-w-2xl mx-auto">
              Bundled content solutions for every stage of growth.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {contentPackages.map((pkg) => (
              <div
                key={pkg.name}
                className={`bg-white rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  pkg.isPopular ? 'border-amber-400 ring-2 ring-amber-400/20' : 'border-gray-200 hover:border-amber-300'
                }`}
              >
                {pkg.isPopular && (
                  <div className="text-center mb-4">
                    <span className="bg-amber-500 text-black px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-full">
                      Best Value
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-black mb-2 font-serif">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-amber-500">{pkg.price}</div>
                </div>
                <p className="text-black/60 text-sm text-center mb-6">{pkg.description}</p>
                <ul className="space-y-3 mb-8">
                  {pkg.deliverables.map((d, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <svg className="w-4 h-4 text-amber-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-black/70">{d}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    const message = `Hi! I'm interested in the ${pkg.name} content package (${pkg.price}). Can we discuss?`;
                    window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="w-full py-3 bg-black text-white font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-amber-500 hover:text-black transition-all duration-300"
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-amber-900 via-black to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 font-serif leading-tight">
            Content That
            <br />
            <span className="text-amber-400 italic">Converts</span>
          </h2>
          <div className="w-24 h-px bg-amber-400 mx-auto mb-8"></div>
          <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Stop struggling with content. Let us handle the creative so you can focus on running your business.
          </p>
          <button
            onClick={() => {
              const message = "Hi! I'd like to discuss content creation for my brand with Captura Studio.";
              window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
            }}
            className="inline-flex items-center px-10 py-5 bg-amber-500 text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-amber-400 transition-all duration-300 transform hover:scale-105"
          >
            Start Creating
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-black/10 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="relative w-10 h-10">
                <Image src="/images/captura_logo_big.png" alt="Captura Logo" fill className="object-contain" />
              </div>
              <span className="text-2xl font-bold text-black font-serif">CAPTURA</span>
            </div>
            <p className="text-gray-500 text-sm">&copy; {new Date().getFullYear()} CAPTURA. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
