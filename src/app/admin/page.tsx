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
  Package,
  PackageOpen,
  ShieldAlert,
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
import { useAdminData } from '@/contexts/AdminDataContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileDashboard from '@/components/admin/MobileDashboard';
import ScrapeHubButton from '@/components/admin/ScrapeHubButton';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Booking } from '@/lib/supabase';

type Tone = 'blue' | 'green' | 'orange' | 'purple' | 'red';
type DrilldownType = 'pickups' | 'returns' | 'approvals' | 'revenue';

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

function MetricCard({
  title,
  value,
  subtitle,
  icon,
  tone = 'blue',
  onClick,
}: {
  title: string;
  value: string | number;
  subtitle: string;
  icon: React.ReactNode;
  tone?: Tone;
  onClick?: () => void;
}) {
  const palette = toneClasses(tone);

  return (
    <Card
      className={`border bg-gradient-to-br shadow-[0_18px_45px_rgba(0,0,0,0.22)] ${palette.shell} ${onClick ? 'cursor-pointer transition-transform duration-200 hover:-translate-y-1 hover:border-[#4c4036] hover:shadow-[0_22px_55px_rgba(0,0,0,0.28)]' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onClick();
        }
      } : undefined}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-500">{title}</p>
            <p className="text-3xl font-bold tracking-tight text-stone-50">{value}</p>
            <p className="text-sm text-stone-400">{subtitle}</p>
          </div>
          <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl ${palette.icon}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ActionRow({
  title,
  detail,
  value,
  href,
  tone = 'blue',
}: {
  title: string;
  detail: string;
  value: string;
  href: string;
  tone?: Tone;
}) {
  const palette = toneClasses(tone);

  return (
    <Link href={href}>
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        className="flex items-center justify-between rounded-2xl border border-[#2c2723] bg-[#191715] px-4 py-4 transition-colors hover:border-[#4a4036]"
      >
        <div className="min-w-0">
          <p className="font-semibold text-stone-100">{title}</p>
          <p className="mt-1 text-sm text-stone-400">{detail}</p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${palette.icon}`}>{value}</span>
          <ArrowUpRight className="h-4 w-4 text-stone-500" />
        </div>
      </motion.div>
    </Link>
  );
}

function TimelinePanel({
  title,
  description,
  items,
  emptyLabel,
}: {
  title: string;
  description: string;
  items: TimelineItem[];
  emptyLabel: string;
}) {
  return (
    <Card className="rounded-[28px] border border-[#2c2723] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
      <CardHeader className="border-b border-[#24211d] pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle className="text-lg text-stone-50">{title}</CardTitle>
            <CardDescription className="mt-1 text-stone-400">{description}</CardDescription>
          </div>
          <span className="rounded-full border border-[#3a3129] bg-[#1f1c18] px-3 py-1 text-xs font-medium text-orange-300">
            {items.length} in 7 days
          </span>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 p-5">
        {items.length > 0 ? items.slice(0, 4).map((item) => (
          <div
            key={`${title}-${item.id}`}
            className="rounded-2xl border border-[#2a2521] bg-[#1d1a17] p-4 transition-colors hover:border-[#4b4036]"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="truncate font-semibold text-stone-100">{item.customerName}</p>
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
              <Link
                href={item.bookingHref}
                className="shrink-0 rounded-xl border border-[#43372d] bg-[#26211c] px-3 py-2 text-xs font-semibold text-stone-100 transition-colors hover:border-[#c96b2c] hover:text-orange-300"
              >
                Open
              </Link>
            </div>
          </div>
        )) : (
          <div className="rounded-2xl border border-dashed border-[#2f2a25] bg-[#171513] py-10 text-center text-sm text-stone-500">
            {emptyLabel}
          </div>
        )}
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

export default function AdminDashboard() {
  const { bookings, cameras, mutate } = useAdminData();
  const isMobile = useIsMobile(768);
  const [selectedDrilldown, setSelectedDrilldown] = useState<DrilldownType | null>(null);

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

  return (
    <div className="space-y-6 rounded-[36px] border border-[#2a2622] bg-[#11100f] p-6 text-stone-100 shadow-[0_30px_90px_rgba(0,0,0,0.35)]">
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
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
                  Today at a Glance
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

            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-3xl border border-[#2f2a25] bg-[#1b1815] p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Monthly Revenue</p>
                <p className="mt-3 text-4xl font-bold tracking-tight text-stone-50">RM{monthlyRevenue.toFixed(0)}</p>
                <div className="mt-3 flex items-center gap-2 text-sm text-orange-300">
                  <TrendingUp className="h-4 w-4" />
                  <span>{paidThisMonth.length} fully paid booking{paidThisMonth.length !== 1 ? 's' : ''} this month</span>
                </div>
              </div>

              <div className="rounded-3xl border border-[#2f2a25] bg-[#1b1815] p-5 backdrop-blur">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-500">Needs Attention</p>
                <p className="mt-3 text-4xl font-bold tracking-tight text-stone-50">{attentionCount}</p>
                <p className="mt-3 text-sm text-stone-400">
                  {pendingApprovals.length} approvals, {overduePayments.length} payment follow-ups, {todayReturns.length} return{todayReturns.length !== 1 ? 's' : ''} due today
                </p>
              </div>

              <div className="rounded-3xl border border-stone-800 bg-[#2b2723] p-5 text-stone-50 shadow-lg">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-stone-400">Fleet Snapshot</p>
                <p className="mt-3 text-4xl font-bold tracking-tight">{fleetUtilization}%</p>
                <p className="mt-3 text-sm text-stone-300">
                  {activeRentals.length} active rental{activeRentals.length !== 1 ? 's' : ''} across {cameras.length} camera{cameras.length !== 1 ? 's' : ''}
                </p>
                <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-orange-400" style={{ width: `${fleetUtilization}%` }} />
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="space-y-4"
        >
          <Card className="rounded-[28px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg text-stone-50">
                <ShieldAlert className="h-5 w-5 text-orange-600" />
                Quick Actions
              </CardTitle>
              <CardDescription className="text-stone-400">Jump straight into the tasks that move the business today.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ActionRow
                title="Review Booking Approvals"
                detail="Approve or reject new requests before they go stale."
                value={`${pendingApprovals.length}`}
                href="/admin/booking-approvals"
                tone="orange"
              />
              <ActionRow
                title="Follow Up Payments"
                detail="Check customers with unsettled balances after return."
                value={`${overduePayments.length}`}
                href="/admin/reports"
                tone="red"
              />
              <ActionRow
                title="Open Bookings Board"
                detail="Manage live bookings, dates, and customer actions."
                value={`${bookings.length}`}
                href="/admin/bookings"
                tone="blue"
              />
            </CardContent>
          </Card>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
      >
        <MetricCard
          title="Today's Pickups"
          value={todayPickups.length}
          subtitle="Bookings scheduled for collection today"
          icon={<Package className="h-5 w-5" />}
          tone="green"
          onClick={() => setSelectedDrilldown('pickups')}
        />
        <MetricCard
          title="Today's Returns"
          value={todayReturns.length}
          subtitle="Rentals expected back before the end of day"
          icon={<PackageOpen className="h-5 w-5" />}
          tone="orange"
          onClick={() => setSelectedDrilldown('returns')}
        />
        <MetricCard
          title="Pending Approvals"
          value={pendingApprovals.length}
          subtitle="New requests waiting for a decision"
          icon={<AlertCircle className="h-5 w-5" />}
          tone="purple"
          onClick={() => setSelectedDrilldown('approvals')}
        />
        <MetricCard
          title="Total Revenue"
          value={`RM${totalRevenue.toFixed(0)}`}
          subtitle="Lifetime revenue from fully paid bookings"
          icon={<Wallet className="h-5 w-5" />}
          tone="blue"
          onClick={() => setSelectedDrilldown('revenue')}
        />
      </motion.div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(0,0.8fr)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12 }}
        >
          <Card className="rounded-[26px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-lg text-stone-50">Attention Board</CardTitle>
                  <CardDescription className="text-stone-400">What needs a decision, a follow-up, or operational movement right now.</CardDescription>
                </div>
                <div className="rounded-full border border-[#3a332c] bg-[#1d1a17] px-3 py-1 text-xs font-semibold text-stone-300">
                  {attentionCount} open items
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <ActionRow
                title="Pending Approval Queue"
                detail="Bookings waiting for confirmation so customers can move forward."
                value={`${pendingApprovals.length} open`}
                href="/admin/booking-approvals"
                tone="orange"
              />
              <ActionRow
                title="Due Returns Today"
                detail="Active rentals expected back today and ready for check-in."
                value={`${todayReturns.length} due`}
                href="/admin/bookings"
                tone="orange"
              />
              <ActionRow
                title="Payment Follow-Ups"
                detail="Closed rentals with remaining balances to collect."
                value={`${overduePayments.length} late`}
                href="/admin/reports"
                tone="red"
              />
            </CardContent>
          </Card>
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

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <TimelinePanel
          title="Upcoming Pickups"
          description="Confirmed collections scheduled today and over the next week."
          items={timelineData.pickups}
          emptyLabel="No pickups scheduled in the next 7 days."
        />
        <TimelinePanel
          title="Upcoming Returns"
          description="Active rentals due back within the next week."
          items={timelineData.returns}
          emptyLabel="No returns due in the next 7 days."
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,0.7fr)]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-[26px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
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

            <Card className="rounded-[26px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
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
          </div>

          <RevenueByCameraPanel
            monthLabel={currentMonthLabel}
            totalRevenue={monthlyRevenue}
            cameras={revenueInsights.monthlyCameraRevenue}
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="space-y-6"
        >
          <Card className="rounded-[26px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
              <div>
                <CardTitle className="text-lg text-stone-50">Recent Bookings</CardTitle>
                <CardDescription className="text-stone-400">Fresh activity coming into the rental flow.</CardDescription>
              </div>
              <Link href="/admin/bookings" className="text-sm font-medium text-stone-400 hover:text-stone-100">
                View all
              </Link>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentBookings.length > 0 ? recentBookings.map((booking) => (
                <div
                  key={booking.id}
                  className="flex items-center justify-between rounded-2xl border border-[#2a2521] bg-[#1c1916] px-4 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-stone-100">{booking.customer?.full_name || 'Unknown Customer'}</p>
                    <p className="truncate text-sm text-stone-400">{booking.camera?.name || 'Unknown Camera'}</p>
                    <p className="mt-1 text-xs text-stone-500">
                      {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                    </p>
                  </div>
                  <div className="ml-4 flex flex-col items-end gap-2">
                    <Badge variant={bookingStatusVariant(booking.booking_status) as never} className="text-xs">
                      {booking.booking_status === 'pending_approval' ? 'Pending' : booking.booking_status}
                    </Badge>
                    <span className="text-sm font-semibold text-stone-100">RM{booking.total_amount}</span>
                  </div>
                </div>
              )) : (
                <div className="rounded-2xl border border-dashed border-[#2f2a25] bg-[#171513] py-8 text-center text-sm text-stone-500">
                  No recent bookings yet.
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="rounded-[26px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
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

          <Card className="rounded-[26px] border border-[#3a2421] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
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
