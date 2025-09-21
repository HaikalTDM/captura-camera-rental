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
    
    // Create complete booking record with all fields
    console.log('Creating booking with complete data...');

    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .insert([{
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
        booking_status: 'pending_approval',
        pickup_method: bookingData.pickup_method,
        pickup_address: bookingData.pickup_address,
        delivery_fee: bookingData.delivery_fee || 0,
        booking_source: bookingData.booking_source,
        notes: bookingData.special_requests || null,
        deposit_paid: false,
        final_payment_paid: false
      }])
      .select('*')
      .single();

    if (bookingError) {
      console.error('Error creating booking:', bookingError);
      throw new Error('Failed to create booking record');
    }

    console.log('Booking created successfully:', booking.id);

    if (!booking) {
      return {
        success: false,
        error: 'Failed to create booking record'
      };
    }

    // Step 4: Generate confirmation number
    const confirmationNumber = `CAP-${booking.id.slice(-8).toUpperCase()}`;

    console.log('Booking created successfully:', booking.id);

    // Step 5: Booking completed successfully - no automatic WhatsApp notifications
    console.log('Booking submission completed without WhatsApp integration');

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
    console.log('Checking availability for:', { cameraId, startDate, endDate });

    // Use the database function to check availability
    const { data: isAvailable, error: availabilityError } = await supabase
      .rpc('check_camera_availability', {
        p_camera_id: cameraId,
        p_start_date: startDate,
        p_end_date: endDate,
        p_exclude_booking_id: null
      });

    if (availabilityError) {
      console.error('Error checking camera availability:', availabilityError);
      return { available: false };
    }

    console.log('Availability check result:', isAvailable);

    // If not available, get conflicting bookings for details
    let conflictingBookings = undefined;
    if (!isAvailable) {
      const { data: conflicts, error: conflictsError } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('camera_id', cameraId)
        .eq('booking_status', 'confirmed')
        .or(`start_date.lte.${endDate},end_date.gte.${startDate}`);

      if (!conflictsError && conflicts) {
        conflictingBookings = conflicts;
      }
    }

    return {
      available: isAvailable || false,
      conflictingBookings
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

// Generate WhatsApp message for optional customer contact
export function generateWhatsAppMessage(booking: any, customer: any, bookingData: WebsiteBookingData): string {
  const message = `🎥 *CAPTURA Camera Rental Booking*

📋 *Booking Details:*
• Confirmation: CAP-${booking.id.slice(-8).toUpperCase()}
• Camera: ${bookingData.camera_name}
• Dates: ${bookingData.start_date} to ${bookingData.end_date}
• Duration: ${bookingData.total_days} days

👤 *Customer Details:*
• Name: ${customer.full_name || customer.name}
• Email: ${customer.email}
• Phone: ${customer.phone}
• Pickup Method: ${bookingData.pickup_method}

💰 *Pricing:*
• Daily Rate: RM${bookingData.daily_rate}
• Total Amount: RM${bookingData.total_amount}
• Deposit Required: RM${bookingData.deposit_amount}
• Final Payment: RM${bookingData.final_payment_amount}

📝 *Special Requests:* ${bookingData.special_requests || 'None'}

✅ *Status:* Pending approval - we'll contact you soon to confirm your booking!

Thank you for choosing CAPTURA! 📸`;

  return message;
}

// Generate WhatsApp contact URL
export function generateWhatsAppContactUrl(booking: any, customer: any, bookingData: WebsiteBookingData): string {
  const message = generateWhatsAppMessage(booking, customer, bookingData);
  const encodedMessage = encodeURIComponent(message);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER || '+60123456789';

  return `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`;
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
