'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import {
  Activity,
  ArrowLeft,
  Calendar,
  Camera as CameraIcon,
  Edit3,
  MessageCircle,
  Package,
  ShieldCheck,
  TrendingUp,
  Wrench,
} from 'lucide-react';
import { getCameraById, getBookingsByCameraId } from '@/lib/api/bookings';
import type { Camera, Booking } from '@/lib/supabase';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import { getDiscountThreshold, getExtendedDailyRate } from '@/lib/cameraPricing';

const shellCardClass =
  'rounded-[28px] border border-[#2c2722] bg-[#171411] shadow-[0_24px_55px_rgba(0,0,0,0.28)]';
const sectionCardClass = 'rounded-[24px] border border-[#2b2520] bg-[#14110f]';
const subtleLabelClass = 'text-[11px] uppercase tracking-[0.24em] text-stone-500';

export default function CameraDetailsPage() {
  const params = useParams();
  const cameraId = params.id as string;

  const [camera, setCamera] = useState<Camera | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadCameraData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [cameraData, cameraBookings] = await Promise.all([
        getCameraById(cameraId),
        getBookingsByCameraId(cameraId),
      ]);

      if (cameraData) {
        setCamera(cameraData);
        setBookings(cameraBookings);
      }
    } catch (error) {
      console.error('Error loading camera data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [cameraId]);

  useEffect(() => {
    void loadCameraData();
  }, [loadCameraData]);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-[#c96b2c]" />
      </div>
    );
  }

  if (!camera) {
    return (
      <div className="py-12 text-center">
        <h1 className="mb-4 text-2xl font-bold text-stone-100">Camera Not Found</h1>
        <Link href="/admin/cameras" className="text-orange-300 transition-colors hover:text-orange-200">
          Back to Cameras
        </Link>
      </div>
    );
  }

  const cameraBookings = bookings.filter((booking) => booking.camera_id === camera.id);
  const activeBooking = cameraBookings.find((booking) => booking.status === 'active');
  const upcomingBookings = cameraBookings.filter((booking) => booking.status === 'confirmed');
  const completedBookings = cameraBookings.filter((booking) => booking.status === 'completed');

  const updateCameraAvailability = (isAvailable: boolean) => {
    setCamera((prev) => (prev ? { ...prev, is_available: isAvailable } : null));
  };

  const updateCameraStatus = (newStatus: Camera['status']) => {
    setCamera((prev) => (prev ? { ...prev, status: newStatus } : null));
    updateCameraAvailability(newStatus === 'available');
  };

  const updateCameraCondition = (newCondition: Camera['condition']) => {
    setCamera((prev) => (prev ? { ...prev, condition: newCondition } : null));
  };

  const totalRevenue = completedBookings
    .filter((booking) => booking.deposit_paid && booking.final_payment_paid)
    .reduce((sum, booking) => sum + (booking.final_payment_amount || booking.total_amount), 0);

  const averageRentalDays =
    completedBookings.length > 0
      ? Math.round(
          completedBookings.reduce((sum, booking) => sum + booking.total_days, 0) / completedBookings.length
        )
      : 0;

  const revenuePerRental = cameraBookings.length > 0 ? Math.round(totalRevenue / cameraBookings.length) : 0;

  const getBookingTone = (status: Booking['booking_status']) => {
    switch (status) {
      case 'confirmed':
        return 'border-[#30412f] bg-[#1f2b20] text-emerald-200';
      case 'completed':
        return 'border-[#31414f] bg-[#1c242c] text-sky-200';
      case 'pending_approval':
        return 'border-[#4b3723] bg-[#2b2117] text-orange-200';
      case 'cancelled':
      case 'rejected':
        return 'border-[#503130] bg-[#2a1b1a] text-rose-200';
      default:
        return 'border-[#3a3129] bg-[#221f1b] text-stone-300';
    }
  };

  const getConditionTone = (condition?: Camera['condition']) => {
    switch (condition) {
      case 'excellent':
        return 'border-[#30412f] bg-[#1f2b20] text-emerald-200';
      case 'good':
        return 'border-[#31414f] bg-[#1c242c] text-sky-200';
      case 'fair':
        return 'border-[#4b3723] bg-[#2b2117] text-orange-200';
      default:
        return 'border-[#503130] bg-[#2a1b1a] text-rose-200';
    }
  };

  return (
    <div className="space-y-6 px-2 pb-8 xl:px-0">
      <div className={`${shellCardClass} bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.14),_transparent_38%),linear-gradient(180deg,#1c1713_0%,#141210_100%)] p-6 md:p-7`}>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-4">
            <Link
              href="/admin/cameras"
              className="inline-flex items-center gap-2 rounded-full border border-[#3a3129] bg-[#191613] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-300 transition-colors hover:border-[#5b4a3d] hover:text-stone-100"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to Fleet
            </Link>

            <div className="space-y-2">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-300">Camera Profile</p>
              <h1 className="text-3xl font-semibold tracking-tight text-stone-50">{camera.name}</h1>
              <p className="text-sm text-stone-400">
                {camera.brand || 'No brand'} · {camera.model || 'No model'} · ID {camera.id}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${camera.is_available ? 'border-[#30412f] bg-[#1f2b20] text-emerald-200' : 'border-[#503130] bg-[#2a1b1a] text-rose-200'}`}>
                {camera.is_available ? 'Available' : 'Unavailable'}
              </span>
              {camera.condition && (
                <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getConditionTone(camera.condition)}`}>
                  {camera.condition.replace('_', ' ')}
                </span>
              )}
              <span className="rounded-full border border-[#3a3129] bg-[#1a1714] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-stone-300">
                {camera.type}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href={`/admin/cameras/${camera.id}/edit`}
              className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#c96b2c] px-5 text-sm font-semibold text-black transition-colors hover:bg-[#d97a39]"
            >
              <Edit3 className="h-4 w-4" />
              Edit Camera
            </Link>
            <Link
              href="/admin/reports"
              className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#3a3129] bg-[#171411] px-5 text-sm font-semibold text-stone-200 transition-colors hover:bg-[#221d18]"
            >
              <TrendingUp className="h-4 w-4" />
              View Reports
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1.7fr)_360px]">
        <div className="space-y-6">
          <div className={`${shellCardClass} p-6`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#241b14] text-orange-300">
                <CameraIcon className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-stone-50">Camera Details</h2>
                <p className="text-sm text-stone-400">Core inventory, pricing, and storage information.</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {[
                { label: 'Camera Name', value: camera.name, tone: 'text-stone-50' },
                { label: 'Brand', value: camera.brand || 'Not set', tone: 'text-stone-100' },
                { label: 'Model', value: camera.model || 'Not set', tone: 'text-stone-100' },
                { label: 'Daily Rate', value: `RM${camera.daily_rate}`, tone: 'text-emerald-300' },
                { label: 'Rate After Threshold', value: `RM${getExtendedDailyRate(camera)}/day`, tone: 'text-emerald-300' },
                { label: 'Discount Starts At', value: `${getDiscountThreshold(camera)} days`, tone: 'text-stone-50' },
                { label: 'Deposit Amount', value: `RM${camera.deposit_amount}`, tone: 'text-sky-300' },
                { label: 'Location', value: camera.location || 'Main storage', tone: 'text-stone-100' },
                { label: 'Fleet Revenue', value: `RM${totalRevenue}`, tone: 'text-orange-300' },
              ].map((item) => (
                <div key={item.label} className={`${sectionCardClass} p-4`}>
                  <p className={subtleLabelClass}>{item.label}</p>
                  <p className={`mt-2 text-xl font-semibold ${item.tone}`}>{item.value}</p>
                </div>
              ))}
            </div>

            {(camera.description || camera.notes) && (
              <div className="mt-5 grid gap-4 lg:grid-cols-2">
                <div className={`${sectionCardClass} p-4`}>
                  <p className={subtleLabelClass}>Description</p>
                  <p className="mt-3 text-sm leading-6 text-stone-300">{camera.description || 'No description added yet.'}</p>
                </div>
                <div className={`${sectionCardClass} p-4`}>
                  <p className={subtleLabelClass}>Notes</p>
                  <p className="mt-3 text-sm leading-6 text-stone-300">{camera.notes || 'No internal notes yet.'}</p>
                </div>
              </div>
            )}
          </div>

          {activeBooking && (
            <div className="rounded-[28px] border border-[#31414f] bg-[#1b232b] p-6 shadow-[0_24px_55px_rgba(0,0,0,0.24)]">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1d2933] text-sky-200">
                  <Package className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-stone-50">Currently Rented</h2>
                  <p className="text-sm text-sky-200">Live rental snapshot for this unit.</p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <div className={`${sectionCardClass} border-[#31414f] bg-[#141b22] p-4`}>
                  <p className={subtleLabelClass}>Customer</p>
                  <p className="mt-2 text-lg font-semibold text-stone-50">{activeBooking.customer?.full_name || 'N/A'}</p>
                  <p className="mt-1 text-sm text-sky-200">{activeBooking.customer?.phone || 'N/A'}</p>
                </div>
                <div className={`${sectionCardClass} border-[#31414f] bg-[#141b22] p-4`}>
                  <p className={subtleLabelClass}>Return Date</p>
                  <p className="mt-2 text-lg font-semibold text-stone-50">{new Date(activeBooking.end_date).toLocaleDateString()}</p>
                  <p className="mt-1 text-sm text-sky-200">By 8:00 PM</p>
                </div>
                <div className={`${sectionCardClass} border-[#31414f] bg-[#141b22] p-4`}>
                  <p className={subtleLabelClass}>Rental Period</p>
                  <p className="mt-2 text-lg font-semibold text-stone-50">{activeBooking.total_days} days</p>
                </div>
                <div className={`${sectionCardClass} border-[#31414f] bg-[#141b22] p-4`}>
                  <p className={subtleLabelClass}>Total Amount</p>
                  <p className="mt-2 text-lg font-semibold text-emerald-300">RM{activeBooking.total_amount}</p>
                </div>
              </div>

              <div className="mt-5 flex flex-wrap gap-3">
                <Link
                  href={`/admin/bookings/${activeBooking.id}`}
                  className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#f3efe8] px-5 text-sm font-semibold text-[#11100f] transition-colors hover:bg-white"
                >
                  <Calendar className="h-4 w-4" />
                  View Booking
                </Link>
                <a
                  href={`https://wa.me/${formatPhoneWithCountryCode(activeBooking.customer?.phone || '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex h-11 items-center gap-2 rounded-2xl border border-[#335239] bg-[#1d2e21] px-5 text-sm font-semibold text-emerald-200 transition-colors hover:border-[#58a16a]"
                >
                  <MessageCircle className="h-4 w-4" />
                  Contact Customer
                </a>
              </div>
            </div>
          )}

          {upcomingBookings.length > 0 && (
            <div className={`${shellCardClass} p-6`}>
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#241b14] text-orange-300">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-stone-50">Upcoming Bookings</h2>
                  <p className="text-sm text-stone-400">Next confirmed rentals waiting for this unit.</p>
                </div>
              </div>

              <div className="space-y-4">
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className={`${sectionCardClass} p-4`}>
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <h4 className="font-medium text-stone-100">{booking.customer?.full_name || 'N/A'}</h4>
                      <span className="font-mono text-xs text-stone-500">#{booking.id.substring(0, 8)}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
                      <div>
                        <p className={subtleLabelClass}>Start Date</p>
                        <p className="mt-2 font-medium text-stone-100">{new Date(booking.start_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className={subtleLabelClass}>End Date</p>
                        <p className="mt-2 font-medium text-stone-100">{new Date(booking.end_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className={subtleLabelClass}>Duration</p>
                        <p className="mt-2 font-medium text-stone-100">{booking.total_days} days</p>
                      </div>
                      <div>
                        <p className={subtleLabelClass}>Amount</p>
                        <p className="mt-2 font-medium text-emerald-300">RM{booking.total_amount}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className={`${shellCardClass} p-6`}>
            <div className="mb-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1d2933] text-sky-300">
                  <Activity className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-stone-50">Rental History</h2>
                  <p className="text-sm text-stone-400">Recent bookings tied to this camera.</p>
                </div>
              </div>
              <div className="rounded-full border border-[#39312a] bg-[#1a1714] px-3 py-1.5 text-sm text-stone-300">
                {cameraBookings.length} bookings
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#181512]">
                  <tr>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Booking</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Customer</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Dates</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Amount</th>
                    <th className="px-4 py-3 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#26211d]">
                  {cameraBookings.slice(0, 10).map((booking) => (
                    <tr key={booking.id} className="transition-colors hover:bg-[#171411]">
                      <td className="px-4 py-3 text-sm">
                        <Link href={`/admin/bookings/${booking.id}`} className="font-mono text-sky-300 transition-colors hover:text-sky-200">
                          {booking.id.slice(0, 8)}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-stone-100">{booking.customer?.full_name || 'N/A'}</td>
                      <td className="px-4 py-3 text-sm text-stone-300">
                        {new Date(booking.start_date).toLocaleDateString()} to {new Date(booking.end_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm font-medium text-emerald-300">RM{booking.total_amount}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.14em] ${getBookingTone(booking.booking_status)}`}>
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

        <div className="space-y-6">
          <div className={`${shellCardClass} p-6`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1f2b20] text-emerald-300">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-stone-50">Performance</h2>
                <p className="text-sm text-stone-400">Revenue and booking signal for this unit.</p>
              </div>
            </div>

            <div className="grid gap-3">
              {[
                { label: 'Total Revenue', value: `RM${totalRevenue}`, tone: 'text-emerald-300' },
                { label: 'Total Bookings', value: `${cameraBookings.length}`, tone: 'text-sky-300' },
                { label: 'Avg Rental Days', value: `${averageRentalDays}`, tone: 'text-orange-300' },
                { label: 'Revenue per Rental', value: `RM${revenuePerRental}`, tone: 'text-stone-50' },
              ].map((stat) => (
                <div key={stat.label} className={`${sectionCardClass} p-4`}>
                  <p className={subtleLabelClass}>{stat.label}</p>
                  <p className={`mt-2 text-2xl font-semibold ${stat.tone}`}>{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          <div className={`${shellCardClass} p-6`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#241b14] text-orange-300">
                <Wrench className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-stone-50">Management</h2>
                <p className="text-sm text-stone-400">Local status controls for quick review.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className={`${subtleLabelClass} mb-2 block`}>Status</label>
                <select
                  value={camera.status}
                  onChange={(e) => updateCameraStatus(e.target.value as Camera['status'])}
                  className="h-12 w-full rounded-2xl border border-[#322b26] bg-[#11100f] px-4 text-sm font-medium text-stone-100 outline-none focus:border-[#c96b2c]"
                >
                  <option value="available">Available</option>
                  <option value="rented">Rented</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </div>

              <div>
                <label className={`${subtleLabelClass} mb-2 block`}>Condition</label>
                <select
                  value={camera.condition}
                  onChange={(e) => updateCameraCondition(e.target.value as Camera['condition'])}
                  className="h-12 w-full rounded-2xl border border-[#322b26] bg-[#11100f] px-4 text-sm font-medium text-stone-100 outline-none focus:border-[#c96b2c]"
                >
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                  <option value="needs_repair">Needs Repair</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`${shellCardClass} p-6`}>
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#1d2933] text-sky-300">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-stone-50">Quick Actions</h2>
                <p className="text-sm text-stone-400">Jump to the next camera workflow.</p>
              </div>
            </div>

            <div className="space-y-3">
              <Link
                href={`/admin/cameras/${camera.id}/edit`}
                className="flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#c96b2c] px-4 text-sm font-semibold text-black transition-colors hover:bg-[#d97a39]"
              >
                <Edit3 className="h-4 w-4" />
                Edit Camera
              </Link>
              <Link
                href="/admin/bookings/add"
                className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#335239] bg-[#1d2e21] px-4 text-sm font-semibold text-emerald-200 transition-colors hover:border-[#58a16a]"
              >
                <Calendar className="h-4 w-4" />
                Create Booking
              </Link>
              <Link
                href="/admin/reports"
                className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#31414f] bg-[#1c242c] px-4 text-sm font-semibold text-sky-200 transition-colors hover:border-[#6aa4c7]"
              >
                <TrendingUp className="h-4 w-4" />
                View Full Report
              </Link>
              <Link
                href="/admin/cameras"
                className="flex h-11 items-center justify-center gap-2 rounded-2xl border border-[#3a3129] bg-[#171411] px-4 text-sm font-semibold text-stone-200 transition-colors hover:bg-[#221d18]"
              >
                <Package className="h-4 w-4" />
                Back to Inventory
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
