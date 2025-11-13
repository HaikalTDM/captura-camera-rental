'use client';

import { useState, useMemo } from 'react';
import { useAdminData } from '@/contexts/AdminDataContext';
import { getAllCustomers } from '@/lib/api/bookings';
import useSWR from 'swr';
import type { Customer, Booking } from '@/lib/supabase';
import Link from 'next/link';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import { Users, Star, TrendingUp, UserPlus, Search, ArrowUpDown, Trash2, MessageCircle, Phone, Eye, Mail, Calendar, DollarSign, ShoppingBag } from 'lucide-react';

export default function CustomersPage() {
  const { bookings, isLoading: bookingsLoading } = useAdminData();
  const { data: customers = [], isLoading: customersLoading, mutate } = useSWR('admin-customers', getAllCustomers, {
    revalidateOnFocus: false,
    refreshInterval: 0, // Disable auto-refresh to prevent unmount issues
    shouldRetryOnError: false,
    revalidateIfStale: false,
    onError: (err) => {
      console.error('Error fetching customers:', err);
    },
  });
  
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'full_name' | 'totalSpent' | 'totalRentals' | 'created_at'>('full_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);

  const isLoading = bookingsLoading || customersLoading;

  // Memoize customer metrics calculations
  const customersWithMetrics = useMemo(() => customers.map(customer => {
    const customerBookings = bookings.filter(b => b.customer_id === customer.id);
    const paidBookings = customerBookings.filter(b => b.deposit_paid && b.final_payment_paid);
    const totalSpent = paidBookings.reduce((sum, b) => {
      const isNewPaymentSystem = b.deposit_amount === 100;
      return sum + (isNewPaymentSystem ? (b.deposit_amount + b.final_payment_amount) : b.total_amount);
    }, 0);
    const lastRental = customerBookings.length > 0
      ? Math.max(...customerBookings.map(b => new Date(b.created_at).getTime()))
      : null;

    return {
      ...customer,
      totalRentals: customerBookings.length,
      totalSpent,
      lastRental: lastRental ? new Date(lastRental).toISOString().split('T')[0] : null
    };
  }), [customers, bookings]);

  // Memoize filtered and sorted customers
  const filteredCustomers = useMemo(() => customersWithMetrics
    .filter(customer =>
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    }), [customersWithMetrics, searchTerm, sortBy, sortOrder]);

  // REMOVED: Don't block rendering
  // if (isLoading) {
  //   return (
  //     <div className="flex items-center justify-center h-64">
  //       <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  //     </div>
  //   );
  // }

  const getReliabilityColor = (totalRentals: number) => {
    if (totalRentals >= 5) return 'bg-green-100 text-green-700 border-green-200';
    if (totalRentals >= 2) return 'bg-blue-100 text-blue-700 border-blue-200';
    if (totalRentals >= 1) return 'bg-amber-100 text-amber-700 border-amber-200';
    return 'bg-purple-100 text-purple-700 border-purple-200';
  };

  const getCustomerBookings = (customerId: string) => {
    return bookings.filter(booking => booking.customer_id === customerId);
  };

  // Handle checkbox selection
  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers(prev =>
      prev.includes(customerId)
        ? prev.filter(id => id !== customerId)
        : [...prev, customerId]
    );
  };

  // Handle select all checkbox
  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map(customer => customer.id));
    }
  };

  // Handle bulk delete
  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) {
      alert('Please select customers to delete');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedCustomers.length} customer(s)? This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/customers/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerIds: selectedCustomers }),
      });

      const data = await response.json();

      if (data.success) {
        // Show detailed results
        const { summary, results } = data;
        let message = `Bulk delete completed:\n`;
        message += `✅ Deleted: ${summary.deleted}\n`;
        if (summary.skipped > 0) {
          message += `⚠️ Skipped: ${summary.skipped} (customers with active bookings)\n`;
        }
        if (summary.failed > 0) {
          message += `❌ Failed: ${summary.failed}\n`;
        }

        alert(message);

        // Reload customers data
        mutate();
        setSelectedCustomers([]);
      } else {
        alert('Failed to delete customers: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting customers:', error);
      alert('Failed to delete customers. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Handle single customer delete
  const handleDeleteSingleCustomer = async (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    if (!customer) return;

    if (!confirm(`Are you sure you want to delete ${customer.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${customerId}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Customer deleted successfully');
        mutate();
      } else {
        alert('Failed to delete customer: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting customer:', error);
      alert('Failed to delete customer. Please try again.');
    }
  };

  const customerStats = {
    total: customers.length,
    excellent: customersWithMetrics.filter(c => c.totalRentals >= 5).length,
    good: customersWithMetrics.filter(c => c.totalRentals >= 2 && c.totalRentals < 5).length,
    fair: customersWithMetrics.filter(c => c.totalRentals >= 1 && c.totalRentals < 2).length,
    new: customersWithMetrics.filter(c => c.totalRentals === 0).length,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-6 md:space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-slate-900 mb-1 sm:mb-2">Customer Database</h1>
            <p className="text-slate-600 text-sm sm:text-base md:text-lg">Manage customer relationships and rental history</p>
          </div>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-sm border border-slate-200 px-4 sm:px-6 py-3 sm:py-4">
            <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide mb-0.5 sm:mb-1">Total Customers</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">{customers.length}</p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <p className="text-[10px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wide">Total</p>
              <Users className="w-4 h-4 sm:w-5 sm:h-5 text-slate-400" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-slate-900">{customerStats.total}</p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <p className="text-[10px] sm:text-xs font-semibold text-green-600 uppercase tracking-wide">Excellent</p>
              <Star className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 fill-green-600" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-green-600">{customerStats.excellent}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">5+ rentals</p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <p className="text-[10px] sm:text-xs font-semibold text-blue-600 uppercase tracking-wide">Good</p>
              <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-blue-600">{customerStats.good}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">2-4 rentals</p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-1 sm:mb-2">
              <p className="text-[10px] sm:text-xs font-semibold text-amber-600 uppercase tracking-wide">Fair</p>
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
            </div>
            <p className="text-xl sm:text-2xl md:text-3xl font-bold text-amber-600">{customerStats.fair}</p>
            <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">1 rental</p>
          </div>
          <div className="bg-white rounded-lg sm:rounded-xl md:rounded-2xl shadow-sm border border-slate-200 p-3 sm:p-4 md:p-6">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-semibold text-purple-600 uppercase tracking-wide">New</p>
              <UserPlus className="w-5 h-5 text-purple-600" />
            </div>
            <p className="text-3xl font-bold text-purple-600">{customerStats.new}</p>
            <p className="text-xs text-slate-500 mt-1">No rentals yet</p>
          </div>
        </div>

        {/* Search and Sort */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, phone, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent text-slate-900 placeholder-slate-400"
              />
            </div>

            <div className="flex gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-4 py-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 text-slate-900 bg-white font-medium"
              >
                <option value="full_name">Sort by Name</option>
                <option value="totalSpent">Sort by Total Spent</option>
                <option value="totalRentals">Sort by Total Rentals</option>
                <option value="created_at">Sort by Join Date</option>
              </select>
              <button
                onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all hover:scale-105 active:scale-95 flex items-center gap-2 font-medium text-slate-700"
              >
                <ArrowUpDown className="w-4 h-4" />
                {sortOrder === 'asc' ? 'Asc' : 'Desc'}
              </button>
            </div>
          </div>

          {/* Selection Controls */}
          {filteredCustomers.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                      onChange={handleSelectAll}
                      className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                    />
                    <span className="text-sm font-semibold text-slate-700 group-hover:text-slate-900">
                      Select All ({filteredCustomers.length})
                    </span>
                  </label>
                  {selectedCustomers.length > 0 && (
                    <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold">
                      {selectedCustomers.length} selected
                    </span>
                  )}
                </div>

                {selectedCustomers.length > 0 && (
                  <button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white px-6 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:scale-105 active:scale-95 flex items-center gap-2"
                  >
                    {isDeleting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Deleting...
                      </>
                    ) : (
                      <>
                        <Trash2 className="w-4 h-4" />
                        Delete Selected ({selectedCustomers.length})
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Customers Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredCustomers.length > 0 ? filteredCustomers.map((customer) => {
            const customerBookings = getCustomerBookings(customer.id);
            const activeBookings = customerBookings.filter(b => b.status === 'active').length;
            const overduePayments = customerBookings.filter(b =>
              !b.final_payment_paid &&
              new Date(b.end_date) < new Date() &&
              b.status === 'completed'
            ).length;

            return (
              <div key={customer.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group">
                {/* Header with Checkbox and Badge */}
                <div className="flex items-start justify-between mb-6">
                  <div className="flex items-start gap-3 flex-1">
                    <label className="flex items-center mt-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.includes(customer.id)}
                        onChange={() => handleSelectCustomer(customer.id)}
                        className="w-5 h-5 text-blue-600 bg-slate-100 border-slate-300 rounded focus:ring-blue-500 cursor-pointer"
                      />
                    </label>
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">{customer.full_name}</h3>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-slate-600">
                          <Phone className="w-4 h-4 text-slate-400" />
                          <span className="text-sm font-medium">{customer.phone}</span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <Mail className="w-4 h-4 text-slate-400" />
                          <span className="text-sm">{customer.email}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${getReliabilityColor(customer.totalRentals)}`}>
                    {customer.totalRentals >= 5 ? '⭐ VIP' : customer.totalRentals >= 2 ? '👍 Good' : customer.totalRentals >= 1 ? '🆕 Fair' : '✨ New'}
                  </span>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <ShoppingBag className="w-4 h-4 text-slate-500" />
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rentals</p>
                    </div>
                    <p className="text-2xl font-bold text-slate-900">{customer.totalRentals}</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
                    <div className="flex items-center gap-2 mb-1">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <p className="text-xs font-semibold text-green-600 uppercase tracking-wide">Spent</p>
                    </div>
                    <p className="text-2xl font-bold text-green-600">RM{customer.totalSpent.toFixed(0)}</p>
                  </div>
                  <div className="col-span-2 bg-slate-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Calendar className="w-4 h-4 text-slate-500" />
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Last Rental</p>
                    </div>
                    <p className="text-sm font-medium text-slate-900">{customer.lastRental || 'No rentals yet'}</p>
                  </div>
                </div>

                {/* Status Indicators */}
                {(activeBookings > 0 || overduePayments > 0) && (
                  <div className="flex gap-2 mb-4">
                    {activeBookings > 0 && (
                      <span className="bg-blue-100 text-blue-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-blue-200">
                        {activeBookings} Active
                      </span>
                    )}
                    {overduePayments > 0 && (
                      <span className="bg-red-100 text-red-700 px-3 py-1.5 rounded-lg text-xs font-semibold border border-red-200">
                        {overduePayments} Overdue
                      </span>
                    )}
                  </div>
                )}

                {/* Notes */}
                {customer.notes && (
                  <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-4">
                    <p className="text-sm text-amber-900 font-medium">{customer.notes}</p>
                  </div>
                )}

                {/* Actions - Simplified to 2 buttons */}
                <div className="flex gap-3">
                  <Link
                    href={`/admin/customers/${customer.id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 text-center flex items-center justify-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    View Details
                  </Link>
                  <a
                    href={`https://wa.me/${formatPhoneWithCountryCode(customer.phone)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:scale-[1.02] active:scale-95 text-center flex items-center justify-center gap-2"
                  >
                    <MessageCircle className="w-4 h-4" />
                    WhatsApp
                  </a>
                </div>
              </div>
            );
          }) : (
            <div className="col-span-full text-center py-16">
              <div className="bg-slate-100 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6">
                <Users className="w-12 h-12 text-slate-400" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Customers Yet</h3>
              <p className="text-slate-600 mb-8 text-lg">Start building your customer base by creating your first booking!</p>
              <Link
                href="/admin/bookings/add"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all hover:shadow-lg hover:scale-105 active:scale-95"
              >
                <UserPlus className="w-5 h-5" />
                Create First Booking
              </Link>
            </div>
          )}
        </div>

        {filteredCustomers.length === 0 && customers.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-16 text-center">
            <div className="bg-slate-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
              <Search className="w-10 h-10 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No customers found</h3>
            <p className="text-slate-600">Try adjusting your search terms or filters</p>
          </div>
        )}
      </div>
    </div>
  );
}
