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

    // Get customer ID before deleting booking
    const customerId = booking.customer_id;

    // Delete the booking (this will cascade delete related records)
    const { error: deleteBookingError } = await supabase
      .from('bookings')
      .delete()
      .eq('id', bookingId);

    if (deleteBookingError) {
      console.error('Delete booking error:', deleteBookingError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete rejected booking' },
        { status: 500 }
      );
    }

    // Delete the customer record as well
    const { error: deleteCustomerError } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId);

    if (deleteCustomerError) {
      console.error('Delete customer error:', deleteCustomerError);
      // Don't fail the request if customer deletion fails, just log it
      console.log('Customer deletion failed, but booking was deleted successfully');
    }

    console.log('Booking and customer data deleted successfully for rejection');

    return NextResponse.json({
      success: true,
      message: 'Booking rejected and customer data deleted successfully',
      deleted: true
    });

  } catch (error) {
    console.error('Error rejecting booking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
