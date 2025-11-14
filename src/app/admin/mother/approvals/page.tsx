'use client';

import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { Booking } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  AlertCircle,
  ArrowLeft,
  Heart,
  User
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';

export default function MotherApprovalsPage() {
  const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
  const [motherCamera, setMotherCamera] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [processingBooking, setProcessingBooking] = useState<string | null>(null);

  useEffect(() => {
    loadMotherCamera();
  }, []);

  useEffect(() => {
    if (motherCamera) {
      loadPendingBookings();
    }
  }, [motherCamera]);

  const loadMotherCamera = async () => {
    try {
      const { data: camera, error } = await supabase
        .from('cameras')
        .select('*')
        .eq('name', 'Canon R50 - Mother')
        .single();
      
      if (error) {
        console.error('Error loading Mother camera:', error);
      } else {
        setMotherCamera(camera);
      }
    } catch (error) {
      console.error('Error in loadMotherCamera:', error);
    }
  };

  const loadPendingBookings = async () => {
    if (!motherCamera) return;
    
    setIsLoading(true);
    try {
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(*)
        `)
        .eq('booking_status', 'pending_approval')
        .eq('camera_id', motherCamera.id)
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
        loadPendingBookings();
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
        loadPendingBookings();
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
      handleApproveBooking(bookingId, 'Quick approval from Mother dashboard');
    }
  };

  const quickReject = (bookingId: string) => {
    const reason = prompt('Please enter rejection reason:');
    if (reason) {
      handleRejectBooking(bookingId, reason, 'Quick rejection from Mother dashboard');
    }
  };

  const sendWhatsAppMessage = (booking: Booking) => {
    if (!booking.customer?.phone) return;
    
    const phone = formatPhoneWithCountryCode(booking.customer.phone);
    const message = `Hi ${booking.customer.full_name}, your booking for Canon R50 - Mother from ${new Date(booking.start_date).toLocaleDateString('en-MY')} to ${new Date(booking.end_date).toLocaleDateString('en-MY')} is pending approval. We'll get back to you soon!`;
    const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!motherCamera) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Camera Not Found</CardTitle>
            <CardDescription>
              Mother's Canon R50 camera has not been set up yet.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg"
      >
        <div className="flex items-center gap-3 mb-2">
          <Link href="/admin/mother">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8" />
              <h1 className="text-2xl sm:text-3xl font-bold">Pending Approvals</h1>
            </div>
            <p className="text-orange-100 text-sm sm:text-base">
              Review and approve Mother's Canon R50 bookings
            </p>
          </div>
          <Button
            onClick={loadPendingBookings}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="border-orange-200 bg-orange-50 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{pendingBookings.length}</p>
                <p className="text-sm text-slate-600">
                  {pendingBookings.length === 1 ? 'Booking' : 'Bookings'} Awaiting Approval
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Pending Bookings List */}
      <div className="space-y-4">
        {pendingBookings.length > 0 ? (
          pendingBookings.map((booking, index) => (
            <motion.div
              key={booking.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + index * 0.05 }}
            >
              <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-4 sm:p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center">
                        <span className="text-white text-lg font-bold">
                          {booking.customer?.full_name?.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <h4 className="text-lg font-bold text-slate-900">
                          {booking.customer?.full_name}
                        </h4>
                        <p className="text-sm text-slate-500">#{booking.id.slice(0, 8)}</p>
                      </div>
                    </div>
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">
                      Pending Approval
                    </Badge>
                  </div>

                  {/* Booking Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Phone</p>
                        <p className="text-sm font-medium text-slate-900">
                          {booking.customer?.phone}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Rental Period</p>
                        <p className="text-sm font-medium text-slate-900">
                          {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Total Amount</p>
                        <p className="text-sm font-bold text-pink-600">
                          RM{booking.total_amount}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Camera className="w-4 h-4 text-slate-400" />
                      <div>
                        <p className="text-xs text-slate-500">Camera</p>
                        <p className="text-sm font-medium text-slate-900">
                          Canon R50 - Mother
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notes */}
                  {booking.notes && (
                    <div className="mb-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
                      <p className="text-xs font-semibold text-slate-500 uppercase mb-1">
                        Customer Notes
                      </p>
                      <p className="text-sm text-slate-700">{booking.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-4 border-t border-slate-200">
                    <Link href={`/admin/bookings/${booking.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">
                        <Eye className="w-4 h-4 mr-2" />
                        View Details
                      </Button>
                    </Link>

                    <Button
                      onClick={() => sendWhatsAppMessage(booking)}
                      variant="outline"
                      className="flex-1 text-green-600 hover:text-green-700 hover:bg-green-50"
                    >
                      <MessageCircle className="w-4 h-4 mr-2" />
                      WhatsApp
                    </Button>

                    <Button
                      onClick={() => quickReject(booking.id)}
                      variant="outline"
                      className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={processingBooking === booking.id}
                    >
                      <XCircle className="w-4 h-4 mr-2" />
                      Reject
                    </Button>

                    <Button
                      onClick={() => quickApprove(booking.id)}
                      className="flex-1 bg-green-500 hover:bg-green-600 text-white"
                      disabled={processingBooking === booking.id}
                    >
                      {processingBooking === booking.id ? (
                        <>
                          <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Approve
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card className="border-slate-200 shadow-sm">
              <CardContent className="p-12 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  All Caught Up!
                </h3>
                <p className="text-slate-500 text-sm mb-6">
                  No pending approvals for Mother's Canon R50 at the moment.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/admin/mother">
                    <Button variant="outline">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Dashboard
                    </Button>
                  </Link>
                  <Link href="/admin/mother/bookings">
                    <Button className="bg-pink-500 hover:bg-pink-600">
                      View All Bookings
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

