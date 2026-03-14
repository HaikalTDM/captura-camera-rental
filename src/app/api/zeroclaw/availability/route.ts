import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * ZeroClaw Tool: GET /api/zeroclaw/availability
 * Query params:
 *   - camera_id: (required) the camera UUID to check
 *   - start_date: (required) YYYY-MM-DD
 *   - end_date: (required) YYYY-MM-DD
 * Returns: { available: boolean, conflicts: Booking[] }
 * ZeroClaw uses this before confirming any booking to the customer.
 */
export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);

  const cameraId = searchParams.get('camera_id');
  const startDate = searchParams.get('start_date');
  const endDate = searchParams.get('end_date');

  if (!cameraId || !startDate || !endDate) {
    return NextResponse.json(
      { error: 'Missing required params: camera_id, start_date, end_date' },
      { status: 400 }
    );
  }

  // Find overlapping bookings for this camera in valid (non-cancelled/rejected) states
  const { data: conflicts, error } = await supabase
    .from('bookings')
    .select('id, start_date, end_date, booking_status, customers(full_name)')
    .eq('camera_id', cameraId)
    .not('booking_status', 'in', '("cancelled","rejected")')
    .lte('start_date', endDate)
    .gte('end_date', startDate);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also check calendar_blocks
  const { data: blocks } = await supabase
    .from('calendar_blocks')
    .select('id, start_date, end_date, block_type, reason')
    .eq('camera_id', cameraId)
    .lte('start_date', endDate)
    .gte('end_date', startDate);

  const isAvailable = (conflicts?.length === 0) && (blocks?.length === 0);

  return NextResponse.json({
    available: isAvailable,
    camera_id: cameraId,
    requested_range: { start_date: startDate, end_date: endDate },
    conflicts: conflicts || [],
    blocked_dates: blocks || [],
  });
}
