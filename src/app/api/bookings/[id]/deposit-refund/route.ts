import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const { 
      deposit_refunded, 
      deposit_refund_date, 
      deposit_refund_notes,
      deposit_refund_amount = 100 
    } = await request.json();

    console.log('Processing deposit refund for booking:', bookingId);

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

    // Update deposit refund status
    const updateData: any = {
      deposit_refunded: deposit_refunded,
      deposit_refund_amount: deposit_refund_amount,
      updated_at: new Date().toISOString()
    };

    // Set refund date and notes if marking as refunded
    if (deposit_refunded) {
      updateData.deposit_refund_date = deposit_refund_date || new Date().toISOString();
      updateData.deposit_refund_notes = deposit_refund_notes || null;

      // Automatically mark booking as completed
      updateData.booking_status = 'completed';

      // Automatically mark equipment as picked up and returned
      updateData.equipment_picked_up = true;
      updateData.equipment_returned = true;

      // Set pickup and return dates if not already set
      if (!booking.equipment_pickup_date) {
        updateData.equipment_pickup_date = new Date().toISOString();
      }
      if (!booking.equipment_return_date) {
        updateData.equipment_return_date = new Date().toISOString();
      }

      // Set equipment condition if not already set
      if (!booking.equipment_condition_return) {
        updateData.equipment_condition_return = 'good';
      }
    } else {
      updateData.deposit_refund_date = null;
      updateData.deposit_refund_notes = null;
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
      console.error('Update deposit refund error:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to update deposit refund status', details: updateError.message },
        { status: 500 }
      );
    }

    // Try to get camera info separately (camera_id might be a string, not a UUID reference)
    if (updatedBooking && updatedBooking.camera_id) {
      const { data: camera } = await supabase
        .from('cameras')
        .select('*')
        .eq('id', updatedBooking.camera_id)
        .single();

      if (camera) {
        updatedBooking.camera = camera;
      }
    }

    // Create payment record for the refund
    if (deposit_refunded) {
      const { error: paymentError } = await supabase
        .from('payment_records')
        .insert({
          booking_id: bookingId,
          payment_type: 'refund',
          amount: deposit_refund_amount,
          payment_method: 'cash', // Default, can be updated later
          payment_date: deposit_refund_date || new Date().toISOString(),
          notes: deposit_refund_notes || 'Deposit refund upon equipment return'
        });

      if (paymentError) {
        console.error('Error creating payment record:', paymentError);
        // Don't fail the request, just log the error
      }
    }

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: deposit_refunded
        ? 'Deposit refunded successfully. Booking marked as completed, equipment marked as picked up and returned.'
        : 'Deposit refund cancelled successfully'
    });

  } catch (error) {
    console.error('Deposit refund API error:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
