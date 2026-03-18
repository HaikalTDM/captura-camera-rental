import type {
  Booking,
  Invoice,
  InvoiceBookingSnapshot,
  InvoiceBusinessSnapshot,
  InvoiceCustomerSnapshot,
} from '@/lib/supabase';

export interface InvoiceDraftPayload {
  invoice_number: string;
  issue_date: string;
  notes: string;
  status?: Invoice['status'];
  customer_snapshot: InvoiceCustomerSnapshot;
  business_snapshot: InvoiceBusinessSnapshot;
  booking_snapshot: InvoiceBookingSnapshot;
  exported_at?: string | null;
}

export interface InvoiceDraftResponse {
  invoice: InvoiceDraftPayload & { id?: string };
  exists: boolean;
}

const DEFAULT_BUSINESS_SNAPSHOT: InvoiceBusinessSnapshot = {
  business_name: 'CAPTURA',
  business_email: 'captura.my@gmail.com',
  business_phone: '0177464121',
  business_address: 'Selayang Pandang, Selangor',
  logo_url: '/images/captura_logo_big.png',
};

export function generateInvoiceNumber(bookingId: string, issueDate = new Date()): string {
  const datePart = issueDate.toISOString().slice(0, 10).replace(/-/g, '');
  const bookingPart = bookingId.slice(0, 8).toUpperCase();
  return `INV-${datePart}-${bookingPart}`;
}

export function buildDefaultInvoiceFromBooking(
  booking: Booking,
  businessOverrides: Partial<InvoiceBusinessSnapshot> = {}
): InvoiceDraftPayload {
  const deliveryFee = Number(booking.delivery_fee || 0);
  const rentalSubtotal = Number(booking.total_amount || 0);
  const totalAmount = rentalSubtotal + deliveryFee;
  const depositPaidAmount = booking.deposit_paid
    ? Math.min(Number(booking.deposit_amount || 0), totalAmount)
    : 0;
  const balanceDue = booking.final_payment_paid
    ? 0
    : Math.max(totalAmount - depositPaidAmount, 0);

  return {
    invoice_number: generateInvoiceNumber(booking.id),
    issue_date: new Date().toISOString().slice(0, 10),
    notes: booking.notes || '',
    status: 'draft',
    customer_snapshot: {
      full_name: booking.customer?.full_name || '',
      email: booking.customer?.email || '',
      phone: booking.customer?.phone || '',
      address: booking.customer?.address || '',
      id_number: booking.customer?.id_number || '',
    },
    business_snapshot: {
      ...DEFAULT_BUSINESS_SNAPSHOT,
      ...businessOverrides,
    },
    booking_snapshot: {
      booking_id: booking.id,
      camera_name: booking.camera?.name || booking.camera_id || 'Camera Rental',
      rental_start_date: booking.start_date,
      rental_end_date: booking.end_date,
      total_days: Number(booking.total_days || 0),
      pickup_method: booking.pickup_method || 'pickup',
      pickup_address: booking.pickup_address || '',
      rental_subtotal: rentalSubtotal,
      delivery_fee: deliveryFee,
      deposit_amount: Number(booking.deposit_amount || 0),
      deposit_paid_amount: depositPaidAmount,
      total_amount: totalAmount,
      balance_due: balanceDue,
      notes: booking.notes || '',
    },
  };
}

export function normalizeInvoiceDraft(
  draft: InvoiceDraftPayload,
  bookingId?: string
): InvoiceDraftPayload {
  const rentalSubtotal = Number(draft.booking_snapshot.rental_subtotal || 0);
  const deliveryFee = Number(draft.booking_snapshot.delivery_fee || 0);
  const totalAmount = Number(draft.booking_snapshot.total_amount || rentalSubtotal + deliveryFee);
  const depositPaidAmount = Number(draft.booking_snapshot.deposit_paid_amount || 0);

  return {
    ...draft,
    status: draft.status || 'draft',
    notes: draft.notes || '',
    booking_snapshot: {
      ...draft.booking_snapshot,
      booking_id: draft.booking_snapshot.booking_id || bookingId || '',
      pickup_method: draft.booking_snapshot.pickup_method || 'pickup',
      rental_subtotal: rentalSubtotal,
      delivery_fee: deliveryFee,
      deposit_amount: Number(draft.booking_snapshot.deposit_amount || 0),
      deposit_paid_amount: depositPaidAmount,
      total_amount: totalAmount,
      balance_due: Math.max(Number(draft.booking_snapshot.balance_due ?? totalAmount - depositPaidAmount), 0),
      total_days: Number(draft.booking_snapshot.total_days || 0),
      notes: draft.booking_snapshot.notes || '',
    },
  };
}

export function getInvoiceBusinessDefaults(): InvoiceBusinessSnapshot {
  return DEFAULT_BUSINESS_SNAPSHOT;
}
