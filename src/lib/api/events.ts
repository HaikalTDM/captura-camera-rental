import { supabase } from '../supabase';

export interface Event {
  id: string;
  title: string;
  date: string;
  end_date?: string;
  category: 'holiday' | 'season' | 'concert' | 'sports' | 'festival';
  demand: 'peak' | 'high' | 'medium';
  description: string;
  recommended_camera: string;
  special_offer?: string;
  icon: string;
  color: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

/**
 * Get all active events
 */
export async function getAllEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

/**
 * Get events by category
 */
export async function getEventsByCategory(category: string): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('category', category)
      .eq('is_active', true)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching events by category:', error);
    throw error;
  }
}

/**
 * Get upcoming events (future dates only)
 */
export async function getUpcomingEvents(): Promise<Event[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .gte('date', today)
      .eq('is_active', true)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    throw error;
  }
}

/**
 * Get peak demand events
 */
export async function getPeakEvents(): Promise<Event[]> {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('demand', 'peak')
      .eq('is_active', true)
      .order('date', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching peak events:', error);
    throw error;
  }
}

/**
 * Add new event (Admin only)
 */
export async function addEvent(event: Omit<Event, 'id' | 'created_at' | 'updated_at'>): Promise<Event> {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert([event])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding event:', error);
    throw error;
  }
}

/**
 * Update event (Admin only)
 */
export async function updateEvent(id: string, updates: Partial<Event>): Promise<Event> {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
}

/**
 * Delete event (Admin only)
 */
export async function deleteEvent(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
}

/**
 * Toggle event active status (Admin only)
 */
export async function toggleEventStatus(id: string, isActive: boolean): Promise<Event> {
  try {
    const { data, error } = await supabase
      .from('events')
      .update({ is_active: isActive })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error toggling event status:', error);
    throw error;
  }
}

