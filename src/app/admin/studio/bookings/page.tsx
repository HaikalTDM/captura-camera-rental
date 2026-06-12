'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchStudioBookings,
  fetchStudioBookingById,
  type StudioBooking,
  type StudioBookingListItem,
  type StudioServiceType,
  type StudioBookingStatus,
} from '@/lib/api/studio-bookings';
import NewBookingModal from '@/components/admin/studio/NewBookingModal';

type ServiceFilter = StudioServiceType | 'all';
type StatusFilter = StudioBookingStatus | 'all';

const serviceLabels: Record<string, { label: string; color: string }> = {
  video: { label: 'Video', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  photo: { label: 'Photo', color: 'bg-[#d4af37]/10 text-[#a08520] border-[#d4af37]/30' },
  combo: { label: 'Photo + Video', color: 'bg-blue-50 text-blue-700 border-blue-200' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  confirmed: { label: 'Confirmed', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  completed: { label: 'Completed', color: 'bg-stone-100 text-stone-500 border-stone-200' },
  cancelled: { label: 'Cancelled', color: 'bg-red-50 text-red-700 border-red-200' },
};

export default function StudioBookingsPage() {
  const [serviceFilter, setServiceFilter] = useState<ServiceFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookings, setBookings] = useState<StudioBookingListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<StudioBooking | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [newBookingOpen, setNewBookingOpen] = useState(false);

  const loadList = useCallback(async () => {
    setLoading(true);
    const data = await fetchStudioBookings({
      serviceType: serviceFilter,
      status: statusFilter,
      search: searchQuery || undefined,
    });
    setBookings(data);
    setLoading(false);
  }, [serviceFilter, statusFilter, searchQuery]);

  useEffect(() => {
    loadList();
  }, [loadList]);

  const handleRowClick = async (id: string) => {
    setDetailLoading(true);
    const booking = await fetchStudioBookingById(id);
    setSelectedBooking(booking);
    setDetailLoading(false);
  };

  const handleStatusChange = async (newStatus: StudioBookingStatus) => {
    if (!selectedBooking) return;
    const res = await fetch(`/api/studio/bookings/${selectedBooking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: newStatus }),
    });
    if (res.ok) {
      const { booking } = await res.json();
      setSelectedBooking({ ...selectedBooking, ...booking });
      await loadList();
    }
  };

  const handleTogglePayment = async (field: 'deposit_paid' | 'final_payment_paid') => {
    if (!selectedBooking) return;
    const newValue = !selectedBooking[field];
    const res = await fetch(`/api/studio/bookings/${selectedBooking.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ [field]: newValue }),
    });
    if (res.ok) {
      const { booking } = await res.json();
      setSelectedBooking({ ...selectedBooking, ...booking });
    }
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 mb-1">Bookings</h1>
          <p className="text-stone-400 text-sm">{bookings.length} {bookings.length === 1 ? 'job' : 'jobs'} shown</p>
        </div>
        <button
          onClick={() => setNewBookingOpen(true)}
          className="px-4 py-2.5 bg-[#d4af37] text-black font-semibold text-sm rounded-lg hover:bg-[#d4af37]/90 transition-all inline-flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Booking
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search clients..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-300"
        />
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value as ServiceFilter)}
          className="px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-stone-700 text-sm focus:outline-none focus:border-stone-300"
        >
          <option value="all">All Services</option>
          <option value="video">Video</option>
          <option value="photo">Photo</option>
          <option value="combo">Photo + Video</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
          className="px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-stone-700 text-sm focus:outline-none focus:border-stone-300"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-6 py-3 text-stone-400 text-xs uppercase tracking-wider font-medium">Client</th>
                <th className="text-left px-6 py-3 text-stone-400 text-xs uppercase tracking-wider font-medium">Service</th>
                <th className="text-left px-6 py-3 text-stone-400 text-xs uppercase tracking-wider font-medium">Package</th>
                <th className="text-left px-6 py-3 text-stone-400 text-xs uppercase tracking-wider font-medium">Date</th>
                <th className="text-left px-6 py-3 text-stone-400 text-xs uppercase tracking-wider font-medium">Amount</th>
                <th className="text-left px-6 py-3 text-stone-400 text-xs uppercase tracking-wider font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                [...Array(4)].map((_, i) => (
                  <tr key={i}>
                    <td colSpan={6} className="px-6 py-4">
                      <div className="h-4 bg-stone-100 rounded animate-pulse"></div>
                    </td>
                  </tr>
                ))
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-400 text-sm">
                    No bookings match your filters.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr
                    key={booking.id}
                    onClick={() => handleRowClick(booking.id)}
                    className="hover:bg-stone-50 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4">
                      <p className="text-stone-900 text-sm font-medium">{booking.client}</p>
                      <p className="text-stone-400 text-xs mt-0.5">{booking.phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${serviceLabels[booking.service]?.color ?? ''}`}>
                        {serviceLabels[booking.service]?.label ?? booking.service}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-600 text-sm">{booking.package}</td>
                    <td className="px-6 py-4 text-stone-600 text-sm">{booking.eventDate}</td>
                    <td className="px-6 py-4 text-stone-900 text-sm font-medium">{booking.amount}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusLabels[booking.status]?.color ?? ''}`}>
                        {statusLabels[booking.status]?.label ?? booking.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Drawer */}
      {(selectedBooking || detailLoading) && (
        <BookingDetailDrawer
          booking={selectedBooking}
          loading={detailLoading}
          onClose={() => setSelectedBooking(null)}
          onStatusChange={handleStatusChange}
          onTogglePayment={handleTogglePayment}
        />
      )}

      {/* New Booking Modal */}
      <NewBookingModal
        open={newBookingOpen}
        onClose={() => setNewBookingOpen(false)}
        onCreated={async (id) => {
          setNewBookingOpen(false);
          await loadList();
          setDetailLoading(true);
          const booking = await fetchStudioBookingById(id);
          setSelectedBooking(booking);
          setDetailLoading(false);
        }}
      />
    </div>
  );
}

// ====== Detail Drawer ======
const STATUS_OPTIONS: StudioBookingStatus[] = ['pending', 'confirmed', 'completed', 'cancelled'];

function BookingDetailDrawer({
  booking, loading, onClose, onStatusChange, onTogglePayment,
}: {
  booking: StudioBooking | null;
  loading: boolean;
  onClose: () => void;
  onStatusChange: (s: StudioBookingStatus) => void;
  onTogglePayment: (f: 'deposit_paid' | 'final_payment_paid') => void;
}) {
  const fmtMoney = (n: number) => `RM${Number(n ?? 0).toLocaleString()}`;
  const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const handleWA = () => {
    if (!booking?.customer?.phone) return;
    const msg = `Hi ${booking.customer.name}! Following up on your ${booking.event_type} booking.`;
    const phone = booking.customer.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div
        className="relative ml-auto w-full max-w-xl h-full bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-stone-400 text-[10px] uppercase tracking-wider">Booking</p>
            <h2 className="text-lg font-bold text-stone-900">
              {loading ? 'Loading...' : booking?.customer?.name ?? '—'}
            </h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {loading || !booking ? (
          <div className="p-12 text-center text-stone-400 text-sm">Loading booking details...</div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Status changer */}
            <div>
              <p className="text-stone-400 text-[10px] uppercase tracking-wider mb-2">Status</p>
              <div className="flex flex-wrap gap-2">
                {STATUS_OPTIONS.map((s) => (
                  <button
                    key={s}
                    onClick={() => onStatusChange(s)}
                    className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                      booking.status === s
                        ? 'bg-stone-900 text-white border-stone-900'
                        : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    {statusLabels[s]?.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleWA}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition-colors"
              >
                Reply on WhatsApp
              </button>
              {booking.customer?.email && (
                <a
                  href={`mailto:${booking.customer.email}`}
                  className="px-4 py-2.5 bg-white border border-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-stone-50"
                >
                  Email
                </a>
              )}
            </div>

            {/* Sections */}
            <DSection title="Customer">
              <DRow label="Name" value={booking.customer?.name ?? '—'} />
              <DRow label="Phone" value={booking.customer?.phone ?? '—'} />
              {booking.customer?.email && <DRow label="Email" value={booking.customer.email} />}
            </DSection>

            <DSection title="Event Details">
              <DRow label="Service" value={booking.service_type} />
              <DRow label="Type" value={booking.event_type} />
              <DRow label="Date" value={fmtDate(booking.event_date)} />
              <DRow label="Start time" value={booking.event_start_time ?? '—'} />
              <DRow label="Duration" value={`${booking.event_duration_hours} hours`} />
              {booking.venue_name && <DRow label="Venue" value={booking.venue_name} />}
              <DRow label="Address" value={booking.venue_address} />
            </DSection>

            <DSection title="Package & Pricing">
              <DRow label="Package" value={booking.package_name ?? '—'} />
              <DRow label="Package price" value={fmtMoney(booking.package_price)} />
              {booking.addons_total > 0 && <DRow label="Add-ons" value={fmtMoney(booking.addons_total)} />}
              <DRow label="Total" value={fmtMoney(booking.total_amount)} />
            </DSection>

            <DSection title="Payment">
              <PaymentRow
                label="Deposit"
                amount={fmtMoney(booking.deposit_amount)}
                paid={booking.deposit_paid}
                onToggle={() => onTogglePayment('deposit_paid')}
              />
              <PaymentRow
                label="Final payment"
                amount={fmtMoney(booking.total_amount - booking.deposit_amount)}
                paid={(booking as any).final_payment_paid ?? false}
                onToggle={() => onTogglePayment('final_payment_paid')}
              />
            </DSection>

            {booking.admin_notes && (
              <DSection title="Admin Notes">
                <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{booking.admin_notes}</p>
              </DSection>
            )}

            <DSection title="Meta">
              <DRow label="Created" value={new Date(booking.created_at).toLocaleString('en-MY')} />
              <DRow label="Updated" value={new Date(booking.updated_at).toLocaleString('en-MY')} />
            </DSection>
          </div>
        )}
      </div>
    </div>
  );
}

function DSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-stone-400 text-[10px] uppercase tracking-wider mb-3 pb-2 border-b border-stone-100">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-stone-400 text-xs">{label}</span>
      <span className="text-stone-900 text-sm font-medium text-right">{value}</span>
    </div>
  );
}

function PaymentRow({ label, amount, paid, onToggle }: { label: string; amount: string; paid: boolean; onToggle: () => void }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-stone-900 text-sm font-medium">{label}</p>
        <p className="text-stone-400 text-xs">{amount}</p>
      </div>
      <button
        onClick={onToggle}
        className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-full border transition-all ${
          paid
            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
            : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
        }`}
      >
        {paid ? '✓ Paid' : 'Mark paid'}
      </button>
    </div>
  );
}
