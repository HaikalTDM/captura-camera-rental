import { getSupabaseAdmin, logQueryError } from '../supabase/client.js';
import { NotFoundError } from '../errors/handler.js';
import type { PaymentRecord } from '../supabase/types.js';

export async function recordPayment(fields: {
  booking_id: string;
  payment_type: 'deposit' | 'final' | 'refund';
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'online';
  payment_reference?: string;
  notes?: string;
}): Promise<{ payment: PaymentRecord; bookingUpdated: boolean }> {
  const supabase = getSupabaseAdmin();

  const paymentPayload = {
    booking_id: fields.booking_id,
    payment_type: fields.payment_type,
    amount: fields.amount,
    payment_method: fields.payment_method,
    payment_reference: fields.payment_reference || null,
    payment_date: new Date().toISOString().split('T')[0],
    notes: fields.notes || null,
  };

  const { data: payment, error } = await supabase
    .from('payment_records')
    .insert([paymentPayload])
    .select()
    .single();

  if (error) {
    logQueryError('payments.record', error);
    throw new Error('Failed to record payment');
  }

  // Update the booking payment status
  let bookingUpdated = false;
  try {
    const bookingUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };

    if (fields.payment_type === 'deposit') {
      bookingUpdate.deposit_paid = true;
      bookingUpdate.deposit_paid_date = new Date().toISOString();
    } else if (fields.payment_type === 'final') {
      bookingUpdate.final_payment_paid = true;
      bookingUpdate.final_payment_paid_date = new Date().toISOString();
    }

    const { error: updateError } = await supabase
      .from('bookings')
      .update(bookingUpdate)
      .eq('id', fields.booking_id);

    bookingUpdated = !updateError;
  } catch {
    // Non-critical: payment is recorded, booking update is best-effort
  }

  return { payment: payment as PaymentRecord, bookingUpdated };
}

export async function markDepositRefunded(
  bookingId: string,
  refundAmount?: number,
  refundNotes?: string
): Promise<PaymentRecord> {
  const supabase = getSupabaseAdmin();

  // Get current booking for deposit amount if not specified
  const { data: booking } = await supabase
    .from('bookings')
    .select('deposit_amount')
    .eq('id', bookingId)
    .single();

  if (!booking) {
    throw new NotFoundError('Booking', bookingId);
  }

  const amount = refundAmount || booking.deposit_amount;

  const { data: refund, error: refundError } = await supabase
    .from('payment_records')
    .insert([{
      booking_id: bookingId,
      payment_type: 'refund',
      amount,
      payment_method: 'bank_transfer',
      payment_date: new Date().toISOString().split('T')[0],
      notes: refundNotes || 'Deposit refunded after safe return',
    }])
    .select()
    .single();

  if (refundError) {
    logQueryError('payments.markDepositRefunded', refundError);
    throw new Error('Failed to record refund');
  }

  // Update booking deposit refund status
  const { error: bookingError } = await supabase
    .from('bookings')
    .update({
      deposit_refunded: true,
      deposit_refund_date: new Date().toISOString(),
      deposit_refund_amount: amount,
      deposit_refund_notes: refundNotes || null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (bookingError) {
    logQueryError('payments.markDepositRefunded.booking', bookingError);
  }

  return refund as PaymentRecord;
}
