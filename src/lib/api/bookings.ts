import { supabase } from '../supabase'
import type { Booking, Customer, Camera } from '../supabase'

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }
  return value ?? null
}

// Get all bookings with customer details and camera information
export async function getAllBookings(): Promise<Booking[]> {
  try {
    console.log('Fetching all bookings...');
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching bookings:', error)
      return []
    }

    console.log('Fetched bookings:', data?.length || 0);

    // Since camera_id is a string field, we need to fetch camera info separately
    // Get all unique camera IDs from bookings
    const cameraIds = [...new Set(data?.map(booking => booking.camera_id).filter(Boolean))] as string[]

    // Fetch camera information for all camera IDs
    const { data: cameras, error: cameraError } = await supabase
      .from('cameras')
      .select('id, name, brand, model')
      .in('id', cameraIds)

    if (cameraError) {
      console.error('Error fetching camera info:', cameraError)
    }

    // Create a map of camera ID to camera info for quick lookup
    const cameraMap = new Map()
    cameras?.forEach(camera => {
      cameraMap.set(camera.id, camera)
    })

    // Add camera info to each booking
    const bookingsWithCameraInfo = data?.map(booking => ({
      ...booking,
      camera: cameraMap.get(booking.camera_id) || {
        id: booking.camera_id,
        name: `Camera (${booking.camera_id})`, // Fallback if camera not found
        brand: 'Unknown',
        model: 'Unknown'
      }
    })) || []

    return bookingsWithCameraInfo
  } catch (error) {
    console.error('Error in getAllBookings:', error)
    return []
  }
}

// Get booking by ID
export async function getBookingById(id: string): Promise<Booking | null> {
  try {
    console.log('Fetching booking by ID:', id);
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Error fetching booking:', error)
      if (error.code === 'PGRST116') return null // Not found
      return null
    }

    console.log('Fetched booking:', data);

    // Fetch camera information if camera_id exists
    if (data?.camera_id) {
      const { data: camera, error: cameraError } = await supabase
        .from('cameras')
        .select('id, name, brand, model')
        .eq('id', data.camera_id)
        .single()

      if (cameraError) {
        console.error('Error fetching camera info:', cameraError)
      }

      // Add camera info to booking
      return {
        ...data,
        camera: camera || {
          id: data.camera_id,
          name: `Camera (${data.camera_id})`,
          brand: 'Unknown',
          model: 'Unknown'
        }
      }
    }

    return data
  } catch (error) {
    console.error('Error in getBookingById:', error)
    return null
  }
}

// Get bookings by date range
export async function getBookingsByDateRange(startDate: string, endDate: string): Promise<Booking[]> {
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*)
      `)
      .gte('start_date', startDate)
      .lte('end_date', endDate)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching bookings by date range:', error)
      return []
    }

    // Get camera information for all bookings
    const cameraIds = [...new Set(data?.map(booking => booking.camera_id).filter(Boolean))] as string[]

    if (cameraIds.length > 0) {
      const { data: cameras, error: cameraError } = await supabase
        .from('cameras')
        .select('id, name, brand, model')
        .in('id', cameraIds)

      if (cameraError) {
        console.error('Error fetching camera info:', cameraError)
      }

      // Create a map of camera ID to camera info
      const cameraMap = new Map()
      cameras?.forEach(camera => {
        cameraMap.set(camera.id, camera)
      })

      // Add camera info to each booking
      return data?.map(booking => ({
        ...booking,
        camera: cameraMap.get(booking.camera_id) || {
          id: booking.camera_id,
          name: `Camera (${booking.camera_id})`,
          brand: 'Unknown',
          model: 'Unknown'
        }
      })) || []
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
  booking_status?: 'pending_approval' | 'confirmed' | 'rejected' | 'cancelled' | 'completed'
  pickup_method?: 'pickup' | 'delivery'
  pickup_address?: string | null
  delivery_fee?: number
  booking_source?: 'website' | 'phone' | 'whatsapp' | 'walk-in' | 'historical' | 'manual'
  notes?: string | null
  skipAvailabilityCheck?: boolean // For historical/bulk imports only
}): Promise<Booking | null> {
  try {
    // Check camera availability BEFORE creating the booking (unless explicitly skipped)
    if (!bookingData.skipAvailabilityCheck) {
      const { data: isAvailable, error: availabilityError } = await supabase
        .rpc('check_camera_availability', {
          p_camera_id: bookingData.camera_id,
          p_start_date: bookingData.start_date,
          p_end_date: bookingData.end_date,
          p_exclude_booking_id: null
        });

      if (availabilityError) {
        console.error('Error checking camera availability:', availabilityError);
        throw new Error('Failed to check camera availability');
      }

      if (!isAvailable) {
        // Get conflicting bookings for error message
        const { data: conflicts } = await supabase
          .from('bookings')
          .select('id, start_date, end_date, customer:customers(full_name)')
          .eq('camera_id', bookingData.camera_id)
          .eq('booking_status', 'confirmed')
          .or(`start_date.lte.${bookingData.end_date},end_date.gte.${bookingData.start_date}`);

        const conflictingCustomer = unwrapRelation(conflicts?.[0]?.customer)
        const conflictDetails = conflicts && conflicts.length > 0
          ? `Conflicting with booking for ${conflictingCustomer?.full_name || 'another customer'} (${conflicts[0].start_date} to ${conflicts[0].end_date})`
          : 'Camera is already booked for these dates';

        throw new Error(`Camera not available: ${conflictDetails}`);
      }
    }

    // Clean the data to convert empty strings to null for date fields
    const cleanedData = {
      ...bookingData,
      deposit_paid_date: bookingData.deposit_paid_date || null,
      final_payment_paid_date: bookingData.final_payment_paid_date || null,
      pickup_address: bookingData.pickup_address || null,
      notes: bookingData.notes || null
    };

    // Remove the skipAvailabilityCheck flag before inserting
    delete (cleanedData as any).skipAvailabilityCheck;

    // First, insert the booking without joins
    const { data: bookingRecord, error } = await supabase
      .from('bookings')
      .insert([cleanedData])
      .select('*')
      .single()

    if (error) {
      console.error('Error creating booking:', error)
      return null
    }

    // Then fetch the related data separately
    const [customerResult, cameraResult] = await Promise.all([
      supabase.from('customers').select('*').eq('id', bookingData.customer_id).single(),
      supabase.from('cameras').select('*').eq('id', bookingData.camera_id).single()
    ])

    // Combine the data
    const booking = {
      ...bookingRecord,
      customer: customerResult.data,
      camera: cameraResult.data
    }

    return booking
  } catch (error) {
    console.error('Error in createBooking:', error)
    throw error // Re-throw the error so the caller can handle it
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

// Create new customer or return existing one
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
    // First, check if customer already exists by email
    const { data: existingCustomers, error: searchError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', customerData.email)
      .limit(1);

    if (searchError) {
      console.error('Error searching for existing customer:', searchError);
      return null;
    }

    // If customer exists, update their info and return
    if (existingCustomers && existingCustomers.length > 0) {
      const existingCustomer = existingCustomers[0];
      console.log('Found existing customer:', existingCustomer.id);

      // Update customer info with new data
      const customerUpdates: Partial<Customer> = {
        full_name: customerData.full_name,
        name: customerData.full_name,
        phone: customerData.phone,
        whatsapp: customerData.whatsapp || customerData.phone,
        address: customerData.address || existingCustomer.address,
        id_number: customerData.id_number || existingCustomer.id_number,
        emergency_contact_name: customerData.emergency_contact_name || existingCustomer.emergency_contact_name,
        emergency_contact_phone: customerData.emergency_contact_phone || existingCustomer.emergency_contact_phone,
        updated_at: new Date().toISOString()
      };

      const { data: updatedCustomer, error: updateError } = await supabase
        .from('customers')
        .update(customerUpdates)
        .eq('id', existingCustomer.id)
        .select()
        .single();

      if (updateError) {
        console.error('Error updating customer:', updateError);
        // Return existing customer even if update fails
        return existingCustomer;
      }

      return updatedCustomer;
    }

    // Customer doesn't exist, create new one
    console.log('Creating new customer');
    const dbCustomerData = {
      ...customerData,
      name: customerData.full_name,
      full_name: customerData.full_name,
      whatsapp: customerData.whatsapp || customerData.phone,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('customers')
      .insert([dbCustomerData])
      .select()
      .single()

    if (error) {
      console.error('Error creating customer:', error);

      // Handle duplicate key error (race condition)
      if (error.code === '23505') {
        console.log('Duplicate customer detected (race condition), fetching existing customer');
        const { data: existingCustomer } = await supabase
          .from('customers')
          .select('*')
          .eq('email', customerData.email)
          .single();

        return existingCustomer || null;
      }

      return null;
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
      .order('display_order', { ascending: true, nullsFirst: false })

    if (error) {
      console.error('Error fetching cameras:', error)
      return []
    }

    // Debug logging removed for production

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

// Update customer
export async function updateCustomer(
  id: string, 
  updates: Partial<Customer>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating customer:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateCustomer:', error)
    return false
  }
}

// Delete customer
export async function deleteCustomer(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('customers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting customer:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteCustomer:', error)
    return false
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
    console.log('Fetching booking stats...');
    const { data, error } = await supabase
      .from('bookings')
      .select('booking_status, booking_source')

    if (error) {
      console.error('Error fetching booking stats:', error)
      return { total: 0, pending: 0, confirmed: 0, active: 0, completed: 0, cancelled: 0, bySource: {} }
    }

    console.log('Stats data:', data);
    const total = data.length
    const pending = data.filter(b => b.booking_status === 'pending_approval').length
    const confirmed = data.filter(b => b.booking_status === 'confirmed').length
    const active = data.filter(b => b.booking_status === 'active').length
    const completed = data.filter(b => b.booking_status === 'completed').length
    const cancelled = data.filter(b => b.booking_status === 'cancelled').length

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
export async function bulkCreateBookings(bookings: any[], skipAvailabilityCheck = false): Promise<{
  success: number
  failed: number
  errors: string[]
}> {
  let success = 0
  let failed = 0
  const errors: string[] = []

  for (const booking of bookings) {
    try {
      const result = await createBooking({
        ...booking,
        skipAvailabilityCheck // Pass the flag to skip availability check for historical imports
      })
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
    // Clean the data to handle unique constraints and empty values
    const cleanedData = {
      ...cameraData,
      // Convert empty serial number to null to avoid unique constraint violation
      serial_number: cameraData.serial_number?.trim() || null,
      // Convert empty date strings to null
      purchase_date: cameraData.purchase_date || null,
      warranty_expiry: cameraData.warranty_expiry || null,
      last_maintenance: cameraData.last_maintenance || null,
      next_maintenance: cameraData.next_maintenance || null
    };

    const { data, error } = await supabase
      .from('cameras')
      .update(cleanedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating camera:', error)
      throw error // Throw error so it can be caught by the calling function
    }

    return data
  } catch (error) {
    console.error('Error in updateCamera:', error)
    throw error // Re-throw so the UI can handle it properly
  }
}

// Create camera
export async function createCameraRecord(cameraData: Omit<Camera, 'id' | 'created_at' | 'updated_at'>): Promise<Camera | null> {
  try {
    // Clean the data to handle unique constraints and empty values
    const cleanedData = {
      ...cameraData,
      // Convert empty serial number to null to avoid unique constraint violation
      serial_number: cameraData.serial_number?.trim() || null,
      // Convert empty date strings to null
      purchase_date: cameraData.purchase_date || null,
      warranty_expiry: cameraData.warranty_expiry || null,
      last_maintenance: cameraData.last_maintenance || null,
      next_maintenance: cameraData.next_maintenance || null
    };

    const { data, error } = await supabase
      .from('cameras')
      .insert([cleanedData])
      .select()
      .single()

    if (error) {
      console.error('Error creating camera:', error)
      throw error // Throw error so it can be caught by the calling function
    }

    return data
  } catch (error) {
    console.error('Error in createCamera:', error)
    throw error // Re-throw so the UI can handle it properly
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

// Update camera display order
export async function updateCameraDisplayOrder(cameraOrders: { id: string; display_order: number }[]): Promise<boolean> {
  try {
    console.log('🔄 Updating camera display order:');
    console.table(cameraOrders);
    
    // Update each camera's display_order
    const updates = cameraOrders.map(({ id, display_order }) => 
      supabase
        .from('cameras')
        .update({ display_order })
        .eq('id', id)
    )

    const results = await Promise.all(updates)
    
    console.log('✅ Update results:');
    results.forEach((result, index) => {
      if (result.error) {
        console.error(`❌ Camera ${index}:`, result.error);
      } else {
        console.log(`✅ Camera ${index}:`, result.data);
      }
    });
    
    // Check if any update failed and log the specific errors
    const errors = results.filter(result => result.error).map(result => result.error)
    if (errors.length > 0) {
      console.error('❌ Error updating camera display order:', errors)
      // Show a more helpful error message
      const errorMessage = errors[0]?.message || 'Unknown error'
      if (errorMessage.includes('column') && errorMessage.includes('does not exist')) {
        console.error('⚠️ The display_order column does not exist in your database!')
        console.error('Please run the SQL migration in ADD_DISPLAY_ORDER_TO_CAMERAS.sql')
      }
      return false
    }

    console.log('✅ All camera display orders updated successfully!');
    return true
  } catch (error) {
    console.error('❌ Error in updateCameraDisplayOrder:', error)
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
