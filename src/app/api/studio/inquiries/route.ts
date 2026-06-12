import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase';

interface InquiryPayload {
  serviceType: 'photography' | 'videography';
  clientName: string;
  clientPhone: string;
  clientEmail?: string;
  eventType: string;
  eventDate?: string;
  eventTime?: string;
  venue: string;
  coverageDuration?: string;
  guestCount?: string;
  shooterSetup?: string;
  finalVideoLength?: string;
  droneNeeded?: string;
  stylePreference?: string;
  specialRequests?: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as InquiryPayload;

    // Validate required fields
    if (!body.serviceType || !body.clientName || !body.clientPhone || !body.eventType || !body.venue) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const supabase = getSupabaseAdmin();

    const { data, error } = await supabase
      .from('studio_inquiries')
      .insert({
        service_type: body.serviceType,
        client_name: body.clientName,
        client_phone: body.clientPhone,
        client_email: body.clientEmail || null,
        event_type: body.eventType,
        event_date: body.eventDate || null,
        event_start_time: body.eventTime || null,
        venue: body.venue,
        coverage_duration: body.coverageDuration || null,
        guest_count: body.guestCount || null,
        shooter_setup: body.shooterSetup || null,
        final_video_length: body.finalVideoLength || null,
        drone_needed: body.droneNeeded || null,
        style_preference: body.stylePreference || null,
        special_requests: body.specialRequests || null,
        status: 'new',
        source: 'website',
      })
      .select('id')
      .single();

    if (error) {
      console.error('studio_inquiries insert error:', error);
      return NextResponse.json(
        { error: 'Failed to save inquiry', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, id: data.id });
  } catch (e: any) {
    console.error('inquiries route error:', e);
    return NextResponse.json(
      { error: 'Server error', details: e?.message ?? 'unknown' },
      { status: 500 }
    );
  }
}
