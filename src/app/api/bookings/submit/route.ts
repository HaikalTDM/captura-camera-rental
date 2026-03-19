import { NextRequest, NextResponse } from 'next/server';
import { submitWebsiteBooking, checkCameraAvailability } from '@/lib/api/website-bookings';
import type { WebsiteBookingData } from '@/lib/api/website-bookings';
import {
  sendCustomerThankYouEmail,
  sendCustomerPickupReminder,
  sendNewBookingNotification,
} from '@/lib/email/emailService';
import { getAdminSettings } from '@/lib/business-settings-server';

export async function POST(request: NextRequest) {
  console.log('API: POST request received at', new Date().toISOString());

  try {
    const appSettings = await getAdminSettings();
    const bookingData: WebsiteBookingData = await request.json();
    console.log('API: Received booking data:', bookingData);

    const requiredFields = [
      'camera_id',
      'camera_name',
      'start_date',
      'end_date',
      'total_days',
      'daily_rate',
      'total_amount',
      'deposit_amount',
      'final_payment_amount',
      'customer_name',
      'customer_email',
      'customer_phone',
      'pickup_method',
      'booking_source',
    ];

    const missingFields = requiredFields.filter((field) => {
      const value = bookingData[field as keyof WebsiteBookingData];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      console.log('API: Missing fields:', missingFields);
      console.log('API: Received data keys:', Object.keys(bookingData));
      missingFields.forEach((field) => {
        console.log(`API: Field "${field}" value:`, bookingData[field as keyof WebsiteBookingData]);
      });

      return NextResponse.json(
        {
          success: false,
          error: `Missing required fields: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.customer_email)) {
      console.log('API: Email validation failed:', bookingData.customer_email);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(bookingData.customer_phone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid phone number format',
        },
        { status: 400 }
      );
    }

    const startDateStr = bookingData.start_date;
    const endDateStr = bookingData.end_date;
    const today = new Date();
    const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
      today.getDate()
    ).padStart(2, '0')}`;

    console.log('API: Date validation:', {
      startDateStr,
      endDateStr,
      todayStr,
      isStartDateInPast: startDateStr < todayStr,
    });

    if (startDateStr < todayStr) {
      return NextResponse.json(
        {
          success: false,
          error: 'Start date cannot be in the past',
        },
        { status: 400 }
      );
    }

    if (endDateStr < startDateStr) {
      return NextResponse.json(
        {
          success: false,
          error: 'End date cannot be before start date',
        },
        { status: 400 }
      );
    }

    try {
      const availability = await checkCameraAvailability(
        bookingData.camera_id,
        bookingData.start_date,
        bookingData.end_date
      );

      if (!availability.available) {
        return NextResponse.json(
          {
            success: false,
            error: 'Camera is not available for the selected dates',
            conflictingBookings: availability.conflictingBookings,
          },
          { status: 409 }
        );
      }
    } catch (availabilityError) {
      console.log('API: Availability check failed, proceeding anyway:', availabilityError);
    }

    const result = await submitWebsiteBooking(bookingData);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || 'Failed to create booking',
        },
        { status: 500 }
      );
    }

    try {
      if (!appSettings.emailNotifications) {
        return NextResponse.json({
          success: true,
          booking_id: result.booking_id,
          confirmation_number: result.confirmation_number,
          booking: result.booking,
          customer: result.customer,
          message: 'Booking submitted successfully',
        });
      }

      const pickupDateObj = result.booking?.pickup_date
        ? new Date(result.booking.pickup_date)
        : (() => {
            const date = new Date(bookingData.start_date);
            date.setDate(date.getDate() - 1);
            return date;
          })();

      const emailData = {
        bookingId: result.booking_id || '',
        customerName: bookingData.customer_name,
        cameraName: bookingData.camera_name,
        phone: bookingData.customer_phone,
        email: bookingData.customer_email,
        adminEmail: appSettings.businessEmail,
        daysUntilPickup: Number(appSettings.reminderDaysBefore || 0),
        startDate: new Date(bookingData.start_date).toLocaleDateString('en-MY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        endDate: new Date(bookingData.end_date).toLocaleDateString('en-MY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        totalAmount: bookingData.total_amount,
        pickupDate: pickupDateObj.toLocaleDateString('en-MY', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
      };

      const [customerEmailResult, adminEmailResult] = await Promise.allSettled([
        sendCustomerThankYouEmail(emailData),
        sendNewBookingNotification(emailData),
      ]);

      if (customerEmailResult.status === 'fulfilled' && customerEmailResult.value) {
        console.log('Thank you email sent to customer');
      } else {
        console.error(
          'Customer booking email failed:',
          customerEmailResult.status === 'rejected'
            ? customerEmailResult.reason
            : 'sendCustomerThankYouEmail returned false'
        );
      }

      if (adminEmailResult.status === 'fulfilled' && adminEmailResult.value) {
        console.log('New booking notification sent to admin');
      } else {
        console.error(
          'Admin booking notification failed:',
          adminEmailResult.status === 'rejected'
            ? adminEmailResult.reason
            : 'sendNewBookingNotification returned false'
        );
      }

      try {
        await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/push-notifications/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'New Booking',
            body: `${bookingData.customer_name} booked ${bookingData.camera_name}`,
            data: { bookingId: result.booking_id },
          }),
        });
        console.log('Push notification sent to admin');
      } catch (pushError) {
        console.error('Error sending push notification:', pushError);
      }

      const todayUtc = new Date().toISOString().split('T')[0];
      const pickupDateUtc = pickupDateObj.toISOString().split('T')[0];

      if (pickupDateUtc === todayUtc) {
        const immediatePickupReminder = await sendCustomerPickupReminder({
          ...emailData,
          daysUntilPickup: 0,
        });

        if (immediatePickupReminder) {
          console.log('Immediate pickup reminder sent (same-day booking)');
        } else {
          console.error('Immediate pickup reminder failed');
        }
      }
    } catch (emailError) {
      console.error('Error sending booking notification emails:', emailError);
    }

    return NextResponse.json({
      success: true,
      booking_id: result.booking_id,
      confirmation_number: result.confirmation_number,
      booking: result.booking,
      customer: result.customer,
      message: 'Booking submitted successfully',
    });
  } catch (error) {
    console.error('Error in booking submission API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cameraId = searchParams.get('camera_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!cameraId || !startDate || !endDate) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required parameters: camera_id, start_date, end_date',
        },
        { status: 400 }
      );
    }

    const availability = await checkCameraAvailability(cameraId, startDate, endDate);

    return NextResponse.json({
      success: true,
      available: availability.available,
      conflictingBookings: availability.conflictingBookings,
    });
  } catch (error) {
    console.error('Error checking camera availability:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
      },
      { status: 500 }
    );
  }
}
