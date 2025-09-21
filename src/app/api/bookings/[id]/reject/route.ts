import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { rejection_reason, admin_notes } = await request.json();
    const { id: bookingId } = await params;

    console.log('Rejecting booking:', bookingId);

    if (!rejection_reason) {
      return NextResponse.json(
        { success: false, error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

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
          error: `Cannot reject booking with status: ${booking.booking_status}` 
        },
        { status: 400 }
      );
    }

    // Update booking status to rejected
    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        booking_status: 'rejected',
        approved_at: new Date().toISOString(),
        rejection_reason: rejection_reason,
        admin_notes: admin_notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId)
      .select()
      .single();

    if (updateError) {
      console.error('Update booking error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to reject booking' },
        { status: 500 }
      );
    }

    console.log('Booking rejected successfully:', updatedBooking);

    return NextResponse.json({
      success: true,
      message: 'Booking rejected successfully',
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Error rejecting booking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
