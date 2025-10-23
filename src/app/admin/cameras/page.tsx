'use client';

import { useState, useMemo, memo } from 'react';
import { useAdminData } from '@/contexts/AdminDataContext';
import type { Camera } from '@/lib/supabase';
import Link from 'next/link';
import { CamerasGridSkeleton } from '@/components/admin/SkeletonLoaders';

// Memoized camera card component
const CameraCard = memo(({ camera, metrics, getCameraRentalInfo, getStatusColor, getStatusText }: any) => {
  const rentalInfo = getCameraRentalInfo(camera.id);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{camera.name}</h3>
          <p className="text-gray-700">{camera.model}</p>
          <p className="text-sm text-gray-600">ID: {camera.id}</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className={`px-3 py-1 rounded-lg text-sm font-medium border ${getStatusColor(camera.is_available, camera.available_quantity)}`}>
            {getStatusText(camera.is_available, camera.available_quantity, camera.total_quantity)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-sm text-gray-500">Daily Rate</p>
          <p className="text-lg font-semibold text-gray-900">RM{camera.daily_rate}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Quantity</p>
          <p className="text-lg font-semibold text-gray-900">{camera.available_quantity}/{camera.total_quantity}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Last Maintenance</p>
          <p className="text-sm text-gray-900">
            {camera.last_maintenance
              ? new Date(camera.last_maintenance).toLocaleDateString()
              : 'No records'
            }
          </p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-lg font-semibold text-green-600">RM{metrics.totalRevenue}</p>
        </div>
      </div>

      {rentalInfo && (
        <div className="bg-blue-50 rounded-lg p-4 mb-4">
          <p className="text-sm font-medium text-blue-900">Currently rented by:</p>
          <p className="text-blue-800">{rentalInfo.customerName}</p>
          <p className="text-sm text-blue-600">Return: {rentalInfo.endDate}</p>
        </div>
      )}

      <div className="flex gap-2">
        <Link
          href={`/admin/cameras/${camera.id}`}
          className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm transition-colors text-center"
        >
          Details
        </Link>
        <Link
          href={`/admin/cameras/${camera.id}/edit`}
          className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm transition-colors text-center"
        >
          Edit
        </Link>
      </div>
    </div>
  );
});

CameraCard.displayName = 'CameraCard';

export default function CamerasPage() {
  const { cameras, bookings, isLoading, mutateCameras } = useAdminData();
  const [showAddForm, setShowAddForm] = useState(false);

  // Memoize camera rental info lookup
  const getCameraRentalInfo = useMemo(() => {
    return (cameraId: string) => {
      const activeBooking = bookings.find(
        booking => booking.camera_id === cameraId && booking.status === 'active'
      );
      return activeBooking;
    };
  }, [bookings]);

  // Memoize camera metrics calculations
  const cameraMetrics = useMemo(() => {
    const metricsMap = new Map();
    
    cameras.forEach(camera => {
      const cameraBookings = bookings.filter(b => b.camera_id === camera.id);
      const paidBookings = cameraBookings.filter(b => b.deposit_paid && b.final_payment_paid);

      const totalRevenue = paidBookings.reduce((sum, b) => {
        const isNewPaymentSystem = b.deposit_amount === 100;
        return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
      }, 0);

      metricsMap.set(camera.id, {
        totalRentals: paidBookings.length,
        totalRevenue: totalRevenue,
        lastBooking: cameraBookings.length > 0
          ? Math.max(...cameraBookings.map(b => new Date(b.created_at).getTime()))
          : null
      });
    });

    return metricsMap;
  }, [cameras, bookings]);

  // Memoize status counts
  const statusCounts = useMemo(() => ({
    available: cameras.filter(c => c.status === 'available').length,
    rented: cameras.filter(c => c.status === 'rented').length,
    maintenance: cameras.filter(c => c.status === 'maintenance').length,
    reserved: cameras.filter(c => c.status === 'reserved').length,
  }), [cameras]);

  const getStatusColor = (isAvailable: boolean, availableQuantity: number) => {
    if (!isAvailable) {
      return 'bg-red-100 text-red-800 border-red-200';
    }
    if (availableQuantity === 0) {
      return 'bg-blue-100 text-blue-800 border-blue-200';
    }
    return 'bg-green-100 text-green-800 border-green-200';
  };

  const getStatusText = (isAvailable: boolean, availableQuantity: number, totalQuantity: number) => {
    if (!isAvailable) return 'Unavailable';
    if (availableQuantity === 0) return 'All Rented';
    if (availableQuantity < totalQuantity) return `${availableQuantity}/${totalQuantity} Available`;
    return 'Available';
  };

  // REMOVED: Don't block rendering
  // if (isLoading) {
  //   return <CamerasGridSkeleton />;
  // }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Camera Inventory</h1>
            <p className="text-blue-100 text-lg">Manage your camera equipment and availability</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-sm">Total Cameras</p>
            <p className="text-2xl font-bold">{cameras.length}</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Available</p>
              <p className="text-3xl font-bold text-green-600 mt-2">{statusCounts.available}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✅</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Rented</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{statusCounts.rented}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📷</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Maintenance</p>
              <p className="text-3xl font-bold text-yellow-600 mt-2">{statusCounts.maintenance}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🔧</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Reserved</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{statusCounts.reserved}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>
          </div>
        </div>
      </div>

      {/* Cameras Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {cameras.map((camera) => {
          const metrics = cameraMetrics.get(camera.id) || { totalRentals: 0, totalRevenue: 0, lastBooking: null };
          
          return (
            <CameraCard
              key={camera.id}
              camera={camera}
              metrics={metrics}
              getCameraRentalInfo={getCameraRentalInfo}
              getStatusColor={getStatusColor}
              getStatusText={getStatusText}
            />
          );
        })}
      </div>
    </div>
  );
}
