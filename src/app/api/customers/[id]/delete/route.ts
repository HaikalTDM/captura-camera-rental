import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: customerId } = await params;

    console.log('Deleting customer:', customerId);

    // First, check if customer has any bookings
    const { data: customerBookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('id, booking_status')
      .eq('customer_id', customerId);

    if (bookingsError) {
      console.error('Error checking customer bookings:', bookingsError);
      return NextResponse.json(
        { success: false, error: 'Failed to check customer bookings' },
        { status: 500 }
      );
    }

    // Check if customer has active or confirmed bookings
    const activeBookings = customerBookings?.filter(
      booking => booking.booking_status === 'confirmed' || booking.booking_status === 'pending_approval'
    ) || [];

    if (activeBookings.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Cannot delete customer with ${activeBookings.length} active booking(s). Please complete or cancel all bookings first.`,
          activeBookings: activeBookings.length
        },
        { status: 400 }
      );
    }

    // If customer has completed bookings, we'll keep them for historical records
    // but we can still delete the customer if needed (cascade delete will handle bookings)
    
    // Delete the customer (this will cascade delete related bookings if configured)
    const { data: deletedCustomer, error: customerError } = await supabase
      .from('customers')
      .delete()
      .eq('id', customerId)
      .select()
      .single();

    if (customerError) {
      console.error('Error deleting customer:', customerError);
      return NextResponse.json(
        { success: false, error: 'Failed to delete customer' },
        { status: 500 }
      );
    }

    if (!deletedCustomer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 }
      );
    }

    console.log('Customer deleted successfully:', deletedCustomer.id);

    return NextResponse.json({
      success: true,
      message: 'Customer deleted successfully',
      customer: deletedCustomer,
      deletedBookings: customerBookings?.length || 0
    });

  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
