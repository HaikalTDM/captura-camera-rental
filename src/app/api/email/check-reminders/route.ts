import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { sendPickupReminder, sendReturnReminder } from '@/lib/email/emailService';

/**
 * API Route: Check for pickup and return reminders
 * This should be called daily (e.g., via cron job or Vercel Cron)
 * 
 * GET /api/email/check-reminders
 */
export async function GET(request: NextRequest) {
  console.log('🔔 Checking for pickup and return reminders...');

  try {
    const today = new Date().toISOString().split('T')[0];
    const pickupsSent: string[] = [];
    const returnsSent: string[] = [];
    const errors: string[] = [];

    // 1. CHECK FOR PICKUP REMINDERS
    // Get bookings where pickup_date is today and equipment not yet picked up
    const { data: pickupsToday, error: pickupError } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        camera:cameras(*)
      `)
      .eq('pickup_date', today)
      .eq('equipment_picked_up', false)
      .eq('booking_status', 'confirmed');

    if (pickupError) {
      console.error('Error fetching pickups:', pickupError);
      errors.push('Failed to fetch pickup reminders');
    } else if (pickupsToday && pickupsToday.length > 0) {
      console.log(`📦 Found ${pickupsToday.length} pickups for today`);

      for (const booking of pickupsToday) {
        try {
          const success = await sendPickupReminder({
            bookingId: booking.id,
            customerName: booking.customer?.full_name || booking.customer?.name || 'Customer',
            cameraName: booking.camera?.name || 'Camera',
            phone: booking.customer?.phone || 'N/A',
            email: booking.customer?.email || 'N/A',
            pickupDate: new Date(booking.pickup_date).toLocaleDateString('en-MY', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          });

          if (success) {
            pickupsSent.push(booking.id);
          } else {
            errors.push(`Failed to send pickup reminder for ${booking.id}`);
          }
        } catch (error) {
          console.error(`Error sending pickup reminder for ${booking.id}:`, error);
          errors.push(`Error with pickup ${booking.id}`);
        }
      }
    } else {
      console.log('No pickups scheduled for today');
    }

    // 2. CHECK FOR RETURN REMINDERS
    // Get bookings where end_date is today and equipment not yet returned
    const { data: returnsToday, error: returnError } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        camera:cameras(*)
      `)
      .eq('end_date', today)
      .eq('equipment_picked_up', true)
      .eq('equipment_returned', false)
      .eq('booking_status', 'confirmed');

    if (returnError) {
      console.error('Error fetching returns:', returnError);
      errors.push('Failed to fetch return reminders');
    } else if (returnsToday && returnsToday.length > 0) {
      console.log(`🔙 Found ${returnsToday.length} returns for today`);

      for (const booking of returnsToday) {
        try {
          const success = await sendReturnReminder({
            bookingId: booking.id,
            customerName: booking.customer?.full_name || booking.customer?.name || 'Customer',
            cameraName: booking.camera?.name || 'Camera',
            phone: booking.customer?.phone || 'N/A',
            email: booking.customer?.email || 'N/A',
            returnDate: new Date(booking.end_date).toLocaleDateString('en-MY', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          });

          if (success) {
            returnsSent.push(booking.id);
          } else {
            errors.push(`Failed to send return reminder for ${booking.id}`);
          }
        } catch (error) {
          console.error(`Error sending return reminder for ${booking.id}:`, error);
          errors.push(`Error with return ${booking.id}`);
        }
      }
    } else {
      console.log('No returns scheduled for today');
    }

    // Return summary
    return NextResponse.json({
      success: true,
      date: today,
      summary: {
        pickups: {
          count: pickupsToday?.length || 0,
          sent: pickupsSent.length,
          ids: pickupsSent
        },
        returns: {
          count: returnsToday?.length || 0,
          sent: returnsSent.length,
          ids: returnsSent
        },
        errors: errors.length > 0 ? errors : undefined
      },
      message: `Sent ${pickupsSent.length} pickup reminders and ${returnsSent.length} return reminders`
    });

  } catch (error) {
    console.error('Error in reminder check:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check reminders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

