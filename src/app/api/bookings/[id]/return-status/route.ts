import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params;
    const { 
      equipment_returned, 
      equipment_return_notes, 
      equipment_condition_return 
    } = await request.json();

    console.log('Updating return status for booking:', bookingId);

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
      equipment_returned,
      equipment_return_notes,
      equipment_condition_return,
      updated_at: new Date().toISOString()
    };

    // If marking as returned, set return date
    if (equipment_returned) {
      updateData.equipment_return_date = new Date().toISOString();
      
      // If booking is active and equipment is being returned, set status to completed
      if (currentBooking.status === 'active') {
        updateData.status = 'completed';
      }
    } else {
      // If marking as not returned, clear return date
      updateData.equipment_return_date = null;
      
      // If booking was completed and return is being undone, set back to active
      if (currentBooking.status === 'completed' && currentBooking.equipment_picked_up) {
        updateData.status = 'active';
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
      console.error('Error updating return status:', error);
      return NextResponse.json({ 
        success: false, 
        error: 'Failed to update return status' 
      }, { status: 500 });
    }

    console.log('Return status updated successfully:', data);

    return NextResponse.json({
      success: true,
      booking: data
    });

  } catch (error) {
    console.error('Error in return status update:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Internal server error' 
    }, { status: 500 });
  }
}
