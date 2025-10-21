'use client';

import { useState, useEffect } from 'react';

export default function PushNotificationToggle() {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    // Check if push notifications are supported
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      setIsSupported(true);
      setPermission(Notification.permission);
      checkSubscription();
    }
  }, []);

  const checkSubscription = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(subscription !== null);
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const urlBase64ToUint8Array = (base64String: string) => {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  };

  const subscribe = async () => {
    setIsLoading(true);
    try {
      // Request notification permission
      const permission = await Notification.requestPermission();
      setPermission(permission);

      if (permission !== 'granted') {
        alert('Please allow notifications to receive booking alerts');
        setIsLoading(false);
        return;
      }

      // Ensure ONLY the mobile admin service worker is used
      // Unregister any existing non-admin workers first
      const existingRegs = await navigator.serviceWorker.getRegistrations();
      await Promise.all(
        existingRegs.map((reg) => {
          const url = reg.active?.scriptURL || reg.installing?.scriptURL || reg.waiting?.scriptURL || '';
          if (!url.includes('admin-sw.js')) {
            return reg.unregister();
          }
          return Promise.resolve(true);
        })
      );

      // Register the NEW mobile admin service worker with the correct scope
      const registration = await navigator.serviceWorker.register('/admin-sw.js', { scope: '/admin/mobile/' });
      if (registration.waiting) {
        registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      }
      await navigator.serviceWorker.ready;

      // Get VAPID public key from environment
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error('VAPID public key not configured');
        alert('Push notifications not configured. Please contact administrator.');
        setIsLoading(false);
        return;
      }

      // Subscribe to push notifications
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey)
      });

      // Send subscription to server
      const response = await fetch('/api/push-notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(subscription.toJSON())
      });

      const result = await response.json();

      if (result.success) {
        setIsSubscribed(true);
        alert('✅ Push notifications enabled! You will receive alerts for new bookings.');
      } else {
        alert('Failed to enable push notifications. Please try again.');
      }
    } catch (error) {
      console.error('Error subscribing to push notifications:', error);
      alert('Error enabling push notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const unsubscribe = async () => {
    setIsLoading(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Unsubscribe from push notifications
        await subscription.unsubscribe();

        // Remove subscription from server
        await fetch('/api/push-notifications/unsubscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ endpoint: subscription.endpoint })
        });

        setIsSubscribed(false);
        alert('Push notifications disabled');
      }
    } catch (error) {
      console.error('Error unsubscribing from push notifications:', error);
      alert('Error disabling push notifications. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            📱 Push Notifications
          </h3>
          <p className="text-sm text-gray-600">
            {isSubscribed 
              ? 'Get instant alerts on your phone for new bookings, pickups, and returns'
              : 'Enable notifications to get instant alerts for new bookings'}
          </p>
        </div>
        <button
          onClick={isSubscribed ? unsubscribe : subscribe}
          disabled={isLoading}
          className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
            isSubscribed
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white'
          } ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isLoading ? '...' : isSubscribed ? 'Disable' : 'Enable'}
        </button>
      </div>
      
      {permission === 'denied' && (
        <div className="mt-4 p-4 bg-red-50 border-l-4 border-red-500 rounded">
          <p className="text-sm text-red-800">
            ⚠️ Notifications are blocked. Please enable them in your browser settings.
          </p>
        </div>
      )}
    </div>
  );
}

