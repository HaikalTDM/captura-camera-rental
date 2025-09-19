'use client';

import { useState, useEffect } from 'react';
import { mockBookings } from '@/data/mockAdminData';

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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState<'month' | 'week'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showEventModal, setShowEventModal] = useState(false);

  useEffect(() => {
    // Convert bookings to calendar events
    const calendarEvents = mockBookings.map(booking => ({
      id: booking.id,
      title: `${booking.cameraName}`,
      camera: booking.cameraName,
      customer: booking.customerName,
      startDate: new Date(booking.startDate),
      endDate: new Date(booking.endDate),
      status: booking.status,
      color: getStatusColor(booking.status)
    }));
    setEvents(calendarEvents);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-900';
      case 'confirmed': return 'bg-blue-100 border-l-4 border-blue-500 text-blue-900';
      case 'active': return 'bg-green-100 border-l-4 border-green-500 text-green-900';
      case 'completed': return 'bg-gray-100 border-l-4 border-gray-500 text-gray-900';
      default: return 'bg-gray-100 border-l-4 border-gray-500 text-gray-900';
    }
  };

  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days: CalendarDay[] = [];
    const today = new Date();
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dayEvents = events.filter(event => {
        const eventStart = new Date(event.startDate);
        const eventEnd = new Date(event.endDate);
        return date >= eventStart && date <= eventEnd;
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

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Rental Calendar</h1>
          <p className="text-gray-700 mt-2">View and manage camera rental schedules</p>
        </div>
        
        <div className="flex items-center gap-4">
          {/* View Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setSelectedView('month')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'month'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Month
            </button>
            <button
              onClick={() => setSelectedView('week')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                selectedView === 'week'
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Week
            </button>
          </div>
          
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Today
          </button>
        </div>
      </div>

      {/* Calendar Navigation */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h2 className="text-2xl font-bold text-gray-900">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </h2>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span className="text-gray-800 font-medium">Pending</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded"></div>
            <span className="text-gray-800 font-medium">Confirmed</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span className="text-gray-800 font-medium">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-500 rounded"></div>
            <span className="text-gray-800 font-medium">Completed</span>
          </div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        {/* Day Headers */}
        <div className="grid grid-cols-7 border-b border-gray-200">
          {dayNames.map(day => (
            <div key={day} className="p-4 text-center font-semibold text-gray-800 bg-gray-50">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-r border-b border-gray-100 ${
                !day.isCurrentMonth ? 'bg-gray-50' : 'bg-white'
              } ${day.isToday ? 'bg-blue-50' : ''}`}
            >
              {/* Date Number */}
              <div className={`text-sm font-medium mb-2 ${
                !day.isCurrentMonth ? 'text-gray-400' : 'text-gray-900'
              } ${day.isToday ? 'text-blue-600 font-bold' : ''}`}>
                {day.date.getDate()}
              </div>

              {/* Events */}
              <div className="space-y-1">
                {day.bookings.slice(0, 3).map((booking, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={`text-xs p-1 rounded border-l-2 ${booking.color} truncate cursor-pointer hover:shadow-sm transition-shadow`}
                    title={`${booking.customer} - ${booking.camera}`}
                    onClick={() => handleEventClick(booking)}
                  >
                    <div className="font-medium">{booking.camera}</div>
                    <div className="opacity-75">{booking.customer}</div>
                  </div>
                ))}
                
                {day.bookings.length > 3 && (
                  <div className="text-xs text-gray-700 font-medium">
                    +{day.bookings.length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">This Month</p>
              <p className="text-2xl font-bold text-blue-600 mt-2">
                {events.filter(e => e.startDate.getMonth() === currentDate.getMonth()).length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Total Bookings</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">📅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">Active Now</p>
              <p className="text-2xl font-bold text-green-600 mt-2">
                {events.filter(e => e.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Cameras Out</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">📷</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">Pending</p>
              <p className="text-2xl font-bold text-yellow-600 mt-2">
                {events.filter(e => e.status === 'pending').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Need Confirmation</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">⏳</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-700 uppercase tracking-wide">Available</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {2 - events.filter(e => e.status === 'active').length}
              </p>
              <p className="text-sm text-gray-600 mt-1">Cameras Ready</p>
            </div>
            <div className="w-12 h-12 bg-gradient-to-br from-gray-500 to-gray-600 rounded-xl flex items-center justify-center">
              <span className="text-xl">✅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-gray-200">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{selectedEvent.camera}</h3>
                  <p className="text-gray-700 mt-1">Rental Details</p>
                </div>
                <button
                  onClick={() => setShowEventModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-800">Customer</label>
                <p className="text-gray-900 font-medium">{selectedEvent.customer}</p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">Camera</label>
                <p className="text-gray-900 font-medium">{selectedEvent.camera}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-800">Start Date</label>
                  <p className="text-gray-900">{selectedEvent.startDate.toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800">End Date</label>
                  <p className="text-gray-900">{selectedEvent.endDate.toLocaleDateString()}</p>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">Status</label>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedEvent.color}`}>
                  {selectedEvent.status.charAt(0).toUpperCase() + selectedEvent.status.slice(1)}
                </span>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-800">Duration</label>
                <p className="text-gray-900">
                  {Math.ceil((selectedEvent.endDate.getTime() - selectedEvent.startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                </p>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
              <button
                onClick={() => setShowEventModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  // Navigate to booking details
                  window.location.href = `/admin/bookings/${selectedEvent.id}`;
                }}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
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
