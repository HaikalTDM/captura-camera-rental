'use client';

import Link from 'next/link';
import Image from 'next/image';
import StudioNavigation from '@/components/StudioNavigation';

const testimonials = [
  {
    name: 'Aisha & Farhan',
    service: 'Wedding Photography',
    category: 'photography',
    quote: 'Captura captured our nikah and sanding beautifully. Every emotion, every detail — perfectly preserved. We couldn\'t be happier with the results.',
    rating: 5,
  },
  {
    name: 'Sarah M.',
    service: 'Brand Content',
    category: 'content',
    quote: 'The content they produced for our Instagram completely transformed our engagement. Professional, creative, and always on time.',
    rating: 5,
  },
  {
    name: 'Ahmad R.',
    service: 'Corporate Video',
    category: 'videography',
    quote: 'Our company profile video exceeded all expectations. The team understood our vision from day one and delivered a cinematic masterpiece.',
    rating: 5,
  },
  {
    name: 'Nurul & Hafiz',
    service: 'Wedding Film',
    category: 'videography',
    quote: 'Watching our wedding highlight reel still gives us goosebumps. They captured moments we didn\'t even know happened. Truly cinematic.',
    rating: 5,
  },
  {
    name: 'Bella Boutique',
    service: 'Social Media Marketing',
    category: 'marketing',
    quote: 'Our follower count tripled in 3 months and sales from Instagram increased by 200%. Best investment we\'ve made for our brand.',
    rating: 5,
  },
  {
    name: 'Zain K.',
    service: 'Graduation Photography',
    category: 'photography',
    quote: 'Professional, punctual, and the photos turned out amazing. My family was so impressed with the quality. Highly recommend!',
    rating: 5,
  },
];

const categoryBadge: Record<string, string> = {
  photography: 'bg-[#d4af37]/10 text-[#d4af37]',
  videography: 'bg-purple-500/10 text-purple-500',
  marketing: 'bg-emerald-500/10 text-emerald-500',
  content: 'bg-amber-500/10 text-amber-500',
};

export default function StudioTestimonialsPage() {
  return (
    <div className="min-h-screen bg-white">
      <StudioNavigation />

      {/* Hero */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-black/40 mb-8">
            <Link href="/studio" className="hover:text-[#d4af37] transition-colors">Studio</Link>
            <span>/</span>
            <span className="text-black/70">Testimonials</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-black mb-6 font-serif">
            Client <span className="italic text-[#d4af37]">Love</span>
          </h1>
          <div className="w-16 h-px bg-[#d4af37] mx-auto mb-6"></div>
          <p className="text-lg text-black/60 max-w-2xl mx-auto">
            Don&apos;t just take our word for it — hear from the brands and couples we&apos;ve worked with.
          </p>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {testimonials.map((t, index) => (
              <div key={index} className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                {/* Stars */}
                <div className="flex items-center mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <svg key={i} className="w-4 h-4 text-[#d4af37]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>

                {/* Quote */}
                <p className="text-black/70 text-sm leading-relaxed mb-6 italic">
                  &ldquo;{t.quote}&rdquo;
                </p>

                {/* Author */}
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-black text-sm">{t.name}</p>
                    <span className={`inline-block mt-1 px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-full ${categoryBadge[t.category]}`}>
                      {t.service}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-serif">
            Ready to join our happy clients?
          </h2>
          <p className="text-white/60 mb-8">Let&apos;s create something you&apos;ll love.</p>
          <button
            onClick={() => {
              const message = "Hi! I've read your testimonials and I'd love to work with Captura Studio.";
              window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
            }}
            className="px-8 py-4 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#d4af37]/90 transition-all duration-300"
          >
            Get in Touch
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