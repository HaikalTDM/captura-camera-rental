'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Booking } from '@/lib/supabase';
import Link from 'next/link';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import {
  Clock,
  CheckCircle,
  XCircle,
  Eye,
  MessageCircle,
  Calendar,
  Camera,
  DollarSign,
  Phone,
  RefreshCw,
  BookOpen,
  Settings,
  AlertCircle
} from 'lucide-react';

export default function BookingApprovalsPage() {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [cameras, setCameras] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBooking, setProcessingBooking] = useState<string | null>(null);

  useEffect(() => {
    loadPendingBookings();
    loadCameras();
  }, []);

  const loadCameras = async () => {
    try {
      const { data: camerasData, error } = await supabase
        .from('cameras')
        .select('id, name, brand, model')
        .order('name');
      
      if (error) {
        console.error('Error loading cameras:', error);
      } else {
        setCameras(camerasData || []);
      }
    } catch (error) {
      console.error('Error in loadCameras:', error);
    }
  };

  const getCameraInfo = (cameraId: string) => {
    return cameras.find(camera => camera.id === cameraId) || { name: 'Unknown Camera', brand: '', model: '' };
  };

  const loadPendingBookings = async () => {
    setIsLoading(true);
    try {
      // First, get Mother's camera ID
      const { data: motherCamera } = await supabase
        .from('cameras')
        .select('id')
        .eq('name', 'Canon R50 - Mother')
        .single();

      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('booking_status', 'pending_approval')
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error loading pending bookings:', error);
      } else {
        console.log('Approvals page - Loaded bookings:', bookings?.length || 0);
        console.log('Approvals page - Booking statuses:', bookings?.map(b => ({ id: b.id, status: b.status, booking_status: b.booking_status })));

        // Filter out Mother's R50 bookings from main admin approvals
        const filteredBookings = motherCamera
          ? (bookings || []).filter(b => b.camera_id !== motherCamera.id)
          : (bookings || []);

        setPendingBookings(filteredBookings);
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
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-200 border-t-slate-900"></div>
          <p className="text-sm text-slate-600 font-medium">Loading approvals...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-8 shadow-xl border border-slate-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Clock className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white mb-1">Booking Approvals</h1>
              <p className="text-slate-300 text-sm">Review and approve pending camera rental bookings</p>
            </div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl px-6 py-4 border border-white/20">
            <p className="text-slate-300 text-xs font-medium mb-1">Pending Approvals</p>
            <p className="text-4xl font-bold text-white">{pendingBookings.length}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Settings className="w-4 h-4 text-blue-600" />
          </div>
          <h2 className="text-lg font-bold text-slate-900">Quick Actions</h2>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/bookings"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
          >
            <BookOpen className="w-4 h-4" />
            View All Bookings
          </Link>
          <button
            onClick={loadPendingBookings}
            className="inline-flex items-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 border border-slate-200"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh List
          </button>
          <Link
            href="/admin/setup-pickup-scheduling"
            className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
          >
            <Calendar className="w-4 h-4" />
            Setup Pickup Scheduling
          </Link>
        </div>
      </div>

      {/* Pending Bookings */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 border-b border-amber-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center shadow-sm">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Pending Approvals ({pendingBookings.length})
              </h3>
              <p className="text-sm text-slate-600 mt-0.5">
                These bookings are waiting for admin approval before customers can proceed with pickup
              </p>
            </div>
          </div>
        </div>

        <div className="p-6">
          {pendingBookings.length > 0 ? (
            <div className="space-y-4">
              {pendingBookings.map((booking) => (
                <div key={booking.id} className="bg-gradient-to-br from-slate-50 to-slate-100/50 rounded-2xl border border-slate-200 p-6 hover:shadow-md transition-all duration-200">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-slate-900 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {booking.customer?.full_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">{booking.customer?.full_name}</h4>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 mt-1">
                          <Clock className="w-3 h-3" />
                          Pending Approval
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Info Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-200">
                      <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Camera className="w-5 h-5 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 mb-1">Camera</p>
                        <p className="font-semibold text-slate-900 truncate">{getCameraInfo(booking.camera_id).name}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-200">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Calendar className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 mb-1">Rental Period</p>
                        <p className="font-semibold text-slate-900 text-sm">
                          {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-200">
                      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 mb-1">Total Amount</p>
                        <p className="font-bold text-green-600 text-lg">RM{booking.total_amount}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 bg-white rounded-xl p-4 border border-slate-200">
                      <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0">
                        <Phone className="w-5 h-5 text-orange-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-500 mb-1">Contact</p>
                        <p className="font-semibold text-slate-900">{booking.customer?.phone}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Notes */}
                  {booking.notes && (
                    <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-5">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-xs font-semibold text-blue-900 mb-1">Customer Notes</p>
                          <p className="text-sm text-blue-800">{booking.notes}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500 mb-5 pb-5 border-b border-slate-200">
                    <span>ID: {booking.id.slice(0, 8).toUpperCase()}</span>
                    <span>•</span>
                    <span>Submitted: {new Date(booking.created_at).toLocaleString('en-MY', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    <span>•</span>
                    <span>Source: {booking.booking_source}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={() => quickApprove(booking.id)}
                      disabled={processingBooking === booking.id}
                      className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                    >
                      {processingBooking === booking.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Approve
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => quickReject(booking.id)}
                      disabled={processingBooking === booking.id}
                      className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                    >
                      {processingBooking === booking.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                          Processing...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4" />
                          Reject
                        </>
                      )}
                    </button>

                    <Link
                      href={`/admin/bookings/${booking.id}`}
                      className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </Link>

                    {booking.customer?.phone && (
                      <a
                        href={`https://wa.me/${formatPhoneWithCountryCode(booking.customer.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 active:scale-95 shadow-sm"
                      >
                        <MessageCircle className="w-4 h-4" />
                        WhatsApp
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="w-20 h-20 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <p className="text-slate-900 font-bold text-lg mb-1">No pending approvals!</p>
              <p className="text-sm text-slate-500">All bookings have been processed. Great job! 🎉</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
