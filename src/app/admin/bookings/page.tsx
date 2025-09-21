'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAllBookings, getBookingStats } from '@/lib/api/bookings';
import BookingApprovalCard from '@/components/admin/BookingApprovalCard';
import type { Booking } from '@/lib/supabase';
import Link from 'next/link';

export default function BookingsPage() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [filteredBookings, setFilteredBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    bySource: {} as Record<string, number>
  });

  // Filters
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadBookings();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [bookings, statusFilter, sourceFilter, searchTerm]);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const [bookingsData, statsData] = await Promise.all([
        getAllBookings(),
        getBookingStats()
      ]);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId: string, notes?: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/approve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ admin_notes: notes }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Booking approved successfully!');
        loadBookings(); // Refresh the list
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Failed to approve booking');
    }
  };

  const handleRejectBooking = async (bookingId: string, reason: string, notes?: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejection_reason: reason,
          admin_notes: notes
        }),
      });

      const result = await response.json();

      if (result.success) {
        alert('Booking rejected successfully!');
        loadBookings(); // Refresh the list
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking');
    }
  };

  const handleDeleteBooking = async (bookingId: string) => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    setDeletingBookingId(bookingId);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        // Reload bookings after successful deletion
        await loadBookings();
      } else {
        alert('Failed to delete booking: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking. Please try again.');
    } finally {
      setDeletingBookingId(null);
    }
  };

  const applyFilters = () => {
    let filtered = [...bookings];

    // Status filter (now using booking_status)
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.booking_status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(booking => booking.booking_source === sourceFilter);
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.customer?.full_name?.toLowerCase().includes(term) ||
        booking.camera?.name?.toLowerCase().includes(term) ||
        booking.notes?.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(filtered);
  };

  // Get pending approval bookings for priority display
  const pendingApprovalBookings = bookings.filter(booking => booking.booking_status === 'pending_approval');

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getSourceColor = (source: string) => {
    switch (source) {
      case 'website': return 'bg-blue-100 text-blue-800';
      case 'phone': return 'bg-green-100 text-green-800';
      case 'whatsapp': return 'bg-emerald-100 text-emerald-800';
      case 'walk-in': return 'bg-purple-100 text-purple-800';
      case 'historical': return 'bg-gray-100 text-gray-800';
      case 'manual': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Booking Management</h1>
            <p className="text-blue-100 text-lg">Track and manage all camera rentals from all sources</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-blue-100 text-sm">Total Bookings</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4 text-center">
              <p className="text-blue-100 text-sm">Active</p>
              <p className="text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-4">
        <button
          onClick={() => router.push('/admin/bookings/add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Manual Booking
        </button>
        <button
          onClick={() => router.push('/admin/bookings/import')}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Import Historical Data
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          {/* Status Filters */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                statusFilter === 'all'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('pending_approval')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                statusFilter === 'pending_approval'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              🔔 Needs Approval ({pendingApprovalBookings.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                statusFilter === 'confirmed'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Confirmed ({stats.confirmed})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                statusFilter === 'active'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                statusFilter === 'completed'
                  ? 'bg-gray-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              Completed ({stats.completed})
            </button>
          </div>

          {/* Source Filter & Search */}
          <div className="flex gap-4">
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Sources</option>
              <option value="website">Website ({stats.bySource.website || 0})</option>
              <option value="phone">Phone ({stats.bySource.phone || 0})</option>
              <option value="whatsapp">WhatsApp ({stats.bySource.whatsapp || 0})</option>
              <option value="walk-in">Walk-in ({stats.bySource['walk-in'] || 0})</option>
              <option value="historical">Historical ({stats.bySource.historical || 0})</option>
              <option value="manual">Manual ({stats.bySource.manual || 0})</option>
            </select>

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
      </div>

      {/* Pending Approval Section */}
      {pendingApprovalBookings.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg border border-orange-200 overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              🔔 Bookings Pending Approval ({pendingApprovalBookings.length})
            </h2>
            <p className="text-orange-100 text-sm">These bookings require your immediate attention</p>
          </div>
          <div className="p-6 space-y-4">
            {pendingApprovalBookings.map((booking) => (
              <BookingApprovalCard
                key={booking.id}
                booking={booking}
                onApprove={handleApproveBooking}
                onReject={handleRejectBooking}
                onRefresh={loadBookings}
              />
            ))}
          </div>
        </div>
      )}

      {/* Bookings Table */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Booking ID
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
                  Amount
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Source
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
                      <div className="text-sm font-medium text-gray-900">#{booking.id.slice(0, 8)}</div>
                      <div className="text-sm text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.customer?.full_name}</div>
                      <div className="text-sm text-gray-500">{booking.customer?.phone}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 max-w-xs">
                      {booking.camera?.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm text-gray-900">{new Date(booking.start_date).toLocaleDateString()}</div>
                      <div className="text-sm text-gray-500">to {new Date(booking.end_date).toLocaleDateString()}</div>
                      <div className="text-xs text-gray-400">{booking.total_days} days</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">RM{booking.total_amount}</div>
                      <div className="text-sm text-gray-500">
                        Deposit: {booking.deposit_paid ? '✅' : '❌'} RM{booking.deposit_amount}
                      </div>
                      <div className="text-sm text-gray-500">
                        Final: {booking.final_payment_paid ? '✅' : '❌'} RM{booking.final_payment_amount}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceColor(booking.booking_source)}`}>
                      {booking.booking_source}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex flex-wrap gap-1">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        View
                      </Link>
                      <Link
                        href={`/admin/bookings/${booking.id}/edit`}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded text-xs transition-colors"
                      >
                        Edit
                      </Link>
                      <button
                        onClick={() => handleDeleteBooking(booking.id)}
                        disabled={deletingBookingId === booking.id}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-xs transition-colors disabled:opacity-50"
                      >
                        {deletingBookingId === booking.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </div>
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
