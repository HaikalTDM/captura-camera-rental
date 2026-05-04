'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowUpRight,
  CalendarClock,
  Camera,
  CheckCircle2,
  Clock3,
  TrendingUp,
  Wallet,
  X
} from 'lucide-react';
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts';
import toast from 'react-hot-toast';
import { useAdminData } from '@/contexts/AdminDataContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileDashboard from '@/components/admin/MobileDashboard';
import ScrapeHubButton from '@/components/admin/ScrapeHubButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Booking } from '@/lib/supabase';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';

type Tone = 'blue' | 'green' | 'orange' | 'purple' | 'red';
type DrilldownType = 'pickups' | 'returns' | 'approvals' | 'revenue';
type ScheduleWindow = 'today' | 'tomorrow' | '3days' | 'week';

type TimelineItem = {
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

type ReminderType = 'pickup' | 'return';

type OperationalReminderItem = TimelineItem & {
  reminderType: ReminderType;
  whatsappPhone: string;
  startDate: string;
  endDate: string;
};

type OperationsInboxItem = TimelineItem & {
  kind: 'pickup' | 'return' | 'approval';
  whatsappUrl?: string;
};

function toneClasses(tone: Tone) {
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

function ScheduleWindowPicker({
  value,
  onChange,
}: {
  value: ScheduleWindow;
  onChange: (value: ScheduleWindow) => void;
}) {
  const options: Array<{ value: ScheduleWindow; label: string }> = [
    { value: 'today', label: 'Today' },
    { value: 'tomorrow', label: 'Tomorrow' },
    { value: '3days', label: '3 Days' },
    { value: 'week', label: 'This Week' },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === option.value
              ? 'border-[#c96b2c] bg-[#2b1d14] text-orange-300'
              : 'border-[#332d27] bg-[#191715] text-stone-400 hover:border-[#4a4036] hover:text-stone-100'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function OperationsInboxPanel({
  items,
  selectedWindow,
  onWindowChange,
}: {
  items: OperationsInboxItem[];
  selectedWindow: ScheduleWindow;
  onWindowChange: (value: ScheduleWindow) => void;
}) {
  return (
    <Card className="rounded-[26px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle className="text-lg text-stone-50">Operations Inbox</CardTitle>
            <CardDescription className="text-stone-400">One filtered list for pickups, returns, and approvals. Fewer places to check.</CardDescription>
          </div>
          <ScheduleWindowPicker value={selectedWindow} onChange={onWindowChange} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length > 0 ? items.map((item) => (
          <div key={`${item.kind}-${item.id}`} className="rounded-2xl border border-[#2a2521] bg-[#1c1916] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-stone-100">{item.customerName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] ${
                    item.kind === 'pickup'
                      ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                      : item.kind === 'return'
                        ? 'border border-orange-500/20 bg-orange-500/10 text-orange-300'
                        : 'border border-violet-500/20 bg-violet-500/10 text-violet-300'
                  }`}>
                    {item.kind}
                  </span>
                  <span className="rounded-full border border-[#3a3129] bg-[#24201c] px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] text-orange-300">
                    {formatDaysLeftLabel(item.daysLeft)}
                  </span>
                </div>
                <p className="mt-2 text-sm text-stone-300">{item.cameraName}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                  <span>{item.eventLabel}: {formatShortDate(item.eventDate)}</span>
                  <span>{item.customerPhone}</span>
                  <span>RM{item.amount}</span>
                </div>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                {item.whatsappUrl && (
                  <button
                    type="button"
                    onClick={() => window.open(item.whatsappUrl, '_blank', 'noopener,noreferrer')}
                    className="rounded-xl border border-[#43372d] bg-[#26211c] px-3 py-2 text-xs font-semibold text-stone-100 transition-colors hover:border-[#25d366] hover:text-emerald-300"
                  >
                    WhatsApp
                  </button>
                )}
                <Link
                  href={item.bookingHref}
                  className="rounded-xl border border-[#43372d] bg-[#26211c] px-3 py-2 text-xs font-semibold text-stone-100 transition-colors hover:border-[#c96b2c] hover:text-orange-300"
                >
                  Open
                </Link>
              </div>
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-[#2f2a25] bg-[#171513] py-10 text-center text-sm text-stone-500">
            Nothing in this filter.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function CommandCenterAction({
  title,
  count,
  detail,
  tone = 'blue',
  href,
  onClick,
}: {
  title: string;
  count: string | number;
  detail: string;
  tone?: Tone;
  href?: string;
  onClick?: () => void;
}) {
  const palette = toneClasses(tone);

  const content = (
    <div className={`rounded-2xl border bg-gradient-to-br p-4 text-left shadow-[0_18px_40px_rgba(0,0,0,0.18)] transition-all hover:-translate-y-0.5 hover:border-[#4c4036] ${palette.shell}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">{title}</p>
          <p className="mt-3 text-3xl font-bold tracking-tight text-stone-50">{count}</p>
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${palette.icon}`}>
          <ArrowUpRight className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-3 text-sm text-stone-400">{detail}</p>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return (
    <button type="button" onClick={onClick} className="w-full">
      {content}
    </button>
  );
}

function CommandShortcut({
  title,
  detail,
  href,
}: {
  title: string;
  detail: string;
  href: string;
}) {
  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        className="flex items-center justify-between rounded-2xl border border-[#2c2723] bg-[#191715] px-4 py-4 transition-colors hover:border-[#c96b2c]"
      >
        <div>
          <p className="font-semibold text-stone-100">{title}</p>
          <p className="mt-1 text-sm text-stone-400">{detail}</p>
        </div>
        <ArrowUpRight className="h-4 w-4 text-stone-500" />
      </motion.div>
    </Link>
  );
}

function formatDayBucketTitle(dateString: string) {
  const daysLeft = getDaysFromToday(dateString);

  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return 'Tomorrow';
  return new Date(`${dateString}T00:00:00`).toLocaleDateString('en-MY', { weekday: 'long' });
}

function buildReminderMessage(item: OperationalReminderItem) {
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

function buildReminderWhatsAppUrl(item: OperationalReminderItem) {
  const phone = formatPhoneWithCountryCode(item.whatsappPhone || item.customerPhone);
  return `https://wa.me/${phone}?text=${encodeURIComponent(buildReminderMessage(item))}`;
}

function OperationalWindowPanel({
  items,
}: {
  items: OperationalReminderItem[];
}) {
  const nextThreeDays = Array.from({ length: 3 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() + index);
    return formatLocalDateKey(date);
  });

  const grouped = nextThreeDays.map((date) => ({
    date,
    items: items.filter((item) => item.eventDate === date),
  }));

  const totalItems = items.length;

  return (
    <Card className="rounded-[28px] border border-[#2c2723] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <CardHeader className="border-b border-[#24211d] pb-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <CardTitle className="text-lg text-stone-50">Next 3 Days Operations</CardTitle>
            <CardDescription className="mt-1 text-stone-400">
              See who will pick up or return which camera without opening another page. Click any row to open WhatsApp.
            </CardDescription>
          </div>
          <span className="w-fit rounded-full border border-[#3a3129] bg-[#1f1c18] px-3 py-1 text-xs font-medium text-orange-300">
            {totalItems} scheduled
          </span>
        </div>
      </CardHeader>
      <CardContent className="grid gap-4 p-5 xl:grid-cols-3">
        {grouped.map((group) => (
          <div key={group.date} className="rounded-[24px] border border-[#2a2521] bg-[#1b1815] p-4">
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-stone-100">{formatDayBucketTitle(group.date)}</p>
                <p className="text-xs text-stone-500">{formatShortDate(group.date)}</p>
              </div>
              <Badge variant="secondary" className="text-xs">
                {group.items.length}
              </Badge>
            </div>

            {group.items.length > 0 ? (
              <div className="space-y-3">
                {group.items.map((item) => (
                  <div
                    key={`${group.date}-${item.reminderType}-${item.id}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => window.open(buildReminderWhatsAppUrl(item), '_blank', 'noopener,noreferrer')}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        window.open(buildReminderWhatsAppUrl(item), '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="rounded-2xl border border-[#312b25] bg-[#201c18] p-4 transition-colors hover:border-[#c96b2c] hover:bg-[#24201c]"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={(event) => {
                              event.stopPropagation();
                              window.open(buildReminderWhatsAppUrl(item), '_blank', 'noopener,noreferrer');
                            }}
                            className="truncate text-left font-semibold text-stone-100 hover:text-orange-300"
                          >
                            {item.customerName}
                          </button>
                          <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-[0.16em] ${
                            item.reminderType === 'pickup'
                              ? 'border border-emerald-500/20 bg-emerald-500/10 text-emerald-300'
                              : 'border border-orange-500/20 bg-orange-500/10 text-orange-300'
                          }`}>
                            {item.reminderType}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-stone-300">{item.cameraName}</p>
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                          <span>{item.customerPhone}</span>
                          <span>{item.eventLabel}: {formatShortDate(item.eventDate)}</span>
                        </div>
                      </div>
                      <Link
                        href={item.bookingHref}
                        onClick={(event) => event.stopPropagation()}
                        className="shrink-0 rounded-xl border border-[#43372d] bg-[#26211c] px-3 py-2 text-xs font-semibold text-stone-100 transition-colors hover:border-[#c96b2c] hover:text-orange-300"
                      >
                        Booking
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-[#2f2a25] bg-[#171513] py-8 text-center text-sm text-stone-500">
                Nothing scheduled.
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function RevenueByCameraPanel({
  monthLabel,
  totalRevenue,
  cameras,
}: {
  monthLabel: string;
  totalRevenue: number;
  cameras: Array<{ name: string; revenue: number; bookings: number }>;
}) {
  return (
    <Card className="rounded-[28px] border border-[#2c2723] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <CardHeader className="border-b border-[#24211d] pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-stone-50">Camera Revenue</CardTitle>
            <CardDescription className="mt-1 text-stone-400">Monthly breakdown by camera for {monthLabel}.</CardDescription>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-orange-300">RM{totalRevenue.toFixed(0)}</p>
            <p className="text-xs uppercase tracking-[0.18em] text-stone-500">This month</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 p-5">
        {cameras.length > 0 ? cameras.map((camera, index) => {
          const width = totalRevenue > 0 ? Math.max((camera.revenue / totalRevenue) * 100, camera.revenue > 0 ? 6 : 0) : 0;

          return (
            <div key={`camera-revenue-${camera.name}`} className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="truncate font-medium text-stone-100">{camera.name}</p>
                  <p className="text-xs text-stone-500">{camera.bookings} booking{camera.bookings !== 1 ? 's' : ''}</p>
                </div>
                <p className={`shrink-0 text-sm font-semibold ${index === 0 ? 'text-orange-300' : 'text-stone-300'}`}>
                  RM{camera.revenue.toFixed(0)}
                </p>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-[#24201c]">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${width}%` }}
                  transition={{ delay: 0.05 * index, duration: 0.35 }}
                  className="h-full rounded-full bg-gradient-to-r from-[#c96b2c] to-[#f59e0b]"
                />
              </div>
            </div>
          );
        }) : (
          <div className="rounded-2xl border border-dashed border-[#2f2a25] bg-[#171513] py-10 text-center text-sm text-stone-500">
            No monthly revenue data yet.
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function bookingStatusVariant(status: string) {
  if (status === 'confirmed') return 'success';
  if (status === 'pending_approval') return 'warning';
  if (status === 'completed') return 'info';
  if (status === 'rejected' || status === 'cancelled') return 'destructive';
  return 'secondary';
}

function formatShortDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-MY', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatDaysLeftLabel(daysLeft: number) {
  if (daysLeft === 0) return 'Today';
  if (daysLeft === 1) return 'Tomorrow';
  return `In ${daysLeft} days`;
}

function formatLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function hasOperationalBookingStatus(booking: Booking) {
  return (
    booking.booking_status === 'confirmed' ||
    booking.booking_status === 'approved' ||
    booking.status === 'active'
  );
}

function isPendingApprovalBooking(booking: Booking) {
  return booking.booking_status === 'pending_approval';
}

function getBookingPickupDate(booking: Booking) {
  if (booking.pickup_date) return booking.pickup_date;

  const startDate = new Date(booking.start_date);
  startDate.setDate(startDate.getDate() - 1);
  return formatLocalDateKey(startDate);
}

function getDaysFromToday(dateString: string) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(`${dateString}T00:00:00`);
  target.setHours(0, 0, 0, 0);

  return Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function buildTimelineItem(
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

function buildOperationalReminderItem(
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

function matchesScheduleWindow(daysLeft: number, window: ScheduleWindow) {
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

function getBookingNextAction(booking: Booking) {
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

function DrilldownModal({
  open,
  title,
  description,
  items,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  items: TimelineItem[];
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  const groupedItems = useMemo(() => {
    return items.reduce<Record<string, TimelineItem[]>>((acc, item) => {
      if (!acc[item.eventDate]) {
        acc[item.eventDate] = [];
      }
      acc[item.eventDate].push(item);
      return acc;
    }, {});
  }, [items]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm"
            aria-label="Close dialog"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(820px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2"
          >
            <Card className="max-h-[85vh] overflow-hidden rounded-[28px] border border-[#2d2823] bg-[#151311] shadow-2xl">
              <CardHeader className="border-b border-[#26211c] bg-[#191715] pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl text-stone-50">
                      <CalendarClock className="h-5 w-5 text-orange-600" />
                      {title}
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm text-stone-400">{description}</CardDescription>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-[#332c26] bg-[#211d19] p-2 text-stone-400 transition-colors hover:text-stone-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="max-h-[calc(85vh-96px)] overflow-y-auto space-y-5 p-6">
                {items.length > 0 ? Object.entries(groupedItems)
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, dateItems]) => (
                    <div key={date} className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-semibold text-stone-100">{formatShortDate(date)}</p>
                          <p className="text-sm text-stone-500">{formatDaysLeftLabel(dateItems[0].daysLeft)}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {dateItems.length} booking{dateItems.length !== 1 ? 's' : ''}
                        </Badge>
                      </div>

                      <div className="space-y-3">
                        {dateItems.map((item) => (
                          <div key={item.id} className="rounded-2xl border border-[#2b2621] bg-[#1c1916] p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-stone-100">{item.customerName}</p>
                                <p className="mt-1 truncate text-sm text-stone-400">{item.cameraName}</p>
                                <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-stone-500">
                                  <span>{item.eventLabel}: {formatShortDate(item.eventDate)}</span>
                                  <span>{item.customerPhone}</span>
                                  <span>RM{item.amount}</span>
                                </div>
                              </div>

                              <div className="flex shrink-0 items-center gap-2">
                                <Badge variant={bookingStatusVariant(item.bookingStatus) as never} className="text-xs">
                                  {item.bookingStatus === 'pending_approval' ? 'Pending' : item.bookingStatus}
                                </Badge>
                                <Link
                                  href={item.bookingHref}
                                  className="rounded-xl border border-[#43372d] bg-[#26211c] px-3 py-2 text-xs font-semibold text-stone-100 hover:border-[#c96b2c] hover:text-orange-300"
                                >
                                  View
                                </Link>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )) : (
                    <div className="rounded-2xl border border-dashed border-[#302a25] bg-[#171513] py-10 text-center text-sm text-stone-500">
                      No bookings in the next 7 days.
                    </div>
                  )}
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function RevenueDrilldownModal({
  open,
  onClose,
  monthlyRevenue,
  totalRevenue,
  monthlyPaidBookings,
  lifetimePaidBookings,
  averagePaidBookingValue,
  monthlyCameraRevenue,
  lifetimeCameraRevenue,
}: {
  open: boolean;
  onClose: () => void;
  monthlyRevenue: number;
  totalRevenue: number;
  monthlyPaidBookings: number;
  lifetimePaidBookings: number;
  averagePaidBookingValue: number;
  monthlyCameraRevenue: Array<{ name: string; revenue: number; bookings: number }>;
  lifetimeCameraRevenue: Array<{ name: string; revenue: number; bookings: number }>;
}) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.body.style.overflow = 'hidden';
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.button
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-sm"
            aria-label="Close revenue dialog"
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="fixed left-1/2 top-1/2 z-50 w-[min(980px,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2"
          >
            <Card className="max-h-[88vh] overflow-hidden rounded-[28px] border border-[#2d2823] bg-[#151311] shadow-2xl">
              <CardHeader className="border-b border-[#26211c] bg-[#191715] pb-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <CardTitle className="flex items-center gap-2 text-xl text-stone-50">
                      <Wallet className="h-5 w-5 text-orange-600" />
                      Revenue Details
                    </CardTitle>
                    <CardDescription className="mt-2 text-sm text-stone-400">
                      Monthly and lifetime revenue performance, including camera-by-camera contribution.
                    </CardDescription>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full border border-[#332c26] bg-[#211d19] p-2 text-stone-400 transition-colors hover:text-stone-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </CardHeader>

              <CardContent className="max-h-[calc(88vh-96px)] overflow-y-auto space-y-6 p-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                  <div className="rounded-3xl border border-[#2d2823] bg-[#1a1714] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                        <TrendingUp className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">This Month</p>
                        <p className="text-2xl font-bold text-stone-50">RM{monthlyRevenue.toFixed(0)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-stone-400">{monthlyPaidBookings} fully paid booking{monthlyPaidBookings !== 1 ? 's' : ''} this month</p>
                  </div>

                  <div className="rounded-3xl border border-[#2d2823] bg-[#1a1714] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-200 text-stone-700">
                        <Wallet className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Lifetime Total</p>
                        <p className="text-2xl font-bold text-stone-50">RM{totalRevenue.toFixed(0)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-stone-400">{lifetimePaidBookings} fully paid booking{lifetimePaidBookings !== 1 ? 's' : ''} recorded</p>
                  </div>

                  <div className="rounded-3xl border border-[#2d2823] bg-[#1a1714] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-stone-200 text-stone-700">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Average Paid Booking</p>
                        <p className="text-2xl font-bold text-stone-50">RM{averagePaidBookingValue.toFixed(0)}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-stone-400">Average recognized revenue per completed payment</p>
                  </div>

                  <div className="rounded-3xl border border-[#3a2d22] bg-[#1e1712] p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                        <Camera className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Best Monthly Camera</p>
                        <p className="text-lg font-bold text-stone-50">{monthlyCameraRevenue[0]?.name || 'No data yet'}</p>
                      </div>
                    </div>
                    <p className="mt-3 text-sm text-stone-400">
                      {monthlyCameraRevenue[0] ? `RM${monthlyCameraRevenue[0].revenue.toFixed(0)} from ${monthlyCameraRevenue[0].bookings} booking${monthlyCameraRevenue[0].bookings !== 1 ? 's' : ''}` : 'No fully paid camera revenue this month'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-6 xl:grid-cols-2">
                  <Card className="rounded-[24px] border border-[#2d2823] bg-[#171513] shadow-none">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-stone-50">Monthly Camera Revenue</CardTitle>
                      <CardDescription className="text-stone-400">How each camera contributed to this month&apos;s recognized revenue.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {monthlyCameraRevenue.length > 0 ? monthlyCameraRevenue.map((camera) => {
                        const width = monthlyRevenue > 0 ? Math.max((camera.revenue / monthlyRevenue) * 100, camera.revenue > 0 ? 8 : 0) : 0;

                        return (
                          <div key={`monthly-${camera.name}`} className="space-y-2">
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <p className="truncate font-semibold text-slate-900">{camera.name}</p>
                                <p className="text-xs text-stone-500">{camera.bookings} booking{camera.bookings !== 1 ? 's' : ''}</p>
                              </div>
                              <p className="shrink-0 text-sm font-semibold text-stone-100">RM{camera.revenue.toFixed(0)}</p>
                            </div>
                            <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-orange-500" style={{ width: `${width}%` }} />
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="rounded-2xl border border-dashed border-[#302a25] bg-[#171513] py-10 text-center text-sm text-stone-500">
                          No monthly revenue data yet.
                        </div>
                      )}
                    </CardContent>
                  </Card>

                  <Card className="rounded-[24px] border border-[#2d2823] bg-[#171513] shadow-none">
                    <CardHeader className="pb-4">
                      <CardTitle className="text-lg text-stone-50">Top Lifetime Cameras</CardTitle>
                      <CardDescription className="text-stone-400">The cameras that have generated the most recognized revenue overall.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {lifetimeCameraRevenue.length > 0 ? lifetimeCameraRevenue.slice(0, 8).map((camera, index) => {
                        const width = totalRevenue > 0 ? Math.max((camera.revenue / totalRevenue) * 100, camera.revenue > 0 ? 6 : 0) : 0;

                        return (
                          <div key={`lifetime-${camera.name}`} className="rounded-2xl border border-[#2b2621] bg-[#1c1916] p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div className="min-w-0">
                                <p className="font-semibold text-slate-900">{index + 1}. {camera.name}</p>
                                <p className="mt-1 text-xs text-stone-500">{camera.bookings} paid booking{camera.bookings !== 1 ? 's' : ''}</p>
                              </div>
                              <p className="shrink-0 text-sm font-semibold text-stone-100">RM{camera.revenue.toFixed(0)}</p>
                            </div>
                            <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
                              <div className="h-full rounded-full bg-stone-700" style={{ width: `${width}%` }} />
                            </div>
                          </div>
                        );
                      }) : (
                        <div className="rounded-2xl border border-dashed border-[#302a25] bg-[#171513] py-10 text-center text-sm text-stone-500">
                          No lifetime revenue data yet.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

function getRecognizedBookingRevenue(booking: Booking) {
  const isNewPaymentSystem = booking.deposit_amount === 100;
  return isNewPaymentSystem
    ? (booking.final_payment_amount || 0)
    : (booking.total_amount - (booking.deposit_amount || 0));
}

async function postBookingUpdate(endpoint: string, body: Record<string, unknown>) {
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

export default function AdminDashboard() {
  const { bookings, cameras, mutate } = useAdminData();
  const isMobile = useIsMobile(768);
  const [selectedDrilldown, setSelectedDrilldown] = useState<DrilldownType | null>(null);
  const [scheduleWindow, setScheduleWindow] = useState<ScheduleWindow>('3days');
  const [nextMoveActionId, setNextMoveActionId] = useState<string | null>(null);

  const dashboardData = useMemo(() => {
    const today = formatLocalDateKey(new Date());
    const now = new Date();

    const todayPickups = bookings.filter((booking) => {
      if (booking.pickup_date) {
        return booking.pickup_date === today &&
          hasOperationalBookingStatus(booking) &&
          !booking.equipment_picked_up;
      }

      const startDate = new Date(booking.start_date);
      const pickupDate = new Date(startDate);
      pickupDate.setDate(pickupDate.getDate() - 1);

      return formatLocalDateKey(pickupDate) === today &&
        hasOperationalBookingStatus(booking) &&
        !booking.equipment_picked_up;
    });

    const activeRentals = bookings.filter((booking) =>
      hasOperationalBookingStatus(booking) &&
      booking.equipment_picked_up &&
      !booking.equipment_returned
    );

    const todayReturns = bookings.filter((booking) =>
      booking.end_date === today &&
      booking.equipment_picked_up &&
      !booking.equipment_returned
    );

    const recentBookings = bookings.slice(0, 5);
    const pendingApprovals = bookings.filter((booking) => isPendingApprovalBooking(booking));

    const overduePayments = bookings.filter((booking) =>
      !booking.final_payment_paid &&
      new Date(booking.end_date) < now &&
      (booking.booking_status === 'completed' || booking.status === 'completed')
    );

    const fullyPaidBookings = bookings.filter((booking) => booking.deposit_paid && booking.final_payment_paid);

    const totalRevenue = fullyPaidBookings.reduce((sum, booking) => sum + getRecognizedBookingRevenue(booking), 0);

    const monthlyRevenue = fullyPaidBookings
      .filter((booking) =>
        booking.final_payment_paid_date &&
        new Date(booking.final_payment_paid_date).getMonth() === now.getMonth() &&
        new Date(booking.final_payment_paid_date).getFullYear() === now.getFullYear()
      )
      .reduce((sum, booking) => sum + getRecognizedBookingRevenue(booking), 0);

    const paidThisMonth = fullyPaidBookings.filter((booking) =>
      booking.final_payment_paid_date &&
      new Date(booking.final_payment_paid_date).getMonth() === now.getMonth() &&
      new Date(booking.final_payment_paid_date).getFullYear() === now.getFullYear()
    );

    const availableCameras = cameras.filter((camera) => camera.is_available);
    const attentionCount = pendingApprovals.length + overduePayments.length + todayReturns.length;
    const fleetUtilization = cameras.length > 0 ? Math.round((activeRentals.length / cameras.length) * 100) : 0;

    return {
      todayPickups,
      activeRentals,
      todayReturns,
      recentBookings,
      pendingApprovals,
      overduePayments,
      totalRevenue,
      monthlyRevenue,
      paidThisMonth,
      availableCameras,
      attentionCount,
      fleetUtilization,
    };
  }, [bookings, cameras]);

  const timelineData = useMemo(() => {
    const sortByDate = (a: TimelineItem, b: TimelineItem) => {
      if (a.eventDate === b.eventDate) {
        return a.customerName.localeCompare(b.customerName);
      }

      return a.eventDate.localeCompare(b.eventDate);
    };

    const pickups = bookings
      .filter((booking) =>
        hasOperationalBookingStatus(booking) &&
        !booking.equipment_picked_up
      )
      .map((booking) => buildTimelineItem(booking, getBookingPickupDate(booking), 'Pickup'))
      .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 7)
      .sort(sortByDate);

    const returns = bookings
      .filter((booking) =>
        booking.equipment_picked_up &&
        !booking.equipment_returned
      )
      .map((booking) => buildTimelineItem(booking, booking.end_date, 'Return'))
      .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 7)
      .sort(sortByDate);

    const approvals = bookings
      .filter((booking) => isPendingApprovalBooking(booking))
      .map((booking) => buildTimelineItem(booking, booking.start_date, 'Rental Start'))
      .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 7)
      .sort(sortByDate);

    return {
      pickups,
      returns,
      approvals,
    };
  }, [bookings]);

  const nextThreeDayOperations = useMemo(() => {
    const sortByDate = (a: OperationalReminderItem, b: OperationalReminderItem) => {
      if (a.eventDate !== b.eventDate) {
        return a.eventDate.localeCompare(b.eventDate);
      }

      if (a.reminderType !== b.reminderType) {
        return a.reminderType === 'pickup' ? -1 : 1;
      }

      return a.customerName.localeCompare(b.customerName);
    };

    const pickups = bookings
      .filter((booking) =>
        hasOperationalBookingStatus(booking) &&
        !booking.equipment_picked_up
      )
      .map((booking) => buildOperationalReminderItem(booking, getBookingPickupDate(booking), 'Pickup', 'pickup'))
      .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 2);

    const returns = bookings
      .filter((booking) =>
        booking.equipment_picked_up &&
        !booking.equipment_returned
      )
      .map((booking) => buildOperationalReminderItem(booking, booking.end_date, 'Return', 'return'))
      .filter((item) => item.daysLeft >= 0 && item.daysLeft <= 2);

    return [...pickups, ...returns].sort(sortByDate);
  }, [bookings]);

  const filteredTimelineData = useMemo(() => {
    return {
      pickups: timelineData.pickups.filter((item) => matchesScheduleWindow(item.daysLeft, scheduleWindow)),
      returns: timelineData.returns.filter((item) => matchesScheduleWindow(item.daysLeft, scheduleWindow)),
      approvals: timelineData.approvals.filter((item) => matchesScheduleWindow(item.daysLeft, scheduleWindow)),
    };
  }, [scheduleWindow, timelineData]);

  const operationsInboxItems = useMemo(() => {
    const pickups = filteredTimelineData.pickups.map((item) => ({
      ...item,
      kind: 'pickup' as const,
      whatsappUrl: (() => {
        const booking = bookings.find((entry) => entry.id === item.id);
        return booking
          ? buildReminderWhatsAppUrl(buildOperationalReminderItem(booking, item.eventDate, item.eventLabel, 'pickup'))
          : undefined;
      })(),
    }));

    const returns = filteredTimelineData.returns.map((item) => ({
      ...item,
      kind: 'return' as const,
      whatsappUrl: (() => {
        const booking = bookings.find((entry) => entry.id === item.id);
        return booking
          ? buildReminderWhatsAppUrl(buildOperationalReminderItem(booking, item.eventDate, item.eventLabel, 'return'))
          : undefined;
      })(),
    }));

    const approvals = filteredTimelineData.approvals.map((item) => ({
      ...item,
      kind: 'approval' as const,
    }));

    return [...pickups, ...returns, ...approvals].sort((a, b) => {
      if (a.eventDate !== b.eventDate) return a.eventDate.localeCompare(b.eventDate);
      return a.customerName.localeCompare(b.customerName);
    });
  }, [bookings, filteredTimelineData]);

  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - index));
      return formatLocalDateKey(date);
    });

    return last7Days.map((date) => {
      const dayBookings = bookings.filter((booking) => booking.created_at?.split('T')[0] === date);
      const dayRevenue = dayBookings
        .filter((booking) => booking.deposit_paid && booking.final_payment_paid)
        .reduce((sum, booking) => sum + (booking.final_payment_amount || booking.total_amount), 0);

      return {
        date: new Date(date).toLocaleDateString('en-MY', { weekday: 'short' }),
        bookings: dayBookings.length,
        revenue: dayRevenue,
      };
    });
  }, [bookings]);

  const revenueInsights = useMemo(() => {
    const now = new Date();
    const paidBookings = bookings.filter((booking) => booking.deposit_paid && booking.final_payment_paid);

    const monthlyPaidBookings = paidBookings.filter((booking) =>
      booking.final_payment_paid_date &&
      new Date(booking.final_payment_paid_date).getMonth() === now.getMonth() &&
      new Date(booking.final_payment_paid_date).getFullYear() === now.getFullYear()
    );

    const buildCameraRevenue = (sourceBookings: Booking[]) => {
      const revenueMap = new Map<string, { name: string; revenue: number; bookings: number }>();

      cameras.forEach((camera) => {
        revenueMap.set(camera.id, {
          name: camera.name,
          revenue: 0,
          bookings: 0,
        });
      });

      sourceBookings.forEach((booking) => {
        const cameraId = booking.camera?.id || booking.camera_id;
        const fallbackName = booking.camera?.name || booking.camera_name || 'Unknown Camera';
        const revenue = getRecognizedBookingRevenue(booking);

        if (cameraId && revenueMap.has(cameraId)) {
          const existing = revenueMap.get(cameraId);

          if (existing) {
            existing.revenue += revenue;
            existing.bookings += 1;
          }

          return;
        }

        const fallbackKey = `fallback-${fallbackName}`;
        const existingFallback = revenueMap.get(fallbackKey);

        if (existingFallback) {
          existingFallback.revenue += revenue;
          existingFallback.bookings += 1;
        } else {
          revenueMap.set(fallbackKey, {
            name: fallbackName,
            revenue,
            bookings: 1,
          });
        }
      });

      return Array.from(revenueMap.values())
        .filter((camera) => camera.revenue > 0)
        .sort((a, b) => b.revenue - a.revenue);
    };

    return {
      monthlyPaidBookings: monthlyPaidBookings.length,
      lifetimePaidBookings: paidBookings.length,
      averagePaidBookingValue: paidBookings.length > 0
        ? paidBookings.reduce((sum, booking) => sum + getRecognizedBookingRevenue(booking), 0) / paidBookings.length
        : 0,
      monthlyCameraRevenue: buildCameraRevenue(monthlyPaidBookings),
      lifetimeCameraRevenue: buildCameraRevenue(paidBookings),
    };
  }, [bookings, cameras]);

  if (isMobile) {
    return (
      <div className="p-4">
        <MobileDashboard bookings={bookings} cameras={cameras} onMutate={mutate} />
      </div>
    );
  }

  const {
    todayPickups,
    activeRentals,
    todayReturns,
    recentBookings,
    pendingApprovals,
    overduePayments,
    totalRevenue,
    monthlyRevenue,
    paidThisMonth,
    availableCameras,
    attentionCount,
    fleetUtilization,
  } = dashboardData;

  const todayLabel = new Date().toLocaleDateString('en-MY', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });

  const currentMonthLabel = new Date().toLocaleDateString('en-MY', {
    month: 'long',
    year: 'numeric',
  });

  const drilldownConfig: Record<Exclude<DrilldownType, 'revenue'>, { title: string; description: string; items: TimelineItem[] }> = {
    pickups: {
      title: "Today's Pickups",
      description: "Today's pickup queue plus all confirmed pickups scheduled over the next 7 days.",
      items: timelineData.pickups,
    },
    returns: {
      title: "Today's Returns",
      description: "Returns due today and all active rentals expected back within the next 7 days.",
      items: timelineData.returns,
    },
    approvals: {
      title: 'Pending Approvals',
      description: 'Requests still waiting for approval, grouped by rental start date over the next 7 days.',
      items: timelineData.approvals,
    },
  };

  const activeDrilldown = selectedDrilldown && selectedDrilldown !== 'revenue'
    ? drilldownConfig[selectedDrilldown]
    : null;
  const nextOperationalItem = nextThreeDayOperations[0] || null;
  const threeDayPickupCount = nextThreeDayOperations.filter((item) => item.reminderType === 'pickup').length;
  const threeDayReturnCount = nextThreeDayOperations.filter((item) => item.reminderType === 'return').length;

  const handleNextMoveAction = async (item: OperationalReminderItem) => {
    const booking = bookings.find((entry) => entry.id === item.id);

    if (!booking) {
      toast.error('Booking not found');
      return;
    }

    const toastId = toast.loading(`Updating ${item.reminderType}...`);
    const timestamp = new Date().toISOString();

    setNextMoveActionId(item.id);

    try {
      const updates: Promise<unknown>[] = [];

      if (!booking.deposit_paid) {
        updates.push(
          postBookingUpdate(`/api/bookings/${booking.id}/deposit`, {
            deposit_paid: true,
            deposit_paid_date: timestamp,
          })
        );
      }

      if (!booking.final_payment_paid && booking.final_payment_amount > 0) {
        updates.push(
          postBookingUpdate(`/api/bookings/${booking.id}/final-payment`, {
            final_payment_paid: true,
            final_payment_paid_date: timestamp,
          })
        );
      }

      if (item.reminderType === 'pickup') {
        if (!booking.equipment_picked_up) {
          updates.push(
            postBookingUpdate(`/api/bookings/${booking.id}/pickup-status`, {
              equipment_picked_up: true,
              equipment_pickup_notes: 'Marked from dashboard command center',
              equipment_condition_pickup: null,
            })
          );
        }

        await Promise.all(updates);
        toast.success('Pickup marked complete', { id: toastId });
      } else {
        if (!booking.deposit_refunded) {
          updates.push(
            postBookingUpdate(`/api/bookings/${booking.id}/deposit-refund`, {
              deposit_refunded: true,
              deposit_refund_date: timestamp,
              deposit_refund_notes: 'Processed from dashboard command center',
              deposit_refund_amount: booking.deposit_amount || booking.deposit_refund_amount || 100,
            })
          );
        } else {
          if (!booking.equipment_picked_up) {
            updates.push(
              postBookingUpdate(`/api/bookings/${booking.id}/pickup-status`, {
                equipment_picked_up: true,
                equipment_pickup_notes: 'Marked from dashboard command center',
                equipment_condition_pickup: null,
              })
            );
          }

          if (!booking.equipment_returned) {
            updates.push(
              postBookingUpdate(`/api/bookings/${booking.id}/return-status`, {
                equipment_returned: true,
                equipment_return_notes: 'Marked from dashboard command center',
                equipment_condition_return: null,
              })
            );
          }
        }

        await Promise.all(updates);
        toast.success('Return marked complete', { id: toastId });
      }

      await mutate();
    } catch (error) {
      console.error('Failed next move action:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update booking', { id: toastId });
    } finally {
      setNextMoveActionId(null);
    }
  };

  return (
    <div className="space-y-6 rounded-[36px] border border-[#2a2622] bg-[#11100f] p-6 text-stone-100 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
      <div>
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-[28px] border border-[#2d2823] bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.16),_transparent_32%),linear-gradient(135deg,#191614_0%,#141210_55%,#1b1714_100%)] p-7 shadow-[0_24px_60px_rgba(0,0,0,0.28)]"
        >
          <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
          <div className="relative space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#3a332c] bg-[#1a1714] px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-stone-300">
                  <Clock3 className="h-3.5 w-3.5" />
                  Command Center
                </div>
                <div>
                  <h1 className="text-3xl font-bold tracking-tight text-stone-50">Dashboard Command Center</h1>
                  <p className="mt-2 text-sm text-stone-400">{todayLabel}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <ScrapeHubButton />
              </div>
            </div>

            <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_360px]">
              <div className="rounded-3xl border border-[#2f2a25] bg-[#1b1815] p-5 backdrop-blur">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Operations Now</p>
                    <p className="mt-2 text-sm text-stone-400">Direct access to the queues that actually move the day.</p>
                  </div>
                  <div className="rounded-full border border-[#3a332c] bg-[#1f1c18] px-3 py-1 text-xs font-semibold text-orange-300">
                    {attentionCount} attention items
                  </div>
                </div>

                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <CommandCenterAction
                    title="Today Pickups"
                    count={todayPickups.length}
                    detail="Open pickup queue and contact customers fast"
                    tone="green"
                    onClick={() => setSelectedDrilldown('pickups')}
                  />
                  <CommandCenterAction
                    title="Today Returns"
                    count={todayReturns.length}
                    detail="See who must return gear before day ends"
                    tone="orange"
                    onClick={() => setSelectedDrilldown('returns')}
                  />
                  <CommandCenterAction
                    title="Pending Approvals"
                    count={pendingApprovals.length}
                    detail="Approve bookings so customers can move forward"
                    tone="purple"
                    onClick={() => setSelectedDrilldown('approvals')}
                  />
                  <CommandCenterAction
                    title="Payment Follow-Ups"
                    count={overduePayments.length}
                    detail="Late balances still waiting to be collected"
                    tone="red"
                    href="/admin/reports"
                  />
                </div>

                <div className="mt-4 rounded-3xl border border-[#2f2a25] bg-[#171513] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Next Move</p>
                      {nextOperationalItem ? (
                        <>
                          <p className="mt-2 font-semibold text-stone-100">
                            {nextOperationalItem.customerName} {nextOperationalItem.reminderType === 'pickup' ? 'collects' : 'returns'} {nextOperationalItem.cameraName}
                          </p>
                          <p className="mt-1 text-sm text-stone-400">
                            {formatDayBucketTitle(nextOperationalItem.eventDate)} • {formatShortDate(nextOperationalItem.eventDate)}
                          </p>
                        </>
                      ) : (
                        <p className="mt-2 text-sm text-stone-400">No pickup or return scheduled in the next 3 days.</p>
                      )}
                    </div>
                    {nextOperationalItem && (
                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleNextMoveAction(nextOperationalItem)}
                          disabled={nextMoveActionId === nextOperationalItem.id}
                          className="rounded-2xl border border-[#5d3b20] bg-[#2f1d12] px-4 py-2 text-sm font-semibold text-orange-200 transition-colors hover:border-[#d97706] hover:text-orange-100 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {nextMoveActionId === nextOperationalItem.id
                            ? 'Updating...'
                            : nextOperationalItem.reminderType === 'pickup'
                              ? 'Picked Up'
                              : 'Return'}
                        </button>
                        <button
                          type="button"
                          onClick={() => window.open(buildReminderWhatsAppUrl(nextOperationalItem), '_blank', 'noopener,noreferrer')}
                          className="rounded-2xl border border-[#43372d] bg-[#26211c] px-4 py-2 text-sm font-semibold text-stone-100 transition-colors hover:border-[#c96b2c] hover:text-orange-300"
                        >
                          WhatsApp next customer
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-[#2f2a25] bg-[#1b1815] p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Quick Actions</p>
                <div className="mt-4 space-y-3">
                  <CommandShortcut
                    title="Add Booking"
                    detail="Create a new manual booking fast"
                    href="/admin/bookings/add"
                  />
                  <CommandShortcut
                    title="Booking Approvals"
                    detail="Open approval queue immediately"
                    href="/admin/booking-approvals"
                  />
                  <CommandShortcut
                    title="All Bookings"
                    detail="Manage payments, pickup and return status"
                    href="/admin/bookings"
                  />
                  <CommandShortcut
                    title="Reports"
                    detail="Check revenue, late balances and performance"
                    href="/admin/reports"
                  />
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-[#2a2521] bg-[#171513] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">3-Day Pickups</p>
                    <p className="mt-2 text-2xl font-bold text-stone-50">{threeDayPickupCount}</p>
                    <p className="mt-1 text-sm text-stone-400">Customers collecting soon</p>
                  </div>
                  <div className="rounded-2xl border border-[#2a2521] bg-[#171513] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">3-Day Returns</p>
                    <p className="mt-2 text-2xl font-bold text-stone-50">{threeDayReturnCount}</p>
                    <p className="mt-1 text-sm text-stone-400">Gear coming back soon</p>
                  </div>
                  <div className="rounded-2xl border border-[#2a2521] bg-[#171513] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Monthly Revenue</p>
                    <p className="mt-2 text-2xl font-bold text-stone-50">RM{monthlyRevenue.toFixed(0)}</p>
                    <p className="mt-1 text-sm text-stone-400">{paidThisMonth.length} paid this month</p>
                  </div>
                  <div className="rounded-2xl border border-[#2a2521] bg-[#171513] p-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Fleet Usage</p>
                    <p className="mt-2 text-2xl font-bold text-stone-50">{fleetUtilization}%</p>
                    <p className="mt-1 text-sm text-stone-400">{activeRentals.length} active rentals now</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <OperationsInboxPanel
            items={operationsInboxItems}
            selectedWindow={scheduleWindow}
            onWindowChange={setScheduleWindow}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
        >
          <Card className="rounded-[26px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg text-stone-50">Business Pulse</CardTitle>
              <CardDescription className="text-stone-400">Short health summary of today&apos;s operations and stock position.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-[#2a2521] bg-[#1c1916] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Available Cameras</p>
                  <p className="mt-2 text-2xl font-bold text-stone-50">{availableCameras.length}</p>
                  <p className="mt-1 text-sm text-stone-400">Ready to rent right now</p>
                </div>
                <div className="rounded-2xl border border-[#2a2521] bg-[#1c1916] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-stone-500">Live Rentals</p>
                  <p className="mt-2 text-2xl font-bold text-stone-50">{activeRentals.length}</p>
                  <p className="mt-1 text-sm text-stone-400">Currently out with customers</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-400">Fleet utilization</span>
                    <span className="font-semibold text-stone-50">{fleetUtilization}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#26211c]">
                    <div className="h-full rounded-full bg-stone-300" style={{ width: `${fleetUtilization}%` }} />
                  </div>
                </div>

                <div>
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="font-medium text-stone-400">Available stock</span>
                    <span className="font-semibold text-stone-50">
                      {cameras.length > 0 ? Math.round((availableCameras.length / cameras.length) * 100) : 0}%
                    </span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-[#26211c]">
                    <div
                      className="h-full rounded-full bg-orange-500"
                      style={{ width: `${cameras.length > 0 ? Math.round((availableCameras.length / cameras.length) * 100) : 0}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-[#2b2621] bg-[#1a1714] p-4">
                <p className="text-sm font-semibold text-stone-200">Operational note</p>
                <p className="mt-1 text-sm text-stone-400">
                  Customers should pick up cameras one day before the rental start date. Keep today’s pickup queue clear to avoid tomorrow’s delays.
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <OperationalWindowPanel items={nextThreeDayOperations} />

      <div className="grid gap-6 xl:grid-cols-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="xl:col-span-4"
        >
          <Card className="h-full rounded-[26px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-stone-50">Revenue Trend</CardTitle>
              <CardDescription className="text-stone-400">Last 7 days of collected revenue.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="dashboardRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#c26a2d" stopOpacity={0.24} />
                      <stop offset="95%" stopColor="#c26a2d" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2823" vertical={false} />
                  <XAxis dataKey="date" stroke="#78716c" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#78716c" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#191715',
                      border: '1px solid #2d2823',
                      borderRadius: '14px',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
                      color: '#f5f5f4',
                      fontSize: '12px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#c26a2d"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#dashboardRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="xl:col-span-4"
        >
          <Card className="h-full rounded-[26px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-stone-50">Booking Momentum</CardTitle>
              <CardDescription className="text-stone-400">How many bookings were created each day this week.</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#2d2823" vertical={false} />
                  <XAxis dataKey="date" stroke="#78716c" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#78716c" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#191715',
                      border: '1px solid #2d2823',
                      borderRadius: '14px',
                      boxShadow: '0 16px 40px rgba(0, 0, 0, 0.35)',
                      color: '#f5f5f4',
                      fontSize: '12px',
                    }}
                  />
                  <Bar dataKey="bookings" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.28 }}
          className="xl:col-span-4 xl:row-span-2"
        >
          <Card className="h-full rounded-[26px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg text-stone-50">Recent Bookings</CardTitle>
                <CardDescription className="text-stone-400">Fresh activity with the next action visible on each row.</CardDescription>
              </div>
              <Link href="/admin/bookings" className="text-sm font-medium text-stone-400 hover:text-stone-100">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentBookings.length > 0 ? recentBookings.map((booking) => (
                (() => {
                  const nextAction = getBookingNextAction(booking);

                  return (
                    <div
                      key={booking.id}
                      className="rounded-2xl border border-[#2a2521] bg-[#1c1916] px-4 py-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="truncate font-semibold text-stone-100">{booking.customer?.full_name || 'Unknown Customer'}</p>
                            <Badge variant={bookingStatusVariant(booking.booking_status) as never} className="text-xs">
                              {booking.booking_status === 'pending_approval' ? 'Pending' : booking.booking_status}
                            </Badge>
                          </div>
                          <p className="mt-2 truncate text-sm text-stone-300">{booking.camera?.name || 'Unknown Camera'}</p>
                          <p className="mt-1 text-xs text-stone-500">
                            {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                          </p>
                          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-orange-300">
                            Next: {nextAction.label}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="text-sm font-semibold text-stone-100">RM{booking.total_amount}</span>
                          <div className="flex items-center gap-2">
                            {nextAction.whatsappUrl && (
                              <button
                                type="button"
                                onClick={() => window.open(nextAction.whatsappUrl || '', '_blank', 'noopener,noreferrer')}
                                className="rounded-xl border border-[#43372d] bg-[#26211c] px-3 py-2 text-xs font-semibold text-stone-100 transition-colors hover:border-[#25d366] hover:text-emerald-300"
                              >
                                WhatsApp
                              </button>
                            )}
                            <Link
                              href={nextAction.href}
                              className="rounded-xl border border-[#43372d] bg-[#26211c] px-3 py-2 text-xs font-semibold text-stone-100 transition-colors hover:border-[#c96b2c] hover:text-orange-300"
                            >
                              Open
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })()
              )) : (
                <div className="rounded-2xl border border-dashed border-[#2f2a25] bg-[#171513] py-8 text-center text-sm text-stone-500">
                  No recent bookings yet.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.32 }}
          className="xl:col-span-8"
        >
          <RevenueByCameraPanel
            monthLabel={currentMonthLabel}
            totalRevenue={monthlyRevenue}
            cameras={revenueInsights.monthlyCameraRevenue}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.36 }}
          className="xl:col-span-6"
        >
          <Card className="h-full rounded-[26px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 text-lg text-stone-50">
                <Camera className="h-5 w-5 text-orange-400" />
                Inventory Snapshot
              </CardTitle>
              <CardDescription className="text-stone-400">Fast view of stock without turning the dashboard into a full inventory page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {cameras.slice(0, 6).map((camera) => (
                <div
                  key={camera.id}
                  className="flex items-center justify-between rounded-2xl border border-[#2a2521] bg-[#1c1916] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-100">{camera.name}</p>
                    <p className="text-sm text-stone-400">
                      {camera.is_available
                        ? `${camera.available_quantity}/${camera.total_quantity} available`
                        : 'Currently rented'}
                    </p>
                  </div>
                  <div className="ml-4 flex items-center gap-3">
                    <span className="text-sm font-semibold text-stone-100">RM{camera.daily_rate}/day</span>
                    <Badge variant={camera.is_available ? 'success' : 'secondary'} className="text-xs">
                      {camera.is_available ? 'Available' : 'Rented'}
                    </Badge>
                  </div>
                </div>
              ))}

              <Link href="/admin/cameras">
                <motion.div
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.99 }}
                  className="flex items-center justify-between rounded-2xl border border-dashed border-[#3a332c] px-4 py-3 text-sm font-medium text-stone-400 hover:border-[#c96b2c] hover:text-stone-100"
                >
                  <span>Open full inventory</span>
                  <ArrowUpRight className="h-4 w-4" />
                </motion.div>
              </Link>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="xl:col-span-6"
        >
          <Card className="h-full rounded-[26px] border border-[#3a2421] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-stone-50">
                <AlertCircle className="h-5 w-5 text-red-400" />
                Overdue Payments
              </CardTitle>
              <CardDescription className="text-stone-400">Keep late balances visible so they never disappear into the dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              {overduePayments.length > 0 ? (
                <div className="space-y-3">
                  {overduePayments.slice(0, 4).map((booking) => (
                    <div key={booking.id} className="rounded-2xl border border-[#4a2926] bg-[#211614] p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-stone-100">{booking.customer?.full_name || 'Unknown Customer'}</p>
                          <p className="mt-1 text-sm text-stone-400">{booking.customer?.phone || 'No phone number'}</p>
                          <p className="mt-2 text-sm font-medium text-red-300">
                            RM{booking.final_payment_amount} due since {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <Link href={`/admin/bookings/${booking.id}`} className="rounded-xl border border-[#6b2c28] bg-[#2b1715] px-3 py-2 text-xs font-semibold text-red-200 hover:bg-[#351a18]">
                          Follow Up
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-[#2b2621] bg-[#1a1714] py-8 text-center">
                  <CheckCircle2 className="mx-auto h-10 w-10 text-orange-600" />
                  <p className="mt-3 text-sm font-medium text-stone-100">No overdue payments</p>
                  <p className="mt-1 text-sm text-stone-400">Your payment follow-ups are under control right now.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <DrilldownModal
        open={!!activeDrilldown && selectedDrilldown !== 'revenue'}
        title={activeDrilldown?.title || ''}
        description={activeDrilldown?.description || ''}
        items={activeDrilldown?.items || []}
        onClose={() => setSelectedDrilldown(null)}
      />

      <RevenueDrilldownModal
        open={selectedDrilldown === 'revenue'}
        onClose={() => setSelectedDrilldown(null)}
        monthlyRevenue={monthlyRevenue}
        totalRevenue={totalRevenue}
        monthlyPaidBookings={revenueInsights.monthlyPaidBookings}
        lifetimePaidBookings={revenueInsights.lifetimePaidBookings}
        averagePaidBookingValue={revenueInsights.averagePaidBookingValue}
        monthlyCameraRevenue={revenueInsights.monthlyCameraRevenue}
        lifetimeCameraRevenue={revenueInsights.lifetimeCameraRevenue}
      />
    </div>
  );
}
