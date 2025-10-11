import { NextRequest, NextResponse } from 'next/server';
import { savePushSubscription } from '@/lib/push-notifications/pushService';

export async function POST(request: NextRequest) {
  try {
    const subscription = await request.json();

    const result = await savePushSubscription(subscription);

    if (!result.success) {
      return NextResponse.json(
        { success: false, error: 'Failed to save subscription' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Push notification subscription saved'
    });
  } catch (error) {
    console.error('Error in push notification subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

