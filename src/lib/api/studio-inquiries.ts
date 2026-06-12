import { supabase, getSupabaseAdmin } from '@/lib/supabase';

export type InquiryServiceType = 'photography' | 'videography';
export type InquiryStatus = 'new' | 'contacted' | 'quoted' | 'booked' | 'lost';

export interface StudioInquiry {
  id: string;
  service_type: InquiryServiceType;
  client_name: string;
  client_phone: string;
  client_email: string | null;
  event_type: string;
  event_date: string | null;
  event_start_time: string | null;
  venue: string;
  coverage_duration: string | null;
  guest_count: string | null;
  shooter_setup: string | null;
  final_video_length: string | null;
  drone_needed: string | null;
  style_preference: string | null;
  special_requests: string | null;
  status: InquiryStatus;
  source: string;
  admin_notes: string | null;
  contacted_at: string | null;
  converted_booking_id: string | null;
  created_at: string;
  updated_at: string;
}

export async function fetchStudioInquiries(opts?: {
  serviceType?: InquiryServiceType | 'all';
  status?: InquiryStatus | 'all';
  search?: string;
  limit?: number;
}): Promise<StudioInquiry[]> {
  let query = supabase
    .from('studio_inquiries')
    .select('*')
    .order('created_at', { ascending: false });

  if (opts?.serviceType && opts.serviceType !== 'all') {
    query = query.eq('service_type', opts.serviceType);
  }
  if (opts?.status && opts.status !== 'all') {
    query = query.eq('status', opts.status);
  }
  if (opts?.limit) {
    query = query.limit(opts.limit);
  }

  const { data, error } = await query;
  if (error) {
    console.error('fetchStudioInquiries error:', error);
    return [];
  }

  let rows = (data ?? []) as StudioInquiry[];
  if (opts?.search) {
    const q = opts.search.toLowerCase();
    rows = rows.filter((r) =>
      r.client_name?.toLowerCase().includes(q) ||
      r.client_phone?.includes(q) ||
      r.event_type?.toLowerCase().includes(q) ||
      r.venue?.toLowerCase().includes(q)
    );
  }
  return rows;
}

export interface InquiryStats {
  total: number;
  newCount: number;
  contactedCount: number;
  bookedCount: number;
  conversionRate: number;
}

export async function fetchInquiryStats(): Promise<InquiryStats> {
  const { data, error } = await supabase
    .from('studio_inquiries')
    .select('status');

  if (error) {
    console.error('fetchInquiryStats error:', error);
    return { total: 0, newCount: 0, contactedCount: 0, bookedCount: 0, conversionRate: 0 };
  }

  const rows = (data ?? []) as { status: InquiryStatus }[];
  const total = rows.length;
  const newCount = rows.filter((r) => r.status === 'new').length;
  const contactedCount = rows.filter((r) => r.status === 'contacted').length;
  const bookedCount = rows.filter((r) => r.status === 'booked').length;
  const conversionRate = total > 0 ? Math.round((bookedCount / total) * 100) : 0;

  return { total, newCount, contactedCount, bookedCount, conversionRate };
}
