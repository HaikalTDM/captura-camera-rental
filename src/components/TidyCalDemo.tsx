'use client';

import { useState } from 'react';

interface TidyCalDemoProps {
  cameraId: string;
  cameraName: string;
  className?: string;
}

export default function TidyCalDemo({ cameraId, cameraName, className = "" }: TidyCalDemoProps) {
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Generate calendar days for current month
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    
    return days;
  };

  const timeSlots = [
    '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
    '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
  ];

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const today = new Date();
  const currentMonth = monthNames[today.getMonth()];
  const currentYear = today.getFullYear();

  return (
    <div className={`tidycal-demo bg-white rounded-lg border ${className}`}>
      {/* Header */}
      <div className="p-4 border-b bg-blue-50">
        <h3 className="font-semibold text-gray-900 mb-1">📅 Book {cameraName}</h3>
        <p className="text-sm text-gray-600">Select your preferred pickup date and time</p>
      </div>

      {/* Calendar */}
      <div className="p-4">
        <div className="mb-4">
          <h4 className="font-medium text-gray-900 mb-3">{currentMonth} {currentYear}</h4>
          
          {/* Days of week header */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-1">
            {generateCalendarDays().map((day, index) => (
              <button
                key={index}
                onClick={() => day && setSelectedDate(`${currentYear}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`)}
                disabled={!day || day < today.getDate()}
                className={`
                  h-8 text-sm rounded transition-colors
                  ${!day ? 'invisible' : ''}
                  ${day && day < today.getDate() ? 'text-gray-400 cursor-not-allowed' : ''}
                  ${day && day >= today.getDate() ? 'hover:bg-blue-100 text-gray-800' : ''}
                  ${selectedDate.endsWith(day?.toString().padStart(2, '0') || '') ? 'bg-blue-500 text-white' : ''}
                `}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        {/* Time slots */}
        {selectedDate && (
          <div className="mt-4">
            <h4 className="font-medium text-gray-900 mb-3">Available Times</h4>
            <div className="grid grid-cols-3 gap-2">
              {timeSlots.map(time => (
                <button
                  key={time}
                  onClick={() => setSelectedTime(time)}
                  className={`
                    p-2 text-sm rounded border transition-colors
                    ${selectedTime === time 
                      ? 'bg-blue-500 text-white border-blue-500' 
                      : 'bg-white text-gray-700 border-gray-200 hover:border-blue-300'
                    }
                  `}
                >
                  {time}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Booking summary */}
        {selectedDate && selectedTime && (
          <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
            <h5 className="font-medium text-green-900 mb-1">📋 Booking Summary</h5>
            <p className="text-sm text-green-700">
              <strong>{cameraName}</strong> pickup on{' '}
              <strong>{new Date(selectedDate).toLocaleDateString()}</strong> at{' '}
              <strong>{selectedTime}</strong>
            </p>
            <button className="mt-2 w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded transition-colors">
              Confirm Booking
            </button>
          </div>
        )}

        {/* TidyCal integration note */}
        <div className="mt-4 p-3 bg-gray-50 rounded-lg border">
          <p className="text-xs text-gray-600">
            <strong>🔧 Integration:</strong> This is a demo calendar. Replace with your TidyCal embed:
          </p>
          <code className="text-xs text-gray-500 block mt-1">
            data-path="your-username/{cameraId}-rental"
          </code>
        </div>
      </div>
    </div>
  );
}
