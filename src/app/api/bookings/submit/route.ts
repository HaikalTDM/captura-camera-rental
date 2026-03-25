import { NextRequest, NextResponse } from 'next/server';
import { submitWebsiteBooking, submitWebsiteBookingGroup, checkCameraAvailability } from '@/lib/api/website-bookings';
import type { WebsiteBookingData, WebsiteBookingGroupData } from '@/lib/api/website-bookings';
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
    const payload = await request.json();
    const isGroupedBooking =
      Array.isArray(payload?.items) &&
      typeof payload?.start_date === 'string' &&
      typeof payload?.end_date === 'string';
    const bookingData = payload as WebsiteBookingData;
    const groupedBookingData = payload as WebsiteBookingGroupData;
    console.log('API: Received booking data:', bookingData);

    const requiredFields = isGroupedBooking
      ? [
          'items',
          'start_date',
          'end_date',
          'total_days',
          'customer_name',
          'customer_email',
          'customer_phone',
          'pickup_method',
          'booking_source',
        ]
      : [
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
      const value = payload[field as keyof typeof payload];
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
    if (!emailRegex.test(payload.customer_email)) {
      console.log('API: Email validation failed:', payload.customer_email);
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email format',
        },
        { status: 400 }
      );
    }

    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(payload.customer_phone)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid phone number format',
        },
        { status: 400 }
      );
    }

    const startDateStr = payload.start_date;
    const endDateStr = payload.end_date;
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
      if (isGroupedBooking) {
        const items = groupedBookingData.items || [];

        if (items.length === 0 || items.length > 3) {
          return NextResponse.json(
            {
              success: false,
              error: 'Rental Kit must contain between 1 and 3 cameras',
            },
            { status: 400 }
          );
        }

        const availabilityChecks = await Promise.all(
          items.map(async (item) => ({
            camera_id: item.camera_id,
            camera_name: item.camera_name,
            ...(await checkCameraAvailability(item.camera_id, groupedBookingData.start_date, groupedBookingData.end_date)),
          }))
        );

        const conflicts = availabilityChecks.filter((item) => !item.available);
        if (conflicts.length > 0) {
          return NextResponse.json(
            {
              success: false,
              error: 'One or more selected cameras are not available for the chosen dates',
              conflicts,
            },
            { status: 409 }
          );
        }
      } else {
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
      }
    } catch (availabilityError) {
      console.log('API: Availability check failed, proceeding anyway:', availabilityError);
    }

    const result = isGroupedBooking
      ? await submitWebsiteBookingGroup(groupedBookingData)
      : await submitWebsiteBooking(bookingData);

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
            const date = new Date(payload.start_date);
            date.setDate(date.getDate() - 1);
            return date;
          })();

      const cameraSummary = isGroupedBooking
        ? groupedBookingData.items.map((item) => item.camera_name).join(', ')
        : bookingData.camera_name;
      const totalAmount = isGroupedBooking
        ? groupedBookingData.items.reduce((sum, item) => sum + Number(item.total_amount || 0), 0) + Number(groupedBookingData.delivery_fee || 0)
        : bookingData.total_amount;
      const bookingIdentifier = result.booking_group_reference || result.confirmation_number || result.booking_id || '';

      const emailData = {
        bookingId: bookingIdentifier,
        customerName: payload.customer_name,
        cameraName: cameraSummary,
        phone: payload.customer_phone,
        email: payload.customer_email,
        adminEmail: appSettings.businessEmail,
        daysUntilPickup: Number(appSettings.reminderDaysBefore || 0),
        startDate: new Date(payload.start_date).toLocaleDateString('en-MY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        endDate: new Date(payload.end_date).toLocaleDateString('en-MY', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
        }),
        totalAmount,
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
            title: isGroupedBooking ? 'New Rental Kit Request' : 'New Booking',
            body: `${payload.customer_name} booked ${cameraSummary}`,
            data: { bookingId: result.booking_id, bookingGroupId: result.booking_group_id },
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
      booking_group_id: result.booking_group_id,
      booking_group_reference: result.booking_group_reference,
      confirmation_number: result.confirmation_number,
      booking: result.booking,
      bookings: result.bookings,
      booking_group: result.booking_group,
      customer: result.customer,
      message: isGroupedBooking ? 'Rental Kit submitted successfully' : 'Booking submitted successfully',
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
