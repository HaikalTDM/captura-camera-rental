#!/usr/bin/env node

/**
 * CAPTURA PWA Cache Clearing Script
 * 
 * This script helps resolve deployment synchronization issues between
 * Vercel app URL and custom domains by providing cache clearing strategies.
 */

console.log('🧹 CAPTURA PWA Cache Clearing Script');
console.log('=====================================');

const cacheInstructions = `
🔧 IMMEDIATE SOLUTIONS FOR CUSTOM DOMAIN CACHE ISSUES:

1. 📱 CLEAR PWA SERVICE WORKER CACHE:
   - Open your custom domain in browser
   - Open Developer Tools (F12)
   - Go to Application tab > Storage
   - Click "Clear storage" button
   - Refresh the page (Ctrl+F5 or Cmd+Shift+R)

2. 🌐 FORCE BROWSER CACHE REFRESH:
   - Hold Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)
   - Or open in incognito/private browsing mode
   - This bypasses all browser caches

3. 📦 SERVICE WORKER MANUAL RESET:
   - Developer Tools > Application > Service Workers
   - Find "admin-sw.js" and click "Unregister"
   - Refresh the page to re-register with new version

4. 🔄 VERCEL DEPLOYMENT CACHE:
   - The service worker version has been updated to v2.0.0
   - This will force cache invalidation on next visit
   - New deployments will use fresh cache keys

5. 🌍 DNS/CDN CACHE CLEARING:
   - If using Cloudflare: Purge cache in dashboard
   - If using other CDN: Clear cache in their control panel
   - DNS propagation can take up to 24 hours

6. 📱 MOBILE DEVICE CACHE:
   - Clear browser cache and data
   - Uninstall PWA app and reinstall
   - Force-close browser and reopen

🚀 TECHNICAL CHANGES MADE:
- Updated service worker cache version to v2.0.0
- Changed caching strategy from cache-first to network-first
- Enhanced cache cleanup on service worker activation
- Added aggressive old cache deletion

⚡ PREVENTION FOR FUTURE DEPLOYMENTS:
- Service worker version will auto-increment
- Network-first strategy ensures fresh content
- Better cache invalidation on updates
`;

console.log(cacheInstructions);

// Check if we're in a browser environment (for manual execution)
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  console.log('🔧 Browser environment detected - providing interactive cache clearing...');
  
  // Function to clear all caches
  async function clearAllCaches() {
    try {
      console.log('🧹 Clearing all caches...');
      
      // Clear all cache storage
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        await Promise.all(
          cacheNames.map(cacheName => {
            console.log('🗑️ Deleting cache:', cacheName);
            return caches.delete(cacheName);
          })
        );
      }
      
      // Unregister service workers
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        registrations.map(registration => {
          console.log('🔄 Unregistering service worker:', registration.scope);
          return registration.unregister();
        })
      );
      
      console.log('✅ All caches cleared successfully!');
      console.log('🔄 Please refresh the page to see updated content.');
      
    } catch (error) {
      console.error('❌ Error clearing caches:', error);
    }
  }
  
  // Make function available globally
  window.clearCAPTURACaches = clearAllCaches;
  
  console.log('💡 Run clearCAPTURACaches() in console to clear all caches immediately');
}

module.exports = {
  clearInstructions: cacheInstructions
};
