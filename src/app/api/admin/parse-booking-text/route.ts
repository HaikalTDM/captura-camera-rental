import { NextRequest, NextResponse } from 'next/server';

/**
 * AI-Powered Booking Text Parser
 * Uses DeepSeek API to extract structured booking data from unstructured customer messages
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
  is_mother_booking?: boolean; // Flag for Mother's R50 bookings
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

    if (!process.env.DEEPSEEK_API_KEY) {
      return NextResponse.json(
        { error: 'DeepSeek API key not configured' },
        { status: 500 }
      );
    }

    // Check for Mother's R50 booking keyword
    const isMotherBooking = text.toLowerCase().includes('mother') &&
                           (text.toLowerCase().includes('r50') || text.toLowerCase().includes('canon'));

    // Build camera list for AI context
    const cameraList = availableCameras?.map((c: any) => `${c.name} (${c.brand} ${c.model})`).join(', ') || 'Sony A7 III, GoPro Hero 11, Canon EOS R6, DJI Osmo Action 4';

    const systemPrompt = `You are an AI assistant for CAPTURA camera rental business in Malaysia. Your task is to extract booking information from customer messages.

AVAILABLE CAMERAS:
${cameraList}

SPECIAL KEYWORD DETECTION:
- If the message contains "mother" + "R50" or "mother" + "Canon", this is a booking for Mother's Canon R50 camera
- Set camera_name to "Canon R50 - Mother" for these bookings

EXTRACTION RULES:
1. **Customer Name**: Extract full name (first + last name if available)
2. **Phone Number**: Extract Malaysian phone numbers (012-xxx-xxxx, 012xxxxxxxx, +6012xxxxxxxx, etc.)
3. **Email**: Extract email addresses
4. **WhatsApp**: Usually same as phone number unless specified separately
5. **Camera**: Match to available cameras (fuzzy matching: "a7iii" → "Sony A7 III", "gopro 11" → "GoPro Hero 11")
6. **Dates**: Extract start and end dates
   - Handle formats: DD/MM/YYYY, DD-MM-YYYY, "25 Dec", "Dec 25", "Christmas", "next Friday"
   - Handle ranges: "25-28 Dec", "from 25 to 28", "25 Dec - 28 Dec"
   - **IMPORTANT**: If only ONE date is mentioned (e.g., "14/11"), it's a SINGLE DAY booking - set BOTH start_date AND end_date to the SAME date
   - If date range is given, extract both start and end dates
   - Convert relative dates to actual dates (today is ${new Date().toISOString().split('T')[0]})
7. **Pickup Method**: Look for keywords: "delivery", "deliver", "hantar", "pickup", "ambil"
8. **Address**: Extract if ANY address is mentioned (street, city, area, etc.)
   - If address is found, it implies delivery method
9. **Notes**: Any special requests, extra batteries, accessories, etc.

CONFIDENCE LEVELS:
- **high**: Explicitly stated and clear
- **medium**: Inferred or partially clear
- **low**: Guessed or ambiguous
- **none**: Not found in text

RESPONSE FORMAT (JSON only, no markdown):
{
  "customer_name": "extracted name or null",
  "customer_phone": "formatted as +60xxxxxxxxx or null",
  "customer_email": "extracted email or null",
  "customer_whatsapp": "same as phone or null",
  "camera_name": "matched camera name or null (use 'Canon R50 - Mother' if mother keyword detected)",
  "start_date": "YYYY-MM-DD or null",
  "end_date": "YYYY-MM-DD or null",
  "pickup_method": "pickup or delivery or null",
  "pickup_address": "extracted address or null",
  "notes": "special requests or null",
  "is_mother_booking": true if mother keyword detected, false otherwise,
  "confidence": {
    "customer_name": "high/medium/low/none",
    "customer_phone": "high/medium/low/none",
    "customer_email": "high/medium/low/none",
    "camera_name": "high/medium/low/none",
    "dates": "high/medium/low/none"
  }
}

IMPORTANT:
- Return ONLY valid JSON, no markdown code blocks
- Format phone numbers as +60xxxxxxxxx (Malaysian format)
- Match camera names to available cameras list
- Convert all dates to YYYY-MM-DD format
- If information is not found, use null (not empty string)`;

    const userMessage = `Extract booking information from this customer message:\n\n${text}`;

    // Call DeepSeek API
    console.log('Calling DeepSeek API...');
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userMessage }
        ],
        temperature: 0.3, // Lower temperature for more consistent extraction
        max_tokens: 1000,
        response_format: { type: 'json_object' }
      })
    });

    console.log('DeepSeek API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('DeepSeek API error response:', errorText);
      throw new Error(`DeepSeek API error (${response.status}): ${errorText.substring(0, 200)}`);
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from AI');
    }

    // Parse AI response
    let parsedData: ParsedBookingData;
    try {
      parsedData = JSON.parse(aiResponse);
    } catch (parseError) {
      console.error('Failed to parse AI response:', aiResponse);
      throw new Error('Invalid JSON response from AI');
    }

    // Validate and clean the data
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
      is_mother_booking: isMotherBooking || parsedData.is_mother_booking || false,
      confidence: parsedData.confidence || {
        customer_name: 'none',
        customer_phone: 'none',
        customer_email: 'none',
        camera_name: 'none',
        dates: 'none'
      }
    };

    // Override camera name if Mother booking detected
    if (isMotherBooking && !cleanedData.camera_name?.includes('Mother')) {
      cleanedData.camera_name = 'Canon R50 - Mother';
    }

    return NextResponse.json({
      success: true,
      data: cleanedData,
      raw_text: text
    });

  } catch (error) {
    console.error('Error parsing booking text:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    // Log detailed error for debugging
    console.error('Detailed error:', {
      message: errorMessage,
      stack: errorStack,
      hasApiKey: !!process.env.DEEPSEEK_API_KEY,
      apiKeyPrefix: process.env.DEEPSEEK_API_KEY?.substring(0, 10) + '...'
    });

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to parse booking text',
        details: errorMessage,
        debug: {
          hasApiKey: !!process.env.DEEPSEEK_API_KEY,
          timestamp: new Date().toISOString()
        }
      },
      { status: 500 }
    );
  }
}

