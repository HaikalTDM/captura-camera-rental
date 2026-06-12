import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

const VALID_SERVICE_TYPES = ['photo', 'video', 'combo'] as const;
const VALID_EVENT_TYPES = ['wedding', 'corporate', 'graduation', 'portrait', 'event'] as const;
const VALID_STATUSES = ['pending', 'confirmed', 'completed', 'cancelled'] as const;
const VALID_SOURCES = ['website', 'whatsapp', 'phone', 'referral', 'walk-in'] as const;

type ServiceType = typeof VALID_SERVICE_TYPES[number];
type EventType = typeof VALID_EVENT_TYPES[number];

interface CreateBookingPayload {
  // Customer (either provide customer_id OR new customer fields)
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;

  // Event
  service_type: ServiceType;
  event_type: EventType;
  event_date: string; // YYYY-MM-DD
  event_start_time?: string; // HH:MM
  event_duration_hours?: number;

  // Venue
  venue_name?: string;
  venue_address: string;

  // Package
  package_id?: string | null;
  package_name?: string;
  package_price: number;
  addons_total?: number;
  total_amount: number;

  // Payment
  deposit_amount?: number;
  deposit_paid?: boolean;

  // Meta
  status?: typeof VALID_STATUSES[number];
  booking_source?: typeof VALID_SOURCES[number];
  admin_notes?: string;
  special_requests?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as CreateBookingPayload;
    const supabase = getSupabaseAdmin();

    // -------- Validate required fields --------
    if (!body.service_type || !VALID_SERVICE_TYPES.includes(body.service_type)) {
      return NextResponse.json({ error: 'Invalid or missing service_type' }, { status: 400 });
    }
    if (!body.event_type || !VALID_EVENT_TYPES.includes(body.event_type)) {
      return NextResponse.json({ error: 'Invalid or missing event_type' }, { status: 400 });
    }
    if (!body.event_date) {
      return NextResponse.json({ error: 'Missing event_date' }, { status: 400 });
    }
    if (!body.venue_address) {
      return NextResponse.json({ error: 'Missing venue_address' }, { status: 400 });
    }
    if (typeof body.package_price !== 'number' || typeof body.total_amount !== 'number') {
      return NextResponse.json({ error: 'package_price and total_amount must be numbers' }, { status: 400 });
    }

    // -------- Resolve customer_id --------
    let customerId = body.customer_id ?? null;

    if (!customerId) {
      // Need to create new customer
      if (!body.customer_name || !body.customer_phone) {
        return NextResponse.json(
          { error: 'customer_id OR (customer_name + customer_phone) required' },
          { status: 400 }
        );
      }

      // Try lookup by phone first (more reliable than email for walk-ins)
      const phoneClean = body.customer_phone.replace(/\D/g, '');
      const { data: existingByPhone } = await supabase
        .from('customers')
        .select('id')
        .or(`phone.eq.${body.customer_phone},phone.eq.${phoneClean}`)
        .limit(1)
        .maybeSingle();

      if (existingByPhone?.id) {
        customerId = existingByPhone.id;
      } else if (body.customer_email) {
        // Fall back to email lookup
        const { data: existingByEmail } = await supabase
          .from('customers')
          .select('id')
          .eq('email', body.customer_email)
          .limit(1)
          .maybeSingle();
        if (existingByEmail?.id) {
          customerId = existingByEmail.id;
        }
      }

      // Still no match — create new
      if (!customerId) {
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            full_name: body.customer_name,
            name: body.customer_name, // legacy column
            phone: body.customer_phone,
            whatsapp: body.customer_phone,
            email: body.customer_email || null,
          })
          .select('id')
          .single();

        if (customerError || !newCustomer) {
          console.error('customer create error:', customerError);
          return NextResponse.json(
            { error: 'Failed to create customer', details: customerError?.message },
            { status: 500 }
          );
        }
        customerId = newCustomer.id;
      }
    }

    // -------- Compute pricing fields --------
    const addonsTotal = body.addons_total ?? 0;
    const subtotal = body.package_price + addonsTotal;
    const totalAmount = body.total_amount;
    const depositAmount = body.deposit_amount ?? Math.round(totalAmount * 0.5 * 100) / 100;
    const finalPaymentAmount = Math.max(0, totalAmount - depositAmount);

    // -------- Insert booking --------
    const insertPayload: Record<string, any> = {
      customer_id: customerId,
      service_type: body.service_type,
      event_type: body.event_type,
      event_date: body.event_date,
      event_start_time: body.event_start_time || '09:00',
      event_duration_hours: body.event_duration_hours ?? 4,
      venue_name: body.venue_name || null,
      venue_address: body.venue_address,
      package_id: body.package_id || null,
      package_name: body.package_name || null,
      photographer_type: 'main_only',
      package_price: body.package_price,
      addons_total: addonsTotal,
      subtotal,
      discount_amount: 0,
      total_amount: totalAmount,
      deposit_amount: depositAmount,
      deposit_paid: body.deposit_paid ?? false,
      deposit_paid_date: body.deposit_paid ? new Date().toISOString() : null,
      final_payment_amount: finalPaymentAmount,
      final_payment_paid: false,
      status: body.status ?? 'pending',
      booking_source: body.booking_source ?? 'walk-in',
      admin_notes: body.admin_notes || null,
      special_requests: body.special_requests || null,
    };

    const { data: booking, error: bookingError } = await supabase
      .from('photography_bookings')
      .insert(insertPayload)
      .select('id, customer_id, service_type, event_date, status, total_amount')
      .single();

    if (bookingError || !booking) {
      console.error('booking create error:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking', details: bookingError?.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, booking });
  } catch (e: any) {
    console.error('studio bookings POST error:', e);
    return NextResponse.json(
      { error: 'Server error', details: e?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}
