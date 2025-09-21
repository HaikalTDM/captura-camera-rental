'use client';

import React, { useState } from 'react';
import { BookingDetails } from '@/types';
import { formatCurrency } from '@/lib/pricing';
import BookingForm from './BookingForm';
import BookingSuccess from './BookingSuccess';
import WhatsAppBookingButton from './WhatsAppBookingButton';

interface RentalSummaryProps {
  booking: BookingDetails;
  onClose: () => void;
  onNewBooking: () => void;
}

export default function RentalSummary({ booking, onClose, onNewBooking }: RentalSummaryProps) {

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [confirmationNumber, setConfirmationNumber] = useState<string | null>(null);
  const [bookingResult, setBookingResult] = useState<any>(null);
  const [customerResult, setCustomerResult] = useState<any>(null);
  const [bookingDataResult, setBookingDataResult] = useState<any>(null);

  const isDiscounted = booking.totalDays >= 3;
  const savings = isDiscounted ? (booking.camera.dailyRate - booking.camera.discountRate) * booking.totalDays : 0;

  const handleBookingSuccess = (confirmationNum: string, booking: any, customer: any, bookingData: any) => {
    setConfirmationNumber(confirmationNum);
    setBookingResult(booking);
    setCustomerResult(customer);
    setBookingDataResult(bookingData);
    setIsConfirmed(true);
  };

  const handleBookingCancel = () => {
    onClose();
  };

  const handleNewBooking = () => {
    setIsConfirmed(false);
    setConfirmationNumber(null);
    setBookingResult(null);
    setCustomerResult(null);
    setBookingDataResult(null);
    onNewBooking();
  };

  // If booking is confirmed, show success component
  if (isConfirmed && confirmationNumber && bookingResult && customerResult && bookingDataResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <BookingSuccess
          confirmationNumber={confirmationNumber}
          booking={bookingResult}
          customer={customerResult}
          bookingData={bookingDataResult}
          onNewBooking={handleNewBooking}
          onClose={onClose}
        />
      </div>
    );
  }

  // Always show booking form directly (skip summary)
  if (!isConfirmed) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
        <BookingForm
          camera={booking.camera}
          startDate={booking.startDate}
          endDate={booking.endDate}
          totalDays={booking.totalDays}
          totalCost={booking.totalCost}
          dailyRate={booking.dailyRate}
          onSuccess={handleBookingSuccess}
          onCancel={handleBookingCancel}
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50">
      <div className="bg-white rounded-xl max-w-sm sm:max-w-md w-full max-h-[95vh] sm:max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className={`text-white p-6 rounded-t-xl ${isConfirmed ? 'bg-green-600' : 'bg-blue-600'}`}>
          <div className="flex items-center justify-center mb-4">
            {isConfirmed ? (
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-16 h-16 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2z" />
              </svg>
            )}
          </div>
          <h2 className="text-2xl font-bold text-center">
            {isConfirmed ? 'Booking Confirmed!' : 'Booking Summary'}
          </h2>
          <p className={`text-center mt-2 ${isConfirmed ? 'text-green-100' : 'text-blue-100'}`}>
            {isConfirmed
              ? `Your camera rental has been successfully booked. Confirmation: ${confirmationNumber}`
              : 'Review your booking details and confirm to proceed'
            }
          </p>
        </div>

        <div className="p-6">
          {/* Booking Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Rental Summary</h3>
            
            <div className="space-y-4">
              {/* Camera Info */}
              <div className="flex justify-between items-start">
                <div>
                  <h4 className="font-medium text-gray-900">{booking.camera.name}</h4>
                  <p className="text-sm text-gray-800">{booking.camera.description}</p>
                </div>
              </div>
              
              <hr className="border-gray-200" />

              {/* Customer Details */}
              {booking.customerDetails && (
                <>
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Customer Information</h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-800">Name:</span>
                        <span className="font-medium">{booking.customerDetails.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-800">Phone:</span>
                        <span className="font-medium">{booking.customerDetails.phone}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-800">Email:</span>
                        <span className="font-medium">{booking.customerDetails.email}</span>
                      </div>
                    </div>
                  </div>

                  <hr className="border-gray-200" />
                </>
              )}

              {/* Rental Period */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-800">Start Date</label>
                  <p className="text-gray-900">{booking.startDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-800">End Date</label>
                  <p className="text-gray-900">{booking.endDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}</p>
                </div>
              </div>
              
              <hr className="border-gray-200" />
              
              {/* Pricing Breakdown */}
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-800">Duration:</span>
                  <span className="font-medium">{booking.totalDays} day{booking.totalDays > 1 ? 's' : ''}</span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-800">Daily Rate:</span>
                  <span className="font-medium">
                    {formatCurrency(booking.dailyRate)}
                    {isDiscounted && (
                      <span className="text-green-600 text-sm ml-1">(Discounted)</span>
                    )}
                  </span>
                </div>
                
                {isDiscounted && savings > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Bulk Discount Savings:</span>
                    <span>-{formatCurrency(savings)}</span>
                  </div>
                )}
                
                <hr className="border-gray-200" />
                
                <div className="flex justify-between text-lg font-bold">
                  <span>Total Cost:</span>
                  <span className="text-green-600">{formatCurrency(booking.totalCost)}</span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Next Steps - only show after confirmation */}
          {isConfirmed && (
            <div className="bg-green-50 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-green-900 mb-3">What's Next?</h3>
              <ul className="space-y-2 text-sm text-green-800">
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  You'll receive a confirmation email with pickup details
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Bring a valid ID for equipment pickup
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  Our team will provide a quick tutorial on the equipment
                </li>
                <li className="flex items-start">
                  <svg className="w-4 h-4 text-green-600 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  24/7 support available during your rental period
                </li>
              </ul>
            </div>
          )}
          
          {/* Action Buttons */}
          <div className="flex space-x-4">
            {isConfirmed ? (
              <>
                <button
                  onClick={onNewBooking}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Book Another Camera
                </button>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Close
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={onClose}
                  className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmBooking}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200"
                >
                  Confirm Booking
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
