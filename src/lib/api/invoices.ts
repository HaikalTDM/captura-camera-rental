'use client';

import type { Invoice } from '@/lib/supabase';
import type { InvoiceDraftPayload, InvoiceDraftResponse } from '@/lib/invoices';

export async function getInvoiceByBookingId(bookingId: string): Promise<InvoiceDraftResponse> {
  const response = await fetch(`/api/invoices/by-booking/${bookingId}`, {
    cache: 'no-store',
  });

  if (!response.ok) {
    throw new Error('Failed to load invoice draft');
  }

  return response.json();
}

export async function createInvoiceDraft(
  bookingId: string,
  payload: InvoiceDraftPayload
): Promise<Invoice> {
  const response = await fetch(`/api/invoices/by-booking/${bookingId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json();

  if (!response.ok || !data.success) {
    throw new Error(data.error || 'Failed to save invoice draft');
  }

  return data.invoice;
}

export async function updateInvoiceDraft(
  bookingId: string,
  payload: InvoiceDraftPayload
): Promise<Invoice> {
  return createInvoiceDraft(bookingId, payload);
}
