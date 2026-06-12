import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

/**
 * GET /api/studio/clients/[id]
 * Returns the customer + all their studio bookings.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const [customerRes, bookingsRes] = await Promise.all([
      supabase
        .from('customers')
        .select('id, full_name, name, phone, whatsapp, email, address, created_at, updated_at')
        .eq('id', id)
        .single(),
      supabase
        .from('photography_bookings')
        .select('id, service_type, event_type, event_date, package_name, total_amount, status')
        .eq('customer_id', id)
        .order('event_date', { ascending: false }),
    ]);

    if (customerRes.error || !customerRes.data) {
      return NextResponse.json(
        { error: 'Not found', details: customerRes.error?.message },
        { status: 404 }
      );
    }

    return NextResponse.json({
      customer: customerRes.data,
      bookings: bookingsRes.data ?? [],
    });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Server error', details: e?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/studio/clients/[id]
 * Updates customer fields (name, phone, email, address, whatsapp).
 */
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = getSupabaseAdmin();

    const updates: Record<string, any> = {};

    if (typeof body.name === 'string' && body.name.trim()) {
      updates.full_name = body.name.trim();
      updates.name = body.name.trim();
    }
    if (typeof body.phone === 'string') updates.phone = body.phone.trim();
    if (typeof body.whatsapp === 'string') updates.whatsapp = body.whatsapp.trim() || null;
    if (typeof body.email === 'string') updates.email = body.email.trim() || null;
    if (typeof body.address === 'string') updates.address = body.address.trim() || null;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('client PATCH error:', error);
      return NextResponse.json(
        { error: 'Update failed', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, customer: data });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Server error', details: e?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/studio/clients/[id]
 * Deletes a customer. Refuses if they have any bookings (rental or studio)
 * unless ?force=true is passed (cascades via FK).
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const force = searchParams.get('force') === 'true';
    const supabase = getSupabaseAdmin();

    if (!force) {
      // Safety: check for any rental bookings (cascade would wipe them)
      const { count: rentalCount } = await supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', id);

      const { count: studioCount } = await supabase
        .from('photography_bookings')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', id);

      if ((rentalCount ?? 0) > 0 || (studioCount ?? 0) > 0) {
        return NextResponse.json(
          {
            error: 'Client has bookings',
            rentalCount: rentalCount ?? 0,
            studioCount: studioCount ?? 0,
            hint: 'Pass ?force=true to cascade-delete all bookings.',
          },
          { status: 409 }
        );
      }
    }

    const { error } = await supabase.from('customers').delete().eq('id', id);
    if (error) {
      return NextResponse.json(
        { error: 'Delete failed', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json(
      { error: 'Server error', details: e?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}
