'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Download, Eye, Loader2, RotateCcw, Save } from 'lucide-react';
import type { Booking } from '@/lib/supabase';
import type { InvoiceDraftPayload } from '@/lib/invoices';
import { getBookingById } from '@/lib/api/bookings';
import { createInvoiceDraft, getInvoiceByBookingId } from '@/lib/api/invoices';
import InvoiceTemplate from '@/components/InvoiceTemplate';
import { buildDefaultInvoiceFromBooking } from '@/lib/invoices';
import { exportToPDF, generateInvoicePDFFilename } from '@/utils/pdfExport';

interface InvoiceEditorProps {
  bookingId: string;
  mobile?: boolean;
}

function formatCurrencyInput(value: number) {
  return Number(value || 0).toFixed(2);
}

export default function InvoiceEditor({ bookingId, mobile = false }: InvoiceEditorProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const previewRef = useRef<HTMLDivElement>(null);

  const [booking, setBooking] = useState<Booking | null>(null);
  const [draft, setDraft] = useState<InvoiceDraftPayload | null>(null);
  const [bookingDefaults, setBookingDefaults] = useState<InvoiceDraftPayload | null>(null);
  const [hasSavedDraft, setHasSavedDraft] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [message, setMessage] = useState('');
  const [showMobilePreview, setShowMobilePreview] = useState(false);
  const [hasAutoExported, setHasAutoExported] = useState(false);

  const exportOnLoad = searchParams.get('export') === '1';
  const backHref = mobile ? `/admin/mobile/bookings/${bookingId}` : `/admin/bookings/${bookingId}`;

  useEffect(() => {
    let active = true;

    async function loadData() {
      setLoading(true);

      try {
        const [bookingData, invoiceResponse] = await Promise.all([
          getBookingById(bookingId),
          getInvoiceByBookingId(bookingId),
        ]);

        if (!active || !bookingData) {
          return;
        }

        setBooking(bookingData);
        const defaultDraft = invoiceResponse.exists
          ? buildDefaultInvoiceFromBooking(bookingData, invoiceResponse.invoice.business_snapshot)
          : invoiceResponse.invoice || buildDefaultInvoiceFromBooking(bookingData);
        setBookingDefaults(defaultDraft);
        setDraft(invoiceResponse.invoice || defaultDraft);
        setHasSavedDraft(invoiceResponse.exists);
      } catch (error) {
        console.error('Invoice editor load error:', error);
        if (active) {
          setMessage('Failed to load invoice data.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    loadData();

    return () => {
      active = false;
    };
  }, [bookingId]);

  useEffect(() => {
    if (!exportOnLoad || !draft || !booking || loading || hasAutoExported) {
      return;
    }

    setHasAutoExported(true);
    void handleExport(true);
  }, [exportOnLoad, draft, booking, loading, hasAutoExported]);

  const setStatusMessage = (value: string) => {
    setMessage(value);
    window.setTimeout(() => {
      setMessage('');
    }, 3000);
  };

  const updatePricing = (nextDraft: InvoiceDraftPayload) => {
    const rentalSubtotal = Number(nextDraft.booking_snapshot.rental_subtotal || 0);
    const deliveryFee = Number(nextDraft.booking_snapshot.delivery_fee || 0);
    const depositPaidAmount = Number(nextDraft.booking_snapshot.deposit_paid_amount || 0);
    const totalAmount = rentalSubtotal + deliveryFee;
    const balanceDue = Math.max(totalAmount - depositPaidAmount, 0);

    return {
      ...nextDraft,
      booking_snapshot: {
        ...nextDraft.booking_snapshot,
        rental_subtotal: rentalSubtotal,
        delivery_fee: deliveryFee,
        deposit_paid_amount: depositPaidAmount,
        total_amount: totalAmount,
        balance_due: balanceDue,
      },
    };
  };

  const handleDraftChange = (
    section: 'business_snapshot' | 'customer_snapshot' | 'booking_snapshot',
    field: string,
    value: string
  ) => {
    if (!draft) return;

    const nextDraft = {
      ...draft,
      [section]: {
        ...draft[section],
        [field]:
          section === 'booking_snapshot' &&
          ['total_days', 'rental_subtotal', 'delivery_fee', 'deposit_amount', 'deposit_paid_amount', 'total_amount', 'balance_due'].includes(field)
            ? Number(value || 0)
            : value,
      },
    } as InvoiceDraftPayload;

    if (section === 'booking_snapshot' && ['rental_subtotal', 'delivery_fee', 'deposit_paid_amount'].includes(field)) {
      setDraft(updatePricing(nextDraft));
      return;
    }

    setDraft(nextDraft);
  };

  const handleRootChange = (field: 'invoice_number' | 'issue_date' | 'notes', value: string) => {
    if (!draft) return;
    setDraft({
      ...draft,
      [field]: value,
    });
  };

  const handleReset = () => {
    if (!booking) return;
    setDraft(
      bookingDefaults ||
      buildDefaultInvoiceFromBooking(booking, draft?.business_snapshot)
    );
    setStatusMessage('Invoice reset to the latest booking data.');
  };

  const handleSave = async (exportAfterSave = false) => {
    if (!draft) return null;

    setSaving(true);
    try {
      const savedInvoice = await createInvoiceDraft(bookingId, {
        ...draft,
        status: exportAfterSave ? 'exported' : 'draft',
        exported_at: exportAfterSave ? new Date().toISOString() : null,
      });
      setHasSavedDraft(true);
      setDraft({
        ...draft,
        status: savedInvoice.status,
      });
      setStatusMessage(exportAfterSave ? 'Invoice saved and exported.' : 'Invoice draft saved.');
      return savedInvoice;
    } catch (error) {
      console.error('Invoice save error:', error);
      setStatusMessage('Failed to save invoice draft.');
      return null;
    } finally {
      setSaving(false);
    }
  };

  const handleExport = async (fromAutoExport = false) => {
    if (!draft || !previewRef.current) return;

    setExporting(true);
    try {
      await handleSave(true);
      await exportToPDF(previewRef.current, {
        filename: generateInvoicePDFFilename(
          draft.customer_snapshot.full_name || 'Customer',
          draft.invoice_number,
          bookingId
        ),
      });
      setStatusMessage('Invoice PDF exported.');
      if (fromAutoExport && mobile) {
        router.replace(`/admin/mobile/bookings/${bookingId}/invoice`);
      } else if (fromAutoExport) {
        router.replace(`/admin/bookings/${bookingId}/invoice`);
      }
    } catch (error) {
      console.error('Invoice export error:', error);
      setStatusMessage('Failed to export invoice PDF.');
    } finally {
      setExporting(false);
    }
  };

  if (loading || !draft) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-3 text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading invoice editor...
        </div>
      </div>
    );
  }

  const fieldClassName = 'w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20';
  const sectionCardClassName = 'rounded-2xl border border-slate-200 bg-white p-5 shadow-sm';

  const renderInputSection = (title: string, section: 'business_snapshot' | 'customer_snapshot' | 'booking_snapshot', fields: Array<{ key: string; label: string; type?: string }>) => {
    const sectionValues = draft[section] as unknown as Record<string, string | number>;
    const content = (
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {fields.map((field) => (
          <label key={field.key} className={field.key.includes('address') || field.key === 'notes' ? 'md:col-span-2 block' : 'block'}>
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              {field.label}
            </span>
            {field.key.includes('address') ? (
              <textarea
                rows={3}
                value={String(sectionValues[field.key] ?? '')}
                onChange={(e) => handleDraftChange(section, field.key, e.target.value)}
                className={fieldClassName}
              />
            ) : (
              <input
                type={field.type || 'text'}
                value={String(sectionValues[field.key] ?? '')}
                onChange={(e) => handleDraftChange(section, field.key, e.target.value)}
                className={fieldClassName}
              />
            )}
          </label>
        ))}
      </div>
    );

    if (!mobile) {
      return (
        <div className={sectionCardClassName}>
          <h2 className="mb-4 text-base font-bold text-slate-900">{title}</h2>
          {content}
        </div>
      );
    }

    return (
      <details className={sectionCardClassName} open>
        <summary className="cursor-pointer list-none text-base font-bold text-slate-900">{title}</summary>
        <div className="mt-4">{content}</div>
      </details>
    );
  };

  return (
    <div className={mobile ? 'pb-28' : 'space-y-6'}>
      <div className={mobile ? 'sticky top-0 z-30 border-b border-slate-200 bg-white/95 px-4 py-4 backdrop-blur' : 'flex items-center justify-between'}>
        <div className="flex items-center gap-3">
          <Link
            href={backHref}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              {mobile ? 'Invoice Editor' : 'Booking Invoice'}
            </h1>
            <p className="text-sm text-slate-500">
              {hasSavedDraft ? 'Saved draft is loaded.' : 'New invoice draft based on booking data.'}
            </p>
          </div>
        </div>

        {!mobile && (
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              type="button"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </button>
            <button
              onClick={() => handleSave(false)}
              type="button"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save Draft'}
            </button>
            <button
              onClick={() => handleExport(false)}
              type="button"
              disabled={exporting}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              <Download className="h-4 w-4" />
              {exporting ? 'Exporting...' : 'Export PDF'}
            </button>
          </div>
        )}
      </div>

      {message && (
        <div className={`rounded-2xl border px-4 py-3 text-sm ${message.includes('Failed') ? 'border-red-200 bg-red-50 text-red-700' : 'border-emerald-200 bg-emerald-50 text-emerald-700'}`}>
          {message}
        </div>
      )}

      <div className={mobile ? 'space-y-4 px-4 pt-4' : 'grid grid-cols-1 gap-6 xl:grid-cols-[1.1fr_0.9fr]'}>
        <div className="space-y-4">
          <div className={sectionCardClassName}>
            <h2 className="mb-4 text-base font-bold text-slate-900">Invoice Basics</h2>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Invoice Number</span>
                <input
                  type="text"
                  value={draft.invoice_number}
                  onChange={(e) => handleRootChange('invoice_number', e.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Issue Date</span>
                <input
                  type="date"
                  value={draft.issue_date}
                  onChange={(e) => handleRootChange('issue_date', e.target.value)}
                  className={fieldClassName}
                />
              </label>
              <label className="block md:col-span-2">
                <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">Invoice Notes</span>
                <textarea
                  rows={4}
                  value={draft.notes}
                  onChange={(e) => handleRootChange('notes', e.target.value)}
                  className={fieldClassName}
                />
              </label>
            </div>
          </div>

          {renderInputSection('Business Details', 'business_snapshot', [
            { key: 'business_name', label: 'Business Name' },
            { key: 'business_email', label: 'Business Email', type: 'email' },
            { key: 'business_phone', label: 'Business Phone' },
            { key: 'business_address', label: 'Business Address' },
            { key: 'logo_url', label: 'Logo URL' },
          ])}

          {renderInputSection('Customer Details', 'customer_snapshot', [
            { key: 'full_name', label: 'Customer Name' },
            { key: 'email', label: 'Customer Email', type: 'email' },
            { key: 'phone', label: 'Customer Phone' },
            { key: 'address', label: 'Customer Address' },
            { key: 'id_number', label: 'ID Number' },
          ])}

          {renderInputSection('Booking Breakdown', 'booking_snapshot', [
            { key: 'camera_name', label: 'Camera Name' },
            { key: 'rental_start_date', label: 'Booking Start Date', type: 'date' },
            { key: 'rental_end_date', label: 'Booking End Date', type: 'date' },
            { key: 'total_days', label: 'Total Days', type: 'number' },
            { key: 'pickup_method', label: 'Pickup Method' },
            { key: 'pickup_address', label: 'Pickup / Delivery Address' },
            { key: 'rental_subtotal', label: 'Rental Amount', type: 'number' },
            { key: 'delivery_fee', label: 'Delivery Fee', type: 'number' },
            { key: 'deposit_amount', label: 'Deposit Amount', type: 'number' },
            { key: 'deposit_paid_amount', label: 'Deposit Paid', type: 'number' },
            { key: 'total_amount', label: 'Total Amount', type: 'number' },
            { key: 'balance_due', label: 'Balance Due', type: 'number' },
          ])}

          <div className={sectionCardClassName}>
            <h2 className="mb-4 text-base font-bold text-slate-900">Payment Snapshot</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {[
                { label: 'Rental Amount', value: formatCurrencyInput(draft.booking_snapshot.rental_subtotal) },
                { label: 'Delivery Fee', value: formatCurrencyInput(draft.booking_snapshot.delivery_fee) },
                { label: 'Total Amount', value: formatCurrencyInput(draft.booking_snapshot.total_amount) },
                { label: 'Balance Due', value: formatCurrencyInput(draft.booking_snapshot.balance_due) },
              ].map((item) => (
                <div key={item.label} className="rounded-xl bg-slate-50 p-3">
                  <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{item.label}</div>
                  <div className="mt-1 text-base font-bold text-slate-900">RM{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {!mobile && (
          <div className="rounded-3xl border border-slate-200 bg-slate-100 p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-slate-900">Live Preview</h2>
                <p className="text-sm text-slate-500">This is what will be exported to PDF.</p>
              </div>
            </div>
            <div ref={previewRef} className="overflow-hidden rounded-2xl bg-white shadow-sm">
              <InvoiceTemplate invoice={draft} />
            </div>
          </div>
        )}
      </div>

      {mobile && (
        <>
          {showMobilePreview && (
            <div className="fixed inset-0 z-50 bg-black/60 p-4 backdrop-blur-sm">
              <div className="mx-auto flex h-full max-w-3xl flex-col rounded-3xl bg-slate-100">
                <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                  <div>
                    <h2 className="text-base font-bold text-slate-900">Invoice Preview</h2>
                    <p className="text-xs text-slate-500">Preview before export</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowMobilePreview(false)}
                    className="rounded-xl border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700"
                  >
                    Close
                  </button>
                </div>
                <div className="flex-1 overflow-y-auto p-3">
                  <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                    <InvoiceTemplate invoice={draft} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="pointer-events-none fixed left-[-9999px] top-0 w-[900px]">
            <div ref={previewRef}>
              <InvoiceTemplate invoice={draft} />
            </div>
          </div>

          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur">
            <div className="mx-auto flex max-w-3xl gap-2">
              <button
                type="button"
                onClick={handleReset}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-300 px-3 py-3 text-sm font-medium text-slate-700"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
              <button
                type="button"
                onClick={() => setShowMobilePreview(true)}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl border border-slate-300 px-3 py-3 text-sm font-medium text-slate-700"
              >
                <Eye className="h-4 w-4" />
                Preview
              </button>
              <button
                type="button"
                onClick={() => handleSave(false)}
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-slate-900 px-3 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Save
              </button>
              <button
                type="button"
                onClick={() => {
                  void handleExport(false);
                }}
                disabled={exporting}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-2xl bg-blue-600 px-3 py-3 text-sm font-medium text-white disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                {exporting ? '...' : 'Export'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
