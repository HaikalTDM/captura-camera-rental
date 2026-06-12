'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  fetchStudioInquiries,
  fetchInquiryStats,
  type StudioInquiry,
  type InquiryServiceType,
  type InquiryStatus,
  type InquiryStats,
} from '@/lib/api/studio-inquiries';

const serviceLabels: Record<string, { label: string; color: string }> = {
  videography: { label: 'Video', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  photography: { label: 'Photo', color: 'bg-[#d4af37]/10 text-[#a08520] border-[#d4af37]/30' },
};

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: 'New', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  contacted: { label: 'Contacted', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  quoted: { label: 'Quoted', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  booked: { label: 'Booked', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  lost: { label: 'Lost', color: 'bg-stone-100 text-stone-500 border-stone-200' },
};

const statusOptions: InquiryStatus[] = ['new', 'contacted', 'quoted', 'booked', 'lost'];

export default function StudioInquiriesPage() {
  const [serviceFilter, setServiceFilter] = useState<InquiryServiceType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<InquiryStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [inquiries, setInquiries] = useState<StudioInquiry[]>([]);
  const [stats, setStats] = useState<InquiryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<StudioInquiry | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [list, statData] = await Promise.all([
      fetchStudioInquiries({
        serviceType: serviceFilter,
        status: statusFilter,
        search: searchQuery || undefined,
      }),
      fetchInquiryStats(),
    ]);
    setInquiries(list);
    setStats(statData);
    setLoading(false);
  }, [serviceFilter, statusFilter, searchQuery]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleStatusChange = async (id: string, newStatus: InquiryStatus) => {
    try {
      const res = await fetch(`/api/studio/inquiries/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed');
      await loadData();
      if (selected?.id === id) {
        setSelected({ ...selected, status: newStatus });
      }
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  const formatDate = (s: string | null) => {
    if (!s) return '—';
    return new Date(s).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const formatRelativeTime = (s: string) => {
    const diff = Date.now() - new Date(s).getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    if (hours < 1) return 'just now';
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return formatDate(s);
  };

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Inquiries</h1>
        <p className="text-stone-400 text-sm">Quote requests from your website. Convert leads into bookings.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        {[
          { label: 'Total', value: stats?.total ?? 0, color: 'text-stone-900' },
          { label: 'New', value: stats?.newCount ?? 0, color: 'text-blue-600' },
          { label: 'Contacted', value: stats?.contactedCount ?? 0, color: 'text-amber-600' },
          { label: 'Booked', value: stats?.bookedCount ?? 0, color: 'text-emerald-600' },
          { label: 'Conversion', value: `${stats?.conversionRate ?? 0}%`, color: 'text-purple-600' },
        ].map((s) => (
          <div key={s.label} className="bg-white border border-stone-200/80 rounded-xl p-4 shadow-sm">
            <p className="text-stone-400 text-[10px] uppercase tracking-wider mb-1">{s.label}</p>
            <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search by name, phone, venue..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-stone-900 text-sm placeholder-stone-400 focus:outline-none focus:border-stone-300"
        />
        <select
          value={serviceFilter}
          onChange={(e) => setServiceFilter(e.target.value as InquiryServiceType | 'all')}
          className="px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-stone-700 text-sm focus:outline-none focus:border-stone-300"
        >
          <option value="all">All Services</option>
          <option value="photography">Photography</option>
          <option value="videography">Videography</option>
        </select>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as InquiryStatus | 'all')}
          className="px-4 py-2.5 bg-white border border-stone-200 rounded-lg text-stone-700 text-sm focus:outline-none focus:border-stone-300"
        >
          <option value="all">All Status</option>
          {statusOptions.map((s) => (
            <option key={s} value={s}>{statusLabels[s].label}</option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-stone-100">
                <th className="text-left px-6 py-3 text-stone-400 text-xs uppercase tracking-wider font-medium">Client</th>
                <th className="text-left px-6 py-3 text-stone-400 text-xs uppercase tracking-wider font-medium">Service</th>
                <th className="text-left px-6 py-3 text-stone-400 text-xs uppercase tracking-wider font-medium">Event</th>
                <th className="text-left px-6 py-3 text-stone-400 text-xs uppercase tracking-wider font-medium">Date</th>
                <th className="text-left px-6 py-3 text-stone-400 text-xs uppercase tracking-wider font-medium">Submitted</th>
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
              ) : inquiries.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-stone-400 text-sm">
                    No inquiries match your filters.
                  </td>
                </tr>
              ) : (
                inquiries.map((inq) => (
                  <tr
                    key={inq.id}
                    className="hover:bg-stone-50 transition-colors cursor-pointer"
                    onClick={() => setSelected(inq)}
                  >
                    <td className="px-6 py-4">
                      <p className="text-stone-900 text-sm font-medium">{inq.client_name}</p>
                      <p className="text-stone-400 text-xs mt-0.5">{inq.client_phone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${serviceLabels[inq.service_type]?.color}`}>
                        {serviceLabels[inq.service_type]?.label}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-stone-600 text-sm">{inq.event_type}</td>
                    <td className="px-6 py-4 text-stone-600 text-sm">{formatDate(inq.event_date)}</td>
                    <td className="px-6 py-4 text-stone-400 text-xs">{formatRelativeTime(inq.created_at)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusLabels[inq.status]?.color}`}>
                        {statusLabels[inq.status]?.label}
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
      {selected && (
        <InquiryDetailDrawer
          inquiry={selected}
          onClose={() => setSelected(null)}
          onStatusChange={handleStatusChange}
        />
      )}
    </div>
  );
}

// ====== Detail Drawer ======
function InquiryDetailDrawer({
  inquiry,
  onClose,
  onStatusChange,
}: {
  inquiry: StudioInquiry;
  onClose: () => void;
  onStatusChange: (id: string, status: InquiryStatus) => void;
}) {
  const isVideo = inquiry.service_type === 'videography';

  const handleWA = () => {
    const msg = `Hi ${inquiry.client_name}! Thanks for your inquiry about ${inquiry.event_type}. Let's discuss the details.`;
    const phone = inquiry.client_phone.replace(/\D/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"></div>
      <div
        className="relative ml-auto w-full max-w-xl h-full bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-stone-400 text-[10px] uppercase tracking-wider">Inquiry</p>
            <h2 className="text-lg font-bold text-stone-900">{inquiry.client_name}</h2>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Status changer */}
          <div>
            <p className="text-stone-400 text-[10px] uppercase tracking-wider mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {statusOptions.map((s) => (
                <button
                  key={s}
                  onClick={() => onStatusChange(inquiry.id, s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-all ${
                    inquiry.status === s
                      ? 'bg-stone-900 text-white border-stone-900'
                      : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {statusLabels[s].label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleWA}
              className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Reply on WhatsApp
            </button>
            {inquiry.client_email && (
              <a
                href={`mailto:${inquiry.client_email}`}
                className="px-4 py-2.5 bg-white border border-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-stone-50 transition-colors"
              >
                Email
              </a>
            )}
          </div>

          {/* Details */}
          <DetailSection title="Contact">
            <DetailRow label="Phone" value={inquiry.client_phone} />
            {inquiry.client_email && <DetailRow label="Email" value={inquiry.client_email} />}
          </DetailSection>

          <DetailSection title="Event Details">
            <DetailRow label="Service" value={inquiry.service_type === 'photography' ? 'Photography' : 'Videography'} />
            <DetailRow label="Type" value={inquiry.event_type} />
            <DetailRow label="Date" value={inquiry.event_date ?? '—'} />
            {inquiry.event_start_time && <DetailRow label="Start time" value={inquiry.event_start_time} />}
            <DetailRow label="Venue" value={inquiry.venue} />
            {inquiry.coverage_duration && <DetailRow label="Coverage" value={inquiry.coverage_duration} />}
          </DetailSection>

          {!isVideo && (inquiry.guest_count || inquiry.shooter_setup) && (
            <DetailSection title="Photography Specifics">
              {inquiry.guest_count && <DetailRow label="Guests" value={inquiry.guest_count} />}
              {inquiry.shooter_setup && <DetailRow label="Setup" value={inquiry.shooter_setup} />}
            </DetailSection>
          )}

          {isVideo && (inquiry.final_video_length || inquiry.drone_needed || inquiry.style_preference) && (
            <DetailSection title="Videography Specifics">
              {inquiry.final_video_length && <DetailRow label="Final length" value={inquiry.final_video_length} />}
              {inquiry.drone_needed && <DetailRow label="Drone" value={inquiry.drone_needed} />}
              {inquiry.style_preference && <DetailRow label="Style" value={inquiry.style_preference} />}
            </DetailSection>
          )}

          {inquiry.special_requests && (
            <DetailSection title="Special Requests">
              <p className="text-sm text-stone-700 whitespace-pre-wrap leading-relaxed">{inquiry.special_requests}</p>
            </DetailSection>
          )}

          <DetailSection title="Meta">
            <DetailRow label="Submitted" value={new Date(inquiry.created_at).toLocaleString('en-MY')} />
            <DetailRow label="Source" value={inquiry.source} />
          </DetailSection>
        </div>
      </div>
    </div>
  );
}

function DetailSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-stone-400 text-[10px] uppercase tracking-wider mb-3 pb-2 border-b border-stone-100">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-stone-400 text-xs">{label}</span>
      <span className="text-stone-900 text-sm font-medium text-right">{value}</span>
    </div>
  );
}
