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
      equipment_condition_return,
      booking_status 
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

    // If marking as returned, set return date and update status
    if (equipment_returned) {
      updateData.equipment_return_date = new Date().toISOString();
      
      // Auto-complete booking when equipment is returned
      if (booking_status) {
        updateData.booking_status = booking_status;
        console.log('✓ Equipment returned - Auto-completing booking to:', booking_status);
      } else {
        // Fallback: auto-complete if not already completed or cancelled
        if (currentBooking.booking_status !== 'completed' && currentBooking.booking_status !== 'cancelled') {
          updateData.booking_status = 'completed';
          console.log('✓ Equipment returned - Auto-completing booking to: completed');
        }
      }
    } else {
      // If marking as not returned (undoing), clear return date
      updateData.equipment_return_date = null;
      
      // Keep the booking_status as provided (if undoing, frontend sends original status)
      if (booking_status && booking_status !== 'completed') {
        updateData.booking_status = booking_status;
        console.log('↺ Undoing return - Reverting booking status to:', booking_status);
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
    
    // Fetch camera separately if needed
    if (data && data.camera_id) {
      const { data: cameraData } = await supabase
        .from('cameras')
        .select('*')
        .eq('id', data.camera_id)
        .single();
      
      if (cameraData) {
        data.camera = cameraData;
      }
    }

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
