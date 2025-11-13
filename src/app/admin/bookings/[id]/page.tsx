'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAllBookings } from '@/lib/api/bookings';
import type { Booking } from '@/lib/supabase';
import Link from 'next/link';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import {
  ArrowLeft,
  Edit3,
  Trash2,
  User,
  Camera,
  FileText,
  DollarSign,
  Settings,
  Package,
  Zap,
  MessageCircle,
  Phone,
  Printer,
  Bell,
  Calendar,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle
} from 'lucide-react';

export default function BookingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [notes, setNotes] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
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
        alert(`Deposit marked as ${paid ? 'paid' : 'unpaid'} successfully`);
      } else {
        alert('Failed to update deposit status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating deposit status:', error);
      alert('Failed to update deposit status. Please try again.');
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
        alert(`Final payment marked as ${paid ? 'paid' : 'unpaid'} successfully`);
      } else {
        alert('Failed to update final payment status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating final payment status:', error);
      alert('Failed to update final payment status. Please try again.');
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
        alert(`Deposit ${refunded ? 'refunded' : 'refund cancelled'} successfully`);
      } else {
        alert('Failed to update deposit refund status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating deposit refund status:', error);
      alert('Failed to update deposit refund status. Please try again.');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handlePickupStatusUpdate = async (pickedUp: boolean, notes?: string, condition?: string) => {
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
          equipment_pickup_notes: notes || null,
          equipment_condition_pickup: condition || null
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        alert(`Equipment marked as ${pickedUp ? 'picked up' : 'not picked up'} successfully`);
      } else {
        alert('Failed to update pickup status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating pickup status:', error);
      alert('Failed to update pickup status. Please try again.');
    } finally {
      setIsUpdatingPickup(false);
    }
  };

  const handleReturnStatusUpdate = async (returned: boolean, notes?: string, condition?: string) => {
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
          equipment_return_notes: notes || null,
          equipment_condition_return: condition || null
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        alert(`Equipment marked as ${returned ? 'returned' : 'not returned'} successfully`);
      } else {
        alert('Failed to update return status: ' + data.error);
      }
    } catch (error) {
      console.error('Error updating return status:', error);
      alert('Failed to update return status. Please try again.');
    } finally {
      setIsUpdatingReturn(false);
    }
  };

  const handleDeleteBooking = async () => {
    if (!confirm('Are you sure you want to delete this booking? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch(`/api/bookings/${bookingId}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        router.push('/admin/bookings');
      } else {
        alert('Failed to delete booking: ' + data.error);
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Failed to delete booking. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const generateReturnReminderMessage = () => {
    // Debug what data we have
    console.log('Generating return reminder message...');
    console.log('Booking data:', {
      customerName: booking?.customer?.full_name,
      endDate: booking?.end_date,
      cameraName: booking?.camera_name,
      fullBooking: booking
    });

    if (!booking?.customer?.full_name || !booking?.end_date || !booking?.camera_name) {
      console.log('Missing required data for return reminder message');
      // Return a generic message if some data is missing
      const customerName = booking?.customer?.full_name || 'Customer';
      const cameraName = booking?.camera_name || 'rented equipment';
      
      return `Hi ${customerName}! 📷

This is a friendly reminder about your ${cameraName} rental return.

Please ensure the equipment is returned by 10:00 PM tonight to avoid any late fees.

Thank you for choosing Captura! 😊`;
    }

    const customerName = booking.customer.full_name;
    const returnDate = new Date(booking.end_date);
    const today = new Date();
    const cameraName = booking.camera_name;
    
    // Format dates
    const returnDateStr = returnDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    
    // Calculate if it's return day, overdue, or future
    const timeDiff = returnDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    let message = '';
    
    if (daysDiff === 0) {
      // Today is return day
      message = `Hi ${customerName}! 📷

This is a friendly reminder that your rental of the ${cameraName} is due for return TODAY (${returnDateStr}).

Please ensure the camera is returned by tonight to avoid any late fees. 

Return details:
🎥 Camera: ${cameraName}
📅 Return Date: ${returnDateStr} (Today)
⏰ Return before: 10:00 PM

Thank you for choosing Captura! 😊`;
    } else if (daysDiff < 0) {
      // Overdue
      const overdueDays = Math.abs(daysDiff);
      message = `Hi ${customerName}! 📷

Your rental of the ${cameraName} was due for return on ${returnDateStr} and is now ${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue.

Please return the camera as soon as possible to avoid additional late fees.

Overdue details:
🎥 Camera: ${cameraName}
📅 Was due: ${returnDateStr}
⚠️ Days overdue: ${overdueDays}

Please contact us immediately to arrange return. Thank you!`;
    } else {
      // Future return
      message = `Hi ${customerName}! 📷

Just a friendly reminder about your upcoming camera return:

🎥 Camera: ${cameraName}
📅 Return Date: ${returnDateStr} (${daysDiff} day${daysDiff > 1 ? 's' : ''} from now)
⏰ Return before: 10:00 PM

Please ensure the camera is returned on time to avoid any late fees.

Thank you for choosing Captura! 😊`;
    }
    
    return message;
  };

  const handleReturnReminder = () => {
    if (!booking?.customer?.phone) {
      alert('Customer phone number not available');
      return;
    }

    const message = generateReturnReminderMessage();
    console.log('Generated message:', message);
    console.log('Message length:', message.length);
    
    const phoneNumber = formatPhoneWithCountryCode(booking.customer.phone);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    console.log('WhatsApp URL:', whatsappUrl);
    
    window.open(whatsappUrl, '_blank');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/bookings"
              className="group flex items-center justify-center w-10 h-10 rounded-xl bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all duration-200 shadow-sm"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600 group-hover:text-slate-900 transition-colors" />
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                Booking #{booking.id.slice(0, 8)}
              </h1>
              <p className="text-sm text-slate-500 mt-1 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Created on {new Date(booking.created_at).toLocaleDateString('en-MY', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${getStatusColor(booking.booking_status || 'pending')}`}>
              {(booking.booking_status || 'pending').toUpperCase()}
            </span>
            <Link
              href={`/admin/bookings/${booking.id}/edit`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Edit3 className="w-4 h-4" />
              Edit
            </Link>
            <button
              onClick={handleDeleteBooking}
              disabled={isDeleting}
              className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? 'Deleting...' : 'Delete'}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Information */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100">
                  <User className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Customer Information</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Name</label>
                  <p className="text-base font-semibold text-slate-900">
                    {booking.customer?.full_name || 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Phone</label>
                  <p className="text-base text-slate-900">
                    {booking.customer?.phone ? (
                      <a
                        href={`tel:${booking.customer.phone}`}
                        className="hover:text-slate-600 transition-colors inline-flex items-center gap-2 group"
                      >
                        <Phone className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
                        {booking.customer.phone}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
                <div className="md:col-span-2 space-y-1">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Email</label>
                  <p className="text-base text-slate-900">
                    {booking.customer?.email ? (
                      <a
                        href={`mailto:${booking.customer.email}`}
                        className="hover:text-slate-600 transition-colors"
                      >
                        {booking.customer.email}
                      </a>
                    ) : (
                      'N/A'
                    )}
                  </p>
                </div>
              </div>
            </div>

            {/* Camera & Rental Details */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100">
                  <Camera className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Rental Details</h3>
              </div>
              <div className="space-y-6">
                <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200">
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Camera</label>
                  <p className="text-xl font-bold text-slate-900">{booking.camera_name}</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      Start Date
                    </label>
                    <p className="text-base font-semibold text-slate-900">{booking.start_date}</p>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {booking.pickup_method === 'pickup' ? 'Pickup' : 'Delivery'}
                    </p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      End Date
                    </label>
                    <p className="text-base font-semibold text-slate-900">{booking.end_date}</p>
                    <p className="text-xs text-slate-500 capitalize">{booking.booking_source}</p>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5" />
                      Duration
                    </label>
                    <p className="text-base font-semibold text-slate-900">{booking.total_days} days</p>
                    <p className="text-xs text-slate-500">RM{booking.daily_rate}/day</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100">
                    <FileText className="w-5 h-5 text-slate-700" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">Notes</h3>
                </div>
                <button
                  onClick={() => isEditing ? saveNotes() : setIsEditing(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-all duration-200"
                >
                  <Edit3 className="w-4 h-4" />
                  {isEditing ? 'Save' : 'Edit'}
                </button>
              </div>
              {isEditing ? (
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-32 p-4 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 transition-all duration-200 text-slate-900 placeholder:text-slate-400"
                  placeholder="Add notes about this booking..."
                />
              ) : (
                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                  <p className="text-slate-700 whitespace-pre-wrap text-sm leading-relaxed">
                    {booking.notes || 'No notes added yet.'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Summary */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100">
                  <DollarSign className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Payment Summary</h3>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Total Amount</span>
                  <span className="text-lg font-bold text-slate-900">RM{booking.total_amount}</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <span className="text-sm font-medium text-blue-900">Deposit Amount</span>
                  <span className="text-lg font-bold text-blue-600">RM{booking.deposit_amount}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Deposit Paid</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                    booking.deposit_paid
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {booking.deposit_paid ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Yes</>
                    ) : (
                      <><XCircle className="w-3.5 h-3.5" /> No</>
                    )}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Final Payment</span>
                    <span className="text-lg font-bold text-slate-900">RM{booking.final_payment_amount}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Final Payment Paid</span>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                    booking.final_payment_paid
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-700'
                  }`}>
                    {booking.final_payment_paid ? (
                      <><CheckCircle2 className="w-3.5 h-3.5" /> Yes</>
                    ) : (
                      <><XCircle className="w-3.5 h-3.5" /> No</>
                    )}
                  </span>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Deposit Refunded</span>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                      booking.deposit_refunded
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.deposit_refunded ? (
                        <><CheckCircle2 className="w-3.5 h-3.5" /> Yes</>
                      ) : (
                        <><AlertCircle className="w-3.5 h-3.5" /> Pending</>
                      )}
                    </span>
                  </div>
                </div>
                <div className="bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200 rounded-xl p-4 mt-4">
                  <p className="text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-900 block mb-2">Payment Structure:</span>
                    • Deposit: RM100 (refundable)<br/>
                    • Rental: RM{booking.final_payment_amount}<br/>
                    • <span className="font-semibold">Total Due: RM{100 + booking.final_payment_amount}</span>
                  </p>
                </div>
              </div>

              <div className="space-y-2 mt-6">
                {!booking.deposit_paid && (
                  <button
                    onClick={() => handleDepositPaymentUpdate(true)}
                    disabled={isUpdatingPayment}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-blue-300 disabled:to-blue-400 text-white py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                  >
                    {isUpdatingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Deposit as Paid
                      </>
                    )}
                  </button>
                )}

                {booking.deposit_paid && (
                  <button
                    onClick={() => handleDepositPaymentUpdate(false)}
                    disabled={isUpdatingPayment}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:from-amber-300 disabled:to-amber-400 text-white py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                  >
                    {isUpdatingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Mark Deposit as Unpaid
                      </>
                    )}
                  </button>
                )}

                {!booking.final_payment_paid && booking.deposit_paid && (
                  <button
                    onClick={() => handleFinalPaymentUpdate(true)}
                    disabled={isUpdatingPayment}
                    className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 disabled:from-emerald-300 disabled:to-emerald-400 text-white py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                  >
                    {isUpdatingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Mark Final Payment as Paid
                      </>
                    )}
                  </button>
                )}

                {booking.final_payment_paid && (
                  <button
                    onClick={() => handleFinalPaymentUpdate(false)}
                    disabled={isUpdatingPayment}
                    className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 disabled:from-red-300 disabled:to-red-400 text-white py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                  >
                    {isUpdatingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Mark Final Payment as Unpaid
                      </>
                    )}
                  </button>
                )}

                {/* Deposit Refund Management */}
                {booking.deposit_paid && !booking.deposit_refunded && (
                  <button
                    onClick={() => handleDepositRefundUpdate(true)}
                    disabled={isUpdatingPayment}
                    className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 disabled:from-purple-300 disabled:to-purple-400 text-white py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                  >
                    {isUpdatingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        Process Deposit Refund
                      </>
                    )}
                  </button>
                )}

                {booking.deposit_refunded && (
                  <button
                    onClick={() => handleDepositRefundUpdate(false)}
                    disabled={isUpdatingPayment}
                    className="w-full bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 disabled:from-amber-300 disabled:to-amber-400 text-white py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 font-medium shadow-sm hover:shadow-md"
                  >
                    {isUpdatingPayment ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                        Processing...
                      </>
                    ) : (
                      <>
                        <XCircle className="w-4 h-4" />
                        Cancel Deposit Refund
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Status Management */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100">
                  <Settings className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Status Management</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Booking Status</label>
                  <select
                    value={booking.booking_status || 'pending'}
                    onChange={(e) => updateBookingStatus(e.target.value as any)}
                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 bg-white transition-all duration-200 font-medium"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Deposit Status</label>
                  <select
                    value={booking.deposit_paid ? 'paid' : 'unpaid'}
                    onChange={(e) => handleDepositPaymentUpdate(e.target.value === 'paid')}
                    disabled={isUpdatingPayment}
                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Final Payment Status</label>
                  <select
                    value={booking.final_payment_paid ? 'paid' : 'unpaid'}
                    onChange={(e) => handleFinalPaymentUpdate(e.target.value === 'paid')}
                    disabled={isUpdatingPayment}
                    className="w-full p-3 border-2 border-slate-200 rounded-xl focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 bg-white disabled:bg-slate-100 disabled:cursor-not-allowed transition-all duration-200 font-medium"
                  >
                    <option value="unpaid">Unpaid</option>
                    <option value="paid">Paid</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Equipment Pickup & Return Management */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-100">
                  <Package className="w-5 h-5 text-slate-700" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Equipment Pickup & Return</h3>
              </div>
              <div className="space-y-6">
                {/* Pickup Status */}
                <div className="border-b border-slate-200 pb-6">
                  <h4 className="text-sm font-bold text-slate-900 mb-4">Equipment Pickup</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600">Pickup Status</span>
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold ${
                        booking.equipment_picked_up
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}>
                        {booking.equipment_picked_up ? (
                          <><CheckCircle2 className="w-3.5 h-3.5" /> Picked Up</>
                        ) : (
                          <><AlertCircle className="w-3.5 h-3.5" /> Not Picked Up</>
                        )}
                      </span>
                    </div>

                    {booking.equipment_pickup_date && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Pickup Date</span>
                        <span className="text-sm font-medium text-slate-900">
                          {new Date(booking.equipment_pickup_date).toLocaleString('en-MY', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>
                    )}

                    {booking.equipment_condition_pickup && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-600">Condition</span>
                        <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                          booking.equipment_condition_pickup === 'excellent' ? 'bg-emerald-100 text-emerald-700' :
                          booking.equipment_condition_pickup === 'good' ? 'bg-blue-100 text-blue-700' :
                          booking.equipment_condition_pickup === 'fair' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {booking.equipment_condition_pickup.charAt(0).toUpperCase() + booking.equipment_condition_pickup.slice(1)}
                        </span>
                      </div>
                    )}

                    {booking.equipment_pickup_notes && (
                      <div>
                        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide block mb-2">Pickup Notes</span>
                        <p className="text-sm text-slate-700 bg-slate-50 p-3 rounded-xl border border-slate-200">
                          {booking.equipment_pickup_notes}
                        </p>
                      </div>
                    )}

                    <button
                      onClick={() => handlePickupStatusUpdate(!booking.equipment_picked_up, '', 'excellent')}
                      disabled={isUpdatingPickup}
                      className={`w-full mt-2 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 shadow-sm hover:shadow-md ${
                        booking.equipment_picked_up
                          ? 'bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white'
                          : 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white'
                      } disabled:from-slate-300 disabled:to-slate-400 disabled:cursor-not-allowed`}
                    >
                      {isUpdatingPickup ? (
                        <>
                          <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Updating...
                        </>
                      ) : booking.equipment_picked_up ? (
                        <><XCircle className="w-4 h-4" /> Mark as Not Picked Up</>
                      ) : (
                        <><CheckCircle2 className="w-4 h-4" /> Mark as Picked Up</>
                      )}
                    </button>
                  </div>
                </div>

              {/* Return Status */}
              <div>
                <h4 className="text-md font-semibold text-gray-800 mb-3">Equipment Return</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Return Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      booking.equipment_returned
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {booking.equipment_returned ? 'Returned' : 'Not Returned'}
                    </span>
                  </div>

                  {booking.equipment_return_date && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Return Date:</span>
                      <span className="text-sm text-gray-900">
                        {new Date(booking.equipment_return_date).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {booking.equipment_condition_return && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-600">Condition at Return:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        booking.equipment_condition_return === 'excellent' ? 'bg-green-100 text-green-800' :
                        booking.equipment_condition_return === 'good' ? 'bg-blue-100 text-blue-800' :
                        booking.equipment_condition_return === 'fair' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.equipment_condition_return.charAt(0).toUpperCase() + booking.equipment_condition_return.slice(1)}
                      </span>
                    </div>
                  )}

                  {booking.equipment_return_notes && (
                    <div>
                      <span className="text-sm font-medium text-gray-600 block mb-1">Return Notes:</span>
                      <p className="text-sm text-gray-700 bg-gray-50 p-2 rounded">
                        {booking.equipment_return_notes}
                      </p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleReturnStatusUpdate(!booking.equipment_returned, '', 'excellent')}
                      disabled={isUpdatingReturn || !booking.equipment_picked_up}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        booking.equipment_returned
                          ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                          : 'bg-green-500 hover:bg-green-600 text-white'
                      } disabled:bg-gray-400`}
                    >
                      {isUpdatingReturn ? (
                        <>
                          <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                          Updating...
                        </>
                      ) : (
                        booking.equipment_returned ? 'Mark as Not Returned' : 'Mark as Returned'
                      )}
                    </button>
                  </div>

                  {!booking.equipment_picked_up && (
                    <p className="text-xs text-gray-500 italic">
                      Equipment must be picked up before it can be marked as returned.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>


          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              ⚡ Quick Actions
            </h3>
            <div className="space-y-3">
              {booking.customer?.phone && (
                <a
                  href={`https://wa.me/${formatPhoneWithCountryCode(booking.customer.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  💬 WhatsApp Customer
                </a>
              )}
              {booking.customer?.phone && (
                <button
                  onClick={handleReturnReminder}
                  className="w-full bg-orange-500 hover:bg-orange-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  🔔 Return Reminder
                </button>
              )}
              {booking.customer?.phone && (
                <a
                  href={`tel:${booking.customer.phone}`}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  📞 Call Customer
                </a>
              )}
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
