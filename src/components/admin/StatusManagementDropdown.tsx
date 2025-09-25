'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

interface StatusManagementDropdownProps {
  bookingId: string;
  currentStatus: string;
  onStatusChange: (newStatus: string) => void;
  disabled?: boolean;
  onSuccess?: (message: string) => void;
  onError?: (message: string) => void;
}

const BOOKING_STATUSES = [
  { value: 'pending_approval', label: 'Pending Approval', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-green-100 text-green-800' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' },
  { value: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' }
];

const STATUS_TRANSITIONS: Record<string, string[]> = {
  'pending_approval': ['confirmed', 'rejected', 'cancelled'],
  'confirmed': ['cancelled', 'completed'],
  'rejected': ['pending_approval'], // Allow re-review
  'cancelled': ['pending_approval'], // Allow re-activation
  'completed': [] // Final state - no transitions allowed
};

const CRITICAL_STATUSES = ['rejected', 'cancelled', 'completed'];

export default function StatusManagementDropdown({
  bookingId,
  currentStatus,
  onStatusChange,
  disabled = false,
  onSuccess,
  onError
}: StatusManagementDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState<string | null>(null);

  const currentStatusInfo = BOOKING_STATUSES.find(s => s.value === currentStatus);
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus] || [];

  const handleStatusChange = async (newStatus: string) => {
    // Check if this is a critical status change that needs confirmation
    if (CRITICAL_STATUSES.includes(newStatus) && newStatus !== currentStatus) {
      setShowConfirmDialog(newStatus);
      setIsOpen(false);
      return;
    }

    await updateStatus(newStatus);
  };

  const updateStatus = async (newStatus: string) => {
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('bookings')
        .update({
          booking_status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', bookingId);

      if (error) {
        console.error('Error updating booking status:', error);
        const errorMessage = 'Failed to update booking status. Please try again.';
        if (onError) {
          onError(errorMessage);
        } else {
          alert(errorMessage);
        }
      } else {
        onStatusChange(newStatus);
        // Show success feedback
        const statusLabel = BOOKING_STATUSES.find(s => s.value === newStatus)?.label;
        const successMessage = `Booking status updated to: ${statusLabel}`;
        if (onSuccess) {
          onSuccess(successMessage);
        } else {
          console.log(`✅ ${successMessage}`);
        }
      }
    } catch (error) {
      console.error('Error updating status:', error);
      alert('An error occurred while updating the status.');
    } finally {
      setIsUpdating(false);
      setShowConfirmDialog(null);
    }
  };

  const confirmStatusChange = () => {
    if (showConfirmDialog) {
      updateStatus(showConfirmDialog);
    }
  };

  const getConfirmationMessage = (status: string) => {
    switch (status) {
      case 'rejected':
        return 'Are you sure you want to reject this booking?\n\nThe customer will be notified.';
      case 'cancelled':
        return 'Are you sure you want to cancel this booking?\n\nThe customer will be notified.';
      case 'completed':
        return 'Mark this booking as completed?\n\nThis confirms the rental has ended\nand equipment was returned.';
      default:
        return `Are you sure you want to change the status to ${BOOKING_STATUSES.find(s => s.value === status)?.label}?`;
    }
  };

  if (disabled || isUpdating) {
    return (
      <div className="relative">
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${currentStatusInfo?.color || 'bg-gray-100 text-gray-800'} ${isUpdating ? 'opacity-50' : ''}`}>
          {isUpdating ? (
            <span className="flex items-center gap-1">
              <div className="animate-spin rounded-full h-3 w-3 border border-current border-t-transparent"></div>
              Updating...
            </span>
          ) : (
            currentStatusInfo?.label || currentStatus
          )}
        </span>
      </div>
    );
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 hover:shadow-md ${currentStatusInfo?.color || 'bg-gray-100 text-gray-800'} ${allowedTransitions.length === 0 ? 'cursor-not-allowed opacity-75' : 'cursor-pointer hover:scale-105'}`}
          disabled={allowedTransitions.length === 0}
        >
          <span className="flex items-center gap-1">
            {currentStatusInfo?.label || currentStatus}
            {allowedTransitions.length > 0 && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            )}
          </span>
        </button>

        {isOpen && allowedTransitions.length > 0 && (
          <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[140px]">
            <div className="py-1">
              {allowedTransitions.map((statusValue) => {
                const statusInfo = BOOKING_STATUSES.find(s => s.value === statusValue);
                if (!statusInfo) return null;

                return (
                  <button
                    key={statusValue}
                    onClick={() => handleStatusChange(statusValue)}
                    className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors flex items-center gap-2"
                  >
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}>
                      {statusInfo.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Click outside to close */}
        {isOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
        )}
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Status Change</h3>
            <p className="text-gray-600 mb-6 leading-relaxed break-words whitespace-pre-line">
              {getConfirmationMessage(showConfirmDialog)}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button
                onClick={() => setShowConfirmDialog(null)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg border border-gray-300 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  showConfirmDialog === 'rejected' || showConfirmDialog === 'cancelled'
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
