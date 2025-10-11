import { NextRequest, NextResponse } from 'next/server';
import { removePushSubscription } from '@/lib/push-notifications/pushService';

export async function POST(request: NextRequest) {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { success: false, error: 'Endpoint is required' },
        { status: 400 }
      );
    }

    const result = await removePushSubscription(endpoint);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to remove subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Push notification subscription removed'
    });
  } catch (error) {
    console.error('Error in push notification unsubscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

