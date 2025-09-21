'use client';

import React, { useState } from 'react';
import type { Camera } from '@/types';
import { formatDateForAPI } from '@/lib/dateUtils';

interface WhatsAppBookingButtonProps {
  camera: Camera;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalCost: number;
  dailyRate: number;
  className?: string;
}

export default function WhatsAppBookingButton({
  camera,
  startDate,
  endDate,
  totalDays,
  totalCost,
  dailyRate,
  className = ''
}: WhatsAppBookingButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({
    name: '',
    phone: '',
    email: ''
  });

  const handleWhatsAppBooking = async () => {
    if (!customerDetails.name || !customerDetails.phone) {
      alert('Please fill in your name and phone number');
      return;
    }

    setIsLoading(true);

    try {
      const bookingData = {
        camera_id: camera.id,
        camera_name: camera.name,
        start_date: formatDateForAPI(startDate),
        end_date: formatDateForAPI(endDate),
        total_days: totalDays,
        daily_rate: dailyRate,
        total_amount: totalCost,
        deposit_amount: Math.round(totalCost * 0.3),
        final_payment_amount: Math.round(totalCost * 0.7),
        customer_name: customerDetails.name,
        customer_phone: customerDetails.phone,
        customer_email: customerDetails.email,
        pickup_method: 'pickup',
        booking_source: 'whatsapp'
      };

      const response = await fetch('/api/whatsapp/send-booking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (result.success) {
        // Open WhatsApp with the pre-filled message
        window.open(result.whatsapp_url, '_blank');
        
        // Show success message
        alert(`Booking submitted successfully! Confirmation: ${result.confirmation_number}\n\nYour booking is pending admin approval. You will be contacted via WhatsApp.`);
        
        // Reset form
        setCustomerDetails({ name: '', phone: '', email: '' });
        setShowForm(false);
      } else {
        alert(`Error: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting WhatsApp booking:', error);
      alert('Failed to submit booking. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (!showForm) {
    return (
      <button
        onClick={() => setShowForm(true)}
        className={`bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center gap-2 ${className}`}
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.595z"/>
        </svg>
        Send to WhatsApp
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">WhatsApp Booking</h3>
        <button
          onClick={() => setShowForm(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>
      </div>

      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <div className="text-green-600 text-xl">📱</div>
          <div>
            <h4 className="font-medium text-green-900">Quick WhatsApp Booking</h4>
            <p className="text-sm text-green-700 mt-1">
              Fill in your details below and we'll send your booking request directly to our admin via WhatsApp. 
              You'll receive confirmation and payment details shortly.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name *
          </label>
          <input
            type="text"
            value={customerDetails.name}
            onChange={(e) => setCustomerDetails(prev => ({ ...prev, name: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="Enter your full name"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            WhatsApp Number *
          </label>
          <input
            type="tel"
            value={customerDetails.phone}
            onChange={(e) => setCustomerDetails(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="+60123456789"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email (Optional)
          </label>
          <input
            type="email"
            value={customerDetails.email}
            onChange={(e) => setCustomerDetails(prev => ({ ...prev, email: e.target.value }))}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
            placeholder="your.email@example.com"
          />
        </div>
      </div>

      <div className="bg-gray-50 rounded-lg p-4">
        <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Camera:</strong> {camera.name}</p>
          <p><strong>Dates:</strong> {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()}</p>
          <p><strong>Duration:</strong> {totalDays} day{totalDays > 1 ? 's' : ''}</p>
          <p><strong>Total:</strong> RM{totalCost.toFixed(2)}</p>
        </div>
      </div>

      <div className="flex space-x-3">
        <button
          onClick={() => setShowForm(false)}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-medium py-3 px-4 rounded-lg transition-colors"
        >
          Cancel
        </button>
        <button
          onClick={handleWhatsAppBooking}
          disabled={isLoading || !customerDetails.name || !customerDetails.phone}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              Sending...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.595z"/>
              </svg>
              Send to WhatsApp
            </>
          )}
        </button>
      </div>
    </div>
  );
}
