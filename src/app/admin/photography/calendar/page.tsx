'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  time: string;
  type: 'booking' | 'consultation' | 'editing' | 'blocked';
  status: 'confirmed' | 'pending' | 'completed';
  client?: string;
  location?: string;
  duration: number; // in hours
  notes?: string;
}

interface AvailabilitySlot {
  date: string;
  isAvailable: boolean;
  reason?: string;
}

function unwrapRelation<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null;
  }
  return value ?? null;
}

export default function CalendarManagement() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [view, setView] = useState<'month' | 'week' | 'day'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [showEventModal, setShowEventModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  // Load events from database
  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      setIsLoading(true);
      
      // Load photography bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('photography_bookings')
        .select(`
          id,
          event_date,
          event_time,
          event_type,
          status,
          notes,
          customer:customers(full_name),
          package:photography_packages(name)
        `)
        .order('event_date', { ascending: true });

      if (bookingsError) {
        console.error('Error loading photography bookings:', bookingsError);
      }

      // Load calendar events
      const { data: calendarEvents, error: calendarError } = await supabase
        .from('photography_calendar_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (calendarError) {
        console.error('Error loading calendar events:', calendarError);
      }

      // Transform bookings to calendar events
      const bookingEvents: CalendarEvent[] = (bookings || []).map(booking => {
        const bookingPackage = unwrapRelation(booking.package);
        const bookingCustomer = unwrapRelation(booking.customer);

        return {
          id: `booking-${booking.id}`,
          title: bookingPackage?.name || `${booking.event_type} Photography`,
          date: booking.event_date,
          time: booking.event_time || '09:00',
          type: 'booking' as const,
          status: booking.status as 'confirmed' | 'pending' | 'completed',
          client: bookingCustomer?.full_name || 'Unknown Client',
          location: booking.event_type || '',
          duration: 4, // Default duration
          notes: booking.notes || ''
        };
      });

      // Transform calendar events
      const transformedCalendarEvents: CalendarEvent[] = (calendarEvents || []).map(event => ({
        id: `event-${event.id}`,
        title: event.title,
        date: event.event_date,
        time: event.event_time,
        type: event.event_type as 'booking' | 'consultation' | 'editing' | 'blocked',
        status: event.status as 'confirmed' | 'pending' | 'completed',
        client: event.client_name || '',
        location: event.location || '',
        duration: event.duration || 1,
        notes: event.notes || ''
      }));

      // Combine all events
      setEvents([...bookingEvents, ...transformedCalendarEvents]);
    } catch (error) {
      console.error('Error in loadEvents:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }
    
    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    return events.filter(event => event.date === dateString);
  };

  // Navigate calendar
  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(newDate.getMonth() - 1);
      } else {
        newDate.setMonth(newDate.getMonth() + 1);
      }
      return newDate;
    });
  };

  const goToToday = () => {
    setCurrentDate(new Date());
    setSelectedDate(new Date());
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    const dayEvents = getEventsForDate(date);
    if (dayEvents.length === 1) {
      setSelectedEvent(dayEvents[0]);
      setShowEventModal(true);
    }
  };

  const getEventTypeColor = (type: CalendarEvent['type']) => {
    switch (type) {
      case 'booking': return 'bg-[#d4af37] text-black';
      case 'consultation': return 'bg-blue-500 text-white';
      case 'editing': return 'bg-purple-500 text-white';
      case 'blocked': return 'bg-gray-500 text-white';
      default: return 'bg-gray-300 text-black';
    }
  };

  const getStatusColor = (status: CalendarEvent['status']) => {
    switch (status) {
      case 'confirmed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'completed': return 'text-blue-600';
      default: return 'text-gray-600';
    }
  };

  const days = getDaysInMonth(currentDate);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const upcomingEvents = events
    .filter(event => new Date(event.date) >= new Date())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .slice(0, 5);

  const thisMonthBookings = events.filter(event => {
    const eventDate = new Date(event.date);
    return eventDate.getMonth() === currentDate.getMonth() && 
           eventDate.getFullYear() === currentDate.getFullYear() &&
           event.type === 'booking';
  }).length;

  const thisMonthRevenue = events
    .filter(event => {
      const eventDate = new Date(event.date);
      return eventDate.getMonth() === currentDate.getMonth() && 
             eventDate.getFullYear() === currentDate.getFullYear() &&
             event.type === 'booking' && event.status === 'confirmed';
    })
    .length * 850; // Average booking value

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading calendar events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-4 font-serif">Calendar Management</h1>
            <div className="w-16 h-px bg-[#d4af37] mx-auto mb-4"></div>
            <p className="text-black/60 text-lg max-w-2xl mx-auto">
              Manage your schedule, bookings, and availability
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Calendar Section */}
          <div className="lg:col-span-3">
            {/* Calendar Header */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => navigateMonth('prev')}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-2xl font-bold text-black font-serif">
                    {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <button
                    onClick={() => navigateMonth('next')}
                    className="p-2 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button
                    onClick={goToToday}
                    className="px-4 py-2 bg-[#d4af37] text-black font-medium rounded-lg hover:bg-[#d4af37]/90 transition-colors"
                  >
                    Today
                  </button>
                </div>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Day Headers */}
                {dayNames.map(day => (
                  <div key={day} className="p-3 text-center font-medium text-black/60 text-sm">
                    {day}
                  </div>
                ))}

                {/* Calendar Days */}
                {days.map((day, index) => {
                  if (!day) {
                    return <div key={index} className="p-3 h-24"></div>;
                  }

                  const dayEvents = getEventsForDate(day);
                  const isToday = day.toDateString() === new Date().toDateString();
                  const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString();

                  return (
                    <div
                      key={index}
                      onClick={() => handleDateClick(day)}
                      className={`p-2 h-24 border border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                        isToday ? 'bg-[#d4af37]/10 border-[#d4af37]' : ''
                      } ${
                        isSelected ? 'bg-[#d4af37]/20 border-[#d4af37]' : ''
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-[#d4af37]' : 'text-black'
                      }`}>
                        {day.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className={`text-xs px-1 py-0.5 rounded truncate ${getEventTypeColor(event.type)}`}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-black/60 uppercase tracking-wide font-medium">This Month</p>
                    <p className="text-2xl font-bold text-black">{thisMonthBookings} Bookings</p>
                  </div>
                  <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Revenue</p>
                    <p className="text-2xl font-bold text-black">RM{thisMonthRevenue.toLocaleString()}</p>
                  </div>
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Available Days</p>
                    <p className="text-2xl font-bold text-black">{31 - thisMonthBookings}</p>
                  </div>
                  <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
              <h3 className="text-lg font-bold text-black mb-4 font-serif">Upcoming Events</h3>
              <div className="space-y-3">
                {upcomingEvents.map(event => (
                  <div
                    key={event.id}
                    className="p-3 border border-gray-200 rounded-lg hover:border-[#d4af37] transition-colors cursor-pointer"
                    onClick={() => {
                      setSelectedEvent(event);
                      setShowEventModal(true);
                    }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getEventTypeColor(event.type)}`}>
                        {event.type}
                      </span>
                      <span className={`text-xs font-medium ${getStatusColor(event.status)}`}>
                        {event.status}
                      </span>
                    </div>
                    <h4 className="font-medium text-black text-sm">{event.title}</h4>
                    <p className="text-xs text-black/60">
                      {new Date(event.date).toLocaleDateString()} at {event.time}
                    </p>
                    {event.client && (
                      <p className="text-xs text-black/60">{event.client}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
              <h3 className="text-lg font-bold text-black mb-4 font-serif">Event Types</h3>
              <div className="space-y-2">
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-[#d4af37] rounded"></div>
                  <span className="text-sm text-black">Photography Booking</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  <span className="text-sm text-black">Client Consultation</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  <span className="text-sm text-black">Editing Session</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-4 h-4 bg-gray-500 rounded"></div>
                  <span className="text-sm text-black">Blocked/Unavailable</span>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
              <h3 className="text-lg font-bold text-black mb-4 font-serif">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full px-4 py-3 bg-[#d4af37] text-black font-medium rounded-lg hover:bg-[#d4af37]/90 transition-colors text-sm">
                  Block Date/Time
                </button>
                <button className="w-full px-4 py-3 border border-[#d4af37] text-[#d4af37] font-medium rounded-lg hover:bg-[#d4af37] hover:text-black transition-colors text-sm">
                  Set Availability
                </button>
                <button className="w-full px-4 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  Export Calendar
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Event Details Modal */}
      {showEventModal && selectedEvent && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={() => setShowEventModal(false)}></div>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-black font-serif">Event Details</h3>
                  <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-gray-600">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 text-sm font-medium rounded ${getEventTypeColor(selectedEvent.type)}`}>
                        {selectedEvent.type}
                      </span>
                      <span className={`text-sm font-medium ${getStatusColor(selectedEvent.status)}`}>
                        {selectedEvent.status}
                      </span>
                    </div>
                    <h4 className="text-xl font-bold text-black">{selectedEvent.title}</h4>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-black/60 text-sm">Date</p>
                      <p className="text-black font-medium">{new Date(selectedEvent.date).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-black/60 text-sm">Time</p>
                      <p className="text-black font-medium">{selectedEvent.time}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-black/60 text-sm">Duration</p>
                    <p className="text-black font-medium">{selectedEvent.duration} hour{selectedEvent.duration > 1 ? 's' : ''}</p>
                  </div>
                  
                  {selectedEvent.client && (
                    <div>
                      <p className="text-black/60 text-sm">Client</p>
                      <p className="text-black font-medium">{selectedEvent.client}</p>
                    </div>
                  )}
                  
                  {selectedEvent.location && (
                    <div>
                      <p className="text-black/60 text-sm">Location</p>
                      <p className="text-black font-medium">{selectedEvent.location}</p>
                    </div>
                  )}
                  
                  {selectedEvent.notes && (
                    <div>
                      <p className="text-black/60 text-sm">Notes</p>
                      <p className="text-black">{selectedEvent.notes}</p>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  onClick={() => setShowEventModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37] sm:mt-0 sm:w-auto sm:text-sm"
                >
                  Close
                </button>
                <button
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-[#d4af37] text-base font-medium text-black hover:bg-[#d4af37]/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d4af37] sm:ml-3 sm:w-auto sm:text-sm mr-3"
                >
                  Edit Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
