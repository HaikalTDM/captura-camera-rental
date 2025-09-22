// CAPTURA Admin Dashboard PWA Service Worker
// Updated cache version to force cache refresh - increment when deploying updates
const CACHE_VERSION = 'v1758517386159';
const ADMIN_CACHE_NAME = `captura-admin-${CACHE_VERSION}`;
const ADMIN_STATIC_CACHE_NAME = `captura-admin-static-${CACHE_VERSION}`;
const ADMIN_DYNAMIC_CACHE_NAME = `captura-admin-dynamic-${CACHE_VERSION}`;
const ADMIN_API_CACHE_NAME = `captura-admin-api-${CACHE_VERSION}`;

// Admin-specific files to cache immediately
const ADMIN_STATIC_ASSETS = [
  '/admin',
  '/admin/',
  '/admin/bookings',
  '/admin/calendar',
  '/admin/customers',
  '/admin/cameras',
  '/admin-manifest.json',
  '/icons/captura-icon-192x192.png',
  '/icons/captura-icon-512x512.png',
  '/images/captura_logo.png',
  '/images/captura_icon.png',
];

// Admin API endpoints to cache for offline access
const ADMIN_API_ENDPOINTS = [
  '/api/bookings',
  '/api/customers',
  '/api/cameras',
  '/api/calendar/availability'
];

// Install event - cache admin static assets
self.addEventListener('install', (event) => {
  console.log('🔧 Admin Service Worker: Installing...');
  
  event.waitUntil(
    caches.open(ADMIN_STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('📦 Admin Service Worker: Caching admin static assets');
        return cache.addAll(ADMIN_STATIC_ASSETS);
      })
      .then(() => {
        console.log('✅ Admin Service Worker: Installation complete');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('❌ Admin Service Worker: Installation failed', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('🚀 Admin Service Worker: Activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            // Delete all old admin caches (more aggressive cleanup)
            if (cacheName.startsWith('captura-admin-') &&
                cacheName !== ADMIN_STATIC_CACHE_NAME &&
                cacheName !== ADMIN_DYNAMIC_CACHE_NAME &&
                cacheName !== ADMIN_API_CACHE_NAME) {
              console.log('🗑️ Admin Service Worker: Deleting old cache', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('✅ Admin Service Worker: Activation complete');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Only handle admin routes
  if (!url.pathname.startsWith('/admin')) {
    return;
  }
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle API requests differently
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }
  
  // Handle admin page requests
  event.respondWith(handleAdminPageRequest(request));
});

// Handle admin page requests with network-first strategy for fresh content
async function handleAdminPageRequest(request) {
  try {
    // Try network first for fresh content (network-first strategy)
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.status === 200) {
      // Cache the fresh response
      const cache = await caches.open(ADMIN_DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('💾 Admin Service Worker: Cached fresh admin page', request.url);
      return networkResponse;
    }

    // If network fails, try cache as fallback
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Admin Service Worker: Serving page from cache (network failed)', request.url);
      return cachedResponse;
    }

    return networkResponse;
  } catch (error) {
    console.log('🌐 Admin Service Worker: Network request failed', request.url, error);
    
    // Return offline page for admin routes
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Offline - CAPTURA Admin</title>
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .offline-container { max-width: 400px; margin: 0 auto; }
          .icon { font-size: 64px; margin-bottom: 20px; }
          h1 { color: #3b82f6; }
          p { color: #666; }
        </style>
      </head>
      <body>
        <div class="offline-container">
          <div class="icon">🛠️</div>
          <h1>Admin Dashboard Offline</h1>
          <p>You are currently offline. Some admin features may not be available.</p>
          <p>Please check your internet connection and try again.</p>
        </div>
      </body>
      </html>`,
      { 
        headers: { 'Content-Type': 'text/html' },
        status: 200
      }
    );
  }
}

// Handle API requests with caching strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  
  try {
    // Try network first for fresh data
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.status === 200) {
      // Cache successful API responses
      const cache = await caches.open(ADMIN_API_CACHE_NAME);
      cache.put(request, networkResponse.clone());
      console.log('💾 Admin Service Worker: Cached API response', request.url);
    }
    
    return networkResponse;
  } catch (error) {
    console.log('🌐 Admin Service Worker: API request failed, trying cache', request.url);
    
    // Fallback to cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      console.log('📦 Admin Service Worker: Serving API from cache', request.url);
      return cachedResponse;
    }
    
    // Return offline API response
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This data is not available offline',
        offline: true
      }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 503
      }
    );
  }
}

// Background sync for admin actions
self.addEventListener('sync', (event) => {
  console.log('🔄 Admin Service Worker: Background sync triggered', event.tag);
  
  if (event.tag === 'admin-booking-sync') {
    event.waitUntil(syncAdminBookings());
  } else if (event.tag === 'admin-customer-sync') {
    event.waitUntil(syncAdminCustomers());
  }
});

// Push notification handler for admin
self.addEventListener('push', (event) => {
  console.log('📱 Admin Service Worker: Push notification received');
  
  const data = event.data ? event.data.json() : {};
  const options = {
    body: data.body || 'New admin notification from CAPTURA',
    icon: '/icons/admin-icon-192x192.png',
    badge: '/icons/admin-icon-72x72.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: data.id || 1,
      url: data.url || '/admin'
    },
    actions: [
      {
        action: 'view',
        title: 'View Details',
        icon: '/icons/admin-icon-96x96.png'
      },
      {
        action: 'dismiss',
        title: 'Dismiss',
        icon: '/icons/admin-icon-96x96.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('CAPTURA Admin', options)
  );
});

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Admin Service Worker: Notification clicked', event.action);
  
  event.notification.close();
  
  if (event.action === 'view') {
    const url = event.notification.data.url || '/admin';
    event.waitUntil(
      clients.openWindow(url)
    );
  }
});

// Sync admin bookings function
async function syncAdminBookings() {
  try {
    console.log('🔄 Admin Service Worker: Syncing admin booking actions...');
    // Implementation for syncing offline admin actions
  } catch (error) {
    console.error('❌ Admin Service Worker: Booking sync failed', error);
  }
}

// Sync admin customers function
async function syncAdminCustomers() {
  try {
    console.log('🔄 Admin Service Worker: Syncing admin customer actions...');
    // Implementation for syncing offline admin actions
  } catch (error) {
    console.error('❌ Admin Service Worker: Customer sync failed', error);
  }
}
