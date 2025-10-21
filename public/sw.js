// CAPTURA Main Site PWA Service Worker - DISABLED
// This service worker is DISABLED to prevent conflicts with admin PWA
// Admin PWA uses /admin-sw.js instead

console.log('⚠️ Main site service worker is DISABLED');

// Unregister this service worker immediately if it was registered before
self.addEventListener('install', () => {
  console.log('🗑️ Uninstalling old main site service worker...');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🧹 Cleaning up old main site caches...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('captura-') && !name.includes('admin'))
          .map((name) => caches.delete(name))
      );
    }).then(() => {
      console.log('✅ Old caches deleted, unregistering...');
      return self.registration.unregister();
    })
  );
});

// ORIGINAL CODE (DISABLED):
/*
const CACHE_NAME = 'captura-v1';
const STATIC_CACHE_NAME = 'captura-static-v1';
const DYNAMIC_CACHE_NAME = 'captura-dynamic-v1';

const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/icons/captura-icon-192x192.png',
  '/icons/captura-icon-512x512.png',
  '/images/captura_logo.png',
  '/images/captura_icon.png',
  // Add other critical assets here
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Service Worker: Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE_NAME && cacheName !== DYNAMIC_CACHE_NAME) {
              console.log('🗑️ Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Skip external requests
  if (url.origin !== location.origin) {
    return;
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        if (cachedResponse) {
          console.log('📦 Service Worker: Serving from cache', request.url);
          return cachedResponse;
        }
        
        // Not in cache, fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache if not a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse;
            }
            
            // Clone the response
            const responseToCache = networkResponse.clone();
            
            // Cache dynamic content
            caches.open(DYNAMIC_CACHE_NAME)
              .then((cache) => {
                console.log('💾 Service Worker: Caching dynamic content', request.url);
                cache.put(request, responseToCache);
              });
            
            return networkResponse;
          })
          .catch((error) => {
            console.log('🌐 Service Worker: Network request failed', request.url, error);
            
            // Return offline page for navigation requests
            if (request.destination === 'document') {
              return caches.match('/offline.html') || new Response(
                '<!DOCTYPE html><html><head><title>Offline - CAPTURA</title></head><body><h1>You are offline</h1><p>Please check your internet connection and try again.</p></body></html>',
                { headers: { 'Content-Type': 'text/html' } }
              );
            }
            
            throw error;
          });
      })
  );
});

// Background sync for offline form submissions
self.addEventListener('sync', (event) => {
  console.log('🔄 Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'booking-sync') {
    event.waitUntil(syncBookings());
  }
});

// Push notification handler
self.addEventListener('push', (event) => {
  console.log('📱 Service Worker: Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New update from CAPTURA',
    icon: '/icons/captura-icon-192x192.png',
    badge: '/icons/captura-icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/captura-icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/captura-icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('CAPTURA', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Sync bookings function for offline support
async function syncBookings() {
  try {
    console.log('🔄 Service Worker: Syncing offline bookings...');
    
    // Get offline bookings from IndexedDB or localStorage
    const offlineBookings = await getOfflineBookings();
    
    for (const booking of offlineBookings) {
      try {
        const response = await fetch('/api/bookings', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(booking)
        });
        
        if (response.ok) {
          console.log('✅ Service Worker: Booking synced successfully');
          await removeOfflineBooking(booking.id);
        }
      } catch (error) {
        console.error('❌ Service Worker: Failed to sync booking', error);
      }
    }
  } catch (error) {
    console.error('❌ Service Worker: Sync failed', error);
  }
}

// Helper functions for offline storage
async function getOfflineBookings() {
  // Implementation would depend on your storage strategy
  return [];
}

async function removeOfflineBooking(bookingId) {
  // Implementation would depend on your storage strategy
  console.log('🗑️ Service Worker: Removed offline booking', bookingId);
}
*/
// END OF DISABLED CODE
