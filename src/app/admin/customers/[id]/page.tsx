'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCustomerById, getAllBookings } from '@/lib/api/bookings';
import type { Customer, Booking } from '@/lib/supabase';
import Link from 'next/link';

export default function CustomerDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCustomerData();
  }, [customerId]);

  const loadCustomerData = async () => {
    setIsLoading(true);
    try {
      const [customerData, allBookings] = await Promise.all([
        getCustomerById(customerId),
        getAllBookings()
      ]);

      if (customerData) {
        setCustomer(customerData);
        setNotes(customerData.notes || '');

        // Filter bookings for this customer
        const customerBookings = allBookings.filter(b => b.customer_id === customerId);
        setBookings(customerBookings);
      }
    } catch (error) {
      console.error('Error loading customer data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Customer Not Found</h1>
        <Link href="/admin/customers" className="text-blue-600 hover:text-blue-800">
          ← Back to Customers
        </Link>
      </div>
    );
  }

  // Get customer bookings
  const customerBookings = bookings.filter(b => b.customer_id === customer.id);
  const activeBookings = customerBookings.filter(b => b.status === 'active');
  const upcomingBookings = customerBookings.filter(b => b.status === 'confirmed');
  const completedBookings = customerBookings.filter(b => b.status === 'completed');
  const overduePayments = customerBookings.filter(b =>
    !b.final_payment_paid &&
    new Date(b.end_date) < new Date() &&
    b.status === 'completed'
  );

  const updateReliability = (newReliability: Customer['reliability']) => {
    setCustomer(prev => prev ? { ...prev, reliability: newReliability } : null);
  };

  const saveNotes = () => {
    setCustomer(prev => prev ? { ...prev, notes } : null);
    setIsEditingNotes(false);
  };

  const getReliabilityColor = (reliability: Customer['reliability']) => {
    switch (reliability) {
      case 'excellent': return 'bg-green-100 text-green-800 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'fair': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'poor': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'active': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-gray-100 text-gray-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalOverdue = overduePayments.reduce((sum, booking) => sum + booking.balanceDue, 0);
  const averageRental = customer.totalRentals > 0 ? Math.round(customer.totalSpent / customer.totalRentals) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/customers"
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{customer.name}</h1>
            <p className="text-gray-600">{customer.phone} • {customer.email}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getReliabilityColor(customer.reliability)}`}>
            {customer.reliability.toUpperCase()}
          </span>
          {overduePayments.length > 0 && (
            <span className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-800 border border-red-200">
              OVERDUE
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              👤 Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Full Name</label>
                <p className="text-lg font-semibold text-gray-900">{customer.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone Number</label>
                <p className="text-lg text-gray-900">
                  <a href={`tel:${customer.phone}`} className="hover:text-blue-600">
                    {customer.phone}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Email Address</label>
                <p className="text-lg text-gray-900">
                  <a href={`mailto:${customer.email}`} className="hover:text-blue-600">
                    {customer.email}
                  </a>
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Customer ID</label>
                <p className="text-lg text-gray-900">{customer.id}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Last Rental</label>
                <p className="text-lg text-gray-900">{customer.lastRental}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Member Since</label>
                <p className="text-lg text-gray-900">January 2024</p>
              </div>
            </div>
          </div>

          {/* Active/Upcoming Bookings */}
          {(activeBookings.length > 0 || upcomingBookings.length > 0) && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                📅 Current & Upcoming Bookings
              </h3>
              <div className="space-y-4">
                {activeBookings.map((booking) => (
                  <div key={booking.id} className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-blue-900">Active Rental - {booking.cameraName}</h4>
                      <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">ACTIVE</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-blue-700">Booking ID</p>
                        <p className="font-medium text-blue-900">{booking.id}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">Return Date</p>
                        <p className="font-medium text-blue-900">{booking.endDate}</p>
                      </div>
                      <div>
                        <p className="text-blue-700">Duration</p>
                        <p className="font-medium text-blue-900">{booking.totalDays} days</p>
                      </div>
                      <div>
                        <p className="text-blue-700">Amount</p>
                        <p className="font-medium text-green-600">RM{booking.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                ))}
                
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-green-900">Upcoming - {booking.cameraName}</h4>
                      <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">CONFIRMED</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-green-700">Booking ID</p>
                        <p className="font-medium text-green-900">{booking.id}</p>
                      </div>
                      <div>
                        <p className="text-green-700">Start Date</p>
                        <p className="font-medium text-green-900">{booking.startDate}</p>
                      </div>
                      <div>
                        <p className="text-green-700">Duration</p>
                        <p className="font-medium text-green-900">{booking.totalDays} days</p>
                      </div>
                      <div>
                        <p className="text-green-700">Amount</p>
                        <p className="font-medium text-green-600">RM{booking.totalAmount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Overdue Payments */}
          {overduePayments.length > 0 && (
            <div className="bg-red-50 rounded-2xl border border-red-200 p-6">
              <h3 className="text-lg font-bold text-red-900 mb-4 flex items-center gap-2">
                ⚠️ Overdue Payments
              </h3>
              <div className="space-y-4">
                {overduePayments.map((booking) => (
                  <div key={booking.id} className="bg-white border border-red-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-red-900">{booking.cameraName}</h4>
                      <span className="text-sm bg-red-100 text-red-800 px-2 py-1 rounded font-medium">
                        RM{booking.balanceDue} OVERDUE
                      </span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-red-700">Booking ID</p>
                        <p className="font-medium text-red-900">{booking.id}</p>
                      </div>
                      <div>
                        <p className="text-red-700">End Date</p>
                        <p className="font-medium text-red-900">{booking.endDate}</p>
                      </div>
                      <div>
                        <p className="text-red-700">Total Amount</p>
                        <p className="font-medium text-red-900">RM{booking.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-red-700">Paid</p>
                        <p className="font-medium text-green-600">RM{booking.depositPaid}</p>
                      </div>
                    </div>
                    <div className="mt-3 flex gap-2">
                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors"
                      >
                        View Booking
                      </Link>
                      <button className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded text-sm transition-colors">
                        Mark Paid
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Booking History */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📊 Booking History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Camera</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {customerBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/admin/bookings/${booking.id}`} className="text-blue-600 hover:text-blue-800">
                          {booking.id}
                        </Link>
                        <p className="text-xs text-gray-500">{booking.createdAt}</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{booking.cameraName}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {booking.startDate} to {booking.endDate}
                        <p className="text-xs text-gray-500">{booking.totalDays} days</p>
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <p className="font-medium text-green-600">RM{booking.totalAmount}</p>
                        {booking.balanceDue > 0 && (
                          <p className="text-xs text-red-600">Due: RM{booking.balanceDue}</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                📝 Customer Notes
              </h3>
              <button
                onClick={() => isEditingNotes ? saveNotes() : setIsEditingNotes(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {isEditingNotes ? 'Save' : 'Edit'}
              </button>
            </div>
            {isEditingNotes ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes about this customer..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {customer.notes || 'No notes added yet.'}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Stats */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📈 Customer Stats
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Spent</label>
                <p className="text-2xl font-bold text-green-600">RM{customer.totalSpent}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Rentals</label>
                <p className="text-2xl font-bold text-blue-600">{customer.totalRentals}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Average per Rental</label>
                <p className="text-2xl font-bold text-purple-600">RM{averageRental}</p>
              </div>
              {totalOverdue > 0 && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Outstanding</label>
                  <p className="text-2xl font-bold text-red-600">RM{totalOverdue}</p>
                </div>
              )}
            </div>
          </div>

          {/* Reliability Management */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              ⭐ Reliability
            </h3>
            <div>
              <label className="text-sm font-medium text-gray-500 block mb-2">Customer Rating</label>
              <select
                value={customer.reliability}
                onChange={(e) => updateReliability(e.target.value as Customer['reliability'])}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
              >
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
                <option value="poor">Poor</option>
              </select>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              ⚡ Quick Actions
            </h3>
            <div className="space-y-3">
              <a
                href={`https://wa.me/${customer.phone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                💬 WhatsApp
              </a>
              <a
                href={`tel:${customer.phone}`}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                📞 Call
              </a>
              <a
                href={`mailto:${customer.email}`}
                className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                ✉️ Email
              </a>
              <button className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                📅 New Booking
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
