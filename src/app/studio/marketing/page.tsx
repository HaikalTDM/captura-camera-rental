'use client';

import Link from 'next/link';
import Image from 'next/image';
import StudioNavigation from '@/components/StudioNavigation';

const marketingServices = [
  {
    title: 'Social Media Management',
    description: 'End-to-end management of your social presence — content calendar, posting, engagement & analytics.',
    features: ['Content calendar planning', 'Daily posting & scheduling', 'Community engagement', 'Monthly analytics reports'],
    price: 'From RM1,500/mo',
  },
  {
    title: 'Content Strategy',
    description: 'Data-driven content strategy that aligns with your brand goals and audience behavior.',
    features: ['Brand audit & positioning', 'Content pillar development', 'Campaign planning', 'Competitor analysis'],
    price: 'From RM800',
  },
  {
    title: 'UGC Production',
    description: 'Authentic user-generated-style content that builds trust and drives conversions.',
    features: ['Script & concept development', 'Talent sourcing (if needed)', 'Professional shooting', 'Platform-optimized edits'],
    price: 'From RM600',
  },
  {
    title: 'Paid Ads Creative',
    description: 'Scroll-stopping video and photo assets optimized for Meta, TikTok & Google Ads.',
    features: ['Ad creative strategy', 'Multiple format variations', 'A/B test versions', 'Performance-optimized'],
    price: 'From RM900',
  },
];

const packages = [
  {
    name: 'Starter',
    price: 'RM1,500',
    period: '/month',
    description: 'For small businesses getting started with professional content.',
    features: [
      '8 social media posts/month',
      'Basic content calendar',
      '2 short-form videos',
      'Monthly performance report',
      'WhatsApp support',
    ],
  },
  {
    name: 'Growth',
    price: 'RM3,000',
    period: '/month',
    description: 'For brands ready to scale their digital presence.',
    features: [
      '16 social media posts/month',
      'Full content strategy',
      '4 short-form videos',
      '1 long-form video',
      'Community management',
      'Bi-weekly analytics',
      'Priority support',
    ],
    isPopular: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    period: '',
    description: 'Full-service creative partnership for established brands.',
    features: [
      'Unlimited content production',
      'Dedicated account manager',
      'Multi-platform strategy',
      'Paid ads management',
      'Monthly brand shoots',
      'Real-time reporting dashboard',
      'Same-day support',
    ],
  },
];

export default function StudioMarketingPage() {
  return (
    <div className="min-h-screen bg-white">
      <StudioNavigation />

      {/* Hero Section */}
      <section className="relative py-20 sm:py-28 lg:py-36 bg-black overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-black to-black"></div>
        <div className="absolute inset-0 opacity-15">
          <div className="absolute top-10 left-20 w-80 h-80 bg-emerald-500/30 rounded-full blur-[100px]"></div>
          <div className="absolute bottom-20 right-10 w-64 h-64 bg-[#d4af37]/20 rounded-full blur-[80px]"></div>
        </div>

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-white/40 mb-8">
            <Link href="/studio" className="hover:text-[#d4af37] transition-colors">Studio</Link>
            <span>/</span>
            <span className="text-white/70">Marketing</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold text-white mb-6 sm:mb-8 font-serif leading-[1.1]">
            Brand
            <br />
            <span className="text-emerald-400 italic">Amplified</span>
          </h1>
          <div className="w-16 sm:w-24 h-px bg-emerald-400 mx-auto mb-6 sm:mb-8"></div>
          <p className="text-lg sm:text-xl text-white/60 max-w-2xl mx-auto mb-12 leading-relaxed">
            Strategic content marketing that grows your audience, builds trust, 
            and drives real business results.
          </p>

          <button
            onClick={() => {
              const message = "Hi! I'm interested in your marketing services. Can we discuss my brand's needs?";
              window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
            }}
            className="px-8 py-4 bg-emerald-500 text-white font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-emerald-400 transition-all duration-300 transform hover:scale-105 shadow-lg shadow-emerald-500/20"
          >
            Get a Strategy Call
          </button>
        </div>
      </section>

      {/* Services Grid */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-black mb-4 font-serif">What We Offer</h2>
            <div className="w-16 h-px bg-emerald-400 mx-auto mb-6"></div>
            <p className="text-black/60 text-lg max-w-2xl mx-auto">
              Comprehensive marketing solutions to grow your brand online.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {marketingServices.map((service) => (
              <div key={service.title} className="bg-white rounded-2xl border border-gray-200 p-8 hover:shadow-xl hover:border-emerald-200 transition-all duration-300 group">
                <h3 className="text-xl font-bold text-black mb-3 font-serif group-hover:text-emerald-600 transition-colors">{service.title}</h3>
                <p className="text-black/60 text-sm mb-5 leading-relaxed">{service.description}</p>
                <ul className="space-y-2 mb-6">
                  {service.features.map((f, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                      <span className="text-black/70">{f}</span>
                    </li>
                  ))}
                </ul>
                <div className="text-lg font-bold text-emerald-600">{service.price}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Packages */}
      <section className="py-16 sm:py-24 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <h2 className="text-3xl sm:text-5xl font-bold text-black mb-4 font-serif">Monthly Retainers</h2>
            <div className="w-16 h-px bg-emerald-400 mx-auto mb-6"></div>
            <p className="text-black/60 text-lg max-w-2xl mx-auto">
              Ongoing creative partnerships that scale with your brand.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {packages.map((pkg) => (
              <div
                key={pkg.name}
                className={`bg-white rounded-2xl border-2 p-8 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 ${
                  pkg.isPopular ? 'border-emerald-400 ring-2 ring-emerald-400/20' : 'border-gray-200 hover:border-emerald-300'
                }`}
              >
                {pkg.isPopular && (
                  <div className="text-center mb-4">
                    <span className="bg-emerald-500 text-white px-4 py-1 text-xs font-bold uppercase tracking-widest rounded-full">
                      Most Popular
                    </span>
                  </div>
                )}
                <div className="text-center mb-6">
                  <h3 className="text-2xl font-bold text-black mb-2 font-serif">{pkg.name}</h3>
                  <div className="text-3xl font-bold text-emerald-500">
                    {pkg.price}<span className="text-base text-black/40 font-normal">{pkg.period}</span>
                  </div>
                </div>
                <p className="text-black/60 text-sm text-center mb-6">{pkg.description}</p>
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((f, i) => (
                    <li key={i} className="flex items-start text-sm">
                      <svg className="w-4 h-4 text-emerald-400 mt-0.5 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-black/70">{f}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => {
                    const message = `Hi! I'm interested in the ${pkg.name} marketing package. Can we discuss?`;
                    window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="w-full py-3 bg-black text-white font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-emerald-500 transition-all duration-300"
                >
                  Get Started
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-28 bg-gradient-to-br from-emerald-900 via-black to-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-5xl font-bold text-white mb-6 font-serif leading-tight">
            Ready to Grow
            <br />
            <span className="text-emerald-400 italic">Your Brand?</span>
          </h2>
          <div className="w-24 h-px bg-emerald-400 mx-auto mb-8"></div>
          <p className="text-lg text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            Let&apos;s build a content strategy that turns followers into customers.
          </p>
          <button
            onClick={() => {
              const message = "Hi! I'd like a free consultation about marketing services for my brand.";
              window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
            }}
            className="inline-flex items-center px-10 py-5 bg-emerald-500 text-white font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-emerald-400 transition-all duration-300 transform hover:scale-105"
          >
            Free Consultation
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
