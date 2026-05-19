import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { mirrorBookingUpsert } from '@/lib/hermes-mirror'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const { 
      equipment_picked_up, 
      equipment_pickup_notes, 
      equipment_condition_pickup 
    } = await request.json();

    console.log('Updating pickup status for booking:', bookingId);

    // Get current booking to check status
    const { data: currentBooking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', bookingId)
      .single();

    if (fetchError) {
      console.error('Error fetching booking:', fetchError);
      return NextResponse.json({ 
        success: false, 
        error: 'Booking not found' 
      }, { status: 404 });
    }

    // Prepare update data
    const updateData: any = {
      equipment_picked_up,
      equipment_pickup_notes,
      equipment_condition_pickup,
      updated_at: new Date().toISOString()
    };

    // If marking as picked up, set pickup date
    if (equipment_picked_up) {
      updateData.equipment_pickup_date = new Date().toISOString();
      
      // If booking is confirmed and equipment is being picked up, set status to active
      if (currentBooking.booking_status === 'confirmed') {
        updateData.status = 'active';
      }
    } else {
      // If marking as not picked up, clear pickup date
      updateData.equipment_pickup_date = null;
      
      // If booking was active and equipment pickup is being undone, set back to confirmed
      if (currentBooking.status === 'active' && currentBooking.booking_status === 'confirmed') {
        updateData.status = 'confirmed';
      }
    }

    // Update booking
    const { data, error } = await supabase
      .from('bookings')
      .update(updateData)
      .eq('id', bookingId)
      .select(`
        *,
        customer:customers(*)
      `)
      .single();

    if (error) {
      console.error('Error updating pickup status:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update pickup status' 
      }, { status: 500 });
    }

    console.log('Pickup status updated successfully:', data);
    void mirrorBookingUpsert(bookingId);

    return NextResponse.json({
      success: true,
      booking: data
    });

  } catch (error) {
    console.error('Error in pickup status update:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
