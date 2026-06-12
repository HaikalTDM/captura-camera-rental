import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const VALID_STATUSES = ['new', 'contacted', 'quoted', 'booked', 'lost'] as const;
type Status = typeof VALID_STATUSES[number];

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
      // Auto-stamp contacted_at when first marked as contacted
      if (body.status === 'contacted') {
        updates.contacted_at = new Date().toISOString();
      }
    }

    if (typeof body.admin_notes === 'string') {
      updates.admin_notes = body.admin_notes;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No valid fields to update' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('studio_inquiries')
      .update(updates)
      .eq('id', id)
      .select('id, status, admin_notes, contacted_at, updated_at')
      .single();

    if (error) {
      console.error('inquiry PATCH error:', error);
      return NextResponse.json({ error: 'Update failed', details: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, inquiry: data });
  } catch (e: any) {
    console.error('inquiry PATCH route error:', e);
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

    const { error } = await supabase.from('studio_inquiries').delete().eq('id', id);
    if (error) {
      return NextResponse.json({ error: 'Delete failed', details: error.message }, { status: 500 });
    }
    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: 'Server error', details: e?.message ?? 'unknown' }, { status: 500 });
  }
}
