'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAllBookings } from '@/lib/api/bookings';
import type { Booking } from '@/lib/supabase';
import Link from 'next/link';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  Heart,
  User,
  Camera,
  Calendar,
  DollarSign,
  Phone,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Package,
  MessageCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function MotherBookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
  const [isUpdatingPickup, setIsUpdatingPickup] = useState(false);
  const [isUpdatingReturn, setIsUpdatingReturn] = useState(false);

  useEffect(() => {
    loadBookingData();
  }, [bookingId]);

  const loadBookingData = async () => {
    setIsLoading(true);
    try {
      const bookings = await getAllBookings();
      const foundBooking = bookings.find(b => b.id === bookingId);

      // Verify this is a Mother's booking
      if (foundBooking && foundBooking.camera?.name === 'Canon R50 - Mother') {
        setBooking(foundBooking);
      } else {
        // Not a Mother's booking, redirect
        router.push('/admin/mother/bookings');
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
        <Link href="/admin/mother/bookings">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Mother's Bookings
          </Button>
        </Link>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
      pending_approval: { label: 'Pending Approval', className: 'bg-orange-100 text-orange-700 border-orange-300', icon: AlertCircle },
      confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-700 border-blue-300', icon: CheckCircle2 },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-700 border-green-300', icon: CheckCircle2 },
      completed: { label: 'Completed', className: 'bg-slate-100 text-slate-700 border-slate-300', icon: CheckCircle2 },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-700 border-red-300', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.pending_approval;
    const Icon = config.icon;

    return (
      <Badge className={`${config.className} border`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
    );
  };

  const handleDepositPaymentUpdate = async (paid: boolean) => {
    if (!booking) return;

    setIsUpdatingPayment(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/deposit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deposit_paid: paid,
          deposit_paid_date: paid ? new Date().toISOString() : null
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        toast.success(`Deposit marked as ${paid ? 'paid' : 'unpaid'} successfully`);
      } else {
        toast.error('Failed to update deposit status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating deposit status:', error);
      toast.error('Failed to update deposit status. Please try again.');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleFinalPaymentUpdate = async (paid: boolean) => {
    if (!booking) return;

    setIsUpdatingPayment(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/final-payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          final_payment_paid: paid,
          final_payment_paid_date: paid ? new Date().toISOString() : null
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        toast.success(`Final payment marked as ${paid ? 'paid' : 'unpaid'} successfully`);
      } else {
        toast.error('Failed to update final payment status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating final payment status:', error);
      toast.error('Failed to update final payment status. Please try again.');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handleDepositRefundUpdate = async (refunded: boolean) => {
    if (!booking) return;

    setIsUpdatingPayment(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/deposit-refund`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deposit_refunded: refunded,
          deposit_refund_date: refunded ? new Date().toISOString() : null,
          deposit_refund_notes: refunded ? 'Equipment returned in good condition' : null,
          deposit_refund_amount: 100
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        toast.success(data.message || `Deposit ${refunded ? 'refunded' : 'refund cancelled'} successfully`);
        await loadBookingData();
      } else {
        toast.error('Failed to update deposit refund status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating deposit refund status:', error);
      toast.error('Failed to update deposit refund status. Please try again.');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handlePickupStatusUpdate = async (pickedUp: boolean) => {
    if (!booking) return;

    setIsUpdatingPickup(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/pickup-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipment_picked_up: pickedUp,
          equipment_pickup_notes: null,
          equipment_condition_pickup: null
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        toast.success(`Equipment marked as ${pickedUp ? 'picked up' : 'not picked up'} successfully`);
      } else {
        toast.error('Failed to update pickup status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating pickup status:', error);
      toast.error('Failed to update pickup status. Please try again.');
    } finally {
      setIsUpdatingPickup(false);
    }
  };

  const handleReturnStatusUpdate = async (returned: boolean) => {
    if (!booking) return;

    setIsUpdatingReturn(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/return-status`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          equipment_returned: returned,
          equipment_return_notes: null,
          equipment_condition_return: null
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        toast.success(`Equipment marked as ${returned ? 'returned' : 'not returned'} successfully`);
      } else {
        toast.error('Failed to update return status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating return status:', error);
      toast.error('Failed to update return status. Please try again.');
    } finally {
      setIsUpdatingReturn(false);
    }
  };

  const customerPhone = booking.customer?.phone || '';
  const whatsappPhone = formatPhoneWithCountryCode(customerPhone);
  const whatsappMessage = `Hi ${booking.customer?.full_name || 'there'}! This is regarding your Canon R50 booking (${booking.id.slice(0, 8)}).`;
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 shadow-lg"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/mother/bookings">
              <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Booking Details</h1>
              <p className="text-sm text-pink-100">ID: {booking.id.slice(0, 8)}</p>
            </div>
          </div>
          <div>
            {getStatusBadge(booking.booking_status)}
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content - Left Column */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5 text-pink-600" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Full Name</p>
                  <p className="font-semibold text-slate-900">{booking.customer?.full_name || 'N/A'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Phone Number</p>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-slate-900">{customerPhone || 'N/A'}</p>
                    {customerPhone && (
                      <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                        <Button variant="ghost" size="sm" className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50">
                          <MessageCircle className="w-3.5 h-3.5" />
                        </Button>
                      </a>
                    )}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Email</p>
                  <p className="font-semibold text-slate-900">{booking.customer?.email || 'N/A'}</p>
                </div>
              </div>
              {booking.customer?.address && (
                <div>
                  <p className="text-sm text-slate-500 mb-1">Address</p>
                  <p className="font-semibold text-slate-900">{booking.customer.address}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Booking Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-pink-600" />
                Booking Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500 mb-1">Camera</p>
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-pink-600" />
                    <p className="font-semibold text-slate-900">{booking.camera?.name || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Booking Date</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(booking.created_at).toLocaleDateString('en-MY', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">Start Date</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(booking.start_date).toLocaleDateString('en-MY', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1">End Date</p>
                  <p className="font-semibold text-slate-900">
                    {new Date(booking.end_date).toLocaleDateString('en-MY', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                </div>

              </div>

              {booking.notes && (
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-500 mb-2">Notes</p>
                  <p className="text-slate-900">{booking.notes}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Payment & Status */}
        <div className="space-y-6">
          {/* Payment Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-pink-600" />
                Payment
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-slate-500 mb-1">Total Amount</p>
                <p className="text-2xl font-bold text-pink-600">RM{booking.total_amount}</p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Back to Mother's Bookings</span>
                  <span className="font-semibold">RM{booking.deposit_amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  {booking.deposit_paid ? (
                    <Badge className="bg-green-100 text-green-700 border-green-300">Paid</Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-300">Unpaid</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Final Payment</span>
                  <span className="font-semibold">RM{booking.final_payment_amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Status</span>
                  {booking.final_payment_paid ? (
                    <Badge className="bg-green-100 text-green-700 border-green-300">Paid</Badge>
                  ) : (
                    <Badge className="bg-orange-100 text-orange-700 border-orange-300">Unpaid</Badge>
                  )}
                </div>
              </div>

              <div className="space-y-2 pt-4 border-t border-slate-200">
                {!booking.deposit_paid && (
                  <Button
                    onClick={() => handleDepositPaymentUpdate(true)}
                    disabled={isUpdatingPayment}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    {isUpdatingPayment ? 'Updating...' : 'Receive Deposit'}
                  </Button>
                )}
                {booking.deposit_paid && !booking.final_payment_paid && (
                  <Button
                    onClick={() => handleFinalPaymentUpdate(true)}
                    disabled={isUpdatingPayment}
                    className="w-full bg-pink-600 hover:bg-pink-700"
                  >
                    {isUpdatingPayment ? 'Updating...' : 'Receive Final Payment'}
                  </Button>
                )}
                {booking.deposit_paid && !booking.deposit_refunded && (
                  <Button
                    onClick={() => handleDepositRefundUpdate(true)}
                    disabled={isUpdatingPayment}
                    variant="outline"
                    className="w-full border-pink-200 text-pink-700 hover:bg-pink-50"
                  >
                    {isUpdatingPayment ? 'Processing...' : 'Refund Deposit'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Equipment Status */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="w-5 h-5 text-pink-600" />
                Equipment Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Picked Up</span>
                {booking.equipment_picked_up ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Button
                    onClick={() => handlePickupStatusUpdate(true)}
                    disabled={isUpdatingPickup}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-pink-200 text-pink-700 hover:bg-pink-50"
                  >
                    {isUpdatingPickup ? '...' : 'Mark Picked Up'}
                  </Button>
                )}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Returned</span>
                {booking.equipment_returned ? (
                  <Badge className="bg-green-100 text-green-700 border-green-300">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Yes
                  </Badge>
                ) : (
                  <Button
                    onClick={() => handleReturnStatusUpdate(true)}
                    disabled={isUpdatingReturn}
                    size="sm"
                    variant="outline"
                    className="h-7 text-xs border-pink-200 text-pink-700 hover:bg-pink-50"
                  >
                    {isUpdatingReturn ? '...' : 'Mark Returned'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

