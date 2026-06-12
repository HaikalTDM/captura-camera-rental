'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  fetchStudioDashboardStats,
  fetchRecentStudioBookings,
  type StudioBookingListItem,
  type StudioDashboardStats,
} from '@/lib/api/studio-bookings';

const statusColors: Record<string, string> = {
  confirmed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  inquiry: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-stone-100 text-stone-500 border-stone-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
};

export default function StudioAdminDashboard() {
  const [stats, setStats] = useState<StudioDashboardStats | null>(null);
  const [recent, setRecent] = useState<StudioBookingListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const [s, r] = await Promise.all([
          fetchStudioDashboardStats(),
          fetchRecentStudioBookings(5),
        ]);
        if (mounted) {
          setStats(s);
          setRecent(r);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const statCards = [
    { label: 'This Month', value: stats?.thisMonthCount ?? 0, sub: 'bookings', color: 'text-[#a08520]' },
    { label: 'Revenue', value: stats ? `RM${stats.thisMonthRevenue.toLocaleString()}` : 'RM0', sub: 'this month', color: 'text-emerald-600' },
    { label: 'Pending', value: stats?.pendingCount ?? 0, sub: 'awaiting response', color: 'text-amber-600' },
    {
      label: 'Next Shoot',
      value: stats?.nextShoot?.date ?? '—',
      sub: stats?.nextShoot?.client ?? 'No upcoming shoots',
      color: 'text-purple-600',
    },
  ];

  return (
    <div className="p-6 sm:p-8 lg:p-10">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-stone-900 mb-1">Studio Dashboard</h1>
        <p className="text-stone-400 text-sm">Overview of your videography &amp; photography business.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat) => (
          <div key={stat.label} className="bg-white border border-stone-200/80 rounded-xl p-5 shadow-sm">
            <p className="text-stone-400 text-xs uppercase tracking-wider mb-2">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>
              {loading ? <span className="inline-block w-12 h-6 bg-stone-100 rounded animate-pulse"></span> : stat.value}
            </p>
            <p className="text-stone-300 text-xs mt-1">{stat.sub}</p>
          </div>
        ))}
      </div>

      <div className="bg-white border border-stone-200/80 rounded-xl overflow-hidden mb-8 shadow-sm">
        <div className="flex items-center justify-between px-6 py-4 border-b border-stone-100">
          <h2 className="text-stone-900 font-semibold text-sm">Recent Bookings</h2>
          <Link href="/admin/studio/bookings" className="text-[#a08520] text-xs font-medium hover:underline">
            View all
          </Link>
        </div>
        <div className="divide-y divide-stone-100">
          {loading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="px-6 py-4">
                <div className="h-4 bg-stone-100 rounded animate-pulse w-1/3 mb-2"></div>
                <div className="h-3 bg-stone-50 rounded animate-pulse w-1/2"></div>
              </div>
            ))
          ) : recent.length === 0 ? (
            <div className="px-6 py-8 text-center text-stone-400 text-sm">No bookings yet.</div>
          ) : (
            recent.map((booking) => (
              <div key={booking.id} className="flex items-center justify-between px-6 py-4 hover:bg-stone-50 transition-colors">
                <div className="flex-1 min-w-0">
                  <p className="text-stone-900 text-sm font-medium truncate">{booking.client}</p>
                  <p className="text-stone-400 text-xs mt-0.5">{booking.package} &middot; {booking.eventDate}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <span className="text-stone-500 text-sm font-medium">{booking.amount}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-full border ${statusColors[booking.status] ?? statusColors.completed}`}>
                    {booking.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link href="/admin/studio/bookings" className="bg-white border border-stone-200/80 rounded-xl p-5 hover:border-[#d4af37]/40 transition-all group shadow-sm">
          <div className="w-10 h-10 bg-[#d4af37]/10 rounded-lg flex items-center justify-center mb-3 group-hover:bg-[#d4af37]/20 transition-colors">
            <svg className="w-5 h-5 text-[#a08520]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <p className="text-stone-900 text-sm font-medium">New Booking</p>
          <p className="text-stone-400 text-xs mt-0.5">Add a video or photo job</p>
        </Link>
        <Link href="/admin/studio/calendar" className="bg-white border border-stone-200/80 rounded-xl p-5 hover:border-purple-300 transition-all group shadow-sm">
          <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-purple-100 transition-colors">
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-stone-900 text-sm font-medium">Check Calendar</p>
          <p className="text-stone-400 text-xs mt-0.5">View availability</p>
        </Link>
        <Link href="/admin/studio/gallery" className="bg-white border border-stone-200/80 rounded-xl p-5 hover:border-emerald-300 transition-all group shadow-sm">
          <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center mb-3 group-hover:bg-emerald-100 transition-colors">
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-stone-900 text-sm font-medium">Upload Work</p>
          <p className="text-stone-400 text-xs mt-0.5">Add to portfolio</p>
        </Link>
      </div>
    </div>
  );
}
