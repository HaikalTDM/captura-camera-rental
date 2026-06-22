import { getSupabaseAdmin, logQueryError } from '../supabase/client.js';
function getRowKey(row) {
    return String(row.setting_key ?? row.key ?? '');
}
function getRowValue(row) {
    return String(row.setting_value ?? row.value ?? '');
}
export async function getSettings(settingKey) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase.from('business_settings').select('*');
    if (error) {
        logQueryError('admin.getSettings', error);
        throw new Error('Failed to fetch settings');
    }
    const rows = (data || []);
    const filtered = settingKey
        ? rows.filter((r) => getRowKey(r) === settingKey)
        : rows;
    return filtered.map((r) => ({
        id: String(r.id ?? ''),
        setting_key: getRowKey(r),
        setting_value: getRowValue(r),
        description: r.description ?? null,
        created_at: String(r.created_at ?? ''),
        updated_at: String(r.updated_at ?? ''),
    }));
}
export async function updateSetting(settingKey, settingValue, _description) {
    const supabase = getSupabaseAdmin();
    const now = new Date().toISOString();
    // First, get the existing row to find its id
    const { data: existing, error: fetchError } = await supabase
        .from('business_settings')
        .select('id')
        .limit(1)
        .single();
    if (fetchError || !existing) {
        logQueryError('admin.updateSetting', fetchError ?? new Error('No settings row found'));
        throw new Error('Failed to update setting');
    }
    // Update the specific column directly
    const { data, error } = await supabase
        .from('business_settings')
        .update({ [settingKey]: settingValue, updated_at: now })
        .eq('id', existing.id)
        .select()
        .single();
    if (error) {
        logQueryError('admin.updateSetting', error);
        throw new Error('Failed to update setting');
    }
    const row = data;
    return {
        id: String(row.id ?? ''),
        setting_key: settingKey,
        setting_value: String(row[settingKey] ?? settingValue),
        description: row.description ?? null,
        created_at: String(row.created_at ?? ''),
        updated_at: String(row.updated_at ?? ''),
    };
}
export async function getDashboardSummary(period) {
    const supabase = getSupabaseAdmin();
    const now = new Date();
    let dateFrom;
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
    // Revenue this period — match website: fully paid bookings by final_payment_paid_date
    const { data: revenueData, error: revenueError } = await supabase
        .from('bookings')
        .select('total_amount, deposit_amount, final_payment_amount')
        .eq('deposit_paid', true)
        .eq('final_payment_paid', true)
        .gte('final_payment_paid_date', dateFrom);
    if (revenueError) {
        logQueryError('admin.dashboard.revenue', revenueError);
    }
    const totalRevenue = (revenueData || []).reduce((sum, b) => {
        const depAmt = Number(b.deposit_amount || 0);
        if (depAmt === 100)
            return sum + Number(b.final_payment_amount || 0);
        return sum + Number(b.total_amount || 0) - depAmt;
    }, 0);
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
export async function getRevenueReport(startDate, endDate, groupBy) {
    const supabase = getSupabaseAdmin();
    // Match website dashboard: only fully paid bookings, grouped by final_payment_paid_date
    const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
      id,
      total_amount,
      deposit_amount,
      final_payment_amount,
      final_payment_paid_date,
      start_date,
      camera_id,
      booking_status
    `)
        .eq('deposit_paid', true)
        .eq('final_payment_paid', true)
        .gte('final_payment_paid_date', startDate)
        .lte('final_payment_paid_date', endDate);
    if (error) {
        logQueryError('admin.revenueReport', error);
        throw new Error('Failed to generate revenue report');
    }
    // Fetch all camera names in one query
    const cameraIds = [...new Set((bookings || []).map(b => b.camera_id).filter(Boolean))];
    const cameraMap = new Map();
    if (cameraIds.length > 0) {
        const { data: cameras } = await supabase
            .from('cameras')
            .select('id, name')
            .in('id', cameraIds);
        for (const c of (cameras || [])) {
            cameraMap.set(c.id, c.name);
        }
    }
    // Website revenue formula: deposit_amount===100 ? final_payment_amount : total_amount - deposit_amount
    function getRevenue(b) {
        const depAmt = Number(b.deposit_amount || 0);
        if (depAmt === 100) {
            return Number(b.final_payment_amount || 0);
        }
        return Number(b.total_amount || 0) - depAmt;
    }
    const grouped = {};
    for (const booking of bookings || []) {
        let key;
        switch (groupBy) {
            case 'camera':
                key = cameraMap.get(booking.camera_id) || 'Unknown';
                break;
            case 'month':
            default:
                // Group by final_payment_paid_date month
                key = (booking.final_payment_paid_date || '').substring(0, 7);
                break;
        }
        if (!grouped[key]) {
            grouped[key] = { count: 0, revenue: 0 };
        }
        grouped[key].count++;
        grouped[key].revenue += getRevenue(booking);
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
//# sourceMappingURL=admin.tools.js.map