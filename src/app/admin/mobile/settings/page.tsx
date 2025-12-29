'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function MobileSettings() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [soundEffects, setSoundEffects] = useState(false);
  const [showClearCacheModal, setShowClearCacheModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);

    const notifPref = localStorage.getItem('notifications') !== 'false';
    setNotifications(notifPref);

    const soundPref = localStorage.getItem('soundEffects') === 'true';
    setSoundEffects(soundPref);
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', String(newMode));
    window.location.reload(); // Refresh to apply theme
  };

  const toggleNotifications = () => {
    const newPref = !notifications;
    setNotifications(newPref);
    localStorage.setItem('notifications', String(newPref));
  };

  const toggleSoundEffects = () => {
    const newPref = !soundEffects;
    setSoundEffects(newPref);
    localStorage.setItem('soundEffects', String(newPref));
  };

  const handleClearCache = () => {
    // Clear all localStorage except auth
    const auth = localStorage.getItem('adminAuth');
    localStorage.clear();
    if (auth) localStorage.setItem('adminAuth', auth);
    setShowClearCacheModal(false);
    window.location.reload();
  };

  const handleLogout = () => {
    localStorage.clear();
    router.push('/admin/login');
  };

  const settingsSections = [
    {
      title: 'Preferences',
      items: [
        {
          label: 'Dark Mode',
          sublabel: isDarkMode ? 'Dark theme active' : 'Light theme active',
          action: toggleDarkMode,
          isToggle: true,
          value: isDarkMode,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
            </svg>
          )
        },
        {
          label: 'Push Notifications',
          sublabel: notifications ? 'Enabled' : 'Disabled',
          action: toggleNotifications,
          isToggle: true,
          value: notifications,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          )
        },
        {
          label: 'Sound Effects',
          sublabel: soundEffects ? 'Enabled' : 'Disabled',
          action: toggleSoundEffects,
          isToggle: true,
          value: soundEffects,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            </svg>
          )
        },
      ]
    },
    {
      title: 'Quick Actions',
      items: [
        {
          label: 'Customer Site',
          sublabel: 'View rental website',
          href: '/rental',
          isExternal: true, // Force full page navigation
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          )
        },
        {
          label: 'View Customers',
          sublabel: 'Manage customer database',
          href: '/admin/mobile/customers',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          )
        },
        {
          label: 'Reports & Analytics',
          sublabel: 'View business insights',
          href: '/admin/mobile/analytics',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          )
        },
        {
          label: 'Camera Management',
          sublabel: 'Manage equipment inventory',
          href: '/admin/mobile/cameras',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        },
        {
          label: 'Gallery Management',
          sublabel: 'Manage carousel images',
          href: '/admin/mobile/gallery',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          )
        },

      ]
    },
    {
      title: 'Account',
      items: [
        {
          label: 'Profile Settings',
          sublabel: 'Update your business details',
          href: '/admin/mobile/profile',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )
        },
        {
          label: 'Notification Settings',
          sublabel: 'Configure alert preferences',
          href: '/admin/mobile/notification-settings',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          )
        },
        {
          label: 'System Settings',
          sublabel: 'Booking rules & configurations',
          href: '/admin/mobile/system-settings',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
          )
        },
        {
          label: 'App Info & Version',
          sublabel: 'CAPTURA Admin v2.0',
          action: () => alert(`CAPTURA Admin\nVersion: 2.0\nBuild: ${new Date().getFullYear()}.10.20\n\n© 2025 CAPTURA Camera Rental\nAll rights reserved.`),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          label: 'Clear Cache',
          sublabel: 'Free up storage space',
          action: () => setShowClearCacheModal(true),
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          )
        },
        {
          label: 'Help & Support',
          sublabel: 'Get assistance',
          href: '/admin/mobile/help',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        },
        {
          label: 'Terms & Privacy',
          sublabel: 'Legal information',
          href: '/admin/mobile/terms',
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          )
        },
        {
          label: 'Logout',
          sublabel: 'Sign out of your account',
          action: () => setShowLogoutModal(true),
          isDestructive: true,
          icon: (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          )
        },
      ]
    }
  ];

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
      <div className="px-4 pt-4 pb-24 space-y-5">
        {/* Enhanced Compact Profile Card */}
        <Link
          href="/admin/mobile/profile"
          className={`group block ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:border-slate-700' : 'bg-white border-slate-200 hover:border-slate-300'
            } rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-300 active:scale-[0.97] overflow-hidden`}
        >
          <div className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={`w-12 h-12 ${isDarkMode ? 'bg-slate-800 border-slate-700 group-hover:bg-slate-700' : 'bg-slate-100 border-slate-300 group-hover:bg-slate-200'
                } border-2 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
                <span className={`text-lg font-bold ${isDarkMode ? 'text-slate-300 group-hover:text-slate-200' : 'text-slate-700 group-hover:text-slate-800'} transition-colors duration-300`}>A</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} transition-all duration-200`}>
                  Admin
                </p>
                <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500 group-hover:text-slate-400' : 'text-slate-500 group-hover:text-slate-600'} transition-colors duration-200`}>
                  CAPTURA Owner
                </p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-slate-600 group-hover:text-slate-500' : 'text-slate-400 group-hover:text-slate-500'} transition-all duration-300 group-hover:translate-x-0.5`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </Link>

        {/* Settings Sections */}
        {settingsSections.map((section, sectionIndex) => (
          <div key={sectionIndex} className="space-y-3 animate-fadeIn" style={{ animationDelay: `${sectionIndex * 50}ms` }}>
            {/* Section Divider - Only show before sections after the first */}
            {sectionIndex > 0 && (
              <div className={`flex items-center gap-3 px-2 my-6`}>
                <div className={`flex-1 h-px ${isDarkMode ? 'bg-gradient-to-r from-transparent via-slate-800 to-transparent' : 'bg-gradient-to-r from-transparent via-slate-200 to-transparent'}`}></div>
              </div>
            )}

            <h3 className={`text-xs font-bold uppercase tracking-wider px-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'
              }`}>
              {section.title}
            </h3>

            <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
              } rounded-2xl border shadow-sm overflow-hidden divide-y ${isDarkMode ? 'divide-slate-800' : 'divide-slate-200'
              }`}>
              {section.items.map((item, itemIndex) => {
                const content = (
                  <>
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 ${item.isDestructive
                        ? 'bg-red-500/10 border-red-500/20 group-hover:bg-red-500/15 group-hover:border-red-500/30'
                        : isDarkMode ? 'bg-slate-800 border-slate-700 group-hover:bg-slate-700 group-hover:border-slate-600' : 'bg-slate-100 border-slate-200 group-hover:bg-slate-200 group-hover:border-slate-300'
                        } border rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300`}>
                        <div className={`transition-all duration-300 ${item.isDestructive
                          ? 'text-red-500 group-hover:text-red-600'
                          : isDarkMode ? 'text-slate-400 group-hover:text-slate-300' : 'text-slate-600 group-hover:text-slate-700'
                          }`}>
                          {item.icon}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0 text-left">
                        <p className={`font-semibold text-sm ${item.isDestructive
                          ? 'text-red-500'
                          : isDarkMode ? 'text-white' : 'text-slate-900'
                          }`}>
                          {item.label}
                        </p>
                        <p className={`text-xs mt-0.5 font-medium truncate ${item.isDestructive
                          ? 'text-red-400/70'
                          : isDarkMode ? 'text-slate-500' : 'text-slate-500'
                          }`}>
                          {item.sublabel}
                        </p>
                      </div>
                    </div>

                    {item.isToggle ? (
                      <div
                        className={`relative w-12 h-7 rounded-full transition-all duration-300 ease-out flex-shrink-0 ${item.value
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/40'
                          : isDarkMode ? 'bg-slate-700' : 'bg-slate-300'
                          }`}
                        style={{
                          transition: 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
                        }}
                      >
                        <div
                          className={`absolute w-5 h-5 bg-white rounded-full top-1 shadow-md ${item.value ? 'left-6' : 'left-1'
                            }`}
                          style={{
                            transition: 'all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1)',
                            transform: item.value ? 'scale(1.05)' : 'scale(1)'
                          }}
                        ></div>
                      </div>
                    ) : (
                      <svg
                        className={`w-5 h-5 flex-shrink-0 transition-all duration-300 group-hover:translate-x-1 ${item.isDestructive
                          ? 'text-red-500/50 group-hover:text-red-500/70'
                          : isDarkMode ? 'text-slate-600 group-hover:text-slate-500' : 'text-slate-400 group-hover:text-slate-500'
                          }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    )}
                  </>
                );

                if (item.href) {
                  // Use regular <a> tag for external links to force full page reload
                  if (item.isExternal) {
                    return (
                      <a
                        key={itemIndex}
                        href={item.href}
                        className={`group w-full flex items-center justify-between p-4 transition-all duration-200 active:scale-[0.98] ${isDarkMode ? 'hover:bg-slate-800/50 active:bg-slate-800' : 'hover:bg-slate-50 active:bg-slate-100'
                          }`}
                      >
                        {content}
                      </a>
                    );
                  }

                  return (
                    <Link
                      key={itemIndex}
                      href={item.href}
                      className={`group w-full flex items-center justify-between p-4 transition-all duration-200 active:scale-[0.98] ${isDarkMode ? 'hover:bg-slate-800/50 active:bg-slate-800' : 'hover:bg-slate-50 active:bg-slate-100'
                        }`}
                    >
                      {content}
                    </Link>
                  );
                }

                return (
                  <button
                    key={itemIndex}
                    onClick={item.action}
                    className={`group w-full flex items-center justify-between p-4 transition-all duration-200 active:scale-[0.98] ${isDarkMode ? 'hover:bg-slate-800/50 active:bg-slate-800' : 'hover:bg-slate-50 active:bg-slate-100'
                      }`}
                  >
                    {content}
                  </button>
                );
              })}
            </div>
          </div>
        ))}

        {/* Enhanced App Info Footer */}
        <div className="text-center py-8 animate-fadeIn" style={{ animationDelay: '300ms' }}>
          {/* Subtle Top Divider */}
          <div className={`flex items-center gap-3 px-2 mb-6`}>
            <div className={`flex-1 h-px ${isDarkMode ? 'bg-gradient-to-r from-transparent via-slate-800 to-transparent' : 'bg-gradient-to-r from-transparent via-slate-200 to-transparent'}`}></div>
          </div>

          {/* Version Badge with Camera Icon */}
          <div className={`inline-flex items-center justify-center gap-2.5 px-5 py-2.5 rounded-full ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
            } border shadow-md mb-4 transition-all duration-300 hover:shadow-lg hover:scale-105 active:scale-95`}>
            <div className={`w-5 h-5 rounded-full ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} flex items-center justify-center`}>
              <svg className={`w-3 h-3 ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <p className={`text-xs font-bold uppercase tracking-wide ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>
              CAPTURA Admin
            </p>
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${isDarkMode ? 'bg-blue-500/10 text-blue-400' : 'bg-blue-50 text-blue-600'}`}>
              v2.0
            </span>
          </div>

          {/* Copyright Info */}
          <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-600' : 'text-slate-500'} mb-1`}>
            © 2025 CAPTURA Camera Rental
          </p>
          <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-700' : 'text-slate-400'}`}>
            All rights reserved.
          </p>

          {/* Build Info (subtle) */}
          <p className={`text-[10px] font-medium mt-3 ${isDarkMode ? 'text-slate-800' : 'text-slate-300'}`}>
            Build {new Date().getFullYear()}.10.20
          </p>
        </div>
      </div>

      {/* Clear Cache Confirmation Modal */}
      {showClearCacheModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-backdropFadeIn"
          onClick={() => setShowClearCacheModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
          <div
            className={`relative w-full max-w-sm ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-3xl shadow-2xl animate-modalSlideUp p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className={`w-16 h-16 ${isDarkMode ? 'bg-orange-500/10' : 'bg-orange-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <svg className="w-8 h-8 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Clear Cache?
              </h3>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                This will clear all cached data except your login. The app will reload to apply changes.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowClearCacheModal(false)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearCache}
                  className="flex-1 bg-gradient-to-r from-orange-500 to-red-600 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg shadow-orange-500/30"
                >
                  Clear Cache
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4 animate-backdropFadeIn"
          onClick={() => setShowLogoutModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
          <div
            className={`relative w-full max-w-sm ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-3xl shadow-2xl animate-modalSlideUp p-6`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center">
              <div className={`w-16 h-16 ${isDarkMode ? 'bg-red-500/10' : 'bg-red-100'} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Logout?
              </h3>
              <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                Are you sure you want to sign out of your account?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className={`flex-1 py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                    }`}
                >
                  Cancel
                </button>
                <button
                  onClick={handleLogout}
                  className="flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg shadow-red-500/30"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

