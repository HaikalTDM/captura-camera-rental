'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Non-blocking PWA setup for /admin/mobile
 * Runs in background without interfering with navigation
 */
export function useAdminPWA() {
  const pathname = usePathname();

  useEffect(() => {
    // Only run on /admin/mobile routes
    const isAdminMobileRoute = pathname?.startsWith('/admin/mobile');
    if (!isAdminMobileRoute) {
      return;
    }

    // Add PWA meta tags (non-blocking)
    const addPWAMetaTags = () => {
      // Remove any existing manifest links
      document.querySelectorAll('link[rel="manifest"]').forEach(el => el.remove());
      
      // Add mobile admin manifest
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/mobile-admin.webmanifest';
      manifestLink.crossOrigin = 'anonymous';
      document.head.appendChild(manifestLink);

      // Set theme color for PWA
      let themeColorMeta = document.querySelector('meta[name="theme-color"]');
      if (!themeColorMeta) {
        themeColorMeta = document.createElement('meta');
        themeColorMeta.setAttribute('name', 'theme-color');
        document.head.appendChild(themeColorMeta);
      }
      themeColorMeta.setAttribute('content', '#000000');

      // Apple PWA meta tags
      const addAppleMeta = (name: string, content: string) => {
        let meta = document.querySelector(`meta[name="${name}"]`);
        if (!meta) {
          meta = document.createElement('meta');
          meta.setAttribute('name', name);
          document.head.appendChild(meta);
        }
        meta.setAttribute('content', content);
      };

      addAppleMeta('apple-mobile-web-app-capable', 'yes');
      addAppleMeta('apple-mobile-web-app-title', 'CAPTURA Admin');
      addAppleMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');
    };

    // Register service worker (non-blocking)
    const registerServiceWorker = async () => {
      if (!('serviceWorker' in navigator)) {
        console.log('📱 PWA: Service Worker not supported');
        return;
      }

      try {
        // Check for existing service workers
        const registrations = await navigator.serviceWorker.getRegistrations();
        const expectedScope = new URL('/admin/mobile/', location.origin).href;

        // Find existing admin service worker
        let hasCorrectWorker = false;
        for (const registration of registrations) {
          const scope = (registration as any).scope as string | undefined;
          const scriptUrl = registration.active?.scriptURL || registration.waiting?.scriptURL || '';
          
          const isAdminSW = scriptUrl.includes('admin-sw.js');
          const hasCorrectScope = scope === expectedScope;

          if (isAdminSW && hasCorrectScope) {
            hasCorrectWorker = true;
            console.log('✅ Admin PWA: Service Worker already registered');
            
            // If there's a waiting worker, activate it
            if (registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          } else if (isAdminSW && !hasCorrectScope) {
            // Unregister old admin workers with wrong scope
            await registration.unregister();
            console.log('🗑️ Admin PWA: Removed old service worker');
          }
        }

        // Register new service worker if needed
        if (!hasCorrectWorker) {
          const registration = await navigator.serviceWorker.register('/admin-sw.js', {
            scope: '/admin/mobile/'
          });

          console.log('✅ Admin PWA: Service Worker registered', registration);

          // Force activate if waiting
          if (registration.waiting) {
            registration.waiting.postMessage({ type: 'SKIP_WAITING' });
          }
        }
      } catch (error) {
        console.error('❌ Admin PWA: Service Worker registration failed', error);
      }
    };

    // Run setup asynchronously (non-blocking)
    addPWAMetaTags();
    registerServiceWorker();

    // Check if already installed
    if (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) {
      console.log('📱 Admin PWA: Running in standalone mode');
    }
  }, [pathname]);
}

