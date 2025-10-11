/**
 * Service Worker for Captura Admin PWA
 * Handles push notifications and offline functionality
 */

// Listen for push events
self.addEventListener('push', function(event) {
  console.log('Push notification received:', event);

  if (!event.data) {
    console.log('Push event has no data');
    return;
  }

  let notificationData;
  try {
    notificationData = event.data.json();
  } catch (e) {
    console.error('Error parsing push notification data:', e);
    notificationData = {
      title: 'Captura Notification',
      body: event.data.text() || 'You have a new notification'
    };
  }

  const title = notificationData.title || 'Captura Notification';
  const options = {
    body: notificationData.body || 'You have a new notification',
    icon: notificationData.icon || '/icon-192x192.png',
    badge: notificationData.badge || '/icon-192x192.png',
    data: notificationData.data || {},
    vibrate: [200, 100, 200],
    tag: 'captura-notification',
    requireInteraction: true
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', function(event) {
  console.log('Notification clicked:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/admin/booking-approvals';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(function(clientList) {
        // Check if there's already a window open
        for (let i = 0; i < clientList.length; i++) {
          const client = clientList[i];
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // If not, open a new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Install event - cache assets
self.addEventListener('install', function(event) {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', function(event) {
  console.log('Service Worker activating...');
  event.waitUntil(clients.claim());
});

