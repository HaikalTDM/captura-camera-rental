'use client';

import React, { useState } from 'react';
import type { Camera } from '@/lib/supabase';
import type { WebsiteBookingData } from '@/lib/api/website-bookings';

interface BookingFormProps {
  camera: Camera;
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalCost: number;
  dailyRate: number;
  onSuccess: (confirmationNumber: string) => void;
  onCancel: () => void;
}

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  idNumber: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export default function BookingForm({
  camera,
  startDate,
  endDate,
  totalDays,
  totalCost,
  dailyRate,
  onSuccess,
  onCancel
}: BookingFormProps) {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    idNumber: '',
    emergencyContactName: '',
    emergencyContactPhone: ''
  });

  const [pickupMethod, setPickupMethod] = useState<'pickup' | 'delivery'>('pickup');
  const [pickupAddress, setPickupAddress] = useState('');
  const [specialRequests, setSpecialRequests] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const depositAmount = Math.round(totalCost * 0.3); // 30% deposit
  const finalPaymentAmount = totalCost - depositAmount;
  const deliveryFee = pickupMethod === 'delivery' ? 50 : 0; // RM50 delivery fee

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails(prev => ({ ...prev, [field]: value }));
    setError(null);
  };

  const validateForm = (): string | null => {
    if (!customerDetails.name.trim()) return 'Full name is required';
    if (!customerDetails.email.trim()) return 'Email is required';
    if (!customerDetails.phone.trim()) return 'Phone number is required';
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(customerDetails.email)) return 'Invalid email format';
    
    const phoneRegex = /^[\+]?[0-9\s\-\(\)]{8,}$/;
    if (!phoneRegex.test(customerDetails.phone)) return 'Invalid phone number format';
    
    if (pickupMethod === 'delivery' && !pickupAddress.trim()) {
      return 'Delivery address is required';
    }
    
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const bookingData: WebsiteBookingData = {
        camera_id: camera.id,
        camera_name: camera.name,
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        total_days: totalDays,
        daily_rate: dailyRate,
        total_amount: totalCost + deliveryFee,
        deposit_amount: depositAmount,
        final_payment_amount: finalPaymentAmount + deliveryFee,
        customer_name: customerDetails.name.trim(),
        customer_email: customerDetails.email.trim(),
        customer_phone: customerDetails.phone.trim(),
        customer_whatsapp: customerDetails.whatsapp.trim() || undefined,
        customer_address: customerDetails.address.trim() || undefined,
        customer_id_number: customerDetails.idNumber.trim() || undefined,
        emergency_contact_name: customerDetails.emergencyContactName.trim() || undefined,
        emergency_contact_phone: customerDetails.emergencyContactPhone.trim() || undefined,
        pickup_method: pickupMethod,
        pickup_address: pickupMethod === 'delivery' ? pickupAddress.trim() : undefined,
        delivery_fee: deliveryFee,
        special_requests: specialRequests.trim() || undefined,
        booking_source: 'website'
      };

      const response = await fetch('/api/bookings/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit booking');
      }

      onSuccess(result.confirmation_number);
    } catch (err) {
      console.error('Error submitting booking:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Booking</h2>
        <p className="text-gray-600">
          Please provide your details to confirm your {camera.name} rental
        </p>
      </div>

      {/* Booking Summary */}
      <div className="bg-blue-50 rounded-xl p-6 mb-8">
        <h3 className="text-lg font-semibold text-blue-900 mb-4">Booking Summary</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-blue-700">Camera:</span>
            <span className="font-medium text-blue-900">{camera.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Rental Period:</span>
            <span className="font-medium text-blue-900">
              {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()} ({totalDays} days)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Daily Rate:</span>
            <span className="font-medium text-blue-900">RM{dailyRate}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-blue-700">Subtotal:</span>
            <span className="font-medium text-blue-900">RM{totalCost}</span>
          </div>
          {deliveryFee > 0 && (
            <div className="flex justify-between">
              <span className="text-blue-700">Delivery Fee:</span>
              <span className="font-medium text-blue-900">RM{deliveryFee}</span>
            </div>
          )}
          <div className="border-t border-blue-200 pt-2 mt-2">
            <div className="flex justify-between text-lg font-bold">
              <span className="text-blue-900">Total:</span>
              <span className="text-blue-900">RM{totalCost + deliveryFee}</span>
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Details */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                value={customerDetails.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                value={customerDetails.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerDetails.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+60123456789"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                WhatsApp Number
              </label>
              <input
                type="tel"
                value={customerDetails.whatsapp}
                onChange={(e) => handleInputChange('whatsapp', e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+60123456789"
              />
            </div>
          </div>
        </div>

        {/* Pickup Method */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Pickup Method</h3>
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="radio"
                value="pickup"
                checked={pickupMethod === 'pickup'}
                onChange={(e) => setPickupMethod(e.target.value as 'pickup' | 'delivery')}
                className="mr-3 text-blue-600"
              />
              <span className="text-gray-700">Self Pickup (Free)</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="delivery"
                checked={pickupMethod === 'delivery'}
                onChange={(e) => setPickupMethod(e.target.value as 'pickup' | 'delivery')}
                className="mr-3 text-blue-600"
              />
              <span className="text-gray-700">Delivery (+RM50)</span>
            </label>
          </div>
          
          {pickupMethod === 'delivery' && (
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Delivery Address *
              </label>
              <textarea
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
                placeholder="Enter your full delivery address"
                required
              />
            </div>
          )}
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Special Requests
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={3}
            placeholder="Any special requirements or notes..."
          />
        </div>

        {/* Payment Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-semibold text-yellow-800 mb-2">Payment Information</h4>
          <p className="text-sm text-yellow-700">
            A deposit of RM{depositAmount} (30%) is required to confirm your booking. 
            The remaining RM{finalPaymentAmount + deliveryFee} will be due upon pickup/delivery.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 pt-6">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
