import { getSupabaseAdmin, logQueryError } from '../supabase/client.js';
import { NotFoundError } from '../errors/handler.js';
import type { Camera } from '../supabase/types.js';

export async function listCameras(filter: 'available_only' | 'all', sortBy: string): Promise<Camera[]> {
  const supabase = getSupabaseAdmin();

  let query = supabase.from('cameras').select('*');

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

  return data as Camera[];
}

export async function getCamera(cameraId: string): Promise<Camera> {
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

  return data as Camera;
}

export async function checkAvailability(
  cameraId: string,
  startDate: string,
  endDate: string
): Promise<{ available: boolean; conflictingBookings: { id: string; start_date: string; end_date: string }[] }> {
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

export async function createCamera(fields: Record<string, unknown>): Promise<Camera> {
  const supabase = getSupabaseAdmin();

  const { data, error } = await supabase
    .from('cameras')
    .insert([fields])
    .select()
    .single();

  if (error) {
    logQueryError('cameras.create', error);
    throw new Error('Failed to create camera');
  }

  return data as Camera;
}

export async function updateCamera(cameraId: string, fields: Record<string, unknown>): Promise<Camera> {
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

  return data as Camera;
}

export async function setCameraAvailability(
  cameraId: string,
  isAvailable: boolean,
  notes?: string
): Promise<Camera> {
  const updates: Record<string, unknown> = {
    is_available: isAvailable,
    updated_at: new Date().toISOString(),
  };
  if (notes) {
    updates.notes = notes;
  }

  return updateCamera(cameraId, updates);
}
