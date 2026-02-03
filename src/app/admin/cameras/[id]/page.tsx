'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getCameraById, getAllBookings } from '@/lib/api/bookings';
import type { Camera, Booking } from '@/lib/supabase';
import Link from 'next/link';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';

export default function CameraDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const cameraId = params.id as string;

  const [camera, setCamera] = useState<Camera | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCameraData();
  }, [cameraId]);

  const loadCameraData = async () => {
    setIsLoading(true);
    try {
      const [cameraData, allBookings] = await Promise.all([
        getCameraById(cameraId),
        getAllBookings()
      ]);

      if (cameraData) {
        setCamera(cameraData);

        // Filter bookings for this camera
        const cameraBookings = allBookings.filter(b => b.camera_id === cameraId);
        setBookings(cameraBookings);
      }
    } catch (error) {
      console.error('Error loading camera data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!camera) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Camera Not Found</h1>
        <Link href="/admin/cameras" className="text-blue-600 hover:text-blue-800">
          ← Back to Cameras
        </Link>
      </div>
    );
  }

  // Get camera rental history
  const cameraBookings = bookings.filter(b => b.camera_id === camera.id);
  const activeBooking = cameraBookings.find(b => b.status === 'active');
  const upcomingBookings = cameraBookings.filter(b => b.status === 'confirmed');
  const completedBookings = cameraBookings.filter(b => b.status === 'completed');

  const updateCameraAvailability = (isAvailable: boolean) => {
    setCamera(prev => prev ? { ...prev, is_available: isAvailable } : null);
  };

  const updateCameraCondition = (newCondition: Camera['condition']) => {
    setCamera(prev => prev ? { ...prev, condition: newCondition } : null);
  };

  const getStatusColor = (status: Booking['booking_status']) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800 border-green-200';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'pending_approval': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 border-red-200';
      case 'rejected': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getConditionColor = (condition: Camera['condition']) => {
    switch (condition) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'fair': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Calculate total revenue from completed, fully paid bookings
  const totalRevenue = completedBookings
    .filter(b => b.deposit_paid && b.final_payment_paid)
    .reduce((sum, booking) => sum + (booking.final_payment_amount || booking.total_amount), 0);

  const averageRentalDays = completedBookings.length > 0
    ? Math.round(completedBookings.reduce((sum, booking) => sum + booking.total_days, 0) / completedBookings.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/cameras"
            className="text-gray-600 hover:text-gray-900 text-2xl"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{camera.name}</h1>
            <p className="text-gray-600">{camera.model} • ID: {camera.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <Link
            href={`/admin/cameras/${camera.id}/edit`}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Edit Camera
          </Link>
          <span className={`px-4 py-2 rounded-lg text-sm font-medium ${camera.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
            {camera.is_available ? 'AVAILABLE' : 'UNAVAILABLE'}
          </span>
          {camera.condition && (
            <span className={`px-4 py-2 rounded-lg text-sm font-medium ${getConditionColor(camera.condition)}`}>
              {camera.condition.toUpperCase()}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Camera Information */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📷 Camera Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-gray-500">Camera Name</label>
                <p className="text-lg font-semibold text-gray-900">{camera.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Model</label>
                <p className="text-lg text-gray-900">{camera.model}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Daily Rate</label>
                <p className="text-lg font-semibold text-green-600">RM{camera.daily_rate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Weekly Rate</label>
                <p className="text-lg font-semibold text-green-600">RM{camera.weekly_rate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Monthly Rate</label>
                <p className="text-lg font-semibold text-green-600">RM{camera.monthly_rate}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Deposit Amount</label>
                <p className="text-lg font-semibold text-blue-600">RM{camera.deposit_amount}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Revenue</label>
                <p className="text-lg font-semibold text-green-600">RM{totalRevenue}</p>
              </div>
            </div>
          </div>

          {/* Current Rental */}
          {activeBooking && (
            <div className="bg-blue-50 rounded-2xl border border-blue-200 p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                🔵 Currently Rented
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-blue-700">Customer</label>
                  <p className="text-lg font-semibold text-blue-900">{activeBooking.customer?.full_name || 'N/A'}</p>
                  <p className="text-sm text-blue-600">{activeBooking.customer?.phone || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Return Date</label>
                  <p className="text-lg text-blue-900">{new Date(activeBooking.end_date).toLocaleDateString()}</p>
                  <p className="text-sm text-blue-600">by 8:00 PM</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Rental Period</label>
                  <p className="text-lg text-blue-900">{activeBooking.total_days} days</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-blue-700">Total Amount</label>
                  <p className="text-lg font-semibold text-green-600">RM{activeBooking.total_amount}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-3">
                <Link
                  href={`/admin/bookings/${activeBooking.id}`}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  View Booking
                </Link>
                <a
                  href={`https://wa.me/${formatPhoneWithCountryCode(activeBooking.customer?.phone || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Contact Customer
                </a>
              </div>
            </div>
          )}

          {/* Upcoming Bookings */}
          {upcomingBookings.length > 0 && (
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                📅 Upcoming Bookings
              </h3>
              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{booking.customer?.full_name || 'N/A'}</h4>
                      <span className="text-sm text-gray-500">{booking.id.substring(0, 8)}...</span>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Start Date</p>
                        <p className="font-medium">{new Date(booking.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">End Date</p>
                        <p className="font-medium">{new Date(booking.end_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Duration</p>
                        <p className="font-medium">{booking.total_days} days</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Amount</p>
                        <p className="font-medium text-green-600">RM{booking.total_amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Rental History */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📊 Rental History
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Booking</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Customer</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {cameraBookings.slice(0, 10).map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/admin/bookings/${booking.id}`} className="text-blue-600 hover:text-blue-800">
                          {booking.id}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">{booking.customer?.full_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {new Date(booking.start_date).toLocaleDateString()} to {new Date(booking.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-green-600">RM{booking.total_amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.booking_status)}`}>
                          {booking.booking_status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Performance Stats */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              📈 Performance
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Total Revenue</label>
                <p className="text-2xl font-bold text-green-600">RM{totalRevenue}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Total Bookings</label>
                <p className="text-2xl font-bold text-blue-600">{cameraBookings.length}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Avg Rental Days</label>
                <p className="text-2xl font-bold text-purple-600">{averageRentalDays}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Revenue per Rental</label>
                <p className="text-2xl font-bold text-orange-600">
                  RM{cameraBookings.length > 0 ? Math.round(totalRevenue / cameraBookings.length) : 0}
                </p>
              </div>
            </div>
          </div>

          {/* Status Management */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              🔧 Management
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Status</label>
                <select
                  value={camera.status}
                  onChange={(e) => updateCameraStatus(e.target.value as Camera['status'])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="reserved">Reserved</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 block mb-2">Condition</label>
                <select
                  value={camera.condition}
                  onChange={(e) => updateCameraCondition(e.target.value as Camera['condition'])}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-gray-900 bg-white"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              ⚡ Quick Actions
            </h3>
            <div className="space-y-3">
              <button className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-lg transition-colors">
                📅 Schedule Maintenance
              </button>
              <button className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg transition-colors">
                📋 Create Booking
              </button>
              <button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-2 px-4 rounded-lg transition-colors">
                📊 View Full Report
              </button>
              <button className="w-full bg-gray-500 hover:bg-gray-600 text-white py-2 px-4 rounded-lg transition-colors">
                🖨️ Print QR Code
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
