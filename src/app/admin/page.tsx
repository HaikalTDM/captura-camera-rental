'use client';

import { getDashboardStats, mockBookings, mockCameras } from '@/data/mockAdminData';
import Link from 'next/link';

export default function AdminDashboard() {
  const stats = getDashboardStats();
  
  // Get today's activities
  const today = '2024-01-21'; // Fixed for demo
  const todayPickups = mockBookings.filter(b => b.startDate === today && b.status === 'confirmed');
  const todayReturns = mockBookings.filter(b => b.endDate === today && b.status === 'active');
  const recentBookings = mockBookings.slice(0, 5);
  const overduePayments = mockBookings.filter(b => b.paymentStatus === 'overdue');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
            <p className="text-blue-100 text-lg">Welcome back! Here's what's happening today.</p>
          </div>
          <div className="text-right">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
              <p className="text-blue-100 text-sm">Today</p>
              <p className="text-xl font-bold">
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Active Rentals */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Active Rentals</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{stats.activeRentals}</p>
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
              <p className="text-3xl font-bold text-green-600 mt-2">{stats.todayPickups}</p>
              <p className="text-sm text-gray-500 mt-1">Scheduled today</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📦</span>
            </div>
          </div>
        </div>

        {/* Pending Payments */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Pending Payments</p>
              <p className="text-3xl font-bold text-red-600 mt-2">{stats.pendingPayments}</p>
              <p className="text-sm text-gray-500 mt-1">Need follow up</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        {/* Monthly Revenue */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">Monthly Revenue</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">RM{stats.monthlyRevenue}</p>
              <p className="text-sm text-gray-500 mt-1">January 2024</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-2xl">📈</span>
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
                      <p className="font-medium text-gray-900">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.cameraName}</p>
                      <p className="text-sm text-green-600">Pickup: {booking.pickupTime}</p>
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
              {mockCameras.map((camera) => (
                <div key={camera.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">{camera.name}</p>
                    <p className="text-sm text-gray-600">
                      {camera.status === 'rented' && camera.currentRenter 
                        ? `Rented by ${camera.currentRenter}` 
                        : `Status: ${camera.status}`
                      }
                    </p>
                    {camera.returnDate && (
                      <p className="text-sm text-blue-600">Return: {camera.returnDate}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    camera.status === 'available' 
                      ? 'bg-green-100 text-green-800'
                      : camera.status === 'rented'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {camera.status}
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
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{booking.customerName}</p>
                    <p className="text-sm text-gray-600">{booking.cameraName}</p>
                    <p className="text-sm text-gray-600">{booking.startDate} - {booking.endDate}</p>
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
                    <p className="text-sm text-gray-600 mt-1">RM{booking.totalAmount}</p>
                  </div>
                </div>
              ))}
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
                        <p className="font-medium text-gray-900">{booking.customerName}</p>
                        <p className="text-sm text-gray-600">{booking.customerPhone}</p>
                        <p className="text-sm text-red-600">Overdue: RM{booking.balanceDue}</p>
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
