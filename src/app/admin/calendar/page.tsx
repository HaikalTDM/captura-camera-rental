'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  X,
} from 'lucide-react';
import { useBookings, useAdminData } from '@/contexts/AdminDataContext';
import TikTokCalendarExport from '@/components/TikTokCalendarExport';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: CalendarEvent[];
}

interface CalendarEvent {
  id: string;
  title: string;
  camera: string;
  customer: string;
  startDate: Date;
  endDate: Date;
  status: 'pending' | 'confirmed' | 'active' | 'completed';
  color: string;
}

function getCameraEventColor(cameraName: string, status: CalendarEvent['status']) {
  const isActionPro = cameraName.includes('Action 5 Pro');
  const isOsmoPocket2 = cameraName.includes('Osmo Pocket 3 (ii)');
  const isOsmoPocket = cameraName.includes('Osmo Pocket 3') && !isOsmoPocket2;
  const isR50Mother = cameraName.includes('Canon R50 - Mother');
  const isR50 = cameraName.includes('Canon R50') && !isR50Mother;

  if (status === 'pending') {
    return 'bg-[#241b14] border-l-[3px] border-[#f59e0b] text-[#fde68a]';
  }

  if (status === 'completed') {
    return 'bg-[#171513] border-l-[3px] border-[#3f3a36] text-stone-500 opacity-80';
  }

  if (status === 'active') {
    if (isActionPro) return 'bg-[#221a13] border-l-[3px] border-[#f59e0b] text-stone-50';
    if (isOsmoPocket2) return 'bg-[#221a13] border-l-[3px] border-[#fb923c] text-stone-50';
    if (isOsmoPocket) return 'bg-[#221a13] border-l-[3px] border-[#c96b2c] text-stone-50';
    if (isR50Mother) return 'bg-[#221a13] border-l-[3px] border-[#a16207] text-stone-50';
    if (isR50) return 'bg-[#221a13] border-l-[3px] border-[#78716c] text-stone-50';
    return 'bg-[#221a13] border-l-[3px] border-[#57534e] text-stone-50';
  }

  if (isActionPro) return 'bg-[#191817] border-l-[3px] border-[#f59e0b] text-stone-100';
  if (isOsmoPocket2) return 'bg-[#191817] border-l-[3px] border-[#fb923c] text-stone-100';
  if (isOsmoPocket) return 'bg-[#191817] border-l-[3px] border-[#c96b2c] text-stone-100';
  if (isR50Mother) return 'bg-[#191817] border-l-[3px] border-[#a16207] text-stone-100';
  if (isR50) return 'bg-[#191817] border-l-[3px] border-[#78716c] text-stone-100';
  return 'bg-[#191817] border-l-[3px] border-[#57534e] text-stone-100';
}

function formatDateLabel(date: Date) {
  return date.toLocaleDateString('en-MY', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function CalendarPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { bookings = [], isLoading = false, error = null } = useBookings() || {};
  const { cameras = [] } = useAdminData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);
  const [exportNotification, setExportNotification] = useState<{
    show: boolean;
    success: boolean;
    message: string;
  }>({ show: false, success: false, message: '' });

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const events = useMemo(() => {
    if (!bookings?.length) return [];

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return bookings
      .filter((booking) => {
        const status = booking.booking_status || booking.status;
        return status === 'pending_approval' || status === 'confirmed' || status === 'completed';
      })
      .map((booking) => {
        const cameraName = booking.camera?.name || 'Camera';
        const customerName = booking.customer?.full_name || 'Customer';
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        const normalizedStatus: CalendarEvent['status'] =
          booking.booking_status === 'pending_approval'
            ? 'pending'
            : booking.booking_status === 'completed'
              ? 'completed'
              : today >= startDate && today <= endDate
                ? 'active'
                : 'confirmed';

        return {
          id: booking.id,
          title: cameraName,
          camera: cameraName,
          customer: customerName,
          startDate,
          endDate,
          status: normalizedStatus,
          color: getCameraEventColor(cameraName, normalizedStatus),
        };
      });
  }, [bookings]);

  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const days: CalendarDay[] = [];

    for (let i = 0; i < 42; i += 1) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      date.setHours(0, 0, 0, 0);

      const dayEvents = events.filter((event) => date >= event.startDate && date <= event.endDate);

      days.push({
        date,
        isCurrentMonth: date.getMonth() === month,
        isToday: date.getTime() === today.getTime(),
        bookings: dayEvents,
      });
    }

    return days;
  }, [currentDate, events]);

  const stats = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      thisMonth: events.filter((event) => event.startDate.getMonth() === currentDate.getMonth()).length,
      activeNow: events.filter((event) => today >= event.startDate && today <= event.endDate && (event.status === 'confirmed' || event.status === 'active')).length,
      pending: events.filter((event) => event.status === 'pending').length,
      available: cameras.filter((camera) => camera.is_available && camera.available_quantity > 0).length,
    };
  }, [events, currentDate, cameras]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(nextDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEventModal(true);
  };

  const handleExportComplete = (success: boolean, filename?: string) => {
    setExportNotification({
      show: true,
      success,
      message: success
        ? `Calendar exported successfully as ${filename}!`
        : 'Export failed. Please try again.',
    });

    setTimeout(() => {
      setExportNotification({ show: false, success: false, message: '' });
    }, 5000);
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const maxEventsPerDay = 3;

  if (!isMounted || isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2b2621] border-t-orange-500" />
          <p className="text-sm font-medium text-stone-400">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex max-w-md flex-col items-center gap-3 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-[#4a2926] bg-[#241615]">
            <X className="h-8 w-8 text-red-300" />
          </div>
          <h3 className="text-lg font-bold text-stone-100">Error Loading Calendar</h3>
          <p className="text-sm text-stone-400">{error.message || 'Something went wrong. Please try refreshing the page.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 rounded-xl bg-[#f3efe8] px-5 py-2.5 font-semibold text-[#11100f] transition-all duration-200 hover:bg-white active:scale-95"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-[#2d2823] bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.15),_transparent_34%),linear-gradient(135deg,#191614_0%,#141210_60%,#1b1714_100%)] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3a2d22] bg-[#221912] shadow-lg">
              <CalendarIcon className="h-7 w-7 text-orange-300" />
            </div>
            <div>
              <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-[#3a332c] bg-[#1a1714] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-300">
                <CalendarIcon className="h-3.5 w-3.5" />
                Schedule Board
              </div>
              <h1 className="text-3xl font-bold text-stone-50">Rental Calendar</h1>
              <p className="text-sm text-stone-400">View bookings, overlaps, and camera availability across the month.</p>
            </div>
          </div>

          <button
            onClick={goToToday}
            className="rounded-xl bg-[#f3efe8] px-5 py-2.5 text-sm font-semibold text-[#11100f] transition-all duration-200 hover:bg-white active:scale-95"
          >
            Today
          </button>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#2d2823] bg-[#161412] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateMonth('prev')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#332d27] bg-[#1d1916] transition-all duration-200 hover:border-[#4a4036] hover:bg-[#24201c] active:scale-95"
            >
              <ChevronLeft className="h-5 w-5 text-stone-300" />
            </button>

            <h2 className="min-w-[200px] text-center text-2xl font-bold text-stone-50">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            <button
              onClick={() => navigateMonth('next')}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#332d27] bg-[#1d1916] transition-all duration-200 hover:border-[#4a4036] hover:bg-[#24201c] active:scale-95"
            >
              <ChevronRight className="h-5 w-5 text-stone-300" />
            </button>
          </div>

          <TikTokCalendarExport
            currentDate={currentDate}
            calendarDays={calendarDays}
            events={events}
            onExportComplete={handleExportComplete}
          />
        </div>
      </div>

      {exportNotification.show && (
        <div className={`rounded-[24px] border p-4 shadow-[0_18px_45px_rgba(0,0,0,0.22)] ${
          exportNotification.success ? 'border-[#2d2823] bg-[#161412]' : 'border-[#4a2926] bg-[#1b1413]'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${
              exportNotification.success ? 'bg-[#231f1b]' : 'bg-[#2a1614]'
            }`}>
              {exportNotification.success ? (
                <Download className="h-5 w-5 text-orange-300" />
              ) : (
                <X className="h-5 w-5 text-red-300" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${exportNotification.success ? 'text-stone-100' : 'text-red-200'}`}>
                {exportNotification.message}
              </p>
            </div>
            <button
              onClick={() => setExportNotification({ show: false, success: false, message: '' })}
              className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                exportNotification.success ? 'text-stone-400 hover:bg-[#1d1916]' : 'text-red-300 hover:bg-[#331918]'
              }`}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <div className="rounded-[28px] border border-[#2d2823] bg-[#161412] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        <div className="space-y-4">
          <div>
            <h3 className="mb-3 text-sm font-bold text-stone-100">Booking Status</h3>
            <div className="flex flex-wrap gap-3">
              {[
                ['Pending', '#f59e0b'],
                ['Confirmed', '#c96b2c'],
                ['Active', '#fb923c'],
                ['Completed', '#57534e'],
              ].map(([label, color]) => (
                <div key={label} className="flex items-center gap-2 rounded-lg border border-[#332d27] bg-[#1d1916] px-3 py-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium text-stone-300">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-bold text-stone-100">Camera Types</h3>
            <div className="flex flex-wrap gap-3">
              {[
                ['DJI Action 5 Pro', '#f59e0b'],
                ['DJI Osmo Pocket 3', '#c96b2c'],
                ['DJI Osmo Pocket 3 (ii)', '#fb923c'],
                ['Canon R50', '#78716c'],
                ['Canon R50 - Mother', '#a16207'],
                ['Other Cameras', '#57534e'],
              ].map(([label, color]) => (
                <div key={label} className="flex items-center gap-2 rounded-lg border border-[#332d27] bg-[#1d1916] px-3 py-2">
                  <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-sm font-medium text-stone-300">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-lg border border-[#332d27] bg-[#171513] p-3">
            <div className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#231f1b]">
              <span className="text-xs text-stone-400">i</span>
            </div>
            <p className="text-xs text-stone-500">
              Completed bookings are intentionally muted so the current queue and active rentals stand out first.
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-[28px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        <div className="grid grid-cols-7 border-b border-[#26211d] bg-[#191715]">
          {dayNames.map((day) => (
            <div key={day} className="p-3 text-center text-xs font-bold text-stone-400 sm:p-4 sm:text-sm">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={`${day.date.getTime()}-${index}`}
              className={`min-h-[80px] border-r border-b p-1 transition-colors sm:min-h-[120px] sm:p-2 ${
                !day.isCurrentMonth ? 'bg-[#13110f]' : 'bg-[#181614] hover:bg-[#1d1916]'
              } ${day.isToday ? 'bg-[#201914]' : ''} ${
                index % 7 === 6 ? 'border-r-0' : 'border-r-[#26211d]'
              } ${index >= calendarDays.length - 7 ? 'border-b-0' : 'border-b-[#26211d]'}`}
            >
              <div className={`mb-1 text-xs font-semibold sm:mb-2 sm:text-sm ${
                !day.isCurrentMonth ? 'text-stone-600' : 'text-stone-200'
              } ${day.isToday ? 'font-bold text-orange-300' : ''}`}>
                {day.date.getDate()}
              </div>

              <div className="space-y-1">
                {day.bookings.slice(0, maxEventsPerDay).map((booking) => (
                  <div
                    key={`${day.date.getTime()}-${booking.id}`}
                    className={`cursor-pointer truncate rounded p-1 text-xs transition-shadow touch-manipulation hover:shadow-sm ${booking.color}`}
                    title={`${booking.customer} - ${booking.camera}`}
                    onClick={() => handleEventClick(booking)}
                  >
                    <div className="truncate font-medium">{booking.camera}</div>
                    <div className="hidden truncate opacity-75 sm:block">{booking.customer}</div>
                  </div>
                ))}

                {day.bookings.length > maxEventsPerDay && (
                  <div className="text-xs font-medium text-stone-500">
                    +{day.bookings.length - maxEventsPerDay} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-[24px] border border-[#2d2823] bg-[#161412] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">This Month</p>
              <p className="text-3xl font-bold text-orange-300">{stats.thisMonth}</p>
              <p className="mt-1 text-sm text-stone-400">Total Bookings</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#231f1b]">
              <CalendarIcon className="h-6 w-6 text-orange-300" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#2d2823] bg-[#161412] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Active Now</p>
              <p className="text-3xl font-bold text-stone-100">{stats.activeNow}</p>
              <p className="mt-1 text-sm text-stone-400">Cameras Out</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#231f1b]">
              <Eye className="h-6 w-6 text-stone-300" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#2d2823] bg-[#161412] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Pending</p>
              <p className="text-3xl font-bold text-orange-300">{stats.pending}</p>
              <p className="mt-1 text-sm text-stone-400">Need Confirmation</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#231f1b]">
              <CalendarIcon className="h-6 w-6 text-orange-300" />
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#2d2823] bg-[#161412] p-6 shadow-[0_18px_45px_rgba(0,0,0,0.22)]">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">Available</p>
              <p className="text-3xl font-bold text-stone-100">{stats.available}</p>
              <p className="mt-1 text-sm text-stone-400">Cameras Ready</p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#231f1b]">
              <Eye className="h-6 w-6 text-stone-300" />
            </div>
          </div>
        </div>
      </div>

      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[28px] border border-[#2d2823] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.35)]">
            <div className="border-b border-[#26211d] bg-[#191715] p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#231f1b]">
                    <CalendarIcon className="h-6 w-6 text-orange-300" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-stone-100">{selectedEvent.camera}</h3>
                    <p className="mt-0.5 text-sm text-stone-400">Rental Details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-stone-400 transition-colors hover:bg-[#211d19] hover:text-stone-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            <div className="space-y-4 p-6">
              <div className="rounded-xl border border-[#2f2a25] bg-[#171513] p-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Customer</label>
                <p className="mt-1 font-semibold text-stone-100">{selectedEvent.customer}</p>
              </div>

              <div className="rounded-xl border border-[#2f2a25] bg-[#171513] p-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Camera</label>
                <p className="mt-1 font-semibold text-stone-100">{selectedEvent.camera}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-[#332d27] bg-[#1d1916] p-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Start Date</label>
                  <p className="mt-1 text-sm font-semibold text-stone-100">{formatDateLabel(selectedEvent.startDate)}</p>
                </div>
                <div className="rounded-xl border border-[#332d27] bg-[#1d1916] p-4">
                  <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">End Date</label>
                  <p className="mt-1 text-sm font-semibold text-stone-100">{formatDateLabel(selectedEvent.endDate)}</p>
                </div>
              </div>

              <div className="rounded-xl border border-[#2f2a25] bg-[#171513] p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-stone-500">Status</label>
                <span className={`inline-flex rounded-lg px-3 py-1.5 text-sm font-semibold ${selectedEvent.color}`}>
                  {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                </span>
              </div>

              <div className="rounded-xl border border-[#332d27] bg-[#1d1916] p-4">
                <label className="text-xs font-semibold uppercase tracking-wide text-stone-500">Duration</label>
                <p className="mt-1 text-lg font-bold text-orange-300">
                  {Math.round((selectedEvent.endDate.getTime() - selectedEvent.startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
                </p>
              </div>
            </div>

            <div className="flex gap-3 border-t border-[#26211d] p-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 rounded-xl border border-[#332d27] bg-[#1d1916] px-5 py-2.5 font-semibold text-stone-300 transition-colors hover:bg-[#24201c]"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.location.href = `/admin/bookings/${selectedEvent.id}`;
                }}
                className="flex-1 rounded-xl bg-[#f3efe8] px-5 py-2.5 font-semibold text-[#11100f] transition-colors hover:bg-white"
              >
                View Booking
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
