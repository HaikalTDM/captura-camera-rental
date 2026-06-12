import type { Booking } from '@/lib/supabase';
import type { TimelineItem, OperationalReminderItem, ReminderType, ScheduleWindow } from './types';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';

export function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-MY', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDaysLeftLabel(daysLeft: number) {
  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return 'Tomorrow';
  return `In ${daysLeft} days`;
}

export function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDayBucketTitle(dateString: string) {
  const daysLeft = getDaysFromToday(dateString);

  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return 'Tomorrow';
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-MY', { weekday: 'long' });
}

export function getDaysFromToday(dateString: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${dateString}T00:00:00`);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function hasOperationalBookingStatus(booking: Booking) {
  return (
    booking.booking_status === 'confirmed' ||
    booking.booking_status === 'approved' ||
    booking.status === 'active'
  );
}

export function isPendingApprovalBooking(booking: Booking) {
  return booking.booking_status === 'pending_approval';
}

export function getBookingPickupDate(booking: Booking) {
  if (booking.pickup_date) return booking.pickup_date;

  const startDate = new Date(booking.start_date);
  startDate.setDate(startDate.getDate() - 1);
  return formatLocalDateKey(startDate);
}

export function buildTimelineItem(
  booking: Booking,
  eventDate: string,
  eventLabel: string
): TimelineItem {
  return {
    id: booking.id,
    customerName: booking.customer?.full_name || 'Unknown Customer',
    customerPhone: booking.customer?.phone || 'No phone',
    cameraName: booking.camera?.name || booking.camera_name || 'Unknown Camera',
    amount: booking.total_amount,
    bookingStatus: booking.booking_status,
    eventDate,
    eventLabel,
    daysLeft: getDaysFromToday(eventDate),
    bookingHref: `/admin/bookings/${booking.id}`,
  };
}

export function buildOperationalReminderItem(
  booking: Booking,
  eventDate: string,
  eventLabel: string,
  reminderType: ReminderType
): OperationalReminderItem {
  const baseItem = buildTimelineItem(booking, eventDate, eventLabel);

  return {
    ...baseItem,
    reminderType,
    whatsappPhone: booking.customer?.whatsapp || booking.customer?.phone || '',
    startDate: booking.start_date,
    endDate: booking.end_date,
  };
}

export function matchesScheduleWindow(daysLeft: number, window: ScheduleWindow) {
  switch (window) {
    case 'today':
      return daysLeft === 0;
    case 'tomorrow':
      return daysLeft === 1;
    case '3days':
      return daysLeft >= 0 && daysLeft <= 2;
    default:
      return daysLeft >= 0 && daysLeft <= 7;
  }
}

export function buildReminderMessage(item: OperationalReminderItem) {
  const intro = item.reminderType === 'pickup'
    ? `your camera pickup is scheduled for ${formatDayBucketTitle(item.eventDate).toUpperCase()}.`
    : `your camera return is due ${formatDayBucketTitle(item.eventDate).toUpperCase()}.`;

  const action = item.reminderType === 'pickup'
    ? 'Please come by to collect your camera before the rental starts.'
    : 'Please return the camera on time. If you need an extension, reply here first.';

  return [
    `Hi ${item.customerName},`,
    '',
    `This is CAPTURA. Just a reminder that ${intro}`,
    '',
    'Booking details:',
    `- Camera: ${item.cameraName}`,
    `- ${item.reminderType === 'pickup' ? 'Pickup' : 'Return'} date: ${formatShortDate(item.eventDate)}`,
    `- Rental period: ${formatShortDate(item.startDate)} - ${formatShortDate(item.endDate)}`,
    '',
    action,
    '',
    'Thank you,',
    'CAPTURA Camera Rental',
  ].join('\n');
}

export function buildReminderWhatsAppUrl(item: OperationalReminderItem) {
  const phone = formatPhoneWithCountryCode(item.whatsappPhone || item.customerPhone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildReminderMessage(item))}`;
}

export function toneClasses(tone: string) {
  switch (tone) {
    case 'green':
      return {
        shell: 'from-[#1a1714] via-[#171411] to-[#1d1916] border-[#2d2823]',
        icon: 'bg-[#26211d] text-stone-300',
      };
    case 'orange':
      return {
        shell: 'from-[#1a1714] via-[#171411] to-[#211912] border-[#3a2d22]',
        icon: 'bg-[#2f241b] text-orange-300',
      };
    case 'purple':
      return {
        shell: 'from-[#1a1714] via-[#171411] to-[#1d1916] border-[#2d2823]',
        icon: 'bg-[#26211d] text-stone-300',
      };
    case 'red':
      return {
        shell: 'from-[#1a1714] via-[#171411] to-[#201514] border-[#412726]',
        icon: 'bg-[#36201f] text-rose-300',
      };
    default:
      return {
        shell: 'from-[#1a1714] via-[#171411] to-[#1d1916] border-[#2d2823]',
        icon: 'bg-[#26211d] text-stone-300',
      };
  }
}

export function bookingStatusVariant(status: string) {
  if (status === 'confirmed') return 'success';
  if (status === 'pending_approval') return 'warning';
  if (status === 'completed') return 'info';
  if (status === 'rejected' || status === 'cancelled') return 'destructive';
  return 'secondary';
}

export function getRecognizedBookingRevenue(booking: Booking) {
  const isNewPaymentSystem = booking.deposit_amount === 100;
  return isNewPaymentSystem
    ? (booking.final_payment_amount || 0)
    : (booking.total_amount - (booking.deposit_amount || 0));
}

export async function postBookingUpdate(endpoint: string, body: Record<string, unknown>) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  const data = await response.json().catch(() => null);

  if (!response.ok || !data?.success) {
    throw new Error(data?.error || 'Failed to update booking');
  }

  return data;
}

export function getBookingNextAction(booking: Booking) {
  if (isPendingApprovalBooking(booking)) {
    return {
      label: 'Approve booking',
      href: '/admin/booking-approvals',
      whatsappUrl: null as string | null,
    };
  }

  if (hasOperationalBookingStatus(booking) && !booking.equipment_picked_up) {
    const item = buildOperationalReminderItem(booking, getBookingPickupDate(booking), 'Pickup', 'pickup');
    return {
      label: `Pickup ${formatDaysLeftLabel(item.daysLeft)}`,
      href: item.bookingHref,
      whatsappUrl: buildReminderWhatsAppUrl(item),
    };
  }

  if (booking.equipment_picked_up && !booking.equipment_returned) {
    const item = buildOperationalReminderItem(booking, booking.end_date, 'Return', 'return');
    return {
      label: `Return ${formatDaysLeftLabel(item.daysLeft)}`,
      href: item.bookingHref,
      whatsappUrl: buildReminderWhatsAppUrl(item),
    };
  }

  if (!booking.final_payment_paid && booking.equipment_returned) {
    return {
      label: 'Collect final payment',
      href: `/admin/bookings/${booking.id}`,
      whatsappUrl: null as string | null,
    };
  }

  return {
    label: 'View booking',
    href: `/admin/bookings/${booking.id}`,
    whatsappUrl: null as string | null,
  };
}
