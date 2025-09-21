'use client';

import React, { useState } from 'react';
import { generateWhatsAppContactUrl } from '../lib/api/website-bookings';

interface BookingSuccessProps {
  confirmationNumber: string;
  booking: any;
  customer: any;
  bookingData: any;
  onNewBooking: () => void;
  onClose?: () => void;
}

export default function BookingSuccess({
  confirmationNumber,
  booking,
  customer,
  bookingData,
  onNewBooking,
  onClose
}: BookingSuccessProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyConfirmation = async () => {
    try {
      await navigator.clipboard.writeText(confirmationNumber);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy confirmation number:', err);
    }
  };

  const handleWhatsAppContact = () => {
    const whatsappUrl = generateWhatsAppContactUrl(booking, customer, bookingData);
    window.open(whatsappUrl, '_blank');
  };

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      onNewBooking();
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative">
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="absolute top-3 sm:top-4 right-3 sm:right-4 w-8 h-8 sm:w-10 sm:h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center transition-colors z-10"
        aria-label="Close"
      >
        <span className="text-gray-600 text-lg sm:text-xl font-bold">×</span>
      </button>

      {/* Booking Confirmed Card */}
      <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4 sm:mb-6 text-white">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl sm:text-2xl">🎉</span>
          </div>
          <div className="flex-1">
            <h3 className="text-sm sm:text-base font-bold mb-1">Booking Confirmed!</h3>
            <p className="text-xs sm:text-sm opacity-90">
              Your {bookingData.camera_name} rental is confirmed for {bookingData.total_days} day{bookingData.total_days !== 1 ? 's' : ''}
            </p>
          </div>
        </div>
      </div>

      {/* Success Header */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="mx-auto w-12 sm:w-16 h-12 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
          <span className="text-2xl sm:text-3xl">✅</span>
        </div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Request Submitted</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Your camera rental request has been submitted successfully
        </p>
      </div>

      {/* Confirmation Details */}
      <div className="bg-green-50 border border-green-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
        <div className="flex items-center justify-between mb-2 sm:mb-3">
          <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-green-800">Confirmation Number</h3>
          <button
            onClick={handleCopyConfirmation}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 text-xs sm:text-sm bg-green-100 text-green-700 rounded-md sm:rounded-lg hover:bg-green-200 transition-colors"
          >
            <span className="text-xs sm:text-sm">📋</span>
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <p className="text-lg sm:text-xl lg:text-2xl font-mono font-bold text-green-900 mb-2 sm:mb-3 break-all">
          {confirmationNumber}
        </p>
        <p className="text-xs sm:text-sm text-green-700">
          Please save this confirmation number for your records. You'll need it to track your booking status.
        </p>
      </div>

      {/* Booking Summary */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-blue-800 mb-3 sm:mb-4">Booking Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 lg:gap-4 text-xs sm:text-sm">
          <div>
            <p className="text-blue-600 font-medium">Camera</p>
            <p className="text-blue-900">{bookingData.camera_name}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Duration</p>
            <p className="text-blue-900">{bookingData.total_days} days</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Dates</p>
            <p className="text-blue-900 text-xs sm:text-sm">{bookingData.start_date} to {bookingData.end_date}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Total Amount</p>
            <p className="text-blue-900">RM{bookingData.total_amount}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Deposit Required</p>
            <p className="text-blue-900">RM{bookingData.deposit_amount}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Pickup Method</p>
            <p className="text-blue-900 capitalize">{bookingData.pickup_method}</p>
          </div>
        </div>
      </div>

      {/* Next Steps */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg sm:rounded-xl p-3 sm:p-4 lg:p-6 mb-4 sm:mb-6">
        <h3 className="text-sm sm:text-base lg:text-lg font-semibold text-yellow-800 mb-3 sm:mb-4">What's Next?</h3>
        <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-yellow-700">
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-200 text-yellow-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <p>Our team will review your booking request within 24 hours</p>
          </div>
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-200 text-yellow-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <p>We'll contact you via phone or email to confirm availability and arrange payment</p>
          </div>
          <div className="flex items-start gap-2 sm:gap-3">
            <span className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 bg-yellow-200 text-yellow-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <p>Once confirmed, we'll provide pickup/delivery details and final instructions</p>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 sm:space-y-4">
        {/* Primary Action: WhatsApp Contact */}
        <button
          onClick={handleWhatsAppContact}
          className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-green-600 text-white rounded-lg sm:rounded-xl hover:bg-green-700 transition-colors font-medium text-sm sm:text-base"
        >
          <span className="text-lg sm:text-xl">💬</span>
          <span>Contact Us via WhatsApp</span>
          <span className="text-xs sm:text-sm opacity-90">(Optional)</span>
        </button>

        <p className="text-center text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4">
          Want to discuss your booking or have questions? Click above to start a WhatsApp conversation with our team.
        </p>

        {/* Secondary Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
          <button
            onClick={handleClose}
            className="w-full px-4 sm:px-6 py-2 sm:py-3 bg-blue-600 text-white rounded-lg sm:rounded-xl hover:bg-blue-700 transition-colors text-sm sm:text-base font-medium"
          >
            Back to Main Menu
          </button>
          <button
            onClick={onNewBooking}
            className="w-full px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg sm:rounded-xl hover:bg-gray-50 transition-colors text-sm sm:text-base"
          >
            Make Another Booking
          </button>
        </div>
      </div>

      {/* Contact Information */}
      <div className="mt-4 sm:mt-6 lg:mt-8 pt-3 sm:pt-4 lg:pt-6 border-t border-gray-200 text-center">
        <p className="text-xs sm:text-sm text-gray-600 mb-2">
          Need help? Contact us directly:
        </p>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center text-xs sm:text-sm">
          <a href="tel:+60123456789" className="text-blue-600 hover:text-blue-700">
            📞 +60 12-345 6789
          </a>
          <a href="mailto:info@captura.my" className="text-blue-600 hover:text-blue-700">
            ✉️ info@captura.my
          </a>
        </div>
      </div>
    </div>
  );
}
