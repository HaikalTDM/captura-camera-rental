import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Debugging booking statuses...');

    // Get all bookings with their status fields
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        status,
        booking_status,
        created_at,
        start_date,
        end_date,
        customer:customers(full_name),
        camera:cameras(name)
      `)
      .order('created_at', { ascending: false })
      .limit(20);

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bookings',
        details: bookingsError.message
      }, { status: 500 });
    }

    // Analyze status distribution
    const statusDistribution = {
      status: {} as Record<string, number>,
      booking_status: {} as Record<string, number>
    };

    const statusAnalysis = bookings?.map(booking => {
      // Count status field
      const status = booking.status || 'null';
      statusDistribution.status[status] = (statusDistribution.status[status] || 0) + 1;

      // Count booking_status field
      const bookingStatus = booking.booking_status || 'null';
      statusDistribution.booking_status[bookingStatus] = (statusDistribution.booking_status[bookingStatus] || 0) + 1;

      return {
        id: booking.id.substring(0, 8) + '...',
        customer: booking.customer?.full_name || 'Unknown',
        camera: booking.camera?.name || 'Unknown',
        status: booking.status,
        booking_status: booking.booking_status,
        created_at: booking.created_at,
        start_date: booking.start_date,
        statusMismatch: booking.status !== booking.booking_status
      };
    }) || [];

    // Check database schema for status fields
    const { data: schemaInfo, error: schemaError } = await supabase
      .from('bookings')
      .select('status, booking_status')
      .limit(1);

    const schemaCheck = {
      hasStatusField: !schemaError && schemaInfo !== null,
      error: schemaError?.message || null
    };

    return NextResponse.json({
      success: true,
      message: 'Booking status analysis completed',
      results: {
        totalBookings: bookings?.length || 0,
        statusDistribution,
        schemaCheck,
        sampleBookings: statusAnalysis.slice(0, 10),
        statusMismatches: statusAnalysis.filter(b => b.statusMismatch).length,
        analysis: {
          allPending: statusAnalysis.every(b => b.status === 'pending'),
          allPendingApproval: statusAnalysis.every(b => b.booking_status === 'pending_approval'),
          mixedStatuses: new Set(statusAnalysis.map(b => b.status)).size > 1,
          needsApproval: statusAnalysis.filter(b => b.booking_status === 'pending_approval').length
        }
      }
    });

  } catch (error) {
    console.error('Error in debug-booking-statuses:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
