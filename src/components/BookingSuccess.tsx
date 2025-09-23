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
    console.log('BookingSuccess: WhatsApp contact - bookingData:', bookingData);
    console.log('BookingSuccess: WhatsApp contact - camera_name:', bookingData.camera_name);
    const whatsappUrl = generateWhatsAppContactUrl(booking, customer, bookingData);
    console.log('BookingSuccess: Generated WhatsApp URL:', whatsappUrl);
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto relative">
      {/* Close Button */}
      <button
        onClick={onNewBooking}
        className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors z-10"
        title="Close and return to main menu"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Success Header */}
      <div className="text-center mb-4 sm:mb-6">
        <div className="mx-auto w-12 sm:w-16 h-12 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
          <span className="text-2xl sm:text-3xl">✅</span>
        </div>
        <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1 sm:mb-2">Booking Confirmed!</h2>
        <p className="text-xs sm:text-sm text-gray-600">
          Your camera rental request has been submitted successfully
        </p>
      </div>

      {/* WhatsApp Contact Section */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-6 mb-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-green-800 mb-4">
            Complete Booking via WhatsApp
          </h3>
        </div>

        <button
          onClick={handleWhatsAppContact}
          className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:from-green-600 hover:to-emerald-600 transition-all duration-300 font-medium text-base shadow-md hover:shadow-lg transform hover:scale-105"
        >
          <span className="text-xl">💬</span>
          Complete Booking via WhatsApp
        </button>

        <div className="mt-4 text-center">
          <p className="text-sm text-green-700">
            Confirmation is only finalized once you complete it on WhatsApp.
          </p>
        </div>
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
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-800 mb-4">Booking Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-blue-600 font-medium">Camera</p>
            <p className="text-blue-900">{bookingData.camera_name || 'Camera Equipment'}</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Duration</p>
            <p className="text-blue-900">{bookingData.total_days} days</p>
          </div>
          <div>
            <p className="text-blue-600 font-medium">Dates</p>
            <p className="text-blue-900">{bookingData.start_date} to {bookingData.end_date}</p>
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
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center">
          <span className="mr-2">�</span>
          What&apos;s Next?
        </h3>
        <div className="space-y-3 text-sm text-amber-700">
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
            <p>Connect with us on WhatsApp for instant updates and personalized service</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
            <p>Our team will review your booking request within 24 hours</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">3</span>
            <p>We&apos;ll confirm availability and arrange convenient payment options</p>
          </div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 bg-amber-200 text-amber-800 rounded-full flex items-center justify-center text-xs font-bold">4</span>
            <p>Receive detailed pickup/delivery instructions and enjoy your rental!</p>
          </div>
        </div>
      </div>

      {/* Secondary Action: New Booking */}
      <div className="mt-6">
        <button
          onClick={onNewBooking}
          className="w-full px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
        >
          Make Another Booking
        </button>
      </div>

      {/* Contact Information */}
      <div className="mt-8 pt-6 border-t border-gray-200 text-center">
        <p className="text-sm text-gray-600 mb-2">
          Need help? Contact us directly:
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center text-sm">
          <a href="tel:+60177464121" className="text-blue-600 hover:text-blue-700">
            📞 +60 17-746 4121
          </a>
          <a href="mailto:info@captura.my" className="text-blue-600 hover:text-blue-700">
            ✉️ info@captura.my
          </a>
        </div>
      </div>
    </div>
  );
}
