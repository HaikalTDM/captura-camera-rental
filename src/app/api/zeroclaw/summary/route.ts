import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * ZeroClaw Tool: GET /api/zeroclaw/summary
 * Returns a full operational snapshot of Captura for ZeroClaw to orient itself.
 * Includes: pending bookings, active rentals, today's pickups + returns,
 * available cameras, and overdue payments.
 * ZeroClaw calls this first to build situational awareness.
 */
export async function GET() {
  const supabase = getSupabaseAdmin();
  const today = new Date().toISOString().split('T')[0];

  const [
    { data: cameras },
    { data: pendingBookings },
    { data: activeRentals },
    { data: todayPickups },
    { data: todayReturns },
    { data: overduePayments },
  ] = await Promise.all([
    supabase
      .from('cameras')
      .select('id, name, brand, daily_rate, is_available, available_quantity, total_quantity'),

    supabase
      .from('bookings')
      .select('id, start_date, end_date, total_amount, booking_status, created_at, customers(full_name, phone), cameras(name)')
      .eq('booking_status', 'pending_approval')
      .order('created_at', { ascending: false }),

    supabase
      .from('bookings')
      .select('id, start_date, end_date, booking_status, customers(full_name, phone, whatsapp), cameras(name)')
      .eq('booking_status', 'confirmed')
      .eq('equipment_picked_up', true)
      .eq('equipment_returned', false),

    supabase
      .from('bookings')
      .select('id, start_date, pickup_date, customers(full_name, phone), cameras(name)')
      .eq('booking_status', 'confirmed')
      .eq('equipment_picked_up', false)
      .eq('pickup_date', today),

    supabase
      .from('bookings')
      .select('id, end_date, customers(full_name, phone, whatsapp), cameras(name)')
      .eq('equipment_picked_up', true)
      .eq('equipment_returned', false)
      .eq('end_date', today),

    supabase
      .from('bookings')
      .select('id, end_date, final_payment_amount, customers(full_name, phone), cameras(name)')
      .eq('final_payment_paid', false)
      .in('booking_status', ['completed'])
      .lt('end_date', today),
  ]);

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
  });
}
