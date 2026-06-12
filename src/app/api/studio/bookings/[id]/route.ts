import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
type Status = typeof VALID_STATUSES[number];

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('photography_bookings')
      .select(`
        *,
        customer:customers!customer_id (
          id,
          name,
          phone,
          email
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      return NextResponse.json({ error: 'Not found', details: error.message }, { status: 404 });
    }
    return NextResponse.json({ booking: data });
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', details: e?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await req.json();
    const supabase = getSupabaseAdmin();

    const updates: Record<string, any> = {};

    if (body.status) {
      if (!VALID_STATUSES.includes(body.status as Status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updates.status = body.status;
      if (body.status === 'confirmed' && !body.confirmed_at) {
        updates.confirmed_at = new Date().toISOString();
      }
    }

    if (typeof body.admin_notes === 'string') {
      updates.admin_notes = body.admin_notes;
    }

    if (typeof body.deposit_paid === 'boolean') {
      updates.deposit_paid = body.deposit_paid;
      if (body.deposit_paid && !body.deposit_paid_date) {
        updates.deposit_paid_date = new Date().toISOString();
      }
    }

    if (typeof body.final_payment_paid === 'boolean') {
      updates.final_payment_paid = body.final_payment_paid;
      if (body.final_payment_paid && !body.final_payment_paid_date) {
        updates.final_payment_paid_date = new Date().toISOString();
      }
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('photography_bookings')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('booking PATCH error:', error);
      return NextResponse.json({ error: 'Update failed', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, booking: data });
  } catch (e: any) {
    console.error('booking PATCH route error:', e);
    return NextResponse.json({ error: 'Server error', details: e?.message ?? 'unknown' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const supabase = getSupabaseAdmin();

    const { error } = await supabase.from('photography_bookings').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: 'Delete failed', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', details: e?.message ?? 'unknown' }, { status: 500 });
  }
}
