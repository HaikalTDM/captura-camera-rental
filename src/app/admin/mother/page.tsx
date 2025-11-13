'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  Camera,
  DollarSign,
  TrendingUp,
  Calendar,
  Clock,
  CheckCircle2,
  Package,
  Heart,
  ArrowUpRight,
  User,
  Phone
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAllBookings, getAllCameras } from '@/lib/api/bookings';
import { Booking, Camera as CameraType } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MotherDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [motherCamera, setMotherCamera] = useState<CameraType | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [allBookings, allCameras] = await Promise.all([
        getAllBookings(),
        getAllCameras()
      ]);

      // Find Mother's R50 camera
      const r50Mother = allCameras.find(c => c.name === 'Canon R50 - Mother');
      setMotherCamera(r50Mother || null);

      // Filter bookings for Mother's R50 only
      if (r50Mother) {
        const motherBookings = allBookings.filter(b => b.camera_id === r50Mother.id);
        setBookings(motherBookings);
      }
    } catch (error) {
      console.error('Error loading Mother dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics
  const metrics = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    
    // Total revenue (only fully paid bookings, excluding refundable deposits)
    const totalRevenue = bookings
      .filter(b => b.deposit_paid && b.final_payment_paid)
      .reduce((sum, b) => {
        const isNewPaymentSystem = b.deposit_amount === 100;
        return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
      }, 0);

    // Monthly revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = bookings
      .filter(b =>
        b.deposit_paid &&
        b.final_payment_paid &&
        new Date(b.created_at).getMonth() === currentMonth &&
        new Date(b.created_at).getFullYear() === currentYear
      )
      .reduce((sum, b) => {
        const isNewPaymentSystem = b.deposit_amount === 100;
        return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
      }, 0);

    // Active bookings (currently rented)
    const activeBookings = bookings.filter(b =>
      b.booking_status === 'confirmed' &&
      b.equipment_picked_up &&
      !b.equipment_returned
    );

    // Upcoming bookings (next 7 days)
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    const upcomingBookings = bookings.filter(b =>
      b.booking_status === 'confirmed' &&
      !b.equipment_picked_up &&
      new Date(b.start_date) >= new Date(today) &&
      new Date(b.start_date) <= nextWeek
    );

    // Total bookings
    const totalBookings = bookings.length;

    // Average booking value
    const paidBookings = bookings.filter(b => b.deposit_paid && b.final_payment_paid);
    const avgBookingValue = paidBookings.length > 0
      ? totalRevenue / paidBookings.length
      : 0;

    // Utilization rate (days booked this month / days in month)
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const bookedDaysThisMonth = bookings
      .filter(b => {
        const startDate = new Date(b.start_date);
        const endDate = new Date(b.end_date);
        return (startDate.getMonth() === currentMonth && startDate.getFullYear() === currentYear) ||
               (endDate.getMonth() === currentMonth && endDate.getFullYear() === currentYear);
      })
      .reduce((sum, b) => sum + b.total_days, 0);
    const utilizationRate = Math.round((bookedDaysThisMonth / daysInMonth) * 100);

    return {
      totalRevenue,
      monthlyRevenue,
      totalBookings,
      activeBookings,
      upcomingBookings,
      avgBookingValue,
      utilizationRate
    };
  }, [bookings]);

  // Generate monthly revenue chart (last 6 months)
  const chartData = useMemo(() => {
    const months = [];
    const currentDate = new Date();
    
    for (let i = 5; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const monthStr = date.toISOString().slice(0, 7); // YYYY-MM
      
      const monthBookings = bookings.filter(b =>
        b.created_at.startsWith(monthStr) &&
        b.deposit_paid &&
        b.final_payment_paid
      );
      
      const revenue = monthBookings.reduce((sum, b) => {
        const isNewPaymentSystem = b.deposit_amount === 100;
        return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
      }, 0);
      
      months.push({
        month: date.toLocaleDateString('en-MY', { month: 'short' }),
        revenue,
        bookings: monthBookings.length
      });
    }
    
    return months;
  }, [bookings]);

  // Current renter info
  const currentRenter = metrics.activeBookings.length > 0 ? metrics.activeBookings[0] : null;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!motherCamera) {
    return (
      <div className="min-h-screen bg-slate-100 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Camera Not Found</CardTitle>
            <CardDescription>
              Mother's Canon R50 camera has not been set up yet. Please run the setup script first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-4">Run this command to add the camera:</p>
            <code className="block bg-slate-900 text-white p-4 rounded-lg">
              node scripts/add-mother-r50.js
            </code>
          </CardContent>
        </Card>
      </div>
    );
  }

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-6 max-w-full overflow-x-hidden">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg"
      >
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Mother's Dashboard</h1>
        </div>
        <p className="text-pink-100 text-sm sm:text-base">
          Canon R50 Rental Management - Simple & Easy
        </p>
      </motion.div>

      {/* Key Metrics */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-6"
      >
        {/* Total Revenue */}
        <motion.div variants={item}>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">RM{metrics.totalRevenue}</p>
              <p className="text-xs text-slate-500 mt-1">All time</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div variants={item}>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">This Month</p>
              <p className="text-2xl font-bold text-slate-900">RM{metrics.monthlyRevenue}</p>
              <p className="text-xs text-slate-500 mt-1">{new Date().toLocaleDateString('en-MY', { month: 'long' })}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Bookings */}
        <motion.div variants={item}>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Total Bookings</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.totalBookings}</p>
              <p className="text-xs text-slate-500 mt-1">Lifetime</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Active Bookings */}
        <motion.div variants={item}>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Package className="w-5 h-5 text-orange-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Active Now</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.activeBookings.length}</p>
              <p className="text-xs text-slate-500 mt-1">Currently rented</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Bookings */}
        <motion.div variants={item}>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-cyan-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Upcoming</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.upcomingBookings.length}</p>
              <p className="text-xs text-slate-500 mt-1">Next 7 days</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Utilization Rate */}
        <motion.div variants={item}>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              </div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Utilization</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.utilizationRate}%</p>
              <p className="text-xs text-slate-500 mt-1">This month</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Current Status & Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Current Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 font-bold flex items-center gap-2">
                <Camera className="w-5 h-5 text-pink-600" />
                Canon R50 Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              {currentRenter ? (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100">Currently Rented</Badge>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-slate-600" />
                      <span className="text-sm font-semibold text-slate-900">
                        {currentRenter.customer?.full_name || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-600">
                        {currentRenter.customer?.phone || 'N/A'}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-slate-600" />
                      <span className="text-sm text-slate-600">
                        Return: {new Date(currentRenter.end_date).toLocaleDateString('en-MY')}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
                  <p className="text-lg font-semibold text-slate-900">Camera Available</p>
                  <p className="text-sm text-slate-600 mt-1">Ready for next booking</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-slate-900 font-bold">Revenue Trend</CardTitle>
              <CardDescription>Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
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
                  <Bar dataKey="revenue" fill="#ec4899" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Upcoming Bookings List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 font-bold">Upcoming Bookings</CardTitle>
            <CardDescription>Next scheduled rentals</CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.upcomingBookings.length > 0 ? (
              <div className="space-y-3">
                {metrics.upcomingBookings.slice(0, 5).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">
                        {booking.customer?.full_name || 'N/A'}
                      </p>
                      <p className="text-sm text-slate-600">
                        {booking.customer?.phone || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500 mt-1">
                        {new Date(booking.start_date).toLocaleDateString('en-MY')} - {new Date(booking.end_date).toLocaleDateString('en-MY')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">RM{booking.total_amount}</p>
                      <Badge className="mt-1 bg-blue-100 text-blue-800 hover:bg-blue-100">
                        {booking.total_days} {booking.total_days === 1 ? 'day' : 'days'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No upcoming bookings</p>
                <p className="text-sm text-slate-500 mt-1">New bookings will appear here</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* Recent Bookings History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-slate-900 font-bold">Recent Bookings</CardTitle>
            <CardDescription>Latest rental history</CardDescription>
          </CardHeader>
          <CardContent>
            {bookings.length > 0 ? (
              <div className="space-y-2">
                {bookings.slice(0, 10).map((booking) => (
                  <div
                    key={booking.id}
                    className="flex items-center justify-between p-3 border-b border-slate-100 last:border-0"
                  >
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-slate-900">
                        {booking.customer?.full_name || 'N/A'}
                      </p>
                      <p className="text-xs text-slate-500">
                        {new Date(booking.start_date).toLocaleDateString('en-MY')} - {new Date(booking.end_date).toLocaleDateString('en-MY')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-slate-900">RM{booking.total_amount}</p>
                      <Badge
                        className={`text-xs ${
                          booking.booking_status === 'completed'
                            ? 'bg-green-100 text-green-800'
                            : booking.booking_status === 'confirmed'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        } hover:bg-current`}
                      >
                        {booking.booking_status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-600">No bookings yet</p>
                <p className="text-sm text-slate-500 mt-1">Start accepting bookings for the Canon R50</p>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
