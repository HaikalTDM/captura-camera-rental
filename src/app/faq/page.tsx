'use client';

import { useState } from 'react';
import Link from 'next/link';
import PhotographyNavigation from '@/components/PhotographyNavigation';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'booking' | 'pricing' | 'services' | 'delivery' | 'general';
}

const faqData: FAQItem[] = [
  // Booking Questions
  {
    id: '1',
    category: 'booking',
    question: 'How far in advance should I book?',
    answer: 'We recommend booking at least 2-3 months in advance, especially for weddings and major events. However, we can sometimes accommodate last-minute bookings depending on availability. Contact us to check your preferred date.'
  },
  {
    id: '2',
    category: 'booking',
    question: 'What is your cancellation policy?',
    answer: 'A non-refundable deposit is required to secure your date. Date changes are allowed subject to availability. The remaining balance must be paid up to 7 days before the event. For cancellations, please contact us to discuss options.'
  },
  {
    id: '3',
    category: 'booking',
    question: 'Do you travel outside Seri Kembangan?',
    answer: 'Yes! Our standard coverage area is within 30km of Seri Kembangan. For locations beyond this, additional travel charges may apply. We\'re happy to travel anywhere for your special event.'
  },

  // Pricing Questions
  {
    id: '4',
    category: 'pricing',
    question: 'Are your prices negotiable?',
    answer: 'Yes, our prices are flexible depending on your budget, event length, and specific requirements. We believe everyone deserves beautiful photography, so let\'s discuss what works best for you.'
  },
  {
    id: '5',
    category: 'pricing',
    question: 'What\'s included in the package price?',
    answer: 'All packages include unlimited shots during the coverage period, professional editing of highlights, and delivery via Google Drive. Some packages also include outdoor sessions. Check our package comparison for detailed features.'
  },
  {
    id: '6',
    category: 'pricing',
    question: 'Do you offer payment plans?',
    answer: 'Yes! We require a deposit to secure your date, and the remaining balance can be paid anytime up to 7 days before your event. We can also discuss custom payment arrangements for larger packages.'
  },

  // Services Questions
  {
    id: '7',
    category: 'services',
    question: 'What types of events do you photograph?',
    answer: 'We specialize in weddings (nikah, sanding, engagement), corporate events, graduations, portrait sessions, and private events. Each event type has tailored packages to suit your specific needs.'
  },
  {
    id: '8',
    category: 'services',
    question: 'Do you provide both main and second shooters?',
    answer: 'Yes! We offer both main shooter and second shooter services. Second shooters are perfect for capturing different angles and moments, especially during weddings and large events.'
  },
  {
    id: '9',
    category: 'services',
    question: 'Can I request specific shots or styles?',
    answer: 'Absolutely! We encourage you to share your vision, preferred styles, must-have shots, and any special requests. Communication before the event ensures we capture exactly what you envision.'
  },

  // Delivery Questions
  {
    id: '10',
    category: 'delivery',
    question: 'How long until I receive my photos?',
    answer: 'Edited photos are delivered via Google Drive within 1 week after your event. For urgent requests or rush delivery, additional charges may apply. We\'ll keep you updated throughout the editing process.'
  },
  {
    id: '11',
    category: 'delivery',
    question: 'How many edited photos will I receive?',
    answer: 'You\'ll receive professionally edited highlights from your event. The exact number varies by package and event duration, but we ensure all key moments and best shots are included and beautifully edited.'
  },
  {
    id: '12',
    category: 'delivery',
    question: 'Can I get unedited/raw photos?',
    answer: 'Our standard packages include edited highlights as we believe in delivering only our best work. However, if you specifically need raw files, we can discuss this as an add-on service.'
  },

  // General Questions
  {
    id: '13',
    category: 'general',
    question: 'What equipment do you use?',
    answer: 'We use professional-grade cameras, lenses, and lighting equipment to ensure the highest quality photos in any condition. Our gear is regularly maintained and we always bring backup equipment to every shoot.'
  },
  {
    id: '14',
    category: 'general',
    question: 'Do you have insurance?',
    answer: 'Yes, we carry professional liability insurance for all our photography services. Your event and our equipment are protected, giving you peace of mind on your special day.'
  },
  {
    id: '15',
    category: 'general',
    question: 'Can we meet before the event?',
    answer: 'We highly recommend a pre-event consultation, especially for weddings. This helps us understand your vision, discuss the timeline, scout locations, and ensure we\'re perfectly prepared for your big day.'
  }
];

const categories = [
  { id: 'all', name: 'All Questions', icon: '❓' },
  { id: 'booking', name: 'Booking', icon: '📅' },
  { id: 'pricing', name: 'Pricing', icon: '💰' },
  { id: 'services', name: 'Services', icon: '📸' },
  { id: 'delivery', name: 'Delivery', icon: '📤' },
  { id: 'general', name: 'General', icon: '💬' }
];

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState<'all' | 'booking' | 'pricing' | 'services' | 'delivery' | 'general'>('all');
  const [openItems, setOpenItems] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFAQs = faqData.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleItem = (id: string) => {
    setOpenItems(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Photography Navigation */}
      <PhotographyNavigation />

      {/* Hero Section */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-bold mb-6 sm:mb-8 font-serif text-black leading-tight">
            Frequently
            <br />
            <span className="italic">Asked Questions</span>
          </h1>
          <div className="w-16 sm:w-24 h-px bg-[#d4af37] mx-auto mb-6 sm:mb-8"></div>
          <p className="text-lg sm:text-xl text-black/80 mb-3 sm:mb-4 font-medium">
            Everything you need to know
          </p>
          <p className="text-base sm:text-lg text-black/60 max-w-3xl mx-auto mb-12 sm:mb-16 leading-relaxed px-4">
            Find answers to common questions about our photography services, booking process, pricing, and more.
            Can't find what you're looking for? Contact us directly.
          </p>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto mb-8">
            <div className="relative">
              <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-black/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Search questions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border-2 border-[#d4af37]/20 rounded-xl focus:border-[#d4af37] focus:outline-none transition-colors text-lg text-black"
              />
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Category Filter */}
          <div className="flex flex-wrap justify-center gap-4 mb-16">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id as any)}
                className={`flex items-center space-x-2 px-6 py-3 text-sm font-bold uppercase tracking-widest rounded-full border-2 transition-all duration-300 ${
                  activeCategory === category.id
                    ? 'bg-[#d4af37] text-black border-[#d4af37]'
                    : 'bg-white text-black border-[#d4af37]/30 hover:border-[#d4af37] hover:text-[#d4af37]'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {filteredFAQs.length === 0 ? (
              <div className="text-center py-12">
                <svg className="w-16 h-16 text-black/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0118 12c0-4.418-3.582-8-8-8s-8 3.582-8 8c0 2.027.756 3.877 2 5.291" />
                </svg>
                <p className="text-black/60">No questions found matching your search.</p>
              </div>
            ) : (
              filteredFAQs.map((faq) => (
                <div
                  key={faq.id}
                  className="bg-white rounded-2xl border border-[#d4af37]/10 shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300"
                >
                  <button
                    onClick={() => toggleItem(faq.id)}
                    className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-[#d4af37]/5 transition-colors"
                  >
                    <h3 className="font-bold text-black text-lg pr-4">
                      {faq.question}
                    </h3>
                    <svg
                      className={`w-6 h-6 text-[#d4af37] transform transition-transform duration-300 flex-shrink-0 ${
                        openItems.includes(faq.id) ? 'rotate-180' : ''
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div
                    className={`overflow-hidden transition-all duration-300 ${
                      openItems.includes(faq.id) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                    }`}
                  >
                    <div className="px-8 pb-6">
                      <div className="w-full h-px bg-[#d4af37]/20 mb-4"></div>
                      <p className="text-black/80 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Still Have Questions CTA */}
          <div className="text-center mt-20">
            <div className="bg-white rounded-2xl p-12 shadow-xl border border-[#d4af37]/20">
              <h3 className="text-3xl font-bold text-black mb-4 font-serif">Still Have Questions?</h3>
              <p className="text-black/60 mb-8 max-w-2xl mx-auto">
                Can't find the answer you're looking for? We're here to help! Contact us directly and we'll get back to you as soon as possible.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => {
                    const message = "Hi! I have some questions about your photography services. Can you help me?";
                    window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
                  }}
                  className="inline-flex items-center px-8 py-4 bg-[#d4af37] text-black font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#d4af37]/90 transition-all duration-300 transform hover:scale-105"
                >
                  <svg className="w-5 h-5 mr-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.687"/>
                  </svg>
                  WhatsApp Us
                </button>
                <Link
                  href="/photography"
                  className="inline-flex items-center px-8 py-4 bg-black text-white font-bold text-sm uppercase tracking-widest rounded-lg hover:bg-[#d4af37] hover:text-black transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  </svg>
                  Book Now
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}