'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllBookings, getAllCameras } from '@/lib/api/bookings';
import type { Booking, Camera } from '@/lib/supabase';
import Link from 'next/link';

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  bookings: Booking[];
}

export default function AdminCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'month' | 'list'>('month');

  useEffect(() => {
    let mounted = true;
    
    const loadDataSafely = async () => {
      setIsLoading(true);
      try {
        const [bookingsData, camerasData] = await Promise.all([
          getAllBookings(),
          getAllCameras()
        ]);
        
        // Only update state if component is still mounted
        if (mounted) {
          setBookings(bookingsData);
          setCameras(camerasData);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };
    
    loadDataSafely();
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    
    // Cleanup function
    return () => {
      mounted = false;
    };
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [bookingsData, camerasData] = await Promise.all([
        getAllBookings(),
        getAllCameras()
      ]);
      setBookings(bookingsData);
      setCameras(camerasData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function to get bookings for a specific date
  const getBookingsForDate = (date: Date): Booking[] => {
    return bookings.filter(booking => {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);
      
      return date >= startDate && date <= endDate;
    });
  };

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of month
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    // Days from previous month to fill the week
    const startingDayOfWeek = firstDay.getDay();
    const daysFromPrevMonth = startingDayOfWeek;
    
    // Days from next month to complete the grid
    const totalDaysInMonth = lastDay.getDate();
    const totalSlots = Math.ceil((daysFromPrevMonth + totalDaysInMonth) / 7) * 7;
    const daysFromNextMonth = totalSlots - (daysFromPrevMonth + totalDaysInMonth);
    
    const days: CalendarDay[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Previous month days
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month, -i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: date.getTime() === today.getTime(),
        bookings: getBookingsForDate(date)
      });
    }
    
    // Current month days
    for (let day = 1; day <= totalDaysInMonth; day++) {
      const date = new Date(year, month, day);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        bookings: getBookingsForDate(date)
      });
    }
    
    // Next month days
    for (let i = 1; i <= daysFromNextMonth; i++) {
      const date = new Date(year, month + 1, i);
      date.setHours(0, 0, 0, 0);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        bookings: getBookingsForDate(date)
      });
    }
    
    return days;
  }, [currentDate, bookings]);

  const selectedDateBookings = useMemo(() => {
    if (!selectedDate) return [];
    return getBookingsForDate(selectedDate);
  }, [selectedDate, bookings]);

  const navigateMonth = (direction: number) => {
    // Use requestAnimationFrame to batch state updates
    requestAnimationFrame(() => {
      const newDate = new Date(currentDate);
      newDate.setMonth(currentDate.getMonth() + direction);
      setCurrentDate(newDate);
      setSelectedDate(null); // Reset selected date when changing months
    });
  };

  const goToToday = () => {
    requestAnimationFrame(() => {
      setCurrentDate(new Date());
      setSelectedDate(new Date());
    });
  };
  
  // Cleanup selected date when switching view modes
  useEffect(() => {
    if (viewMode === 'list') {
      setSelectedDate(null);
    }
  }, [viewMode]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Camera color mapping - each camera gets a unique color
  const getCameraColor = (cameraName: string) => {
    const colors: { [key: string]: string } = {
      'DJI Osmo Pocket 3': 'bg-slate-900',
      'DJI Osmo Pocket 3 (ii)': 'bg-purple-500',
      'DJI Action 5 Pro': 'bg-orange-500',
      'Insta360 X5': 'bg-pink-500',
    };
    
    // Return specific color if defined, otherwise generate a color based on camera name
    return colors[cameraName] || 'bg-teal-500';
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return 'bg-emerald-500';
      case 'pending_approval':
        return 'bg-amber-500';
      case 'completed':
        return 'bg-blue-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-slate-500';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-96 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} rounded-2xl`}>
        <div className="text-center space-y-4">
          <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${isDarkMode ? 'border-white' : 'border-black'} mx-auto`}></div>
          <p className={`text-sm font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Loading bookings calendar...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
      {/* Header Controls */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className={`flex gap-1 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} p-1 rounded-xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} shadow-sm`}>
            <button
              onClick={() => setViewMode('month')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 ${
                viewMode === 'month'
                  ? 'bg-black text-white'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Month
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 active:scale-95 ${
                viewMode === 'list'
                  ? 'bg-black text-white'
                  : isDarkMode ? 'text-slate-400 hover:text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              List
            </button>
          </div>
        </div>

        {/* Today Button */}
        <button
          onClick={goToToday}
          className={`px-4 py-2 rounded-xl font-bold text-sm transition-all duration-200 active:scale-95 ${
            isDarkMode 
              ? 'bg-slate-900 hover:bg-slate-800 border border-slate-800' 
              : 'bg-white hover:bg-slate-50 border border-slate-200'
          } shadow-sm`}
        >
          Today
        </button>
      </div>

      {viewMode === 'month' ? (
        <>
          {/* Month Navigation */}
          <div className={`flex items-center justify-between p-4 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-2xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} shadow-sm`}>
            <button
              onClick={() => navigateMonth(-1)}
              className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center transition-all duration-200 active:scale-95`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <div className="text-center">
              <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h3>
              <p className={`text-sm font-semibold mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                {bookings.length} total bookings
              </p>
            </div>
            
            <button
              onClick={() => navigateMonth(1)}
              className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center transition-all duration-200 active:scale-95`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-2xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} shadow-sm overflow-hidden`}>
            {/* Day Names Header */}
            <div className="grid grid-cols-7 border-b ${isDarkMode ? 'border-slate-800 bg-slate-800/50' : 'border-slate-200 bg-slate-50'}">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="py-3 text-center text-xs font-bold uppercase tracking-wider text-slate-500"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {calendarDays.map((day, index) => (
                <button
                  key={`${day.date.getTime()}-${index}`}
                  onClick={() => setSelectedDate(day.date)}
                  className={`relative min-h-[80px] sm:min-h-[100px] p-2 border-b border-r ${
                    isDarkMode ? 'border-slate-800' : 'border-slate-200'
                  } ${
                    index % 7 === 6 ? 'border-r-0' : ''
                  } ${
                    index >= calendarDays.length - 7 ? 'border-b-0' : ''
                  } transition-all duration-200 hover:bg-opacity-80 ${
                    day.isToday
                      ? isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
                      : day.isCurrentMonth
                      ? isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-50'
                      : isDarkMode ? 'bg-slate-950 hover:bg-slate-900' : 'bg-slate-50/50 hover:bg-slate-100/50'
                  } ${
                    selectedDate && day.date.getTime() === selectedDate.getTime()
                      ? isDarkMode ? 'ring-2 ring-white ring-inset' : 'ring-2 ring-black ring-inset'
                      : ''
                  } active:scale-[0.98] group`}
                >
                  {/* Date Number */}
                  <div className={`text-sm font-bold mb-1 ${
                    day.isToday
                      ? isDarkMode ? 'text-white' : 'text-black'
                      : day.isCurrentMonth
                      ? isDarkMode ? 'text-white' : 'text-slate-900'
                      : isDarkMode ? 'text-slate-600' : 'text-slate-400'
                  }`}>
                    {day.date.getDate()}
                  </div>

                  {/* Camera Indicators - Show which cameras are booked */}
                  <div className="flex flex-wrap gap-1 mt-1 min-h-[8px]">
                    {day.bookings.length > 0 && (
                      <>
                        {Array.from(new Set(day.bookings.map(b => b.camera?.name))).filter(Boolean).slice(0, 3).map((cameraName, idx) => (
                          <div
                            key={`camera-${day.date.getTime()}-${cameraName}-${idx}`}
                            className={`w-2 h-2 rounded-full ${getCameraColor(cameraName || '')} opacity-90 group-hover:opacity-100 transition-all group-hover:scale-125 shadow-sm`}
                            title={cameraName || ''}
                          />
                        ))}
                        {Array.from(new Set(day.bookings.map(b => b.camera?.name))).filter(Boolean).length > 3 && (
                          <div className={`text-[10px] font-bold ${isDarkMode ? 'text-slate-500' : 'text-slate-600'} ml-0.5`}>
                            +{Array.from(new Set(day.bookings.map(b => b.camera?.name))).filter(Boolean).length - 3}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Selected Date Bookings */}
          {selectedDate && selectedDateBookings.length > 0 && (
            <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-2xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} shadow-sm p-4 animate-fadeIn`}>
              <div className="flex items-center justify-between mb-4">
                <h4 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  {selectedDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                </h4>
                <span className={`px-3 py-1.5 rounded-lg text-sm font-bold ${isDarkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-600'}`}>
                  {selectedDateBookings.length} {selectedDateBookings.length === 1 ? 'Booking' : 'Bookings'}
                </span>
              </div>

              <div className="space-y-3">
                {selectedDateBookings.map((booking, index) => (
                  <Link
                    key={booking.id}
                    href={`/admin/mobile/bookings/${booking.id}`}
                    className={`block ${isDarkMode ? 'bg-slate-800/50 hover:bg-slate-800' : 'bg-slate-50 hover:bg-slate-100'} rounded-xl p-3 transition-all duration-200 active:scale-[0.98] animate-fadeIn`}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {/* Camera Color Indicator */}
                        <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getCameraColor(booking.camera?.name || '')} shadow-lg`}></div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {booking.customer?.full_name}
                            </p>
                            <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0 ${getStatusColor(booking.booking_status)} text-white`}>
                              {booking.booking_status === 'pending_approval' ? 'Pending' : booking.booking_status}
                            </span>
                          </div>
                          <p className={`text-xs font-semibold mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            📷 {booking.camera?.name}
                          </p>
                        </div>
                      </div>
                      <svg className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        // List View
        <div className="space-y-3">
          {bookings.map((booking, index) => (
            <Link
              key={booking.id}
              href={`/admin/mobile/bookings/${booking.id}`}
              className={`block ${isDarkMode ? 'bg-slate-900 border-slate-800 hover:bg-slate-800' : 'bg-white border-slate-200 hover:bg-slate-50'} rounded-2xl border shadow-sm transition-all duration-200 active:scale-[0.98] p-4 animate-fadeIn`}
              style={{ animationDelay: `${index * 30}ms` }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Camera Color Indicator */}
                  <div className={`w-3 h-3 rounded-full flex-shrink-0 ${getCameraColor(booking.camera?.name || '')} shadow-lg`}></div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {booking.customer?.full_name}
                      </p>
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex-shrink-0 ${getStatusColor(booking.booking_status)} text-white`}>
                        {booking.booking_status === 'pending_approval' ? 'Pending' : booking.booking_status}
                      </span>
                    </div>
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      📷 {booking.camera?.name}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} uppercase tracking-wider`}>
                    Rental Period
                  </p>
                  <p className={`text-sm font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                    {' - '}
                    {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} uppercase tracking-wider`}>
                    Total Amount
                  </p>
                  <p className={`text-lg font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    RM{booking.total_amount}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Legend - Camera Colors */}
      <div className={`p-4 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-2xl border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} shadow-sm`}>
        <h4 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wider`}>
          Camera Legend
        </h4>
        <div className="flex flex-wrap gap-3 items-center">
          {cameras.map((camera) => (
            <div key={camera.id} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getCameraColor(camera.name)} shadow-sm`}></div>
              <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                {camera.name}
              </span>
            </div>
          ))}
        </div>
        {cameras.length === 0 && (
          <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
            No cameras available
          </p>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out forwards;
        }
        
        /* Prevent layout shift during animations */
        .grid > button {
          will-change: auto;
        }
      `}</style>
    </div>
  );
}

