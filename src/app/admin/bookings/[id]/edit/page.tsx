'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAllBookings, updateBooking, updateCustomer } from '@/lib/api/bookings';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import type { Booking } from '@/lib/supabase';
import Link from 'next/link';

export default function EditBookingPage() {
  const params = useParams();
  const router = useRouter();
  const bookingId = params.id as string;

  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  
  // Form fields
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    customer_whatsapp: '',
    start_date: '',
    end_date: '',
    total_days: 0,
    daily_rate: 0,
    total_amount: 0,
    deposit_amount: 0,
    final_payment_amount: 0,
    pickup_method: 'pickup',
    delivery_fee: 0,
    notes: '',
    admin_notes: ''
  });

  useEffect(() => {
    loadBookingData();
  }, [bookingId]);

  // Add keyboard shortcut for save (Ctrl+S)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        if (hasUnsavedChanges && !isSaving) {
          handleSave();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [hasUnsavedChanges, isSaving]);

  const loadBookingData = async () => {
    setIsLoading(true);
    try {
      const bookings = await getAllBookings();
      const foundBooking = bookings.find(b => b.id === bookingId);
      if (foundBooking) {
        setBooking(foundBooking);
        setFormData({
          customer_name: foundBooking.customer?.full_name || '',
          customer_email: foundBooking.customer?.email || '',
          customer_phone: foundBooking.customer?.phone || '',
          customer_whatsapp: foundBooking.customer?.whatsapp || (foundBooking.customer?.phone ? formatPhoneWithCountryCode(foundBooking.customer.phone) : ''),
          start_date: foundBooking.start_date || '',
          end_date: foundBooking.end_date || '',
          total_days: foundBooking.total_days || 0,
          daily_rate: foundBooking.daily_rate || 0,
          total_amount: foundBooking.total_amount || 0,
          deposit_amount: foundBooking.deposit_amount || 0,
          final_payment_amount: foundBooking.final_payment_amount || 0,
          pickup_method: foundBooking.pickup_method || 'pickup',
          delivery_fee: foundBooking.delivery_fee || 0,
          notes: foundBooking.notes || '',
          admin_notes: foundBooking.admin_notes || ''
        });
      }
    } catch (error) {
      console.error('Error loading booking data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'number' ? parseFloat(value) || 0 : value;
    
    setFormData(prev => {
      const updated = {
        ...prev,
        [name]: newValue
      };

      // Auto-calculate fields when dates or daily rate change
      if (name === 'start_date' || name === 'end_date') {
        if (updated.start_date && updated.end_date) {
          const startDate = new Date(updated.start_date);
          const endDate = new Date(updated.end_date);
          const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
          
          updated.total_days = diffDays;
          updated.total_amount = updated.daily_rate * diffDays;
          updated.final_payment_amount = updated.total_amount;
        }
      }

      if (name === 'daily_rate' || name === 'total_days') {
        updated.total_amount = updated.daily_rate * updated.total_days;
        updated.final_payment_amount = updated.total_amount;
      }

      return updated;
    });

    // Clear any previous error/success messages when user makes changes
    if (error) setError(null);
    if (success) setSuccess(null);
    
    // Mark that there are unsaved changes
    setHasUnsavedChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!booking) {
        throw new Error('Booking data not found');
      }

      console.log('Saving booking data:', formData);

      // Update customer information
      const customerUpdates = {
        full_name: formData.customer_name,
        name: formData.customer_name, // Also update name field
        email: formData.customer_email,
        phone: formData.customer_phone,
        whatsapp: formData.customer_whatsapp
      };

      const customerUpdateSuccess = await updateCustomer(booking.customer_id, customerUpdates);
      if (!customerUpdateSuccess) {
        throw new Error('Failed to update customer information');
      }

      // Update booking information
      const bookingUpdates = {
        start_date: formData.start_date,
        end_date: formData.end_date,
        total_days: formData.total_days,
        daily_rate: formData.daily_rate,
        total_amount: formData.total_amount,
        deposit_amount: formData.deposit_amount,
        final_payment_amount: formData.final_payment_amount,
        pickup_method: formData.pickup_method,
        delivery_fee: formData.delivery_fee,
        notes: formData.notes,
        admin_notes: formData.admin_notes
      };

      const bookingUpdateSuccess = await updateBooking(bookingId, bookingUpdates);
      if (!bookingUpdateSuccess) {
        throw new Error('Failed to update booking information');
      }

      console.log('✅ Booking updated successfully');
      setSuccess('Booking updated successfully!');
      setHasUnsavedChanges(false);
      
      // Wait a moment to show success message, then redirect
      setTimeout(() => {
        router.push(`/admin/bookings/${bookingId}`);
        router.refresh(); // Ensure fresh data is loaded
      }, 1500);

    } catch (error) {
      console.error('❌ Error saving booking:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save booking changes';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!booking) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Booking Not Found</h1>
        <Link href="/admin/bookings" className="text-blue-600 hover:text-blue-800">
          ← Back to Bookings
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <style jsx global>{`
        /* Override global mobile styles for admin forms */
        .admin-form input, 
        .admin-form select, 
        .admin-form textarea {
          color: #111827 !important;
          background-color: white !important;
          opacity: 1 !important;
          -webkit-text-fill-color: #111827 !important;
          font-weight: 500 !important;
        }
        
        .admin-form input:focus, 
        .admin-form select:focus, 
        .admin-form textarea:focus {
          color: #111827 !important;
          -webkit-text-fill-color: #111827 !important;
        }
        
        .admin-form input::placeholder, 
        .admin-form textarea::placeholder {
          color: #6b7280 !important;
          opacity: 0.7 !important;
        }
        
        .admin-form option {
          color: #111827 !important;
          background-color: white !important;
        }
      `}</style>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href={`/admin/bookings/${bookingId}`}
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ←
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">Edit Booking</h1>
              {hasUnsavedChanges && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                  <span className="w-2 h-2 bg-orange-400 rounded-full mr-1 animate-pulse"></span>
                  Unsaved changes
                </span>
              )}
            </div>
            <p className="text-gray-600">Booking ID: {booking.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/bookings/${bookingId}`}
            className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancel
          </Link>
          <button
            onClick={handleSave}
            disabled={isSaving || !hasUnsavedChanges}
            className={`px-6 py-2 rounded-lg transition-colors disabled:opacity-50 ${
              hasUnsavedChanges 
                ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isSaving ? (
              <>
                <span className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></span>
                Saving...
              </>
            ) : hasUnsavedChanges ? (
              'Save Changes (Ctrl+S)'
            ) : (
              'No Changes'
            )}
          </button>
        </div>
      </div>

      {/* Error and Success Messages */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-red-600 text-xl mr-3">❌</div>
            <div>
              <h3 className="text-red-800 font-medium">Error Saving Changes</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="text-green-600 text-xl mr-3">✅</div>
            <div>
              <h3 className="text-green-800 font-medium">Changes Saved Successfully</h3>
              <p className="text-green-700 text-sm mt-1">{success}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 admin-form">
        {/* Customer Information */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Customer Information</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="customer_email"
                value={formData.customer_email}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">WhatsApp</label>
              <input
                type="tel"
                name="customer_whatsapp"
                value={formData.customer_whatsapp}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Rental Details */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Rental Details</h3>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  name="start_date"
                  value={formData.start_date}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  name="end_date"
                  value={formData.end_date}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Total Days</label>
                <input
                  type="number"
                  name="total_days"
                  value={formData.total_days}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Daily Rate (RM)</label>
                <input
                  type="number"
                  name="daily_rate"
                  value={formData.daily_rate}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Pickup Method</label>
              <select
                name="pickup_method"
                value={formData.pickup_method}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white font-medium"
              >
                <option value="pickup">Pickup</option>
                <option value="delivery">Delivery</option>
              </select>
            </div>
          </div>
        </div>

        {/* Payment Details */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Payment Details</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount (RM)</label>
              <input
                type="number"
                name="total_amount"
                value={formData.total_amount}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Deposit Amount (RM)</label>
              <input
                type="number"
                name="deposit_amount"
                value={formData.deposit_amount}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Final Payment (RM)</label>
              <input
                type="number"
                name="final_payment_amount"
                value={formData.final_payment_amount}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Delivery Fee (RM)</label>
              <input
                type="number"
                name="delivery_fee"
                value={formData.delivery_fee}
                onChange={handleInputChange}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Notes</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
                placeholder="Customer special requests..."
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Admin Notes</label>
              <textarea
                name="admin_notes"
                value={formData.admin_notes}
                onChange={handleInputChange}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 bg-white placeholder-gray-500 font-medium"
                placeholder="Internal admin notes..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
