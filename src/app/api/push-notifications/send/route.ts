import { NextRequest, NextResponse } from 'next/server';
import { getAllPushSubscriptions } from '@/lib/push-notifications/pushService';
import webpush from 'web-push';

// Configure web-push with VAPID keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    'mailto:haikaltdm46@gmail.com',
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export async function POST(request: NextRequest) {
  try {
    const { title, body, data } = await request.json();

    // Validate VAPID keys are configured
    if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
      console.error('VAPID keys not configured');
      return NextResponse.json(
        { success: false, error: 'Push notifications not configured' },
        { status: 500 }
      );
    }

    // Get all active subscriptions
    const subscriptions = await getAllPushSubscriptions();

    if (subscriptions.length === 0) {
      console.log('No active push subscriptions found');
      return NextResponse.json({
        success: true,
        message: 'No active subscriptions',
        sent: 0
      });
    }

    // Prepare notification payload
    const payload = JSON.stringify({
      title,
      body,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      data: {
        url: '/admin/booking-approvals',
        ...data
      }
    });

    // Send to all subscriptions
    const results = await Promise.allSettled(
      subscriptions.map(subscription =>
        webpush.sendNotification(subscription, payload)
      )
    );

    // Count successes and failures
    const sent = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    console.log(`✅ Push notifications sent: ${sent} successful, ${failed} failed`);

    return NextResponse.json({
      success: true,
      message: 'Push notifications sent',
      sent,
      failed
    });
  } catch (error) {
    console.error('Error sending push notifications:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send push notifications' },
      { status: 500 }
    );
  }
}

