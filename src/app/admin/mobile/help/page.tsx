'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HelpSupport() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
  }, []);

  const helpSections = [
    {
      title: 'Getting Started',
      icon: '🚀',
      items: [
        { q: 'How do I create a new booking?', a: 'Navigate to Dashboard and tap the "+" button or go to Bookings page and click "New Booking".' },
        { q: 'How do I manage camera inventory?', a: 'Go to the Cameras tab to view, add, and edit your equipment inventory.' },
        { q: 'How do I view analytics?', a: 'Tap the Analytics tab to see revenue charts and booking trends.' },
      ]
    },
    {
      title: 'Bookings',
      icon: '📅',
      items: [
        { q: 'How do I approve a booking?', a: 'Open the booking details and tap "Approve Booking". You can also mark deposits and final payments as received.' },
        { q: 'How do I cancel a booking?', a: 'Open the booking details, tap the menu (•••) and select "Cancel Booking".' },
        { q: 'What do the booking statuses mean?', a: 'Pending: Awaiting approval. Confirmed: Deposit paid. Picked Up: Equipment collected. Returned: Equipment returned. Completed: Booking finalized.' },
      ]
    },
    {
      title: 'Payments',
      icon: '💰',
      items: [
        { q: 'How do I mark a deposit as paid?', a: 'Open the booking details and toggle the "Deposit Paid" switch.' },
        { q: 'How do I mark final payment as paid?', a: 'Open the booking details and toggle the "Final Payment Paid" switch.' },
        { q: 'Can I customize deposit amounts?', a: 'Yes, go to Settings > System Settings to configure default deposit percentage.' },
      ]
    },
    {
      title: 'Notifications',
      icon: '🔔',
      items: [
        { q: 'How do I enable notifications?', a: 'Go to Settings > Notification Settings to configure which alerts you want to receive.' },
        { q: 'Can I get pickup reminders?', a: 'Yes, enable "Pickup Reminder" in Notification Settings and set how many days before to be reminded.' },
        { q: 'How do I turn off sound effects?', a: 'Go to Settings > Preferences and toggle off "Sound Effects".' },
      ]
    },
  ];

  const contactOptions = [
    {
      label: 'Email Support',
      value: 'captura.my@gmail.com',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      href: 'mailto:captura.my@gmail.com'
    },
    {
      label: 'WhatsApp Support',
      value: '+60 17-746 4121',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
      ),
      href: 'https://wa.me/60177464121'
    },
    {
      label: 'Phone Support',
      value: '+60 17-746 4121',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
        </svg>
      ),
      href: 'tel:+60177464121'
    },
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} pb-24`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 ${isDarkMode ? 'bg-slate-950' : 'bg-white'} border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
        <div className="flex items-center gap-3 px-4 h-14">
          <button
            onClick={() => router.back()}
            className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center transition-all duration-200 active:scale-95`}
          >
            <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h1 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            Help & Support
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6 space-y-4">
        {/* Contact Support */}
        <div className={`${isDarkMode ? 'bg-gradient-to-br from-blue-900/30 to-indigo-900/30 border-blue-800/50' : 'bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200'} rounded-2xl border shadow-sm p-6 animate-fadeIn`}>
          <div className="text-center mb-6">
            <div className={`w-16 h-16 ${isDarkMode ? 'bg-blue-900/50' : 'bg-blue-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
              <svg className={`w-8 h-8 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
              Need Help?
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Our support team is here to assist you
            </p>
          </div>

          <div className="space-y-3">
            {contactOptions.map((option, index) => (
              <a
                key={index}
                href={option.href}
                className={`block ${isDarkMode ? 'bg-slate-900/50 hover:bg-slate-900/70 border-slate-800' : 'bg-white hover:bg-slate-50 border-slate-200'} border rounded-xl p-4 transition-all duration-200 active:scale-95`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl flex items-center justify-center`}>
                      <div className={isDarkMode ? 'text-blue-400' : 'text-blue-600'}>
                        {option.icon}
                      </div>
                    </div>
                    <div>
                      <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {option.label}
                      </p>
                      <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {option.value}
                      </p>
                    </div>
                  </div>
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </a>
            ))}
          </div>
        </div>

        {/* FAQ Sections */}
        {helpSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`} style={{ animationDelay: `${(sectionIndex + 1) * 100}ms` }}>
            <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} flex items-center gap-3`}>
              <span className="text-2xl">{section.icon}</span>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {section.title}
              </h3>
            </div>
            <div className="divide-y divide-slate-200 dark:divide-slate-800">
              {section.items.map((item, itemIndex) => (
                <details key={itemIndex} className="group">
                  <summary className={`px-6 py-4 cursor-pointer list-none ${isDarkMode ? 'hover:bg-slate-800/50' : 'hover:bg-slate-50'} transition-colors duration-200`}>
                    <div className="flex items-center justify-between">
                      <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {item.q}
                      </p>
                      <svg className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'} group-open:rotate-180 transition-transform duration-200`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </summary>
                  <div className={`px-6 py-4 ${isDarkMode ? 'bg-slate-800/30' : 'bg-slate-50'}`}>
                    <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                      {item.a}
                    </p>
                  </div>
                </details>
              ))}
            </div>
          </div>
        ))}

        {/* App Version Info */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-6 text-center animate-fadeIn`} style={{ animationDelay: '500ms' }}>
          <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-1`}>
            CAPTURA Admin v2.0
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            Build {new Date().getFullYear()}.10.20
          </p>
        </div>
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
      `}</style>
    </div>
  );
}

