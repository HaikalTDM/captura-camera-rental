'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getBookingById } from '@/lib/api/bookings';
import type { Booking } from '@/lib/supabase';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';

export default function MobileBookingDetail() {
  const router = useRouter();
  const params = useParams();
  const bookingId = params?.id as string;
  
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPickupModal, setShowPickupModal] = useState(false);
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [pickupNotes, setPickupNotes] = useState('');
  const [pickupCondition, setPickupCondition] = useState('excellent');
  const [returnNotes, setReturnNotes] = useState('');
  const [returnCondition, setReturnCondition] = useState('excellent');
  const [showPaymentDetails, setShowPaymentDetails] = useState(false);
  const [showRentalDetails, setShowRentalDetails] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notes, setNotes] = useState('');
  const [updateMessage, setUpdateMessage] = useState('');

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    
    if (bookingId) {
      loadBooking();
    }
  }, [bookingId]);

  const loadBooking = async () => {
    setIsLoading(true);
    try {
      const bookingData = await getBookingById(bookingId);
      setBooking(bookingData);
      setNotes(bookingData?.notes || '');
    } catch (error) {
      console.error('Error loading booking:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessMessage = (message: string) => {
    setUpdateMessage(message);
    setTimeout(() => setUpdateMessage(''), 3000);
  };

  const handleApproveBooking = async () => {
    if (!booking || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          admin_notes: 'Approved from admin panel'
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBooking(data.booking);
        showSuccessMessage('✓ Booking approved successfully!');
      } else {
        console.error('Approval failed:', data.error);
        showSuccessMessage('❌ Failed to approve booking: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error approving booking:', error);
      showSuccessMessage('❌ Error approving booking');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRejectBooking = async () => {
    if (!booking || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rejection_reason: 'Rejected by admin',
          admin_notes: 'Booking rejected from admin panel'
        }),
      });

      const data = await response.json();
      if (data.success) {
        // Booking was deleted, so redirect back to bookings list
        showSuccessMessage('✓ Booking rejected successfully!');
        setTimeout(() => {
          router.push('/admin/mobile/bookings');
        }, 1500);
      } else {
        console.error('Rejection failed:', data.error);
        showSuccessMessage('❌ Failed to reject booking: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error rejecting booking:', error);
      showSuccessMessage('❌ Error rejecting booking');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDepositToggle = async () => {
    if (!booking || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/deposit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deposit_paid: !booking.deposit_paid,
          deposit_paid_date: !booking.deposit_paid ? new Date().toISOString() : null
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBooking(data.booking);
        showSuccessMessage(data.booking.deposit_paid ? 'Deposit marked as paid ✓' : 'Deposit marked as unpaid');
      }
    } catch (error) {
      console.error('Error updating deposit:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleFinalPaymentToggle = async () => {
    if (!booking || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/final-payment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          final_payment_paid: !booking.final_payment_paid,
          final_payment_paid_date: !booking.final_payment_paid ? new Date().toISOString() : null
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBooking(data.booking);
        showSuccessMessage(data.booking.final_payment_paid ? 'Final payment marked as paid ✓' : 'Final payment marked as unpaid');
      }
    } catch (error) {
      console.error('Error updating final payment:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDepositRefund = async () => {
    if (!booking || isUpdating) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/deposit-refund`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          deposit_refunded: !booking.deposit_refunded,
          deposit_refund_date: !booking.deposit_refunded ? new Date().toISOString() : null,
          deposit_refund_notes: !booking.deposit_refunded ? 'Equipment returned in good condition' : null,
          deposit_refund_amount: 100
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBooking(data.booking);
        showSuccessMessage(data.booking.deposit_refunded ? 'Deposit refunded ✓' : 'Deposit refund cancelled');
      }
    } catch (error) {
      console.error('Error updating deposit refund:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePickupUpdate = async () => {
    if (!booking) return;
    
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/pickup-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_picked_up: !booking.equipment_picked_up,
          equipment_pickup_notes: !booking.equipment_picked_up ? pickupNotes : null,
          equipment_condition_pickup: !booking.equipment_picked_up ? pickupCondition : null
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBooking(data.booking);
        setShowPickupModal(false);
        setPickupNotes('');
        setPickupCondition('excellent');
        showSuccessMessage(data.booking.equipment_picked_up ? 'Equipment marked as picked up ✓' : 'Pickup status updated');
      }
    } catch (error) {
      console.error('Error updating pickup status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReturnUpdate = async () => {
    if (!booking) return;
    
    setIsUpdating(true);
    try {
      const isMarkingAsReturned = !booking.equipment_returned;
      
      const response = await fetch(`/api/bookings/${booking.id}/return-status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          equipment_returned: isMarkingAsReturned,
          equipment_return_notes: isMarkingAsReturned ? returnNotes : null,
          equipment_condition_return: isMarkingAsReturned ? returnCondition : null,
          // Auto-complete booking when equipment is returned
          booking_status: isMarkingAsReturned ? 'completed' : booking.booking_status
        }),
      });

      const data = await response.json();
      if (data.success) {
        setBooking(data.booking);
        setShowReturnModal(false);
        setReturnNotes('');
        setReturnCondition('excellent');
        showSuccessMessage(
          data.booking.equipment_returned 
            ? '✓ Equipment returned & Booking completed!' 
            : 'Return status updated'
        );
      }
    } catch (error) {
      console.error('Error updating return status:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleWhatsAppReminder = () => {
    const phone = booking?.customer?.phone || booking?.customer?.phone_number;
    if (!phone) return;

    const customerName = booking.customer.full_name;
    const cameraName = booking.camera?.name || 'equipment';
    
    let message = '';
    
    // If equipment is NOT picked up yet - send PICKUP reminder
    if (!booking.equipment_picked_up) {
      const pickupDateStr = booking.pickup_date || (() => {
        const startDate = new Date(booking.start_date + 'T00:00:00');
        startDate.setDate(startDate.getDate() - 1);
        return startDate.toISOString().split('T')[0];
      })();
      const pickupDate = new Date(pickupDateStr).toLocaleDateString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      
      // Check if final payment is pending (deposit is separate and will be returned)
      const hasOutstandingBalance = !booking.final_payment_paid && booking.final_payment_amount > 0;
      const outstandingAmount = hasOutstandingBalance ? booking.final_payment_amount : 0;
      
      // Base message
      message = `Hi ${customerName}! 📷\n\nThis is a friendly reminder that your ${cameraName} is ready for pickup on ${pickupDate} after 8.00PM.`;
      
      // Add payment reminder if there's an outstanding balance
      if (hasOutstandingBalance) {
        message += `\n\n💳 *Payment Reminder*\nPlease settle the outstanding balance of *RM${outstandingAmount}* before pickup.\n\nRental Amount: RM${outstandingAmount}\nDeposit (refundable): RM${booking.deposit_amount}`;
      }
      
      message += `\n\nPlease collect your equipment at the scheduled time.\n\nThank you for choosing Captura! 😊`;
    } 
    // If equipment IS picked up but NOT returned - send RETURN reminder
    else if (booking.equipment_picked_up && !booking.equipment_returned) {
      const returnDate = new Date(booking.end_date).toLocaleDateString('en-MY', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
      message = `Hi ${customerName}! 📷\n\nThis is a friendly reminder that your rental of the ${cameraName} is due for return on ${returnDate}.\n\nPlease ensure the camera is returned on time to avoid any late fees.\n\nThank you for choosing Captura! 😊`;
    }
    // If already returned - no reminder needed
    else {
      return;
    }
    
    const phoneNumber = formatPhoneWithCountryCode(phone);
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  const handleDeleteBooking = async () => {
    if (!booking) return;

    setIsUpdating(true);
    try {
      const response = await fetch(`/api/bookings/${booking.id}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();
      if (data.success) {
        router.push('/admin/mobile/bookings');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    } finally {
      setIsUpdating(false);
      setShowDeleteConfirm(false);
    }
  };

  // Calculate progress
  const getBookingProgress = () => {
    const steps = [
      { id: 'deposit', label: 'Deposit Paid', completed: booking?.deposit_paid },
      { id: 'payment', label: 'Final Payment', completed: booking?.final_payment_paid },
      { id: 'pickup', label: 'Equipment Pickup', completed: booking?.equipment_picked_up },
      { id: 'return', label: 'Equipment Return', completed: booking?.equipment_returned },
    ];
    const completedSteps = steps.filter(s => s.completed).length;
    return { steps, progress: (completedSteps / steps.length) * 100 };
  };

  // Get next action
  const getNextAction = () => {
    if (!booking?.deposit_paid) return 'Mark deposit as paid';
    if (!booking?.final_payment_paid && booking?.final_payment_amount > 0) return 'Collect final payment';
    if (!booking?.equipment_picked_up) return 'Mark equipment as picked up';
    if (!booking?.equipment_returned) return 'Mark equipment as returned';
    if (!booking?.deposit_refunded) return 'Process deposit refund';
    return 'Booking complete ✓';
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className={`min-h-screen flex flex-col items-center justify-center ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} px-4`}>
        <p className={`text-lg font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Booking not found</p>
        <button
          onClick={() => router.back()}
          className="mt-4 bg-slate-900 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 shadow-lg"
        >
          Back to Bookings
        </button>
      </div>
    );
  }

  const { steps, progress } = getBookingProgress();

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} pb-24`}>
      {/* Header */}
      <div className={`sticky top-0 z-40 backdrop-blur-lg ${isDarkMode ? 'bg-slate-950/80 border-b border-slate-800' : 'bg-white/80 border-b border-slate-200'}`}>
        <div className="flex items-center justify-between px-4 py-4">
          <button
            onClick={() => router.back()}
            className={`w-11 h-11 rounded-xl ${isDarkMode ? 'bg-slate-900 hover:bg-slate-800' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm`}
          >
            <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <div className="flex-1 mx-3">
            <h1 className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>
              {booking.customer?.full_name}
            </h1>
            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} font-medium`}>
              #{booking.id?.slice(0, 8).toUpperCase()}
            </p>
          </div>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="w-11 h-11 rounded-xl bg-red-50 hover:bg-red-100 flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm"
          >
            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Success Message Toast */}
      {updateMessage && (
        <div className="fixed top-20 left-4 right-4 z-50 animate-slideDown">
          <div className={`${isDarkMode ? 'bg-emerald-900/90 backdrop-blur-lg border-emerald-700' : 'bg-emerald-50 border-emerald-200'} border-2 rounded-2xl p-4 shadow-2xl flex items-center gap-3`}>
            <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <p className={`text-sm font-semibold ${isDarkMode ? 'text-emerald-100' : 'text-emerald-900'}`}>{updateMessage}</p>
          </div>
        </div>
      )}

      <div className="px-5 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Hero Summary Card - PREMIUM DESIGN - RESPONSIVE */}
        <div className={`relative overflow-hidden rounded-3xl ${isDarkMode ? 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900' : 'bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900'} p-5 sm:p-6 shadow-2xl border ${isDarkMode ? 'border-slate-700' : 'border-slate-700'}`}>
          {/* Subtle pattern overlay */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '32px 32px'}}></div>
          </div>
          
          <div className="relative z-10">
            <div className="flex items-start justify-between gap-3 sm:gap-4 mb-4">
              <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base sm:text-lg font-bold text-white leading-tight truncate">
                    {booking.camera?.name}
                  </h2>
                  <p className="text-[11px] sm:text-xs text-slate-400 mt-1 font-medium truncate">
                    {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} → {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} • {booking.total_days}d
                  </p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xl sm:text-2xl md:text-3xl font-bold text-white whitespace-nowrap leading-none">RM{booking.total_amount}</p>
                <p className="text-[10px] sm:text-xs text-slate-400 mt-1.5 font-medium whitespace-nowrap">RM{booking.daily_rate}/day</p>
              </div>
            </div>

            {/* Status Badge with gold accent */}
            <div className="flex items-center gap-2 mb-4">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold ${
                booking.booking_status === 'confirmed' || booking.booking_status === 'approved'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : booking.booking_status === 'pending_approval'
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                  : booking.booking_status === 'completed'
                  ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                  : 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
              }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${
                  booking.booking_status === 'confirmed' || booking.booking_status === 'approved'
                    ? 'bg-emerald-400'
                    : booking.booking_status === 'pending_approval'
                    ? 'bg-amber-400'
                    : booking.booking_status === 'completed'
                    ? 'bg-blue-400'
                    : 'bg-slate-400'
                }`}></div>
                {booking.booking_status?.toUpperCase().replace('_', ' ')}
              </span>
            </div>

            {/* Progress Bar - Elegant */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Completion
                </p>
                <p className="text-sm font-bold text-white">
                  {Math.round(progress)}%
                </p>
              </div>
              <div className="h-2.5 bg-slate-800/50 rounded-full overflow-hidden backdrop-blur-sm border border-slate-700/50">
                <div 
                  className="h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500 transition-all duration-700 rounded-full shadow-lg shadow-blue-500/50"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Next Action - Clickable Button - RESPONSIVE */}
            {(() => {
              const nextAction = getNextAction();
              const isComplete = nextAction === 'Booking complete ✓';
              
              const getActionHandler = () => {
                if (!booking?.deposit_paid) return handleDepositToggle;
                if (!booking?.final_payment_paid && booking?.final_payment_amount > 0) return handleFinalPaymentToggle;
                if (!booking?.equipment_picked_up) return () => setShowPickupModal(true);
                if (!booking?.equipment_returned) return () => setShowReturnModal(true);
                if (!booking?.deposit_refunded) return handleDepositRefund;
                return () => {};
              };

              const getActionIcon = () => {
                if (!booking?.deposit_paid) return (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                );
                if (!booking?.final_payment_paid && booking?.final_payment_amount > 0) return (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                );
                if (!booking?.equipment_picked_up) return (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                );
                if (!booking?.equipment_returned) return (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                  </svg>
                );
                return (
                  <svg className="w-6 h-6 sm:w-7 sm:h-7 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                  </svg>
                );
              };

              return (
                <button
                  onClick={isComplete ? undefined : getActionHandler()}
                  disabled={isComplete || isUpdating}
                  className={`mt-4 p-4 sm:p-5 rounded-2xl border backdrop-blur-sm flex items-center gap-3 w-full transition-all duration-200 ${
                    isComplete 
                      ? 'bg-green-500/10 border-green-500/20 cursor-default'
                      : 'bg-blue-500/10 border-blue-500/20 hover:bg-blue-500/20 active:scale-[0.98] cursor-pointer'
                  } disabled:opacity-50`}
                >
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isComplete ? 'bg-green-500/20' : 'bg-blue-500/20'
                  }`}>
                    {getActionIcon()}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <p className={`text-[10px] sm:text-xs font-semibold uppercase tracking-wide ${
                      isComplete ? 'text-green-400' : 'text-blue-400'
                    }`}>
                      {isComplete ? 'Status' : 'Next Action'}
                    </p>
                    <p className="text-sm sm:text-base font-bold text-white truncate mt-0.5">{nextAction}</p>
                  </div>
                  {!isComplete && (
                    <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
              );
            })()}
          </div>
        </div>

        {/* Approve/Reject Buttons - For Pending Bookings */}
        {booking.booking_status === 'pending_approval' && (
          <div className={`${isDarkMode ? 'bg-amber-900/20 border-amber-700' : 'bg-amber-50 border-amber-200'} border-2 rounded-3xl p-5 shadow-xl animate-fadeIn`}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className={`text-base font-black ${isDarkMode ? 'text-amber-300' : 'text-amber-900'} uppercase tracking-wide`}>
                  Awaiting Approval
                </h3>
                <p className={`text-xs font-semibold ${isDarkMode ? 'text-amber-400' : 'text-amber-700'} mt-0.5`}>
                  Review this booking request
                </p>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRejectBooking}
                disabled={isUpdating}
                className="bg-red-500 hover:bg-red-600 text-white py-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-red-500/30 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
                </svg>
                Reject
              </button>
              <button
                onClick={handleApproveBooking}
                disabled={isUpdating}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-4 rounded-xl font-bold text-sm transition-all duration-200 active:scale-[0.98] disabled:opacity-50 shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </svg>
                Approve
              </button>
            </div>
          </div>
        )}

        {/* WhatsApp - Professional Green - RESPONSIVE - Only show if not returned */}
        {!booking.equipment_returned && (
          <button
            onClick={handleWhatsAppReminder}
            className="w-full bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white p-4 sm:p-5 rounded-2xl font-bold text-sm sm:text-base shadow-xl shadow-emerald-500/30 transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-3 border border-emerald-500/20 min-h-[56px]"
          >
            <svg className="w-6 h-6 sm:w-7 sm:h-7 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            <span className="truncate">
              {!booking.equipment_picked_up ? 'Send Pickup Reminder' : 'Send Return Reminder'}
            </span>
          </button>
        )}

        {/* Equipment Tracking - Premium Cards - RESPONSIVE */}
        <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-3xl p-5 sm:p-6 shadow-lg backdrop-blur-sm`}>
          <h3 className="text-[10px] sm:text-xs font-bold mb-4 sm:mb-5 text-slate-500 uppercase tracking-widest">
            Equipment Tracking
          </h3>
          
          <div className="space-y-3">
            {/* Pickup - Premium - RESPONSIVE */}
            <div className={`rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 ${
              booking.equipment_picked_up
                ? 'bg-gradient-to-br from-blue-500/10 to-indigo-500/10 border-blue-500/30 shadow-lg shadow-blue-500/10'
                : isDarkMode ? 'border-slate-800 hover:border-slate-700 bg-slate-800/30' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
            }`}>
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0 ${
                    booking.equipment_picked_up 
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 shadow-blue-500/30' 
                      : isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
                  }`}>
                    <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${booking.equipment_picked_up ? 'text-white' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>Equipment Pickup</p>
                    {booking.equipment_pickup_date && (
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">
                        {new Date(booking.equipment_pickup_date).toLocaleDateString('en-MY', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold shadow-sm flex-shrink-0 ${
                  booking.equipment_picked_up
                    ? 'bg-blue-500 text-white'
                    : isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-200 text-slate-600'
                }`}>
                  {booking.equipment_picked_up ? 'Completed' : 'Pending'}
                </span>
              </div>
              
              {booking.equipment_condition_pickup && (
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                    booking.equipment_condition_pickup === 'excellent' ? 'bg-emerald-100 text-emerald-800' :
                    booking.equipment_condition_pickup === 'good' ? 'bg-blue-100 text-blue-800' :
                    booking.equipment_condition_pickup === 'fair' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Condition: {booking.equipment_condition_pickup}
                  </span>
                </div>
              )}
              
              {booking.equipment_pickup_notes && (
                <p className="text-xs text-slate-600 italic mb-4 bg-slate-100 p-3 rounded-lg">"{booking.equipment_pickup_notes}"</p>
              )}
              
              <button
                onClick={() => setShowPickupModal(true)}
                disabled={isUpdating}
                className={`w-full py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.98] shadow-lg min-h-[48px] ${
                  booking.equipment_picked_up
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-blue-500/30'
                } disabled:opacity-50`}
              >
                {booking.equipment_picked_up ? 'Undo Pickup' : 'Mark as Picked Up'}
              </button>
            </div>

            {/* Return - Premium - RESPONSIVE */}
            <div className={`rounded-2xl p-4 sm:p-5 border-2 transition-all duration-300 ${
              booking.equipment_returned
                ? 'bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/30 shadow-lg shadow-purple-500/10'
                : booking.equipment_picked_up
                  ? isDarkMode ? 'border-slate-800 hover:border-slate-700 bg-slate-800/30' : 'border-slate-200 hover:border-slate-300 bg-slate-50'
                  : 'border-slate-200 bg-slate-100 opacity-60'
            }`}>
              <div className="flex items-start justify-between mb-4 gap-3">
                <div className="flex items-center gap-2.5 sm:gap-3 flex-1 min-w-0">
                  <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 flex-shrink-0 ${
                    booking.equipment_returned 
                      ? 'bg-gradient-to-br from-purple-500 to-purple-600 shadow-purple-500/30' 
                      : isDarkMode ? 'bg-slate-800' : 'bg-slate-200'
                  }`}>
                    <svg className={`w-5 h-5 sm:w-6 sm:h-6 ${booking.equipment_returned ? 'text-white' : 'text-slate-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs sm:text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>Equipment Return</p>
                    {booking.equipment_return_date && (
                      <p className="text-[10px] sm:text-xs text-slate-500 font-medium mt-1 truncate">
                        {new Date(booking.equipment_return_date).toLocaleDateString('en-MY', { 
                          month: 'short', 
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        })}
                      </p>
                    )}
                  </div>
                </div>
                <span className={`px-2.5 sm:px-3 py-1.5 rounded-xl text-[10px] sm:text-xs font-bold shadow-sm flex-shrink-0 ${
                  booking.equipment_returned
                    ? 'bg-purple-500 text-white'
                    : booking.equipment_picked_up
                      ? isDarkMode ? 'bg-slate-800 text-slate-400 border border-slate-700' : 'bg-slate-200 text-slate-600'
                      : 'bg-slate-100 text-slate-400'
                }`}>
                  {booking.equipment_returned ? 'Completed' : booking.equipment_picked_up ? 'Pending' : 'N/A'}
                </span>
              </div>
              
              {booking.equipment_condition_return && (
                <div className="mb-3">
                  <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                    booking.equipment_condition_return === 'excellent' ? 'bg-emerald-100 text-emerald-800' :
                    booking.equipment_condition_return === 'good' ? 'bg-blue-100 text-blue-800' :
                    booking.equipment_condition_return === 'fair' ? 'bg-amber-100 text-amber-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    Condition: {booking.equipment_condition_return}
                  </span>
                </div>
              )}
              
              {booking.equipment_return_notes && (
                <p className="text-xs text-slate-600 italic mb-4 bg-slate-100 p-3 rounded-lg">"{booking.equipment_return_notes}"</p>
              )}
              
              {!booking.equipment_picked_up && (
                <p className="text-xs text-slate-500 italic mb-4 font-medium">Equipment must be picked up first</p>
              )}
              
              <button
                onClick={() => booking.equipment_picked_up && setShowReturnModal(true)}
                disabled={isUpdating || !booking.equipment_picked_up}
                className={`w-full py-3.5 sm:py-4 rounded-xl text-xs sm:text-sm font-bold transition-all duration-200 active:scale-[0.98] shadow-lg min-h-[48px] ${
                  booking.equipment_returned
                    ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-amber-500/30'
                    : booking.equipment_picked_up
                      ? 'bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white shadow-purple-500/30'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                } disabled:opacity-50`}
              >
                {booking.equipment_returned ? 'Undo Return' : 'Mark as Returned'}
              </button>
            </div>
          </div>
        </div>

        {/* Payment Management - Collapsible Premium */}
        <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-3xl overflow-hidden shadow-lg backdrop-blur-sm`}>
          <button
            onClick={() => setShowPaymentDetails(!showPaymentDetails)}
            className="w-full p-6 flex items-center justify-between transition-colors hover:bg-slate-50/5"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="text-left">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wide">
                  Payment Management
                </h3>
                <p className="text-xs text-slate-500 font-medium mt-0.5">
                  {booking.deposit_paid && booking.final_payment_paid ? 'All payments received' : 'Pending payments'}
                </p>
              </div>
            </div>
            <svg 
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showPaymentDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showPaymentDetails && (
            <div className="px-6 pb-6 space-y-3 animate-fadeIn border-t border-slate-200 dark:border-slate-800 pt-5">
              {/* Deposit */}
              <div className={`rounded-2xl p-4 border-2 transition-all ${booking.deposit_paid ? 'bg-emerald-50 border-emerald-200' : isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Deposit</p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">RM{booking.deposit_amount}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    booking.deposit_paid ? 'bg-emerald-500 text-white' : 'bg-red-100 text-red-700'
                  }`}>
                    {booking.deposit_paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <button
                  onClick={handleDepositToggle}
                  disabled={isUpdating}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98] shadow-lg ${
                    booking.deposit_paid
                      ? 'bg-amber-500 text-white shadow-amber-500/30'
                      : 'bg-emerald-500 text-white shadow-emerald-500/30'
                  } disabled:opacity-50`}
                >
                  {booking.deposit_paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                </button>
              </div>

              {/* Final Payment */}
              <div className={`rounded-2xl p-4 border-2 transition-all ${booking.final_payment_paid ? 'bg-emerald-50 border-emerald-200' : isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Final Payment</p>
                    <p className="text-xs text-slate-500 font-semibold mt-0.5">RM{booking.final_payment_amount || 0}</p>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                    booking.final_payment_paid ? 'bg-emerald-500 text-white' : 'bg-red-100 text-red-700'
                  }`}>
                    {booking.final_payment_paid ? 'Paid' : 'Unpaid'}
                  </span>
                </div>
                <button
                  onClick={handleFinalPaymentToggle}
                  disabled={isUpdating}
                  className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98] shadow-lg ${
                    booking.final_payment_paid
                      ? 'bg-amber-500 text-white shadow-amber-500/30'
                      : 'bg-emerald-500 text-white shadow-emerald-500/30'
                  } disabled:opacity-50`}
                >
                  {booking.final_payment_paid ? 'Mark as Unpaid' : 'Mark as Paid'}
                </button>
              </div>

              {/* Deposit Refund */}
              {booking.deposit_paid && (
                <div className={`rounded-2xl p-4 border-2 transition-all ${booking.deposit_refunded ? 'bg-purple-50 border-purple-200' : isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Deposit Refund</p>
                      <p className="text-xs text-slate-500 font-semibold mt-0.5">RM100.00</p>
                    </div>
                    <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                      booking.deposit_refunded ? 'bg-purple-500 text-white' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {booking.deposit_refunded ? 'Refunded' : 'Pending'}
                    </span>
                  </div>
                  <button
                    onClick={handleDepositRefund}
                    disabled={isUpdating}
                    className={`w-full py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-[0.98] shadow-lg ${
                      booking.deposit_refunded
                        ? 'bg-amber-500 text-white shadow-amber-500/30'
                        : 'bg-purple-500 text-white shadow-purple-500/30'
                    } disabled:opacity-50`}
                  >
                    {booking.deposit_refunded ? 'Cancel Refund' : 'Process Refund'}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact - Premium */}
        <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-3xl p-6 shadow-lg backdrop-blur-sm`}>
          <h3 className="text-xs font-bold mb-5 text-slate-500 uppercase tracking-widest">
            Customer Contact
          </h3>
          
          <div className="space-y-3">
            <a href={`tel:${booking.customer?.phone || booking.customer?.phone_number}`} className={`flex items-center gap-4 p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'} transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md`}>
              <div className="w-13 h-13 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-emerald-500/30">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Phone</p>
                <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{booking.customer?.phone || booking.customer?.phone_number}</p>
              </div>
              <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>

            {booking.customer?.email && (
              <a href={`mailto:${booking.customer?.email}`} className={`flex items-center gap-4 p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700' : 'bg-slate-50 hover:bg-slate-100 border border-slate-200'} transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md`}>
                <div className="w-13 h-13 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-500 mb-1 font-semibold uppercase tracking-wider">Email</p>
                  <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>{booking.customer?.email}</p>
                </div>
                <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            )}
          </div>
        </div>

        {/* Rental Details - Collapsible */}
        <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-3xl overflow-hidden shadow-lg backdrop-blur-sm`}>
          <button
            onClick={() => setShowRentalDetails(!showRentalDetails)}
            className="w-full p-6 flex items-center justify-between transition-colors hover:bg-slate-50/5"
          >
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Rental Details
            </h3>
            <svg 
              className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${showRentalDetails ? 'rotate-180' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showRentalDetails && (
            <div className="px-6 pb-6 space-y-3 animate-fadeIn border-t border-slate-200 dark:border-slate-800 pt-5">
              <div className="grid grid-cols-2 gap-3">
                <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'} border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <p className="text-xs mb-1 text-slate-500 font-semibold uppercase tracking-wider">Pickup Method</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} capitalize`}>{booking.pickup_method || 'N/A'}</p>
                </div>
                <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'} border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <p className="text-xs mb-1 text-slate-500 font-semibold uppercase tracking-wider">Source</p>
                  <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} capitalize`}>{booking.booking_source || 'N/A'}</p>
                </div>
              </div>
              {booking.pickup_address && (
                <div className={`p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-50'} border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'}`}>
                  <p className="text-xs mb-2 text-slate-500 font-semibold uppercase tracking-wider">Delivery Address</p>
                  <p className={`text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'} leading-relaxed`}>{booking.pickup_address}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Notes - Premium */}
        <div className={`${isDarkMode ? 'bg-slate-900/50 border-slate-800' : 'bg-white border-slate-200'} border rounded-3xl p-6 shadow-lg backdrop-blur-sm`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">
              Booking Notes
            </h3>
            <button
              onClick={() => setEditingNotes(!editingNotes)}
              className={`px-4 py-2 rounded-xl text-xs font-bold ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} transition-all duration-200 active:scale-95 shadow-sm`}
            >
              {editingNotes ? 'Done' : 'Edit'}
            </button>
          </div>
          {editingNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about this booking..."
              className={`w-full h-32 p-4 rounded-2xl ${isDarkMode ? 'bg-slate-800 text-white placeholder-slate-500 border border-slate-700' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border border-slate-200'} outline-none resize-none text-sm leading-relaxed font-medium shadow-sm`}
            />
          ) : (
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} leading-relaxed ${!booking.notes && 'italic'} font-medium`}>
              {booking.notes || 'No notes added yet. Tap Edit to add notes.'}
            </p>
          )}
        </div>

        {/* Created Date */}
        <div className="text-center py-2">
          <p className="text-xs text-slate-500 font-semibold">
            Created {new Date(booking.created_at).toLocaleDateString('en-MY', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })}
          </p>
        </div>
      </div>

      {/* Modals remain the same but with updated colors... */}
      {/* I'll continue with the modals in the next part to keep the file complete */}
      
      {/* Pickup Modal */}
      {showPickupModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-backdropFadeIn"
          onClick={() => setShowPickupModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
          <div 
            className={`relative w-full sm:max-w-lg ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-modalSlideUp border-t-4 border-blue-500`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {booking.equipment_picked_up ? 'Undo Equipment Pickup?' : 'Equipment Pickup'}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-6 font-medium`}>
              {booking.equipment_picked_up ? 'This will mark the equipment as not picked up.' : 'Record the equipment condition and any notes.'}
            </p>
            
            {!booking.equipment_picked_up && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className={`text-sm font-bold mb-2 block ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
                    Equipment Condition
                  </label>
                  <select
                    value={pickupCondition}
                    onChange={(e) => setPickupCondition(e.target.value)}
                    className={`w-full p-4 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-200'} border-2 outline-none text-base font-semibold shadow-sm`}
                  >
                    <option value="excellent">✨ Excellent</option>
                    <option value="good">👍 Good</option>
                    <option value="fair">⚠️ Fair</option>
                    <option value="poor">❌ Poor</option>
                  </select>
                </div>
                
                <div>
                  <label className={`text-sm font-bold mb-2 block ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={pickupNotes}
                    onChange={(e) => setPickupNotes(e.target.value)}
                    placeholder="e.g., All accessories included, minor scratch on lens cap..."
                    className={`w-full h-28 p-4 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white placeholder-slate-500 border-slate-700' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200'} border-2 outline-none resize-none text-sm font-medium shadow-sm`}
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowPickupModal(false)}
                className={`flex-1 py-4 rounded-xl font-bold text-base ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} transition-all duration-200 active:scale-95 shadow-lg`}
              >
                Cancel
              </button>
              <button
                onClick={handlePickupUpdate}
                disabled={isUpdating}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold text-base transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-xl shadow-blue-500/30"
              >
                {isUpdating ? 'Updating...' : booking.equipment_picked_up ? 'Undo' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Return Modal */}
      {showReturnModal && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-backdropFadeIn"
          onClick={() => setShowReturnModal(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
          <div 
            className={`relative w-full sm:max-w-lg ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl animate-modalSlideUp border-t-4 border-purple-500`}
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className={`text-xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {booking.equipment_returned ? 'Undo Equipment Return?' : 'Equipment Return'}
            </h3>
            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mb-6 font-medium`}>
              {booking.equipment_returned ? 'This will mark the equipment as not returned.' : 'Record the equipment condition and any notes.'}
            </p>
            
            {!booking.equipment_returned && (
              <div className="space-y-4 mb-6">
                <div>
                  <label className={`text-sm font-bold mb-2 block ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
                    Equipment Condition
                  </label>
                  <select
                    value={returnCondition}
                    onChange={(e) => setReturnCondition(e.target.value)}
                    className={`w-full p-4 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-200'} border-2 outline-none text-base font-semibold shadow-sm`}
                  >
                    <option value="excellent">✨ Excellent</option>
                    <option value="good">👍 Good</option>
                    <option value="fair">⚠️ Fair</option>
                    <option value="poor">❌ Poor</option>
                  </select>
                </div>
                
                <div>
                  <label className={`text-sm font-bold mb-2 block ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
                    Notes (Optional)
                  </label>
                  <textarea
                    value={returnNotes}
                    onChange={(e) => setReturnNotes(e.target.value)}
                    placeholder="e.g., All accessories returned, battery fully charged..."
                    className={`w-full h-28 p-4 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white placeholder-slate-500 border-slate-700' : 'bg-slate-50 text-slate-900 placeholder-slate-400 border-slate-200'} border-2 outline-none resize-none text-sm font-medium shadow-sm`}
                  />
                </div>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowReturnModal(false)}
                className={`flex-1 py-4 rounded-xl font-bold text-base ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} transition-all duration-200 active:scale-95 shadow-lg`}
              >
                Cancel
              </button>
              <button
                onClick={handleReturnUpdate}
                disabled={isUpdating}
                className="flex-1 bg-gradient-to-r from-purple-500 to-purple-600 text-white py-4 rounded-xl font-bold text-base transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-xl shadow-purple-500/30"
              >
                {isUpdating ? 'Updating...' : booking.equipment_returned ? 'Undo' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-backdropFadeIn"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
          <div 
            className={`relative ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-3xl p-6 max-w-sm w-full shadow-2xl animate-modalSlideUp border-t-4 border-red-500`}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <h3 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                Delete This Booking?
              </h3>
              <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} font-medium`}>
                This action cannot be undone. All booking data will be permanently deleted.
              </p>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className={`flex-1 py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteBooking}
                disabled={isUpdating}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3.5 rounded-xl font-bold transition-all duration-200 active:scale-95 disabled:opacity-50 shadow-xl shadow-red-500/30"
              >
                {isUpdating ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
