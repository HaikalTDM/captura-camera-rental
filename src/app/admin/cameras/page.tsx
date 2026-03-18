'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAdminData } from '@/contexts/AdminDataContext';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileCameras from '@/components/admin/MobileCameras';
import {
  Camera as CameraIcon,
  CheckCircle,
  ChevronRight,
  Edit,
  Eye,
  Plus,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

function getStatusBadgeClasses(isAvailable: boolean, availableQuantity: number) {
  if (!isAvailable) {
    return 'border-[#503130] bg-[#2a1b1a] text-rose-200';
  }

  if (availableQuantity === 0) {
    return 'border-[#31414f] bg-[#1c242c] text-sky-200';
  }

  return 'border-[#30412f] bg-[#1f2b20] text-emerald-200';
}

function getStatusText(isAvailable: boolean, availableQuantity: number, totalQuantity: number) {
  if (!isAvailable) return 'Unavailable';
  if (availableQuantity === 0) return 'All Rented';
  if (availableQuantity < totalQuantity) return `${availableQuantity}/${totalQuantity} Available`;
  return 'Available';
}

export default function CamerasPage() {
  const { cameras, bookings, isLoading } = useAdminData();
  const isMobile = useIsMobile(768);

  const getCameraRentalInfo = useMemo(() => {
    return (cameraId: string) => {
      return bookings.find((booking) => booking.camera_id === cameraId && booking.status === 'active');
    };
  }, [bookings]);

  const cameraMetrics = useMemo(() => {
    const metricsMap = new Map<
      string,
      { totalRentals: number; totalRevenue: number; lastBooking: number | null }
    >();

    cameras.forEach((camera) => {
      const cameraBookings = bookings.filter((booking) => booking.camera_id === camera.id);
      const paidBookings = cameraBookings.filter((booking) => booking.deposit_paid && booking.final_payment_paid);

      const totalRevenue = paidBookings.reduce((sum, booking) => {
        const isNewPaymentSystem = booking.deposit_amount === 100;
        return sum + (isNewPaymentSystem ? booking.final_payment_amount : booking.total_amount - booking.deposit_amount);
      }, 0);

      metricsMap.set(camera.id, {
        totalRentals: paidBookings.length,
        totalRevenue,
        lastBooking:
          cameraBookings.length > 0
            ? Math.max(...cameraBookings.map((booking) => new Date(booking.created_at).getTime()))
            : null,
      });
    });

    return metricsMap;
  }, [cameras, bookings]);

  const statusCounts = useMemo(() => {
    const rentedCameras = new Set(
      bookings
        .filter(
          (booking) =>
            booking.equipment_picked_up &&
            !booking.equipment_returned &&
            (booking.booking_status === 'confirmed' || booking.status === 'active')
        )
        .map((booking) => booking.camera_id)
    );

    const availableCameras = cameras.filter(
      (camera) => !rentedCameras.has(camera.id) && camera.is_available && camera.available_quantity > 0
    );

    const allRentedCameras = cameras.filter((camera) => rentedCameras.has(camera.id));
    const maintenanceCameras = cameras.filter((camera) => !camera.is_available && !rentedCameras.has(camera.id));

    return {
      available: availableCameras.length,
      rented: allRentedCameras.length,
      maintenance: maintenanceCameras.length,
      reserved: 0,
    };
  }, [cameras, bookings]);

  const totalRevenue = useMemo(() => {
    return Array.from(cameraMetrics.values()).reduce((sum, metric) => sum + metric.totalRevenue, 0);
  }, [cameraMetrics]);

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

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#c96b2c]"></div>
          <p className="mt-4 text-stone-500">Loading camera inventory...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 px-2 pb-8 xl:px-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_340px]"
      >
        <Card className="rounded-[30px] border border-[#2d2722] bg-[radial-gradient(circle_at_top,_rgba(201,107,44,0.12),_transparent_42%),linear-gradient(180deg,#1c1713_0%,#141210_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
          <CardContent className="p-6 md:p-7">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center gap-2 rounded-full border border-[#43372d] bg-[#1d1814] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
                  <CameraIcon className="h-3.5 w-3.5 text-orange-300" />
                  Fleet control
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-stone-50">Camera Inventory</h1>
                  <p className="max-w-2xl text-sm leading-6 text-stone-400">
                    Track live availability, maintenance, and revenue by camera without leaving the main admin workflow.
                  </p>
                </div>
              </div>

              <Button
                asChild
                className="h-11 gap-2 rounded-xl bg-[#c96b2c] text-black hover:bg-[#d97a39]"
              >
                <Link href="/admin/mobile/cameras">
                  <Plus className="h-4 w-4" />
                  Open Camera Hub
                </Link>
              </Button>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Total cameras</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{cameras.length}</p>
                <p className="mt-2 text-sm text-stone-400">Every camera currently tracked in the rental inventory.</p>
              </div>
              <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Fleet revenue</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">RM{totalRevenue.toFixed(0)}</p>
                <p className="mt-2 text-sm text-stone-400">Revenue captured from fully paid rentals across the fleet.</p>
              </div>
              <div className="rounded-2xl border border-[#3f3125] bg-[#241b14] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Currently rented</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{statusCounts.rented}</p>
                <p className="mt-2 text-sm text-stone-400">Cameras actively out with customers right now.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-[#2d2722] bg-[#171411] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <CardTitle className="text-lg text-stone-50">Inventory Notes</CardTitle>
            <CardDescription className="text-stone-400">
              A quick operating snapshot before you open a camera record.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Available stock</p>
              <p className="mt-2 text-2xl font-semibold text-stone-50">{statusCounts.available}</p>
              <p className="mt-1 text-sm text-stone-400">Ready-to-rent units with inventory available right now.</p>
            </div>
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Maintenance queue</p>
              <p className="mt-2 text-2xl font-semibold text-stone-50">{statusCounts.maintenance}</p>
              <p className="mt-1 text-sm text-stone-400">Units marked unavailable and kept out of the live rental pool.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
      >
        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Available</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{statusCounts.available}</p>
                <p className="mt-1 text-sm text-stone-400">Ready for a new booking.</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f2b20] text-emerald-300">
                <CheckCircle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Rented</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{statusCounts.rented}</p>
                <p className="mt-1 text-sm text-stone-400">Out with customers and not yet returned.</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d2933] text-sky-300">
                <CameraIcon className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#3a2d22] bg-[#1c1511] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Maintenance</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{statusCounts.maintenance}</p>
                <p className="mt-1 text-sm text-stone-400">Unavailable stock held back for service or repair.</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#302219] text-orange-300">
                <Wrench className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Revenue units</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">
                  {Array.from(cameraMetrics.values()).reduce((sum, metric) => sum + metric.totalRentals, 0)}
                </p>
                <p className="mt-1 text-sm text-stone-400">Fully paid rentals contributing to camera revenue.</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#241b14] text-orange-300">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="rounded-[30px] border border-[#2c2722] bg-[#171411] shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <div className="flex items-end justify-between gap-4">
              <div>
                <CardTitle className="text-xl text-stone-50">Fleet Inventory</CardTitle>
                <CardDescription className="mt-1 text-stone-400">
                  Camera-by-camera availability, rental signal, and direct actions.
                </CardDescription>
              </div>
              <div className="rounded-full border border-[#39312a] bg-[#1a1714] px-3 py-1.5 text-sm text-stone-300">
                {cameras.length} cameras tracked
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-5">
            <div className="grid gap-4 lg:grid-cols-2">
              {cameras.map((camera) => {
                const metrics = cameraMetrics.get(camera.id) || {
                  totalRentals: 0,
                  totalRevenue: 0,
                  lastBooking: null,
                };
                const rentalInfo = getCameraRentalInfo(camera.id);

                return (
                  <div
                    key={camera.id}
                    className="rounded-[26px] border border-[#2d2722] bg-[#12100f] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-stone-50">{camera.name}</h3>
                        <p className="text-sm text-stone-400">{camera.model || 'No model listed'}</p>
                        <p className="font-mono text-xs text-stone-500">ID: {camera.id.slice(0, 8)}...</p>
                      </div>
                      <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusBadgeClasses(camera.is_available, camera.available_quantity)}`}>
                        {getStatusText(camera.is_available, camera.available_quantity, camera.total_quantity)}
                      </span>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-2">
                      <div className="rounded-2xl border border-[#2b2520] bg-[#171411] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Daily rate</p>
                        <p className="mt-2 text-2xl font-semibold text-stone-50">RM{camera.daily_rate}</p>
                      </div>
                      <div className="rounded-2xl border border-[#2b2520] bg-[#171411] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Stock</p>
                        <p className="mt-2 text-2xl font-semibold text-stone-50">
                          {camera.available_quantity}/{camera.total_quantity}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#2b2520] bg-[#171411] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Last maintenance</p>
                        <p className="mt-2 text-sm font-medium text-stone-100">
                          {camera.last_maintenance
                            ? new Date(camera.last_maintenance).toLocaleDateString()
                            : 'No records'}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-[#3a2d22] bg-[#1c1511] p-4">
                        <p className="flex items-center gap-1 text-[11px] uppercase tracking-[0.18em] text-orange-300">
                          <TrendingUp className="h-3.5 w-3.5" />
                          Revenue
                        </p>
                        <p className="mt-2 text-2xl font-semibold text-stone-50">RM{metrics.totalRevenue}</p>
                        <p className="mt-1 text-sm text-stone-400">{metrics.totalRentals} fully paid rentals</p>
                      </div>
                    </div>

                    {rentalInfo && (
                      <div className="mt-4 rounded-2xl border border-[#31414f] bg-[#1b232b] p-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-sky-200">Currently rented</p>
                        <p className="mt-2 text-sm font-medium text-stone-50">
                          {rentalInfo.customer?.full_name || 'Customer unavailable'}
                        </p>
                        <p className="mt-1 text-xs text-sky-200">
                          Return: {new Date(rentalInfo.end_date).toLocaleDateString()}
                        </p>
                      </div>
                    )}

                    <div className="mt-5 flex gap-3">
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1 h-11 rounded-2xl border-[#3a3129] bg-[#171411] text-stone-200 hover:bg-[#221d18]"
                      >
                        <Link href={`/admin/cameras/${camera.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="flex-1 h-11 rounded-2xl border-[#3a3129] bg-[#171411] text-stone-200 hover:bg-[#221d18]"
                      >
                        <Link href={`/admin/cameras/${camera.id}/edit`}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </Link>
                      </Button>
                    </div>

                    <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
                      <span>
                        Last booking:{' '}
                        {metrics.lastBooking ? new Date(metrics.lastBooking).toLocaleDateString() : 'No completed rentals yet'}
                      </span>
                      <ChevronRight className="h-4 w-4 text-stone-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
