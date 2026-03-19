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
      <div className={`flex items-center gap-2 text-sm text-stone-500 ${className}`}>
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
            ? 'border-[#4c2d14] bg-[#25170d] text-[#fdba74]'
            : 'border border-[#4c2d14] bg-[#25170d] text-[#fdba74] hover:bg-[#2d1b0e]'
        }`}
      >
        <FilePenLine className="h-4 w-4" />
        {hasDraft ? 'Edit Invoice' : 'Create Invoice'}
      </Link>

      <Link
        href={exportHref}
        className={`${baseButtonClass} ${
          mobile
            ? 'border-[#3d342d] bg-[#1d1916] text-stone-100'
            : 'border border-[#3d342d] bg-[#1d1916] text-stone-100 hover:border-[#56473c] hover:bg-[#24201c]'
        }`}
      >
        <FileText className="h-4 w-4" />
        Export Invoice
      </Link>
    </div>
  );
}
