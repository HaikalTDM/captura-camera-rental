'use client';

import Image from 'next/image';

export default function Footer() {
  return (
    <footer className="bg-black text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* App-Style Contact Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
          <a 
            href="https://wa.me/60177464121" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:shadow-2xl hover:shadow-emerald-500/30 rounded-2xl p-6 transition-all duration-300 active:scale-95 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.346"/>
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white/90 text-xs font-bold uppercase tracking-wider mb-1">WhatsApp</p>
                <p className="text-white text-base font-black">Chat with us</p>
              </div>
              <svg className="w-5 h-5 text-white/60 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>

          <a 
            href="tel:+60177464121" 
            className="bg-white/10 hover:bg-white/15 backdrop-blur-sm border-2 border-white/20 rounded-2xl p-6 transition-all duration-300 active:scale-95 group"
          >
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-white/70 text-xs font-bold uppercase tracking-wider mb-1">Call us</p>
                <p className="text-white text-base font-black">+60 17-746 4121</p>
              </div>
              <svg className="w-5 h-5 text-white/40 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          </a>
        </div>

        {/* Minimal Branding */}
        <div className="flex items-center justify-between mb-8 pb-8 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10">
              <Image
                src="/images/captura_logo_big.png"
                alt="Captura Logo"
                fill
                className="object-contain brightness-0 invert"
              />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">CAPTURA</h3>
              <p className="text-xs text-slate-500 font-semibold">Camera Rental KL</p>
            </div>
          </div>

          {/* Social Icons - Minimal */}
          <div className="flex gap-3">
            <a 
              href="https://www.tiktok.com/@captura.my" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="w-11 h-11 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
              aria-label="TikTok"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
              </svg>
            </a>
          </div>
        </div>

        {/* App-Style Quick Links */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <a href="#cameras" className="text-slate-400 hover:text-white transition-colors font-semibold text-sm">Cameras</a>
          <a href="/rental/gallery" className="text-slate-400 hover:text-white transition-colors font-semibold text-sm">Gallery</a>
          <a href="/rental/how-to-book" className="text-slate-400 hover:text-white transition-colors font-semibold text-sm">How to Book</a>
          <a href="/rental/support" className="text-slate-400 hover:text-white transition-colors font-semibold text-sm">Support</a>
        </div>

        {/* Bottom Row */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-white/10">
          <p className="text-slate-500 text-xs font-semibold">
            © 2024 CAPTURA • Kuala Lumpur
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-slate-500 hover:text-white text-xs font-semibold transition-colors">Privacy</a>
            <a href="#" className="text-slate-500 hover:text-white text-xs font-semibold transition-colors">Terms</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
