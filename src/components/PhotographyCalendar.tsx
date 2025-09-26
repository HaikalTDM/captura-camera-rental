'use client';

import { useState } from 'react';
import BookingModal, { BookingFormData } from './BookingModal';

interface CalendarProps {
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date | null;
  showAvailabilityOnly?: boolean;
  className?: string;
}


// Mock availability data - in real app, this would come from database/API
const unavailableDates = [
  '2025-01-15', '2025-01-16', '2025-01-22', '2025-01-29',
  '2025-02-05', '2025-02-14', '2025-02-21', '2025-02-28',
  '2025-03-08', '2025-03-15', '2025-03-22', '2025-03-29'
];

const bookedDates = [
  '2025-01-18', '2025-01-25', '2025-02-01', '2025-02-08',
  '2025-02-15', '2025-02-22', '2025-03-01', '2025-03-09'
];

export default function PhotographyCalendar({ 
  onDateSelect, 
  selectedDate, 
  showAvailabilityOnly = false,
  className = "" 
}: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [modalSelectedDate, setModalSelectedDate] = useState<Date | null>(null);

  const today = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // Get first day of month and number of days
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const firstDayWeekday = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Generate calendar days
  const calendarDays = [];
  
  // Add empty cells for days before month starts
  for (let i = 0; i < firstDayWeekday; i++) {
    calendarDays.push(null);
  }
  
  // Add days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month, day));
  }

  const formatDateString = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateUnavailable = (date: Date) => {
    const dateStr = formatDateString(date);
    return unavailableDates.includes(dateStr);
  };

  const isDateBooked = (date: Date) => {
    const dateStr = formatDateString(date);
    return bookedDates.includes(dateStr);
  };

  const isDatePast = (date: Date) => {
    return date < today;
  };

  const isDateSelected = (date: Date) => {
    if (!selectedDate) return false;
    return formatDateString(date) === formatDateString(selectedDate);
  };

  const handleDateClick = (date: Date) => {
    if (isDatePast(date) || isDateUnavailable(date) || isDateBooked(date)) return;
    
    if (onDateSelect) {
      onDateSelect(date);
    }
    
    if (!showAvailabilityOnly) {
      setModalSelectedDate(date);
      setShowBookingModal(true);
    }
  };

  const handleBookingSubmit = async (bookingData: BookingFormData) => {
    const message = `Hi! I'd like to book photography services:
    
📅 Date: ${bookingData.selectedDate.toLocaleDateString()}
📸 Type: ${bookingData.photographyType}
👤 Name: ${bookingData.name}
📧 Email: ${bookingData.email}
📱 Phone: ${bookingData.phone}
📝 Notes: ${bookingData.notes || 'None'}
    
Please confirm availability and send me more details!`;

    window.open(`https://wa.me/60177464121?text=${encodeURIComponent(message)}`, '_blank');
    
    // Close modal after submission
    setShowBookingModal(false);
    setModalSelectedDate(null);
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


  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];


  return (
    <div className={`bg-white rounded-2xl border-2 border-[#d4af37]/20 shadow-xl overflow-hidden ${className}`}>
      {/* Calendar Header */}
      <div className="bg-gradient-to-r from-black to-gray-900 text-white p-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigateMonth('prev')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <h3 className="text-2xl font-bold font-serif">
            {monthNames[month]} {year}
          </h3>
          
          <button
            onClick={() => navigateMonth('next')}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        
        {!showAvailabilityOnly && (
          <p className="text-white/80 text-center">
            Select your preferred date to start booking
          </p>
        )}
      </div>

      {/* Calendar Grid */}
      <div className="p-6">
        {/* Day Names */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {dayNames.map(day => (
            <div key={day} className="text-center text-sm font-bold text-black/60 uppercase tracking-widest py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Days */}
        <div className="grid grid-cols-7 gap-2">
          {calendarDays.map((date, index) => {
            if (!date) {
              return <div key={index} className="aspect-square" />;
            }

            const isPast = isDatePast(date);
            const isUnavailable = isDateUnavailable(date);
            const isBooked = isDateBooked(date);
            const isSelected = isDateSelected(date);
            const isClickable = !isPast && !isUnavailable && !isBooked;

            return (
              <button
                key={index}
                onClick={() => handleDateClick(date)}
                disabled={!isClickable}
                className={`aspect-square rounded-lg text-sm font-medium transition-all duration-200 relative ${
                  isSelected
                    ? 'bg-[#d4af37] text-black shadow-lg scale-105'
                    : isPast
                    ? 'text-gray-300 cursor-not-allowed'
                    : isBooked
                    ? 'bg-red-100 text-red-600 cursor-not-allowed'
                    : isUnavailable
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'text-black hover:bg-[#d4af37]/20 hover:text-[#d4af37] hover:scale-105'
                }`}
              >
                {date.getDate()}
                
                {/* Status Indicators */}
                {isBooked && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></div>
                )}
                {isUnavailable && !isBooked && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-gray-400 rounded-full"></div>
                )}
                {isClickable && !isSelected && (
                  <div className="absolute top-1 right-1 w-2 h-2 bg-green-500 rounded-full opacity-60"></div>
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="mt-6 flex flex-wrap justify-center gap-4 text-xs">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2 opacity-60"></div>
            <span className="text-black/60">Available</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
            <span className="text-black/60">Booked</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-gray-400 rounded-full mr-2"></div>
            <span className="text-black/60">Unavailable</span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-[#d4af37] rounded-full mr-2"></div>
            <span className="text-black/60">Selected</span>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        isOpen={showBookingModal}
        onClose={() => {
          setShowBookingModal(false);
          setModalSelectedDate(null);
        }}
        selectedDate={modalSelectedDate}
        onSubmit={handleBookingSubmit}
      />
    </div>
  );
}
