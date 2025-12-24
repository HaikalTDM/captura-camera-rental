'use client';

import { useState, useMemo, memo } from 'react';
import { useAdminData } from '@/contexts/AdminDataContext';
import type { Camera } from '@/lib/supabase';
import Link from 'next/link';
import { CamerasGridSkeleton } from '@/components/admin/SkeletonLoaders';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileCameras from '@/components/admin/MobileCameras';
import {
  Camera as CameraIcon,
  CheckCircle,
  Wrench,
  Calendar,
  Eye,
  Edit,
  TrendingUp,
  Plus
} from 'lucide-react';

// Memoized camera card component
const CameraCard = memo(({ camera, metrics, getCameraRentalInfo, getStatusColor, getStatusText }: any) => {
  const rentalInfo = getCameraRentalInfo(camera.id);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 mb-1">{camera.name}</h3>
          <p className="text-slate-600 font-medium mb-1">{camera.model}</p>
          <p className="text-xs text-slate-400 font-mono">ID: {camera.id.slice(0, 8)}...</p>
        </div>
        <div className="flex flex-col gap-2">
          <span className={`px-3 py-1.5 rounded-lg text-xs font-semibold ${getStatusColor(camera.is_available, camera.available_quantity)}`}>
            {getStatusText(camera.is_available, camera.available_quantity, camera.total_quantity)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Daily Rate</p>
          <p className="text-2xl font-bold text-slate-900">RM{camera.daily_rate}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Quantity</p>
          <p className="text-2xl font-bold text-slate-900">{camera.available_quantity}/{camera.total_quantity}</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Last Maintenance</p>
          <p className="text-sm font-medium text-slate-900">
            {camera.last_maintenance
              ? new Date(camera.last_maintenance).toLocaleDateString()
              : 'No records'
            }
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-100">
          <p className="text-xs font-semibold text-green-600 uppercase tracking-wide mb-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Revenue
          </p>
          <p className="text-2xl font-bold text-green-600">RM{metrics.totalRevenue}</p>
        </div>
      </div>

      {rentalInfo && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-4">
          <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-2">Currently Rented</p>
          <p className="text-sm font-medium text-blue-900">{rentalInfo.customerName}</p>
          <p className="text-xs text-blue-600 mt-1">Return: {rentalInfo.endDate}</p>
        </div>
      )}

      <div className="flex gap-3">
        <Link
          href={`/admin/cameras/${camera.id}`}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:scale-[1.02] text-center flex items-center justify-center gap-2"
        >
          <Eye className="w-4 h-4" />
          Details
        </Link>
        <Link
          href={`/admin/cameras/${camera.id}/edit`}
          className="flex-1 bg-slate-600 hover:bg-slate-700 text-white px-4 py-3 rounded-xl text-sm font-semibold transition-all hover:shadow-lg hover:scale-[1.02] text-center flex items-center justify-center gap-2"
        >
          <Edit className="w-4 h-4" />
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
  const isMobile = useIsMobile(768); // Detect mobile viewport < 768px

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
      return 'bg-red-100 text-red-700 border border-red-200';
    }
    if (availableQuantity === 0) {
      return 'bg-blue-100 text-blue-700 border border-blue-200';
    }
    return 'bg-green-100 text-green-700 border border-green-200';
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

  // 📱 MOBILE: Return compact cameras layout
  if (isMobile) {
    return (
      <MobileCameras
        cameras={cameras}
        bookings={bookings}
        statusCounts={statusCounts}
        cameraMetrics={cameraMetrics}
        getCameraRentalInfo={getCameraRentalInfo}
      />
    );
  }

  // 🖥️ DESKTOP: Return original layout
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="max-w-7xl mx-auto p-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Camera Inventory</h1>
            <p className="text-slate-600 text-lg">Manage your camera equipment and availability</p>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/mobile/cameras"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-xl font-bold transition-all hover:shadow-lg hover:scale-105 flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add Camera
            </Link>
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 px-6 py-4">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Cameras</p>
              <p className="text-3xl font-bold text-slate-900">{cameras.length}</p>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Available</p>
                <p className="text-3xl font-bold text-green-600">{statusCounts.available}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Rented</p>
                <p className="text-3xl font-bold text-blue-600">{statusCounts.rented}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <CameraIcon className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Maintenance</p>
                <p className="text-3xl font-bold text-amber-600">{statusCounts.maintenance}</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Wrench className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Reserved</p>
                <p className="text-3xl font-bold text-purple-600">{statusCounts.reserved}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-purple-600" />
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
    </div>
  );
}
