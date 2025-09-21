'use client';

import React, { useState } from 'react';
import type { Booking } from '@/lib/supabase';

interface BookingApprovalCardProps {
  booking: Booking & {
    customer: any;
    camera: any;
  };
  onApprove: (bookingId: string, notes?: string) => Promise<void>;
  onReject: (bookingId: string, reason: string, notes?: string) => Promise<void>;
  onRefresh: () => void;
}

export default function BookingApprovalCard({ 
  booking, 
  onApprove, 
  onReject, 
  onRefresh 
}: BookingApprovalCardProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [adminNotes, setAdminNotes] = useState('');

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-MY', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount: number) => {
    return `RM${amount.toFixed(2)}`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      await onApprove(booking.id, adminNotes);
      setShowApproveModal(false);
      setAdminNotes('');
      onRefresh();
    } catch (error) {
      console.error('Error approving booking:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }

    setIsProcessing(true);
    try {
      await onReject(booking.id, rejectionReason, adminNotes);
      setShowRejectModal(false);
      setRejectionReason('');
      setAdminNotes('');
      onRefresh();
    } catch (error) {
      console.error('Error rejecting booking:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-400">
        {/* Header */}
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {booking.camera?.name || booking.camera_id}
            </h3>
            <p className="text-sm text-gray-500">
              Booking ID: {booking.id.slice(-8).toUpperCase()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(booking.booking_status || 'pending')}`}>
            {booking.booking_status?.replace('_', ' ').toUpperCase() || 'PENDING'}
          </span>
        </div>

        {/* Booking Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">📅 Booking Details</h4>
            <p className="text-sm text-gray-600">
              <strong>Dates:</strong> {formatDate(booking.start_date)} - {formatDate(booking.end_date)}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Duration:</strong> {booking.total_days} day{booking.total_days > 1 ? 's' : ''}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Daily Rate:</strong> {formatCurrency(booking.daily_rate)}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Total Amount:</strong> {formatCurrency(booking.total_amount)}
            </p>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">👤 Customer Details</h4>
            <p className="text-sm text-gray-600">
              <strong>Name:</strong> {booking.customer?.name || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Phone:</strong> {booking.customer?.phone || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Email:</strong> {booking.customer?.email || 'N/A'}
            </p>
            <p className="text-sm text-gray-600">
              <strong>Pickup:</strong> {booking.pickup_method === 'pickup' ? 'Customer Pickup' : 'Delivery'}
            </p>
          </div>
        </div>

        {/* Notes */}
        {booking.notes && (
          <div className="mb-4">
            <h4 className="font-medium text-gray-900 mb-1">📝 Special Requests</h4>
            <p className="text-sm text-gray-600 bg-gray-50 p-2 rounded">{booking.notes}</p>
          </div>
        )}

        {/* Action Buttons */}
        {booking.booking_status === 'pending_approval' && (
          <div className="flex space-x-3">
            <button
              onClick={() => setShowApproveModal(true)}
              disabled={isProcessing}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              ✅ Approve Booking
            </button>
            <button
              onClick={() => setShowRejectModal(true)}
              disabled={isProcessing}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
            >
              ❌ Reject Booking
            </button>
          </div>
        )}

        {/* Status Info for Non-Pending Bookings */}
        {booking.booking_status !== 'pending_approval' && (
          <div className="bg-gray-50 p-3 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Status:</strong> {booking.booking_status?.replace('_', ' ').toUpperCase()}
            </p>
            {booking.approved_at && (
              <p className="text-sm text-gray-600">
                <strong>Processed:</strong> {new Date(booking.approved_at).toLocaleString()}
              </p>
            )}
            {booking.rejection_reason && (
              <p className="text-sm text-red-600">
                <strong>Rejection Reason:</strong> {booking.rejection_reason}
              </p>
            )}
            {booking.admin_notes && (
              <p className="text-sm text-gray-600">
                <strong>Admin Notes:</strong> {booking.admin_notes}
              </p>
            )}
          </div>
        )}
      </div>

      {/* Approve Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Approve Booking</h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to approve this booking? This will confirm the booking and block the calendar dates.
            </p>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Add any notes about this approval..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowApproveModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleApprove}
                disabled={isProcessing}
                className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Approving...' : 'Approve'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Reject Booking</h3>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rejection Reason *
              </label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={3}
                placeholder="Please provide a reason for rejection..."
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Admin Notes (Optional)
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg"
                rows={2}
                placeholder="Additional notes..."
              />
            </div>

            <div className="flex space-x-3">
              <button
                onClick={() => setShowRejectModal(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={isProcessing || !rejectionReason.trim()}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors disabled:opacity-50"
              >
                {isProcessing ? 'Rejecting...' : 'Reject'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
