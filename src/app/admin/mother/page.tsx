'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
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
  Phone,
  Plus,
  List,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { getAllBookings, getAllCameras } from '@/lib/api/bookings';
import { Booking, Camera as CameraType } from '@/lib/supabase';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function MotherDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [motherCamera, setMotherCamera] = useState<CameraType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

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

    // Total revenue (fully paid bookings OR completed bookings)
    const totalRevenue = bookings
      .filter(b =>
        (b.deposit_paid && b.final_payment_paid) ||
        b.booking_status === 'completed'
      )
      .reduce((sum, b) => {
        const isNewPaymentSystem = b.deposit_amount === 100;
        return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
      }, 0);

    // Monthly revenue
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyRevenue = bookings
      .filter(b =>
        ((b.deposit_paid && b.final_payment_paid) || b.booking_status === 'completed') &&
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
    const paidBookings = bookings.filter(b =>
      (b.deposit_paid && b.final_payment_paid) ||
      b.booking_status === 'completed'
    );
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

    // Pending approvals
    const pendingApprovals = bookings.filter(b => b.booking_status === 'pending_approval').length;

    return {
      totalRevenue,
      monthlyRevenue,
      totalBookings,
      activeBookings,
      upcomingBookings,
      avgBookingValue,
      utilizationRate,
      pendingApprovals
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

  // Calendar helper functions
  const getBookingsForDate = (date: Date): Booking[] => {
    return bookings.filter(booking => {
      const startDate = new Date(booking.start_date);
      const endDate = new Date(booking.end_date);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(0, 0, 0, 0);
      const checkDate = new Date(date);
      checkDate.setHours(0, 0, 0, 0);

      return checkDate >= startDate && checkDate <= endDate;
    });
  };

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);

    const startingDayOfWeek = firstDay.getDay();
    const daysFromPrevMonth = startingDayOfWeek;

    const days = [];

    // Previous month days
    const prevMonthLastDay = new Date(year, month, 0);
    for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
      const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        bookings: getBookingsForDate(date)
      });
    }

    // Current month days
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      date.setHours(0, 0, 0, 0);

      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        bookings: getBookingsForDate(date)
      });
    }

    // Next month days
    const remainingDays = 42 - days.length;
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day);
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        bookings: getBookingsForDate(date)
      });
    }

    return days;
  }, [currentDate, bookings]);

  const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];

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
            <code className="bg-slate-900 text-white px-4 py-2 rounded-lg block mb-2">node scripts/add-mother-r50.js</code>
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
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Heart className="w-8 h-8" />
              <h1 className="text-2xl font-bold text-slate-900">Mother's Dashboard</h1>
            </div>
            <p className="text-pink-100 text-sm sm:text-base">
              Mother's Canon R50 Rental Management - Simple & Easy
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/bookings/add">
              <Button className="bg-white text-pink-600 hover:bg-pink-50 shadow-md">
                <Plus className="w-4 h-4 mr-2" />
                Create Booking
              </Button>
            </Link>
            <Link href="/admin/mother/bookings">
              <Button variant="ghost" className="text-white hover:bg-white/20">
                <List className="w-4 h-4 mr-2" />
                All Bookings
              </Button>
            </Link>
          </div>
        </div>

        {/* Pending Approvals Alert */}
        {metrics.pendingApprovals > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Link href="/admin/mother/approvals">
              <div className="bg-orange-500 hover:bg-orange-600 transition-colors rounded-xl p-4 cursor-pointer">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <AlertCircle className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-bold text-white">
                        {metrics.pendingApprovals} {metrics.pendingApprovals === 1 ? 'Booking' : 'Bookings'} Awaiting Approval
                      </p>
                      <p className="text-sm text-orange-100">
                        Click to review and approve bookings
                      </p>
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white" />
                </div>
              </div>
            </Link>
          </motion.div>
        )}
      </motion.div>

      {/* Key Metrics - 4 cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Total Revenue */}
        <motion.div variants={item}>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-green-600" />
                <ArrowUpRight className="w-3.5 h-3.5 text-green-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Total Revenue</p>
              <p className="text-2xl font-bold text-slate-900">RM{metrics.totalRevenue}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">All time</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Revenue */}
        <motion.div variants={item}>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">This Month</p>
              <p className="text-2xl font-bold text-slate-900">RM{metrics.monthlyRevenue}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{new Date().toLocaleDateString('en-MY', { month: 'long' })}</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Total Bookings */}
        <motion.div variants={item}>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Total Bookings</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.totalBookings}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Lifetime</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Upcoming Bookings */}
        <motion.div variants={item}>
          <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-pink-600" />
              </div>
              <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-0.5">Upcoming</p>
              <p className="text-2xl font-bold text-slate-900">{metrics.upcomingBookings.length}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">Next 7 days</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Revenue Chart - Full Width */}
      <div className="grid grid-cols-1 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="border-slate-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900">Revenue Trend</CardTitle>
              <CardDescription className="text-xs">Last 6 months</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.some(d => d.revenue > 0) ? (
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
              ) : (
                <div className="h-[200px] flex flex-col items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                    <TrendingUp className="w-8 h-8 text-slate-400" />
                  </div>
                  <p className="text-sm font-semibold text-slate-700 mb-1">No revenue data yet</p>
                  <p className="text-xs text-slate-500 text-center max-w-[200px]">
                    Revenue will appear here once bookings are completed
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bookings View - Asymmetric Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Widget - Large (2 columns) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="lg:col-span-2"
        >
          <Card className="border-slate-200 shadow-sm h-full">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-slate-900">Booking Calendar</CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="space-y-3">
                {/* Calendar Header */}
                <div className="flex items-center justify-between mb-3">
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Previous month"
                  >
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <div className="flex items-center gap-3">
                    <h3 className="text-sm font-bold text-slate-900">
                      {currentDate.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}
                    </h3>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="text-[10px] px-2 py-1 bg-slate-100 hover:bg-slate-200 rounded text-slate-600 transition-colors font-medium"
                    >
                      Today
                    </button>
                  </div>
                  <button
                    onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                    className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors"
                    aria-label="Next month"
                  >
                    <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-px bg-slate-200 rounded-lg overflow-hidden shadow-sm">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-center text-[10px] font-bold text-slate-600 py-2.5 bg-slate-50 uppercase tracking-wider">
                      {day}
                    </div>
                  ))}

                  {calendarDays.map((day, index) => {
                    const hasBookings = day.bookings.length > 0;
                    const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                    const isPast = day.date < new Date(new Date().setHours(0, 0, 0, 0));

                    return (
                      <button
                        key={index}
                        onClick={() => setSelectedDate(day.date)}
                        className={`
                          relative min-h-[44px] p-2 transition-all
                          ${!day.isCurrentMonth ? 'bg-slate-50 text-slate-300' : 'bg-white text-slate-700'}
                          ${day.isToday ? 'bg-pink-500 text-white font-bold shadow-md ring-2 ring-pink-300' : ''}
                          ${isSelected && !day.isToday ? 'bg-pink-50 ring-2 ring-pink-400 ring-inset shadow-sm' : ''}
                          ${!day.isToday && !isSelected && day.isCurrentMonth ? 'hover:bg-slate-100 hover:shadow-sm' : ''}
                          ${isPast && !day.isToday && day.isCurrentMonth ? 'opacity-60' : ''}
                        `}
                      >
                        <span className="block text-[13px] leading-none font-medium">{day.date.getDate()}</span>

                        {/* Booking Indicator Dots */}
                        <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                          {day.isCurrentMonth && !isPast && (
                            hasBookings ? (
                              // Red dots for booked dates
                              <>
                                {day.bookings.slice(0, 2).map((_, i) => (
                                  <div
                                    key={i}
                                    className={`w-2 h-2 rounded-full ${day.isToday ? 'bg-white shadow-sm' : 'bg-red-500 shadow-sm'
                                      }`}
                                  />
                                ))}
                                {day.bookings.length > 2 && (
                                  <div className={`w-2 h-2 rounded-full ${day.isToday ? 'bg-white/70' : 'bg-red-400'
                                    }`} />
                                )}
                              </>
                            ) : (
                              // Grey dot for available dates
                              <div className={`w-2 h-2 rounded-full ${day.isToday ? 'bg-white/50' : 'bg-slate-300'
                                }`} />
                            )
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-5 pt-2 bg-slate-50 rounded-lg py-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-300"></div>
                    <span className="text-[10px] text-slate-600 font-medium">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div>
                    <span className="text-[10px] text-slate-600 font-medium">Booked</span>
                  </div>
                </div>

                {/* Selected Date Info - Compact */}
                {selectedDate && selectedDateBookings.length > 0 && (
                  <div className="pt-2 mt-2 border-t border-slate-200">
                    <p className="text-[10px] font-semibold text-slate-500 mb-1.5 uppercase tracking-wide">
                      {selectedDate.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                    </p>
                    <div className="space-y-1">
                      {selectedDateBookings.slice(0, 2).map(booking => (
                        <div
                          key={booking.id}
                          className="p-1.5 bg-pink-50 rounded border border-pink-100"
                        >
                          <p className="font-semibold text-slate-900 text-[10px] leading-tight">
                            {booking.customer?.full_name || 'N/A'}
                          </p>
                          <p className="text-[9px] text-slate-500 mt-0.5">
                            {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} → {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                      ))}
                      {selectedDateBookings.length > 2 && (
                        <p className="text-[9px] text-slate-400 text-center pt-0.5">
                          +{selectedDateBookings.length - 2} more
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Right Column - Stacked Cards (1 column) */}
        <div className="lg:col-span-1 space-y-6">
          {/* Current Status Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
          >
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                  <Camera className="w-4 h-4 text-pink-600" />
                  Canon R50 Status
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentRenter ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Badge className="bg-orange-100 text-orange-800 hover:bg-orange-100 text-xs">
                        Currently Rented
                      </Badge>
                    </div>
                    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg p-3 space-y-2 border border-slate-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
                          <User className="w-3 h-3 text-pink-600" />
                        </div>
                        <span className="text-sm font-semibold text-slate-900">
                          {currentRenter.customer?.full_name || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                          <Phone className="w-3 h-3 text-blue-600" />
                        </div>
                        <span className="text-xs text-slate-600">
                          {currentRenter.customer?.phone || 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                          <Calendar className="w-3 h-3 text-purple-600" />
                        </div>
                        <span className="text-xs text-slate-600">
                          {new Date(currentRenter.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - {new Date(currentRenter.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                    </div>
                    <p className="text-sm font-semibold text-slate-900">Camera Available</p>
                    <p className="text-xs text-slate-500 mt-1">Ready for next booking</p>
                    {metrics.upcomingBookings.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <p className="text-[10px] text-slate-500 uppercase tracking-wide mb-1">Next Booking</p>
                        <p className="text-xs font-semibold text-slate-900">
                          {new Date(metrics.upcomingBookings[0].start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {metrics.upcomingBookings[0].customer?.full_name || 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Upcoming Bookings List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="border-slate-200 shadow-sm">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-semibold text-slate-900">Upcoming Bookings</CardTitle>
                <CardDescription className="text-xs">Next scheduled rentals</CardDescription>
              </CardHeader>
              <CardContent>
                {metrics.upcomingBookings.length > 0 ? (
                  <div className="space-y-2">
                    {metrics.upcomingBookings.slice(0, 4).map((booking) => (
                      <div
                        key={booking.id}
                        className="flex items-center justify-between p-2.5 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-slate-900 text-xs truncate">
                            {booking.customer?.full_name || 'N/A'}
                          </p>
                          <p className="text-[10px] text-slate-500 mt-0.5">
                            {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} → {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                          </p>
                        </div>
                        <div className="text-right ml-2">
                          <p className="font-bold text-slate-900 text-xs">RM{booking.total_amount}</p>
                          <Badge className="mt-0.5 bg-blue-100 text-blue-800 hover:bg-blue-100 text-[9px]">
                            {booking.total_days}d
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {metrics.upcomingBookings.length > 4 && (
                      <p className="text-[10px] text-slate-400 text-center pt-1">
                        +{metrics.upcomingBookings.length - 4} more bookings
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-2">
                      <Calendar className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-xs font-semibold text-slate-700 mb-1">No upcoming bookings</p>
                    <p className="text-[10px] text-slate-500 mb-3">Camera is available for rent</p>
                    <a
                      href="/admin/bookings"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-500 hover:bg-pink-600 text-white text-[10px] font-semibold rounded-lg transition-colors"
                    >
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                      Create Booking
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>


    </div>
  );
}
