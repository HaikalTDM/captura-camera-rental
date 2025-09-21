import { NextRequest, NextResponse } from 'next/server';

// WhatsApp Business API configuration
const WHATSAPP_BUSINESS_NUMBER = process.env.WHATSAPP_BUSINESS_NUMBER || '+60177464121';
const WHATSAPP_API_URL = process.env.WHATSAPP_API_URL;
const WHATSAPP_API_TOKEN = process.env.WHATSAPP_API_TOKEN;

export async function POST(request: NextRequest) {
  try {
    const { message, booking_id } = await request.json();

    if (!message || !booking_id) {
      return NextResponse.json(
        { success: false, error: 'Message and booking_id are required' },
        { status: 400 }
      );
    }

    console.log('Sending WhatsApp admin notification for booking:', booking_id);

    // If WhatsApp API is configured, send actual message
    if (WHATSAPP_API_URL && WHATSAPP_API_TOKEN) {
      try {
        const whatsappResponse = await fetch(`${WHATSAPP_API_URL}/messages`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${WHATSAPP_API_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messaging_product: 'whatsapp',
            to: WHATSAPP_BUSINESS_NUMBER.replace('+', ''),
            type: 'text',
            text: {
              body: message
            }
          }),
        });

        if (!whatsappResponse.ok) {
          const errorData = await whatsappResponse.text();
          console.error('WhatsApp API error:', errorData);
          throw new Error('WhatsApp API request failed');
        }

        const responseData = await whatsappResponse.json();
        console.log('WhatsApp message sent successfully:', responseData);

        return NextResponse.json({
          success: true,
          message: 'Admin notification sent via WhatsApp',
          whatsapp_response: responseData
        });

      } catch (whatsappError) {
        console.error('WhatsApp API error:', whatsappError);
        // Fall back to console logging
        console.log('📱 WHATSAPP ADMIN NOTIFICATION (API Failed):', message);
        
        return NextResponse.json({
          success: true,
          message: 'Admin notification logged (WhatsApp API unavailable)',
          fallback: true
        });
      }
    } else {
      // Development mode - just log the message
      console.log('📱 WHATSAPP ADMIN NOTIFICATION (Dev Mode):');
      console.log('To:', WHATSAPP_BUSINESS_NUMBER);
      console.log('Message:', message);
      console.log('Booking ID:', booking_id);
      
      return NextResponse.json({
        success: true,
        message: 'Admin notification logged (development mode)',
        development: true
      });
    }

  } catch (error) {
    console.error('Error sending WhatsApp admin notification:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to send admin notification',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to test WhatsApp configuration
export async function GET() {
  return NextResponse.json({
    configured: !!(WHATSAPP_API_URL && WHATSAPP_API_TOKEN),
    business_number: WHATSAPP_BUSINESS_NUMBER,
    api_url_configured: !!WHATSAPP_API_URL,
    token_configured: !!WHATSAPP_API_TOKEN
  });
}
