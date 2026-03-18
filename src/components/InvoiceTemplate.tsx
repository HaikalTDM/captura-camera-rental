'use client';

import { format } from 'date-fns';
import type { InvoiceDraftPayload } from '@/lib/invoices';

interface InvoiceTemplateProps {
  invoice: InvoiceDraftPayload;
}

const formatCurrency = (amount: number) => `RM${Number(amount || 0).toFixed(2)}`;

const formatDate = (value: string) => {
  if (!value) return '-';

  try {
    return format(new Date(value), 'dd MMM yyyy');
  } catch {
    return value;
  }
};

export default function InvoiceTemplate({ invoice }: InvoiceTemplateProps) {
  const business = invoice.business_snapshot;
  const customer = invoice.customer_snapshot;
  const booking = invoice.booking_snapshot;
  const displayStatus = (invoice.status || 'draft') === 'exported' ? 'FINISHED' : (invoice.status || 'draft').toUpperCase();

  return (
    <div
      className="mx-auto w-full max-w-[900px] bg-white text-slate-900"
      style={{
        padding: '32px',
        fontFamily: 'Arial, sans-serif',
        lineHeight: 1.5,
      }}
    >
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          gap: '24px',
          borderBottom: '3px solid #0f172a',
          paddingBottom: '24px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <img
            src={business.logo_url}
            alt={business.business_name}
            style={{ width: '88px', height: '88px', objectFit: 'contain' }}
          />
          <div>
            <div style={{ fontSize: '30px', fontWeight: 700, letterSpacing: '0.08em' }}>
              {business.business_name}
            </div>
            <div style={{ fontSize: '13px', color: '#475569', marginTop: '6px' }}>
              {business.business_email}
            </div>
            <div style={{ fontSize: '13px', color: '#475569' }}>
              {business.business_phone}
            </div>
            <div style={{ fontSize: '13px', color: '#475569', maxWidth: '320px' }}>
              {business.business_address}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '34px', fontWeight: 700 }}>INVOICE</div>
          <div style={{ marginTop: '10px', fontSize: '13px', color: '#334155' }}>
            <div><strong>Invoice No:</strong> {invoice.invoice_number}</div>
            <div><strong>Issue Date:</strong> {formatDate(invoice.issue_date)}</div>
            <div><strong>Status:</strong> {displayStatus}</div>
          </div>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '20px',
          marginTop: '24px',
        }}
      >
        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            Bill To
          </div>
          <div style={{ fontWeight: 700 }}>{customer.full_name || '-'}</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>{customer.email || '-'}</div>
          <div style={{ fontSize: '13px' }}>{customer.phone || '-'}</div>
          {customer.address && <div style={{ fontSize: '13px', marginTop: '6px' }}>{customer.address}</div>}
          {customer.id_number && <div style={{ fontSize: '13px', marginTop: '6px' }}>ID: {customer.id_number}</div>}
        </div>

        <div style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            Booking Summary
          </div>
          <div style={{ fontSize: '13px' }}><strong>Booking ID:</strong> {booking.booking_id.slice(0, 8).toUpperCase()}</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}><strong>Camera:</strong> {booking.camera_name}</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>
            <strong>Rental Dates:</strong> {formatDate(booking.rental_start_date)} - {formatDate(booking.rental_end_date)}
          </div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}><strong>Total Days:</strong> {booking.total_days}</div>
          <div style={{ fontSize: '13px', marginTop: '4px' }}>
            <strong>Pickup Method:</strong> {booking.pickup_method === 'delivery' ? 'Delivery' : 'Pickup'}
          </div>
          {booking.pickup_method === 'delivery' && booking.pickup_address && (
            <div style={{ fontSize: '13px', marginTop: '4px' }}>
              <strong>Delivery Address:</strong> {booking.pickup_address}
            </div>
          )}
        </div>
      </div>

      <div style={{ marginTop: '28px' }}>
        <div style={{ fontSize: '14px', fontWeight: 700, textTransform: 'uppercase', marginBottom: '12px' }}>
          Invoice Breakdown
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
          <thead>
            <tr style={{ backgroundColor: '#0f172a', color: '#ffffff' }}>
              <th style={{ textAlign: 'left', padding: '12px' }}>Description</th>
              <th style={{ textAlign: 'right', padding: '12px' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px' }}>
                Camera rental for {booking.camera_name} ({booking.total_days} days)
              </td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(booking.rental_subtotal)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px' }}>Delivery / logistics fee</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(booking.delivery_fee)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px' }}>Deposit amount</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(booking.deposit_amount)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px' }}>Deposit already paid</td>
              <td style={{ padding: '12px', textAlign: 'right' }}>{formatCurrency(booking.deposit_paid_amount)}</td>
            </tr>
            <tr style={{ borderBottom: '1px solid #cbd5e1', backgroundColor: '#f8fafc' }}>
              <td style={{ padding: '14px 12px', fontWeight: 700 }}>Total Amount</td>
              <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 700 }}>{formatCurrency(booking.total_amount)}</td>
            </tr>
            <tr>
              <td style={{ padding: '14px 12px', fontWeight: 700, color: '#b91c1c' }}>Balance Due</td>
              <td style={{ padding: '14px 12px', textAlign: 'right', fontWeight: 700, color: '#b91c1c' }}>{formatCurrency(booking.balance_due)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {invoice.notes && (
        <div
          style={{
            marginTop: '24px',
            border: '1px solid #e2e8f0',
            borderRadius: '12px',
            padding: '16px',
            backgroundColor: '#f8fafc',
          }}
        >
          <div style={{ fontSize: '12px', fontWeight: 700, color: '#475569', textTransform: 'uppercase', marginBottom: '8px' }}>
            Notes
          </div>
          <div style={{ fontSize: '13px', whiteSpace: 'pre-wrap' }}>{invoice.notes}</div>
        </div>
      )}

      <div style={{ marginTop: '28px', fontSize: '11px', color: '#64748b', textAlign: 'center', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
        Thank you for choosing {business.business_name}. Please keep this invoice for your records.
      </div>
    </div>
  );
}
