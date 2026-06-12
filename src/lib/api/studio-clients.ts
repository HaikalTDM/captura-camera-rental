import { supabase, getSupabaseAdmin } from '@/lib/supabase';

export interface StudioClient {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  whatsapp: string | null;
  address: string | null;
  totalJobs: number;
  totalSpent: number;
  lastJob: string | null; // ISO date or null
  services: Array<'photo' | 'video' | 'combo'>;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch customers who have at least one studio (photography_bookings) record,
 * with aggregated job count, total spent, and last job date.
 */
export async function fetchStudioClients(opts?: {
  search?: string;
  limit?: number;
}): Promise<StudioClient[]> {
  // 1. Pull all studio bookings with their customer joined
  const { data, error } = await supabase
    .from('photography_bookings')
    .select(`
      service_type,
      event_date,
      total_amount,
      status,
      customer:customers!customer_id (
        id,
        full_name,
        name,
        phone,
        whatsapp,
        email,
        address,
        created_at,
        updated_at
      )
    `);

  if (error) {
    console.error('fetchStudioClients error:', error);
    return [];
  }

  // 2. Aggregate by customer id
  const byId = new Map<string, StudioClient>();
  for (const row of (data ?? []) as any[]) {
    const c = row.customer;
    if (!c?.id) continue;
    const existing = byId.get(c.id);
    const amount = Number(row.total_amount ?? 0);
    const eventDate: string | null = row.event_date ?? null;
    const svc = row.service_type as 'photo' | 'video' | 'combo';

    if (existing) {
      existing.totalJobs += 1;
      // Only count revenue from confirmed/completed
      if (row.status === 'confirmed' || row.status === 'completed') {
        existing.totalSpent += amount;
      }
      if (eventDate && (!existing.lastJob || eventDate > existing.lastJob)) {
        existing.lastJob = eventDate;
      }
      if (svc && !existing.services.includes(svc)) {
        existing.services.push(svc);
      }
    } else {
      byId.set(c.id, {
        id: c.id,
        name: c.full_name || c.name || 'Unnamed',
        phone: c.phone || c.whatsapp || '',
        email: c.email || null,
        whatsapp: c.whatsapp || null,
        address: c.address || null,
        totalJobs: 1,
        totalSpent: row.status === 'confirmed' || row.status === 'completed' ? amount : 0,
        lastJob: eventDate,
        services: svc ? [svc] : [],
        createdAt: c.created_at,
        updatedAt: c.updated_at,
      });
    }
  }

  let clients = Array.from(byId.values());

  // 3. Client-side filter
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    clients = clients.filter((c) =>
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      (c.email?.toLowerCase().includes(q) ?? false)
    );
  }

  // 4. Sort by lastJob desc, then name
  clients.sort((a, b) => {
    if (a.lastJob && b.lastJob) return b.lastJob.localeCompare(a.lastJob);
    if (a.lastJob) return -1;
    if (b.lastJob) return 1;
    return a.name.localeCompare(b.name);
  });

  if (opts?.limit) clients = clients.slice(0, opts.limit);
  return clients;
}

/**
 * Fetch a single client with all their studio bookings.
 */
export async function fetchStudioClientById(id: string): Promise<{
  client: StudioClient;
  bookings: Array<{
    id: string;
    service_type: string;
    event_type: string;
    event_date: string;
    package_name: string | null;
    total_amount: number;
    status: string;
  }>;
} | null> {
  const [customerRes, bookingsRes] = await Promise.all([
    supabase
      .from('customers')
      .select('id, full_name, name, phone, whatsapp, email, address, created_at, updated_at')
      .eq('id', id)
      .single(),
    supabase
      .from('photography_bookings')
      .select('id, service_type, event_type, event_date, package_name, total_amount, status')
      .eq('customer_id', id)
      .order('event_date', { ascending: false }),
  ]);

  if (customerRes.error || !customerRes.data) {
    console.error('fetchStudioClientById error:', customerRes.error);
    return null;
  }

  const c: any = customerRes.data;
  const rows = (bookingsRes.data ?? []) as any[];

  const totalSpent = rows
    .filter((r) => r.status === 'confirmed' || r.status === 'completed')
    .reduce((sum, r) => sum + Number(r.total_amount ?? 0), 0);

  const services = Array.from(new Set(rows.map((r) => r.service_type))) as Array<'photo' | 'video' | 'combo'>;

  return {
    client: {
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
    },
    bookings: rows,
  };
}
