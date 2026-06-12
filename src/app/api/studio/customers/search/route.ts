import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * Search customers by name, phone, or email.
 * Used by Studio admin's New Booking modal for customer lookup.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get('q') ?? '').trim();
    const limit = Math.min(Number(searchParams.get('limit') ?? 10), 25);

    if (!q || q.length < 2) {
      return NextResponse.json({ customers: [] });
    }

    const supabase = getSupabaseAdmin();
    const safe = q.replace(/[%,]/g, ' ');

    const { data, error } = await supabase
      .from('customers')
      .select('id, full_name, name, phone, whatsapp, email')
      .or(
        `full_name.ilike.%${safe}%,name.ilike.%${safe}%,phone.ilike.%${safe}%,whatsapp.ilike.%${safe}%,email.ilike.%${safe}%`
      )
      .order('updated_at', { ascending: false, nullsFirst: false })
      .limit(limit);

    if (error) {
      console.error('customers search error:', error);
      return NextResponse.json(
        { error: 'Search failed', details: error.message },
        { status: 500 }
      );
    }

    const customers = (data ?? []).map((c: any) => ({
      id: c.id,
      name: c.full_name || c.name || 'Unnamed',
      phone: c.phone || c.whatsapp || '',
      email: c.email || null,
    }));

    return NextResponse.json({ customers });
  } catch (e: any) {
    console.error('customers search route error:', e);
    return NextResponse.json(
      { error: 'Server error', details: e?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}
