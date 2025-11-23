'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { getAllBookings } from '@/lib/api/bookings';
import type { Booking } from '@/lib/supabase';
import TikTokCalendarExport from '@/components/TikTokCalendarExport';
import { useBookings, useAdminData } from '@/contexts/AdminDataContext';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download,
  Eye,
  X
} from 'lucide-react';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: any[];
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

export default function CalendarPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { bookings = [], isLoading = false, error = null } = useBookings() || {};
  const { cameras = [] } = useAdminData();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'month' | 'week'>('month');
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

  // Helper function to get camera color - defined before useMemo
  const getCameraColor = (cameraName: string, status: string) => {
    // Determine camera type and return appropriate colors
    const isActionPro = cameraName.includes('Action 5 Pro');
    const isOsmoPocket2 = cameraName.includes('Osmo Pocket 3 (ii)'); // Second Osmo Pocket 3
    const isOsmoPocket = cameraName.includes('Osmo Pocket 3') && !isOsmoPocket2; // First Osmo Pocket 3
    const isR50Mother = cameraName.includes('Canon R50 - Mother');
    const isR50 = cameraName.includes('Canon R50') && !isR50Mother;

    // Status-based colors with camera-specific themes
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900';
      case 'confirmed':
        if (isActionPro) {
          return 'bg-blue-100 border-l-4 border-blue-500 text-blue-900';
        } else if (isOsmoPocket2) {
          return 'bg-teal-100 border-l-4 border-teal-500 text-teal-900'; // Second Osmo = Teal
        } else if (isOsmoPocket) {
          return 'bg-orange-100 border-l-4 border-orange-500 text-orange-900'; // First Osmo = Orange
        } else if (isR50Mother) {
          return 'bg-pink-100 border-l-4 border-pink-500 text-pink-900'; // Mother = Pink
        } else if (isR50) {
          return 'bg-indigo-100 border-l-4 border-indigo-500 text-indigo-900'; // R50 = Indigo
        } else {
          return 'bg-purple-100 border-l-4 border-purple-500 text-purple-900';
        }
      case 'active':
        if (isActionPro) {
          return 'bg-blue-200 border-l-4 border-blue-600 text-blue-900 font-semibold';
        } else if (isOsmoPocket2) {
          return 'bg-teal-200 border-l-4 border-teal-600 text-teal-900 font-semibold'; // Second Osmo = Teal
        } else if (isOsmoPocket) {
          return 'bg-orange-200 border-l-4 border-orange-600 text-orange-900 font-semibold'; // First Osmo = Orange
        } else if (isR50Mother) {
          return 'bg-pink-200 border-l-4 border-pink-600 text-pink-900 font-semibold'; // Mother = Pink
        } else if (isR50) {
          return 'bg-indigo-200 border-l-4 border-indigo-600 text-indigo-900 font-semibold'; // R50 = Indigo
        } else {
          return 'bg-purple-200 border-l-4 border-purple-600 text-purple-900 font-semibold';
        }
      case 'completed':
        if (isActionPro) {
          return 'bg-blue-50 border-l-4 border-blue-300 text-blue-700 opacity-75';
        } else if (isOsmoPocket2) {
          return 'bg-teal-50 border-l-4 border-teal-300 text-teal-700 opacity-75'; // Second Osmo = Teal
        } else if (isOsmoPocket) {
          return 'bg-orange-50 border-l-4 border-orange-300 text-orange-700 opacity-75'; // First Osmo = Orange
        } else if (isR50Mother) {
          return 'bg-pink-50 border-l-4 border-pink-300 text-pink-700 opacity-75'; // Mother = Pink
        } else if (isR50) {
          return 'bg-indigo-50 border-l-4 border-indigo-300 text-indigo-700 opacity-75'; // R50 = Indigo
        } else {
          return 'bg-purple-50 border-l-4 border-purple-300 text-purple-700 opacity-75';
        }
      case 'rejected':
        return 'bg-red-100 border-l-4 border-red-500 text-red-900';
      // Legacy status support
      case 'pending':
        return 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900';
      default:
        if (isActionPro) {
          return 'bg-blue-100 border-l-4 border-blue-500 text-blue-900';
        } else if (isOsmoPocket2) {
          return 'bg-teal-100 border-l-4 border-teal-500 text-teal-900'; // Second Osmo = Teal
        } else if (isOsmoPocket) {
          return 'bg-orange-100 border-l-4 border-orange-500 text-orange-900'; // First Osmo = Orange
        } else if (isR50Mother) {
          return 'bg-pink-100 border-l-4 border-pink-500 text-pink-900'; // Mother = Pink
        } else if (isR50) {
          return 'bg-indigo-100 border-l-4 border-indigo-500 text-indigo-900'; // R50 = Indigo
        } else {
          return 'bg-purple-100 border-l-4 border-purple-500 text-purple-900';
        }
    }
  };

  // Memoize calendar events to avoid recalculation on every render
  const events = useMemo(() => {
    if (!bookings || bookings.length === 0) {
      console.log('Calendar: No bookings available');
      return [];
    }

    console.log('Calendar: Loaded bookings:', bookings.length);

    // Filter out Mother's R50 bookings from main admin calendar
    // const adminBookings = bookings.filter(b => b.camera?.name !== 'Canon R50 - Mother');
    // console.log('Calendar: Admin bookings (excluding Mother):', adminBookings.length);

    const adminBookings = bookings; // Show all bookings including Mother's

    // Filter confirmed and completed bookings for calendar display
    const displayBookings = adminBookings.filter(booking => {
      const status = booking.booking_status || booking.status;
      return status === 'confirmed' || status === 'completed';
    });
    console.log('Calendar: Display bookings (confirmed + completed):', displayBookings.length);

    // Convert bookings to calendar events
    const calendarEvents = displayBookings.map(booking => {
      const cameraName = booking.camera?.name || booking.camera_name || 'Camera';
      const customerName = booking.customer?.full_name || booking.customer?.name || 'Customer';

      return {
        id: booking.id,
        title: cameraName,
        camera: cameraName,
        customer: customerName,
        startDate: new Date(booking.start_date),
        endDate: new Date(booking.end_date),
        status: booking.booking_status || booking.status,
        color: getCameraColor(cameraName, booking.booking_status || booking.status)
      };
    });

    console.log('Calendar: Created events:', calendarEvents.length);
    console.log('Calendar: Events:', calendarEvents);
    return calendarEvents;
  }, [bookings]);

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days: CalendarDay[] = [];
    const today = new Date();

    console.log('Calendar: Generating days for month:', month, 'year:', year);
    console.log('Calendar: Total events available:', events.length);

    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);

      const dayEvents = events.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);

        // Normalize dates to compare only the date part (ignore time)
        const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        const eventStartDay = new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate());
        const eventEndDay = new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());

        const isInRange = dayStart >= eventStartDay && dayStart <= eventEndDay;

        // Debug for September 21, 2025
        if (date.getDate() === 21 && date.getMonth() === 8 && date.getFullYear() === 2025) {
          console.log('Calendar: Sept 21, 2025 check:', {
            date: date.toDateString(),
            dayStart: dayStart.toDateString(),
            eventId: event.id,
            eventStartDay: eventStartDay.toDateString(),
            eventEndDay: eventEndDay.toDateString(),
            isInRange,
            customer: event.customer
          });
        }

        return isInRange;
      });

      days.push({
        date: new Date(date),
        isCurrentMonth: date.getMonth() === month,
        isToday: date.toDateString() === today.toDateString(),
        bookings: dayEvents
      });
    }

    return days;
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
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
        : 'Export failed. Please try again.'
    });

    // Auto-hide notification after 5 seconds
    setTimeout(() => {
      setExportNotification({ show: false, success: false, message: '' });
    }, 5000);
  };

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (!isMounted || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900"></div>
          <p className="text-sm text-slate-600 font-medium">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
            <X className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">Error Loading Calendar</h3>
          <p className="text-sm text-slate-600">{error.message || 'Something went wrong. Please try refreshing the page.'}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm mt-2"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-xl border border-slate-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
              <CalendarIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Rental Calendar</h1>
              <p className="text-slate-300 text-sm">View and manage camera rental schedules</p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {/* View Toggle */}
            <div className="flex bg-slate-700/50 rounded-xl p-1 flex-1 sm:flex-none border border-slate-600">
              <button
                onClick={() => setSelectedView('month')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${selectedView === 'month'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                  }`}
              >
                Month
              </button>
              <button
                onClick={() => setSelectedView('week')}
                className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${selectedView === 'week'
                    ? 'bg-white text-slate-900 shadow-sm'
                    : 'text-slate-300 hover:text-white'
                  }`}
              >
                Week
              </button>
            </div>

            <button
              onClick={goToToday}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all duration-200 hover:scale-105 active:scale-95 text-sm shadow-sm flex-shrink-0"
            >
              Today
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateMonth('prev')}
              className="w-10 h-10 hover:bg-slate-100 rounded-xl transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
            >
              <ChevronLeft className="w-5 h-5 text-slate-600" />
            </button>

            <h2 className="text-2xl font-bold text-slate-900 min-w-[200px] text-center">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>

            <button
              onClick={() => navigateMonth('next')}
              className="w-10 h-10 hover:bg-slate-100 rounded-xl transition-all duration-200 flex items-center justify-center hover:scale-105 active:scale-95"
            >
              <ChevronRight className="w-5 h-5 text-slate-600" />
            </button>
          </div>

          {/* Export Button */}
          <div className="flex items-center gap-4">
            <TikTokCalendarExport
              currentDate={currentDate}
              calendarDays={calendarDays}
              events={events}
              onExportComplete={handleExportComplete}
            />
          </div>
        </div>
      </div>

      {/* Export Notification */}
      {exportNotification.show && (
        <div className={`rounded-2xl border p-4 shadow-sm ${exportNotification.success
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
          }`}>
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${exportNotification.success ? 'bg-green-100' : 'bg-red-100'
              }`}>
              {exportNotification.success ? (
                <Download className="w-5 h-5 text-green-600" />
              ) : (
                <X className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="flex-1">
              <p className={`text-sm font-semibold ${exportNotification.success ? 'text-green-900' : 'text-red-900'
                }`}>
                {exportNotification.message}
              </p>
            </div>
            <button
              onClick={() => setExportNotification({ show: false, success: false, message: '' })}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${exportNotification.success
                  ? 'hover:bg-green-100 text-green-600'
                  : 'hover:bg-red-100 text-red-600'
                }`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="space-y-4">
          {/* Status Legend */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Booking Status</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-yellow-50 rounded-lg border border-yellow-200">
                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Pending</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Confirmed</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-lg border border-green-200">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Active</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-lg border border-slate-200">
                <div className="w-3 h-3 bg-slate-400 rounded-full opacity-75"></div>
                <span className="text-sm font-medium text-slate-700">Completed</span>
              </div>
            </div>
          </div>

          {/* Camera Legend */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Camera Types</h3>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 px-3 py-2 bg-blue-50 rounded-lg border border-blue-200">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">DJI Action 5 Pro</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-orange-50 rounded-lg border border-orange-200">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">DJI Osmo Pocket 3</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-teal-50 rounded-lg border border-teal-200">
                <div className="w-3 h-3 bg-teal-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">DJI Osmo Pocket 3 (ii)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-indigo-50 rounded-lg border border-indigo-200">
                <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Canon R50</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-pink-50 rounded-lg border border-pink-200">
                <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Canon R50 (Mother)</span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 rounded-lg border border-purple-200">
                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                <span className="text-sm font-medium text-slate-700">Other Cameras</span>
              </div>
            </div>
          </div>

          {/* Additional Info */}
          <div className="flex items-start gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200">
            <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs text-slate-600">ℹ</span>
            </div>
            <p className="text-xs text-slate-600">
              Completed bookings appear with muted colors and reduced opacity
            </p>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-slate-200 bg-slate-50">
          {dayNames.map(day => (
            <div key={day} className="p-3 sm:p-4 text-center font-bold text-slate-900 text-xs sm:text-sm">
              <span className="hidden sm:inline">{day}</span>
              <span className="sm:hidden">{day.slice(0, 1)}</span>
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[80px] sm:min-h-[120px] p-1 sm:p-2 border-r border-b border-slate-100 transition-colors ${!day.isCurrentMonth ? 'bg-slate-50/50' : 'bg-white hover:bg-slate-50/30'
                } ${day.isToday ? 'bg-blue-50 border-blue-200' : ''}`}
            >
              {/* Date Number */}
              <div className={`text-xs sm:text-sm font-semibold mb-1 sm:mb-2 ${!day.isCurrentMonth ? 'text-slate-400' : 'text-slate-900'
                } ${day.isToday ? 'text-blue-600 font-bold' : ''}`}>
                {day.date.getDate()}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {day.bookings.slice(0, window.innerWidth < 640 ? 2 : 3).map((booking, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`text-xs p-1 rounded border-l-2 ${booking.color} truncate cursor-pointer hover:shadow-sm transition-shadow touch-manipulation`}
                    title={`${booking.customer} - ${booking.camera}`}
                    onClick={() => handleEventClick(booking)}
                  >
                    <div className="font-medium truncate">{booking.camera}</div>
                    <div className="opacity-75 truncate hidden sm:block">{booking.customer}</div>
                  </div>
                ))}

                {day.bookings.length > (window.innerWidth < 640 ? 2 : 3) && (
                  <div className="text-xs text-gray-700 font-medium">
                    +{day.bookings.length - (window.innerWidth < 640 ? 2 : 3)} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">This Month</p>
              <p className="text-3xl font-bold text-blue-600">
                {events.filter(e => e.startDate.getMonth() === currentDate.getMonth()).length}
              </p>
              <p className="text-sm text-slate-600 mt-1">Total Bookings</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Active Now</p>
              <p className="text-3xl font-bold text-green-600">
                {(() => {
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  return events.filter(e => {
                    const start = new Date(e.startDate);
                    const end = new Date(e.endDate);
                    start.setHours(0, 0, 0, 0);
                    end.setHours(0, 0, 0, 0);
                    return today >= start && today <= end && (e.status === 'confirmed' || e.status === 'active');
                  }).length;
                })()}
              </p>
              <p className="text-sm text-slate-600 mt-1">Cameras Out</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Pending</p>
              <p className="text-3xl font-bold text-amber-600">
                {events.filter(e => e.status === 'pending_approval' || e.status === 'pending').length}
              </p>
              <p className="text-sm text-slate-600 mt-1">Need Confirmation</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
              <CalendarIcon className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Available</p>
              <p className="text-3xl font-bold text-slate-900">
                {cameras.filter(c => c.is_available && c.available_quantity > 0).length}
              </p>
              <p className="text-sm text-slate-600 mt-1">Cameras Ready</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center">
              <Eye className="w-6 h-6 text-slate-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <CalendarIcon className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">{selectedEvent.camera}</h3>
                    <p className="text-slate-300 text-sm mt-0.5">Rental Details</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Customer</label>
                <p className="text-slate-900 font-semibold mt-1">{selectedEvent.customer}</p>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Camera</label>
                <p className="text-slate-900 font-semibold mt-1">{selectedEvent.camera}</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <label className="text-xs font-semibold text-blue-600 uppercase tracking-wide">Start Date</label>
                  <p className="text-slate-900 font-semibold mt-1 text-sm">
                    {selectedEvent.startDate.toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <label className="text-xs font-semibold text-purple-600 uppercase tracking-wide">End Date</label>
                  <p className="text-slate-900 font-semibold mt-1 text-sm">
                    {selectedEvent.endDate.toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2 block">Status</label>
                <span className={`inline-flex px-3 py-1.5 rounded-lg text-sm font-semibold ${selectedEvent.color}`}>
                  {selectedEvent.status.replace('_', ' ').charAt(0).toUpperCase() + selectedEvent.status.replace('_', ' ').slice(1)}
                </span>
              </div>

              <div className="bg-green-50 rounded-xl p-4 border border-green-200">
                <label className="text-xs font-semibold text-green-600 uppercase tracking-wide">Duration</label>
                <p className="text-slate-900 font-bold mt-1 text-lg">
                  {Math.ceil((selectedEvent.endDate.getTime() - selectedEvent.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-slate-200 flex gap-3">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 px-5 py-2.5 border border-slate-300 rounded-xl text-slate-700 font-semibold hover:bg-slate-50 transition-all duration-200 hover:scale-105 active:scale-95"
              >
                Close
              </button>
              <button
                onClick={() => {
                  window.location.href = `/admin/bookings/${selectedEvent.id}`;
                }}
                className="flex-1 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-xl transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
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
