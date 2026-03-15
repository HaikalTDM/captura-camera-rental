import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * n8n Tool: GET /api/n8n/bookings
 * Query params:
 *   - status: filter by booking_status (e.g. pending_approval, confirmed, completed)
 *   - camera_id: filter by specific camera
 *   - customer_id: filter by specific customer
 *   - date: filter bookings overlapping a specific date (YYYY-MM-DD)
 *   - limit: max results (default 20)
 * n8n uses this to check conflicts, answer "what's booked this weekend?" queries.
 */
export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);

  const status = searchParams.get('status');
  const cameraId = searchParams.get('camera_id');
  const customerId = searchParams.get('customer_id');
  const date = searchParams.get('date');
  const limit: number = searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 100;

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
      customers ( id, full_name, name, phone, whatsapp, email )
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

  const { data: bookings, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Fetch all cameras and map them
  const { data: allCameras } = await supabase.from('cameras').select('id, name, brand, daily_rate');
  const cameraMap = new Map();
  allCameras?.forEach(c => cameraMap.set(c.id, c));

  const enrichedBookings = bookings?.map(b => ({
    ...b,
    cameras: cameraMap.get(b.camera_id) || { name: 'Unknown Camera', brand: 'Unknown', id: b.camera_id }
  }));

  return NextResponse.json({ bookings: enrichedBookings, count: enrichedBookings?.length || 0 });
}
