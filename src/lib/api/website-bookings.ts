import { supabase } from '../supabase';
import { createBooking, createCustomer } from './bookings';
import type { Booking, Customer } from '../supabase';

// Interface for website booking submission
export interface WebsiteBookingData {
  // Camera details
  camera_id: string;
  camera_name: string;
  
  // Booking dates and pricing
  start_date: string;
  end_date: string;
  total_days: number;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  final_payment_amount: number;
  
  // Customer details
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp?: string;
  customer_address?: string;
  customer_id_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  
  // Booking preferences
  pickup_method: 'pickup' | 'delivery';
  pickup_address?: string;
  delivery_fee?: number;
  special_requests?: string;
  
  // Source tracking
  booking_source: 'website' | 'phone' | 'whatsapp';
  referral_source?: string;
}

// Interface for booking submission response
export interface BookingSubmissionResult {
  success: boolean;
  booking?: Booking;
  customer?: Customer;
  error?: string;
  booking_id?: string;
  confirmation_number?: string;
}

// Submit a new booking from the website
export async function submitWebsiteBooking(bookingData: WebsiteBookingData): Promise<BookingSubmissionResult> {
  try {
    console.log('Submitting website booking:', bookingData);

    // Step 1: Check if customer already exists by email
    let customer: Customer | null = null;
    
    const { data: existingCustomers, error: customerSearchError } = await supabase
      .from('customers')
      .select('*')
      .eq('email', bookingData.customer_email)
      .limit(1);

    if (customerSearchError) {
      console.error('Error searching for existing customer:', customerSearchError);
      return {
        success: false,
        error: 'Failed to check customer records'
      };
    }

    // Step 2: Create or update customer
    if (existingCustomers && existingCustomers.length > 0) {
      customer = existingCustomers[0];
      console.log('Found existing customer:', customer.id);
      
      // Update customer info if needed
      const customerUpdates: Partial<Customer> = {};
      if (customer.full_name !== bookingData.customer_name) {
        customerUpdates.full_name = bookingData.customer_name;
      }
      if (customer.phone !== bookingData.customer_phone) {
        customerUpdates.phone = bookingData.customer_phone;
      }
      if (bookingData.customer_whatsapp && customer.whatsapp !== bookingData.customer_whatsapp) {
        customerUpdates.whatsapp = bookingData.customer_whatsapp;
      }
      if (bookingData.customer_address && customer.address !== bookingData.customer_address) {
        customerUpdates.address = bookingData.customer_address;
      }

      // Update customer if there are changes
      if (Object.keys(customerUpdates).length > 0) {
        const { error: updateError } = await supabase
          .from('customers')
          .update(customerUpdates)
          .eq('id', customer.id);

        if (updateError) {
          console.error('Error updating customer:', updateError);
        } else {
          customer = { ...customer, ...customerUpdates };
        }
      }
    } else {
      // Create new customer
      console.log('Creating new customer');
      customer = await createCustomer({
        full_name: bookingData.customer_name,
        email: bookingData.customer_email,
        phone: bookingData.customer_phone,
        whatsapp: bookingData.customer_whatsapp,
        address: bookingData.customer_address,
        id_number: bookingData.customer_id_number,
        emergency_contact_name: bookingData.emergency_contact_name,
        emergency_contact_phone: bookingData.emergency_contact_phone
      });

      if (!customer) {
        return {
          success: false,
          error: 'Failed to create customer record'
        };
      }
    }

    // Step 3: Create the booking
    console.log('Creating booking for customer:', customer.id);
    
    const booking = await createBooking({
      customer_id: customer.id,
      camera_id: bookingData.camera_id,
      start_date: bookingData.start_date,
      end_date: bookingData.end_date,
      total_days: bookingData.total_days,
      daily_rate: bookingData.daily_rate,
      total_amount: bookingData.total_amount,
      deposit_amount: bookingData.deposit_amount,
      final_payment_amount: bookingData.final_payment_amount,
      status: 'pending',
      pickup_method: bookingData.pickup_method,
      pickup_address: bookingData.pickup_address,
      delivery_fee: bookingData.delivery_fee || 0,
      booking_source: bookingData.booking_source,
      notes: bookingData.special_requests || null,
      deposit_paid: false,
      final_payment_paid: false
    });

    if (!booking) {
      return {
        success: false,
        error: 'Failed to create booking record'
      };
    }

    // Step 4: Generate confirmation number
    const confirmationNumber = `CAP-${booking.id.slice(-8).toUpperCase()}`;

    console.log('Booking created successfully:', booking.id);

    return {
      success: true,
      booking,
      customer,
      booking_id: booking.id,
      confirmation_number: confirmationNumber
    };

  } catch (error) {
    console.error('Error submitting website booking:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while processing your booking'
    };
  }
}

// Get booking by confirmation number
export async function getBookingByConfirmation(confirmationNumber: string): Promise<Booking | null> {
  try {
    // Extract booking ID from confirmation number (last 8 characters)
    const bookingIdSuffix = confirmationNumber.replace('CAP-', '').toLowerCase();
    
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        camera:cameras(*)
      `)
      .ilike('id', `%${bookingIdSuffix}`)
      .single();

    if (error) {
      console.error('Error fetching booking by confirmation:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getBookingByConfirmation:', error);
    return null;
  }
}

// Check camera availability for given dates
export async function checkCameraAvailability(
  cameraId: string, 
  startDate: string, 
  endDate: string
): Promise<{ available: boolean; conflictingBookings?: Booking[] }> {
  try {
    const { data: conflictingBookings, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customers(*),
        camera:cameras(*)
      `)
      .eq('camera_id', cameraId)
      .in('status', ['confirmed', 'active'])
      .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

    if (error) {
      console.error('Error checking camera availability:', error);
      return { available: false };
    }

    const hasConflicts = conflictingBookings && conflictingBookings.length > 0;

    return {
      available: !hasConflicts,
      conflictingBookings: hasConflicts ? conflictingBookings : undefined
    };
  } catch (error) {
    console.error('Error in checkCameraAvailability:', error);
    return { available: false };
  }
}

// Get available cameras for given date range
export async function getAvailableCameras(startDate: string, endDate: string) {
  try {
    // Get all cameras
    const { data: allCameras, error: camerasError } = await supabase
      .from('cameras')
      .select('*')
      .eq('is_available', true)
      .order('name');

    if (camerasError) {
      console.error('Error fetching cameras:', camerasError);
      return [];
    }

    if (!allCameras) return [];

    // Check availability for each camera
    const availableCameras = [];
    for (const camera of allCameras) {
      const { available } = await checkCameraAvailability(camera.id, startDate, endDate);
      if (available) {
        availableCameras.push(camera);
      }
    }

    return availableCameras;
  } catch (error) {
    console.error('Error in getAvailableCameras:', error);
    return [];
  }
}

// Send booking confirmation email (placeholder for future implementation)
export async function sendBookingConfirmationEmail(booking: Booking, customer: Customer): Promise<boolean> {
  try {
    // TODO: Implement email sending logic
    // This could use services like SendGrid, Mailgun, or Supabase Edge Functions
    console.log('Sending confirmation email to:', customer.email);
    console.log('Booking details:', booking);
    
    // For now, just return true
    return true;
  } catch (error) {
    console.error('Error sending confirmation email:', error);
    return false;
  }
}

// Send WhatsApp notification (placeholder for future implementation)
export async function sendWhatsAppNotification(booking: Booking, customer: Customer): Promise<boolean> {
  try {
    // TODO: Implement WhatsApp API integration
    console.log('Sending WhatsApp notification to:', customer.whatsapp || customer.phone);
    console.log('Booking details:', booking);
    
    // For now, just return true
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp notification:', error);
    return false;
  }
}
