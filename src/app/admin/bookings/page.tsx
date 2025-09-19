'use client';

import { useState } from 'react';
import { mockBookings, type Booking } from '@/data/mockAdminData';
import Link from 'next/link';

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'active' | 'completed' | 'overdue'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Filter bookings based on status and search
  const filteredBookings = bookings.filter(booking => {
    const matchesFilter = filter === 'all' || 
      (filter === 'overdue' ? booking.paymentStatus === 'overdue' : booking.status === filter);
    
    const matchesSearch = searchTerm === '' || 
      booking.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customerPhone.includes(searchTerm) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesFilter && matchesSearch;
  });

  const updateBookingStatus = (bookingId: string, newStatus: Booking['status']) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, status: newStatus } : booking
    ));
  };

  const updatePaymentStatus = (bookingId: string, newPaymentStatus: Booking['paymentStatus']) => {
    setBookings(prev => prev.map(booking => 
      booking.id === bookingId ? { ...booking, paymentStatus: newPaymentStatus } : booking
    ));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'deposit_paid': return 'bg-orange-100 text-orange-800';
      case 'fully_paid': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const filterCounts = {
    all: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    active: bookings.filter(b => b.status === 'active').length,
    completed: bookings.filter(b => b.status === 'completed').length,
    overdue: bookings.filter(b => b.paymentStatus === 'overdue').length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
            <p className="text-blue-100 text-lg">Track and manage all camera rentals</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-sm">Total Bookings</p>
            <p className="text-2xl font-bold">{bookings.length}</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            {Object.entries(filterCounts).map(([status, count]) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  filter === status
                    ? 'bg-blue-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} ({count})
              </button>
            ))}
          </div>

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Camera
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dates
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredBookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.id}</div>
                      <div className="text-sm text-gray-500">{booking.createdAt}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.customerName}</div>
                      <div className="text-sm text-gray-500">{booking.customerPhone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {booking.cameraName}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{booking.startDate}</div>
                      <div className="text-sm text-gray-500">to {booking.endDate}</div>
                      <div className="text-xs text-gray-400">{booking.totalDays} days</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">RM{booking.totalAmount}</div>
                      <div className="text-sm text-gray-500">Paid: RM{booking.depositPaid}</div>
                      {booking.balanceDue > 0 && (
                        <div className="text-sm text-red-600 font-medium">Due: RM{booking.balanceDue}</div>
                      )}
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.paymentStatus)}`}>
                        {booking.paymentStatus.replace('_', ' ')}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                    >
                      View
                    </Link>
                    {booking.paymentStatus === 'overdue' && (
                      <button
                        onClick={() => updatePaymentStatus(booking.id, 'fully_paid')}
                        className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Mark Paid
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredBookings.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">📋</div>
            <p className="text-gray-500">No bookings found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );
}
