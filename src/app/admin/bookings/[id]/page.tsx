'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  AlertCircle,
  ArrowLeft,
  Bell,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  DollarSign,
  Edit3,
  FileText,
  MapPin,
  MessageCircle,
  Package,
  Phone,
  Printer,
  Settings,
  Trash2,
  User,
  Zap,
} from 'lucide-react';
import { getBookingById } from '@/lib/api/bookings';
import type { Booking } from '@/lib/supabase';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import InvoiceBookingActions from '@/components/InvoiceBookingActions';
import { AnimatedToastContainer, useAnimatedToast } from '@/components/ui/animated-toast';

const shellCardClass =
  'rounded-[28px] border border-[#2c2722] bg-[#171411] shadow-[0_24px_55px_rgba(0,0,0,0.28)]';
const sectionClass = 'rounded-[20px] border border-[#2b2520] bg-[#14110f]';
const labelClass = 'text-[11px] uppercase tracking-[0.28em] text-stone-500';

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
  const [showCompleteAllConfirm, setShowCompleteAllConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isUpdatingPickup, setIsUpdatingPickup] = useState(false);
  const [isUpdatingReturn, setIsUpdatingReturn] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isSendingReview, setIsSendingReview] = useState(false);
  const { toasts, success, error, loading, removeToast } = useAnimatedToast();

  const loadBookingData = useCallback(async () => {
    setIsLoading(true);
    try {
      const foundBooking = await getBookingById(bookingId);
      if (foundBooking) {
        setBooking(foundBooking);
        setNotes(foundBooking.notes || '');
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [bookingId]);

  useEffect(() => {
    loadBookingData();
  }, [loadBookingData]);

  const handleAskForReview = async () => {
    if (!booking?.customer?.phone) {
      error('Missing phone number', 'Customer phone number is required before sending a review link.');
      return;
    }

    try {
      setIsSendingReview(true);

      const response = await fetch('/api/reviews/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerId: booking.customer_id,
          bookingId: booking.id,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to create review request');
      }

      const popup = window.open(result.whatsappUrl, '_blank', 'noopener,noreferrer');

      if (!popup && result.reviewUrl && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(result.reviewUrl);
        success('Review link copied', 'Paste it into WhatsApp manually if the popup was blocked.');
        return;
      }

      success('Review request opened', 'WhatsApp opened with the booking-specific review link.');
    } catch (requestError) {
      console.error('Error creating review request:', requestError);
      error('Failed to create review request', requestError instanceof Error ? requestError.message : 'Please try again.');
    } finally {
      setIsSendingReview(false);
    }
  };

  const handleCompleteAll = async () => {
    if (!booking || isUpdating) return;

    setIsUpdating(true);
    setShowCompleteAllConfirm(false);

    try {
      const loadingToastId = loading('Processing booking completion...');
      const timestamp = new Date().toISOString();
      const promises: Promise<Response>[] = [];

      if (!booking.deposit_paid) {
        promises.push(
          fetch(`/api/bookings/${booking.id}/deposit`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              deposit_paid: true,
              deposit_paid_date: timestamp,
            }),
          })
        );
      }

      if (!booking.final_payment_paid) {
        promises.push(
          fetch(`/api/bookings/${booking.id}/final-payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              final_payment_paid: true,
              final_payment_paid_date: timestamp,
            }),
          })
        );
      }

      if (!booking.equipment_picked_up) {
        promises.push(
          fetch(`/api/bookings/${booking.id}/pickup-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              equipment_picked_up: true,
              equipment_pickup_notes: 'Auto-completed via Complete All',
              equipment_condition_pickup: 'excellent',
            }),
          })
        );
      }

      if (!booking.equipment_returned) {
        promises.push(
          fetch(`/api/bookings/${booking.id}/return-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              equipment_returned: true,
              equipment_return_notes: 'Auto-completed via Complete All',
              equipment_condition_return: 'excellent',
              booking_status: 'completed',
            }),
          })
        );
      }

      await Promise.all(promises);
      await loadBookingData();
      removeToast(loadingToastId);
      success('Booking fully completed');
    } catch (completeError) {
      console.error('Error completing all:', completeError);
      error('Error processing completion', completeError instanceof Error ? completeError.message : 'Please try again.');
    } finally {
      setIsUpdating(false);
    }
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
          deposit_paid_date: paid ? new Date().toISOString() : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        success(`Deposit marked as ${paid ? 'paid' : 'unpaid'}`);
      } else {
        error('Failed to update deposit status', data.error || 'Please try again.');
      }
    } catch (updateError) {
      console.error('Error updating deposit status:', updateError);
      error('Failed to update deposit status', 'Please try again.');
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
          final_payment_paid_date: paid ? new Date().toISOString() : null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        success(`Final payment marked as ${paid ? 'paid' : 'unpaid'}`);
      } else {
        error('Failed to update final payment status', data.error || 'Please try again.');
      }
    } catch (updateError) {
      console.error('Error updating final payment status:', updateError);
      error('Failed to update final payment status', 'Please try again.');
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
          deposit_refund_amount: 100,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        success(data.message || `Deposit ${refunded ? 'refunded' : 'refund cancelled'}`);
        await loadBookingData();
      } else {
        error('Failed to update deposit refund status', data.error || 'Please try again.');
      }
    } catch (updateError) {
      console.error('Error updating deposit refund status:', updateError);
      error('Failed to update deposit refund status', 'Please try again.');
    } finally {
      setIsUpdatingPayment(false);
    }
  };

  const handlePickupStatusUpdate = async (pickedUp: boolean, pickupNotes?: string, condition?: string) => {
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
          equipment_pickup_notes: pickupNotes || null,
          equipment_condition_pickup: condition || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        success(`Equipment marked as ${pickedUp ? 'picked up' : 'not picked up'}`);
      } else {
        error('Failed to update pickup status', data.error || 'Please try again.');
      }
    } catch (updateError) {
      console.error('Error updating pickup status:', updateError);
      error('Failed to update pickup status', 'Please try again.');
    } finally {
      setIsUpdatingPickup(false);
    }
  };

  const handleReturnStatusUpdate = async (returned: boolean, returnNotes?: string, condition?: string) => {
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
          equipment_return_notes: returnNotes || null,
          equipment_condition_return: condition || null,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBooking(data.booking);
        success(`Equipment marked as ${returned ? 'returned' : 'not returned'}`);
      } else {
        error('Failed to update return status', data.error || 'Please try again.');
      }
    } catch (updateError) {
      console.error('Error updating return status:', updateError);
      error('Failed to update return status', 'Please try again.');
    } finally {
      setIsUpdatingReturn(false);
    }
  };

  const handleDeleteBooking = async () => {
    setIsDeleting(true);
    setShowDeleteConfirm(false);
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        success('Booking deleted successfully');
        router.push('/admin/bookings');
      } else {
        error('Failed to delete booking', data.error || 'Please try again.');
      }
    } catch (deleteError) {
      console.error('Error deleting booking:', deleteError);
      error('Failed to delete booking', 'Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const generatePickupReminderMessage = () => {
    if (!booking?.customer?.full_name || !booking?.camera?.name) {
      const customerName = booking?.customer?.full_name || 'Customer';
      const cameraName = booking?.camera?.name || 'rented equipment';

      return `Hi ${customerName}!\n\nThis is a friendly reminder about your ${cameraName} rental pickup.\n\nPlease contact us to confirm your pickup timing.\n\nThank you for choosing Captura!`;
    }

    const customerName = booking.customer.full_name;
    const pickupDateValue = booking.pickup_date || booking.start_date;
    const pickupDateObject = new Date(pickupDateValue);
    const today = new Date();
    const cameraName = booking.camera.name;

    const pickupDateStr = pickupDateObject.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const timeDiff = pickupDateObject.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff === 0) {
      return `Hi ${customerName}!\n\nThis is a friendly reminder that your pickup for the ${cameraName} is scheduled for TODAY (${pickupDateStr}).\n\nPickup details:\nCamera: ${cameraName}\nPickup Date: ${pickupDateStr} (Today)\nPickup after: 10:00 PM\nLocation: Caltex Selayang Pandang\n\nPlease reply here if you need to confirm your pickup timing.\n\nThank you for choosing Captura!`;
    }

    if (daysDiff < 0) {
      const overdueDays = Math.abs(daysDiff);
      return `Hi ${customerName}!\n\nYour pickup for the ${cameraName} was scheduled on ${pickupDateStr} and is now ${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue.\n\nPlease reply as soon as possible so we can confirm whether you still want to proceed with the booking.\n\nPickup details:\nCamera: ${cameraName}\nScheduled Pickup: ${pickupDateStr}\nLocation: Caltex Selayang Pandang\n\nThank you.`;
    }

    return `Hi ${customerName}!\n\nJust a friendly reminder about your upcoming pickup:\n\nCamera: ${cameraName}\nPickup Date: ${pickupDateStr} (${daysDiff} day${daysDiff > 1 ? 's' : ''} from now)\nPickup after: 10:00 PM\nLocation: Caltex Selayang Pandang\n\nPlease keep your booking ID ready and contact us if you need to coordinate the timing.\n\nThank you for choosing Captura!`;
  };

  const handlePickupReminder = () => {
    if (!booking?.customer?.phone) {
      error('Missing phone number', 'Add a customer phone number before sending a pickup reminder.');
      return;
    }

    const message = generatePickupReminderMessage();
    const phoneNumber = formatPhoneWithCountryCode(booking.customer.phone);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  const generateReturnReminderMessage = () => {
    if (!booking?.customer?.full_name || !booking?.end_date || !booking?.camera?.name) {
      const customerName = booking?.customer?.full_name || 'Customer';
      const cameraName = booking?.camera?.name || 'rented equipment';

      return `Hi ${customerName}!\n\nThis is a friendly reminder about your ${cameraName} rental.\n\nPlease ensure the equipment is returned by 8:00 PM tonight to avoid any late fees.\n\nThank you for choosing Captura!`;
    }

    const customerName = booking.customer.full_name;
    const returnDate = new Date(booking.end_date);
    const today = new Date();
    const cameraName = booking.camera.name;

    const returnDateStr = returnDate.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });

    const timeDiff = returnDate.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    if (daysDiff === 0) {
      return `Hi ${customerName}!\n\nThis is a friendly reminder that your rental of the ${cameraName} is due for return TODAY (${returnDateStr}).\n\nPlease ensure the camera is returned by tonight to avoid any late fees.\n\nReturn details:\nCamera: ${cameraName}\nReturn Date: ${returnDateStr} (Today)\nReturn before: 8:00 PM\n\nThank you for choosing Captura!`;
    }

    if (daysDiff < 0) {
      const overdueDays = Math.abs(daysDiff);
      return `Hi ${customerName}!\n\nYour rental of the ${cameraName} was due for return on ${returnDateStr} and is now ${overdueDays} day${overdueDays > 1 ? 's' : ''} overdue.\n\nPlease return the camera as soon as possible to avoid additional late fees.\n\nOverdue details:\nCamera: ${cameraName}\nWas due: ${returnDateStr}\nDays overdue: ${overdueDays}\n\nPlease contact us immediately to arrange return. Thank you.`;
    }

    return `Hi ${customerName}!\n\nJust a friendly reminder about your upcoming camera return:\n\nCamera: ${cameraName}\nReturn Date: ${returnDateStr} (${daysDiff} day${daysDiff > 1 ? 's' : ''} from now)\nReturn before: 8:00 PM\n\nPlease ensure the camera is returned on time to avoid any late fees.\n\nThank you for choosing Captura!`;
  };

  const handleReturnReminder = () => {
    if (!booking?.customer?.phone) {
      error('Missing phone number', 'Add a customer phone number before sending a return reminder.');
      return;
    }

    const message = generateReturnReminderMessage();
    const phoneNumber = formatPhoneWithCountryCode(booking.customer.phone);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, '_blank');
  };

  const getStatusTone = (status: string) => {
    switch (status) {
      case 'pending':
      case 'pending_approval':
        return 'border border-[#5b442f] bg-[#2c2118] text-[#fdba74]';
      case 'approved':
      case 'confirmed':
        return 'border border-emerald-900/70 bg-emerald-950/60 text-emerald-300';
      case 'active':
      case 'picked_up':
        return 'border border-sky-900/70 bg-sky-950/60 text-sky-300';
      case 'completed':
      case 'fully_paid':
        return 'border border-stone-700 bg-stone-800/70 text-stone-100';
      case 'cancelled':
      case 'rejected':
      case 'overdue':
        return 'border border-red-900/70 bg-red-950/50 text-red-300';
      case 'deposit_paid':
        return 'border border-[#6a4b23] bg-[#2b2115] text-[#fdba74]';
      default:
        return 'border border-stone-700 bg-stone-900/70 text-stone-300';
    }
  };

  const getConditionTone = (condition: string | null) => {
    switch (condition) {
      case 'excellent':
        return 'border border-emerald-900/70 bg-emerald-950/50 text-emerald-300';
      case 'good':
        return 'border border-sky-900/70 bg-sky-950/50 text-sky-300';
      case 'fair':
        return 'border border-[#6a4b23] bg-[#2b2115] text-[#fdba74]';
      case 'damaged':
        return 'border border-red-900/70 bg-red-950/50 text-red-300';
      default:
        return 'border border-stone-700 bg-stone-900/70 text-stone-300';
    }
  };

  const formatCurrency = (value?: number | null) =>
    `RM${Number(value || 0).toLocaleString('en-MY', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const formatDate = (value?: string | null, withTime = false) => {
    if (!value) return 'Not set';

    return new Date(value).toLocaleString(
      'en-MY',
      withTime
        ? {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }
        : {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
          }
    );
  };

  const updateBookingStatus = (newStatus: Booking['booking_status']) => {
    setBooking((prev) => (prev ? { ...prev, booking_status: newStatus } : null));
  };

  const saveNotes = () => {
    setBooking((prev) => (prev ? { ...prev, notes } : null));
    setIsEditing(false);
  };

  if (isLoading) {
    return (
      <div className={`${shellCardClass} flex min-h-[360px] items-center justify-center`}>
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-2 border-[#3d342d] border-t-[#c96b2c]" />
          <div>
            <p className="text-base font-semibold text-stone-100">Loading booking details</p>
            <p className="text-sm text-stone-500">Pulling the latest customer, payment, and pickup data.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={`${shellCardClass} flex min-h-[360px] items-center justify-center p-8`}>
        <div className="max-w-md text-center">
          <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#3d342d] bg-[#201914]">
            <AlertCircle className="h-8 w-8 text-[#fdba74]" />
          </div>
          <h1 className="text-2xl font-semibold text-stone-100">Booking not found</h1>
          <p className="mt-3 text-sm leading-6 text-stone-400">
            This booking may have been deleted or the link is no longer valid.
          </p>
          <Link
            href="/admin/bookings"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl border border-[#3d342d] bg-[#1d1916] px-4 py-3 text-sm font-semibold text-stone-100 transition hover:border-[#56473c] hover:bg-[#24201c]"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Bookings
          </Link>
        </div>
      </div>
    );
  }

  const cameraName = booking.camera?.name || booking.camera_name || 'Camera not assigned';
  const bookingStatus = booking.booking_status || 'pending_approval';
  const createdDate = formatDate(booking.created_at);
  const rentalWindow = `${formatDate(booking.start_date)} - ${formatDate(booking.end_date)}`;
  const pickupDate = booking.pickup_date || booking.start_date;
  const finalPaymentAmount =
    booking.final_payment_amount || Math.max((booking.total_amount || 0) - (booking.deposit_amount || 0), 0);
  const balanceDue = booking.final_payment_paid ? 0 : finalPaymentAmount;

  return (
    <div className="space-y-6 px-2 pb-10 xl:px-0">
      <section
        className={`${shellCardClass} overflow-hidden`}
        style={{
          background:
            'radial-gradient(circle at top left, rgba(201,107,44,0.18), transparent 36%), linear-gradient(180deg, #1c1713 0%, #14110f 100%)',
        }}
      >
        <div className="flex flex-col gap-6 p-6 lg:p-8">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="flex items-start gap-4">
              <Link
                href="/admin/bookings"
                className="mt-1 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3a3129] bg-[#171411] text-stone-200 transition hover:border-[#56473c] hover:bg-[#211b17]"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#3b2c22] bg-[#21170f] px-3 py-1 text-[11px] font-medium uppercase tracking-[0.25em] text-[#fdba74]">
                  <FileText className="h-3.5 w-3.5" />
                  Booking Control
                </div>
                <div>
                  <h1 className="text-3xl font-semibold tracking-tight text-stone-100">
                    Booking #{booking.id.slice(0, 8)}
                  </h1>
                  <p className="mt-2 flex flex-wrap items-center gap-3 text-sm text-stone-400">
                    <span className="inline-flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-[#fdba74]" />
                      Created on {createdDate}
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#fdba74]" />
                      {booking.total_days} day{booking.total_days > 1 ? 's' : ''} rental
                    </span>
                    <span className="inline-flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-[#fdba74]" />
                      {booking.pickup_method === 'delivery' ? 'Delivery' : 'Self pickup'}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <span
                className={`inline-flex items-center rounded-full px-4 py-2 text-sm font-semibold capitalize ${getStatusTone(
                  bookingStatus
                )}`}
              >
                {bookingStatus.replace('_', ' ')}
              </span>
              <InvoiceBookingActions bookingId={booking.id} />
              <Link
                href={`/admin/bookings/${booking.id}/edit`}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#3d342d] bg-[#1d1916] px-4 py-3 text-sm font-semibold text-stone-100 transition hover:border-[#56473c] hover:bg-[#24201c]"
              >
                <Edit3 className="h-4 w-4" />
                Edit
              </Link>
              <button
                onClick={() => setShowDeleteConfirm(true)}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-2xl border border-red-900/70 bg-red-950/50 px-4 py-3 text-sm font-semibold text-red-200 transition hover:bg-red-900/40 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <Trash2 className="h-4 w-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className={`${sectionClass} p-4`}>
              <p className={labelClass}>Customer</p>
              <p className="mt-3 text-xl font-semibold text-stone-100">{booking.customer?.full_name || 'N/A'}</p>
              <p className="mt-2 text-sm text-stone-400">{booking.customer?.phone || 'No phone number'}</p>
            </div>
            <div className={`${sectionClass} p-4`}>
              <p className={labelClass}>Rental Window</p>
              <p className="mt-3 text-lg font-semibold text-stone-100">{rentalWindow}</p>
              <p className="mt-2 text-sm text-stone-400">{cameraName}</p>
            </div>
            <div className={`${sectionClass} p-4`}>
              <p className={labelClass}>Revenue Snapshot</p>
              <p className="mt-3 text-2xl font-semibold text-[#fdba74]">{formatCurrency(booking.total_amount)}</p>
              <p className="mt-2 text-sm text-stone-400">
                Deposit {formatCurrency(booking.deposit_amount)} · Balance {formatCurrency(balanceDue)}
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_380px]">
        <div className="space-y-6">
          <section className={`${shellCardClass} p-6`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3a3129] bg-[#201914]">
                <User className="h-5 w-5 text-[#fdba74]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-stone-100">Customer Information</h2>
                <p className="text-sm text-stone-500">Billing and contact details for this booking.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className={`${sectionClass} p-4`}>
                <p className={labelClass}>Customer Name</p>
                <p className="mt-3 text-lg font-semibold text-stone-100">{booking.customer?.full_name || 'N/A'}</p>
              </div>
              <div className={`${sectionClass} p-4`}>
                <p className={labelClass}>Phone</p>
                <p className="mt-3 text-lg font-semibold text-stone-100">{booking.customer?.phone || 'N/A'}</p>
              </div>
              <div className={`${sectionClass} p-4`}>
                <p className={labelClass}>Email</p>
                <p className="mt-3 text-base text-stone-200">{booking.customer?.email || 'N/A'}</p>
              </div>
              <div className={`${sectionClass} p-4`}>
                <p className={labelClass}>ID Number</p>
                <p className="mt-3 text-base text-stone-200">{booking.customer?.id_number || 'Not provided'}</p>
              </div>
              <div className={`${sectionClass} p-4 md:col-span-2`}>
                <p className={labelClass}>Address</p>
                <p className="mt-3 text-base leading-7 text-stone-200">
                  {booking.customer?.address || booking.pickup_address || 'No address recorded'}
                </p>
              </div>
            </div>
          </section>

          <section className={`${shellCardClass} p-6`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3a3129] bg-[#201914]">
                <Camera className="h-5 w-5 text-[#fdba74]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-stone-100">Rental Details</h2>
                <p className="text-sm text-stone-500">Equipment, dates, pickup flow, and commercial breakdown.</p>
              </div>
            </div>

            <div className="grid gap-4">
              <div className={`${sectionClass} p-5`}>
                <p className={labelClass}>Camera</p>
                <p className="mt-3 text-2xl font-semibold text-stone-100">{cameraName}</p>
                <p className="mt-2 text-sm text-stone-400">
                  {formatCurrency(booking.daily_rate)} / day · Source {booking.booking_source}
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className={`${sectionClass} p-4`}>
                  <p className={labelClass}>Start Date</p>
                  <p className="mt-3 text-base font-semibold text-stone-100">{formatDate(booking.start_date)}</p>
                </div>
                <div className={`${sectionClass} p-4`}>
                  <p className={labelClass}>End Date</p>
                  <p className="mt-3 text-base font-semibold text-stone-100">{formatDate(booking.end_date)}</p>
                </div>
                <div className={`${sectionClass} p-4`}>
                  <p className={labelClass}>Pickup Date</p>
                  <p className="mt-3 text-base font-semibold text-stone-100">{formatDate(pickupDate)}</p>
                </div>
                <div className={`${sectionClass} p-4`}>
                  <p className={labelClass}>Duration</p>
                  <p className="mt-3 text-base font-semibold text-stone-100">
                    {booking.total_days} day{booking.total_days > 1 ? 's' : ''}
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className={`${sectionClass} p-4`}>
                  <p className={labelClass}>Pickup Method</p>
                  <p className="mt-3 text-base font-semibold capitalize text-stone-100">{booking.pickup_method}</p>
                  {booking.pickup_address ? (
                    <p className="mt-2 text-sm leading-6 text-stone-400">{booking.pickup_address}</p>
                  ) : (
                    <p className="mt-2 text-sm text-stone-500">No delivery address recorded.</p>
                  )}
                </div>
                <div className={`${sectionClass} p-4`}>
                  <p className={labelClass}>Commercials</p>
                  <div className="mt-3 space-y-2 text-sm text-stone-300">
                    <div className="flex items-center justify-between">
                      <span>Rental total</span>
                      <span>{formatCurrency(booking.total_amount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Deposit</span>
                      <span>{formatCurrency(booking.deposit_amount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Delivery fee</span>
                      <span>{formatCurrency(booking.delivery_fee)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className={`${shellCardClass} p-6`}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3a3129] bg-[#201914]">
                  <FileText className="h-5 w-5 text-[#fdba74]" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-stone-100">Notes</h2>
                  <p className="text-sm text-stone-500">Operational notes and rental instructions.</p>
                </div>
              </div>
              <button
                onClick={() => (isEditing ? saveNotes() : setIsEditing(true))}
                className="inline-flex items-center gap-2 rounded-2xl border border-[#3d342d] bg-[#1d1916] px-4 py-3 text-sm font-semibold text-stone-100 transition hover:border-[#56473c] hover:bg-[#24201c]"
              >
                <Edit3 className="h-4 w-4" />
                {isEditing ? 'Save Notes' : 'Edit Notes'}
              </button>
            </div>

            {isEditing ? (
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={6}
                className="admin-dark-textarea min-h-[180px]"
                placeholder="Add booking notes, collection remarks, or customer context..."
              />
            ) : (
              <div className={`${sectionClass} p-5`}>
                <p className="text-sm leading-7 text-stone-300">
                  {notes || booking.notes || booking.admin_notes || 'No notes recorded for this booking yet.'}
                </p>
              </div>
            )}

            {booking.rejection_reason && (
              <div className="mt-4 rounded-[20px] border border-red-900/60 bg-red-950/30 p-4">
                <p className={labelClass}>Rejection Reason</p>
                <p className="mt-3 text-sm leading-7 text-red-200">{booking.rejection_reason}</p>
              </div>
            )}
          </section>
        </div>
        <aside className="space-y-6">
          <section className={`${shellCardClass} p-6`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3a3129] bg-[#201914]">
                <DollarSign className="h-5 w-5 text-[#fdba74]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-stone-100">Payment Summary</h2>
                <p className="text-sm text-stone-500">Live settlement state for the rental.</p>
              </div>
            </div>

            <div className="space-y-3">
              <div className={`${sectionClass} p-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-400">Total Amount</span>
                  <span className="text-2xl font-semibold text-stone-100">{formatCurrency(booking.total_amount)}</span>
                </div>
              </div>
              <div className={`${sectionClass} p-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-400">Deposit</span>
                  <span className="text-lg font-semibold text-[#fdba74]">{formatCurrency(booking.deposit_amount)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-stone-500">Status</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
                      booking.deposit_paid ? 'deposit_paid' : 'pending'
                    )}`}
                  >
                    {booking.deposit_paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
              <div className={`${sectionClass} p-4`}>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-stone-400">Final Payment</span>
                  <span className="text-lg font-semibold text-stone-100">{formatCurrency(finalPaymentAmount)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between">
                  <span className="text-sm text-stone-500">Status</span>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
                      booking.final_payment_paid ? 'fully_paid' : 'pending'
                    )}`}
                  >
                    {booking.final_payment_paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
              </div>
              <div className={`${sectionClass} space-y-3 p-4 text-sm text-stone-300`}>
                <div className="flex items-center justify-between">
                  <span>Deposit refunded</span>
                  <span className={booking.deposit_refunded ? 'text-emerald-300' : 'text-stone-400'}>
                    {booking.deposit_refunded ? 'Yes' : 'Pending'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Balance due</span>
                  <span className="font-semibold text-stone-100">{formatCurrency(balanceDue)}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 space-y-3">
              <button
                onClick={() => handleDepositPaymentUpdate(!booking.deposit_paid)}
                disabled={isUpdatingPayment}
                className="w-full rounded-2xl bg-[#c96b2c] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#da7a36] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {booking.deposit_paid ? 'Mark Deposit as Unpaid' : 'Mark Deposit as Paid'}
              </button>
              <button
                onClick={() => handleFinalPaymentUpdate(!booking.final_payment_paid)}
                disabled={isUpdatingPayment}
                className="w-full rounded-2xl border border-[#35553b] bg-[#102317] px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-[#14301d] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {booking.final_payment_paid ? 'Mark Final Payment as Unpaid' : 'Mark Final Payment as Paid'}
              </button>
              <button
                onClick={() => handleDepositRefundUpdate(!booking.deposit_refunded)}
                disabled={isUpdatingPayment}
                className="w-full rounded-2xl border border-[#4c2d14] bg-[#25170d] px-4 py-3 text-sm font-semibold text-[#fdba74] transition hover:bg-[#2d1b0e] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {booking.deposit_refunded ? 'Cancel Deposit Refund' : 'Process Deposit Refund'}
              </button>
            </div>
          </section>

          <section className={`${shellCardClass} p-6`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3a3129] bg-[#201914]">
                <Settings className="h-5 w-5 text-[#fdba74]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-stone-100">Status Management</h2>
                <p className="text-sm text-stone-500">Update the visible booking state from one place.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`${labelClass} mb-2 block`}>Booking Status</label>
                <select
                  value={booking.booking_status || 'pending_approval'}
                  onChange={(event) => updateBookingStatus(event.target.value as Booking['booking_status'])}
                  className="admin-dark-select"
                >
                  <option value="pending_approval">Pending Approval</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div>
                <label className={`${labelClass} mb-2 block`}>Deposit Status</label>
                <select
                  value={booking.deposit_paid ? 'paid' : 'unpaid'}
                  onChange={(event) => handleDepositPaymentUpdate(event.target.value === 'paid')}
                  disabled={isUpdatingPayment}
                  className="admin-dark-select"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
              <div>
                <label className={`${labelClass} mb-2 block`}>Final Payment</label>
                <select
                  value={booking.final_payment_paid ? 'paid' : 'unpaid'}
                  onChange={(event) => handleFinalPaymentUpdate(event.target.value === 'paid')}
                  disabled={isUpdatingPayment}
                  className="admin-dark-select"
                >
                  <option value="unpaid">Unpaid</option>
                  <option value="paid">Paid</option>
                </select>
              </div>
            </div>
          </section>

          <section className={`${shellCardClass} p-6`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3a3129] bg-[#201914]">
                <Package className="h-5 w-5 text-[#fdba74]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-stone-100">Pickup & Return</h2>
                <p className="text-sm text-stone-500">Track equipment movement and condition.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className={`${sectionClass} p-4`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-200">Pickup</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
                      booking.equipment_picked_up ? 'confirmed' : 'pending'
                    )}`}
                  >
                    {booking.equipment_picked_up ? 'Picked Up' : 'Pending'}
                  </span>
                </div>
                <p className="mt-3 text-sm text-stone-400">
                  Pickup date: {formatDate(booking.equipment_pickup_date || pickupDate, !!booking.equipment_pickup_date)}
                </p>
                {booking.equipment_condition_pickup && (
                  <span
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getConditionTone(
                      booking.equipment_condition_pickup
                    )}`}
                  >
                    {booking.equipment_condition_pickup}
                  </span>
                )}
                {booking.equipment_pickup_notes && (
                  <p className="mt-3 text-sm leading-6 text-stone-300">{booking.equipment_pickup_notes}</p>
                )}
                <button
                  onClick={() => handlePickupStatusUpdate(!booking.equipment_picked_up, '', 'excellent')}
                  disabled={isUpdatingPickup}
                  className="mt-4 w-full rounded-2xl border border-[#35553b] bg-[#102317] px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-[#14301d] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingPickup
                    ? 'Updating pickup...'
                    : booking.equipment_picked_up
                      ? 'Mark as Not Picked Up'
                      : 'Mark as Picked Up'}
                </button>
              </div>

              <div className={`${sectionClass} p-4`}>
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-stone-200">Return</p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${getStatusTone(
                      booking.equipment_returned ? 'completed' : 'pending'
                    )}`}
                  >
                    {booking.equipment_returned ? 'Returned' : 'Pending'}
                  </span>
                </div>
                <p className="mt-3 text-sm text-stone-400">
                  Return date: {formatDate(booking.equipment_return_date || booking.end_date, !!booking.equipment_return_date)}
                </p>
                {booking.equipment_condition_return && (
                  <span
                    className={`mt-3 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getConditionTone(
                      booking.equipment_condition_return
                    )}`}
                  >
                    {booking.equipment_condition_return}
                  </span>
                )}
                {booking.equipment_return_notes && (
                  <p className="mt-3 text-sm leading-6 text-stone-300">{booking.equipment_return_notes}</p>
                )}
                <button
                  onClick={() => handleReturnStatusUpdate(!booking.equipment_returned, '', 'excellent')}
                  disabled={isUpdatingReturn || !booking.equipment_picked_up}
                  className="mt-4 w-full rounded-2xl border border-[#4c2d14] bg-[#25170d] px-4 py-3 text-sm font-semibold text-[#fdba74] transition hover:bg-[#2d1b0e] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isUpdatingReturn
                    ? 'Updating return...'
                    : booking.equipment_returned
                      ? 'Mark as Not Returned'
                      : 'Mark as Returned'}
                </button>
                {!booking.equipment_picked_up && (
                  <p className="mt-3 flex items-center gap-2 text-xs text-stone-500">
                    <AlertCircle className="h-3.5 w-3.5" />
                    Equipment must be picked up before it can be marked as returned.
                  </p>
                )}
              </div>
            </div>
          </section>

          <section className={`${shellCardClass} p-6`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[#3a3129] bg-[#201914]">
                <Zap className="h-5 w-5 text-[#fdba74]" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-stone-100">Quick Actions</h2>
                <p className="text-sm text-stone-500">Finish the operational tasks around this rental.</p>
              </div>
            </div>

            <div className="space-y-3">
              {booking.booking_status !== 'completed' && (
                <button
                  onClick={() => setShowCompleteAllConfirm(true)}
                  disabled={isUpdating}
                  className="w-full rounded-2xl bg-[#c96b2c] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#da7a36] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <span className="inline-flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    Complete All
                  </span>
                </button>
              )}
              {booking.customer?.phone && (
                <a
                  href={`https://wa.me/${formatPhoneWithCountryCode(booking.customer.phone)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#35553b] bg-[#102317] px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-[#14301d]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp Customer
                </a>
              )}
              {booking.customer?.phone && (
                <button
                  onClick={handleAskForReview}
                  disabled={isSendingReview}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#6a5321] bg-[#2b210a] px-4 py-3 text-sm font-semibold text-amber-100 transition hover:bg-[#35280c] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Bell className="h-4 w-4" />
                  {isSendingReview ? 'Preparing Review Link...' : 'Ask for Review'}
                </button>
              )}
              {booking.customer?.phone && (
                <button
                  onClick={handlePickupReminder}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#35553b] bg-[#102317] px-4 py-3 text-sm font-semibold text-emerald-200 transition hover:bg-[#14301d]"
                >
                  <Bell className="h-4 w-4" />
                  Pickup Reminder
                </button>
              )}
              {booking.customer?.phone && (
                <button
                  onClick={handleReturnReminder}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#4c2d14] bg-[#25170d] px-4 py-3 text-sm font-semibold text-[#fdba74] transition hover:bg-[#2d1b0e]"
                >
                  <Bell className="h-4 w-4" />
                  Return Reminder
                </button>
              )}
              {booking.customer?.phone && (
                <a
                  href={`tel:${booking.customer.phone}`}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#3d342d] bg-[#1d1916] px-4 py-3 text-sm font-semibold text-stone-100 transition hover:border-[#56473c] hover:bg-[#24201c]"
                >
                  <Phone className="h-4 w-4" />
                  Call Customer
                </a>
              )}
              <button
                onClick={() => window.print()}
                className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#3d342d] bg-[#1d1916] px-4 py-3 text-sm font-semibold text-stone-100 transition hover:border-[#56473c] hover:bg-[#24201c]"
              >
                <Printer className="h-4 w-4" />
                Print Details
              </button>
            </div>
          </section>
        </aside>
      </div>

      {showCompleteAllConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowCompleteAllConfirm(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className={`${shellCardClass} relative w-full max-w-md p-6`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-[#3b2c22] bg-[#21170f]">
                <CheckCircle2 className="h-8 w-8 text-[#fdba74]" />
              </div>
              <h3 className="text-2xl font-semibold text-stone-100">Complete everything?</h3>
              <p className="mt-3 text-sm leading-7 text-stone-400">
                This will mark the deposit and final payment as paid, then complete pickup and return in one flow.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowCompleteAllConfirm(false)}
                className="rounded-2xl border border-[#3d342d] bg-[#1d1916] px-4 py-3 text-sm font-semibold text-stone-100 transition hover:border-[#56473c] hover:bg-[#24201c]"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteAll}
                disabled={isUpdating}
                className="rounded-2xl bg-[#c96b2c] px-4 py-3 text-sm font-semibold text-black transition hover:bg-[#da7a36] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isUpdating ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowDeleteConfirm(false)}>
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          <div
            className={`${shellCardClass} relative w-full max-w-md p-6`}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-3xl border border-red-900/60 bg-red-950/40">
                <Trash2 className="h-8 w-8 text-red-300" />
              </div>
              <h3 className="text-2xl font-semibold text-stone-100">Delete this booking?</h3>
              <p className="mt-3 text-sm leading-7 text-stone-400">
                This will permanently remove the booking record. This action cannot be undone.
              </p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="rounded-2xl border border-[#3d342d] bg-[#1d1916] px-4 py-3 text-sm font-semibold text-stone-100 transition hover:border-[#56473c] hover:bg-[#24201c]"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBooking}
                disabled={isDeleting}
                className="rounded-2xl bg-red-500 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AnimatedToastContainer toasts={toasts} onClose={removeToast} />
    </div>
  );
}
