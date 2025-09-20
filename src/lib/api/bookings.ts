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
      .select(`
        *,
        camera_images (
          id,
          image_url,
          image_path,
          is_primary,
          alt_text,
          order_index,
          file_size,
          file_type,
          created_at,
          updated_at
        )
      `)
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
      .select(`
        *,
        camera_accessories (
          id,
          is_included,
          quantity,
          accessory:accessories (*)
        )
      `)
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

// Enhanced Camera Management Functions

// Update camera
export async function updateCamera(id: string, cameraData: Partial<Camera>): Promise<Camera | null> {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .update(cameraData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating camera:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateCamera:', error)
    return null
  }
}

// Create camera
export async function createCameraRecord(cameraData: Omit<Camera, 'id' | 'created_at' | 'updated_at'>): Promise<Camera | null> {
  try {
    const { data, error } = await supabase
      .from('cameras')
      .insert([cameraData])
      .select()
      .single()

    if (error) {
      console.error('Error creating camera:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createCamera:', error)
    return null
  }
}

// Delete camera
export async function deleteCamera(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('cameras')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting camera:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteCamera:', error)
    return false
  }
}

// Accessory Management Functions

// Get all accessories
export async function getAllAccessories(): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('accessories')
      .select('*')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching accessories:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getAllAccessories:', error)
    return []
  }
}

// Get accessory by ID
export async function getAccessoryById(id: string): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('accessories')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') return null
      throw error
    }

    return data
  } catch (error) {
    console.error('Error fetching accessory:', error)
    return null
  }
}

// Create accessory
export async function createAccessory(accessoryData: any): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('accessories')
      .insert([accessoryData])
      .select()
      .single()

    if (error) {
      console.error('Error creating accessory:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in createAccessory:', error)
    return null
  }
}

// Update accessory
export async function updateAccessory(id: string, accessoryData: any): Promise<any | null> {
  try {
    const { data, error } = await supabase
      .from('accessories')
      .update(accessoryData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating accessory:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateAccessory:', error)
    return null
  }
}

// Delete accessory
export async function deleteAccessory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('accessories')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting accessory:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteAccessory:', error)
    return false
  }
}

// Link accessory to camera
export async function linkAccessoryToCamera(cameraId: string, accessoryId: string, isIncluded: boolean = true, quantity: number = 1): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('camera_accessories')
      .insert([{
        camera_id: cameraId,
        accessory_id: accessoryId,
        is_included: isIncluded,
        quantity: quantity
      }])

    if (error) {
      console.error('Error linking accessory to camera:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in linkAccessoryToCamera:', error)
    return false
  }
}

// Remove accessory from camera
export async function removeAccessoryFromCamera(cameraId: string, accessoryId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('camera_accessories')
      .delete()
      .eq('camera_id', cameraId)
      .eq('accessory_id', accessoryId)

    if (error) {
      console.error('Error removing accessory from camera:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in removeAccessoryFromCamera:', error)
    return false
  }
}
