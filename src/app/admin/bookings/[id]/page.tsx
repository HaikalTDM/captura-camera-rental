'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAllBookings } from '../../../lib/api/bookings';
import type { Booking } from '../../../lib/supabase';
import Link from 'next/link';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBookingData();
  }, [bookingId]);

  const loadBookingData = async () => {
    setIsLoading(true);
    try {
      const bookings = await getAllBookings();
      const foundBooking = bookings.find(b => b.id === bookingId);
      if (foundBooking) {
        setBooking(foundBooking);
        setNotes(foundBooking.notes || '');
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
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

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
        <Link href="/admin/bookings" className="text-blue-600 hover:text-blue-800">
          ← Back to Bookings
        </Link>
      </div>
    );
  }

  const updateBookingStatus = (newStatus: Booking['status']) => {
    setBooking(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const updatePaymentStatus = (newPaymentStatus: Booking['paymentStatus']) => {
    setBooking(prev => prev ? { ...prev, paymentStatus: newPaymentStatus } : null);
  };

  const saveNotes = () => {
    setBooking(prev => prev ? { ...prev, notes } : null);
    setIsEditing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'active': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'completed': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'overdue': return 'bg-red-100 text-red-800 border-red-200';
      case 'deposit_paid': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'fully_paid': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/admin/bookings"
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Booking {booking.id}</h1>
            <p className="text-gray-600">Created on {booking.createdAt}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(booking.status)}`}>
            {booking.status.toUpperCase()}
          </span>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium border ${getStatusColor(booking.paymentStatus)}`}>
            {booking.paymentStatus.replace('_', ' ').toUpperCase()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              👤 Customer Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Name</label>
                <p className="text-lg font-semibold text-gray-900">{booking.customerName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Phone</label>
                <p className="text-lg text-gray-900">
                  <a href={`tel:${booking.customerPhone}`} className="hover:text-blue-600">
                    {booking.customerPhone}
                  </a>
                </p>
              </div>
              <div className="md:col-span-2">
                <label className="text-sm font-medium text-gray-500">Email</label>
                <p className="text-lg text-gray-900">
                  <a href={`mailto:${booking.customerEmail}`} className="hover:text-blue-600">
                    {booking.customerEmail}
                  </a>
                </p>
              </div>
            </div>
          </div>

          {/* Camera & Rental Details */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📷 Rental Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Camera</label>
                <p className="text-lg font-semibold text-gray-900">{booking.cameraName}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500">Start Date</label>
                  <p className="text-lg text-gray-900">{booking.startDate}</p>
                  <p className="text-sm text-gray-500">Pickup: {booking.pickupTime}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">End Date</label>
                  <p className="text-lg text-gray-900">{booking.endDate}</p>
                  <p className="text-sm text-gray-500">Return: {booking.returnTime}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500">Duration</label>
                  <p className="text-lg text-gray-900">{booking.totalDays} days</p>
                  <p className="text-sm text-gray-500">RM{booking.dailyRate}/day</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                📝 Notes
              </h3>
              <button
                onClick={() => isEditing ? saveNotes() : setIsEditing(true)}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors"
              >
                {isEditing ? 'Save' : 'Edit'}
              </button>
            </div>
            {isEditing ? (
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Add notes about this booking..."
              />
            ) : (
              <p className="text-gray-700 whitespace-pre-wrap">
                {booking.notes || 'No notes added yet.'}
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              💰 Payment Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Total Amount</span>
                <span className="font-semibold">RM{booking.totalAmount}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Deposit Paid</span>
                <span className="text-green-600 font-semibold">RM{booking.depositPaid}</span>
              </div>
              <div className="border-t pt-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Balance Due</span>
                  <span className={`font-bold ${booking.balanceDue > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    RM{booking.balanceDue}
                  </span>
                </div>
              </div>
            </div>
            
            {booking.balanceDue > 0 && (
              <button
                onClick={() => updatePaymentStatus('fully_paid')}
                className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 rounded-lg transition-colors"
              >
                Mark as Fully Paid
              </button>
            )}
          </div>

          {/* Status Management */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              🔄 Status Management
            </h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Booking Status</label>
                <select
                  value={booking.status}
                  onChange={(e) => updateBookingStatus(e.target.value as Booking['status'])}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Payment Status</label>
                <select
                  value={booking.paymentStatus}
                  onChange={(e) => updatePaymentStatus(e.target.value as Booking['paymentStatus'])}
                  className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="pending">Pending</option>
                  <option value="deposit_paid">Deposit Paid</option>
                  <option value="fully_paid">Fully Paid</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              ⚡ Quick Actions
            </h3>
            <div className="space-y-3">
              <a
                href={`https://wa.me/${booking.customerPhone.replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                💬 WhatsApp Customer
              </a>
              <a
                href={`tel:${booking.customerPhone}`}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                📞 Call Customer
              </a>
              <button
                onClick={() => window.print()}
                className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                🖨️ Print Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
