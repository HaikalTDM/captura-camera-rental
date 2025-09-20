import { NextRequest, NextResponse } from 'next/server';
import { createNotification } from '@/lib/api/notifications';

export async function POST(request: NextRequest) {
  try {
    const { type = 'system_alert', title, message, priority = 'normal' } = await request.json();

    const notification = await createNotification({
      type,
      title: title || 'Test Notification',
      message: message || 'This is a test notification to verify the system is working correctly.',
      priority,
      action_url: '/admin/notifications',
      data: {
        test: true,
        timestamp: new Date().toISOString()
      }
    });

    if (!notification) {
      return NextResponse.json(
        { success: false, error: 'Failed to create notification' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      notification,
      message: 'Test notification created successfully'
    });

  } catch (error) {
    console.error('Error creating test notification:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Test notification endpoint',
    usage: 'POST to this endpoint with optional { type, title, message, priority } to create a test notification'
  });
}
