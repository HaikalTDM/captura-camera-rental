import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mirrorBookingUpsert } from '@/lib/hermes-mirror';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const { cancellation_reason, admin_notes } = await request.json();

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

    if (booking.booking_status === 'completed') {
      return NextResponse.json(
        { success: false, error: 'Cannot cancel a completed booking' },
        { status: 400 }
      );
    }

    if (booking.booking_status === 'cancelled' && booking.status === 'cancelled') {
      return NextResponse.json({
        success: true,
        message: 'Booking already cancelled',
        booking,
      });
    }

    const notes = [booking.admin_notes, admin_notes, cancellation_reason ? `Cancellation reason: ${cancellation_reason}` : null]
      .filter(Boolean)
      .join('\n');

    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update({
        booking_status: 'cancelled',
        status: 'cancelled',
        admin_notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', bookingId)
      .select('*')
      .single();

    if (updateError || !updatedBooking) {
      return NextResponse.json(
        { success: false, error: 'Failed to cancel booking' },
        { status: 500 }
      );
    }

    const { error: blockDeleteError } = await supabase
      .from('calendar_blocks')
      .delete()
      .eq('booking_id', bookingId);

    if (blockDeleteError) {
      console.error('Failed to delete calendar blocks after cancellation:', blockDeleteError);
    }

    void mirrorBookingUpsert(bookingId);

    return NextResponse.json({
      success: true,
      message: 'Booking cancelled successfully',
      booking: updatedBooking,
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
