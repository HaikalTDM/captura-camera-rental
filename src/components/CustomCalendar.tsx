'use client';

import { useState, useEffect, useCallback } from 'react';
import { Camera } from '@/types';
import { calculateRentalCost } from '@/lib/pricing';
import { formatDateForAPI, calculateDaysBetween } from '@/lib/dateUtils';
import Toast from './Toast';
import type { ToastData } from '@/hooks/useToast';

interface CustomCalendarProps {
  camera: Camera;
  onDateRangeSelect?: (startDate: Date | null, endDate: Date | null, totalCost: number, totalDays?: number, dailyRate?: number) => void;
  className?: string;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  isPast: boolean;
  isSelected: boolean;
  isInRange: boolean;
  isStartDate: boolean;
  isEndDate: boolean;
  isUnavailable: boolean;
}

interface UnavailableDate {
  date: string;
  type: string;
  reason: string;
  booking_id?: string;
}

export default function CustomCalendar({ camera, onDateRangeSelect, className = "" }: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);
  const [unavailableDates, setUnavailableDates] = useState<UnavailableDate[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [toast, setToast] = useState<ToastData | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Fetch unavailable dates for the current month
  const fetchUnavailableDates = useCallback(async () => {
    if (!camera.id) return;

    setIsLoadingAvailability(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();

      // Format dates to avoid timezone issues
      const startOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-01`;
      const lastDay = new Date(year, month + 1, 0).getDate();
      const endOfMonth = `${year}-${String(month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

      const response = await fetch(`/api/calendar/availability?camera_id=${camera.id}&start_date=${startOfMonth}&end_date=${endOfMonth}`);
      const data = await response.json();

      if (data.success) {
        setUnavailableDates(data.unavailable_dates || []);
      } else {
        console.error('Failed to fetch availability:', data.error);
        setUnavailableDates([]);
      }
    } catch (error) {
      console.error('Error fetching unavailable dates:', error);
      setUnavailableDates([]);
    } finally {
      setIsLoadingAvailability(false);
    }
  }, [camera.id, currentDate]);

  // Fetch unavailable dates when component mounts or month changes
  useEffect(() => {
    fetchUnavailableDates();
  }, [fetchUnavailableDates]);

  // Check if a date is unavailable
  const isDateUnavailable = (date: Date): boolean => {
    const dateStr = formatDateForAPI(date);
    return unavailableDates.some(unavailable => unavailable.date === dateStr);
  };

  // Generate calendar days for the current month
  const generateCalendarDays = (): CalendarDay[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const firstDayOfWeek = firstDayOfMonth.getDay();
    const daysInMonth = lastDayOfMonth.getDate();

    const days: CalendarDay[] = [];

    // Add days from previous month
    const prevMonth = new Date(year, month - 1, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonth.getDate() - i);
      days.push(createCalendarDay(date, false));
    }

    // Add days from current month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      days.push(createCalendarDay(date, true));
    }

    // Add days from next month to complete the grid
    const remainingDays = 42 - days.length; // 6 rows × 7 days
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push(createCalendarDay(date, false));
    }

    return days;
  };

  const createCalendarDay = (date: Date, isCurrentMonth: boolean): CalendarDay => {
    const dateTime = date.getTime();
    const todayTime = today.getTime();
    const startTime = startDate?.getTime();
    const endTime = endDate?.getTime();
    const hoveredTime = hoveredDate?.getTime();

    let isInRange = false;
    if (startTime && endTime) {
      isInRange = dateTime >= startTime && dateTime <= endTime;
    } else if (startTime && hoveredTime && isSelectingEndDate) {
      const rangeStart = Math.min(startTime, hoveredTime);
      const rangeEnd = Math.max(startTime, hoveredTime);
      isInRange = dateTime >= rangeStart && dateTime <= rangeEnd;
    }

    return {
      date,
      isCurrentMonth,
      isToday: dateTime === todayTime,
      isPast: dateTime < todayTime,
      isSelected: dateTime === startTime || dateTime === endTime,
      isInRange,
      isStartDate: dateTime === startTime,
      isEndDate: dateTime === endTime,
      isUnavailable: isDateUnavailable(date),
    };
  };

  // Check if there are any unavailable dates between start and end
  const hasUnavailableDatesInRange = (start: Date, end: Date): boolean => {
    const currentDate = new Date(start);
    currentDate.setDate(currentDate.getDate() + 1); // Start from day after start

    while (currentDate < end) {
      if (isDateUnavailable(currentDate)) {
        return true;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }
    return false;
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.isPast || day.isUnavailable) return;

    const clickedDate = new Date(day.date);

    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(clickedDate);
      setEndDate(null);
      setIsSelectingEndDate(true);
    } else if (isSelectingEndDate) {
      // Set end date - use date comparison that works for same day
      const clickedDateStr = formatDateForAPI(clickedDate);
      const startDateStr = formatDateForAPI(startDate);

      if (clickedDateStr >= startDateStr) {
        // Check if there are any unavailable dates in the selected range
        if (hasUnavailableDatesInRange(startDate, clickedDate)) {
          setToast({
            id: Math.random().toString(36).substr(2, 9),
            message: 'Your selected date range contains unavailable dates. Please select a different range.',
            type: 'warning',
            duration: 5000
          });
          return;
        }
        setEndDate(clickedDate);
        setIsSelectingEndDate(false);
      } else {
        // If clicked date is before start date, make it the new start date
        setStartDate(clickedDate);
        setEndDate(null);
      }
    }
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const clearSelection = () => {
    setStartDate(null);
    setEndDate(null);
    setIsSelectingEndDate(false);
    setHoveredDate(null);
  };

  // Calculate pricing when dates change
  useEffect(() => {
    if (startDate && endDate && onDateRangeSelect) {
      const pricing = calculateRentalCost(camera, startDate, endDate);
      onDateRangeSelect(startDate, endDate, pricing.totalCost, pricing.totalDays, pricing.dailyRate);
    } else if (onDateRangeSelect) {
      // Provide default values when no dates are selected
      onDateRangeSelect(startDate, endDate, 0, 0, camera.dailyRate || 0);
    }
  }, [startDate, endDate, camera, onDateRangeSelect]);

  const calendarDays = generateCalendarDays();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const getDayClassName = (day: CalendarDay) => {
    let baseClass = "w-9 h-9 sm:w-11 sm:h-11 flex items-center justify-center text-xs sm:text-sm font-medium rounded-xl cursor-pointer transition-all duration-300 relative border ";

    if (day.isPast) {
      baseClass += "text-zinc-700 border-transparent cursor-not-allowed ";
    } else if (day.isUnavailable) {
      baseClass += "bg-red-500/5 text-red-500/50 cursor-not-allowed border-red-500/10 ";
    } else if (!day.isCurrentMonth) {
      baseClass += "text-zinc-800 border-transparent hover:text-zinc-500 ";
    } else if (day.isStartDate || day.isEndDate) {
      baseClass += "bg-white text-black font-black shadow-[0_0_15px_rgba(255,255,255,0.3)] z-10 border-white scale-105 ";
    } else if (day.isInRange) {
      baseClass += "bg-white/10 text-white border-white/5 ";
    } else if (day.isToday) {
      baseClass += "bg-zinc-800 text-white font-bold border-white/20 ";
    } else {
      baseClass += "text-zinc-400 hover:bg-white/10 hover:text-white border-transparent hover:border-white/10 ";
    }

    return baseClass;
  };

  return (
    <>
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => setToast(null)}
        />
      )}

      <div className={`bg-zinc-900 rounded-2xl border border-white/5 p-4 ${className}`}>
        {/* Calendar Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors group"
          >
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <h3 className="text-lg font-bold text-white tracking-tight">
            {monthNames[currentDate.getMonth()]} <span className="text-zinc-500">{currentDate.getFullYear()}</span>
          </h3>

          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors group"
          >
            <svg className="w-5 h-5 text-zinc-400 group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Day Names */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map(day => (
            <div key={day} className="text-center text-[10px] font-bold uppercase tracking-wider text-zinc-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 mb-6 relative">
          {isLoadingAvailability && (
            <div className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-xl">
              <div className="flex items-center gap-2 text-sm text-zinc-400">
                <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                Checking dates...
              </div>
            </div>
          )}
          {calendarDays.map((day, index) => (
            <div
              key={index}
              className={getDayClassName(day)}
              onClick={() => handleDateClick(day)}
              onMouseEnter={() => !day.isPast && !day.isUnavailable && setHoveredDate(day.date)}
              onMouseLeave={() => setHoveredDate(null)}
            >
              {day.date.getDate()}
            </div>
          ))}
        </div>

        {/* Selection Info */}
        <div className="border-t border-white/5 pt-5">
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm">
              <span className="font-medium text-zinc-400">
                {startDate && endDate ? 'Selected Range:' :
                  startDate ? 'Select Return Date:' :
                    'Select Rental Dates:'}
              </span>
            </div>
            {(startDate || endDate) && (
              <button
                onClick={clearSelection}
                className="text-xs text-zinc-500 hover:text-white transition-colors"
              >
                Clear Selection
              </button>
            )}
          </div>

          {startDate && (
            <div className="bg-zinc-800/50 rounded-xl p-4 space-y-3 text-sm border border-white/5">
              <div className="flex justify-between items-center">
                <span className="text-zinc-400">Start Date</span>
                <span className="font-bold text-white">{startDate.toLocaleDateString()}</span>
              </div>
              {endDate && (
                <>
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">End Date</span>
                    <span className="font-bold text-white">{endDate.toLocaleDateString()}</span>
                  </div>
                  <div className="border-t border-white/5 my-2"></div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-zinc-300">Total Duration</span>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-white text-black text-xs font-black rounded uppercase tracking-wide">
                        {calculateDaysBetween(startDate, endDate)} DAYS
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}

          {/* Legend */}
          <div className="mt-4 flex flex-wrap gap-4 text-[10px] font-bold uppercase tracking-wide text-zinc-500 justify-center">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-white rounded-full"></div>
              <span>Selected</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-red-500/50 rounded-full"></div>
              <span>Unavailable</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 bg-zinc-700 border border-white/20 rounded-full"></div>
              <span>Today</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
