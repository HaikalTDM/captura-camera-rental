import { NextRequest, NextResponse } from 'next/server';
import { submitWebsiteBooking } from '@/lib/api/website-bookings';
import type { WebsiteBookingData } from '@/lib/api/website-bookings';

export async function POST(request: NextRequest) {
  try {
    const bookingData: WebsiteBookingData = await request.json();
    
    console.log('WhatsApp booking submission:', bookingData);

    // Validate required fields
    const requiredFields = [
      'camera_id',
      'camera_name', 
      'start_date',
      'end_date',
      'total_days',
      'daily_rate',
      'total_amount',
      'customer_name',
      'customer_phone'
    ];

    const missingFields = requiredFields.filter(field => {
      const value = bookingData[field as keyof WebsiteBookingData];
      return value === undefined || value === null || value === '';
    });

    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: `Missing required fields: ${missingFields.join(', ')}` 
        },
        { status: 400 }
      );
    }

    // Set booking source and status for WhatsApp bookings
    const whatsappBookingData: WebsiteBookingData = {
      ...bookingData,
      booking_source: 'whatsapp',
      customer_email: bookingData.customer_email || `${bookingData.customer_phone}@whatsapp.temp`,
      pickup_method: bookingData.pickup_method || 'pickup',
      deposit_amount: bookingData.deposit_amount || Math.round(bookingData.total_amount * 0.3),
      final_payment_amount: bookingData.final_payment_amount || Math.round(bookingData.total_amount * 0.7)
    };

    // Submit booking with pending_approval status
    const result = await submitWebsiteBooking(whatsappBookingData);

    if (!result.success) {
      return NextResponse.json(result, { status: 400 });
    }

    // Generate WhatsApp message
    const whatsappMessage = generateWhatsAppMessage(whatsappBookingData, result.confirmation_number);
    
    // Create WhatsApp URL
    const adminWhatsAppNumber = process.env.ADMIN_WHATSAPP_NUMBER || '+60177464121'; // Set this in your .env.local
    const whatsappUrl = `https://wa.me/${adminWhatsAppNumber.replace('+', '')}?text=${encodeURIComponent(whatsappMessage)}`;

    console.log('WhatsApp booking created successfully:', result);

    return NextResponse.json({
      success: true,
      message: 'Booking submitted successfully',
      booking_id: result.booking_id,
      confirmation_number: result.confirmation_number,
      whatsapp_url: whatsappUrl,
      whatsapp_message: whatsappMessage,
      status: 'pending_approval'
    });

  } catch (error) {
    console.error('Error processing WhatsApp booking:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function generateWhatsAppMessage(bookingData: WebsiteBookingData, confirmationNumber: string): string {
  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-MY', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `RM${amount.toFixed(2)}`;
  };

  return `🎥 *CAPTURA Camera Rental - New Booking Request*

📋 *Booking Details:*
• Confirmation: ${confirmationNumber}
• Camera: ${bookingData.camera_name}
• Dates: ${formatDate(bookingData.start_date)} to ${formatDate(bookingData.end_date)}
• Duration: ${bookingData.total_days} day${bookingData.total_days > 1 ? 's' : ''}
• Daily Rate: ${formatCurrency(bookingData.daily_rate)}
• Total Amount: ${formatCurrency(bookingData.total_amount)}

👤 *Customer Information:*
• Name: ${bookingData.customer_name}
• Phone: ${bookingData.customer_phone}
${bookingData.customer_email && !bookingData.customer_email.includes('@whatsapp.temp') ? `• Email: ${bookingData.customer_email}` : ''}

📍 *Pickup Method:* ${bookingData.pickup_method === 'pickup' ? 'Customer Pickup' : 'Delivery'}

⏰ *Status:* Pending Admin Approval

Please review this booking in the admin panel and approve or reject accordingly.

---
*This is an automated message from CAPTURA booking system*`;
}
