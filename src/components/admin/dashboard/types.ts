import type { Booking } from '@/lib/supabase';

export type Tone = 'blue' | 'green' | 'orange' | 'purple' | 'red';
export type DrilldownType = 'pickups' | 'returns' | 'approvals' | 'revenue';
export type ScheduleWindow = 'today' | 'tomorrow' | '3days' | 'week';

export type TimelineItem = {
  id: string;
  customerName: string;
  customerPhone: string;
  cameraName: string;
  amount: number;
  bookingStatus: string;
  eventDate: string;
  eventLabel: string;
  daysLeft: number;
  bookingHref: string;
};

export type ReminderType = 'pickup' | 'return';

export type OperationalReminderItem = TimelineItem & {
  reminderType: ReminderType;
  whatsappPhone: string;
  startDate: string;
  endDate: string;
};

export type OperationsInboxItem = TimelineItem & {
  kind: 'pickup' | 'return' | 'approval';
  whatsappUrl?: string;
};
