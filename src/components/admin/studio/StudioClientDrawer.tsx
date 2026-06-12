'use client';

import { useState, useEffect } from 'react';
import type { StudioClient } from '@/lib/api/studio-clients';

interface ClientBooking {
  id: string;
  service_type: string;
  event_type: string;
  event_date: string;
  package_name: string | null;
  total_amount: number;
  status: string;
}

interface StudioClientDrawerProps {
  clientId: string | null;
  onClose: () => void;
  onChanged: () => void; // re-fetch list after edit/delete
}

export default function StudioClientDrawer({ clientId, onClose, onChanged }: StudioClientDrawerProps) {
  const [loading, setLoading] = useState(false);
  const [client, setClient] = useState<StudioClient | null>(null);
  const [bookings, setBookings] = useState<ClientBooking[]>([]);
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Edit form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!clientId) return;
    setLoading(true);
    setError(null);
    setEditing(false);

    (async () => {
      try {
        const res = await fetch(`/api/studio/clients/${clientId}`);
        if (!res.ok) {
          const j = await res.json();
          setError(j.error || 'Failed to load client');
          setLoading(false);
          return;
        }
        const json = await res.json();
        const c = json.customer;
        const rows = (json.bookings ?? []) as ClientBooking[];

        const totalSpent = rows
          .filter((r) => r.status === 'confirmed' || r.status === 'completed')
          .reduce((sum, r) => sum + Number(r.total_amount ?? 0), 0);
        const services = Array.from(
          new Set(rows.map((r) => r.service_type as 'photo' | 'video' | 'combo'))
        );

        const built: StudioClient = {
          id: c.id,
          name: c.full_name || c.name || 'Unnamed',
          phone: c.phone || c.whatsapp || '',
          email: c.email || null,
          whatsapp: c.whatsapp || null,
          address: c.address || null,
          totalJobs: rows.length,
          totalSpent,
          lastJob: rows[0]?.event_date ?? null,
          services,
          createdAt: c.created_at,
          updatedAt: c.updated_at,
        };

        setClient(built);
        setBookings(rows);
        setName(built.name);
        setPhone(built.phone);
        setWhatsapp(built.whatsapp ?? '');
        setEmail(built.email ?? '');
        setAddress(built.address ?? '');
      } catch (e: any) {
        setError(e?.message || 'Network error');
      } finally {
        setLoading(false);
      }
    })();
  }, [clientId]);

  const handleSave = async () => {
    if (!client) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`/api/studio/clients/${client.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, whatsapp, email, address }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Save failed');
        setSaving(false);
        return;
      }
      const c = json.customer;
      setClient({
        ...client,
        name: c.full_name || c.name,
        phone: c.phone || '',
        whatsapp: c.whatsapp || null,
        email: c.email || null,
        address: c.address || null,
        updatedAt: c.updated_at,
      });
      setEditing(false);
      onChanged();
    } catch (e: any) {
      setError(e?.message || 'Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (force: boolean) => {
    if (!client) return;
    setDeleting(true);
    setError(null);
    try {
      const url = `/api/studio/clients/${client.id}${force ? '?force=true' : ''}`;
      const res = await fetch(url, { method: 'DELETE' });
      const json = await res.json().catch(() => ({}));
      if (res.status === 409) {
        // Has bookings — confirm cascade
        const ok = window.confirm(
          `This client has ${json.rentalCount ?? 0} rental booking(s) and ${json.studioCount ?? 0} studio booking(s). Delete client AND all their bookings?`
        );
        if (ok) return handleDelete(true);
        setDeleting(false);
        return;
      }
      if (!res.ok) {
        setError(json.error || 'Delete failed');
        setDeleting(false);
        return;
      }
      onChanged();
      onClose();
    } catch (e: any) {
      setError(e?.message || 'Network error');
      setDeleting(false);
    }
  };

  if (!clientId) return null;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative ml-auto w-full max-w-xl h-full bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <DrawerHeader title={loading ? 'Loading...' : client?.name ?? '—'} onClose={onClose} />

        {loading ? (
          <div className="p-12 text-center text-stone-400 text-sm">Loading client details...</div>
        ) : !client ? (
          <div className="p-12 text-center text-red-500 text-sm">{error || 'Client not found'}</div>
        ) : (
          <DrawerBody
            client={client}
            bookings={bookings}
            editing={editing}
            setEditing={setEditing}
            saving={saving}
            deleting={deleting}
            error={error}
            name={name} setName={setName}
            phone={phone} setPhone={setPhone}
            whatsapp={whatsapp} setWhatsapp={setWhatsapp}
            email={email} setEmail={setEmail}
            address={address} setAddress={setAddress}
            onSave={handleSave}
            onDelete={() => handleDelete(false)}
          />
        )}
      </div>
    </div>
  );
}

function DrawerHeader({ title, onClose }: { title: string; onClose: () => void }) {
  return (
    <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
      <div>
        <p className="text-stone-400 text-[10px] uppercase tracking-wider">Client</p>
        <h2 className="text-lg font-bold text-stone-900">{title}</h2>
      </div>
      <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function DrawerBody(p: {
  client: StudioClient;
  bookings: ClientBooking[];
  editing: boolean;
  setEditing: (b: boolean) => void;
  saving: boolean;
  deleting: boolean;
  error: string | null;
  name: string; setName: (s: string) => void;
  phone: string; setPhone: (s: string) => void;
  whatsapp: string; setWhatsapp: (s: string) => void;
  email: string; setEmail: (s: string) => void;
  address: string; setAddress: (s: string) => void;
  onSave: () => void;
  onDelete: () => void;
}) {
  const fmtMoney = (n: number) => `RM${Number(n ?? 0).toLocaleString()}`;
  const fmtDate = (s: string | null) => s ? new Date(s).toLocaleDateString('en-MY', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

  const handleWA = () => {
    const phone = (p.client.whatsapp || p.client.phone).replace(/\D/g, '');
    if (!phone) return;
    const msg = `Hi ${p.client.name}! Just checking in.`;
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(msg)}`, '_blank');
  };

  return (
    <div className="p-6 space-y-6">
      {p.error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{p.error}</div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-2">
        <Stat label="Jobs" value={String(p.client.totalJobs)} />
        <Stat label="Spent" value={fmtMoney(p.client.totalSpent)} />
        <Stat label="Last job" value={fmtDate(p.client.lastJob)} />
      </div>

      {/* Action bar */}
      {!p.editing && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleWA}
            className="flex-1 px-4 py-2.5 bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-emerald-700"
          >
            WhatsApp
          </button>
          {p.client.email && (
            <a
              href={`mailto:${p.client.email}`}
              className="px-4 py-2.5 bg-white border border-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-stone-50"
            >
              Email
            </a>
          )}
          <button
            onClick={() => p.setEditing(true)}
            className="px-4 py-2.5 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-stone-700"
          >
            Edit
          </button>
        </div>
      )}

      {/* Customer fields */}
      <Section title="Contact">
        {p.editing ? (
          <div className="space-y-2">
            <Input label="Name *" value={p.name} onChange={p.setName} />
            <Input label="Phone *" value={p.phone} onChange={p.setPhone} />
            <Input label="WhatsApp" value={p.whatsapp} onChange={p.setWhatsapp} />
            <Input label="Email" value={p.email} onChange={p.setEmail} type="email" />
            <Input label="Address" value={p.address} onChange={p.setAddress} />
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => p.setEditing(false)}
                className="flex-1 px-3 py-2 bg-white border border-stone-200 text-stone-700 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={p.onSave}
                disabled={p.saving || !p.name.trim() || !p.phone.trim()}
                className="flex-1 px-3 py-2 bg-[#d4af37] text-black text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-[#d4af37]/90 disabled:opacity-40"
              >
                {p.saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        ) : (
          <>
            <Row label="Phone" value={p.client.phone || '—'} />
            {p.client.whatsapp && p.client.whatsapp !== p.client.phone && (
              <Row label="WhatsApp" value={p.client.whatsapp} />
            )}
            <Row label="Email" value={p.client.email ?? '—'} />
            <Row label="Address" value={p.client.address ?? '—'} />
          </>
        )}
      </Section>

      {/* Bookings list */}
      <Section title={`Bookings (${p.bookings.length})`}>
        {p.bookings.length === 0 ? (
          <p className="text-stone-400 text-sm">No studio bookings yet.</p>
        ) : (
          <div className="space-y-2">
            {p.bookings.map((b) => (
              <div key={b.id} className="p-3 bg-stone-50 border border-stone-100 rounded-lg">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-stone-900 text-sm font-medium">
                      {b.package_name || b.event_type}
                    </p>
                    <p className="text-stone-400 text-xs mt-0.5">
                      {fmtDate(b.event_date)} · {b.service_type} · {b.status}
                    </p>
                  </div>
                  <span className="text-stone-900 text-sm font-medium whitespace-nowrap">
                    {fmtMoney(b.total_amount)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Danger zone */}
      {!p.editing && (
        <div className="pt-4 border-t border-red-100">
          <button
            onClick={p.onDelete}
            disabled={p.deleting}
            className="w-full px-4 py-2.5 bg-white border border-red-200 text-red-700 text-xs font-bold uppercase tracking-wider rounded-lg hover:bg-red-50 disabled:opacity-40"
          >
            {p.deleting ? 'Deleting...' : 'Delete client'}
          </button>
        </div>
      )}
    </div>
  );
}

// ===== Primitives =====
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-stone-400 text-[10px] uppercase tracking-wider mb-3 pb-2 border-b border-stone-100">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-stone-400 text-xs">{label}</span>
      <span className="text-stone-900 text-sm font-medium text-right break-all">{value}</span>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-stone-50 border border-stone-100 rounded-lg p-3">
      <p className="text-stone-400 text-[10px] uppercase tracking-wider">{label}</p>
      <p className="text-stone-900 text-sm font-bold mt-0.5">{value}</p>
    </div>
  );
}

function Input({
  label, value, onChange, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="block text-stone-500 text-[11px] uppercase tracking-wider font-semibold mb-1">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:border-stone-400"
      />
    </label>
  );
}
