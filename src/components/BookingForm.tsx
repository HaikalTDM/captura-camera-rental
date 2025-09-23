'use client';

import React, { useState } from 'react';
import type { Camera as DBCamera } from '@/lib/supabase';
import type { Camera } from '@/types';
import type { WebsiteBookingData } from '@/lib/api/website-bookings';
import { formatDateForAPI } from '@/lib/dateUtils';

interface BookingFormProps {
  camera: Camera; // Frontend Camera type
  startDate: Date;
  endDate: Date;
  totalDays: number;
  totalCost: number;
  dailyRate: number;
  onSuccess: (confirmationNumber: string, booking: any, customer: any, bookingData: any) => void;
  onCancel: () => void;
}

interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
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

  const depositAmount = 100; // Fixed RM100 deposit
  const finalPaymentAmount = totalCost; // Full rental amount (separate from deposit)
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

    console.log('BookingForm: Starting submission...');
    console.log('Camera:', camera);
    console.log('Dates:', { startDate, endDate });

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('BookingForm: Camera object received:', camera);
      console.log('BookingForm: Camera name:', camera.name);
      console.log('BookingForm: Camera ID:', camera.id);

      // Ensure camera name is properly set and not empty
      const cameraName = camera.name && camera.name.trim() !== ''
        ? camera.name.trim()
        : `Camera ${camera.id}`; // Fallback using camera ID

      console.log('BookingForm: Final camera name used:', cameraName);

      const bookingData: WebsiteBookingData = {
        camera_id: camera.id,
        camera_name: cameraName,
        start_date: formatDateForAPI(startDate),
        end_date: formatDateForAPI(endDate),
        total_days: totalDays,
        daily_rate: dailyRate,
        total_amount: totalCost + deliveryFee, // Rental amount only
        deposit_amount: depositAmount, // Fixed RM100 deposit
        final_payment_amount: finalPaymentAmount + deliveryFee, // Same as total_amount (rental)
        customer_name: customerDetails.name.trim(),
        customer_email: customerDetails.email.trim(),
        customer_phone: customerDetails.phone.trim(),
        customer_whatsapp: customerDetails.phone.trim(), // Use phone number as WhatsApp number
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

      console.log('BookingForm: Submitting booking data:', bookingData);

      const response = await fetch('/api/bookings/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingData),
      });

      console.log('BookingForm: API response status:', response.status);
      const result = await response.json();
      console.log('BookingForm: API response data:', result);

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to submit booking');
      }

      onSuccess(result.confirmation_number, result.booking, result.customer, bookingData);
    } catch (err) {
      console.error('Error submitting booking:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm sm:max-w-md lg:max-w-lg mx-auto bg-white rounded-xl sm:rounded-2xl shadow-xl p-3 sm:p-4 lg:p-6 max-h-[95vh] overflow-y-auto">
      <div className="mb-3 sm:mb-4 lg:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">Complete Your Booking</h2>
        <p className="text-gray-600 text-xs sm:text-sm">
          Please provide your details to confirm your {camera.name} rental
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-2 sm:p-4 mb-3 sm:mb-6">
          <p className="text-red-800 text-xs sm:text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
        {/* Customer Details */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Customer Details</h3>
          <div className="space-y-2 sm:space-y-3">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={customerDetails.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Email Address *
              </label>
              <input
                type="email"
                value={customerDetails.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerDetails.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="+60177464121"
                required
              />
            </div>

          </div>
        </div>

        {/* Pickup Method */}
        <div>
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2 sm:mb-3">Pickup Method</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                value="pickup"
                checked={pickupMethod === 'pickup'}
                onChange={(e) => setPickupMethod(e.target.value as 'pickup' | 'delivery')}
                className="mr-2 sm:mr-3 text-blue-600"
              />
              <span className="text-sm sm:text-base text-gray-700">Self Pickup</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="delivery"
                checked={pickupMethod === 'delivery'}
                onChange={(e) => setPickupMethod(e.target.value as 'pickup' | 'delivery')}
                className="mr-2 sm:mr-3 text-blue-600"
              />
              <span className="text-sm sm:text-base text-gray-700">Lalamove Delivery</span>
            </label>
          </div>

          {pickupMethod === 'delivery' && (
            <div className="mt-3 sm:mt-4">
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Delivery Address *
              </label>
              <textarea
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={2}
                placeholder="Enter your full delivery address"
                required
              />
            </div>
          )}
        </div>

        {/* Special Requests */}
        <div>
          <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
            Special Requests
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="w-full px-2 sm:px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            rows={2}
            placeholder="Any special requirements or notes..."
          />
        </div>

        {/* Payment Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2 sm:p-3">
          <h4 className="font-semibold text-yellow-800 mb-1 text-xs sm:text-sm">Payment Information</h4>
          <div className="text-xs text-yellow-700 space-y-1">
            <p><strong>Deposit (Refundable):</strong> RM{depositAmount}</p>
            <p><strong>Rental Amount:</strong> RM{finalPaymentAmount + deliveryFee}</p>
            <p><strong>Total Due:</strong> RM{depositAmount + finalPaymentAmount + deliveryFee}</p>
            <p className="text-xs text-yellow-600 mt-2">
              The RM{depositAmount} deposit is fully refundable when equipment is returned in good condition.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-3 sm:px-6 py-2 sm:py-3 text-sm sm:text-base bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
