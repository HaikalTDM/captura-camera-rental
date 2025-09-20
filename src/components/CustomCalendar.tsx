'use client';

import { useState, useEffect } from 'react';
import { Camera } from '@/types';
import { calculateRentalCost, formatCurrency } from '@/lib/pricing';

interface CustomCalendarProps {
  camera: Camera;
  onDateRangeSelect?: (startDate: Date | null, endDate: Date | null, totalCost: number) => void;
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
}

export default function CustomCalendar({ camera, onDateRangeSelect, className = "" }: CustomCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [isSelectingEndDate, setIsSelectingEndDate] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

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
    };
  };

  const handleDateClick = (day: CalendarDay) => {
    if (day.isPast) return;

    const clickedDate = new Date(day.date);
    
    if (!startDate || (startDate && endDate)) {
      // Start new selection
      setStartDate(clickedDate);
      setEndDate(null);
      setIsSelectingEndDate(true);
    } else if (isSelectingEndDate) {
      // Set end date
      if (clickedDate >= startDate) {
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
      onDateRangeSelect(startDate, endDate, pricing.totalCost);
    } else if (onDateRangeSelect) {
      onDateRangeSelect(startDate, endDate, 0);
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
      <div className="grid grid-cols-7 gap-1 mb-4">
        {calendarDays.map((day, index) => (
          <div
            key={index}
            className={getDayClassName(day)}
            onClick={() => handleDateClick(day)}
            onMouseEnter={() => !day.isPast && setHoveredDate(day.date)}
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
      </div>
    </div>
  );
}
