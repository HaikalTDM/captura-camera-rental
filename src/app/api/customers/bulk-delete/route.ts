import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function POST(request: NextRequest) {
  try {
    const { customerIds } = await request.json();

    if (!customerIds || !Array.isArray(customerIds) || customerIds.length === 0) {
      return NextResponse.json(
        { success: false, error: 'Customer IDs array is required' },
        { status: 400 }
      );
    }

    console.log('Bulk deleting customers:', customerIds);

    const results = {
      deleted: [] as string[],
      failed: [] as { id: string; reason: string }[],
      skipped: [] as { id: string; reason: string }[]
    };

    // Process each customer individually to handle different scenarios
    for (const customerId of customerIds) {
      try {
        // Check if customer has any active bookings
        const { data: customerBookings, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, booking_status')
          .eq('customer_id', customerId);

        if (bookingsError) {
          results.failed.push({
            id: customerId,
            reason: 'Failed to check customer bookings'
          });
          continue;
        }

        // Check if customer has active or confirmed bookings
        const activeBookings = customerBookings?.filter(
          booking => booking.booking_status === 'confirmed' || booking.booking_status === 'pending_approval'
        ) || [];

        if (activeBookings.length > 0) {
          results.skipped.push({
            id: customerId,
            reason: `Has ${activeBookings.length} active booking(s)`
          });
          continue;
        }

        // Delete the customer
        const { data: deletedCustomer, error: customerError } = await supabase
          .from('customers')
          .delete()
          .eq('id', customerId)
          .select('id, full_name')
          .single();

        if (customerError) {
          results.failed.push({
            id: customerId,
            reason: 'Failed to delete customer'
          });
          continue;
        }

        if (deletedCustomer) {
          results.deleted.push(customerId);
          console.log('Customer deleted successfully:', deletedCustomer.id);
        } else {
          results.failed.push({
            id: customerId,
            reason: 'Customer not found'
          });
        }

      } catch (error) {
        console.error('Error processing customer:', customerId, error);
        results.failed.push({
          id: customerId,
          reason: 'Internal error during deletion'
        });
      }
    }

    const summary = {
      total: customerIds.length,
      deleted: results.deleted.length,
      failed: results.failed.length,
      skipped: results.skipped.length
    };

    console.log('Bulk delete summary:', summary);

    return NextResponse.json({
      success: true,
      message: `Bulk delete completed: ${summary.deleted} deleted, ${summary.skipped} skipped, ${summary.failed} failed`,
      summary,
      results
    });

  } catch (error) {
    console.error('Error in bulk delete:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
