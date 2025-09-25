import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    console.log('🔧 Fixing booking status inconsistencies...');

    // Step 1: Get all bookings to analyze the current state
    const { data: allBookings, error: fetchError } = await supabase
      .from('bookings')
      .select('id, status, booking_status, created_at')
      .order('created_at', { ascending: false });

    if (fetchError) {
      console.error('Error fetching bookings:', fetchError);
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch bookings',
        details: fetchError.message
      }, { status: 500 });
    }

    console.log(`Found ${allBookings?.length || 0} total bookings`);

    // Step 2: Analyze status distribution
    const statusAnalysis = {
      total: allBookings?.length || 0,
      statusField: {} as Record<string, number>,
      bookingStatusField: {} as Record<string, number>,
      mismatches: 0
    };

    const bookingsToFix: any[] = [];

    allBookings?.forEach(booking => {
      // Count status field values
      const status = booking.status || 'null';
      statusAnalysis.statusField[status] = (statusAnalysis.statusField[status] || 0) + 1;

      // Count booking_status field values
      const bookingStatus = booking.booking_status || 'null';
      statusAnalysis.bookingStatusField[bookingStatus] = (statusAnalysis.bookingStatusField[bookingStatus] || 0) + 1;

      // Check for mismatches that need fixing
      if (booking.status === 'pending' && booking.booking_status === 'pending_approval') {
        // This is actually correct - pending bookings should have pending_approval status
        // No fix needed
      } else if (booking.booking_status === 'pending_approval' && booking.status !== 'pending') {
        // booking_status is pending_approval but status is not pending - fix status
        bookingsToFix.push({
          id: booking.id,
          currentStatus: booking.status,
          currentBookingStatus: booking.booking_status,
          fixType: 'sync_status_to_pending',
          newStatus: 'pending'
        });
        statusAnalysis.mismatches++;
      } else if (booking.booking_status === 'confirmed' && booking.status === 'pending') {
        // booking_status is confirmed but status is still pending - fix status
        bookingsToFix.push({
          id: booking.id,
          currentStatus: booking.status,
          currentBookingStatus: booking.booking_status,
          fixType: 'sync_status_to_confirmed',
          newStatus: 'confirmed'
        });
        statusAnalysis.mismatches++;
      }
    });

    console.log('Status analysis:', statusAnalysis);
    console.log(`Found ${bookingsToFix.length} bookings that need fixing`);

    // Step 3: Apply fixes
    let fixedCount = 0;
    const fixResults = [];

    for (const booking of bookingsToFix) {
      try {
        const { error: updateError } = await supabase
          .from('bookings')
          .update({
            status: booking.newStatus,
            updated_at: new Date().toISOString()
          })
          .eq('id', booking.id);

        if (updateError) {
          console.error(`Error fixing booking ${booking.id}:`, updateError);
          fixResults.push({
            id: booking.id,
            success: false,
            error: updateError.message
          });
        } else {
          fixedCount++;
          fixResults.push({
            id: booking.id,
            success: true,
            fixType: booking.fixType,
            oldStatus: booking.currentStatus,
            newStatus: booking.newStatus
          });
        }
      } catch (err) {
        console.error(`Exception fixing booking ${booking.id}:`, err);
        fixResults.push({
          id: booking.id,
          success: false,
          error: err instanceof Error ? err.message : 'Unknown error'
        });
      }
    }

    // Step 4: Get updated status distribution
    const { data: updatedBookings, error: updatedFetchError } = await supabase
      .from('bookings')
      .select('status, booking_status')
      .order('created_at', { ascending: false });

    const updatedAnalysis = {
      statusField: {} as Record<string, number>,
      bookingStatusField: {} as Record<string, number>
    };

    updatedBookings?.forEach(booking => {
      const status = booking.status || 'null';
      updatedAnalysis.statusField[status] = (updatedAnalysis.statusField[status] || 0) + 1;

      const bookingStatus = booking.booking_status || 'null';
      updatedAnalysis.bookingStatusField[bookingStatus] = (updatedAnalysis.bookingStatusField[bookingStatus] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      message: 'Booking status fix completed',
      results: {
        totalBookings: statusAnalysis.total,
        bookingsAnalyzed: allBookings?.length || 0,
        bookingsNeedingFix: bookingsToFix.length,
        bookingsFixed: fixedCount,
        beforeFix: statusAnalysis,
        afterFix: updatedAnalysis,
        fixDetails: fixResults.slice(0, 10), // Show first 10 fix results
        recommendations: {
          allPendingFixed: updatedAnalysis.statusField.pending === updatedAnalysis.bookingStatusField.pending_approval,
          needsApproval: updatedAnalysis.bookingStatusField.pending_approval || 0,
          readyForPickup: updatedAnalysis.bookingStatusField.confirmed || 0
        }
      }
    });

  } catch (error) {
    console.error('Error in fix-booking-statuses:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
