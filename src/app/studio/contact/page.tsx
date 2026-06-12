'use client';

import Link from 'next/link';
import Image from 'next/image';
import StudioNavigation from '@/components/StudioNavigation';

export default function StudioContactPage() {
  return (
    <div className="min-h-screen bg-white">
      <StudioNavigation />

      {/* Hero */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center space-x-2 text-sm text-black/40 mb-8">
            <Link href="/studio" className="hover:text-[#d4af37] transition-colors">Studio</Link>
            <span>/</span>
            <span className="text-black/70">Contact</span>
          </div>
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-black mb-6 font-serif">
            Let&apos;s <span className="italic text-[#d4af37]">Talk</span>
          </h1>
          <div className="w-16 h-px bg-[#d4af37] mx-auto mb-6"></div>
          <p className="text-lg text-black/60 max-w-2xl mx-auto">
            Ready to start a project? Have questions? Reach out and we&apos;ll get back to you within 24 hours.
          </p>
        </div>
      </section>

      {/* Contact Options */}
      <section className="py-12 sm:py-16 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            {/* WhatsApp */}
            <a
              href="https://wa.me/60177464121?text=Hi!%20I'd%20like%20to%20discuss%20a%20project%20with%20Captura%20Studio."
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-emerald-300 hover:shadow-lg transition-all duration-300 text-center group"
            >
              <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-emerald-500 transition-colors duration-300">
                <svg className="w-7 h-7 text-emerald-600 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
              </div>
              <h3 className="font-bold text-black mb-1">WhatsApp</h3>
              <p className="text-black/60 text-sm">+60 17-746 4121</p>
              <p className="text-emerald-600 text-xs font-medium mt-2">Fastest response</p>
            </a>

            {/* Email */}
            <a
              href="mailto:captura.my@gmail.com"
              className="bg-white rounded-2xl p-8 border border-gray-200 hover:border-[#d4af37]/30 hover:shadow-lg transition-all duration-300 text-center group"
            >
              <div className="w-14 h-14 bg-[#d4af37]/10 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-[#d4af37] transition-colors duration-300">
                <svg className="w-7 h-7 text-[#d4af37] group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="font-bold text-black mb-1">Email</h3>
              <p className="text-black/60 text-sm">captura.my@gmail.com</p>
              <p className="text-black/40 text-xs font-medium mt-2">We reply within 24hrs</p>
            </a>

            {/* Location */}
            <div className="bg-white rounded-2xl p-8 border border-gray-200 text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h3 className="font-bold text-black mb-1">Location</h3>
              <p className="text-black/60 text-sm">Selayang, Kuala Lumpur</p>
              <p className="text-black/40 text-xs font-medium mt-2">Serving all of KL & Selangor</p>
            </div>
          </div>

          {/* Quick Inquiry Buttons */}
          <div className="bg-white rounded-2xl border border-gray-200 p-8 sm:p-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 font-serif text-center">Quick Inquiry</h2>
            <p className="text-black/60 text-center mb-8">Select a service to start a conversation:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {[
                { label: 'Photography Inquiry', msg: "Hi! I'm interested in photography services.", color: 'hover:border-[#d4af37] hover:bg-[#d4af37]/5' },
                { label: 'Videography Inquiry', msg: "Hi! I'm interested in videography services.", color: 'hover:border-purple-400 hover:bg-purple-50' },
                { label: 'Marketing Inquiry', msg: "Hi! I'm interested in marketing services.", color: 'hover:border-emerald-400 hover:bg-emerald-50' },
                { label: 'Content Creation Inquiry', msg: "Hi! I'm interested in content creation services.", color: 'hover:border-amber-400 hover:bg-amber-50' },
              ].map((item) => (
                <button
                  key={item.label}
                  onClick={() => window.open(`https://wa.me/60177464121?text=${encodeURIComponent(item.msg)}`, '_blank')}
                  className={`py-4 px-6 border-2 border-gray-200 rounded-xl font-bold text-sm text-black transition-all duration-300 ${item.color}`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
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