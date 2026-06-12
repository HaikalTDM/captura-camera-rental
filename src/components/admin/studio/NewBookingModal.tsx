'use client';

import { useState, useEffect, useRef } from 'react';

export type ServiceType = 'photo' | 'video' | 'combo';
export type EventType = 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event';

interface CustomerLite {
  id: string;
  name: string;
  phone: string;
  email: string | null;
}

interface NewBookingModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (bookingId: string) => void;
}

export default function NewBookingModal({ open, onClose, onCreated }: NewBookingModalProps) {
  // Customer state
  const [customerMode, setCustomerMode] = useState<'search' | 'new'>('search');
  const [customerQuery, setCustomerQuery] = useState('');
  const [searchResults, setSearchResults] = useState<CustomerLite[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerLite | null>(null);
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustEmail, setNewCustEmail] = useState('');

  // Event state
  const [serviceType, setServiceType] = useState<ServiceType>('photo');
  const [eventType, setEventType] = useState<EventType>('wedding');
  const [eventDate, setEventDate] = useState('');
  const [eventStartTime, setEventStartTime] = useState('09:00');
  const [eventDurationHours, setEventDurationHours] = useState(4);
  const [venueName, setVenueName] = useState('');
  const [venueAddress, setVenueAddress] = useState('');

  // Package & pricing
  const [packageName, setPackageName] = useState('');
  const [packagePrice, setPackagePrice] = useState<number | ''>('');
  const [addonsTotal, setAddonsTotal] = useState<number | ''>(0);
  const [depositAmount, setDepositAmount] = useState<number | ''>('');
  const [depositPaid, setDepositPaid] = useState(false);

  // Meta
  const [bookingSource, setBookingSource] = useState<'website' | 'whatsapp' | 'phone' | 'referral' | 'walk-in'>('whatsapp');
  const [adminNotes, setAdminNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchDebounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset on close
  useEffect(() => {
    if (!open) {
      setCustomerMode('search');
      setCustomerQuery('');
      setSearchResults([]);
      setSelectedCustomer(null);
      setNewCustName('');
      setNewCustPhone('');
      setNewCustEmail('');
      setServiceType('photo');
      setEventType('wedding');
      setEventDate('');
      setEventStartTime('09:00');
      setEventDurationHours(4);
      setVenueName('');
      setVenueAddress('');
      setPackageName('');
      setPackagePrice('');
      setAddonsTotal(0);
      setDepositAmount('');
      setDepositPaid(false);
      setBookingSource('whatsapp');
      setAdminNotes('');
      setError(null);
      setSubmitting(false);
    }
  }, [open]);

  // Debounced search
  useEffect(() => {
    if (customerMode !== 'search') return;
    if (searchDebounce.current) clearTimeout(searchDebounce.current);
    if (!customerQuery || customerQuery.length < 2) {
      setSearchResults([]);
      return;
    }
    setSearching(true);
    searchDebounce.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/studio/customers/search?q=${encodeURIComponent(customerQuery)}`);
        const json = await res.json();
        setSearchResults(json.customers ?? []);
      } catch {
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);
    return () => {
      if (searchDebounce.current) clearTimeout(searchDebounce.current);
    };
  }, [customerQuery, customerMode]);

  const totalAmount =
    (typeof packagePrice === 'number' ? packagePrice : 0) +
    (typeof addonsTotal === 'number' ? addonsTotal : 0);

  const computedDeposit =
    typeof depositAmount === 'number' && depositAmount >= 0
      ? depositAmount
      : Math.round(totalAmount * 0.5 * 100) / 100;

  const canSubmit =
    !submitting &&
    eventDate &&
    venueAddress.trim() &&
    typeof packagePrice === 'number' &&
    packagePrice > 0 &&
    ((customerMode === 'search' && selectedCustomer) ||
      (customerMode === 'new' && newCustName.trim() && newCustPhone.trim()));

  const handleSubmit = async () => {
    setError(null);
    setSubmitting(true);

    const payload: Record<string, any> = {
      service_type: serviceType,
      event_type: eventType,
      event_date: eventDate,
      event_start_time: eventStartTime,
      event_duration_hours: eventDurationHours,
      venue_name: venueName || null,
      venue_address: venueAddress,
      package_name: packageName || null,
      package_price: typeof packagePrice === 'number' ? packagePrice : 0,
      addons_total: typeof addonsTotal === 'number' ? addonsTotal : 0,
      total_amount: totalAmount,
      deposit_amount: computedDeposit,
      deposit_paid: depositPaid,
      booking_source: bookingSource,
      admin_notes: adminNotes || null,
      status: 'pending',
    };

    if (customerMode === 'search' && selectedCustomer) {
      payload.customer_id = selectedCustomer.id;
    } else {
      payload.customer_name = newCustName.trim();
      payload.customer_phone = newCustPhone.trim();
      if (newCustEmail.trim()) payload.customer_email = newCustEmail.trim();
    }

    try {
      const res = await fetch('/api/studio/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to create booking');
        setSubmitting(false);
        return;
      }
      onCreated(json.booking.id);
    } catch (e: any) {
      setError(e?.message || 'Network error');
      setSubmitting(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div
        className="relative ml-auto w-full max-w-2xl h-full bg-white shadow-2xl overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <ModalHeader onClose={onClose} />
        <div className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <CustomerSection
            mode={customerMode}
            setMode={setCustomerMode}
            query={customerQuery}
            setQuery={setCustomerQuery}
            results={searchResults}
            searching={searching}
            selected={selectedCustomer}
            setSelected={setSelectedCustomer}
            newCustName={newCustName}
            setNewCustName={setNewCustName}
            newCustPhone={newCustPhone}
            setNewCustPhone={setNewCustPhone}
            newCustEmail={newCustEmail}
            setNewCustEmail={setNewCustEmail}
          />

          <EventSection
            serviceType={serviceType}
            setServiceType={setServiceType}
            eventType={eventType}
            setEventType={setEventType}
            eventDate={eventDate}
            setEventDate={setEventDate}
            eventStartTime={eventStartTime}
            setEventStartTime={setEventStartTime}
            eventDurationHours={eventDurationHours}
            setEventDurationHours={setEventDurationHours}
            venueName={venueName}
            setVenueName={setVenueName}
            venueAddress={venueAddress}
            setVenueAddress={setVenueAddress}
          />

          <PricingSection
            packageName={packageName}
            setPackageName={setPackageName}
            packagePrice={packagePrice}
            setPackagePrice={setPackagePrice}
            addonsTotal={addonsTotal}
            setAddonsTotal={setAddonsTotal}
            totalAmount={totalAmount}
            depositAmount={depositAmount}
            setDepositAmount={setDepositAmount}
            computedDeposit={computedDeposit}
            depositPaid={depositPaid}
            setDepositPaid={setDepositPaid}
          />

          <MetaSection
            bookingSource={bookingSource}
            setBookingSource={setBookingSource}
            adminNotes={adminNotes}
            setAdminNotes={setAdminNotes}
          />

          <div className="flex gap-3 pt-2">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2.5 bg-white border border-stone-200 text-stone-700 text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="flex-1 px-4 py-2.5 bg-[#d4af37] text-black text-sm font-bold uppercase tracking-wider rounded-lg hover:bg-[#d4af37]/90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Creating...' : 'Create Booking'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModalHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="sticky top-0 bg-white border-b border-stone-200 px-6 py-4 flex items-center justify-between z-10">
      <div>
        <p className="text-stone-400 text-[10px] uppercase tracking-wider">Studio</p>
        <h2 className="text-lg font-bold text-stone-900">New Booking</h2>
      </div>
      <button onClick={onClose} className="text-stone-400 hover:text-stone-700 p-1">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

function CustomerSection(p: {
  mode: 'search' | 'new';
  setMode: (m: 'search' | 'new') => void;
  query: string;
  setQuery: (s: string) => void;
  results: CustomerLite[];
  searching: boolean;
  selected: CustomerLite | null;
  setSelected: (c: CustomerLite | null) => void;
  newCustName: string;
  setNewCustName: (s: string) => void;
  newCustPhone: string;
  setNewCustPhone: (s: string) => void;
  newCustEmail: string;
  setNewCustEmail: (s: string) => void;
}) {
  return (
    <Section title="Customer">
      <div className="flex gap-2 mb-3">
        <TabBtn active={p.mode === 'search'} onClick={() => p.setMode('search')}>Search existing</TabBtn>
        <TabBtn active={p.mode === 'new'} onClick={() => { p.setMode('new'); p.setSelected(null); }}>New customer</TabBtn>
      </div>

      {p.mode === 'search' ? (
        <div>
          {p.selected ? (
            <div className="flex items-center justify-between p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
              <div>
                <p className="text-stone-900 text-sm font-semibold">{p.selected.name}</p>
                <p className="text-stone-500 text-xs">{p.selected.phone}{p.selected.email ? ` · ${p.selected.email}` : ''}</p>
              </div>
              <button
                onClick={() => p.setSelected(null)}
                className="text-stone-400 hover:text-stone-700 text-xs uppercase tracking-wider font-bold"
              >Change</button>
            </div>
          ) : (
            <>
              <input
                type="text"
                placeholder="Name, phone or email..."
                value={p.query}
                onChange={(e) => p.setQuery(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
              />
              {p.searching && <p className="text-stone-400 text-xs mt-2">Searching...</p>}
              {!p.searching && p.query.length >= 2 && p.results.length === 0 && (
                <p className="text-stone-400 text-xs mt-2">No matches. Try the &quot;New customer&quot; tab.</p>
              )}
              {p.results.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100">
                  {p.results.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => p.setSelected(c)}
                      className="w-full text-left px-3 py-2 hover:bg-stone-50 transition-colors"
                    >
                      <p className="text-stone-900 text-sm font-medium">{c.name}</p>
                      <p className="text-stone-400 text-xs">{c.phone}{c.email ? ` · ${c.email}` : ''}</p>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          <Input label="Full name *" value={p.newCustName} onChange={p.setNewCustName} placeholder="Jane Doe" />
          <Input label="Phone *" value={p.newCustPhone} onChange={p.setNewCustPhone} placeholder="60123456789" />
          <Input label="Email" value={p.newCustEmail} onChange={p.setNewCustEmail} placeholder="jane@example.com" type="email" />
        </div>
      )}
    </Section>
  );
}

function EventSection(p: {
  serviceType: ServiceType;
  setServiceType: (s: ServiceType) => void;
  eventType: EventType;
  setEventType: (s: EventType) => void;
  eventDate: string;
  setEventDate: (s: string) => void;
  eventStartTime: string;
  setEventStartTime: (s: string) => void;
  eventDurationHours: number;
  setEventDurationHours: (n: number) => void;
  venueName: string;
  setVenueName: (s: string) => void;
  venueAddress: string;
  setVenueAddress: (s: string) => void;
}) {
  return (
    <Section title="Event Details">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Service *">
          <select
            value={p.serviceType}
            onChange={(e) => p.setServiceType(e.target.value as ServiceType)}
            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:border-stone-400"
          >
            <option value="photo">Photography</option>
            <option value="video">Videography</option>
            <option value="combo">Photo + Video</option>
          </select>
        </Field>
        <Field label="Event type *">
          <select
            value={p.eventType}
            onChange={(e) => p.setEventType(e.target.value as EventType)}
            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:border-stone-400"
          >
            <option value="wedding">Wedding</option>
            <option value="corporate">Corporate</option>
            <option value="graduation">Graduation</option>
            <option value="portrait">Portrait</option>
            <option value="event">Event</option>
          </select>
        </Field>
        <Field label="Date *">
          <input
            type="date"
            value={p.eventDate}
            onChange={(e) => p.setEventDate(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:border-stone-400"
          />
        </Field>
        <Field label="Start time">
          <input
            type="time"
            value={p.eventStartTime}
            onChange={(e) => p.setEventStartTime(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:border-stone-400"
          />
        </Field>
        <Field label="Duration (hours)">
          <input
            type="number"
            min={1}
            max={24}
            value={p.eventDurationHours}
            onChange={(e) => p.setEventDurationHours(Number(e.target.value) || 0)}
            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:border-stone-400"
          />
        </Field>
      </div>
      <div className="space-y-2 mt-3">
        <Input label="Venue name" value={p.venueName} onChange={p.setVenueName} placeholder="e.g. Grand Hyatt KL" />
        <Field label="Venue address *">
          <textarea
            value={p.venueAddress}
            onChange={(e) => p.setVenueAddress(e.target.value)}
            rows={2}
            placeholder="Full address"
            className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:border-stone-400 resize-none"
          />
        </Field>
      </div>
    </Section>
  );
}

function PricingSection(p: {
  packageName: string;
  setPackageName: (s: string) => void;
  packagePrice: number | '';
  setPackagePrice: (n: number | '') => void;
  addonsTotal: number | '';
  setAddonsTotal: (n: number | '') => void;
  totalAmount: number;
  depositAmount: number | '';
  setDepositAmount: (n: number | '') => void;
  computedDeposit: number;
  depositPaid: boolean;
  setDepositPaid: (b: boolean) => void;
}) {
  return (
    <Section title="Package & Pricing">
      <Input label="Package name" value={p.packageName} onChange={p.setPackageName} placeholder="e.g. Wedding Premium" />
      <div className="grid grid-cols-2 gap-3 mt-2">
        <NumField label="Package price (RM) *" value={p.packagePrice} onChange={p.setPackagePrice} />
        <NumField label="Add-ons total (RM)" value={p.addonsTotal} onChange={p.setAddonsTotal} />
      </div>
      <div className="mt-3 p-3 bg-stone-50 border border-stone-200 rounded-lg flex items-center justify-between">
        <span className="text-stone-500 text-xs uppercase tracking-wider">Total</span>
        <span className="text-stone-900 text-lg font-bold">RM{p.totalAmount.toLocaleString()}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 mt-3">
        <NumField
          label={`Deposit (default ${p.computedDeposit.toLocaleString()})`}
          value={p.depositAmount}
          onChange={p.setDepositAmount}
          placeholder={String(p.computedDeposit)}
        />
        <Field label="Deposit paid?">
          <button
            type="button"
            onClick={() => p.setDepositPaid(!p.depositPaid)}
            className={`w-full px-3 py-2 rounded-lg text-sm font-bold uppercase tracking-wider border transition-all ${
              p.depositPaid
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
            }`}
          >
            {p.depositPaid ? 'Paid' : 'Not paid'}
          </button>
        </Field>
      </div>
    </Section>
  );
}

function MetaSection(p: {
  bookingSource: 'website' | 'whatsapp' | 'phone' | 'referral' | 'walk-in';
  setBookingSource: (s: 'website' | 'whatsapp' | 'phone' | 'referral' | 'walk-in') => void;
  adminNotes: string;
  setAdminNotes: (s: string) => void;
}) {
  return (
    <Section title="Meta">
      <Field label="Source">
        <select
          value={p.bookingSource}
          onChange={(e) => p.setBookingSource(e.target.value as any)}
          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:border-stone-400"
        >
          <option value="walk-in">Walk-in</option>
          <option value="whatsapp">WhatsApp</option>
          <option value="phone">Phone</option>
          <option value="referral">Referral</option>
          <option value="website">Website</option>
        </select>
      </Field>
      <Field label="Admin notes">
        <textarea
          value={p.adminNotes}
          onChange={(e) => p.setAdminNotes(e.target.value)}
          rows={3}
          placeholder="Internal notes (visible only to admins)"
          className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 focus:outline-none focus:border-stone-400 resize-none"
        />
      </Field>
    </Section>
  );
}

// ===== Shared primitives =====
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-stone-400 text-[10px] uppercase tracking-wider mb-3 pb-2 border-b border-stone-100">{title}</p>
      <div>{children}</div>
    </div>
  );
}

function TabBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex-1 px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg border transition-all ${
        active
          ? 'bg-stone-900 text-white border-stone-900'
          : 'bg-white text-stone-500 border-stone-200 hover:border-stone-400'
      }`}
    >
      {children}
    </button>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-stone-500 text-[11px] uppercase tracking-wider font-semibold mb-1">{label}</span>
      {children}
    </label>
  );
}

function Input({
  label, value, onChange, placeholder, type = 'text',
}: {
  label: string;
  value: string;
  onChange: (s: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <Field label={label}>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
      />
    </Field>
  );
}

function NumField({
  label, value, onChange, placeholder,
}: {
  label: string;
  value: number | '';
  onChange: (n: number | '') => void;
  placeholder?: string;
}) {
  return (
    <Field label={label}>
      <input
        type="number"
        min={0}
        step="0.01"
        value={value === '' ? '' : value}
        onChange={(e) => {
          const v = e.target.value;
          onChange(v === '' ? '' : Number(v));
        }}
        placeholder={placeholder}
        className="w-full px-3 py-2 bg-white border border-stone-200 rounded-lg text-sm text-stone-900 placeholder-stone-400 focus:outline-none focus:border-stone-400"
      />
    </Field>
  );
}
