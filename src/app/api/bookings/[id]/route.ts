import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// DELETE endpoint for bookings (alternative to /delete route)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

    console.log('Deleting booking (root route):', bookingId);

    // First, delete related booking status history
    const { error: historyError } = await supabase
      .from('booking_status_history')
      .delete()
      .eq('booking_id', bookingId);

    if (historyError) {
      console.error('Error deleting booking status history:', historyError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete booking status history' },
        { status: 500 }
      );
    }

    // Delete calendar blocks associated with this booking
    const { error: calendarError } = await supabase
      .from('calendar_blocks')
      .delete()
      .eq('booking_id', bookingId);

    if (calendarError) {
      console.error('Error deleting calendar blocks:', calendarError);
      // Don't fail the request, just log it
    }

    // Then delete the booking
    const { data: deletedBooking, error: bookingError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId)
      .select()
      .single();

    if (bookingError) {
      console.error('Error deleting booking:', bookingError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete booking' },
        { status: 500 }
      );
    }

    if (!deletedBooking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    console.log('Booking deleted successfully:', deletedBooking.id);

    return NextResponse.json({
      success: true,
      message: 'Booking deleted successfully',
      booking: deletedBooking
    });

  } catch (error) {
    console.error('Error deleting booking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

