'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { HowToBookModal, SpecsModal, FAQModal } from '@/components/MorePageModals';

export default function MorePage() {
  const router = useRouter();
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const menuSections = [
    {
      title: 'Information',
      items: [
        {
          label: 'How to Book',
          description: 'Simple booking process',
          action: () => setActiveModal('booking'),
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          ),
          color: 'from-blue-500 to-indigo-600'
        },
        {
          label: 'Equipment Specs',
          description: 'Full camera details',
          action: () => setActiveModal('specs'),
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            </svg>
          ),
          color: 'from-purple-500 to-pink-600'
        },
        {
          label: 'FAQ',
          description: 'Common questions',
          action: () => setActiveModal('faq'),
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          color: 'from-emerald-500 to-teal-600'
        },
      ]
    },
    {
      title: 'Support',
      items: [
        {
          label: 'Contact Support',
          description: '24/7 assistance',
          action: () => window.open('https://wa.me/60177464121', '_blank'),
          icon: (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          ),
          color: 'from-orange-500 to-red-600'
        },
      ]
    }
  ];

  const quickActions = [
    {
      label: 'WhatsApp Us',
      description: 'Instant chat support',
      href: 'https://wa.me/60177464121',
      external: true,
      icon: (
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      ),
      color: 'from-green-500 to-green-600'
    },
    {
      label: 'Call Us',
      description: '+60 17-746 4121',
      href: 'tel:+60177464121',
      external: true,
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      color: 'from-blue-500 to-indigo-600'
    },
  ];

  const handleNavigation = (href: string, external: boolean) => {
    if (external) {
      window.open(href, '_blank');
    } else {
      router.push(href);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 pb-24">
      <HowToBookModal
        isOpen={activeModal === 'booking'}
        onClose={() => setActiveModal(null)}
      />
      <SpecsModal
        isOpen={activeModal === 'specs'}
        onClose={() => setActiveModal(null)}
      />
      <FAQModal
        isOpen={activeModal === 'faq'}
        onClose={() => setActiveModal(null)}
      />

      {/* Header */}
      <div className="bg-zinc-950 text-white pt-16 pb-8 px-6">
        <div className="max-w-lg mx-auto">
          <h1 className="text-3xl font-black mb-2 tracking-tight">More</h1>
          <p className="text-sm text-zinc-400 font-semibold">
            Information, support & settings
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <section className="py-8 px-6">
        <div className="max-w-lg mx-auto">
          <h2 className="text-lg font-black text-white mb-4">Quick Contact</h2>

          <div className="grid grid-cols-2 gap-4">
            {quickActions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleNavigation(action.href, action.external)}
                className={`bg-gradient-to-br ${action.color} text-white rounded-2xl p-6 hover:scale-105 transition-all duration-300 active:scale-95 shadow-[0_0_20px_rgba(0,0,0,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.1)]`}
              >
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-3 backdrop-blur-sm">
                  {action.icon}
                </div>
                <div className="text-sm font-black mb-1">{action.label}</div>
                <div className="text-xs text-white/80 font-semibold">{action.description}</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Menu Sections */}
      {menuSections.map((section, sectionIndex) => (
        <section key={sectionIndex} className="py-8 px-6 bg-zinc-950">
          <div className="max-w-lg mx-auto">
            <h2 className="text-lg font-black text-white mb-4">{section.title}</h2>

            <div className="space-y-3">
              {section.items.map((item, itemIndex) => (
                <button
                  key={itemIndex}
                  onClick={item.action}
                  className="w-full bg-zinc-900 hover:bg-zinc-800 rounded-2xl p-4 transition-all duration-300 active:scale-98 border border-white/5 hover:border-white/10 group"
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg`}>
                      <div className="text-white">
                        {item.icon}
                      </div>
                    </div>

                    <div className="flex-1 text-left">
                      <div className="text-base font-black text-white mb-0.5">{item.label}</div>
                      <div className="text-xs text-zinc-400 font-semibold">{item.description}</div>
                    </div>

                    <svg className="w-5 h-5 text-zinc-600 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* About Section */}
      <section className="py-8 px-6">
        <div className="max-w-lg mx-auto">
          <div className="bg-gradient-to-br from-zinc-900 via-black to-zinc-900 text-white rounded-3xl p-6 border border-white/10 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-black tracking-tight">CAPTURA</h3>
                <p className="text-xs text-zinc-400 font-semibold">Premium Camera Rentals</p>
              </div>
            </div>

            <p className="text-sm text-zinc-400 font-semibold leading-relaxed mb-6">
              Your trusted partner for professional camera equipment in Kuala Lumpur. We provide quality cameras with full insurance and 24/7 support.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-xl font-black text-white">15+</div>
                <div className="text-xs text-zinc-500 font-bold">Customers</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-xl font-black text-white">20+</div>
                <div className="text-xs text-zinc-500 font-bold">Rentals</div>
              </div>
              <div className="text-center p-3 bg-white/5 rounded-2xl border border-white/5">
                <div className="text-xl font-black text-white">4.9</div>
                <div className="text-xs text-zinc-500 font-bold">Rating</div>
              </div>
            </div>

            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-zinc-600 font-semibold text-center uppercase tracking-wider">
                © 2025 CAPTURA • All rights reserved
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

