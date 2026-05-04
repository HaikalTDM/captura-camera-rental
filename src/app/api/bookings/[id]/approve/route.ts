import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { admin_notes } = await request.json();
    const { id: bookingId } = await params;

    console.log('Approving booking:', bookingId);

    // Get current booking details
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError || !booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    // Check if booking is in pending status
    if (booking.booking_status !== 'pending_approval') {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot approve booking with status: ${booking.booking_status}` 
        },
        { status: 400 }
      );
    }

    // Check camera availability before confirming
    const { data: availabilityCheck, error: availabilityError } = await supabase
      .rpc('check_camera_availability', {
        p_camera_id: booking.camera_id,
        p_start_date: booking.start_date,
        p_end_date: booking.end_date,
        p_exclude_booking_id: bookingId
      });

    if (availabilityError) {
      console.error('Availability check error:', availabilityError);
      return NextResponse.json(
        { success: false, error: 'Failed to check camera availability' },
        { status: 500 }
      );
    }

    if (!availabilityCheck) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Camera is not available for the selected dates' 
        },
        { status: 409 }
      );
    }

    const timestamp = new Date().toISOString();

    // Update booking status to confirmed and auto-mark deposit as paid
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        booking_status: 'confirmed',
        approved_at: timestamp,
        deposit_paid: true,
        deposit_paid_date: booking.deposit_paid_date || timestamp,
        admin_notes: admin_notes || null,
        updated_at: timestamp
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Update booking error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to approve booking' },
        { status: 500 }
      );
    }

    // The calendar block will be automatically created by the database trigger

    console.log('Booking approved successfully:', updatedBooking);

    return NextResponse.json({
      success: true,
      message: 'Booking approved successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Error approving booking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
