'use client';

import { useState, useEffect } from 'react';
import { getAllCustomers, getAllBookings } from '../../lib/api/bookings';
import type { Customer, Booking } from '../../lib/supabase';
import Link from 'next/link';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'full_name' | 'totalSpent' | 'totalRentals' | 'created_at'>('full_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomersData();
  }, []);

  const loadCustomersData = async () => {
    setIsLoading(true);
    try {
      const [customersData, bookingsData] = await Promise.all([
        getAllCustomers(),
        getAllBookings()
      ]);
      setCustomers(customersData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading customers data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate customer metrics
  const customersWithMetrics = customers.map(customer => {
    const customerBookings = bookings.filter(b => b.customer_id === customer.id);
    const totalSpent = customerBookings.reduce((sum, b) => sum + b.total_amount, 0);
    const lastRental = customerBookings.length > 0
      ? Math.max(...customerBookings.map(b => new Date(b.created_at).getTime()))
      : null;

    return {
      ...customer,
      totalRentals: customerBookings.length,
      totalSpent,
      lastRental: lastRental ? new Date(lastRental).toISOString().split('T')[0] : null
    };
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Filter and sort customers
  const filteredCustomers = customersWithMetrics
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
    });

  const getReliabilityColor = (totalRentals: number) => {
    if (totalRentals >= 5) return 'bg-green-100 text-green-800';
    if (totalRentals >= 1) return 'bg-yellow-100 text-yellow-800';
    return 'bg-gray-100 text-gray-800';
  };

  const getCustomerBookings = (customerId: string) => {
    return bookings.filter(booking => booking.customer_id === customerId);
  };

  const customerStats = {
    total: customers.length,
    excellent: customersWithMetrics.filter(c => c.totalRentals >= 5).length,
    good: customersWithMetrics.filter(c => c.totalRentals >= 2 && c.totalRentals < 5).length,
    fair: customersWithMetrics.filter(c => c.totalRentals >= 1 && c.totalRentals < 2).length,
    new: customersWithMetrics.filter(c => c.totalRentals === 0).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Customer Database</h1>
            <p className="text-blue-100 text-lg">Manage customer relationships and rental history</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-sm">Total Customers</p>
            <p className="text-2xl font-bold">{customers.length}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total</p>
            <p className="text-2xl font-bold text-gray-900 mt-2">{customerStats.total}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Excellent</p>
            <p className="text-2xl font-bold text-green-600 mt-2">{customerStats.excellent}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Good</p>
            <p className="text-2xl font-bold text-blue-600 mt-2">{customerStats.good}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Fair</p>
            <p className="text-2xl font-bold text-yellow-600 mt-2">{customerStats.fair}</p>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Poor</p>
            <p className="text-2xl font-bold text-red-600 mt-2">{customerStats.poor}</p>
          </div>
        </div>
      </div>

      {/* Search and Sort */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
          <div className="relative flex-1 max-w-md">
            <input
              type="text"
              placeholder="Search customers..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              🔍
            </div>
          </div>
          
          <div className="flex gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
            >
              <option value="full_name">Sort by Name</option>
              <option value="totalSpent">Sort by Total Spent</option>
              <option value="totalRentals">Sort by Total Rentals</option>
              <option value="created_at">Sort by Join Date</option>
            </select>
            <button
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>
        </div>
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
            <div key={customer.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{customer.full_name}</h3>
                  <p className="text-gray-600">{customer.phone}</p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getReliabilityColor(customer.totalRentals)}`}>
                  {customer.totalRentals >= 5 ? 'Excellent' : customer.totalRentals >= 2 ? 'Good' : customer.totalRentals >= 1 ? 'Fair' : 'New'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Rentals</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.totalRentals}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-lg font-semibold text-green-600">RM{customer.totalSpent.toFixed(2)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Last Rental</p>
                  <p className="text-sm text-gray-900">{customer.lastRental || 'No rentals yet'}</p>
                </div>
              </div>

              {/* Status Indicators */}
              <div className="flex gap-2 mb-4">
                {activeBookings > 0 && (
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-medium">
                    {activeBookings} Active
                  </span>
                )}
                {overduePayments > 0 && (
                  <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs font-medium">
                    {overduePayments} Overdue
                  </span>
                )}
              </div>

              {/* Notes */}
              {customer.notes && (
                <div className="bg-gray-50 rounded-lg p-3 mb-4">
                  <p className="text-sm text-gray-700">{customer.notes}</p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <a
                  href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg text-sm text-center transition-colors"
                >
                  💬 WhatsApp
                </a>
                <a
                  href={`tel:${customer.phone}`}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-2 px-3 rounded-lg text-sm text-center transition-colors"
                >
                  📞 Call
                </a>
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="flex-1 bg-gray-500 hover:bg-gray-600 text-white py-2 px-3 rounded-lg text-sm text-center transition-colors"
                >
                  View
                </Link>
              </div>
            </div>
          );
        }) : (
          <div className="col-span-full text-center py-12">
            <div className="text-gray-400 text-6xl mb-4">👥</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No Customers Yet</h3>
            <p className="text-gray-500 mb-6">Start building your customer base by creating your first booking!</p>
            <Link
              href="/admin/bookings/add"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Create First Booking
            </Link>
          </div>
        )}
      </div>

      {filteredCustomers.length === 0 && customers.length > 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">🔍</div>
          <p className="text-gray-500">No customers found matching your search</p>
        </div>
      )}
    </div>
  );
}
