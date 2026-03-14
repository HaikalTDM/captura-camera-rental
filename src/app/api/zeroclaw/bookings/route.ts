import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * ZeroClaw Tool: GET /api/zeroclaw/bookings
 * Query params:
 *   - status: filter by booking_status (e.g. pending_approval, confirmed, completed)
 *   - camera_id: filter by specific camera
 *   - customer_id: filter by specific customer
 *   - date: filter bookings overlapping a specific date (YYYY-MM-DD)
 *   - limit: max results (default 20)
 * ZeroClaw uses this to check conflicts, answer "what's booked this weekend?" queries.
 */
export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const cameraId = searchParams.get('camera_id');
  const customerId = searchParams.get('customer_id');
  const date = searchParams.get('date');
  const limit = parseInt(searchParams.get('limit') || '20');

  let query = supabase
    .from('bookings')
    .select(`
      id,
      start_date,
      end_date,
      total_days,
      daily_rate,
      total_amount,
      deposit_amount,
      deposit_paid,
      final_payment_paid,
      status,
      booking_status,
      pickup_method,
      equipment_picked_up,
      equipment_returned,
      created_at,
      camera_id,
      customer_id,
      customers ( id, full_name, name, phone, whatsapp, email ),
      cameras ( id, name, brand, daily_rate )
    `)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (status) query = query.eq('booking_status', status);
  if (cameraId) query = query.eq('camera_id', cameraId);
  if (customerId) query = query.eq('customer_id', customerId);
  if (date) {
    // Overlapping date check: bookings where start_date <= date AND end_date >= date
    query = query.lte('start_date', date).gte('end_date', date);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ bookings: data, count: data?.length });
}
