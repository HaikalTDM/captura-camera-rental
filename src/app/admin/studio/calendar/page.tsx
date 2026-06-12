'use client';

import { useState, useEffect } from 'react';
import { fetchStudioCalendarMonth } from '@/lib/api/studio-bookings';

const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function StudioCalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [bookedDates, setBookedDates] = useState<Record<string, { client: string; service: string }>>({});
  const [loading, setLoading] = useState(true);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    (async () => {
      const data = await fetchStudioCalendarMonth(year, month);
      if (mounted) {
        setBookedDates(data);
        setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [year, month]);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let i = 1; i <= daysInMonth; i++) days.push(i);

  const getDateKey = (day: number) => {
    const m = String(month + 1).padStart(2, '0');
    const d = String(day).padStart(2, '0');
    return `${year}-${m}-${d}`;
  };

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Calendar</h1>
        <p className="text-stone-400 text-sm">Manage your shoot schedule and availability.</p>
      </div>

      <div className="bg-white border border-stone-200/80 rounded-xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <button onClick={prevMonth} className="text-stone-400 hover:text-stone-800 p-2 rounded-lg hover:bg-stone-100 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <h2 className="text-stone-900 font-semibold">{months[month]} {year}</h2>
          <button onClick={nextMonth} className="text-stone-400 hover:text-stone-800 p-2 rounded-lg hover:bg-stone-100 transition-all">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
            <div key={d} className="text-center text-stone-400 text-xs font-medium py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, i) => {
            if (!day) return <div key={`empty-${i}`} className="aspect-square"></div>;
            const dateKey = getDateKey(day);
            const booking = bookedDates[dateKey];
            const isToday = dateKey === new Date().toISOString().split('T')[0];

            return (
              <div
                key={dateKey}
                className={`aspect-square rounded-lg flex flex-col items-center justify-center text-sm relative transition-all cursor-pointer hover:bg-stone-100 ${
                  isToday ? 'ring-1 ring-[#d4af37]/50' : ''
                } ${booking ? 'bg-purple-50' : ''}`}
                title={booking ? `${booking.client} - ${booking.service}` : ''}
              >
                <span className={`${isToday ? 'text-[#d4af37] font-bold' : booking ? 'text-stone-900' : 'text-stone-500'}`}>
                  {day}
                </span>
                {booking && <div className="w-1 h-1 rounded-full bg-purple-400 mt-0.5"></div>}
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-8 bg-white border border-stone-200/80 rounded-xl overflow-hidden shadow-sm">
        <div className="px-6 py-4 border-b border-stone-100">
          <h2 className="text-stone-900 font-semibold text-sm">Bookings This Month</h2>
        </div>
        <div className="divide-y divide-stone-100">
          {loading ? (
            <div className="px-6 py-8 text-center text-stone-400 text-sm">Loading...</div>
          ) : Object.keys(bookedDates).length === 0 ? (
            <div className="px-6 py-8 text-center text-stone-400 text-sm">No bookings this month.</div>
          ) : (
            Object.entries(bookedDates)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([date, info]) => (
                <div key={date} className="flex items-center justify-between px-6 py-4">
                  <div>
                    <p className="text-stone-900 text-sm font-medium">{info.client}</p>
                    <p className="text-stone-400 text-xs mt-0.5">{info.service}</p>
                  </div>
                  <span className="text-stone-500 text-sm">{date}</span>
                </div>
              ))
          )}
        </div>
      </div>
    </div>
  );
}
