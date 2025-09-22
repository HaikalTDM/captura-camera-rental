'use client';

import { useState, useEffect } from 'react';
import { getAllBookings, getBookingStats, getAllCameras } from '@/lib/api/bookings';
import type { Booking, Camera } from '@/lib/supabase';
import Link from 'next/link';

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    bySource: {} as Record<string, number>
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [bookingsData, statsData, camerasData] = await Promise.all([
        getAllBookings(),
        getBookingStats(),
        getAllCameras()
      ]);
      setBookings(bookingsData);
      setStats(statsData);
      setCameras(camerasData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get today's activities
  const today = new Date().toISOString().split('T')[0];
  const todayPickups = bookings.filter(b =>
    b.start_date === today &&
    b.booking_status === 'confirmed' &&
    !b.equipment_picked_up
  );
  const activeRentals = bookings.filter(b =>
    b.booking_status === 'confirmed' &&
    b.equipment_picked_up &&
    !b.equipment_returned
  );
  const todayReturns = bookings.filter(b =>
    b.end_date === today &&
    b.equipment_picked_up &&
    !b.equipment_returned
  );
  const recentBookings = bookings.slice(0, 5);
  const overduePayments = bookings.filter(b =>
    !b.final_payment_paid &&
    new Date(b.end_date) < new Date() &&
    (b.booking_status === 'completed' || b.status === 'completed')
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white mb-6 sm:mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-blue-100 text-sm sm:text-lg">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="text-left sm:text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4">
              <p className="text-blue-100 text-xs sm:text-sm">Today</p>
              <p className="text-lg sm:text-xl font-bold">
                {new Date().toLocaleDateString('en-MY', {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        {/* Active Rentals */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Rentals</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{activeRentals.length}</p>
              <p className="text-sm text-gray-500 mt-1">Currently rented</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📷</span>
            </div>
          </div>
        </div>

        {/* Today's Pickups */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Today's Pickups</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{todayPickups.length}</p>
              <p className="text-sm text-gray-500 mt-1">Scheduled today</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        {/* Total Revenue */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">RM{
                bookings
                  .filter(b => b.deposit_paid && b.final_payment_paid)
                  .reduce((sum, b) => {
                    // For new payment system: deposit (100) + rental amount
                    // For old payment system: total_amount (which includes everything)
                    const isNewPaymentSystem = b.deposit_amount === 100;
                    return sum + (isNewPaymentSystem ? (b.deposit_amount + b.final_payment_amount) : b.total_amount);
                  }, 0)
                  .toFixed(0)
              }</p>
              <p className="text-sm text-gray-500 mt-1">All time</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Monthly Revenue</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">RM{
                bookings
                  .filter(b =>
                    b.deposit_paid &&
                    b.final_payment_paid &&
                    new Date(b.created_at).getMonth() === new Date().getMonth() &&
                    new Date(b.created_at).getFullYear() === new Date().getFullYear()
                  )
                  .reduce((sum, b) => {
                    // For new payment system: deposit (100) + rental amount
                    // For old payment system: total_amount (which includes everything)
                    const isNewPaymentSystem = b.deposit_amount === 100;
                    return sum + (isNewPaymentSystem ? (b.deposit_amount + b.final_payment_amount) : b.total_amount);
                  }, 0)
                  .toFixed(0)
              }</p>
              <p className="text-sm text-gray-500 mt-1">{new Date().toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Pending Payments</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{overduePayments.length}</p>
              <p className="text-sm text-gray-500 mt-1">Need follow up</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      {/* Today's Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Today's Pickups */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📦</span>
              </span>
              Today's Pickups
            </h3>
          </div>
          <div className="p-6">
            {todayPickups.length > 0 ? (
              <div className="space-y-4">
                {todayPickups.map((booking) => (
                  <div key={booking.id} className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
                    <div>
                      <p className="font-medium text-gray-900">{booking.customer?.full_name}</p>
                      <p className="text-sm text-gray-600">{booking.camera?.name}</p>
                      <p className="text-sm text-green-600">Pickup: {new Date(booking.start_date).toLocaleDateString()}</p>
                    </div>
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700"
                    >
                      View
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No pickups scheduled for today</p>
            )}
          </div>
        </div>

        {/* Camera Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📷</span>
              </span>
              Camera Status
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {cameras.map((camera) => (
                <div key={camera.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{camera.name}</p>
                    <p className="text-sm text-gray-600">
                      {camera.is_available
                        ? `Available (${camera.available_quantity}/${camera.total_quantity})`
                        : 'Currently rented'
                      }
                    </p>
                    <p className="text-sm text-gray-500">Daily Rate: RM{camera.daily_rate}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    camera.is_available
                      ? 'bg-green-100 text-green-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}>
                    {camera.is_available ? 'Available' : 'Rented'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Bookings & Overdue Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-slate-50 p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-8 h-8 bg-gray-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">📋</span>
              </span>
              Recent Bookings
            </h3>
            <Link href="/admin/bookings" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              View All
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentBookings.length > 0 ? recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{booking.customer?.full_name}</p>
                    <p className="text-sm text-gray-600">{booking.camera?.name}</p>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      booking.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : booking.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : booking.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {booking.status}
                    </span>
                    <p className="text-sm text-gray-600 mt-1">RM{booking.total_amount}</p>
                  </div>
                </div>
              )) : (
                <p className="text-gray-600 text-center py-8">No recent bookings</p>
              )}
            </div>
          </div>
        </div>

        {/* Overdue Payments */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-50 to-rose-50 p-6 border-b border-red-100">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
              <span className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm">⚠️</span>
              </span>
              Overdue Payments
            </h3>
          </div>
          <div className="p-6">
            {overduePayments.length > 0 ? (
              <div className="space-y-4">
                {overduePayments.map((booking) => (
                  <div key={booking.id} className="p-4 bg-red-50 rounded-lg border border-red-200">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{booking.customer?.full_name}</p>
                        <p className="text-sm text-gray-600">{booking.customer?.phone}</p>
                        <p className="text-sm text-red-600">Overdue: RM{booking.final_payment_amount}</p>
                        <p className="text-xs text-gray-500">Due: {new Date(booking.end_date).toLocaleDateString()}</p>
                      </div>
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700"
                      >
                        Follow Up
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 text-center py-8">No overdue payments! 🎉</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
