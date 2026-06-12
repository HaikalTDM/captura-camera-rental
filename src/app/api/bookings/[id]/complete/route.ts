import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { notifyMirror } from '@/lib/api/notify-mirror';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const { equipment_condition_return, equipment_return_notes } = await request.json();

    console.log('Completing booking:', bookingId);

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

    // Update booking - mark everything as done
    const now = new Date().toISOString();
    const updateData: any = {
      booking_status: 'completed',
      status: 'completed',
      equipment_returned: true,
      equipment_return_date: now,
      equipment_return_notes: equipment_return_notes || 'Marked completed via API',
      updated_at: now,
    };

    // Set equipment condition if provided
    if (equipment_condition_return) {
      updateData.equipment_condition_return = equipment_condition_return;
    }

    // Ensure pickup is also marked if not already
    if (!booking.equipment_picked_up) {
      updateData.equipment_picked_up = true;
      updateData.equipment_pickup_date = now;
      updateData.equipment_condition_pickup = equipment_condition_return || 'good';
    }

    // Set equipment return date if not already set
    if (!booking.equipment_return_date) {
      updateData.equipment_return_date = now;
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
      console.error('Error completing booking:', updateError);
      return NextResponse.json(
        { success: false, error: 'Failed to complete booking', details: updateError.message },
        { status: 500 }
      );
    }

    // Try to get camera info separately
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

    console.log('Booking completed successfully:', updatedBooking.id);

    // Notify Hermes mirror (fire-and-forget)
    notifyMirror('booking.updated', { booking: updatedBooking }).catch(() => {});

    return NextResponse.json({
      success: true,
      booking: updatedBooking,
      message: 'Booking completed successfully. All fields (status, pickup, return) have been set.'
    });

  } catch (error) {
    console.error('Error in booking completion:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
