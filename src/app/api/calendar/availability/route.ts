import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const cameraId = searchParams.get('camera_id');
    const startDate = searchParams.get('start_date');
    const endDate = searchParams.get('end_date');

    if (!cameraId) {
      return NextResponse.json(
        { success: false, error: 'camera_id is required' },
        { status: 400 }
      );
    }

    // Default to next 3 months if no date range specified
    const defaultStartDate = startDate || new Date().toISOString().split('T')[0];
    const defaultEndDate = endDate || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    console.log('Fetching availability for:', { cameraId, startDate: defaultStartDate, endDate: defaultEndDate });

    // Get confirmed bookings for the camera in the date range
    // A booking overlaps if: booking_start <= range_end AND booking_end >= range_start
    const { data: confirmedBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('start_date, end_date, booking_status, id')
      .eq('camera_id', cameraId)
      .eq('booking_status', 'confirmed')
      .lte('start_date', defaultEndDate)  // Booking starts on or before range end
      .gte('end_date', defaultStartDate);  // Booking ends on or after range start

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch bookings' },
        { status: 500 }
      );
    }

    // Get calendar blocks for the camera in the date range
    // A block overlaps if: block_start <= range_end AND block_end >= range_start
    const { data: calendarBlocks, error: blocksError } = await supabase
      .from('calendar_blocks')
      .select('start_date, end_date, block_type, reason')
      .eq('camera_id', cameraId)
      .lte('start_date', defaultEndDate)  // Block starts on or before range end
      .gte('end_date', defaultStartDate);  // Block ends on or after range start

    if (blocksError) {
      console.error('Error fetching calendar blocks:', blocksError);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch calendar blocks' },
        { status: 500 }
      );
    }

    // Combine all unavailable dates
    const unavailableDates = [];

    // Add confirmed booking dates
    confirmedBookings?.forEach(booking => {
      const start = new Date(booking.start_date);
      const end = new Date(booking.end_date);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        unavailableDates.push({
          date: date.toISOString().split('T')[0],
          type: 'booking',
          reason: 'Confirmed booking',
          booking_id: booking.id
        });
      }
    });

    // Add calendar block dates
    calendarBlocks?.forEach(block => {
      const start = new Date(block.start_date);
      const end = new Date(block.end_date);
      
      for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
        unavailableDates.push({
          date: date.toISOString().split('T')[0],
          type: block.block_type,
          reason: block.reason || `${block.block_type} block`
        });
      }
    });

    // Remove duplicates and sort
    const uniqueUnavailableDates = Array.from(
      new Map(unavailableDates.map(item => [item.date, item])).values()
    ).sort((a, b) => a.date.localeCompare(b.date));

    return NextResponse.json({
      success: true,
      camera_id: cameraId,
      date_range: {
        start: defaultStartDate,
        end: defaultEndDate
      },
      unavailable_dates: uniqueUnavailableDates,
      total_unavailable_days: uniqueUnavailableDates.length
    });

  } catch (error) {
    console.error('Error fetching calendar availability:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint to check if specific dates are available
export async function POST(request: NextRequest) {
  try {
    const { camera_id, start_date, end_date, exclude_booking_id } = await request.json();

    if (!camera_id || !start_date || !end_date) {
      return NextResponse.json(
        { success: false, error: 'camera_id, start_date, and end_date are required' },
        { status: 400 }
      );
    }

    console.log('Checking availability for:', { camera_id, start_date, end_date, exclude_booking_id });

    // Use the database function to check availability
    const { data: isAvailable, error } = await supabase
      .rpc('check_camera_availability', {
        p_camera_id: camera_id,
        p_start_date: start_date,
        p_end_date: end_date,
        p_exclude_booking_id: exclude_booking_id || null
      });

    if (error) {
      console.error('Availability check error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to check availability' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      available: isAvailable,
      camera_id,
      date_range: {
        start: start_date,
        end: end_date
      }
    });

  } catch (error) {
    console.error('Error checking availability:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
