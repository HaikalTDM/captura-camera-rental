'use client';

import { useState, useEffect, useMemo, memo } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminData } from '@/contexts/AdminDataContext';
import BookingApprovalCard from '@/components/admin/BookingApprovalCard';
import StatusManagementDropdown from '@/components/admin/StatusManagementDropdown';
import { ToastContainer, useToast } from '@/components/admin/Toast';
import type { Booking } from '@/lib/supabase';
import Link from 'next/link';
import { BookingsTableSkeleton } from '@/components/admin/SkeletonLoaders';

// Memoized booking card for mobile view
const BookingCard = memo(({ 
  booking, 
  onStatusChange, 
  onStatusSuccess, 
  onStatusError, 
  onDelete, 
  isDeleting,
  getStatusColor,
  getSourceColor
}: any) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 max-w-full overflow-hidden">
    <div className="flex items-start justify-between mb-3">
      <div className="min-w-0 flex-1 mr-2">
        <div className="text-sm font-medium text-gray-900 truncate">#{booking.id.slice(0, 8)}</div>
        <div className="text-xs text-gray-500">{new Date(booking.created_at).toLocaleDateString()}</div>
      </div>
      <div className="flex flex-col gap-1 flex-shrink-0">
        <StatusManagementDropdown
          bookingId={booking.id}
          currentStatus={booking.booking_status || 'pending_approval'}
          onStatusChange={(newStatus) => onStatusChange(booking.id, newStatus)}
          onSuccess={onStatusSuccess}
          onError={onStatusError}
        />
        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSourceColor(booking.booking_source)}`}>
          {booking.booking_source}
        </span>
      </div>
    </div>

    <div className="space-y-2 mb-4 max-w-full">
      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900 truncate">{booking.customer?.full_name}</div>
        <div className="text-xs text-gray-500 truncate">{booking.customer?.phone}</div>
      </div>

      <div className="min-w-0">
        <div className="text-sm text-gray-900 truncate">{booking.camera?.name}</div>
      </div>

      <div className="min-w-0">
        <div className="text-sm text-gray-900">
          {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
        </div>
        <div className="text-xs text-gray-500">{booking.total_days} days</div>
      </div>

      <div className="min-w-0">
        <div className="text-sm font-medium text-gray-900">RM{booking.total_amount}</div>
        <div className="text-xs text-gray-500 break-words">
          Deposit: {booking.deposit_paid ? '✅' : '❌'} RM{booking.deposit_amount} |
          Final: {booking.final_payment_paid ? '✅' : '❌'} RM{booking.final_payment_amount}
        </div>
      </div>
    </div>

    <div className="flex gap-2">
      <Link
        href={`/admin/bookings/${booking.id}`}
        className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg text-sm text-center transition-colors touch-manipulation"
      >
        View
      </Link>
      <Link
        href={`/admin/bookings/${booking.id}/edit`}
        className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-3 py-2 rounded-lg text-sm text-center transition-colors touch-manipulation"
      >
        Edit
      </Link>
      <button
        onClick={() => onDelete(booking.id)}
        disabled={isDeleting === booking.id}
        className="flex-1 bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg text-sm transition-colors disabled:opacity-50 touch-manipulation"
      >
        {isDeleting === booking.id ? 'Deleting...' : 'Delete'}
      </button>
    </div>
  </div>
));

BookingCard.displayName = 'BookingCard';

export default function BookingsPage() {
  const router = useRouter();
  const { toasts, success, error, removeToast } = useToast();
  const { bookings, stats, isLoading, mutateBookings } = useAdminData();
  const [deletingBookingId, setDeletingBookingId] = useState<string | null>(null);

  // Filters and Sorting - using state
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [dateFilter, setDateFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  // Memoize filtered and sorted bookings
  const filteredBookings = useMemo(() => {
    let filtered = [...bookings];

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.booking_status === statusFilter);
    }

    // Source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(booking => booking.booking_source === sourceFilter);
    }

    // Date filter
    if (dateFilter !== 'all') {
      const today = new Date();
      const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      
      filtered = filtered.filter(booking => {
        const bookingDate = new Date(booking.created_at);
        switch (dateFilter) {
          case 'today':
            return bookingDate.toDateString() === today.toDateString();
          case 'week':
            return bookingDate >= thisWeek;
          case 'month':
            return bookingDate >= thisMonth;
          case 'upcoming':
            return new Date(booking.start_date) >= today;
          case 'ongoing':
            return new Date(booking.start_date) <= today && new Date(booking.end_date) >= today;
          case 'overdue':
            return new Date(booking.end_date) < today && booking.equipment_picked_up && !booking.equipment_returned;
          default:
            return true;
        }
      });
    }

    // Payment filter
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(booking => {
        switch (paymentFilter) {
          case 'deposit_pending':
            return !booking.deposit_paid;
          case 'deposit_paid':
            return booking.deposit_paid;
          case 'final_pending':
            return !booking.final_payment_paid;
          case 'final_paid':
            return booking.final_payment_paid;
          case 'fully_paid':
            return booking.deposit_paid && booking.final_payment_paid;
          case 'unpaid':
            return !booking.deposit_paid && !booking.final_payment_paid;
          default:
            return true;
        }
      });
    }

    // Search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.customer?.full_name?.toLowerCase().includes(term) ||
        booking.camera?.name?.toLowerCase().includes(term) ||
        booking.notes?.toLowerCase().includes(term) ||
        booking.id.toLowerCase().includes(term) ||
        booking.customer?.phone?.includes(term) ||
        booking.customer?.email?.toLowerCase().includes(term)
      );
    }

    // Sorting
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'customer_name':
          aValue = a.customer?.full_name || '';
          bValue = b.customer?.full_name || '';
          break;
        case 'camera_name':
          aValue = a.camera?.name || '';
          bValue = b.camera?.name || '';
          break;
        case 'start_date':
          aValue = new Date(a.start_date);
          bValue = new Date(b.start_date);
          break;
        case 'end_date':
          aValue = new Date(a.end_date);
          bValue = new Date(b.end_date);
          break;
        case 'created_at':
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
          break;
        case 'total_amount':
          aValue = a.total_amount;
          bValue = b.total_amount;
          break;
        case 'booking_status':
          aValue = a.booking_status;
          bValue = b.booking_status;
          break;
        case 'booking_source':
          aValue = a.booking_source;
          bValue = b.booking_source;
          break;
        default:
          aValue = new Date(a.created_at);
          bValue = new Date(b.created_at);
      }

      if (aValue < bValue) {
        return sortDirection === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortDirection === 'asc' ? 1 : -1;
      }
      return 0;
    });

    return filtered;
  }, [bookings, statusFilter, sourceFilter, searchTerm, sortField, sortDirection, dateFilter, paymentFilter]);

  // Memoize pending approval bookings
  const pendingApprovalBookings = useMemo(() => 
    bookings.filter(booking => booking.booking_status === 'pending_approval'),
    [bookings]
  );

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
        success('Booking Approved', 'Booking has been approved successfully!');
        mutateBookings(); // Refresh data
      } else {
        error('Approval Failed', result.error || 'Failed to approve booking');
      }
    } catch (err) {
      console.error('Error approving booking:', err);
      error('Approval Failed', 'An error occurred while approving the booking');
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
        success('Booking Rejected', 'Booking has been rejected successfully!');
        mutateBookings(); // Refresh data
      } else {
        error('Rejection Failed', result.error || 'Failed to reject booking');
      }
    } catch (err) {
      console.error('Error rejecting booking:', err);
      error('Rejection Failed', 'An error occurred while rejecting the booking');
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
        success('Booking Deleted', 'Booking has been deleted successfully!');
        mutateBookings(); // Refresh data
      } else {
        error('Delete Failed', data.error || 'Failed to delete booking');
      }
    } catch (err) {
      console.error('Error deleting booking:', err);
      error('Delete Failed', 'An error occurred while deleting the booking');
    } finally {
      setDeletingBookingId(null);
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const getSortIcon = (field: string) => {
    if (sortField !== field) {
      return '↕';
    }
    return sortDirection === 'asc' ? '^' : 'v';
  };

  const exportToCSV = () => {
    const csvHeaders = [
      'Booking ID',
      'Customer Name',
      'Phone',
      'Camera',
      'Start Date',
      'End Date',
      'Total Days',
      'Total Amount',
      'Deposit Paid',
      'Final Payment Paid',
      'Status',
      'Source',
      'Created Date'
    ];

    const csvData = filteredBookings.map(booking => [
      booking.id,
      booking.customer?.full_name || '',
      booking.customer?.phone || '',
      booking.camera?.name || '',
      booking.start_date,
      booking.end_date,
      booking.total_days,
      booking.total_amount,
      booking.deposit_paid ? 'Yes' : 'No',
      booking.final_payment_paid ? 'Yes' : 'No',
      booking.booking_status,
      booking.booking_source,
      booking.created_at
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `bookings-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleStatusChange = (bookingId: string, newStatus: string) => {
    // Optimistically update - SWR will handle the actual update
    mutateBookings();
  };

  const handleStatusSuccess = (message: string) => {
    success('Status Updated', message);
  };

  const handleStatusError = (message: string) => {
    error('Update Failed', message);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
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
    return <BookingsTableSkeleton />;
  }

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-4 sm:p-6 lg:p-8 text-white max-w-full">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold mb-2">Booking Management</h1>
            <p className="text-blue-100 text-sm sm:text-lg">Track and manage all camera rentals from all sources</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 w-full lg:w-auto">
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center flex-1 sm:flex-none">
              <p className="text-blue-100 text-xs sm:text-sm">Total Bookings</p>
              <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
            </div>
            <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 sm:p-4 text-center flex-1 sm:flex-none">
              <p className="text-blue-100 text-xs sm:text-sm">Active</p>
              <p className="text-xl sm:text-2xl font-bold">{stats.active}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:gap-4 max-w-full">
        <button
          onClick={() => router.push('/admin/bookings/add')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="truncate">Add Manual Booking</span>
        </button>
        <button
          onClick={() => router.push('/admin/bookings/import')}
          className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm sm:text-base"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span className="truncate">Import Historical Data</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 max-w-full overflow-hidden">
        <div className="space-y-4">
          {/* Active Filters Summary */}
          {(statusFilter !== 'all' || sourceFilter !== 'all' || dateFilter !== 'all' || paymentFilter !== 'all' || searchTerm) && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-blue-900">Active filters:</span>
                {statusFilter !== 'all' && (
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    Status: {statusFilter}
                  </span>
                )}
                {sourceFilter !== 'all' && (
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    Source: {sourceFilter}
                  </span>
                )}
                {dateFilter !== 'all' && (
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    Date: {dateFilter}
                  </span>
                )}
                {paymentFilter !== 'all' && (
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    Payment: {paymentFilter}
                  </span>
                )}
                {searchTerm && (
                  <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                    Search: "{searchTerm}"
                  </span>
                )}
                <span className="px-2 py-1 bg-blue-500 text-white text-xs rounded-full">
                  Sort: {sortField.replace('_', ' ')} {sortDirection === 'asc' ? '^' : 'v'}
                </span>
              </div>
            </div>
          )}

          {/* Status Filters */}
          <div className="flex flex-wrap gap-2 max-w-full">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation flex-shrink-0 ${
                statusFilter === 'all'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              All ({stats.total})
            </button>
            <button
              onClick={() => setStatusFilter('pending_approval')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation ${
                statusFilter === 'pending_approval'
                  ? 'bg-orange-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              <span className="hidden sm:inline">🔔 Needs Approval</span>
              <span className="sm:hidden">🔔 Approval</span> ({pendingApprovalBookings.length})
            </button>
            <button
              onClick={() => setStatusFilter('pending')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation ${
                statusFilter === 'pending'
                  ? 'bg-yellow-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              Pending ({stats.pending})
            </button>
            <button
              onClick={() => setStatusFilter('confirmed')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation ${
                statusFilter === 'confirmed'
                  ? 'bg-green-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              Confirmed ({stats.confirmed})
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation ${
                statusFilter === 'active'
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              Active ({stats.active})
            </button>
            <button
              onClick={() => setStatusFilter('completed')}
              className={`px-3 sm:px-4 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all duration-200 touch-manipulation ${
                statusFilter === 'completed'
                  ? 'bg-gray-500 text-white shadow-lg'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200 active:bg-gray-300'
              }`}
            >
              Completed ({stats.completed})
            </button>
          </div>

          {/* Advanced Filters Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 max-w-full">
            {/* Source Filter */}
            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm touch-manipulation min-h-[44px]"
            >
              <option value="all">All Sources</option>
              <option value="website">Website ({stats.bySource.website || 0})</option>
              <option value="phone">Phone ({stats.bySource.phone || 0})</option>
              <option value="whatsapp">WhatsApp ({stats.bySource.whatsapp || 0})</option>
              <option value="walk-in">Walk-in ({stats.bySource['walk-in'] || 0})</option>
              <option value="historical">Historical ({stats.bySource.historical || 0})</option>
              <option value="manual">Manual ({stats.bySource.manual || 0})</option>
            </select>

            {/* Date Filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm touch-manipulation min-h-[44px]"
            >
              <option value="all">All Dates</option>
              <option value="today">Today</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="upcoming">Upcoming Rentals</option>
              <option value="ongoing">Currently Active</option>
              <option value="overdue">Overdue Returns</option>
            </select>

            {/* Payment Filter */}
            <select
              value={paymentFilter}
              onChange={(e) => setPaymentFilter(e.target.value)}
              className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm touch-manipulation min-h-[44px]"
            >
              <option value="all">All Payments</option>
              <option value="unpaid">No Payments</option>
              <option value="deposit_pending">Deposit Pending</option>
              <option value="deposit_paid">Deposit Paid</option>
              <option value="final_pending">Final Payment Pending</option>
              <option value="final_paid">Final Payment Paid</option>
              <option value="fully_paid">Fully Paid</option>
            </select>

            {/* Search */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search bookings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm touch-manipulation min-h-[44px]"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none">
                🔍
              </div>
            </div>
          </div>

          {/* Sorting Controls */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4 pt-4 border-t border-gray-200">
            <span className="text-sm font-medium text-gray-700 flex-shrink-0">Sort by:</span>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleSort('customer_name')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortField === 'customer_name' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Customer {getSortIcon('customer_name')}
              </button>
              <button
                onClick={() => handleSort('camera_name')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortField === 'camera_name' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Camera {getSortIcon('camera_name')}
              </button>
              <button
                onClick={() => handleSort('created_at')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortField === 'created_at' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Booking Date {getSortIcon('created_at')}
              </button>
              <button
                onClick={() => handleSort('start_date')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortField === 'start_date' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Start Date {getSortIcon('start_date')}
              </button>
              <button
                onClick={() => handleSort('end_date')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortField === 'end_date' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                End Date {getSortIcon('end_date')}
              </button>
              <button
                onClick={() => handleSort('total_amount')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortField === 'total_amount' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Amount {getSortIcon('total_amount')}
              </button>
              <button
                onClick={() => handleSort('booking_status')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  sortField === 'booking_status' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Status {getSortIcon('booking_status')}
              </button>
            </div>
            
            {/* Clear Filters & Results count */}
            <div className="ml-auto flex items-center gap-3 flex-shrink-0">
              {filteredBookings.length > 0 && (
                <button
                  onClick={exportToCSV}
                  className="px-3 py-1 bg-green-500 text-white rounded-lg text-xs hover:bg-green-600 transition-colors flex items-center gap-1"
                >
                  📊 Export CSV
                </button>
              )}
              {(statusFilter !== 'all' || sourceFilter !== 'all' || dateFilter !== 'all' || paymentFilter !== 'all' || searchTerm) && (
                <button
                  onClick={() => {
                    setStatusFilter('all');
                    setSourceFilter('all');
                    setDateFilter('all');
                    setPaymentFilter('all');
                    setSearchTerm('');
                  }}
                  className="px-3 py-1 bg-gray-500 text-white rounded-lg text-xs hover:bg-gray-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
              <div className="text-sm text-gray-500">
                Showing {filteredBookings.length} of {bookings.length} bookings
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
            {pendingApprovalBookings
              .filter(booking => booking.customer && booking.camera)
              .map((booking) => (
                <BookingApprovalCard
                  key={booking.id}
                  booking={booking as any}
                  onApprove={handleApproveBooking}
                  onReject={handleRejectBooking}
                  onRefresh={mutateBookings}
                />
              ))}
          </div>
        </div>
      )}

      {/* Bookings Table - Desktop */}
      <div className="hidden lg:block bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden max-w-full">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th 
                  className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('created_at')}
                >
                  <div className="flex items-center gap-2">
                    Booking ID {getSortIcon('created_at')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('customer_name')}
                >
                  <div className="flex items-center gap-2">
                    Customer {getSortIcon('customer_name')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('camera_name')}
                >
                  <div className="flex items-center gap-2">
                    Camera {getSortIcon('camera_name')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('start_date')}
                >
                  <div className="flex items-center gap-2">
                    Dates {getSortIcon('start_date')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('total_amount')}
                >
                  <div className="flex items-center gap-2">
                    Amount {getSortIcon('total_amount')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('booking_source')}
                >
                  <div className="flex items-center gap-2">
                    Source {getSortIcon('booking_source')}
                  </div>
                </th>
                <th 
                  className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={() => handleSort('booking_status')}
                >
                  <div className="flex items-center gap-2">
                    Status {getSortIcon('booking_status')}
                  </div>
                </th>
                <th className="px-4 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
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
                    <StatusManagementDropdown
                      bookingId={booking.id}
                      currentStatus={booking.booking_status || 'pending_approval'}
                      onStatusChange={(newStatus) => handleStatusChange(booking.id, newStatus)}
                      onSuccess={handleStatusSuccess}
                      onError={handleStatusError}
                    />
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

      {/* Bookings Cards - Mobile */}
      <div className="lg:hidden space-y-4 max-w-full">
        {filteredBookings.map((booking) => (
          <BookingCard
            key={booking.id}
            booking={booking}
            onStatusChange={handleStatusChange}
            onStatusSuccess={handleStatusSuccess}
            onStatusError={handleStatusError}
            onDelete={handleDeleteBooking}
            isDeleting={deletingBookingId}
            getStatusColor={getStatusColor}
            getSourceColor={getSourceColor}
          />
        ))}

        {filteredBookings.length === 0 && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 text-center py-12">
            <div className="text-gray-400 text-lg mb-2">📋</div>
            <p className="text-gray-500">No bookings found matching your criteria</p>
          </div>
        )}
      </div>

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
