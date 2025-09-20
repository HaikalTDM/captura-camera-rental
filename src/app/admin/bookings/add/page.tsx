'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createBooking,
  createCustomer,
  getAllCustomers,
  getAllCameras
} from '@/lib/api/bookings';
import type { Customer, Camera } from '@/lib/supabase';

export default function AddBookingPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false);

  // Booking form data
  const [bookingData, setBookingData] = useState({
    customer_id: '',
    camera_id: '',
    start_date: '',
    end_date: '',
    total_days: 1,
    daily_rate: 0,
    total_amount: 0,
    deposit_amount: 0,
    deposit_paid: false,
    deposit_paid_date: '',
    final_payment_amount: 0,
    final_payment_paid: false,
    final_payment_paid_date: '',
    status: 'pending' as const,
    pickup_method: 'pickup' as const,
    pickup_address: '',
    delivery_fee: 0,
    booking_source: 'manual' as const,
    notes: ''
  });

  // New customer form data
  const [newCustomer, setNewCustomer] = useState({
    full_name: '',
    email: '',
    phone: '',
    whatsapp: '',
    address: '',
    id_number: '',
    emergency_contact_name: '',
    emergency_contact_phone: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [customersData, camerasData] = await Promise.all([
      getAllCustomers(),
      getAllCameras()
    ]);
    setCustomers(customersData);
    setCameras(camerasData);
  };

  // Calculate totals when dates or camera change
  useEffect(() => {
    if (bookingData.start_date && bookingData.end_date && bookingData.camera_id) {
      const start = new Date(bookingData.start_date);
      const end = new Date(bookingData.end_date);
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      
      const camera = cameras.find(c => c.id === bookingData.camera_id);
      if (camera && days > 0) {
        const dailyRate = camera.daily_rate;
        const totalAmount = dailyRate * days + bookingData.delivery_fee;
        const depositAmount = camera.deposit_amount;
        const finalPaymentAmount = totalAmount - (bookingData.deposit_paid ? depositAmount : 0);

        setBookingData(prev => ({
          ...prev,
          total_days: days,
          daily_rate: dailyRate,
          total_amount: totalAmount,
          deposit_amount: depositAmount,
          final_payment_amount: finalPaymentAmount
        }));
      }
    }
  }, [bookingData.start_date, bookingData.end_date, bookingData.camera_id, bookingData.delivery_fee, bookingData.deposit_paid, cameras]);

  const handleCreateCustomer = async () => {
    if (!newCustomer.full_name || !newCustomer.email || !newCustomer.phone) {
      alert('Please fill in required customer fields (name, email, phone)');
      return;
    }

    const customer = await createCustomer(newCustomer);
    if (customer) {
      setCustomers(prev => [...prev, customer]);
      setBookingData(prev => ({ ...prev, customer_id: customer.id }));
      setShowNewCustomerForm(false);
      setNewCustomer({
        full_name: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        id_number: '',
        emergency_contact_name: '',
        emergency_contact_phone: ''
      });
      alert('Customer created successfully!');
    } else {
      alert('Failed to create customer');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!bookingData.customer_id || !bookingData.camera_id || !bookingData.start_date || !bookingData.end_date) {
      alert('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    try {
      const booking = await createBooking(bookingData);
      if (booking) {
        alert('Booking created successfully!');
        router.push('/admin/bookings');
      } else {
        alert('Failed to create booking');
      }
    } catch (error) {
      console.error('Error creating booking:', error);
      alert('An error occurred while creating the booking');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Add New Booking</h1>
          <p className="text-gray-600 mt-2">Create a manual booking entry for historical or off-website bookings</p>
        </div>
        <button
          onClick={() => router.push('/admin/bookings')}
          className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          Back to Bookings
        </button>
      </div>

      <div className="max-w-4xl mx-auto">
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
          {/* Customer Selection */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Customer Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer *
                </label>
                <select
                  value={bookingData.customer_id}
                  onChange={(e) => setBookingData(prev => ({ ...prev, customer_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a customer</option>
                  {customers.map(customer => (
                    <option key={customer.id} value={customer.id}>
                      {customer.full_name} - {customer.phone}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                  className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                >
                  {showNewCustomerForm ? 'Cancel' : 'Add New Customer'}
                </button>
              </div>
            </div>

            {/* New Customer Form */}
            {showNewCustomerForm && (
              <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">New Customer Details</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input
                      type="text"
                      value={newCustomer.full_name}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, full_name: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                    <input
                      type="email"
                      value={newCustomer.email}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input
                      type="tel"
                      value={newCustomer.phone}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                    <input
                      type="tel"
                      value={newCustomer.whatsapp}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea
                      value={newCustomer.address}
                      onChange={(e) => setNewCustomer(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      rows={2}
                    />
                  </div>
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleCreateCustomer}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                  >
                    Create Customer
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Booking Details */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Booking Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Camera *</label>
                <select
                  value={bookingData.camera_id}
                  onChange={(e) => setBookingData(prev => ({ ...prev, camera_id: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="">Select a camera</option>
                  {cameras.map(camera => (
                    <option key={camera.id} value={camera.id}>
                      {camera.name} - RM{camera.daily_rate}/day
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Booking Source *</label>
                <select
                  value={bookingData.booking_source}
                  onChange={(e) => setBookingData(prev => ({ ...prev, booking_source: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="manual">Manual Entry</option>
                  <option value="historical">Historical Record</option>
                  <option value="phone">Phone Call</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="walk-in">Walk-in</option>
                  <option value="website">Website</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Start Date *</label>
                <input
                  type="date"
                  value={bookingData.start_date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, start_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">End Date *</label>
                <input
                  type="date"
                  value={bookingData.end_date}
                  onChange={(e) => setBookingData(prev => ({ ...prev, end_date: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  value={bookingData.status}
                  onChange={(e) => setBookingData(prev => ({ ...prev, status: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Pickup Method</label>
                <select
                  value={bookingData.pickup_method}
                  onChange={(e) => setBookingData(prev => ({ ...prev, pickup_method: e.target.value as any }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pickup">Pickup</option>
                  <option value="delivery">Delivery</option>
                </select>
              </div>
            </div>

            {bookingData.pickup_method === 'delivery' && (
              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Address</label>
                  <textarea
                    value={bookingData.pickup_address}
                    onChange={(e) => setBookingData(prev => ({ ...prev, pickup_address: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Delivery Fee (RM)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={bookingData.delivery_fee}
                    onChange={(e) => setBookingData(prev => ({ ...prev, delivery_fee: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Payment Information */}
          <div className="mb-8">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Payment Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Days</label>
                <input
                  type="number"
                  value={bookingData.total_days}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Daily Rate (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bookingData.daily_rate}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bookingData.total_amount}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Amount (RM)</label>
                <input
                  type="number"
                  step="0.01"
                  value={bookingData.deposit_amount}
                  readOnly
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50"
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="deposit_paid"
                  checked={bookingData.deposit_paid}
                  onChange={(e) => setBookingData(prev => ({ ...prev, deposit_paid: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="deposit_paid" className="ml-2 text-sm font-medium text-gray-700">
                  Deposit Paid
                </label>
              </div>
              {bookingData.deposit_paid && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Deposit Paid Date</label>
                  <input
                    type="date"
                    value={bookingData.deposit_paid_date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, deposit_paid_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="final_payment_paid"
                  checked={bookingData.final_payment_paid}
                  onChange={(e) => setBookingData(prev => ({ ...prev, final_payment_paid: e.target.checked }))}
                  className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="final_payment_paid" className="ml-2 text-sm font-medium text-gray-700">
                  Final Payment Paid
                </label>
              </div>
              {bookingData.final_payment_paid && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Final Payment Date</label>
                  <input
                    type="date"
                    value={bookingData.final_payment_paid_date}
                    onChange={(e) => setBookingData(prev => ({ ...prev, final_payment_paid_date: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
            <textarea
              value={bookingData.notes}
              onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              rows={3}
              placeholder="Any additional notes about this booking..."
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Creating Booking...
                </>
              ) : (
                'Create Booking'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
