import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';
import { submitWebsiteBooking } from '@/lib/api/website-bookings';

/**
 * n8n Tool: POST /api/n8n/bookings/create
 * Allows GLM AI agent to automatically create pending bookings directly from Telegram text.
 */
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();
    const { 
      customer_name, 
      customer_phone, 
      customer_email, 
      camera_name, 
      start_date, 
      end_date, 
      pickup_method = 'pickup',
      special_requests = ''
    } = data;

    // Check if AI extraction failed (n8n wraps undefined as "[undefined]")
    if (customer_name === '[undefined]' || customer_phone === '[undefined]' || customer_email === '[undefined]' || 
        camera_name === '[undefined]' || start_date === '[undefined]' || end_date === '[undefined]') {
      return NextResponse.json({ 
        success: false, 
        error: "AI extraction failed. Please provide complete customer details (name, phone, email, camera, dates) in your message." 
      }, { status: 400 });
    }

    if (!customer_name || !customer_phone || !camera_name || !start_date || !end_date) {
      return NextResponse.json({ 
        success: false, 
        error: "Missing required fields. Provide customer_name, customer_phone, camera_name, start_date, e.g. 'YYYY-MM-DD', end_date" 
      }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();

    // 1. Find the camera by fuzzy matching the name
    const { data: cameras, error: cameraError } = await supabase
      .from('cameras')
      .select('*')
      .ilike('name', `%${camera_name.split(' ')[0]}%`) // match the first word at least
      .limit(5);

    if (cameraError || !cameras || cameras.length === 0) {
      return NextResponse.json({ 
        success: false, 
        error: `Could not find a camera matching '${camera_name}'. Please be more specific.` 
      }, { status: 404 });
    }

    // Let's just pick the first match (AI usually provides decent names)
    const camera = cameras[0];

    // 2. Compute date difference and pricing
    function parseDate(dateStr: string): Date {
      if (dateStr.includes('/')) {
        // Assume DD/MM/YYYY
        const [day, month, year] = dateStr.split('/').map(Number);
        return new Date(year, month - 1, day);
      } else {
        // Assume YYYY-MM-DD
        return new Date(dateStr);
      }
    }

    const start = parseDate(start_date);
    const end = parseDate(end_date);
    
    // Calculate total days (inclusive of drop off day usually, or midnight to midnight)
    // If start is 18/3 and end is 23/3, that's 5 nights. Captura counts by night or day? 
    // Standard captures diff:
    const diffTime = Math.abs(end.getTime() - start.getTime());
    let total_days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Minimum 1 day rental
    if (total_days === 0) total_days = 1;

    const daily_rate = camera.daily_rate || 50; 
    const total_amount = total_days * daily_rate;
    const deposit_amount = 100; // Standard deposit
    const final_payment_amount = total_amount;

    // 3. Submit the booking using existing infrastructure
    const bookingResult = await submitWebsiteBooking({
      camera_id: camera.id,
      camera_name: camera.name,
      start_date,
      end_date,
      total_days,
      daily_rate,
      total_amount,
      deposit_amount,
      final_payment_amount,
      customer_name,
      customer_email: customer_email || 'missing@example.com', // fallback for telegram users
      customer_phone,
      pickup_method,
      special_requests: special_requests ? `[n8n AI]: ${special_requests}` : 'Created by n8n AI Agent via Telegram',
      booking_source: 'whatsapp' // close enough
    });

    if (!bookingResult.success) {
      return NextResponse.json({
        success: false,
        error: bookingResult.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: `Booking created successfully for ${camera.name}`,
      booking_id: bookingResult.booking_id,
      confirmation_number: bookingResult.confirmation_number
    });

  } catch (error: any) {
    console.error('Error creating n8n booking:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
