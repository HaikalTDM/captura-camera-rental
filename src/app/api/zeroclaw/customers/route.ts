import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * ZeroClaw Tool: GET /api/zeroclaw/customers
 * Query params:
 *   - search: search by name, email, or phone
 *   - id: get a specific customer by UUID
 * Returns customer info including booking history count.
 */
export async function GET(request: Request) {
  const supabase = getSupabaseAdmin();
  const { searchParams } = new URL(request.url);

  const search = searchParams.get('search');
  const id = searchParams.get('id');

  if (id) {
    // Get single customer with full booking history
    const { data: customer, error } = await supabase
      .from('customers')
      .select(`
        id, full_name, name, email, phone, whatsapp, address, id_number,
        reliability_score, total_bookings, notes, created_at,
        emergency_contact_name, emergency_contact_phone
      `)
      .eq('id', id)
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 404 });

    // Fetch their bookings
    const { data: bookings } = await supabase
      .from('bookings')
      .select('id, start_date, end_date, booking_status, total_amount, camera_id, cameras(name)')
      .eq('customer_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    return NextResponse.json({ customer, recent_bookings: bookings });
  }

  if (search) {
    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, name, email, phone, whatsapp, total_bookings, reliability_score')
      .or(`full_name.ilike.%${search}%,name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ customers: data, count: data?.length });
  }

  // Return all customers (limited)
  const { data, error } = await supabase
    .from('customers')
    .select('id, full_name, name, email, phone, whatsapp, total_bookings, reliability_score, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ customers: data, count: data?.length });
}
