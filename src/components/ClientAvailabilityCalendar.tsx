'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { getPublicAvailabilityBookings, getPublicCameras } from '@/lib/api/bookings';
import type { PublicAvailabilityBooking } from '@/lib/api/bookings';
import type { PublicCamera } from '@/lib/api/bookings';

interface ClientAvailabilityCalendarProps {
  onCameraSelect?: (camera: PublicCamera) => void;
}

interface CalendarDay {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  availableCameras: PublicCamera[];
  bookedCameras: string[];
}

export default function ClientAvailabilityCalendar({ onCameraSelect }: ClientAvailabilityCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookings, setBookings] = useState<PublicAvailabilityBooking[]>([]);
  const [cameras, setCameras] = useState<PublicCamera[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCamera, setSelectedCamera] = useState<PublicCamera | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [bookingsData, camerasData] = await Promise.all([
        getPublicAvailabilityBookings(),
        getPublicCameras()
      ]);
      setBookings(bookingsData);
      setCameras(camerasData);
    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Check which cameras are available for a specific date
  const getAvailableCamerasForDate = useCallback((date: Date): PublicCamera[] => {
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    const bookedCameraIds = bookings
      .filter(booking => {
        const startDate = new Date(booking.start_date);
        const endDate = new Date(booking.end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(0, 0, 0, 0);

        return checkDate >= startDate && checkDate <= endDate &&
          (booking.booking_status === 'confirmed');
      })
      .map(b => b.camera_id);

    return cameras.filter(camera =>
      camera.is_available && !bookedCameraIds.includes(camera.id)
    );
  }, [bookings, cameras]);

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const startingDay = firstDay.getDay();
    const lastDay = new Date(year, month + 1, 0);
    const numDays = lastDay.getDate();

    const days: CalendarDay[] = [];

    // Previous month padding
    for (let i = 0; i < startingDay; i++) {
      const prevMonthDay = new Date(year, month, 0 - startingDay + i + 1);
      const available = getAvailableCamerasForDate(prevMonthDay);
      days.push({
        date: prevMonthDay,
        isCurrentMonth: false,
        isToday: false,
        availableCameras: available,
        bookedCameras: cameras.filter(c => !available.includes(c)).map(c => c.name)
      });
    }

    // Current month days
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 1; i <= numDays; i++) {
      const date = new Date(year, month, i);
      date.setHours(0, 0, 0, 0);
      const available = getAvailableCamerasForDate(date);
      days.push({
        date: date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        availableCameras: available,
        bookedCameras: cameras.filter(c => !available.includes(c)).map(c => c.name)
      });
    }

    // Next month padding
    const totalCells = 42;
    const remainingCells = totalCells - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthDay = new Date(year, month + 1, i);
      const available = getAvailableCamerasForDate(nextMonthDay);
      days.push({
        date: nextMonthDay,
        isCurrentMonth: false,
        isToday: false,
        availableCameras: available,
        bookedCameras: cameras.filter(c => !available.includes(c)).map(c => c.name)
      });
    }

    return days;
  }, [currentDate, cameras, getAvailableCamerasForDate]);

  const navigateMonth = (direction: number) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const handleCameraSelect = (camera: PublicCamera) => {
    setSelectedCamera(camera);
    if (onCameraSelect) {
      onCameraSelect(camera);
    }
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Camera color mapping - same as admin
  const getCameraColor = (cameraName: string) => {
    const colors: { [key: string]: string } = {
      'DJI Osmo Pocket 3': 'bg-slate-700', // Adjusted specifically for dark mode contrast
      'DJI Osmo Pocket 3 (ii)': 'bg-purple-600',
      // Keep others bright
      'DJI Action 5 Pro': 'bg-orange-500',
      'Insta360 X5': 'bg-pink-500',
    };

    return colors[cameraName] || 'bg-teal-600';
  };

  if (isLoading) {
    return (
      <div className="bg-zinc-900/50 rounded-2xl border border-zinc-800 p-6 mb-8 animate-pulse">
        <div className="h-8 bg-zinc-800 rounded w-48 mb-4"></div>
        <div className="grid grid-cols-7 gap-2">
          {[...Array(35)].map((_, i) => (
            <div key={i} className="h-20 bg-zinc-800 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-zinc-900/80 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl mb-8 overflow-hidden animate-fadeIn">
        {/* Collapsible Header */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-zinc-900 via-zinc-800 to-zinc-900 border-b border-white/5 hover:bg-white/5 transition-all duration-200 active:scale-[0.99] group"
        >
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-blue-500/20 transition-shadow">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="text-left">
              <h3 className="text-lg font-black text-white">Check Availability</h3>
              <p className="text-xs text-zinc-400 font-semibold group-hover:text-zinc-300 transition-colors">Select a camera to view availability</p>
            </div>
          </div>
          <svg
            className={`w-6 h-6 text-zinc-500 transition-transform duration-300 ${isOpen ? 'rotate-180 text-white' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Calendar Content */}
        <div
          className={`transition-all duration-500 ease-in-out ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0 overflow-hidden'
            }`}
        >
          <div className="p-6">
            {/* Camera Selection */}
            <div className="mb-6">
              <h4 className="text-sm font-black text-white mb-3 flex items-center gap-2">
                <span className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-black">1</span>
                Select Camera
              </h4>
              <div className="grid grid-cols-2 gap-3">
                {cameras.map((camera) => {
                  const isSelected = selectedCamera?.id === camera.id;
                  const colorClass = getCameraColor(camera.name);

                  return (
                    <button
                      key={camera.id}
                      onClick={() => handleCameraSelect(camera)}
                      className={`
                        p-4 rounded-xl border text-left transition-all duration-200 active:scale-95
                        ${isSelected
                          ? `${colorClass} border-transparent text-white shadow-xl scale-105`
                          : 'bg-zinc-800/50 border-white/5 hover:border-white/20 hover:bg-zinc-800'
                        }
                      `}
                    >
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${isSelected ? 'bg-white' : colorClass
                            } shadow-sm flex-shrink-0`}></div>
                          <p className={`text-xs font-black flex-1 leading-tight ${isSelected ? 'text-white' : 'text-zinc-200'
                            }`}>
                            {camera.name}
                          </p>
                          {isSelected && (
                            <svg className="w-5 h-5 text-white flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                        <p className={`text-[10px] font-semibold ${isSelected ? 'text-white/90' : 'text-zinc-500'
                          }`}>
                          RM{camera.daily_rate}/day
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {selectedCamera && (
              <div className="mb-6 animate-fadeIn">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-white flex items-center gap-2">
                    <span className="w-6 h-6 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center text-white text-xs font-black">2</span>
                    View Calendar
                  </h4>
                  <button
                    onClick={() => setSelectedCamera(null)}
                    className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold text-xs rounded-xl transition-all duration-200 active:scale-95 border border-white/5"
                  >
                    Clear
                  </button>
                </div>
              </div>
            )}

            {/* Calendar Controls */}
            <div className={`flex items-center justify-between mb-6 transition-opacity duration-300 ${!selectedCamera ? 'opacity-40 pointer-events-none' : ''}`}>
              <button
                onClick={() => navigateMonth(-1)}
                disabled={!selectedCamera}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="text-center">
                <h4 className="text-xl font-black text-white">{monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h4>
              </div>

              <button
                onClick={() => navigateMonth(1)}
                disabled={!selectedCamera}
                className="w-10 h-10 rounded-xl flex items-center justify-center bg-zinc-800 hover:bg-zinc-700 text-white border border-white/5 transition-all duration-200 active:scale-95 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Today Button */}
            <div className="text-center mb-4">
              <button
                onClick={goToToday}
                disabled={!selectedCamera}
                className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xs rounded-full hover:shadow-lg hover:scale-105 transition-all duration-200 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Today
              </button>
            </div>

            {/* Day Names */}
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-xs font-black text-zinc-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid - View Only */}
            <div className={`grid grid-cols-7 gap-1 transition-opacity duration-300 ${!selectedCamera ? 'opacity-40 blur-[1px]' : ''}`}>
              {calendarDays.map((day, index) => {
                const isPast = day.date < new Date(new Date().setHours(0, 0, 0, 0));
                const isCameraAvailable = selectedCamera && day.availableCameras.some(cam => cam.id === selectedCamera.id);

                return (
                  <div
                    key={`${day.date.getTime()}-${index}`}
                    className={`
                      relative min-h-[70px] sm:min-h-[80px] p-2 rounded-xl border
                      ${day.isCurrentMonth
                        ? 'bg-zinc-900/50 border-white/5'
                        : 'bg-black/30 border-transparent'
                      }
                      ${isPast
                        ? 'opacity-30'
                        : ''
                      }
                      ${day.isToday
                        ? 'ring-2 ring-blue-500 ring-offset-2 ring-offset-zinc-900 border-blue-500'
                        : ''
                      }
                    `}
                  >
                    {/* Date Number */}
                    <div className={`text-sm font-black mb-1 ${day.isToday
                      ? 'text-blue-500'
                      : day.isCurrentMonth
                        ? 'text-zinc-200'
                        : 'text-zinc-700'
                      }`}>
                      {day.date.getDate()}
                    </div>

                    {/* Selected Camera Availability Indicator */}
                    {day.isCurrentMonth && !isPast && selectedCamera && (
                      <div className="flex justify-center mt-1 min-h-[8px]">
                        {isCameraAvailable ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className={`w-2 h-2 rounded-full ${getCameraColor(selectedCamera.name)} shadow-[0_0_8px_currentColor] animate-pulse`}></div>
                            <div className="text-[8px] font-black text-emerald-500">Free</div>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-0.5">
                            <div className="w-2 h-2 rounded-full bg-red-500/50 shadow-sm"></div>
                            <div className="text-[8px] font-black text-red-500/70">Booked</div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legend */}
            {selectedCamera && (
              <div className="mt-6 pt-4 border-t border-white/5 animate-fadeIn">
                <h4 className="text-xs font-black text-zinc-500 uppercase tracking-wider mb-3 text-center">
                  Legend
                </h4>
                <div className="flex items-center justify-center gap-6">
                  <div className="flex items-center gap-2">
                    <div className={`w-3 h-3 rounded-full ${getCameraColor(selectedCamera.name)} shadow-sm animate-pulse`}></div>
                    <span className="text-xs font-bold text-emerald-400">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-500/50 shadow-sm"></div>
                    <span className="text-xs font-bold text-red-400">Booked</span>
                  </div>
                </div>
                <p className="text-[10px] text-zinc-500 text-center mt-3 font-medium">
                  Showing availability for: <span className="font-black text-zinc-300">{selectedCamera.name}</span>
                </p>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* Animations */}
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
      `}</style>
    </>
  );
}
