'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import StudioNavigation from '@/components/StudioNavigation';

const faqs = [
  {
    category: 'General',
    questions: [
      { q: 'What services does Captura Studio offer?', a: 'We offer photography (weddings, events, portraits, commercial), videography (wedding films, corporate videos, social reels), marketing (social media management, content strategy, paid ads), and content creation (TikTok/Reels, product shoots, brand content days).' },
      { q: 'What areas do you cover?', a: 'We are based in Selayang, Kuala Lumpur and cover all of KL and Selangor. Coverage beyond 30km from our base may incur additional travel charges.' },
      { q: 'How do I book your services?', a: 'The easiest way is to reach out via WhatsApp at +60 17-746 4121. We\'ll discuss your needs, provide a quote, and secure your date with a deposit.' },
      { q: 'How far in advance should I book?', a: 'For weddings, we recommend booking 2-3 months in advance. For other services, 1-2 weeks notice is usually sufficient, subject to availability.' },
    ]
  },
  {
    category: 'Photography',
    questions: [
      { q: 'How long until I receive my photos?', a: 'Edited photos are typically delivered within 1 week via Google Drive. Same-day previews are available for select packages.' },
      { q: 'Do you offer second shooter services?', a: 'Yes! We offer second shooter packages for weddings that provide additional angles and coverage. See our photography packages page for details.' },
      { q: 'Can I request specific editing styles?', a: 'Absolutely. We encourage you to share reference images and style preferences during our pre-shoot consultation.' },
    ]
  },
  {
    category: 'Videography',
    questions: [
      { q: 'What\'s included in a wedding highlight film?', a: 'A 3-5 minute cinematic edit with professional color grading, licensed music, and the best moments from your day. Full-day coverage is included.' },
      { q: 'Do you provide raw footage?', a: 'Raw footage is not included in standard packages but can be arranged as an add-on for an additional fee.' },
      { q: 'How many revisions are included?', a: 'Standard packages include 2 rounds of revisions. Additional revisions can be arranged if needed.' },
    ]
  },
  {
    category: 'Marketing & Content',
    questions: [
      { q: 'What platforms do you manage?', a: 'We primarily manage Instagram, TikTok, and Facebook. LinkedIn and other platforms can be included in custom packages.' },
      { q: 'Do you provide content strategy or just production?', a: 'Both! We offer standalone content production as well as full strategy + production packages with monthly retainers.' },
      { q: 'What\'s a Brand Content Day?', a: 'A full-day shoot session where we produce a month\'s worth of content in one go — photos, videos, reels, and static posts. It\'s the most efficient way to batch content.' },
    ]
  },
  {
    category: 'Pricing & Payment',
    questions: [
      { q: 'Are your prices negotiable?', a: 'Yes, we understand every project is unique. We\'re happy to discuss custom packages that fit your budget and requirements.' },
      { q: 'What payment methods do you accept?', a: 'We accept bank transfer (FPX), online transfer, and cash. A non-refundable deposit is required to secure your booking.' },
      { q: 'Is the deposit refundable?', a: 'Deposits are non-refundable but can be transferred to a new date subject to availability.' },
    ]
  },
];

export default function StudioFAQPage() {
  const [openIndex, setOpenIndex] = useState<string | null>(null);

  const toggleFAQ = (id: string) => {
    setOpenIndex(openIndex === id ? null : id);
  };

  return (
    <div className="min-h-screen bg-white">
      <StudioNavigation />

      {/* Hero */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-black/40 mb-8">
            <Link href="/studio" className="hover:text-[#d4af37] transition-colors">Studio</Link>
            <span>/</span>
            <span className="text-black/70">FAQ</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-black mb-6 font-serif">
            Common <span className="italic text-[#d4af37]">Questions</span>
          </h1>
          <div className="w-16 h-px bg-[#d4af37] mx-auto mb-6"></div>
          <p className="text-lg text-black/60 max-w-2xl mx-auto">
            Everything you need to know about working with Captura Studio.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {faqs.map((section) => (
            <div key={section.category} className="mb-10">
              <h2 className="text-xl font-bold text-black mb-4 font-serif uppercase tracking-wide">
                {section.category}
              </h2>
              <div className="space-y-3">
                {section.questions.map((faq, i) => {
                  const id = `${section.category}-${i}`;
                  const isOpen = openIndex === id;
                  return (
                    <div key={id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                      <button
                        onClick={() => toggleFAQ(id)}
                        className="w-full flex items-center justify-between px-6 py-4 text-left hover:bg-gray-50 transition-colors"
                      >
                        <span className="font-medium text-black text-sm pr-4">{faq.q}</span>
                        <svg
                          className={`w-5 h-5 text-[#d4af37] flex-shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                          fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="px-6 pb-4">
                          <p className="text-black/60 text-sm leading-relaxed">{faq.a}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-black">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 font-serif">
            Still have questions?
          </h2>
          <p className="text-white/60 mb-8">We&apos;re happy to help. Reach out anytime.</p>
          <button
            onClick={() => {
              const message = "Hi! I have a question about Captura Studio services.";
              window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
            }}
            className="px-8 py-4 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#d4af37]/90 transition-all duration-300"
          >
            Ask Us Anything
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
