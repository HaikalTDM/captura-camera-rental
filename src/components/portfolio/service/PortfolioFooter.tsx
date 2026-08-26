'use client';

import Image from 'next/image';

export default function PortfolioFooter() {
  return (
    <footer className="bg-black px-6 sm:px-10 lg:px-16 py-12">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="relative w-7 h-7">
              <Image src="/images/captura_logo_big.png" alt="Captura" fill className="object-contain" />
            </div>
            <span className="text-sm font-bold text-white/70 font-serif">CAPTURA</span>
          </div>
          <div className="flex items-center gap-6 text-xs text-white/30">
            <span>+60 17-746 4121</span>
            <span>KL, Malaysia</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
