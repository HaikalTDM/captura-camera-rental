'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FilePenLine, FileText, Loader2 } from 'lucide-react';
import { getInvoiceByBookingId } from '@/lib/api/invoices';

interface InvoiceBookingActionsProps {
  bookingId: string;
  mobile?: boolean;
  className?: string;
}

export default function InvoiceBookingActions({
  bookingId,
  mobile = false,
  className = '',
}: InvoiceBookingActionsProps) {
  const [loading, setLoading] = useState(true);
  const [hasDraft, setHasDraft] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadStatus() {
      try {
        const response = await getInvoiceByBookingId(bookingId);
        if (active) {
          setHasDraft(response.exists);
        }
      } catch (error) {
        console.error('Invoice action load error:', error);
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadStatus();

    return () => {
      active = false;
    };
  }, [bookingId]);

  const editorHref = mobile
    ? `/admin/mobile/bookings/${bookingId}/invoice`
    : `/admin/bookings/${bookingId}/invoice`;
  const exportHref = `${editorHref}?export=1`;

  if (loading) {
    return (
      <div className={`flex items-center gap-2 text-sm text-slate-500 ${className}`}>
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading invoice actions...
      </div>
    );
  }

  const baseButtonClass = mobile
    ? 'flex items-center gap-3 rounded-2xl border px-4 py-4 text-sm font-semibold shadow-sm transition-all duration-200 active:scale-[0.98]'
    : 'inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium transition-all duration-200';

  return (
    <div className={`${mobile ? 'space-y-3' : 'flex flex-wrap items-center gap-3'} ${className}`}>
      <Link
        href={editorHref}
        className={`${baseButtonClass} ${
          mobile
            ? 'border-blue-200 bg-blue-50 text-blue-700'
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        <FilePenLine className="h-4 w-4" />
        {hasDraft ? 'Edit Invoice' : 'Create Invoice'}
      </Link>

      <Link
        href={exportHref}
        className={`${baseButtonClass} ${
          mobile
            ? 'border-slate-200 bg-white text-slate-700'
            : 'border border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
        }`}
      >
        <FileText className="h-4 w-4" />
        Export Invoice
      </Link>
    </div>
  );
}
