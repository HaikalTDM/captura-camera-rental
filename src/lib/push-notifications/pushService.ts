/**
 * Push Notification Service for Captura Admin PWA
 * Sends push notifications for bookings, pickups, and returns
 */

import { supabase } from '@/lib/supabase/supabaseClient';

export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

/**
 * Save push subscription to database
 */
export async function savePushSubscription(subscription: PushSubscription) {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .upsert({
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'endpoint'
      });

    if (error) throw error;
    return { success: true, data };
  } catch (error) {
    console.error('Error saving push subscription:', error);
    return { success: false, error };
  }
}

/**
 * Remove push subscription from database
 */
export async function removePushSubscription(endpoint: string) {
  try {
    const { error } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('endpoint', endpoint);

    if (error) throw error;
    return { success: true };
  } catch (error) {
    console.error('Error removing push subscription:', error);
    return { success: false, error };
  }
}

/**
 * Get all active push subscriptions
 */
export async function getAllPushSubscriptions(): Promise<PushSubscription[]> {
  try {
    const { data, error } = await supabase
      .from('push_subscriptions')
      .select('endpoint, p256dh_key, auth_key')
      .eq('is_active', true);

    if (error) throw error;

    return (data || []).map(sub => ({
      endpoint: sub.endpoint,
      keys: {
        p256dh: sub.p256dh_key,
        auth: sub.auth_key
      }
    }));
  } catch (error) {
    console.error('Error fetching push subscriptions:', error);
    return [];
  }
}

/**
 * Send push notification to all subscribed devices
 */
export async function sendPushNotification(
  title: string,
  body: string,
  data?: Record<string, any>
) {
  try {
    const response = await fetch('/api/push-notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title, body, data })
    });

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, error };
  }
}

