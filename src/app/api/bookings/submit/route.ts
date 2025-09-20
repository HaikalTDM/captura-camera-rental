import { NextRequest, NextResponse } from 'next/server';
import { submitWebsiteBooking, checkCameraAvailability } from '@/lib/api/website-bookings';
import type { WebsiteBookingData } from '@/lib/api/website-bookings';

export async function POST(request: NextRequest) {
  try {
    const bookingData: WebsiteBookingData = await request.json();

    // Validate required fields
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
      'booking_source'
    ];

    const missingFields = requiredFields.filter(field => !bookingData[field as keyof WebsiteBookingData]);
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(bookingData.customer_email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid email format' 
        },
        { status: 400 }
      );
    }

    // Validate phone format (basic validation)
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(bookingData.customer_phone)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid phone number format' 
        },
        { status: 400 }
      );
    }

    // Validate dates
    const startDate = new Date(bookingData.start_date);
    const endDate = new Date(bookingData.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (startDate < today) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Start date cannot be in the past' 
        },
        { status: 400 }
      );
    }

    if (endDate <= startDate) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'End date must be after start date' 
        },
        { status: 400 }
      );
    }

    // Check camera availability
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
          conflictingBookings: availability.conflictingBookings
        },
        { status: 409 }
      );
    }

    // Submit the booking
    const result = await submitWebsiteBooking(bookingData);

    if (!result.success) {
      return NextResponse.json(
        { 
          success: false, 
          error: result.error || 'Failed to create booking' 
        },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      booking_id: result.booking_id,
      confirmation_number: result.confirmation_number,
      message: 'Booking submitted successfully'
    });

  } catch (error) {
    console.error('Error in booking submission API:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check camera availability
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
          error: 'Missing required parameters: camera_id, start_date, end_date' 
        },
        { status: 400 }
      );
    }

    const availability = await checkCameraAvailability(cameraId, startDate, endDate);

    return NextResponse.json({
      success: true,
      available: availability.available,
      conflictingBookings: availability.conflictingBookings
    });

  } catch (error) {
    console.error('Error checking camera availability:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error' 
      },
      { status: 500 }
    );
  }
}
