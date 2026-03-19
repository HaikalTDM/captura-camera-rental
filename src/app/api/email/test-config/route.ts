import { NextResponse } from 'next/server';
import { sendPickupReminder, testEmailConfig } from '@/lib/email/emailService';

async function runEmailTest() {
  console.log('Testing email configuration...');

  const configOk = await testEmailConfig();

  if (!configOk) {
    return NextResponse.json(
      {
        success: false,
        error: 'Email configuration test failed. Check your EMAIL_USER and EMAIL_APP_PASSWORD environment variables.'
      },
      { status: 500 }
    );
  }

  const testResult = await sendPickupReminder({
    bookingId: 'test-' + Date.now(),
    customerName: 'Test Customer',
    cameraName: 'DJI Osmo Pocket 3',
    phone: '+60 17-746 4121',
    email: 'test@example.com',
    daysUntilPickup: 0,
    pickupDate: new Date().toLocaleDateString('en-MY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  });

  if (!testResult) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to send test email. Check logs for details.'
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    message: `Test reminder sent successfully. Check ${(process.env.ADMIN_EMAIL || 'your admin inbox')}.`,
    config: {
      from: process.env.EMAIL_FROM || 'captura.my@gmail.com',
      to: process.env.ADMIN_EMAIL || 'haikaltdm46@gmail.com',
      user: process.env.EMAIL_USER || 'captura.my@gmail.com'
    }
  });
}

export async function GET() {
  try {
    return runEmailTest();
  } catch (error) {
    console.error('Error testing email config:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Email test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    return runEmailTest();
  } catch (error) {
    console.error('Error testing email config:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Email test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
