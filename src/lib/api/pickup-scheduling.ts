/**
 * CAPTURA Pickup Scheduling System API
 * 
 * Business Rule: Customers must pick up cameras one day before rental start date
 * pickup_date = start_date - 1 day
 */

import { supabase } from '@/lib/supabase'
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter'

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }
  return value ?? null
}

// Helper function to get camera info
const getCameraInfo = async (cameraId: string) => {
  const { data: camera, error } = await supabase
    .from('cameras')
    .select('name, model')
    .eq('id', cameraId)
    .single();
  
  if (error) {
    console.error('Error fetching camera info:', error);
    return { name: 'Unknown Camera', model: '' };
  }
  
  return camera || { name: 'Unknown Camera', model: '' };
};

export interface PickupSchedule {
  id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  camera_name: string
  camera_model: string
  pickup_date: string
  start_date: string
  end_date: string
  booking_status: string
  equipment_picked_up: boolean
  total_amount: number
  notes?: string
}

/**
 * Get all pickups scheduled for today
 */
export async function getTodaysPickups(): Promise<PickupSchedule[]> {
  try {
    const today = new Date().toISOString().split('T')[0];
    
    // First, try to get pickups using the pickup_date field
    const { data: pickupsWithDate, error: pickupsError } = await supabase
      .from('bookings')
      .select(`
        id,
        camera_id,
        pickup_date,
        start_date,
        end_date,
        booking_status,
        equipment_picked_up,
        total_amount,
        notes,
        customer:customers(full_name, phone, email)
      `)
      .eq('pickup_date', today)
      .eq('equipment_picked_up', false)
      .in('booking_status', ['confirmed', 'approved'])
      .order('created_at', { ascending: true });

    if (!pickupsError && pickupsWithDate && pickupsWithDate.length > 0) {
      // Get camera info for all bookings
      const bookingsWithCameraInfo = await Promise.all(
        pickupsWithDate.map(async (booking) => {
          const cameraInfo = await getCameraInfo(booking.camera_id);
          const customer = unwrapRelation(booking.customer);
          return {
            ...booking,
            customer,
            camera_name: cameraInfo.name,
            camera_model: cameraInfo.model
          };
        })
      );

      return bookingsWithCameraInfo.map(booking => ({
        id: booking.id,
        customer_name: booking.customer?.full_name || 'Unknown Customer',
        customer_phone: booking.customer?.phone ? formatPhoneWithCountryCode(booking.customer.phone) : '',
        customer_email: booking.customer?.email || '',
        camera_name: booking.camera_name,
        camera_model: booking.camera_model,
        pickup_date: booking.pickup_date || today,
        start_date: booking.start_date,
        end_date: booking.end_date,
        booking_status: booking.booking_status || 'pending',
        equipment_picked_up: booking.equipment_picked_up,
        total_amount: booking.total_amount,
        notes: booking.notes
      }));
    }

    // Fallback: Calculate pickup dates manually for bookings without pickup_date
    const { data: allBookings, error: allBookingsError } = await supabase
      .from('bookings')
      .select(`
        id,
        camera_id,
        start_date,
        end_date,
        booking_status,
        equipment_picked_up,
        total_amount,
        notes,
        customer:customers(full_name, phone, email)
      `)
      .eq('equipment_picked_up', false)
      .in('booking_status', ['confirmed', 'approved'])
      .order('start_date', { ascending: true });

    if (allBookingsError) {
      console.error('Error fetching bookings for pickup calculation:', allBookingsError);
      return [];
    }

    // Filter bookings where calculated pickup date is today
    const todaysPickups = (allBookings || []).filter(booking => {
      const startDate = new Date(booking.start_date);
      const pickupDate = new Date(startDate);
      pickupDate.setDate(pickupDate.getDate() - 1);
      const calculatedPickupDate = pickupDate.toISOString().split('T')[0];
      return calculatedPickupDate === today;
    });

    // Get camera info for all bookings
    const bookingsWithCameraInfo = await Promise.all(
      todaysPickups.map(async (booking) => {
        const cameraInfo = await getCameraInfo(booking.camera_id);
        const customer = unwrapRelation(booking.customer);
        return {
          ...booking,
          customer,
          camera_name: cameraInfo.name,
          camera_model: cameraInfo.model
        };
      })
    );

    return bookingsWithCameraInfo.map(booking => ({
      id: booking.id,
      customer_name: booking.customer?.full_name || 'Unknown Customer',
      customer_phone: booking.customer?.phone || '',
      customer_email: booking.customer?.email || '',
      camera_name: booking.camera_name,
      camera_model: booking.camera_model,
      pickup_date: (() => {
        const startDate = new Date(booking.start_date);
        const pickupDate = new Date(startDate);
        pickupDate.setDate(pickupDate.getDate() - 1);
        return pickupDate.toISOString().split('T')[0];
      })(),
      start_date: booking.start_date,
      end_date: booking.end_date,
      booking_status: booking.booking_status || 'pending',
      equipment_picked_up: booking.equipment_picked_up,
      total_amount: booking.total_amount,
      notes: booking.notes
    }));

  } catch (error) {
    console.error('Error getting today\'s pickups:', error);
    return [];
  }
}

/**
 * Get pickup schedule for a specific date
 */
export async function getPickupsForDate(date: string): Promise<PickupSchedule[]> {
  try {
    // Try using pickup_date field first
    const { data: pickupsWithDate, error: pickupsError } = await supabase
      .from('bookings')
      .select(`
        id,
        camera_id,
        pickup_date,
        start_date,
        end_date,
        booking_status,
        equipment_picked_up,
        total_amount,
        notes,
        customer:customers(full_name, phone, email)
      `)
      .eq('pickup_date', date)
      .in('booking_status', ['confirmed', 'approved'])
      .order('created_at', { ascending: true });

    if (!pickupsError && pickupsWithDate && pickupsWithDate.length > 0) {
      // Get camera info for all bookings
      const bookingsWithCameraInfo = await Promise.all(
        pickupsWithDate.map(async (booking) => {
          const cameraInfo = await getCameraInfo(booking.camera_id);
          const customer = unwrapRelation(booking.customer);
          return {
            ...booking,
            customer,
            camera_name: cameraInfo.name,
            camera_model: cameraInfo.model
          };
        })
      );

      return bookingsWithCameraInfo.map(booking => ({
        id: booking.id,
        customer_name: booking.customer?.full_name || 'Unknown Customer',
        customer_phone: booking.customer?.phone ? formatPhoneWithCountryCode(booking.customer.phone) : '',
        customer_email: booking.customer?.email || '',
        camera_name: booking.camera_name,
        camera_model: booking.camera_model,
        pickup_date: booking.pickup_date || date,
        start_date: booking.start_date,
        end_date: booking.end_date,
        booking_status: booking.booking_status || 'pending',
        equipment_picked_up: booking.equipment_picked_up,
        total_amount: booking.total_amount,
        notes: booking.notes
      }));
    }

    // Fallback: Calculate pickup dates manually
    const targetDate = new Date(date);
    const rentalStartDate = new Date(targetDate);
    rentalStartDate.setDate(rentalStartDate.getDate() + 1);
    const rentalStartDateString = rentalStartDate.toISOString().split('T')[0];

    const { data: calculatedPickups, error: calculatedError } = await supabase
      .from('bookings')
      .select(`
        id,
        camera_id,
        start_date,
        end_date,
        booking_status,
        equipment_picked_up,
        total_amount,
        notes,
        customer:customers(full_name, phone, email)
      `)
      .eq('start_date', rentalStartDateString)
      .in('booking_status', ['confirmed', 'approved'])
      .order('created_at', { ascending: true });

    if (calculatedError) {
      console.error('Error fetching calculated pickups:', calculatedError);
      return [];
    }

    // Get camera info for all bookings
    const bookingsWithCameraInfo = await Promise.all(
      (calculatedPickups || []).map(async (booking) => {
        const cameraInfo = await getCameraInfo(booking.camera_id);
        const customer = unwrapRelation(booking.customer);
        return {
          ...booking,
          customer,
          camera_name: cameraInfo.name,
          camera_model: cameraInfo.model
        };
      })
    );

    return bookingsWithCameraInfo.map(booking => ({
      id: booking.id,
      customer_name: booking.customer?.full_name || 'Unknown Customer',
      customer_phone: booking.customer?.phone || '',
      customer_email: booking.customer?.email || '',
      camera_name: booking.camera_name,
      camera_model: booking.camera_model,
      pickup_date: date,
      start_date: booking.start_date,
      end_date: booking.end_date,
      booking_status: booking.booking_status || 'pending',
      equipment_picked_up: booking.equipment_picked_up,
      total_amount: booking.total_amount,
      notes: booking.notes
    }));

  } catch (error) {
    console.error('Error getting pickups for date:', error);
    return [];
  }
}

/**
 * Mark equipment as picked up
 */
export async function markEquipmentPickedUp(bookingId: string, notes?: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update({
        equipment_picked_up: true,
        equipment_pickup_date: new Date().toISOString(),
        equipment_pickup_notes: notes || null,
        updated_at: new Date().toISOString()
      })
      .eq('id', bookingId);

    if (error) {
      console.error('Error marking equipment as picked up:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in markEquipmentPickedUp:', error);
    return false;
  }
}

/**
 * Get pickup statistics
 */
export async function getPickupStats() {
  try {
    const todaysPickups = await getTodaysPickups();
    
    // Get overdue pickups (pickup date was yesterday or earlier, not picked up)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayString = yesterday.toISOString().split('T')[0];
    
    const { data: overduePickups } = await supabase
      .from('bookings')
      .select('id')
      .lte('pickup_date', yesterdayString)
      .eq('equipment_picked_up', false)
      .in('booking_status', ['confirmed', 'approved']);

    return {
      todaysCount: todaysPickups.length,
      overdueCount: overduePickups?.length || 0,
      todaysPickups: todaysPickups
    };
  } catch (error) {
    console.error('Error getting pickup stats:', error);
    return {
      todaysCount: 0,
      overdueCount: 0,
      todaysPickups: []
    };
  }
}
