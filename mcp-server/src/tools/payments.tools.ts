import { getSupabaseAdmin, logQueryError } from '../supabase/client.js';
import { NotFoundError } from '../errors/handler.js';

export async function recordPayment(fields: {
  booking_id: string;
  payment_type: 'deposit' | 'final' | 'refund';
  amount: number;
  payment_method: 'cash' | 'bank_transfer' | 'online';
  payment_reference?: string;
  notes?: string;
}): Promise<{ success: boolean; booking_id: string; payment_type: string; amount: number }> {
  const supabase = getSupabaseAdmin();

  const bookingUpdate: Record<string, unknown> = { updated_at: new Date().toISOString() };

  if (fields.payment_type === 'deposit') {
    bookingUpdate.deposit_paid = true;
    bookingUpdate.deposit_paid_date = new Date().toISOString();
    bookingUpdate.deposit_amount = fields.amount;
  } else if (fields.payment_type === 'final') {
    bookingUpdate.final_payment_paid = true;
    bookingUpdate.final_payment_paid_date = new Date().toISOString();
    bookingUpdate.final_payment_amount = fields.amount;
  } else if (fields.payment_type === 'refund') {
    bookingUpdate.deposit_refunded = true;
    bookingUpdate.deposit_refund_date = new Date().toISOString();
    bookingUpdate.deposit_refund_amount = fields.amount;
    if (fields.notes) {
      bookingUpdate.deposit_refund_notes = fields.notes;
    }
  }

  if (fields.notes) {
    const existingNotes = (await supabase.from('bookings').select('notes').eq('id', fields.booking_id).single()).data?.notes || '';
    bookingUpdate.notes = existingNotes
      ? `${existingNotes}\n[Payment: ${fields.payment_type} RM${fields.amount} ${fields.payment_method}] ${fields.notes}`
      : `[Payment: ${fields.payment_type} RM${fields.amount} ${fields.payment_method}] ${fields.notes}`;
  }

  const { error } = await supabase
    .from('bookings')
    .update(bookingUpdate)
    .eq('id', fields.booking_id);

  if (error) {
    if (error.code === 'PGRST116') {
      throw new NotFoundError('Booking', fields.booking_id);
    }
    logQueryError('payments.record', error);
    throw new Error('Failed to record payment');
  }

  return {
    success: true,
    booking_id: fields.booking_id,
    payment_type: fields.payment_type,
    amount: fields.amount,
  };
}

export async function markDepositRefunded(
  bookingId: string,
  refundAmount?: number,
  refundNotes?: string
): Promise<{ success: boolean; booking_id: string; refund_amount: number }> {
  const supabase = getSupabaseAdmin();

  const { data: booking, error: fetchError } = await supabase
    .from('bookings')
    .select('deposit_amount')
    .eq('id', bookingId)
    .single();

  if (fetchError || !booking) {
    throw new NotFoundError('Booking', bookingId);
  }

  const amount = refundAmount || booking.deposit_amount || 100;

  const { error } = await supabase
    .from('bookings')
    .update({
      deposit_refunded: true,
      deposit_refund_date: new Date().toISOString(),
      deposit_refund_amount: amount,
      deposit_refund_notes: refundNotes || 'Deposit refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', bookingId);

  if (error) {
    logQueryError('payments.markDepositRefunded', error);
    throw new Error('Failed to mark deposit as refunded');
  }

  return { success: true, booking_id: bookingId, refund_amount: amount };
}
