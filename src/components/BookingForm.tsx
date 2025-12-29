'use client';

import React, { useState } from 'react';
import type { Camera as DBCamera } from '@/lib/supabase';
import type { Camera } from '@/types';
import type { WebsiteBookingData } from '@/lib/api/website-bookings';
import { formatDateForAPI } from '@/lib/dateUtils';
import { formatPhoneWithCountryCode, isValidMalaysianPhone } from '@/utils/phoneFormatter';

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
  // No fixed delivery fee - customers pay Lalamove/delivery service directly

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

    if (!isValidMalaysianPhone(customerDetails.phone)) return 'Invalid Malaysian phone number format';

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
      // Ensure camera name is properly set and not empty
      const cameraName = camera.name && camera.name.trim() !== ''
        ? camera.name.trim()
        : `Camera ${camera.id}`; // Fallback using camera ID


      const bookingData: WebsiteBookingData = {
        camera_id: camera.id,
        camera_name: cameraName,
        start_date: formatDateForAPI(startDate),
        end_date: formatDateForAPI(endDate),
        total_days: totalDays,
        daily_rate: dailyRate,
        total_amount: totalCost, // Rental amount only (delivery fee handled separately)
        deposit_amount: depositAmount, // Fixed RM100 deposit
        final_payment_amount: finalPaymentAmount, // Same as total_amount (rental only)
        customer_name: customerDetails.name.trim(),
        customer_email: customerDetails.email.trim(),
        customer_phone: formatPhoneWithCountryCode(customerDetails.phone.trim()),
        customer_whatsapp: formatPhoneWithCountryCode(customerDetails.phone.trim()), // Use formatted phone number as WhatsApp number
        customer_address: customerDetails.address.trim() || undefined,
        customer_id_number: customerDetails.idNumber.trim() || undefined,
        emergency_contact_name: customerDetails.emergencyContactName.trim() || undefined,
        emergency_contact_phone: customerDetails.emergencyContactPhone.trim() ? formatPhoneWithCountryCode(customerDetails.emergencyContactPhone.trim()) : undefined,
        pickup_method: pickupMethod,
        pickup_address: pickupMethod === 'delivery' ? pickupAddress.trim() : undefined,
        delivery_fee: 0, // Customer pays Lalamove/delivery service directly
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

      onSuccess(result.confirmation_number, result.booking, result.customer, bookingData);
    } catch (err) {
      console.error('Error submitting booking:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-zinc-950 rounded-2xl border border-white/10 shadow-2xl p-6 max-h-[85vh] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-zinc-950">
      <div className="mb-6 border-b border-white/10 pb-4">
        <h2 className="text-xl font-black text-white mb-2 tracking-tight">Complete Your Booking</h2>
        <p className="text-zinc-400 text-xs">
          Please provide your details to confirm your <span className="text-white font-bold">{camera.name}</span> rental
        </p>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-4 flex items-center gap-2">
          <span className="text-red-500">⚠️</span>
          <p className="text-red-400 text-xs font-bold">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Details */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Customer Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 ml-1">
                Full Name *
              </label>
              <input
                type="text"
                value={customerDetails.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                placeholder="Enter your full name"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 ml-1">
                Email Address *
              </label>
              <input
                type="email"
                value={customerDetails.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                placeholder="name@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 ml-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={customerDetails.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all"
                placeholder="+60123456789"
                required
              />
            </div>
          </div>
        </div>

        {/* Pickup Method */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Pickup Method</h3>
          <div className="grid grid-cols-2 gap-3">
            <label className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${pickupMethod === 'pickup'
              ? 'bg-white text-black border-white shadow-lg'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
              }`}>
              <input
                type="radio"
                value="pickup"
                checked={pickupMethod === 'pickup'}
                onChange={(e) => setPickupMethod(e.target.value as 'pickup' | 'delivery')}
                className="sr-only"
              />
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-xs font-bold">Self Pickup</span>
            </label>

            <label className={`relative flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all ${pickupMethod === 'delivery'
              ? 'bg-white text-black border-white shadow-lg'
              : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800'
              }`}>
              <input
                type="radio"
                value="delivery"
                checked={pickupMethod === 'delivery'}
                onChange={(e) => setPickupMethod(e.target.value as 'pickup' | 'delivery')}
                className="sr-only"
              />
              <svg className="w-6 h-6 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-xs font-bold">Lalamove</span>
            </label>
          </div>

          {pickupMethod === 'delivery' && (
            <div className="animate-fadeIn">
              <label className="block text-xs font-bold text-zinc-300 mb-1.5 ml-1">
                Delivery Address *
              </label>
              <textarea
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all resize-none"
                rows={3}
                placeholder="Enter your full delivery address"
                required
              />
            </div>
          )}
        </div>



        {/* Special Requests */}
        <div>
          <label className="block text-xs font-bold text-zinc-300 mb-1.5 ml-1">
            Special Requests
          </label>
          <textarea
            value={specialRequests}
            onChange={(e) => setSpecialRequests(e.target.value)}
            className="w-full px-4 py-3 text-sm bg-zinc-900 border border-white/10 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 focus:border-white/20 transition-all resize-none"
            rows={2}
            placeholder="Any special requirements..."
          />
        </div>

        {/* Payment Info */}
        <div className="bg-zinc-900 rounded-xl p-4 border border-white/5 space-y-3">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider mb-2">Payment Summary</h4>

          <div className="space-y-2 text-xs">


            <div className="flex justify-between text-zinc-400">
              <span>Deposit (Refundable)</span>
              <span className="font-medium text-white">RM{depositAmount}</span>
            </div>
            <div className="flex justify-between text-zinc-400">
              <span>Rental Amount</span>
              <span className="font-medium text-white">RM{finalPaymentAmount}</span>
            </div>

            {pickupMethod === 'delivery' && (
              <div className="flex justify-between text-xs items-center py-1">
                <span className="text-zinc-500">Delivery Fee</span>
                <span className="text-orange-400 font-bold text-[10px] uppercase bg-orange-400/10 px-2 py-0.5 rounded">Paid to Lalamove</span>
              </div>
            )}

            <div className="flex justify-between border-t border-white/10 pt-3 mt-2">
              <span className="font-bold text-white">Total Due Now</span>
              <span className="font-black text-xl text-white">RM{depositAmount + finalPaymentAmount}</span>
            </div>
          </div>

          <div className="bg-zinc-800/50 rounded-lg p-2.5 mt-3 border border-white/5">
            <p className="text-[10px] text-zinc-400 leading-relaxed">
              <span className="text-white font-bold">Note:</span> The RM{depositAmount} deposit is fully refundable when equipment is returned in good condition.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 px-4 py-3 text-sm font-bold text-zinc-400 border border-white/10 rounded-xl hover:bg-white/5 hover:text-white transition-all"
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="flex-1 px-4 py-3 text-sm font-black bg-white text-black rounded-xl hover:bg-zinc-200 transition-all shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] transform hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Processing...' : 'Confirm Booking'}
          </button>
        </div>
      </form>
    </div>
  );
}
