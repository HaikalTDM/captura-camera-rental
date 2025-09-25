'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Booking } from '@/lib/supabase';
import Link from 'next/link';

export default function BookingApprovalsPage() {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBooking, setProcessingBooking] = useState<string | null>(null);

  useEffect(() => {
    loadPendingBookings();
  }, []);

  const loadPendingBookings = async () => {
    setIsLoading(true);
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(*),
          camera:cameras(*)
        `)
        .eq('booking_status', 'pending_approval')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading pending bookings:', error);
      } else {
        setPendingBookings(bookings || []);
      }
    } catch (error) {
      console.error('Error in loadPendingBookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId: string, notes?: string) => {
    setProcessingBooking(bookingId);
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
        loadPendingBookings(); // Refresh the list
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      alert('Failed to approve booking');
    } finally {
      setProcessingBooking(null);
    }
  };

  const handleRejectBooking = async (bookingId: string, reason: string, notes?: string) => {
    setProcessingBooking(bookingId);
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
        loadPendingBookings(); // Refresh the list
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      alert('Failed to reject booking');
    } finally {
      setProcessingBooking(null);
    }
  };

  const quickApprove = (bookingId: string) => {
    if (confirm('Are you sure you want to approve this booking?')) {
      handleApproveBooking(bookingId, 'Quick approval from admin dashboard');
    }
  };

  const quickReject = (bookingId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      handleRejectBooking(bookingId, reason, 'Quick rejection from admin dashboard');
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
      <div className="bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Booking Approvals</h1>
            <p className="text-orange-100 text-lg">Review and approve pending camera rental bookings</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-orange-100 text-sm">Pending Approvals</p>
            <p className="text-2xl font-bold">{pendingBookings.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          ⚡ Quick Actions
        </h2>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/bookings"
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            View All Bookings
          </Link>
          <button
            onClick={loadPendingBookings}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Refresh List
          </button>
          <Link
            href="/admin/setup-pickup-scheduling"
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
          >
            Setup Pickup Scheduling
          </Link>
        </div>
      </div>

      {/* Pending Bookings */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-orange-100">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">⏳</span>
            </span>
            Pending Approvals ({pendingBookings.length})
          </h3>
          <p className="text-sm text-gray-600 mt-2">
            These bookings are waiting for admin approval before customers can proceed with pickup
          </p>
        </div>
        
        <div className="p-6">
          {pendingBookings.length > 0 ? (
            <div className="space-y-6">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="bg-orange-50 rounded-lg border border-orange-200 p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold text-gray-900">{booking.customer?.full_name}</h4>
                        <span className="px-3 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          Pending Approval
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">📷 <strong>Camera:</strong></p>
                          <p className="font-medium">{booking.camera?.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">📅 <strong>Rental Period:</strong></p>
                          <p className="font-medium">
                            {new Date(booking.start_date).toLocaleDateString()} - {new Date(booking.end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">💰 <strong>Total Amount:</strong></p>
                          <p className="font-medium text-green-600">RM{booking.total_amount}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-1">📞 <strong>Contact:</strong></p>
                          <p className="font-medium">{booking.customer?.phone}</p>
                        </div>
                      </div>

                      {booking.notes && (
                        <div className="bg-gray-50 rounded p-3 mb-4">
                          <p className="text-sm text-gray-600 mb-1"><strong>Customer Notes:</strong></p>
                          <p className="text-sm">{booking.notes}</p>
                        </div>
                      )}

                      <div className="text-xs text-gray-500">
                        <p>Booking ID: {booking.id}</p>
                        <p>Submitted: {new Date(booking.created_at).toLocaleString()}</p>
                        <p>Source: {booking.booking_source}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-3 pt-4 border-t border-orange-200">
                    <button
                      onClick={() => quickApprove(booking.id)}
                      disabled={processingBooking === booking.id}
                      className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      {processingBooking === booking.id ? 'Processing...' : '✅ Approve'}
                    </button>
                    
                    <button
                      onClick={() => quickReject(booking.id)}
                      disabled={processingBooking === booking.id}
                      className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      {processingBooking === booking.id ? 'Processing...' : '❌ Reject'}
                    </button>
                    
                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium"
                    >
                      📋 View Details
                    </Link>
                    
                    {booking.customer?.phone && (
                      <a
                        href={`https://wa.me/${booking.customer.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium"
                      >
                        💬 WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">✅</span>
              </div>
              <p className="text-gray-600 font-medium">No pending approvals!</p>
              <p className="text-sm text-gray-500 mt-1">All bookings have been processed. Great job! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
