import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mirrorBookingDelete } from '@/lib/hermes-mirror';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;

    console.log('Deleting booking:', bookingId);

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
    void mirrorBookingDelete(bookingId);

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
