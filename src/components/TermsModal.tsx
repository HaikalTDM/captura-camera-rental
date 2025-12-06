'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

interface TermsModalProps {
  isOpen: boolean;
  onAccept: () => void;
  onCancel: () => void;
}

const termsContent = {
  en: {
    title: "Terms & Conditions",
    agreementText: "I have read and agree to the Terms & Conditions.",
    content: `
      <div class="tnc-header">
        <h3>Captura Camera Rental Terms & Conditions</h3>
      </div>

      <div class="tnc-section">
        <h3>1. General Terms</h3>
        <p>1.1. By renting equipment from Captura, the Renter agrees to comply with all terms and conditions outlined herein.</p>
        <p>1.2. The Renter must be at least 18 years old and provide a valid IC/Passport for verification.</p>
        <p>1.3. Captura reserves the right to refuse rental service to any individual at its sole discretion.</p>
      </div>

      <div class="tnc-section">
        <h3>2. Rental Period & Fees</h3>
        <p>2.1. The rental period begins from the agreed-upon pickup time and ends at the designated return time.</p>
        <p>2.2. Rental fees must be paid in full before the equipment is handed over.</p>
        <p>2.3. Any extension of the rental period must be requested in advance and is subject to additional charges.</p>
        <p>2.4. Late returns will incur a penalty of RM10 per hour or RM50 per day.</p>
      </div>

      <div class="tnc-section">
        <h3>3. Security Deposit</h3>
        <p>3.1. A refundable security deposit of RM100 is required upon pickup.</p>
        <p>3.2. A refundable booking deposit of RM50 is required.</p>
        <p>3.3. The deposit will be refunded upon return of the equipment, subject to an inspection confirming no damages or missing accessories.</p>
        <p>3.4. If the equipment is damaged, lost, or stolen, the deposit may be partially or fully forfeited to cover repair or replacement costs.</p>
      </div>

      <div class="tnc-section">
        <h3>4. Equipment Use & Liability</h3>
        <p>4.1. The Renter is fully responsible for the equipment from the time of pickup until its return.</p>
        <p>4.2. The equipment must not be used for unlawful activities or in hazardous conditions.</p>
        <p>4.3. The Renter must take reasonable care to prevent damage, loss, or theft of the equipment.</p>
        <p>4.4. Any technical issues or malfunctions must be reported to Captura immediately.</p>
      </div>

      <div class="tnc-section">
        <h3>5. Damage, Loss & Replacement Costs</h3>
        <p>5.1. If the equipment is returned damaged, the Renter is responsible for repair costs.</p>
        <p>5.2. If the equipment is damaged beyond repair or lost, the Renter is liable for the full replacement cost (up to RM3600).</p>
        <p>5.3. The Renter must not attempt to repair or tamper with the equipment.</p>
      </div>

      <div class="tnc-section">
        <h3>6. Cancellations & Refunds</h3>
        <p>6.1. Cancellations made at least 24 hours before the rental period are eligible for a full refund.</p>
        <p>6.2. Cancellations made within less than 24 hours will incur a 50% charge of the rental fee.</p>
        <p>6.3. Booking deposit will be burned if cancel in anytime.</p>
        <p>6.4. No refunds will be issued for early returns.</p>
      </div>

      <div class="tnc-section">
        <h3>7. Pickup, Return & Delivery</h3>
        <p>7.1. The Renter may self-pickup the equipment or opt for delivery (RM10–RM20 via Lalamove/GrabExpress).</p>
        <p>7.2. The Renter is responsible for ensuring safe transportation of the equipment.</p>
        <p>7.3. Equipment must be returned to the agreed-upon location at the specified time.</p>
      </div>

      <div class="tnc-section">
        <h3>8. Privacy & Data Protection</h3>
        <p>8.1. Captura respects the privacy of its customers and will not share personal information without consent.</p>
        <p>8.2. Any personal information provided is used solely for verification and rental processing.</p>
      </div>

      <div class="tnc-section">
        <h3>9. Agreement & Legal Compliance</h3>
        <p>9.1. By renting from Captura, the Renter acknowledges and agrees to all terms stated above.</p>
        <p>9.2. Failure to comply with these terms may result in legal action.</p>
        <p>9.3. This agreement is governed by the laws of Malaysia.</p>
        <p><strong>Captura reserves the right to amend these terms at any time without prior notice.</strong></p>
      </div>
    `
  },
  ms: {
    title: "Terma & Syarat",
    agreementText: "Saya telah membaca dan bersetuju dengan Terma & Syarat.",
    content: `
      <div class="tnc-header">
        <h3>Terma & Syarat Sewa Kamera Captura</h3>
      </div>

      <div class="tnc-section">
        <h3>1. Terma Am</h3>
        <p>1.1. Dengan menyewa peralatan daripada Captura, Penyewa bersetuju untuk mematuhi semua terma dan syarat yang dinyatakan di sini.</p>
        <p>1.2. Penyewa mestilah berumur sekurang-kurangnya 18 tahun dan menyediakan IC/Pasport yang sah untuk pengesahan.</p>
        <p>1.3. Captura berhak menolak perkhidmatan sewaan kepada mana-mana individu atas budi bicara mutlak.</p>
      </div>

      <div class="tnc-section">
        <h3>2. Tempoh & Yuran Sewa</h3>
        <p>2.1. Tempoh sewaan bermula dari masa pengambilan yang dipersetujui dan berakhir pada masa pemulangan yang ditetapkan.</p>
        <p>2.2. Bayaran sewaan mesti dibayar sepenuhnya sebelum peralatan diserahkan.</p>
        <p>2.3. Sebarang lanjutan tempoh sewaan mesti diminta lebih awal dan tertakluk kepada caj tambahan.</p>
        <p>2.4. Pemulangan lewat akan dikenakan denda RM10 sejam atau RM50 sehari.</p>
      </div>

      <div class="tnc-section">
        <h3>3. Deposit Keselamatan</h3>
        <p>3.1. Deposit keselamatan RM100 yang boleh dikembalikan diperlukan semasa pengambilan.</p>
        <p>3.2. Deposit tempahan RM50 yang boleh dikembalikan juga diperlukan.</p>
        <p>3.3. Deposit akan dikembalikan selepas peralatan dipulangkan, tertakluk kepada pemeriksaan tiada kerosakan atau kehilangan aksesori.</p>
        <p>3.4. Jika peralatan rosak, hilang, atau dicuri, deposit mungkin ditolak sebahagian atau sepenuhnya untuk menampung kos baik pulih atau penggantian.</p>
      </div>

      <div class="tnc-section">
        <h3>4. Penggunaan & Tanggungjawab Peralatan</h3>
        <p>4.1. Penyewa bertanggungjawab sepenuhnya terhadap peralatan dari masa pengambilan hingga pemulangan.</p>
        <p>4.2. Peralatan tidak boleh digunakan untuk aktiviti haram atau dalam keadaan berbahaya.</p>
        <p>4.3. Penyewa mesti menjaga peralatan dengan baik bagi mengelakkan kerosakan, kehilangan, atau kecurian.</p>
        <p>4.4. Sebarang masalah teknikal mesti dilaporkan segera kepada Captura.</p>
      </div>

      <div class="tnc-section">
        <h3>5. Kerosakan, Kehilangan & Kos Gantian</h3>
        <p>5.1. Jika peralatan dipulangkan dalam keadaan rosak, Penyewa bertanggungjawab untuk kos baik pulih.</p>
        <p>5.2. Jika peralatan rosak teruk atau hilang, Penyewa perlu membayar kos penggantian penuh (sehingga RM3600).</p>
        <p>5.3. Penyewa tidak dibenarkan membaiki atau mengubah suai peralatan sendiri.</p>
      </div>

      <div class="tnc-section">
        <h3>6. Pembatalan & Bayaran Balik</h3>
        <p>6.1. Pembatalan sekurang-kurangnya 24 jam sebelum tempoh sewaan layak untuk bayaran balik penuh.</p>
        <p>6.2. Pembatalan dalam tempoh kurang 24 jam akan dikenakan caj 50% daripada yuran sewaan.</p>
        <p>6.3. Deposit tempahan akan hangus jika pembatalan dibuat pada bila-bila masa.</p>
        <p>6.4. Tiada bayaran balik untuk pemulangan awal.</p>
      </div>

      <div class="tnc-section">
        <h3>7. Pengambilan, Pemulangan & Penghantaran</h3>
        <p>7.1. Penyewa boleh mengambil sendiri peralatan atau memilih penghantaran (RM10–RM20 melalui Lalamove/GrabExpress).</p>
        <p>7.2. Penyewa bertanggungjawab memastikan penghantaran selamat.</p>
        <p>7.3. Peralatan mesti dipulangkan ke lokasi yang dipersetujui pada masa yang ditetapkan.</p>
      </div>

      <div class="tnc-section">
        <h3>8. Privasi & Perlindungan Data</h3>
        <p>8.1. Captura menghormati privasi pelanggan dan tidak akan berkongsi maklumat peribadi tanpa kebenaran.</p>
        <p>8.2. Maklumat peribadi digunakan hanya untuk pengesahan dan proses sewaan.</p>
      </div>

      <div class="tnc-section">
        <h3>9. Persetujuan & Pematuhan Undang-Undang</h3>
        <p>9.1. Dengan menyewa daripada Captura, Penyewa bersetuju dengan semua syarat di atas.</p>
        <p>9.2. Kegagalan mematuhi terma ini boleh menyebabkan tindakan undang-undang.</p>
        <p>9.3. Perjanjian ini tertakluk kepada undang-undang Malaysia.</p>
        <p><strong>Captura berhak meminda terma ini pada bila-bila masa tanpa notis awal.</strong></p>
      </div>
    `
  }
};

export default function TermsModal({ isOpen, onAccept, onCancel }: TermsModalProps) {
  const [currentLang, setCurrentLang] = useState<'en' | 'ms'>('en');
  const [isAgreed, setIsAgreed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Prevent body scroll when modal is open
  useEffect(() => {
    try {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
    } catch (e) {
      // Ignore DOM errors
    }

    return () => {
      try {
        document.body.style.overflow = '';
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const currentContent = termsContent[currentLang];

  const handleLanguageChange = (lang: 'en' | 'ms') => {
    setCurrentLang(lang);
  };

  const handleAccept = () => {
    if (isAgreed) {
      onAccept();
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 z-[9999] overflow-y-auto"
      onClick={(e) => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div
        className="bg-zinc-950 rounded-2xl border border-white/10 max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col my-8 shadow-2xl relative animate-fadeInUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-white/5 bg-zinc-950/95 sticky top-0 z-10 backdrop-blur">
          <h2 className="text-2xl font-black text-white tracking-tight">{currentContent.title}</h2>
          <div className="flex items-center space-x-4">
            {/* Language Toggle */}
            <div className="flex bg-zinc-800 rounded-lg border border-white/5 p-1">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${currentLang === 'en'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
                  }`}
              >
                🇬🇧 EN
              </button>
              <button
                onClick={() => handleLanguageChange('ms')}
                className={`px-3 py-1.5 text-xs font-bold rounded-md transition-all ${currentLang === 'ms'
                  ? 'bg-white text-black shadow-sm'
                  : 'text-zinc-400 hover:text-white'
                  }`}
              >
                🇲🇾 MS
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onCancel}
              className="text-zinc-500 hover:text-white transition-colors p-2 hover:bg-white/5 rounded-full"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-zinc-900/50 bg-zinc-950">
          <div
            className="prose prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: currentContent.content }}
            style={{
              fontSize: '15px',
              lineHeight: '1.75'
            }}
          />
        </div>

        {/* Footer */}
        <div className="border-t border-white/5 p-6 bg-zinc-950/95 backdrop-blur z-10">
          {/* Agreement Checkbox */}
          <div className="flex items-start space-x-3 mb-4 p-4 bg-zinc-900 rounded-xl border border-white/10 hover:border-white/20 transition-colors group cursor-pointer" onClick={() => setIsAgreed(!isAgreed)}>
            <div className={`mt-1 h-5 w-5 rounded border flex items-center justify-center transition-all ${isAgreed ? 'bg-white border-white' : 'border-zinc-600 group-hover:border-zinc-400'}`}>
              {isAgreed && (
                <svg className="w-3.5 h-3.5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <label className="text-sm text-zinc-300 font-medium cursor-pointer select-none group-hover:text-white transition-colors flex-1">
              {currentContent.agreementText}
            </label>
          </div>

          {!isAgreed && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 animate-pulse">
              <span className="text-lg">⚠️</span>
              <p className="text-xs font-bold text-red-400 uppercase tracking-wide">
                Agreement Required to Proceed
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3">
            <button
              onClick={onCancel}
              className="px-6 py-3 border border-white/10 rounded-xl text-zinc-400 font-bold hover:text-white hover:bg-white/5 transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleAccept}
              disabled={!isAgreed}
              className={`px-8 py-3 rounded-xl font-black text-sm transition-all duration-200 flex items-center gap-2 ${isAgreed
                ? 'bg-white text-black hover:bg-zinc-200 shadow-[0_0_20px_rgba(255,255,255,0.2)] transform hover:-translate-y-0.5'
                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed border border-white/5'
                }`}
            >
              {isAgreed ? (
                <>
                  <span>Continue Booking</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </>
              ) : 'Agree to Continue'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        /* Consistent Dark Theme Typography - Using :global to target innerHTML */
        .prose :global(h3) {
          color: #ffffff !important;
          font-weight: 800 !important;
          margin-top: 2.5rem !important;
          margin-bottom: 1rem !important;
          font-size: 1.25rem !important;
          letter-spacing: -0.01em !important;
        }
        
        .prose :global(p) {
          color: #e4e4e7 !important; /* zinc-200 - Very bright gray */
          margin-bottom: 1rem !important;
          line-height: 1.75 !important;
        }

        .prose :global(strong) {
          color: #ffffff !important;
        }
        
        :global(.tnc-section) {
          margin-bottom: 2rem;
        }
        
        /* Banner Header Style */
        :global(.tnc-section:first-child h3), :global(.tnc-header h3) {
          margin-top: 0 !important;
          color: #ffffff !important;
          font-size: 1.75rem !important;
          text-align: center;
          padding-bottom: 2rem;
          border-bottom: 1px solid rgba(255,255,255,0.2) !important;
          margin-bottom: 2.5rem !important;
          text-transform: uppercase;
          letter-spacing: 0.05em !important;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>,
    document.body
  );
}
