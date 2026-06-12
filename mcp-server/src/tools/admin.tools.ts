import { getSupabaseAdmin, logQueryError } from '../supabase/client.js';
import type { BusinessSettings } from '../supabase/types.js';

type SettingsRow = Record<string, unknown> & {
  setting_key?: string | null;
  setting_value?: string | null;
  key?: string | null;
  value?: string | null;
};

function getRowKey(row: SettingsRow): string {
  return String(row.setting_key ?? row.key ?? '');
}

function getRowValue(row: SettingsRow): string {
  return String(row.setting_value ?? row.value ?? '');
}

export async function getSettings(settingKey?: string): Promise<BusinessSettings[]> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase.from('business_settings').select('*');

  if (error) {
    logQueryError('admin.getSettings', error);
    throw new Error('Failed to fetch settings');
  }

  const rows = (data || []) as SettingsRow[];

  const filtered = settingKey
    ? rows.filter((r) => getRowKey(r) === settingKey)
    : rows;

  return filtered.map((r) => ({
    id: String(r.id ?? ''),
    setting_key: getRowKey(r),
    setting_value: getRowValue(r),
    description: (r.description as string | null) ?? null,
    created_at: String(r.created_at ?? ''),
    updated_at: String(r.updated_at ?? ''),
  }));
}

export async function updateSetting(
  settingKey: string,
  settingValue: string,
  _description?: string
): Promise<BusinessSettings> {
  const supabase = getSupabaseAdmin();
  const now = new Date().toISOString();

  const attempts: [Record<string, string>, string][] = [
    [{ setting_key: settingKey, setting_value: settingValue, updated_at: now }, 'setting_key'],
    [{ key: settingKey, value: settingValue, updated_at: now }, 'key'],
  ];

  let lastError: { code?: string | null; message?: string } | null = null;

  for (const [payload, onConflict] of attempts) {
    const { data, error } = await supabase
      .from('business_settings')
      .upsert(payload, { onConflict })
      .select()
      .single();

    if (!error) {
      const row = data as SettingsRow;
      return {
        id: String(row.id ?? ''),
        setting_key: getRowKey(row),
        setting_value: getRowValue(row),
        description: (row.description as string | null) ?? null,
        created_at: String(row.created_at ?? ''),
        updated_at: String(row.updated_at ?? ''),
      };
    }

    lastError = error;
    if (error.code !== '42703') {
      break;
    }
  }

  logQueryError('admin.updateSetting', lastError ?? new Error('Unknown error'));
  throw new Error('Failed to update setting');
}

export async function getDashboardSummary(period: string): Promise<Record<string, unknown>> {
  const supabase = getSupabaseAdmin();

  const now = new Date();
  let dateFrom: string;

  switch (period) {
    case 'today':
      dateFrom = now.toISOString().split('T')[0];
      break;
    case 'week':
      dateFrom = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      break;
    case 'month':
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      break;
    case 'year':
      dateFrom = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
      break;
    default:
      dateFrom = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
  }

  // Active bookings count
  const { count: activeBookings, error: activeError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('booking_status', 'confirmed');

  if (activeError) {
    logQueryError('admin.dashboard.active', activeError);
  }

  // Pending bookings
  const { count: pendingBookings, error: pendingError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .eq('booking_status', 'pending_approval');

  if (pendingError) {
    logQueryError('admin.dashboard.pending', pendingError);
  }

  // New bookings this period
  const { count: newBookings, error: newError } = await supabase
    .from('bookings')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', dateFrom);

  if (newError) {
    logQueryError('admin.dashboard.new', newError);
  }

  // Revenue this period
  const { data: revenueData, error: revenueError } = await supabase
    .from('bookings')
    .select('total_amount')
    .gte('created_at', dateFrom)
    .not('booking_status', 'in', '("cancelled","rejected")');

  if (revenueError) {
    logQueryError('admin.dashboard.revenue', revenueError);
  }

  const totalRevenue = (revenueData || []).reduce((sum, b) => sum + Number(b.total_amount || 0), 0);

  // Available cameras
  const { count: availableCameras, error: camerasError } = await supabase
    .from('cameras')
    .select('id', { count: 'exact', head: true })
    .eq('is_available', true);

  if (camerasError) {
    logQueryError('admin.dashboard.cameras', camerasError);
  }

  // Customers count this period
  const { count: customersCount, error: customersError } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', dateFrom);

  if (customersError) {
    logQueryError('admin.dashboard.customers', customersError);
  }

  return {
    period,
    date_from: dateFrom,
    metrics: {
      active_bookings: activeBookings || 0,
      pending_approvals: pendingBookings || 0,
      new_bookings: newBookings || 0,
      total_revenue_rm: totalRevenue,
      available_cameras: availableCameras || 0,
      new_customers: customersCount || 0,
    },
  };
}

export async function getRevenueReport(
  startDate: string,
  endDate: string,
  groupBy: string
): Promise<Record<string, unknown>> {
  const supabase = getSupabaseAdmin();

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      total_amount,
      start_date,
      camera_id,
      booking_status
    `)
    .gte('created_at', startDate)
    .lte('created_at', endDate)
    .not('booking_status', 'in', '("cancelled","rejected")');

  if (error) {
    logQueryError('admin.revenueReport', error);
    throw new Error('Failed to generate revenue report');
  }

  // Fetch all camera names in one query
  const cameraIds = [...new Set((bookings || []).map(b => b.camera_id).filter(Boolean))];
  const cameraMap = new Map<string, string>();
  if (cameraIds.length > 0) {
    const { data: cameras } = await supabase
      .from('cameras')
      .select('id, name')
      .in('id', cameraIds);
    for (const c of (cameras || [])) {
      cameraMap.set(c.id, c.name);
    }
  }

  const grouped: Record<string, { count: number; revenue: number }> = {};

  for (const booking of bookings || []) {
    let key: string;
    switch (groupBy) {
      case 'camera':
        key = cameraMap.get(booking.camera_id as string) || 'Unknown';
        break;
      case 'month':
        key = (booking.start_date as string).substring(0, 7);
        break;
      default:
        key = (booking.start_date as string).substring(0, 7);
    }

    if (!grouped[key]) {
      grouped[key] = { count: 0, revenue: 0 };
    }
    grouped[key].count++;
    grouped[key].revenue += Number(booking.total_amount || 0);
  }

  const breakdown = Object.entries(grouped).map(([key, value]) => ({
    label: key,
    bookings: value.count,
    revenue_rm: Math.round(value.revenue * 100) / 100,
  }));

  const totalRevenue = breakdown.reduce((sum, item) => sum + item.revenue_rm, 0);

  return {
    period: { start_date: startDate, end_date: endDate },
    group_by: groupBy,
    total_revenue_rm: Math.round(totalRevenue * 100) / 100,
    total_bookings: breakdown.reduce((sum, item) => sum + item.bookings, 0),
    breakdown,
  };
}
