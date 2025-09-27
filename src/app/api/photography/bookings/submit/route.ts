import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      clientName,
      clientEmail,
      clientPhone,
      eventType,
      eventDate,
      eventTime,
      eventLocation,
      packageId,
      addOns = [],
      totalAmount,
      depositAmount = 0,
      notes = '',
      source = 'website'
    } = body;

    // Validate required fields
    if (!clientName || !clientEmail || !clientPhone || !eventType || !eventDate || !packageId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Format phone number
    const formattedPhone = formatPhoneWithCountryCode(clientPhone);

    // First, create or get customer
    let customerId: string;
    const { data: existingCustomer, error: customerLookupError } = await supabase
      .from('customers')
      .select('id')
      .eq('email', clientEmail)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert([{
          full_name: clientName,
          email: clientEmail,
          phone: formattedPhone,
          whatsapp: formattedPhone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select('id')
        .single();

      if (customerError) {
        console.error('Error creating customer:', customerError);
        return NextResponse.json(
          { error: 'Failed to create customer record' },
          { status: 500 }
        );
      }

      customerId = newCustomer.id;
    }

    // Create photography booking
    const { data: booking, error: bookingError } = await supabase
      .from('photography_bookings')
      .insert([{
        customer_id: customerId,
        package_id: packageId,
        event_type: eventType,
        event_date: eventDate,
        event_time: eventTime || '09:00',
        event_location: eventLocation || '',
        total_amount: totalAmount || 0,
        deposit_amount: depositAmount,
        deposit_paid: depositAmount > 0,
        deposit_paid_date: depositAmount > 0 ? new Date().toISOString() : null,
        status: 'inquiry',
        notes: notes,
        source: source,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }])
      .select('id')
      .single();

    if (bookingError) {
      console.error('Error creating photography booking:', bookingError);
      return NextResponse.json(
        { error: 'Failed to create booking' },
        { status: 500 }
      );
    }

    // Add add-ons if any
    if (addOns.length > 0) {
      const addOnInserts = addOns.map((addonId: string) => ({
        booking_id: booking.id,
        addon_id: addonId,
        created_at: new Date().toISOString()
      }));

      const { error: addOnError } = await supabase
        .from('photography_booking_addons')
        .insert(addOnInserts);

      if (addOnError) {
        console.error('Error adding add-ons:', addOnError);
        // Don't fail the entire request for add-on errors
      }
    }

    // Send WhatsApp notification to admin
    try {
      const whatsappMessage = `📸 New Photography Inquiry\n\n` +
        `Client: ${clientName}\n` +
        `Email: ${clientEmail}\n` +
        `Phone: ${formattedPhone}\n` +
        `Event: ${eventType}\n` +
        `Date: ${eventDate}\n` +
        `Location: ${eventLocation || 'TBD'}\n` +
        `Package: ${packageId}\n` +
        `Total: RM${totalAmount || 0}\n` +
        `Source: ${source}\n\n` +
        `View details: ${process.env.NEXT_PUBLIC_SITE_URL}/admin/photography/bookings`;

      await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/whatsapp/send-admin-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: whatsappMessage
        })
      });
    } catch (whatsappError) {
      console.error('Error sending WhatsApp notification:', whatsappError);
      // Don't fail the request for WhatsApp errors
    }

    return NextResponse.json({
      success: true,
      bookingId: booking.id,
      message: 'Photography inquiry submitted successfully'
    });

  } catch (error) {
    console.error('Photography booking submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
