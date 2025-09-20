import { supabase } from '../supabase'
import type { Booking, Customer, Camera } from '../supabase'

// Get all bookings with customer and camera details
export async function getAllBookings(): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        camera:cameras(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllBookings:', error)
    return []
  }
}

// Get bookings by date range
export async function getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        camera:cameras(*)
      `)
      .gte('start_date', startDate)
      .lte('end_date', endDate)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching bookings by date range:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getBookingsByDateRange:', error)
    return []
  }
}

// Create new booking
export async function createBooking(bookingData: {
  customer_id: string
  camera_id: string
  start_date: string
  end_date: string
  total_days: number
  daily_rate: number
  total_amount: number
  deposit_amount: number
  deposit_paid?: boolean
  deposit_paid_date?: string | null
  final_payment_amount: number
  final_payment_paid?: boolean
  final_payment_paid_date?: string | null
  status?: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled'
  pickup_method?: 'pickup' | 'delivery'
  pickup_address?: string | null
  delivery_fee?: number
  booking_source?: 'website' | 'phone' | 'whatsapp' | 'walk-in' | 'historical' | 'manual'
  notes?: string | null
}): Promise<Booking | null> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .insert([bookingData])
      .select(`
        *,
        customer:customers(*),
        camera:cameras(*)
      `)
      .single()

    if (error) {
      console.error('Error creating booking:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createBooking:', error)
    return null
  }
}

// Update booking
export async function updateBooking(
  id: string, 
  updates: Partial<Booking>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating booking:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateBooking:', error)
    return false
  }
}

// Delete booking
export async function deleteBooking(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('bookings')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting booking:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteBooking:', error)
    return false
  }
}

// Get all customers
export async function getAllCustomers(): Promise<Customer[]> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('full_name', { ascending: true })

    if (error) {
      console.error('Error fetching customers:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllCustomers:', error)
    return []
  }
}

// Create new customer
export async function createCustomer(customerData: {
  full_name: string
  email: string
  phone: string
  whatsapp?: string
  address?: string
  id_number?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
}): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .insert([customerData])
      .select()
      .single()

    if (error) {
      console.error('Error creating customer:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createCustomer:', error)
    return null
  }
}

// Get all cameras
export async function getAllCameras(): Promise<Camera[]> {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching cameras:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllCameras:', error)
    return []
  }
}

// Get camera by ID
export async function getCameraById(id: string): Promise<Camera | null> {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching camera:', error);
    throw error;
  }
}

// Get customer by ID
export async function getCustomerById(id: string): Promise<Customer | null> {
  try {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }
    return data;
  } catch (error) {
    console.error('Error fetching customer:', error);
    throw error;
  }
}

// Get booking statistics
export async function getBookingStats(): Promise<{
  total: number
  pending: number
  confirmed: number
  active: number
  completed: number
  cancelled: number
  bySource: Record<string, number>
}> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select('status, booking_source')

    if (error) {
      console.error('Error fetching booking stats:', error)
      return { total: 0, pending: 0, confirmed: 0, active: 0, completed: 0, cancelled: 0, bySource: {} }
    }

    const total = data.length
    const pending = data.filter(b => b.status === 'pending').length
    const confirmed = data.filter(b => b.status === 'confirmed').length
    const active = data.filter(b => b.status === 'active').length
    const completed = data.filter(b => b.status === 'completed').length
    const cancelled = data.filter(b => b.status === 'cancelled').length

    const bySource: Record<string, number> = {}
    data.forEach(booking => {
      const source = booking.booking_source || 'unknown'
      bySource[source] = (bySource[source] || 0) + 1
    })

    return { total, pending, confirmed, active, completed, cancelled, bySource }
  } catch (error) {
    console.error('Error in getBookingStats:', error)
    return { total: 0, pending: 0, confirmed: 0, active: 0, completed: 0, cancelled: 0, bySource: {} }
  }
}

// Bulk create bookings (for CSV import)
export async function bulkCreateBookings(bookings: any[]): Promise<{
  success: number
  failed: number
  errors: string[]
}> {
  let success = 0
  let failed = 0
  const errors: string[] = []

  for (const booking of bookings) {
    try {
      const result = await createBooking(booking)
      if (result) {
        success++
      } else {
        failed++
        errors.push(`Failed to create booking for ${booking.customer_name || 'unknown customer'}`)
      }
    } catch (error) {
      failed++
      errors.push(`Error creating booking: ${error}`)
    }
  }

  return { success, failed, errors }
}
