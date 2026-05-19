import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { mirrorBookingUpsert } from '@/lib/hermes-mirror';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const { deposit_paid, deposit_paid_date } = await request.json();

    console.log('Updating deposit payment status for booking:', bookingId);

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

    // Update deposit payment status
    const updateData: any = {
      deposit_paid: deposit_paid,
      updated_at: new Date().toISOString()
    };

    // Set deposit_paid_date if marking as paid
    if (deposit_paid) {
      updateData.deposit_paid_date = deposit_paid_date || new Date().toISOString();
    } else {
      updateData.deposit_paid_date = null;
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
      console.error('Update deposit payment error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update deposit payment status' },
        { status: 500 }
      );
    }

    console.log('Deposit payment status updated successfully:', updatedBooking);
    void mirrorBookingUpsert(bookingId);

    return NextResponse.json({
      success: true,
      message: `Deposit marked as ${deposit_paid ? 'paid' : 'unpaid'}`,
      booking: updatedBooking
    });

  } catch (error) {
    console.error('Error in deposit payment update:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
