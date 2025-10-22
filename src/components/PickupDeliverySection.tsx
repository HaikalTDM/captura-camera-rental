'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function PickupDeliverySection() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'pickup' | 'delivery'>('pickup');

  // Main pickup location
  const pickupLocation = {
    lat: 3.2597,
    lng: 101.6497,
    name: 'Caltex Selayang Pandang',
    address: 'Lot 1, 2, Batu 8, Jalan Rawang, Selayang Pandang, 68100 Batu Caves, Selangor',
    hours: 'Daily: 9:00 AM - 8:00 PM',
    phone: '+60177464121'
  };

  return (
    <section id="pickup-delivery" className="py-12 sm:py-16 bg-slate-50">
      <div className="max-w-lg mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-black rounded-full mb-4">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-black mb-2">
            Pickup & Delivery
          </h2>
          <p className="text-slate-600 font-medium text-sm">
            Choose your preferred method
          </p>
        </div>

        {/* Tab Navigation - Clean & Minimal */}
        <div className="bg-white rounded-2xl p-1 shadow-sm border border-slate-200 mb-6">
          <div className="grid grid-cols-2 gap-1">
            <button
              onClick={() => setActiveTab('pickup')}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 ${
                activeTab === 'pickup'
                  ? 'bg-black text-white'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              📍 Pickup
            </button>
            <button
              onClick={() => setActiveTab('delivery')}
              className={`py-3 px-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 ${
                activeTab === 'delivery'
                  ? 'bg-black text-white'
                  : 'text-slate-600 hover:text-black'
              }`}
            >
              🚚 Delivery
            </button>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'pickup' ? (
          <div className="space-y-4">
            {/* Main Pickup Location Card */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
              {/* Location Header */}
              <div className="p-6 border-b border-slate-100">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-black text-black mb-1">{pickupLocation.name}</h3>
                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-yellow-500">⭐</span>
                      <span className="font-bold text-slate-900">3.8</span>
                      <span className="text-slate-500">• 991 reviews</span>
                    </div>
                  </div>
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                </div>

                {/* Address */}
                <div className="flex items-start gap-2 mb-3">
                  <svg className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <p className="text-sm text-slate-600 font-medium leading-relaxed">{pickupLocation.address}</p>
                </div>

                {/* Hours */}
                <div className="flex items-center gap-2 mb-3">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm font-semibold text-slate-900">{pickupLocation.hours}</p>
                </div>

                {/* Contact */}
                <a
                  href={`tel:${pickupLocation.phone}`}
                  className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  Call Location
                </a>
              </div>

              {/* Map */}
              <div className="relative">
                <div className="w-full h-80 sm:h-96">
                  <iframe
                    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3983.4279366027276!2d101.65798711138099!3d3.2432656525515404!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31cc46e263540b19%3A0x82899e19753dd951!2sCaltex%20Selayang%20Pandang!5e0!3m2!1sen!2smy!4v1758201820338!5m2!1sen!2smy"
                    width="100%"
                    height="100%"
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    title="Pickup Location Map"
                  />
                </div>
              </div>

              {/* Navigation Buttons */}
              <div className="p-4 grid grid-cols-2 gap-3 bg-slate-50">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${pickupLocation.lat},${pickupLocation.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-900 hover:border-blue-500 hover:text-blue-600 transition-all duration-200 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 0C7.31 0 3.5 3.81 3.5 8.5c0 5.25 8.5 15.5 8.5 15.5s8.5-10.25 8.5-15.5C20.5 3.81 16.69 0 12 0zm0 11.5c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                  </svg>
                  Google Maps
                </a>
                <a
                  href={`https://waze.com/ul?ll=${pickupLocation.lat},${pickupLocation.lng}&navigate=yes`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-slate-200 rounded-xl font-bold text-sm text-slate-900 hover:border-blue-500 hover:text-blue-600 transition-all duration-200 active:scale-95"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M15.47 4.36a1.26 1.26 0 00-1.37.27l-3.09 3.1-3.1-3.1a1.26 1.26 0 00-1.78 1.78l3.1 3.1-3.1 3.09a1.26 1.26 0 001.78 1.78l3.1-3.1 3.09 3.1a1.26 1.26 0 101.78-1.78l-3.1-3.1 3.1-3.09a1.26 1.26 0 00-.41-2.05z"/>
                  </svg>
                  Waze
                </a>
              </div>
            </div>

            {/* Book with Pickup CTA */}
            <button
              onClick={() => router.push('/rental/cameras')}
              className="w-full bg-black text-white font-black py-4 px-6 rounded-2xl hover:bg-slate-900 transition-all duration-200 active:scale-95 shadow-sm"
            >
              Book with Pickup →
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Delivery Options */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6">
              <h3 className="text-lg font-black text-black mb-4">Delivery Partners</h3>
              
              {/* Lalamove */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl mb-3">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🚚</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-black mb-1">Lalamove</h4>
                  <p className="text-xs text-slate-600 font-medium">Fast & reliable delivery</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>

              {/* GrabExpress */}
              <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                <div className="w-12 h-12 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">🛵</span>
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-black mb-1">GrabExpress</h4>
                  <p className="text-xs text-slate-600 font-medium">Quick motorcycle delivery</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h4 className="font-bold text-black mb-2">How Delivery Works</h4>
                  <ul className="space-y-2 text-sm text-slate-700 font-medium">
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-black">1.</span>
                      <span>Book your camera rental</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-black">2.</span>
                      <span>We'll arrange Lalamove delivery</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-black">3.</span>
                      <span>Pay delivery fee (RM10-RM20) to driver</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-blue-500 font-black">4.</span>
                      <span>Receive equipment at your address</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-white rounded-xl p-4 border border-blue-200">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-xs font-bold text-slate-900">Delivery Cost</span>
                </div>
                <p className="text-sm text-slate-700 font-semibold">RM10 - RM20</p>
                <p className="text-xs text-slate-600 mt-1">Based on distance • Paid directly to driver</p>
              </div>
            </div>

            {/* Book with Delivery CTA */}
            <button
              onClick={() => router.push('/rental/cameras')}
              className="w-full bg-black text-white font-black py-4 px-6 rounded-2xl hover:bg-slate-900 transition-all duration-200 active:scale-95 shadow-sm"
            >
              Book with Delivery →
            </button>

            {/* Contact Note */}
            <div className="text-center">
              <p className="text-xs text-slate-600 mb-2">Need help with delivery?</p>
              <a
                href={`https://wa.me/${pickupLocation.phone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
