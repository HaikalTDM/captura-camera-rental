'use client';

import React, { useState } from 'react';
import BookingForm from '@/components/BookingForm';
import BookingSuccess from '@/components/BookingSuccess';

export default function TestBookingFlow() {
  const [showForm, setShowForm] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [bookingData, setBookingData] = useState<any>(null);

  const mockCamera = {
    id: 'osmo-pocket-3',
    name: 'DJI Osmo Pocket 3',
    dailyRate: 50,
    discountRate: 45
  };

  const startDate = new Date('2025-09-28');
  const endDate = new Date('2025-09-30');
  const totalDays = 2;
  const totalCost = 100;

  const handleStartBooking = () => {
    setShowForm(true);
    setShowSuccess(false);
  };

  const handleBookingSuccess = (confirmationNumber: string, booking: any, customer: any, submittedBookingData: any) => {
    console.log('Booking Success:', { confirmationNumber, booking, customer, submittedBookingData });
    setBookingData({
      confirmationNumber,
      booking,
      customer,
      bookingData: submittedBookingData
    });
    setShowForm(false);
    setShowSuccess(true);
  };

  const handleBookingCancel = () => {
    setShowForm(false);
  };

  const handleNewBooking = () => {
    setShowSuccess(false);
    setBookingData(null);
  };

  const handleClose = () => {
    setShowSuccess(false);
    setBookingData(null);
  };

  if (showSuccess && bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <BookingSuccess
          confirmationNumber={bookingData.confirmationNumber}
          booking={bookingData.booking}
          customer={bookingData.customer}
          bookingData={bookingData.bookingData}
          onNewBooking={handleNewBooking}
          onClose={handleClose}
        />
      </div>
    );
  }

  if (showForm) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <BookingForm
          camera={mockCamera}
          startDate={startDate}
          endDate={endDate}
          totalDays={totalDays}
          totalCost={totalCost}
          dailyRate={50}
          onSuccess={handleBookingSuccess}
          onCancel={handleBookingCancel}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Test Booking Flow</h1>
        
        <div className="space-y-6">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-blue-800 mb-4">Two-Step Booking Process</h2>
            <div className="space-y-3 text-sm text-blue-700">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <div>
                  <p className="font-medium">Booking Confirmation</p>
                  <p>Click "Confirm Booking" → Submit to database → Show confirmation</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <div>
                  <p className="font-medium">Optional WhatsApp Contact</p>
                  <p>Click "Contact Us via WhatsApp" → Open WhatsApp with pre-filled message</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-green-800 mb-4">Test Camera Booking</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
              <div>
                <p className="text-green-600 font-medium">Camera</p>
                <p className="text-green-900">{mockCamera.name}</p>
              </div>
              <div>
                <p className="text-green-600 font-medium">Duration</p>
                <p className="text-green-900">{totalDays} days</p>
              </div>
              <div>
                <p className="text-green-600 font-medium">Dates</p>
                <p className="text-green-900">Sep 28 - Sep 30, 2025</p>
              </div>
              <div>
                <p className="text-green-600 font-medium">Total Cost</p>
                <p className="text-green-900">RM{totalCost}</p>
              </div>
            </div>
            
            <button
              onClick={handleStartBooking}
              className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              🎯 Start Booking Test
            </button>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Expected Flow</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-yellow-700">
              <li>Click "Start Booking Test" above</li>
              <li>Fill out the booking form</li>
              <li>Click "Confirm Booking" (NOT "Send to WhatsApp")</li>
              <li>See booking confirmation with booking number</li>
              <li>Optionally click "Contact Us via WhatsApp"</li>
              <li>Check admin dashboard for the new booking</li>
            </ol>
          </div>

          <div className="text-center">
            <a 
              href="/admin/bookings" 
              target="_blank"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              📊 Open Admin Dashboard
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
