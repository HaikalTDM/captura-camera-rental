'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  AlertCircle,
  BookOpen,
  Calendar,
  Camera,
  CheckCircle,
  Clock,
  DollarSign,
  Eye,
  MessageCircle,
  Phone,
  RefreshCw,
  Settings,
  XCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Booking } from '@/lib/supabase';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import { customToast } from '@/components/ui/toast-config';

type CameraOption = {
  id: string;
  name: string;
  brand?: string | null;
  model?: string | null;
};

function formatDateRange(startDate: string, endDate: string) {
  return `${new Date(startDate).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - ${new Date(endDate).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}`;
}

function formatSubmittedDate(createdAt?: string | null) {
  if (!createdAt) return 'Unknown';

  return new Date(createdAt).toLocaleString('en-MY', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function BookingApprovalsPage() {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [cameras, setCameras] = useState<CameraOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBooking, setProcessingBooking] = useState<string | null>(null);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  useEffect(() => {
    loadPendingBookings();
    loadCameras();
  }, []);

  const queueInsights = useMemo(() => {
    const oldestPending = pendingBookings[0];
    const highValueCount = pendingBookings.filter((booking) => booking.total_amount >= 300).length;

    return {
      oldestPending,
      highValueCount,
    };
  }, [pendingBookings]);

  const loadCameras = async () => {
    try {
      const { data: camerasData, error } = await supabase
        .from('cameras')
        .select('id, name, brand, model')
        .order('name');

      if (error) {
        customToast.error('Error loading cameras', error.message);
        return;
      }

      setCameras((camerasData as CameraOption[]) || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      customToast.error('Error loading cameras', message);
    }
  };

  const getCameraInfo = (cameraId: string) => {
    const camera = cameras.find((item) => item.id === cameraId);

    if (!camera) {
      return { name: 'Unknown Camera', brand: '', model: '' };
    }

    return {
      name: camera.name,
      brand: camera.brand || '',
      model: camera.model || '',
    };
  };

  const loadPendingBookings = async () => {
    setIsLoading(true);

    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(
            id,
            full_name,
            email,
            phone
          )
        `)
        .eq('booking_status', 'pending_approval')
        .order('created_at', { ascending: true });

      if (error) {
        customToast.error('Error loading pending bookings', error.message);
        return;
      }

      setPendingBookings(bookings || []);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      customToast.error('Error loading pending bookings', message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveBooking = async (bookingId: string, notes?: string): Promise<boolean> => {
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
        customToast.success('Booking Approved!', 'The customer has been notified.');
        loadPendingBookings();
        return true;
      }

      customToast.error('Error', result.error);
      return false;
    } catch {
      customToast.error('Failed to approve booking', 'Please try again.');
      return false;
    } finally {
      setProcessingBooking(null);
    }
  };

  const handleRejectBooking = async (bookingId: string, reason: string, notes?: string): Promise<boolean> => {
    setProcessingBooking(bookingId);

    try {
      const response = await fetch(`/api/bookings/${bookingId}/reject`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejection_reason: reason,
          admin_notes: notes,
        }),
      });

      const result = await response.json();

      if (result.success) {
        customToast.warning('Booking Rejected', 'The customer has been notified.');
        loadPendingBookings();
        return true;
      }

      customToast.error('Error', result.error);
      return false;
    } catch {
      customToast.error('Failed to reject booking', 'Please try again.');
      return false;
    } finally {
      setProcessingBooking(null);
    }
  };

  const quickApprove = (bookingId: string) => {
    void handleApproveBooking(bookingId, 'Quick approval from approvals board');
  };

  const quickReject = (bookingId: string) => {
    setSelectedBookingId(bookingId);
    setRejectReason('');
    setShowRejectModal(true);
  };

  const closeRejectModal = () => {
    setShowRejectModal(false);
    setSelectedBookingId(null);
    setRejectReason('');
  };

  const handleConfirmReject = async () => {
    if (!selectedBookingId || !rejectReason.trim()) {
      return;
    }

    const success = await handleRejectBooking(selectedBookingId, rejectReason.trim(), 'Quick rejection from approvals board');
    if (success) {
      closeRejectModal();
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#2b2621] border-t-orange-500" />
          <p className="text-sm font-medium text-stone-400">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] border border-[#2d2823] bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.16),_transparent_35%),linear-gradient(135deg,#191614_0%,#141210_60%,#1b1714_100%)] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#3a332c] bg-[#1a1714] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-300">
              <Clock className="h-3.5 w-3.5" />
              Approval Queue
            </div>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#3a2d22] bg-[#221912] shadow-lg">
                <Clock className="h-7 w-7 text-orange-300" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-stone-50">Booking Approvals</h1>
                <p className="mt-1 text-sm text-stone-400">Review requests, scan the essentials, and make the call quickly.</p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-[#312b25] bg-[#1b1815] px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">Pending Now</p>
              <p className="mt-2 text-4xl font-bold text-stone-50">{pendingBookings.length}</p>
            </div>
            <div className="rounded-2xl border border-[#312b25] bg-[#1b1815] px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-stone-500">High Value</p>
              <p className="mt-2 text-4xl font-bold text-orange-300">{queueInsights.highValueCount}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="rounded-[28px] border border-[#2d2823] bg-[#161412] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          <div className="mb-5 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#231f1b]">
              <Settings className="h-4 w-4 text-orange-300" />
            </div>
            <h2 className="text-lg font-bold text-stone-50">Quick Actions</h2>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/bookings"
              className="inline-flex items-center gap-2 rounded-xl bg-[#f3efe8] px-5 py-2.5 text-sm font-semibold text-[#11100f] transition-all duration-200 hover:bg-white active:scale-95"
            >
              <BookOpen className="h-4 w-4" />
              View All Bookings
            </Link>
            <button
              onClick={loadPendingBookings}
              className="inline-flex items-center gap-2 rounded-xl border border-[#332d27] bg-[#1d1916] px-5 py-2.5 text-sm font-semibold text-stone-300 transition-all duration-200 hover:border-[#4a4036] hover:bg-[#24201c] active:scale-95"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh List
            </button>
            <Link
              href="/admin/setup-pickup-scheduling"
              className="inline-flex items-center gap-2 rounded-xl border border-[#4a3727] bg-[#221912] px-5 py-2.5 text-sm font-semibold text-orange-300 transition-all duration-200 hover:border-[#c96b2c] hover:bg-[#2a1d15] active:scale-95"
            >
              <Calendar className="h-4 w-4" />
              Setup Pickup Scheduling
            </Link>
          </div>
        </div>

        <div className="rounded-[28px] border border-[#2d2823] bg-[#161412] p-6 shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#231f1b]">
              <AlertCircle className="h-4 w-4 text-orange-300" />
            </div>
            <h2 className="text-lg font-bold text-stone-50">Queue Snapshot</h2>
          </div>
          <div className="space-y-3 text-sm text-stone-400">
            <p>{pendingBookings.length} booking{pendingBookings.length !== 1 ? 's' : ''} currently waiting for a decision.</p>
            <p>
              {queueInsights.oldestPending
                ? `Oldest request was submitted ${formatSubmittedDate(queueInsights.oldestPending.created_at)}.`
                : 'No pending requests in the queue.'}
            </p>
            <p>Use approve for clean confirmations and reject only when you want to notify the customer with a reason.</p>
          </div>
        </div>
      </div>

      <div className="rounded-[28px] border border-[#2d2823] bg-[#161412] overflow-hidden shadow-[0_24px_60px_rgba(0,0,0,0.28)]">
        <div className="border-b border-[#26211d] bg-[#191715] p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#231f1b]">
              <Clock className="h-5 w-5 text-orange-300" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-stone-50">Pending Approvals ({pendingBookings.length})</h3>
              <p className="mt-0.5 text-sm text-stone-400">
                These bookings are waiting for approval before the customer can move forward.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {pendingBookings.length > 0 ? (
            <div className="space-y-4">
              {pendingBookings.map((booking) => {
                const cameraInfo = getCameraInfo(booking.camera_id);
                const isProcessing = processingBooking === booking.id;

                return (
                  <div
                    key={booking.id}
                    className="rounded-[24px] border border-[#2b2621] bg-[#1b1815] p-6 transition-all duration-200 hover:border-[#4a4036]"
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#342d27] bg-[#0f0e0d]">
                          <span className="text-lg font-bold text-stone-100">
                            {booking.customer?.full_name?.charAt(0).toUpperCase() || '?'}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-stone-100">{booking.customer?.full_name || 'Unknown Customer'}</h4>
                          <span className="mt-1 inline-flex items-center gap-1.5 rounded-full border border-[#4a3727] bg-[#221912] px-3 py-1 text-xs font-semibold text-orange-300">
                            <Clock className="h-3 w-3" />
                            Pending Approval
                          </span>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-[#342d27] bg-[#171513] px-4 py-3 text-right">
                        <p className="text-xs uppercase tracking-[0.18em] text-stone-500">Amount</p>
                        <p className="mt-1 text-xl font-bold text-orange-300">RM{booking.total_amount}</p>
                      </div>
                    </div>

                    <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2">
                      <div className="flex items-start gap-3 rounded-xl border border-[#2f2a25] bg-[#171513] p-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#231f1b]">
                          <Camera className="h-5 w-5 text-orange-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-xs font-medium text-stone-500">Camera</p>
                          <p className="truncate font-semibold text-stone-100">{cameraInfo.name}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-[#2f2a25] bg-[#171513] p-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#231f1b]">
                          <Calendar className="h-5 w-5 text-stone-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-xs font-medium text-stone-500">Rental Period</p>
                          <p className="text-sm font-semibold text-stone-100">{formatDateRange(booking.start_date, booking.end_date)}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-[#2f2a25] bg-[#171513] p-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#231f1b]">
                          <Phone className="h-5 w-5 text-stone-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-xs font-medium text-stone-500">Contact</p>
                          <p className="font-semibold text-stone-100">{booking.customer?.phone || 'No phone number'}</p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 rounded-xl border border-[#2f2a25] bg-[#171513] p-4">
                        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#231f1b]">
                          <DollarSign className="h-5 w-5 text-orange-300" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="mb-1 text-xs font-medium text-stone-500">Booking Source</p>
                          <p className="font-semibold text-stone-100">{booking.booking_source || 'Manual'}</p>
                        </div>
                      </div>
                    </div>

                    {booking.notes && (
                      <div className="mb-5 rounded-xl border border-[#3a3129] bg-[#181513] p-4">
                        <div className="flex items-start gap-2">
                          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-orange-300" />
                          <div className="flex-1">
                            <p className="mb-1 text-xs font-semibold text-stone-300">Customer Notes</p>
                            <p className="text-sm text-stone-400">{booking.notes}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-5 flex flex-wrap gap-x-4 gap-y-1 border-b border-[#2f2a25] pb-5 text-xs text-stone-500">
                      <span>ID: {booking.id.slice(0, 8).toUpperCase()}</span>
                      <span>•</span>
                      <span>Submitted: {formatSubmittedDate(booking.created_at)}</span>
                      <span>•</span>
                      <span>Total Days: {booking.total_days}</span>
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <button
                        onClick={() => quickApprove(booking.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 rounded-xl bg-[#f3efe8] px-5 py-2.5 text-sm font-semibold text-[#11100f] transition-all duration-200 hover:bg-white active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#11100f]/20 border-t-[#11100f]" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <CheckCircle className="h-4 w-4" />
                            Approve
                          </>
                        )}
                      </button>

                      <button
                        onClick={() => quickReject(booking.id)}
                        disabled={isProcessing}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#5a2c29] bg-[#2a1614] px-5 py-2.5 text-sm font-semibold text-red-200 transition-all duration-200 hover:bg-[#331918] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isProcessing ? (
                          <>
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-red-200/30 border-t-red-200" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4" />
                            Reject
                          </>
                        )}
                      </button>

                      <Link
                        href={`/admin/bookings/${booking.id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-[#332d27] bg-[#1d1916] px-5 py-2.5 text-sm font-semibold text-stone-300 transition-all duration-200 hover:border-[#4a4036] hover:bg-[#24201c] active:scale-95"
                      >
                        <Eye className="h-4 w-4" />
                        View Details
                      </Link>

                      {booking.customer?.phone && (
                        <a
                          href={`https://wa.me/${formatPhoneWithCountryCode(booking.customer.phone)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 rounded-xl border border-[#332d27] bg-[#1d1916] px-5 py-2.5 text-sm font-semibold text-stone-300 transition-all duration-200 hover:border-[#4a4036] hover:bg-[#24201c] active:scale-95"
                        >
                          <MessageCircle className="h-4 w-4" />
                          WhatsApp
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl border border-[#3a3129] bg-[#1d1814] shadow-sm">
                <CheckCircle className="h-10 w-10 text-orange-300" />
              </div>
              <p className="mb-1 text-lg font-bold text-stone-100">No pending approvals</p>
              <p className="text-sm text-stone-500">Everything is processed and the queue is clear.</p>
            </div>
          )}
        </div>
      </div>

      {showRejectModal && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/55 p-4 backdrop-blur-sm"
          onClick={closeRejectModal}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-[28px] border border-[#3a2421] bg-[#161412] shadow-[0_24px_60px_rgba(0,0,0,0.35)]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="p-6 pb-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#5a2c29] bg-[#2a1614]">
                  <XCircle className="h-6 w-6 text-red-300" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-bold text-stone-100">Reject Booking</h3>
                  <p className="mt-1 text-sm text-stone-400">Give the customer a clear reason for the rejection.</p>
                </div>
              </div>

              <textarea
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
                placeholder="Enter rejection reason..."
                className="mt-4 w-full resize-none rounded-xl border border-[#332d27] bg-[#1d1916] px-3 py-3 text-sm text-stone-100 placeholder:text-stone-500 focus:border-[#c96b2c] focus:outline-none focus:ring-2 focus:ring-orange-500/25"
                rows={3}
                autoFocus
              />
            </div>

            <div className="flex gap-3 px-6 pb-6">
              <button
                onClick={closeRejectModal}
                className="flex-1 rounded-xl border border-[#332d27] bg-[#1d1916] px-4 py-3 font-semibold text-stone-300 transition-colors hover:bg-[#24201c]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmReject}
                disabled={!rejectReason.trim() || processingBooking === selectedBookingId}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#5a2c29] bg-[#2a1614] px-4 py-3 font-semibold text-red-200 transition-colors hover:bg-[#331918] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processingBooking === selectedBookingId ? (
                  <div className="h-5 w-5 animate-spin rounded-full border-2 border-red-200/30 border-t-red-200" />
                ) : (
                  'Reject'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
