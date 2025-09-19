'use client';

import { useState } from 'react';
import { mockCustomers, mockBookings, type Customer } from '@/data/mockAdminData';
import Link from 'next/link';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>(mockCustomers);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'totalSpent' | 'totalRentals' | 'lastRental'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Filter and sort customers
  const filteredCustomers = customers
    .filter(customer => 
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
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

  const getReliabilityColor = (reliability: Customer['reliability']) => {
    switch (reliability) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      case 'poor': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCustomerBookings = (customerId: string) => {
    return mockBookings.filter(booking => 
      booking.customerName === customers.find(c => c.id === customerId)?.name
    );
  };

  const customerStats = {
    total: customers.length,
    excellent: customers.filter(c => c.reliability === 'excellent').length,
    good: customers.filter(c => c.reliability === 'good').length,
    fair: customers.filter(c => c.reliability === 'fair').length,
    poor: customers.filter(c => c.reliability === 'poor').length,
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
              <option value="name">Sort by Name</option>
              <option value="totalSpent">Sort by Total Spent</option>
              <option value="totalRentals">Sort by Total Rentals</option>
              <option value="lastRental">Sort by Last Rental</option>
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
        {filteredCustomers.map((customer) => {
          const customerBookings = getCustomerBookings(customer.id);
          const activeBookings = customerBookings.filter(b => b.status === 'active').length;
          const overduePayments = customerBookings.filter(b => b.paymentStatus === 'overdue').length;
          
          return (
            <div key={customer.id} className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 hover:shadow-xl transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{customer.name}</h3>
                  <p className="text-gray-600">{customer.phone}</p>
                  <p className="text-sm text-gray-500">{customer.email}</p>
                </div>
                <span className={`px-3 py-1 rounded-lg text-sm font-medium ${getReliabilityColor(customer.reliability)}`}>
                  {customer.reliability}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                  <p className="text-sm text-gray-500">Total Rentals</p>
                  <p className="text-lg font-semibold text-gray-900">{customer.totalRentals}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Total Spent</p>
                  <p className="text-lg font-semibold text-green-600">RM{customer.totalSpent}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-500">Last Rental</p>
                  <p className="text-sm text-gray-900">{customer.lastRental}</p>
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
        })}
      </div>

      {filteredCustomers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">👥</div>
          <p className="text-gray-500">No customers found matching your search</p>
        </div>
      )}
    </div>
  );
}
