import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mirrorBookingUpsert } from '@/lib/hermes-mirror';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const { final_payment_paid, final_payment_paid_date } = await request.json();

    console.log('Updating final payment status for booking:', bookingId);

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

    // Update final payment status
    const updateData: any = {
      final_payment_paid: final_payment_paid,
      updated_at: new Date().toISOString()
    };

    // Set final_payment_paid_date if marking as paid
    if (final_payment_paid) {
      updateData.final_payment_paid_date = final_payment_paid_date || new Date().toISOString();
    } else {
      updateData.final_payment_paid_date = null;
    }

    const { data: updatedBooking, error: updateError } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select(`
        *,
        customer:customers(*)
      `)
      .single();

    if (updateError) {
      console.error('Update final payment error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update final payment status' },
        { status: 500 }
      );
    }

    console.log('Final payment status updated successfully:', updatedBooking);
    void mirrorBookingUpsert(bookingId);

    return NextResponse.json({
      success: true,
      message: `Final payment marked as ${final_payment_paid ? 'paid' : 'unpaid'}`,
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Error in final payment update:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
