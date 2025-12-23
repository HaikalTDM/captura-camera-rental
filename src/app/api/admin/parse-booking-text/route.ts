import { NextRequest, NextResponse } from 'next/server';
import { parseBookingText } from '@/lib/bookingParser';

/**
 * Booking Text Parser API
 * Uses LOCAL regex-based parsing - NO AI/LLM required!
 * 
 * Benefits:
 * - Zero API cost (no DeepSeek/OpenAI calls)
 * - Instant response (no network latency)
 * - Works offline
 * - 100% reliable for structured data
 * - No token limits or rate limits
 */

interface ParsedBookingData {
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  customer_whatsapp?: string;
  camera_name?: string;
  start_date?: string;
  end_date?: string;
  pickup_method?: 'pickup' | 'delivery';
  pickup_address?: string;
  notes?: string;
  is_mother_booking?: boolean;
  confidence: {
    customer_name: 'high' | 'medium' | 'low' | 'none';
    customer_phone: 'high' | 'medium' | 'low' | 'none';
    customer_email: 'high' | 'medium' | 'low' | 'none';
    camera_name: 'high' | 'medium' | 'low' | 'none';
    dates: 'high' | 'medium' | 'low' | 'none';
  };
}

export async function POST(request: NextRequest) {
  try {
    const { text, availableCameras } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required' },
        { status: 400 }
      );
    }

    // Trim and validate input
    const trimmedText = text.trim();
    if (trimmedText.length < 3) {
      return NextResponse.json(
        { error: 'Text is too short' },
        { status: 400 }
      );
    }

    // Limit input length to prevent abuse
    const processedText = trimmedText.substring(0, 2000);

    console.log('📝 Parsing booking text locally (no AI)...');
    console.log('📝 Input length:', processedText.length, 'characters');

    // Parse using local regex-based parser
    const parsedData = parseBookingText(processedText, availableCameras || []);

    console.log('✅ Parsing complete!');
    console.log('📊 Extracted data:', JSON.stringify(parsedData, null, 2));

    // Validate and clean the data for response
    const cleanedData: ParsedBookingData = {
      customer_name: parsedData.customer_name || undefined,
      customer_phone: parsedData.customer_phone || undefined,
      customer_email: parsedData.customer_email || undefined,
      customer_whatsapp: parsedData.customer_whatsapp || parsedData.customer_phone || undefined,
      camera_name: parsedData.camera_name || undefined,
      start_date: parsedData.start_date || undefined,
      end_date: parsedData.end_date || undefined,
      pickup_method: parsedData.pickup_method || undefined,
      pickup_address: parsedData.pickup_address || undefined,
      notes: parsedData.notes || undefined,
      is_mother_booking: parsedData.is_mother_booking || false,
      confidence: parsedData.confidence || {
        customer_name: 'none',
        customer_phone: 'none',
        customer_email: 'none',
        camera_name: 'none',
        dates: 'none'
      }
    };

    // Calculate overall extraction success
    const fieldsExtracted = [
      cleanedData.customer_name,
      cleanedData.customer_phone,
      cleanedData.customer_email,
      cleanedData.camera_name,
      cleanedData.start_date
    ].filter(Boolean).length;

    console.log(`📈 Extracted ${fieldsExtracted}/5 main fields`);

    return NextResponse.json({
      success: true,
      data: cleanedData,
      raw_text: processedText,
      method: 'local_regex', // Indicate this was parsed locally
      fields_extracted: fieldsExtracted
    });

  } catch (error) {
    console.error('❌ Error parsing booking text:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to parse booking text',
        details: errorMessage,
        method: 'local_regex'
      },
      { status: 500 }
    );
  }
}

// Optional: Add GET endpoint for health check
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    method: 'local_regex',
    description: 'Booking text parser using local regex - no AI required',
    features: [
      'Malaysian phone number extraction (+60, 01x formats)',
      'Email extraction',
      'Name detection',
      'Camera name matching',
      'Date range extraction (DD/MM, DD Month, etc.)',
      'Pickup/delivery detection',
      'Address extraction',
      'Notes/special requests extraction'
    ]
  });
}
