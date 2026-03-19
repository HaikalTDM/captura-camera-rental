import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import type { Booking, Invoice } from '@/lib/supabase';
import { createBusinessSettingsMap, type BusinessSettingsRow } from '@/lib/business-settings';
import {
  buildDefaultInvoiceFromBooking,
  getInvoiceBusinessDefaults,
  normalizeInvoiceDraft,
} from '@/lib/invoices';

async function getBookingWithRelations(bookingId: string): Promise<Booking | null> {
  const supabase = getSupabaseAdmin();

  const { data: booking, error } = await supabase
    .from('bookings')
    .select(`
      *,
      customer:customers(*)
    `)
    .eq('id', bookingId)
    .single();

  if (error || !booking) {
    return null;
  }

  let camera = null;
  if (booking.camera_id) {
    const { data: cameraData } = await supabase
      .from('cameras')
      .select('id, name, brand, model')
      .eq('id', booking.camera_id)
      .single();
    camera = cameraData;
  }

  return {
    ...booking,
    camera: camera || booking.camera,
  } as Booking;
}

async function getBusinessOverrides() {
  const supabase = getSupabaseAdmin();
  const defaults = getInvoiceBusinessDefaults();

  const { data } = await supabase
    .from('business_settings')
    .select('*');

  if (!data) {
    return defaults;
  }

  const settingsMap = createBusinessSettingsMap(data as BusinessSettingsRow[]);

  return {
    business_name: settingsMap.get('business_name') || defaults.business_name,
    business_email: settingsMap.get('business_email') || defaults.business_email,
    business_phone:
      settingsMap.get('contact_phone') ||
      settingsMap.get('whatsapp_number') ||
      defaults.business_phone,
    business_address:
      settingsMap.get('business_address') ||
      settingsMap.get('pickup_location') ||
      defaults.business_address,
    logo_url: defaults.logo_url,
  };
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const supabase = getSupabaseAdmin();

    const booking = await getBookingWithRelations(bookingId);
    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      );
    }

    const { data: invoice } = await supabase
      .from('invoices')
      .select('*')
      .eq('booking_id', bookingId)
      .maybeSingle();

    if (invoice) {
      return NextResponse.json({
        exists: true,
        invoice: normalizeInvoiceDraft({
          ...invoice,
          notes: invoice.notes || '',
        }, bookingId),
      });
    }

    const businessOverrides = await getBusinessOverrides();
    const defaultInvoice = buildDefaultInvoiceFromBooking(booking, businessOverrides);

    return NextResponse.json({
      exists: false,
      invoice: defaultInvoice,
    });
  } catch (error) {
    console.error('Invoice GET error:', error);
    return NextResponse.json(
      { error: 'Failed to load invoice' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params;
    const supabase = getSupabaseAdmin();
    const payload = await request.json();

    const booking = await getBookingWithRelations(bookingId);
    if (!booking) {
      return NextResponse.json(
        { success: false, error: 'Booking not found' },
        { status: 404 }
      );
    }

    const normalized = normalizeInvoiceDraft(payload, bookingId);

    const upsertPayload = {
      booking_id: bookingId,
      invoice_number: normalized.invoice_number,
      status: normalized.status || 'draft',
      issue_date: normalized.issue_date,
      notes: normalized.notes || null,
      customer_snapshot: normalized.customer_snapshot,
      business_snapshot: normalized.business_snapshot,
      booking_snapshot: normalized.booking_snapshot,
      exported_at: normalized.exported_at || null,
      updated_at: new Date().toISOString(),
    };

    const { data: invoice, error } = await supabase
      .from('invoices')
      .upsert(upsertPayload, {
        onConflict: 'booking_id',
      })
      .select('*')
      .single();

    if (error) {
      console.error('Invoice save error:', error);
      return NextResponse.json(
        { success: false, error: 'Failed to save invoice draft' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      invoice: invoice as Invoice,
    });
  } catch (error) {
    console.error('Invoice PUT error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to save invoice draft' },
      { status: 500 }
    );
  }
}
