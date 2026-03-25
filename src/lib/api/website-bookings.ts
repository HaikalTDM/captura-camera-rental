import { supabase } from '../supabase';
import { createCustomer } from './bookings';
import type { Booking, BookingGroup, Customer } from '../supabase';

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

export interface WebsiteBookingGroupItemData {
  camera_id: string;
  camera_name: string;
  total_days: number;
  daily_rate: number;
  total_amount: number;
  deposit_amount: number;
  final_payment_amount: number;
}

export interface WebsiteBookingGroupData {
  items: WebsiteBookingGroupItemData[];
  start_date: string;
  end_date: string;
  total_days: number;
  subtotal_amount?: number;
  deposit_amount?: number;
  final_payment_amount?: number;
  total_amount?: number;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp?: string;
  customer_address?: string;
  customer_id_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  pickup_method: 'pickup' | 'delivery';
  pickup_address?: string;
  delivery_fee?: number;
  special_requests?: string;
  booking_source: 'website' | 'phone' | 'whatsapp';
  referral_source?: string;
}

// Interface for booking submission response
export interface BookingSubmissionResult {
  success: boolean;
  booking?: Booking;
  bookings?: Booking[];
  customer?: Customer;
  booking_group?: BookingGroup;
  error?: string;
  booking_id?: string;
  booking_group_id?: string;
  booking_group_reference?: string;
  confirmation_number?: string;
}

type WhatsAppBookingSummary = Pick<Booking, 'id'>;
type WhatsAppCustomerSummary = Pick<Customer, 'email' | 'phone'> & {
  full_name?: string;
  name?: string;
};

function generateBookingGroupReference() {
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `KIT-${random}`;
}

async function createOrUpdateWebsiteCustomer(bookingData: {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_whatsapp?: string;
  customer_address?: string;
  customer_id_number?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
}): Promise<Customer | null> {
  let customer: Customer | null = null;

  const { data: existingCustomers, error: customerSearchError } = await supabase
    .from('customers')
    .select('*')
    .eq('email', bookingData.customer_email)
    .limit(1);

  if (customerSearchError) {
    console.error('Error searching for existing customer:', customerSearchError);
    return null;
  }

  if (existingCustomers && existingCustomers.length > 0) {
    customer = existingCustomers[0];

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
    customer = await createCustomer({
      full_name: bookingData.customer_name,
      email: bookingData.customer_email,
      phone: bookingData.customer_phone,
      whatsapp: bookingData.customer_whatsapp,
      address: bookingData.customer_address,
      id_number: bookingData.customer_id_number,
      emergency_contact_name: bookingData.emergency_contact_name,
      emergency_contact_phone: bookingData.emergency_contact_phone,
    });
  }

  return customer;
}

// Submit a new booking from the website
export async function submitWebsiteBooking(bookingData: WebsiteBookingData): Promise<BookingSubmissionResult> {
  try {
    console.log('Submitting website booking:', bookingData);

    const customer = await createOrUpdateWebsiteCustomer(bookingData);
    if (!customer) {
      return {
        success: false,
        error: 'Failed to create customer record'
      };
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

export async function submitWebsiteBookingGroup(
  bookingData: WebsiteBookingGroupData,
): Promise<BookingSubmissionResult> {
  try {
    console.log('Submitting grouped website booking:', bookingData);

    const customer = await createOrUpdateWebsiteCustomer(bookingData);
    if (!customer) {
      return {
        success: false,
        error: 'Failed to create customer record',
      };
    }

    const groupReference = generateBookingGroupReference();
    const deliveryFee = Number(bookingData.delivery_fee || 0);
    const subtotalAmount = bookingData.items.reduce((sum, item) => sum + Number(item.total_amount || 0), 0);
    const depositAmount = bookingData.items.reduce((sum, item) => sum + Number(item.deposit_amount || 0), 0);
    const finalPaymentAmount = bookingData.items.reduce((sum, item) => sum + Number(item.final_payment_amount || 0), 0);
    const totalAmount = subtotalAmount + deliveryFee;

    const { data: bookingGroup, error: bookingGroupError } = await supabase
      .from('booking_groups')
      .insert([
        {
          group_reference: groupReference,
          customer_id: customer.id,
          start_date: bookingData.start_date,
          end_date: bookingData.end_date,
          total_days: bookingData.total_days,
          pickup_method: bookingData.pickup_method,
          pickup_address: bookingData.pickup_address || null,
          delivery_fee: deliveryFee,
          subtotal_amount: subtotalAmount,
          deposit_amount: depositAmount,
          final_payment_amount: finalPaymentAmount,
          total_amount: totalAmount,
          booking_source: bookingData.booking_source,
          notes: bookingData.special_requests || null,
          status: 'pending_approval',
        },
      ])
      .select('*')
      .single();

    if (bookingGroupError || !bookingGroup) {
      console.error('Error creating booking group:', bookingGroupError);
      return {
        success: false,
        error: 'Failed to create rental kit request',
      };
    }

    const groupItemsPayload = bookingData.items.map((item, index) => ({
      booking_group_id: bookingGroup.id,
      camera_id: item.camera_id,
      daily_rate: item.daily_rate,
      total_days: bookingData.total_days,
      subtotal_amount: item.total_amount,
      deposit_amount: item.deposit_amount,
      final_payment_amount: item.final_payment_amount,
      total_amount: item.total_amount,
      sort_order: index,
    }));

    const { error: bookingGroupItemsError } = await supabase
      .from('booking_group_items')
      .insert(groupItemsPayload);

    if (bookingGroupItemsError) {
      console.error('Error creating booking group items:', bookingGroupItemsError);
      return {
        success: false,
        error: 'Failed to save rental kit items',
      };
    }

    const bookingRows = bookingData.items.map((item) => ({
      customer_id: customer.id,
      booking_group_id: bookingGroup.id,
      camera_id: item.camera_id,
      start_date: bookingData.start_date,
      end_date: bookingData.end_date,
      total_days: bookingData.total_days,
      daily_rate: item.daily_rate,
      total_amount: item.total_amount,
      deposit_amount: item.deposit_amount,
      final_payment_amount: item.final_payment_amount,
      status: 'pending',
      booking_status: 'pending_approval',
      pickup_method: bookingData.pickup_method,
      pickup_address: bookingData.pickup_address || null,
      delivery_fee: 0,
      booking_source: bookingData.booking_source,
      notes: bookingData.special_requests
        ? `[Rental Kit ${groupReference}] ${bookingData.special_requests}`
        : `[Rental Kit ${groupReference}]`,
      deposit_paid: false,
      final_payment_paid: false,
    }));

    const { data: createdBookings, error: bookingsError } = await supabase
      .from('bookings')
      .insert(bookingRows)
      .select('*');

    if (bookingsError || !createdBookings) {
      console.error('Error creating grouped bookings:', bookingsError);
      return {
        success: false,
        error: 'Failed to create grouped booking records',
      };
    }

    return {
      success: true,
      bookings: createdBookings,
      customer,
      booking_group: bookingGroup,
      booking_group_id: bookingGroup.id,
      booking_group_reference: groupReference,
      confirmation_number: groupReference,
    };
  } catch (error) {
    console.error('Error submitting grouped website booking:', error);
    return {
      success: false,
      error: 'An unexpected error occurred while processing your rental kit request',
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
        customer:customers(*)
      `)
      .ilike('id', `%${bookingIdSuffix}`)
      .single();

    if (error) {
      console.error('Error fetching booking by confirmation:', error);
      return null;
    }

    // Fetch camera information separately
    if (data && data.camera_id) {
      const { data: camera, error: cameraError } = await supabase
        .from('cameras')
        .select('id, name, brand, model')
        .eq('id', data.camera_id)
        .single();

      if (cameraError) {
        console.error('Error fetching camera info:', cameraError);
      }

      return {
        ...data,
        camera: camera || {
          id: data.camera_id,
          name: `Camera (${data.camera_id})`,
          brand: 'Unknown',
          model: 'Unknown'
        }
      };
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
export function generateWhatsAppMessage(
  booking: WhatsAppBookingSummary,
  customer: WhatsAppCustomerSummary,
  bookingData: WebsiteBookingData
): string {
  console.log('WhatsApp Message Generation - bookingData:', bookingData);
  console.log('WhatsApp Message Generation - camera_name:', bookingData.camera_name);

  // Ensure camera name is not empty or generic
  const cameraName = bookingData.camera_name && bookingData.camera_name.trim() !== '' && bookingData.camera_name.toLowerCase() !== 'camera'
    ? bookingData.camera_name
    : 'Camera Equipment'; // Fallback if camera name is missing or generic

  console.log('WhatsApp Message Generation - final camera name used:', cameraName);

  const message = `🎥 *CAPTURA Camera Rental Booking*

📋 *Booking Details:*
• Confirmation: CAP-${booking.id.slice(-8).toUpperCase()}
• Camera: ${cameraName}
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
export function generateWhatsAppContactUrl(
  booking: WhatsAppBookingSummary,
  customer: WhatsAppCustomerSummary,
  bookingData: WebsiteBookingData
): string {
  const message = generateWhatsAppMessage(booking, customer, bookingData);
  const encodedMessage = encodeURIComponent(message);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER || '+60177464121';

  return `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodedMessage}`;
}

export function generateRentalKitWhatsAppMessage(
  bookingGroupReference: string,
  bookingData: WebsiteBookingGroupData
): string {
  const itemLines = bookingData.items
    .map((item) => `• ${item.camera_name} - RM${item.total_amount}`)
    .join('\n');

  return `🎥 *CAPTURA Rental Kit Request*

📋 *Reference:* ${bookingGroupReference}

🧰 *Selected Gear:*
${itemLines}

📅 *Rental Window:*
• Dates: ${bookingData.start_date} to ${bookingData.end_date}
• Duration: ${bookingData.total_days} day${bookingData.total_days > 1 ? 's' : ''}

👤 *Customer Details:*
• Name: ${bookingData.customer_name}
• Email: ${bookingData.customer_email}
• Phone: ${bookingData.customer_phone}
• Pickup Method: ${bookingData.pickup_method}

💰 *Pricing:*
• Rental Total: RM${bookingData.subtotal_amount ?? bookingData.total_amount ?? 0}
• Deposit Hold: RM${bookingData.deposit_amount ?? 0}
• Delivery Fee: ${bookingData.pickup_method === 'delivery' ? 'Paid directly to Lalamove' : 'N/A'}

📝 *Special Requests:* ${bookingData.special_requests || 'None'}

Hi Captura, I just submitted this Rental Kit request and would like to continue the confirmation on WhatsApp.`;
}

export function generateRentalKitWhatsAppUrl(
  bookingGroupReference: string,
  bookingData: WebsiteBookingGroupData
): string {
  const message = generateRentalKitWhatsAppMessage(bookingGroupReference, bookingData);
  const encodedMessage = encodeURIComponent(message);
  const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_BUSINESS_NUMBER || '+60177464121';

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
