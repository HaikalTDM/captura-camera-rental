import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';
import { 
  sendPickupReminder, 
  sendReturnReminder,
  sendCustomerPickupReminder,
  sendCustomerReturnReminder
} from '@/lib/email/emailService';

/**
 * API Route: Check for pickup and return reminders
 * This should be called daily (e.g., via cron job or Vercel Cron)
 * 
 * GET /api/email/check-reminders
 */
export async function GET(request: NextRequest) {
  try {
    // Ensure server-side configuration exists
    const hasServiceKey = !!process.env.SUPABASE_SERVICE_ROLE_KEY;
    const today = new Date().toISOString().split('T')[0];
    const pickupsSent: string[] = [];
    const returnsSent: string[] = [];
    const errors: string[] = [];
    
    if (!hasServiceKey) {
      return NextResponse.json({
        success: false,
        error: 'Server configuration error: Missing SUPABASE_SERVICE_ROLE_KEY'
      }, { status: 500 });
    }

    // 1. CHECK FOR PICKUP REMINDERS
    // Get bookings where pickup_date is today and equipment not yet picked up
    const { data: pickupsToday, error: pickupError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('pickup_date', today)
      .eq('equipment_picked_up', false)
      .eq('booking_status', 'confirmed');

    if (pickupError) {
      errors.push(`Failed to fetch pickup reminders: ${pickupError.message || 'Unknown error'}`);
    } else if (pickupsToday && pickupsToday.length > 0) {
      // Batch-fetch related entities to avoid N+1 queries
      const uniquePickupCustomerIds = Array.from(new Set(pickupsToday.map(b => b.customer_id).filter(Boolean)));
      const uniquePickupCameraIds = Array.from(new Set(pickupsToday.map(b => b.camera_id).filter(Boolean)));

      const [{ data: pickupCustomers }, { data: pickupCameras }] = await Promise.all([
        uniquePickupCustomerIds.length > 0
          ? supabaseAdmin.from('customers').select('*').in('id', uniquePickupCustomerIds)
          : Promise.resolve({ data: [] as any[] }),
        uniquePickupCameraIds.length > 0
          ? supabaseAdmin.from('cameras').select('*').in('id', uniquePickupCameraIds)
          : Promise.resolve({ data: [] as any[] })
      ]);

      const pickupCustomerById = new Map<string, any>((pickupCustomers || []).map(c => [c.id, c]));
      const pickupCameraById = new Map<string, any>((pickupCameras || []).map(c => [c.id, c]));

      for (const booking of pickupsToday) {
        try {
          const customer = pickupCustomerById.get(booking.customer_id);
          const camera = pickupCameraById.get(booking.camera_id);
          
          const emailData = {
            bookingId: booking.id,
            customerName: customer?.full_name || customer?.name || 'Customer',
            cameraName: camera?.name || booking.camera_name || 'Camera',
            phone: customer?.phone || 'N/A',
            email: customer?.email || 'N/A',
            pickupDate: new Date(booking.pickup_date).toLocaleDateString('en-MY', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          };

          // Send reminder to admin
          const adminSuccess = await sendPickupReminder(emailData);
          
          // Send reminder to customer
          const customerSuccess = await sendCustomerPickupReminder(emailData);

          // Send push notification
          try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/push-notifications/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: '📦 Pickup Today',
                body: `${emailData.customerName} picking up ${emailData.cameraName}`,
                data: { bookingId: booking.id, type: 'pickup' }
              })
            });
          } catch (pushError) {
            // swallow push notification errors
          }

          if (adminSuccess || customerSuccess) {
            pickupsSent.push(booking.id);
          } else {
            errors.push(`Failed to send pickup reminder for ${booking.id}`);
          }
        } catch (error) {
          console.error(`Error sending pickup reminder for ${booking.id}:`, error);
          errors.push(`Error with pickup ${booking.id}`);
        }
      }
    }

    // 2. CHECK FOR RETURN REMINDERS
    // Get bookings where end_date is today and equipment not yet returned
    const { data: returnsToday, error: returnError } = await supabaseAdmin
      .from('bookings')
      .select('*')
      .eq('end_date', today)
      .eq('equipment_picked_up', true)
      .eq('equipment_returned', false)
      .eq('booking_status', 'confirmed');

    if (returnError) {
      errors.push(`Failed to fetch return reminders: ${returnError.message || 'Unknown error'}`);
    } else if (returnsToday && returnsToday.length > 0) {
      // Batch-fetch related entities to avoid N+1 queries
      const uniqueReturnCustomerIds = Array.from(new Set(returnsToday.map(b => b.customer_id).filter(Boolean)));
      const uniqueReturnCameraIds = Array.from(new Set(returnsToday.map(b => b.camera_id).filter(Boolean)));

      const [{ data: returnCustomers }, { data: returnCameras }] = await Promise.all([
        uniqueReturnCustomerIds.length > 0
          ? supabaseAdmin.from('customers').select('*').in('id', uniqueReturnCustomerIds)
          : Promise.resolve({ data: [] as any[] }),
        uniqueReturnCameraIds.length > 0
          ? supabaseAdmin.from('cameras').select('*').in('id', uniqueReturnCameraIds)
          : Promise.resolve({ data: [] as any[] })
      ]);

      const returnCustomerById = new Map<string, any>((returnCustomers || []).map(c => [c.id, c]));
      const returnCameraById = new Map<string, any>((returnCameras || []).map(c => [c.id, c]));

      for (const booking of returnsToday) {
        try {
          const customer = returnCustomerById.get(booking.customer_id);
          const camera = returnCameraById.get(booking.camera_id);
          
          const emailData = {
            bookingId: booking.id,
            customerName: customer?.full_name || customer?.name || 'Customer',
            cameraName: camera?.name || booking.camera_name || 'Camera',
            phone: customer?.phone || 'N/A',
            email: customer?.email || 'N/A',
            returnDate: new Date(booking.end_date).toLocaleDateString('en-MY', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })
          };

          // Send reminder to admin
          const adminSuccess = await sendReturnReminder(emailData);
          
          // Send reminder to customer (mentions 10 PM deadline)
          const customerSuccess = await sendCustomerReturnReminder(emailData);

          // Send push notification
          try {
            await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/push-notifications/send`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                title: '🔙 Return Today',
                body: `${emailData.customerName} returning ${emailData.cameraName} by 10 PM`,
                data: { bookingId: booking.id, type: 'return' }
              })
            });
          } catch (pushError) {
            // swallow push notification errors
          }

          if (adminSuccess || customerSuccess) {
            returnsSent.push(booking.id);
          } else {
            errors.push(`Failed to send return reminder for ${booking.id}`);
          }
        } catch (error) {
          console.error(`Error sending return reminder for ${booking.id}:`, error);
          errors.push(`Error with return ${booking.id}`);
        }
      }
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

