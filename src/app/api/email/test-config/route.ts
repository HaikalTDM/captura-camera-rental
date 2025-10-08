import { NextRequest, NextResponse } from 'next/server';
import { testEmailConfig, sendPickupReminder } from '@/lib/email/emailService';

/**
 * API Route: Test email configuration
 * GET /api/email/test-config
 */
export async function GET(request: NextRequest) {
  try {
    console.log('🧪 Testing email configuration...');

    // Test connection
    const configOk = await testEmailConfig();

    if (!configOk) {
      return NextResponse.json({
        success: false,
        error: 'Email configuration test failed. Check your EMAIL_USER and EMAIL_APP_PASSWORD environment variables.'
      }, { status: 500 });
    }

    // Send test email
    const testResult = await sendPickupReminder({
      bookingId: 'test-' + Date.now(),
      customerName: 'Test Customer',
      cameraName: 'DJI Osmo Pocket 3',
      phone: '+60 17-746 4121',
      email: 'test@example.com',
      pickupDate: new Date().toLocaleDateString('en-MY', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    });

    if (testResult) {
      return NextResponse.json({
        success: true,
        message: 'Email configuration is working correctly! Check your inbox at ' + (process.env.ADMIN_EMAIL || 'haikaltdm46@gmail.com'),
        config: {
          from: process.env.EMAIL_FROM || 'captura.my@gmail.com',
          to: process.env.ADMIN_EMAIL || 'haikaltdm46@gmail.com',
          user: process.env.EMAIL_USER || 'captura.my@gmail.com'
        }
      });
    } else {
      return NextResponse.json({
        success: false,
        error: 'Failed to send test email. Check logs for details.'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Error testing email config:', error);
    return NextResponse.json({
      success: false,
      error: 'Email test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

