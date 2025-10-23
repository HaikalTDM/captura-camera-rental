'use client';

import { useState, useEffect } from 'react';
import { Camera } from '@/types';
import { formatCurrency } from '@/lib/pricing';

// WhatsApp Configuration
const WHATSAPP_CONFIG = {
  number: '60177464121', // Your actual WhatsApp business number
  countryCode: '+60'
};

interface CustomerDetails {
  name: string;
  phone: string;
  email: string;
}

interface CustomerDetailsModalProps {
  isOpen: boolean;
  camera: Camera;
  startDate: Date;
  endDate: Date;
  totalCost: number;
  totalDays: number;
  onSubmit: (customerDetails: CustomerDetails) => void;
  onCancel: () => void;
}

export default function CustomerDetailsModal({
  isOpen,
  camera,
  startDate,
  endDate,
  totalCost,
  totalDays,
  onSubmit,
  onCancel
}: CustomerDetailsModalProps) {
  const [customerDetails, setCustomerDetails] = useState<CustomerDetails>({
    name: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState<Partial<CustomerDetails>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Prevent body scroll when modal is open
  useEffect(() => {
    try {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = '0px'; // Prevent layout shift
      } else {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      }
    } catch (e) {
      // Ignore DOM errors
    }

    return () => {
      try {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
      } catch (e) {
        // Ignore cleanup errors
      }
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const formatWhatsAppMessage = (customerDetails: CustomerDetails): string => {
    const startDateFormatted = startDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const endDateFormatted = endDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const isDiscounted = totalDays >= 3;
    const dailyRate = totalCost / totalDays;
    const savings = isDiscounted ? (camera.dailyRate - camera.discountRate) * totalDays : 0;

    const message = `🎬 *CAPTURA CAMERA RENTAL BOOKING*

👤 *Customer Information:*
• Name: ${customerDetails.name}
• Phone: ${customerDetails.phone}
• Email: ${customerDetails.email}

📷 *Equipment Details:*
• Camera: ${camera.name}
• Description: ${camera.description}

📅 *Rental Period:*
• Start Date: ${startDateFormatted}
• End Date: ${endDateFormatted}
• Duration: ${totalDays} day${totalDays > 1 ? 's' : ''}

💰 *Pricing Breakdown:*
• Daily Rate: ${formatCurrency(dailyRate)}${isDiscounted ? ' (Bulk Discount Applied)' : ''}
${savings > 0 ? `• Savings: ${formatCurrency(savings)} (3+ days discount)\n` : ''}• *Total Cost: ${formatCurrency(totalCost)}*

📋 *Next Steps:*
Please confirm this booking and provide pickup/delivery details.

Thank you for choosing CAPTURA! 🎥✨`;

    return encodeURIComponent(message);
  };

  const sendToWhatsApp = (customerDetails: CustomerDetails) => {
    const message = formatWhatsAppMessage(customerDetails);
    const whatsappUrl = `https://wa.me/${WHATSAPP_CONFIG.number}?text=${message}`;

    // Open WhatsApp in a new tab
    window.open(whatsappUrl, '_blank');
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<CustomerDetails> = {};

    // Name validation
    if (!customerDetails.name.trim()) {
      newErrors.name = 'Name is required';
    } else if (customerDetails.name.trim().length < 2) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    // Phone validation
    if (!customerDetails.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^(\+?6?01[0-46-9]-*[0-9]{7,8}|01[0-46-9]-*[0-9]{7,8})$/.test(customerDetails.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Malaysian phone number';
    }

    // Email validation
    if (!customerDetails.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(customerDetails.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Call the onSubmit callback with customer details (new two-step process)
    onSubmit(customerDetails);

    setIsSubmitting(false);
  };

  const handleInputChange = (field: keyof CustomerDetails, value: string) => {
    setCustomerDetails(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined
      }));
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Format Malaysian phone numbers
    if (digits.startsWith('60')) {
      // International format
      return digits.replace(/^(60)(1[0-46-9])(\d{3,4})(\d{4})$/, '+$1 $2-$3 $4');
    } else if (digits.startsWith('01')) {
      // Local format
      return digits.replace(/^(01[0-46-9])(\d{3,4})(\d{4})$/, '$1-$2 $3');
    }
    
    return phone;
  };

  const handlePhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value);
    handleInputChange('phone', formatted);
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto"
      onClick={(e) => {
        // Close modal if clicking on backdrop
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold">Customer Details</h2>
              <p className="text-blue-100 mt-1">Complete your booking information</p>
            </div>
            <button
              onClick={onCancel}
              className="text-blue-100 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Booking Summary */}
        <div className="bg-gray-50 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-gray-900">{camera.name}</h3>
              <p className="text-sm text-gray-800">
                {startDate.toLocaleDateString()} - {endDate.toLocaleDateString()} ({totalDays} days)
              </p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(totalCost)}</div>
              <div className="text-sm text-gray-800">Total Cost</div>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Name Field */}
            <div>
              <label htmlFor="customerName" className="block text-sm font-bold text-gray-900 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="customerName"
                value={customerDetails.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white text-gray-900 ${
                  errors.name ? 'border-red-500 bg-red-50' : 'border-gray-400 focus:border-blue-500'
                }`}
                placeholder="Enter your full name"
                disabled={isSubmitting}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.name}
                </p>
              )}
            </div>

            {/* Phone Field */}
            <div>
              <label htmlFor="customerPhone" className="block text-sm font-bold text-gray-900 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="customerPhone"
                value={customerDetails.phone}
                onChange={(e) => handlePhoneChange(e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white text-gray-900 ${
                  errors.phone ? 'border-red-500 bg-red-50' : 'border-gray-400 focus:border-blue-500'
                }`}
                placeholder="01X-XXX XXXX"
                disabled={isSubmitting}
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.phone}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-700">Malaysian phone number format</p>
            </div>

            {/* Email Field */}
            <div>
              <label htmlFor="customerEmail" className="block text-sm font-bold text-gray-900 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="customerEmail"
                value={customerDetails.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors bg-white text-gray-900 ${
                  errors.email ? 'border-red-500 bg-red-50' : 'border-gray-400 focus:border-blue-500'
                }`}
                placeholder="your.email@example.com"
                disabled={isSubmitting}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  {errors.email}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-700">We'll send booking confirmation to this email</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              disabled={isSubmitting}
              className="px-6 py-3 border border-gray-300 rounded-lg text-gray-800 font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 disabled:opacity-50 disabled:transform-none flex items-center"
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                '🎬 Confirm Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
