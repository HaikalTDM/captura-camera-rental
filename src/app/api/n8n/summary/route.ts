import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * n8n Tool: GET /api/n8n/summary
 * Returns a full operational snapshot of Captura for n8n to orient itself.
 * Includes: pending bookings, active rentals, today's pickups + returns,
 * available cameras, and overdue payments.
 * n8n calls this first to build situational awareness.
 */
export async function GET() {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0];

  const [
    { data: cameras },
    { data: pendingBookingsData },
    { data: activeRentalsData },
    { data: todayPickupsData },
    { data: todayReturnsData },
    { data: overduePaymentsData },
    { data: allBookingsForRevenue },
  ] = await Promise.all([
    supabase
      .from('cameras')
      .select('id, name, brand, daily_rate, is_available, available_quantity, total_quantity'),

    supabase
      .from('bookings')
      .select('id, start_date, end_date, total_amount, booking_status, created_at, camera_id, customers(full_name, phone)')
      .eq('booking_status', 'pending_approval')
      .order('created_at', { ascending: false }),

    supabase
      .from('bookings')
      .select('id, start_date, end_date, booking_status, camera_id, customers(full_name, phone, whatsapp)')
      .eq('booking_status', 'confirmed')
      .eq('equipment_picked_up', true)
      .eq('equipment_returned', false),

    supabase
      .from('bookings')
      .select('id, start_date, pickup_date, camera_id, customers(full_name, phone)')
      .eq('booking_status', 'confirmed')
      .eq('equipment_picked_up', false)
      .eq('pickup_date', today),

    supabase
      .from('bookings')
      .select('id, end_date, camera_id, customers(full_name, phone, whatsapp)')
      .eq('equipment_picked_up', true)
      .eq('equipment_returned', false)
      .eq('end_date', today),

    supabase
      .from('bookings')
      .select('id, end_date, final_payment_amount, camera_id, customers(full_name, phone)')
      .eq('final_payment_paid', false)
      .in('booking_status', ['completed'])
      .lt('end_date', today),
      
    supabase
      .from('bookings')
      .select('total_amount, booking_status')
  ]);

  const cameraMap = new Map();
  cameras?.forEach(c => cameraMap.set(c.id, { name: c.name }));

  const attachCameras = (bookingsList: any[] | null) => 
    bookingsList?.map(b => ({ ...b, cameras: cameraMap.get(b.camera_id) || null })) || [];

  const pendingBookings = attachCameras(pendingBookingsData);
  const activeRentals = attachCameras(activeRentalsData);
  const todayPickups = attachCameras(todayPickupsData);
  const todayReturns = attachCameras(todayReturnsData);
  const overduePayments = attachCameras(overduePaymentsData);

  return NextResponse.json({
    generated_at: new Date().toISOString(),
    today,
    cameras: {
      total: cameras?.length || 0,
      available: cameras?.filter(c => c.is_available).length || 0,
      list: cameras,
    },
    pending_approvals: {
      count: pendingBookings?.length || 0,
      bookings: pendingBookings,
    },
    active_rentals: {
      count: activeRentals?.length || 0,
      bookings: activeRentals,
    },
    todays_pickups: {
      count: todayPickups?.length || 0,
      bookings: todayPickups,
    },
    todays_returns: {
      count: todayReturns?.length || 0,
      bookings: todayReturns,
    },
    overdue_payments: {
      count: overduePayments?.length || 0,
      bookings: overduePayments,
    },
    revenue: {
      completed: allBookingsForRevenue?.filter(b => b.booking_status === 'completed').reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
      pending: allBookingsForRevenue?.filter(b => b.booking_status === 'pending_approval').reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
      active: allBookingsForRevenue?.filter(b => b.booking_status === 'active' || b.booking_status === 'confirmed').reduce((sum, b) => sum + (b.total_amount || 0), 0) || 0,
    }
  });
}
