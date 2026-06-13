import { getSupabaseAdmin, logQueryError } from '../supabase/client.js';
import { NotFoundError } from '../errors/handler.js';
export async function listCameras(filter, sortBy) {
    const supabase = getSupabaseAdmin();
    // Lean text-only column set for list views. Excludes image_url (base64 data
    // URIs) and specifications (large JSON) which previously bloated the payload
    // to ~270KB and broke the bot's stdio reader. Use cameras.get for full detail.
    const LIST_COLUMNS = [
        'id', 'name', 'brand', 'model', 'type',
        'daily_rate', 'weekly_rate', 'monthly_rate', 'deposit_amount',
        'discount_threshold', 'description', 'is_available',
        'total_quantity', 'available_quantity', 'display_order',
        'condition', 'location', 'status',
    ].join(', ');
    let query = supabase.from('cameras').select(LIST_COLUMNS);
    if (filter === 'available_only') {
        query = query.eq('is_available', true);
    }
    const orderColumn = sortBy === 'name' ? 'name' : sortBy;
    query = query.order(orderColumn, { ascending: true });
    const { data, error } = await query;
    if (error) {
        logQueryError('cameras.list', error);
        throw new Error('Failed to fetch cameras');
    }
    return data;
}
export async function getCamera(cameraId) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from('cameras')
        .select('*')
        .eq('id', cameraId)
        .single();
    if (error) {
        if (error.code === 'PGRST116') {
            throw new NotFoundError('Camera', cameraId);
        }
        logQueryError('cameras.get', error);
        throw new Error('Failed to fetch camera');
    }
    return data;
}
export async function checkAvailability(cameraId, startDate, endDate) {
    const supabase = getSupabaseAdmin();
    // Verify camera exists and is available
    const { data: camera, error: cameraError } = await supabase
        .from('cameras')
        .select('id, is_available, available_quantity')
        .eq('id', cameraId)
        .single();
    if (cameraError) {
        if (cameraError.code === 'PGRST116') {
            throw new NotFoundError('Camera', cameraId);
        }
        logQueryError('cameras.checkAvailability', cameraError);
        throw new Error('Failed to check camera');
    }
    if (!camera.is_available) {
        return { available: false, conflictingBookings: [] };
    }
    const { data: conflicts, error: conflictError } = await supabase
        .from('bookings')
        .select('id, start_date, end_date')
        .eq('camera_id', cameraId)
        .not('booking_status', 'in', '("cancelled","rejected")')
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`)
        .not('end_date', 'lt', startDate)
        .not('start_date', 'gt', endDate);
    if (conflictError) {
        logQueryError('cameras.checkAvailability.conflicts', conflictError);
        throw new Error('Failed to check availability');
    }
    return {
        available: (conflicts?.length || 0) < camera.available_quantity,
        conflictingBookings: conflicts || [],
    };
}
export async function createCamera(fields) {
    const supabase = getSupabaseAdmin();
    const payload = {
        ...fields,
        purchase_date: fields.purchase_date || new Date().toISOString().split('T')[0],
        total_quantity: fields.total_quantity ?? 1,
        available_quantity: fields.available_quantity ?? 1,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
        .from('cameras')
        .insert([payload])
        .select()
        .single();
    if (error) {
        logQueryError('cameras.create', error);
        throw new Error('Failed to create camera');
    }
    return data;
}
export async function updateCamera(cameraId, fields) {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
        .from('cameras')
        .update({ ...fields, updated_at: new Date().toISOString() })
        .eq('id', cameraId)
        .select()
        .single();
    if (error) {
        if (error.code === 'PGRST116') {
            throw new NotFoundError('Camera', cameraId);
        }
        logQueryError('cameras.update', error);
        throw new Error('Failed to update camera');
    }
    return data;
}
export async function setCameraAvailability(cameraId, isAvailable, notes) {
    const updates = {
        is_available: isAvailable,
        updated_at: new Date().toISOString(),
    };
    if (notes) {
        updates.notes = notes;
    }
    return updateCamera(cameraId, updates);
}
//# sourceMappingURL=cameras.tools.js.map