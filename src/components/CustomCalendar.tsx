'use client';

import { useState, useEffect, useCallback } from 'react';
import { Camera } from '@/types';
import { calculateRentalCost } from '@/lib/pricing';
import { formatDateForAPI } from '@/lib/dateUtils';
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
    let baseClass = "w-8 h-8 sm:w-10 sm:h-10 flex items-center justify-center text-xs sm:text-sm font-medium rounded-lg cursor-pointer transition-all duration-200 ";

    if (day.isPast) {
      baseClass += "text-gray-500 cursor-not-allowed ";
    } else if (day.isUnavailable) {
      baseClass += "bg-red-100 text-red-600 cursor-not-allowed border border-red-200 ";
    } else if (!day.isCurrentMonth) {
      baseClass += "text-gray-600 hover:text-gray-800 hover:bg-gray-100 ";
    } else if (day.isStartDate || day.isEndDate) {
      baseClass += "bg-blue-600 text-white font-bold shadow-md ";
    } else if (day.isInRange) {
      baseClass += "bg-blue-100 text-blue-800 ";
    } else if (day.isToday) {
      baseClass += "bg-gray-100 text-blue-600 font-bold border-2 border-blue-600 ";
    } else {
      baseClass += "text-gray-800 hover:bg-blue-50 hover:text-blue-600 ";
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
      
      <div className={`bg-white rounded-lg border border-gray-200 p-4 ${className}`}>
        {/* Calendar Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigateMonth('prev')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-bold text-gray-900">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h3>
        
        <button
          onClick={() => navigateMonth('next')}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Day Names */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {dayNames.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-700 py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1 mb-4 relative">
        {isLoadingAvailability && (
          <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center z-10 rounded-lg">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              Loading availability...
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
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-sm">
            <span className="font-medium text-gray-800">
              {startDate && endDate ? 'Selected Range:' :
               startDate ? 'Select Return Date:' :
               'Select Rental Dates:'}
            </span>
          </div>
          {(startDate || endDate) && (
            <button
              onClick={clearSelection}
              className="text-xs text-gray-700 hover:text-gray-900 underline"
            >
              Clear
            </button>
          )}
        </div>
        
        {startDate && (
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-800">Start:</span>
              <span className="font-medium text-gray-800">{startDate.toLocaleDateString()}</span>
            </div>
            {endDate && (
              <>
                <div className="flex justify-between">
                  <span className="text-gray-800">End:</span>
                  <span className="font-medium text-gray-800">{endDate.toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-gray-100">
                  <span className="font-medium text-gray-800">Duration:</span>
                  <span className="font-bold text-gray-800">
                    {Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))} days
                  </span>
                </div>
              </>
            )}
          </div>
        )}

        {/* Legend */}
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-600 rounded"></div>
              <span className="text-gray-600">Selected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-100 border border-red-200 rounded"></div>
              <span className="text-gray-600">Unavailable</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-gray-100 border-2 border-blue-600 rounded"></div>
              <span className="text-gray-600">Today</span>
            </div>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
