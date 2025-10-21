'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

interface AdminPWAWrapperProps {
  children: React.ReactNode;
}

export default function AdminPWAWrapper({ children }: AdminPWAWrapperProps) {
  const pathname = usePathname();
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [isAdminRoute, setIsAdminRoute] = useState(false);

  useEffect(() => {
    // ONLY work on mobile admin routes
    const isMobileAdminRoute = pathname?.startsWith('/admin/mobile');
    setIsAdminRoute(isMobileAdminRoute || false);

    // Only initialize PWA on mobile admin routes
    if (!isMobileAdminRoute) {
      return;
    }

    // Unregister ALL old service workers first
    const unregisterOldWorkers = async () => {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log(`🧹 Found ${registrations.length} service workers, unregistering old ones...`);
        
        for (const registration of registrations) {
          // Unregister any service worker that's not our new mobile admin one
          if (!registration.active?.scriptURL.includes('admin-sw.js')) {
            await registration.unregister();
            console.log('🗑️ Unregistered old service worker:', registration.active?.scriptURL);
          }
        }
      }
    };

    // Add admin PWA meta tags dynamically
    const addAdminMetaTags = () => {
      // Remove ALL existing manifest links
      document.querySelectorAll('link[rel="manifest"]').forEach(el => el.remove());
      
      // Remove ALL existing theme-color meta tags
      document.querySelectorAll('meta[name="theme-color"]').forEach(el => el.remove());

      // Add FRESH admin manifest with cache buster
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = `/admin-manifest.json?v=${Date.now()}`;
      document.head.appendChild(manifestLink);

      // Add BLACK theme color for mobile admin
      const themeColorMeta = document.createElement('meta');
      themeColorMeta.name = 'theme-color';
      themeColorMeta.content = '#000000';
      document.head.appendChild(themeColorMeta);

      // Add admin app meta tags
      const appCapableMeta = document.createElement('meta');
      appCapableMeta.name = 'apple-mobile-web-app-capable';
      appCapableMeta.content = 'yes';
      document.head.appendChild(appCapableMeta);

      const appTitleMeta = document.createElement('meta');
      appTitleMeta.name = 'apple-mobile-web-app-title';
      appTitleMeta.content = 'CAPTURA Admin';
      document.head.appendChild(appTitleMeta);

      const appStatusBarMeta = document.createElement('meta');
      appStatusBarMeta.name = 'apple-mobile-web-app-status-bar-style';
      appStatusBarMeta.content = 'black-translucent';
      document.head.appendChild(appStatusBarMeta);
    };

    // Execute the cleanup and setup
    const setupPWA = async () => {
      await unregisterOldWorkers();
      addAdminMetaTags();

      // Register NEW service worker for mobile admin only
      if ('serviceWorker' in navigator) {
        // Wait a bit to ensure old workers are gone
        setTimeout(() => {
          navigator.serviceWorker
            .register('/admin-sw.js', { scope: '/admin/' })
            .then((registration) => {
              // Force update if there's a waiting worker
              if (registration.waiting) {
                registration.waiting.postMessage({ type: 'SKIP_WAITING' });
              }
              console.log('✅ Mobile Admin PWA: Service Worker registered successfully');
            })
            .catch((error) => {
              console.error('❌ Mobile Admin PWA: Service Worker registration failed', error);
            });
        }, 500);
      }
    };

    setupPWA();

    // Check if app is already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      console.log('📱 Admin PWA: App is running in standalone mode');
    }

    // Listen for beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowInstallPrompt(true);
      console.log('📲 Admin PWA: Install prompt available');
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      console.log('🎉 Admin PWA: App installed successfully');
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [pathname]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('✅ Admin PWA: User accepted the install prompt');
      } else {
        console.log('❌ Admin PWA: User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    } catch (error) {
      console.error('❌ Admin PWA: Install prompt failed', error);
    }
  };

  const handleDismiss = () => {
    setShowInstallPrompt(false);
    // Hide for this session
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('admin-pwa-install-dismissed', 'true');
    }
  };

  // Don't show install prompt if not admin route, already installed, or dismissed
  const shouldShowInstallPrompt = isAdminRoute && 
    showInstallPrompt && 
    !isInstalled && 
    deferredPrompt &&
    (typeof window === 'undefined' || !sessionStorage.getItem('admin-pwa-install-dismissed'));

  return (
    <>
      {children}
      
      {/* Admin PWA Install Prompt - Mobile Optimized */}
      {shouldShowInstallPrompt && (
        <div className="fixed bottom-4 left-4 right-4 sm:bottom-4 sm:right-4 sm:left-auto z-50 sm:max-w-sm">
          <div className="bg-white/95 border border-gray-200 rounded-xl shadow-lg p-4 backdrop-blur-sm">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🛠️</span>
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-gray-900 mb-1">
                  Install Mobile Admin
                </h3>
                <p className="text-xs text-gray-600 mb-3">
                  Get the mobile admin app for quick access and offline support.
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={handleInstallClick}
                    className="flex-1 bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-colors touch-manipulation min-h-[44px]"
                  >
                    Install
                  </button>
                  <button
                    onClick={handleDismiss}
                    className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium px-4 py-2 rounded-lg hover:bg-gray-200 active:bg-gray-300 transition-colors touch-manipulation min-h-[44px]"
                  >
                    Not Now
                  </button>
                </div>
              </div>
              <button
                onClick={handleDismiss}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 active:text-gray-800 transition-colors p-1 rounded touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
