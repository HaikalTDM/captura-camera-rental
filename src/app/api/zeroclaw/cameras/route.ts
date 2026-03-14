import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * ZeroClaw Tool: GET /api/zeroclaw/cameras
 * Returns all cameras with current availability status.
 * ZeroClaw uses this to answer "Is the Canon R50 available?" questions.
 */
export async function GET() {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('cameras')
    .select('id, name, brand, type, daily_rate, deposit_amount, is_available, available_quantity, total_quantity, condition, description')
    .order('display_order', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ cameras: data });
}
