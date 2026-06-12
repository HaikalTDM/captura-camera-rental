import { supabase, getSupabaseAdmin } from '@/lib/supabase';

export type StudioServiceType = 'photo' | 'video' | 'combo';
export type StudioBookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface StudioBooking {
  id: string;
  customer_id: string;
  service_type: StudioServiceType;
  event_type: string;
  event_date: string;
  event_start_time: string;
  event_duration_hours: number;
  venue_name: string | null;
  venue_address: string;
  package_id: string | null;
  package_name: string | null;
  package_price: number;
  addons_total: number;
  total_amount: number;
  deposit_amount: number;
  deposit_paid: boolean;
  status: StudioBookingStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined customer data
  customer?: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
}

export interface StudioBookingListItem {
  id: string;
  client: string;
  phone: string;
  service: StudioServiceType;
  package: string;
  eventDate: string;
  status: StudioBookingStatus;
  amount: string;
  notes: string;
}

/**
 * Fetch all studio bookings (photo + video + combo) with optional filters.
 * Joins customer data for display.
 */
export async function fetchStudioBookings(opts?: {
  serviceType?: StudioServiceType | 'all';
  status?: StudioBookingStatus | 'all';
  search?: string;
  limit?: number;
}): Promise<StudioBookingListItem[]> {
  let query = supabase
    .from('photography_bookings')
    .select(`
      id,
      service_type,
      event_type,
      event_date,
      package_name,
      total_amount,
      status,
      special_requests,
      admin_notes,
      customer:customers!customer_id (
        id,
        name,
        phone
      )
    `)
    .order('event_date', { ascending: false });

  if (opts?.serviceType && opts.serviceType !== 'all') {
    query = query.eq('service_type', opts.serviceType);
  }
  if (opts?.status && opts.status !== 'all') {
    query = query.eq('status', opts.status);
  }
  if (opts?.limit) {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('fetchStudioBookings error:', error);
    return [];
  }

  let rows = (data ?? []) as any[];

  // Client-side search by name (Supabase doesn't easily filter on joined fields)
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    rows = rows.filter((r) =>
      r.customer?.name?.toLowerCase().includes(q) ||
      r.customer?.phone?.includes(q)
    );
  }

  return rows.map((r) => ({
    id: r.id,
    client: r.customer?.name ?? 'Unknown',
    phone: r.customer?.phone ?? '',
    service: r.service_type as StudioServiceType,
    package: r.package_name ?? r.event_type ?? '—',
    eventDate: r.event_date,
    status: r.status as StudioBookingStatus,
    amount: `RM${Number(r.total_amount ?? 0).toLocaleString()}`,
    notes: r.special_requests ?? r.admin_notes ?? '',
  }));
}

/**
 * Fetch a single booking by ID with full customer details.
 */
export async function fetchStudioBookingById(id: string): Promise<StudioBooking | null> {
  const { data, error } = await supabase
    .from('photography_bookings')
    .select(`
      *,
      customer:customers!customer_id (
        id,
        name,
        phone,
        email
      )
    `)
    .eq('id', id)
    .single();

  if (error) {
    console.error('fetchStudioBookingById error:', error);
    return null;
  }

  return data as unknown as StudioBooking;
}

/**
 * Dashboard stats for the Studio admin home page.
 */
export interface StudioDashboardStats {
  thisMonthCount: number;
  thisMonthRevenue: number;
  pendingCount: number;
  nextShoot: { date: string; client: string } | null;
}

export async function fetchStudioDashboardStats(): Promise<StudioDashboardStats> {
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
  const today = now.toISOString().split('T')[0];

  const [thisMonth, pending, upcoming] = await Promise.all([
    supabase
      .from('photography_bookings')
      .select('total_amount, status')
      .gte('event_date', monthStart)
      .lte('event_date', monthEnd),
    supabase
      .from('photography_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending'),
    supabase
      .from('photography_bookings')
      .select(`
        event_date,
        customer:customers!customer_id ( name )
      `)
      .gte('event_date', today)
      .eq('status', 'confirmed')
      .order('event_date', { ascending: true })
      .limit(1),
  ]);

  const monthRows = (thisMonth.data ?? []) as any[];
  const revenue = monthRows
    .filter((r) => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + Number(r.total_amount ?? 0), 0);

  const next = (upcoming.data ?? [])[0] as any;

  return {
    thisMonthCount: monthRows.length,
    thisMonthRevenue: revenue,
    pendingCount: pending.count ?? 0,
    nextShoot: next
      ? { date: next.event_date, client: next.customer?.name ?? 'Unknown' }
      : null,
  };
}

/**
 * Recent bookings for the dashboard (latest 5, any status).
 */
export async function fetchRecentStudioBookings(limit = 5): Promise<StudioBookingListItem[]> {
  return fetchStudioBookings({ limit });
}

/**
 * Calendar view: bookings within a month range, keyed by date.
 */
export async function fetchStudioCalendarMonth(year: number, month: number): Promise<
  Record<string, { client: string; service: string }>
> {
  const m = String(month + 1).padStart(2, '0');
  const start = `${year}-${m}-01`;
  const lastDay = new Date(year, month + 1, 0).getDate();
  const end = `${year}-${m}-${String(lastDay).padStart(2, '0')}`;

  const { data, error } = await supabase
    .from('photography_bookings')
    .select(`
      event_date,
      service_type,
      package_name,
      customer:customers!customer_id ( name )
    `)
    .gte('event_date', start)
    .lte('event_date', end)
    .neq('status', 'cancelled');

  if (error) {
    console.error('fetchStudioCalendarMonth error:', error);
    return {};
  }

  const result: Record<string, { client: string; service: string }> = {};
  for (const row of (data ?? []) as any[]) {
    result[row.event_date] = {
      client: row.customer?.name ?? 'Unknown',
      service: row.package_name ?? row.service_type ?? '—',
    };
  }
  return result;
}
