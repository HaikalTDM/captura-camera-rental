'use client';

import { useParams } from 'next/navigation';
import InvoiceEditor from '@/components/InvoiceEditor';

export default function BookingInvoicePage() {
  const params = useParams();
  const bookingId = params.id as string;

  return <InvoiceEditor bookingId={bookingId} />;
}
