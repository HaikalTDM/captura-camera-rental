import { getSupabaseAdmin } from '@/lib/supabase';

type MirrorBookingRecord = {
  id: string;
  customer_id: string | null;
  camera_id: string | null;
  start_date: string | null;
  end_date: string | null;
  total_days: number | null;
  total_amount: number | null;
  deposit_amount: number | null;
  deposit_paid: boolean | null;
  final_payment_paid: boolean | null;
  deposit_refunded: boolean | null;
  status: string | null;
  booking_status: string | null;
  pickup_method: string | null;
  equipment_picked_up: boolean | null;
  equipment_returned: boolean | null;
  created_at: string | null;
  updated_at: string | null;
  pickup_date: string | null;
  equipment_pickup_date: string | null;
  equipment_return_date: string | null;
  deposit_refund_amount: number | null;
  final_payment_paid_date: string | null;
  deposit_refund_date: string | null;
};

type MirrorCustomerRecord = {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  total_bookings: number | null;
  reliability_score: number | null;
  created_at: string | null;
  updated_at: string | null;
};

type MirrorCameraRecord = {
  id: string;
  name: string | null;
  brand: string | null;
  model: string | null;
  daily_rate: number | null;
  deposit_amount: number | null;
  is_available: boolean | null;
  available_quantity: number | null;
  total_quantity: number | null;
  condition: string | null;
  display_order: number | null;
  updated_at: string | null;
};

type MirrorCalendarBlockRecord = {
  id: string;
  camera_id: string | null;
  booking_id: string | null;
  start_date: string | null;
  end_date: string | null;
  block_type: string | null;
  reason: string | null;
  updated_at: string | null;
};

type MirrorUpsertPayload = {
  event: 'booking.upsert';
  sent_at: string;
  booking_id: string;
  booking: MirrorBookingRecord;
  customer: MirrorCustomerRecord | null;
  camera: MirrorCameraRecord | null;
  calendar_blocks: MirrorCalendarBlockRecord[];
};

type MirrorDeletePayload = {
  event: 'booking.delete';
  sent_at: string;
  booking_id: string;
};

function getMirrorConfig() {
  const url = process.env.HERMES_MIRROR_WEBHOOK_URL?.trim();
  const secret = process.env.HERMES_MIRROR_WEBHOOK_SECRET?.trim();

  if (!url || !secret) {
    return null;
  }

  return { url, secret };
}

async function postMirror(payload: MirrorUpsertPayload | MirrorDeletePayload) {
  const config = getMirrorConfig();
  if (!config) {
    return false;
  }

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Captura-Mirror-Secret': config.secret,
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error('Hermes mirror webhook failed:', response.status, text);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Hermes mirror webhook error:', error);
    return false;
  }
}

async function buildBookingUpsertPayload(bookingId: string): Promise<MirrorUpsertPayload | null> {
  const supabase = getSupabaseAdmin();

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select(
      'id,customer_id,camera_id,start_date,end_date,total_days,total_amount,deposit_amount,deposit_paid,final_payment_paid,deposit_refunded,status,booking_status,pickup_method,equipment_picked_up,equipment_returned,created_at,updated_at,pickup_date,equipment_pickup_date,equipment_return_date,deposit_refund_amount,final_payment_paid_date,deposit_refund_date'
    )
    .eq('id', bookingId)
    .single();

  if (bookingError || !booking) {
    console.error('Failed to build Hermes mirror booking payload:', bookingError);
    return null;
  }

  const [{ data: customer }, { data: camera }, { data: calendarBlocks }] = await Promise.all([
    booking.customer_id
      ? supabase
          .from('customers')
          .select('id,full_name,email,phone,whatsapp,total_bookings,reliability_score,created_at,updated_at')
          .eq('id', booking.customer_id)
          .single()
      : Promise.resolve({ data: null }),
    booking.camera_id
      ? supabase
          .from('cameras')
          .select('id,name,brand,model,daily_rate,deposit_amount,is_available,available_quantity,total_quantity,condition,display_order,updated_at')
          .eq('id', booking.camera_id)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from('calendar_blocks')
      .select('id,camera_id,booking_id,start_date,end_date,block_type,reason,updated_at')
      .eq('booking_id', bookingId),
  ]);

  return {
    event: 'booking.upsert',
    sent_at: new Date().toISOString(),
    booking_id: bookingId,
    booking: booking as MirrorBookingRecord,
    customer: (customer ?? null) as MirrorCustomerRecord | null,
    camera: (camera ?? null) as MirrorCameraRecord | null,
    calendar_blocks: (calendarBlocks ?? []) as MirrorCalendarBlockRecord[],
  };
}

export async function mirrorBookingUpsert(bookingId: string) {
  const payload = await buildBookingUpsertPayload(bookingId);
  if (!payload) {
    return false;
  }
  return postMirror(payload);
}

export async function mirrorBookingsUpsert(bookingIds: string[]) {
  const uniqueIds = Array.from(new Set(bookingIds.filter(Boolean)));
  if (uniqueIds.length === 0) {
    return;
  }

  await Promise.allSettled(uniqueIds.map((bookingId) => mirrorBookingUpsert(bookingId)));
}

export async function mirrorBookingDelete(bookingId: string) {
  return postMirror({
    event: 'booking.delete',
    sent_at: new Date().toISOString(),
    booking_id: bookingId,
  });
}
