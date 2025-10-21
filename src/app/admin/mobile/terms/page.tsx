'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TermsPrivacy() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
  }, []);

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
            Terms & Privacy
          </h1>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pt-6 space-y-4">
        {/* Privacy Policy */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`}>
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Privacy Policy
              </h3>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                Information We Collect
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                We collect information that you provide directly to us, including customer names, contact details, booking information, and payment records. This data is used solely to manage your camera rental business and provide services to your customers.
              </p>
            </div>

            <div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                How We Use Your Information
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                Your data is used to process bookings, manage inventory, send notifications, and generate analytics reports. We never sell or share your information with third parties without your explicit consent.
              </p>
            </div>

            <div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                Data Security
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                We implement industry-standard security measures to protect your data. All sensitive information is encrypted and stored securely. Regular backups ensure your data is never lost.
              </p>
            </div>

            <div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                Data Retention
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                We retain your data for as long as your account is active. You can request data deletion at any time by contacting our support team.
              </p>
            </div>
          </div>
        </div>

        {/* Terms of Service */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`} style={{ animationDelay: '100ms' }}>
          <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl flex items-center justify-center`}>
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Terms of Service
              </h3>
            </div>
          </div>
          <div className="px-6 py-5 space-y-4">
            <div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                Acceptance of Terms
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                By using CAPTURA Admin, you agree to these terms of service. If you do not agree, please discontinue use of the application.
              </p>
            </div>

            <div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                License to Use
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                We grant you a limited, non-exclusive, non-transferable license to use CAPTURA Admin for managing your camera rental business.
              </p>
            </div>

            <div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                User Responsibilities
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to use the service in compliance with all applicable laws and regulations.
              </p>
            </div>

            <div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                Service Availability
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                While we strive for 99.9% uptime, we do not guarantee uninterrupted access to the service. Scheduled maintenance and unexpected downtime may occur.
              </p>
            </div>

            <div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                Limitation of Liability
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                CAPTURA is provided "as is" without warranties of any kind. We are not liable for any indirect, incidental, or consequential damages arising from your use of the service.
              </p>
            </div>

            <div>
              <h4 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                Modifications to Terms
              </h4>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed`}>
                We reserve the right to modify these terms at any time. Continued use of the service after changes constitutes acceptance of the new terms.
              </p>
            </div>
          </div>
        </div>

        {/* Contact for Legal */}
        <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-6 animate-fadeIn`} style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-10 h-10 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-xl flex items-center justify-center`}>
              <svg className={`w-5 h-5 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h3 className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Questions About Legal?
              </h3>
              <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Contact us for clarification
              </p>
            </div>
          </div>
          <a
            href="mailto:captura.my@gmail.com"
            className={`block w-full text-center py-3 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
          >
            Email Legal Team
          </a>
        </div>

        {/* Last Updated */}
        <div className="text-center py-4 animate-fadeIn" style={{ animationDelay: '300ms' }}>
          <p className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
            Last updated: October 20, 2025
          </p>
          <p className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-400'} mt-1`}>
            © 2025 CAPTURA Camera Rental. All rights reserved.
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

