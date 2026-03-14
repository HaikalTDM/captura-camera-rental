'use client';

import { useMemo, useEffect } from 'react';
import { useAdminData } from '@/contexts/AdminDataContext';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Camera,
  Package,
  PackageOpen,
  DollarSign,
  TrendingUp,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import UpcomingPickupsSection from '@/components/admin/UpcomingPickupsSection';
import UpcomingReturnsSection from '@/components/admin/UpcomingReturnsSection';
import PushNotificationToggle from '@/components/admin/PushNotificationToggle';
import ScrapeHubButton from '@/components/admin/ScrapeHubButton';
import { DashboardSkeleton } from '@/components/admin/SkeletonLoaders';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileDashboard from '@/components/admin/MobileDashboard';
import CameraRevenueBreakdown from '@/components/admin/CameraRevenueBreakdown';

export default function AdminDashboard() {
  const { bookings, cameras, stats, mutate } = useAdminData();
  const isMobile = useIsMobile(768); // Detect mobile viewport < 768px

  // Debug navigation - log on every render
  console.log('Dashboard render:', {
    bookingsCount: bookings.length,
    camerasCount: cameras.length,
    hasStats: !!stats,
    isMobile
  });

  // Memoize expensive computations
  const dashboardData = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];

    // Use all bookings for dashboard stats
    const capturaBookings = bookings;

    // Today's pickups
    const todayPickups = capturaBookings.filter(b => {
      if (b.pickup_date) {
        return b.pickup_date === today &&
          b.booking_status === 'confirmed' &&
          !b.equipment_picked_up;
      }
      const startDate = new Date(b.start_date);
      const pickupDate = new Date(startDate);
      pickupDate.setDate(pickupDate.getDate() - 1);
      const calculatedPickupDate = pickupDate.toISOString().split('T')[0];

      return calculatedPickupDate === today &&
        b.booking_status === 'confirmed' &&
        !b.equipment_picked_up;
    });

    const activeRentals = capturaBookings.filter(b =>
      b.booking_status === 'confirmed' &&
      b.equipment_picked_up &&
      !b.equipment_returned
    );

    const todayReturns = capturaBookings.filter(b =>
      b.end_date === today &&
      b.equipment_picked_up &&
      !b.equipment_returned
    );

    const recentBookings = capturaBookings.slice(0, 5);
    const pendingApprovals = capturaBookings.filter(b => b.booking_status === 'pending_approval');

    const overduePayments = capturaBookings.filter(b =>
      !b.final_payment_paid &&
      new Date(b.end_date) < new Date() &&
      (b.booking_status === 'completed' || b.status === 'completed')
    );

    // Calculate revenues (excluding Mother's R50)
    const totalRevenue = capturaBookings
      .filter(b => b.deposit_paid && b.final_payment_paid)
      .reduce((sum, b) => {
        const isNewPaymentSystem = b.deposit_amount === 100;
        return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
      }, 0);

    const monthlyRevenue = capturaBookings
      .filter(b =>
        b.deposit_paid &&
        b.final_payment_paid &&
        b.final_payment_paid_date &&
        new Date(b.final_payment_paid_date).getMonth() === new Date().getMonth() &&
        new Date(b.final_payment_paid_date).getFullYear() === new Date().getFullYear()
      )
      .reduce((sum, b) => {
        const isNewPaymentSystem = b.deposit_amount === 100;
        return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
      }, 0);

    return {
      todayPickups,
      activeRentals,
      todayReturns,
      recentBookings,
      pendingApprovals,
      overduePayments,
      totalRevenue,
      monthlyRevenue,
    };
  }, [bookings]);

  // REMOVED: Don't block rendering with loading check
  // Pages should always render with available data
  // if (isLoading) {
  //   return <DashboardSkeleton />;
  // }

  const {
    todayPickups,
    activeRentals,
    todayReturns,
    recentBookings,
    pendingApprovals,
    overduePayments,
    totalRevenue,
    monthlyRevenue,
  } = dashboardData;

  // Generate chart data
  const chartData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (6 - i));
      return date.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayBookings = bookings.filter(b => b.created_at?.split('T')[0] === date);
      const dayRevenue = dayBookings
        .filter(b => b.deposit_paid && b.final_payment_paid)
        .reduce((sum, b) => sum + (b.final_payment_amount || b.total_amount), 0);

      return {
        date: new Date(date).toLocaleDateString('en-MY', { weekday: 'short' }),
        bookings: dayBookings.length,
        revenue: dayRevenue
      };
    });
  }, [bookings]);

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  // 📱 MOBILE: Return Priority Dashboard layout
  if (isMobile) {
    return (
      <div className="p-4">
        <MobileDashboard
          bookings={bookings}
          cameras={cameras}
          onMutate={mutate}
        />
      </div>
    );
  }

  // 🖥️ DESKTOP: Return original layout
  return (
    <div className="space-y-4 sm:space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-0.5 sm:mt-1 text-xs sm:text-sm">
            {new Date().toLocaleDateString('en-MY', {
              weekday: 'long',
              month: 'long',
              day: 'numeric',
              year: 'numeric'
            })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <ScrapeHubButton />
          <PushNotificationToggle />
        </div>
      </motion.div>

      {/* Stats Grid */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4"
      >
        {/* Active Rentals */}
        <motion.div variants={item}>
          <Card className="hover:shadow-md transition-all duration-200 border-slate-200 rounded-lg sm:rounded-xl">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">Active Rentals</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{activeRentals.length}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Currently rented</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Pickups */}
        <motion.div variants={item}>
          <Card className="hover:shadow-md transition-all duration-200 border-slate-200 rounded-lg sm:rounded-xl">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">Today's Pickups</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{todayPickups.length}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Scheduled today</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Today's Returns */}
        <motion.div variants={item}>
          <Card className="hover:shadow-md transition-all duration-200 border-slate-200 rounded-lg sm:rounded-xl">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">Today's Returns</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{todayReturns.length}</p>
                  <p className="text-[10px] sm:text-xs text-slate-500 mt-0.5 sm:mt-1">Due today</p>
                </div>
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <PackageOpen className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div variants={item}>
          <Card className="hover:shadow-md transition-all duration-200 border-slate-200 rounded-lg sm:rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Monthly Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">RM{monthlyRevenue.toFixed(0)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <TrendingUp className="w-3 h-3 text-green-600" />
                    <p className="text-xs text-green-600 font-medium">+12.5%</p>
                  </div>
                </div>
                <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Pending Approvals Alert */}
      {pendingApprovals.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-orange-200 bg-orange-50/50 rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="text-base font-semibold text-slate-900">
                      {pendingApprovals.length} Booking{pendingApprovals.length !== 1 ? 's' : ''} Need Approval
                    </h3>
                    <p className="text-xs text-slate-500">Review and approve pending bookings</p>
                  </div>
                </div>
                <Link href="/admin/booking-approvals">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="bg-orange-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-orange-700 transition-colors flex items-center gap-2"
                  >
                    Review Now
                    <ArrowUpRight className="w-4 h-4" />
                  </motion.button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-slate-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900 font-bold text-base">Revenue Trend</CardTitle>
              <CardDescription className="text-slate-600 text-xs mt-1">Last 7 days revenue performance</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#6366f1"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>

        {/* Bookings Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="border-slate-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900 font-bold text-base">Bookings Overview</CardTitle>
              <CardDescription className="text-slate-600 text-xs mt-1">Daily booking count for the week</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e2e8f0',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                      fontSize: '12px'
                    }}
                  />
                  <Bar dataKey="bookings" fill="#0ea5e9" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Camera Revenue Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="mb-8"
      >
        <CameraRevenueBreakdown
          bookings={bookings}
          cameras={cameras}
          variant="desktop"
        />
      </motion.div>

      {/* Today's Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-full">
        {/* Upcoming Pickups - Enhanced Component */}
        <UpcomingPickupsSection onPickupUpdate={mutate} />

        {/* Upcoming Returns - New Component */}
        <UpcomingReturnsSection onReturnUpdate={mutate} />
      </div>

      {/* Camera Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-slate-200 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-slate-900 font-bold text-base flex items-center gap-2">
              <Camera className="w-5 h-5" />
              Camera Inventory
            </CardTitle>
            <CardDescription className="text-slate-600 text-xs mt-1">Current status of all camera equipment</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cameras.map((camera, index) => (
                <motion.div
                  key={camera.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors border border-slate-100"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-100">
                      <Camera className="w-4 h-4 text-slate-600" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900 text-sm">{camera.name}</p>
                      <p className="text-xs text-slate-600">
                        {camera.is_available
                          ? `${camera.available_quantity}/${camera.total_quantity} available`
                          : 'Currently rented'
                        }
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-slate-700">RM{camera.daily_rate}/day</span>
                    <Badge variant={camera.is_available ? "success" : "secondary"} className="text-xs">
                      {camera.is_available ? 'Available' : 'Rented'}
                    </Badge>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Bookings & Overdue Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Recent Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="border-slate-200 rounded-xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <div>
                <CardTitle className="text-slate-900 font-bold text-base">Recent Bookings</CardTitle>
                <CardDescription className="text-slate-600 text-xs mt-1">Latest booking activity</CardDescription>
              </div>
              <Link href="/admin/bookings">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="text-xs text-slate-600 hover:text-slate-900 font-medium flex items-center gap-1"
                >
                  View All
                  <ArrowUpRight className="w-3 h-3" />
                </motion.button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentBookings.length > 0 ? recentBookings.slice(0, 5).map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.7 + index * 0.05 }}
                    className="flex items-center justify-between p-3 bg-slate-50/50 rounded-lg hover:bg-slate-100/50 transition-colors border border-slate-100"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-slate-900 truncate text-sm">{booking.customer?.full_name}</p>
                      <p className="text-xs text-slate-600 truncate">{booking.camera?.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1.5 ml-4">
                      <Badge
                        variant={
                          booking.booking_status === 'confirmed' ? 'success' :
                            booking.booking_status === 'pending_approval' ? 'warning' :
                              booking.booking_status === 'completed' ? 'info' :
                                booking.booking_status === 'rejected' ? 'destructive' :
                                  'secondary'
                        }
                        className="text-xs"
                      >
                        {booking.booking_status === 'pending_approval' ? 'Pending' : booking.booking_status}
                      </Badge>
                      <span className="text-xs font-medium text-slate-900">RM{booking.total_amount}</span>
                    </div>
                  </motion.div>
                )) : (
                  <p className="text-slate-600 text-center py-8 text-sm">No recent bookings</p>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Overdue Payments */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <Card className="border-red-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-slate-900 font-bold text-base flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-red-600" />
                Overdue Payments
              </CardTitle>
              <CardDescription className="text-slate-600 text-xs mt-1">Bookings requiring payment follow-up</CardDescription>
            </CardHeader>
            <CardContent>
              {overduePayments.length > 0 ? (
                <div className="space-y-2">
                  {overduePayments.map((booking, index) => (
                    <motion.div
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.8 + index * 0.05 }}
                      className="p-3 bg-red-50/50 rounded-lg border border-red-100 hover:border-red-200 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 text-sm">{booking.customer?.full_name}</p>
                          <p className="text-xs text-slate-700">{booking.customer?.phone}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="text-xs font-semibold text-red-600">RM{booking.final_payment_amount}</span>
                            <span className="text-xs text-slate-600">• Due: {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}</span>
                          </div>
                        </div>
                        <Link href={`/admin/bookings/${booking.id}`}>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-xs font-medium hover:bg-red-700 transition-colors"
                          >
                            Follow Up
                          </motion.button>
                        </Link>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
                  <p className="text-slate-600 text-xs">No overdue payments!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
