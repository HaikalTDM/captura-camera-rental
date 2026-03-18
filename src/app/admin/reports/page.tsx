'use client';

import { useEffect, useMemo, useState } from 'react';
import { getAllBookings, getAllCameras, getAllCustomers } from '@/lib/api/bookings';
import type { Booking, Camera, Customer } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  AlertTriangle,
  BarChart3,
  Calendar,
  Camera as CameraIcon,
  CreditCard,
  Crown,
  DollarSign,
  Download,
  FileText,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { excludeMotherBookings } from '@/lib/utils/revenue';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileReports from '@/components/admin/MobileReports';
import { customToast } from '@/components/ui/toast-config';

type DateRange = 'week' | 'month' | 'quarter' | 'year';
type ReportType = 'revenue' | 'bookings' | 'customers' | 'payments';

function getPillClasses(tone: 'orange' | 'blue' | 'green' | 'red' | 'stone') {
  switch (tone) {
    case 'orange':
      return 'border-[#4b3723] bg-[#2b2117] text-orange-200';
    case 'blue':
      return 'border-[#31414f] bg-[#1c242c] text-sky-200';
    case 'green':
      return 'border-[#30412f] bg-[#1f2b20] text-emerald-200';
    case 'red':
      return 'border-[#503130] bg-[#2a1b1a] text-rose-200';
    default:
      return 'border-[#3a3129] bg-[#221f1b] text-stone-300';
  }
}

export default function ReportsPage() {
  const isMobile = useIsMobile(768);
  const [dateRange, setDateRange] = useState<DateRange>('month');
  const [reportType, setReportType] = useState<ReportType>('revenue');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadReportsData();
  }, []);

  const loadReportsData = async () => {
    setIsLoading(true);
    try {
      const [bookingsData, camerasData, customersData] = await Promise.all([
        getAllBookings(),
        getAllCameras(),
        getAllCustomers(),
      ]);
      setBookings(bookingsData);
      setCameras(camerasData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading reports data:', error);
      customToast.error('Failed to load reports', 'Please refresh and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const reportScopeLabel = useMemo(() => {
    switch (dateRange) {
      case 'week':
        return 'This Week';
      case 'quarter':
        return 'This Quarter';
      case 'year':
        return 'This Year';
      default:
        return 'This Month';
    }
  }, [dateRange]);

  const reportTypeLabel = useMemo(() => {
    switch (reportType) {
      case 'bookings':
        return 'Bookings';
      case 'customers':
        return 'Customers';
      case 'payments':
        return 'Payments';
      default:
        return 'Revenue';
    }
  }, [reportType]);

  const capturaBookings = excludeMotherBookings(bookings, cameras);
  const fullyPaidBookings = capturaBookings.filter((booking) => booking.deposit_paid && booking.final_payment_paid);

  const totalRevenue = fullyPaidBookings.reduce((sum, booking) => {
    const isNewPaymentSystem = booking.deposit_amount === 100;
    return sum + (isNewPaymentSystem ? booking.final_payment_amount : booking.total_amount - booking.deposit_amount);
  }, 0);

  const currentMonth = new Date().toISOString().slice(0, 7);
  const monthlyRevenue = fullyPaidBookings
    .filter((booking) => booking.created_at.startsWith(currentMonth))
    .reduce((sum, booking) => {
      const isNewPaymentSystem = booking.deposit_amount === 100;
      return sum + (isNewPaymentSystem ? booking.final_payment_amount : booking.total_amount - booking.deposit_amount);
    }, 0);

  const totalBookings = capturaBookings.length;
  const activeBookings = capturaBookings.filter((booking) => booking.status === 'active').length;
  const completedBookings = capturaBookings.filter((booking) => booking.status === 'completed');
  const completedBookingsCount = completedBookings.length;

  const cameraPerformance = cameras
    .filter((camera) => camera.name !== 'Canon R50 - Mother')
    .map((camera) => {
      const cameraBookings = capturaBookings.filter((booking) => booking.camera_id === camera.id);
      const paidCameraBookings = cameraBookings.filter((booking) => booking.deposit_paid && booking.final_payment_paid);
      const revenue = paidCameraBookings.reduce((sum, booking) => {
        const isNewPaymentSystem = booking.deposit_amount === 100;
        return sum + (isNewPaymentSystem ? booking.final_payment_amount : booking.total_amount - booking.deposit_amount);
      }, 0);
      const utilization = totalBookings > 0 ? (cameraBookings.length / totalBookings) * 100 : 0;

      return {
        ...camera,
        bookings: cameraBookings.length,
        revenue,
        utilization: Math.round(utilization),
      };
    })
    .sort((a, b) => b.revenue - a.revenue);

  const customerMetrics = customers.map((customer) => {
    const customerBookings = capturaBookings.filter((booking) => booking.customer_id === customer.id);
    const paidCustomerBookings = customerBookings.filter((booking) => booking.deposit_paid && booking.final_payment_paid);
    const totalSpent = paidCustomerBookings.reduce((sum, booking) => {
      const isNewPaymentSystem = booking.deposit_amount === 100;
      return sum + (isNewPaymentSystem ? booking.final_payment_amount : booking.total_amount - booking.deposit_amount);
    }, 0);

    return {
      ...customer,
      totalSpent,
      totalRentals: customerBookings.length,
    };
  });

  const topCustomers = customerMetrics
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  const paymentAnalysis = {
    fullyPaid: bookings.filter((booking) => booking.final_payment_paid).length,
    depositPaid: bookings.filter((booking) => booking.deposit_paid && !booking.final_payment_paid).length,
    pending: bookings.filter((booking) => !booking.deposit_paid).length,
    overdue: bookings.filter(
      (booking) =>
        !booking.final_payment_paid &&
        new Date(booking.end_date) < new Date() &&
        booking.status === 'completed'
    ).length,
  };

  const overdueAmount = bookings
    .filter(
      (booking) =>
        !booking.final_payment_paid &&
        new Date(booking.end_date) < new Date() &&
        booking.status === 'completed'
    )
    .reduce((sum, booking) => sum + booking.final_payment_amount, 0);

  const calculateMonthlyRevenue = (year: number, month: number) => {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const monthlyBookings = fullyPaidBookings.filter((booking) => booking.created_at.startsWith(monthStr));
    const revenue = monthlyBookings.reduce((sum, booking) => {
      const isNewPaymentSystem = booking.deposit_amount === 100;
      return sum + (isNewPaymentSystem ? booking.final_payment_amount : booking.total_amount - booking.deposit_amount);
    }, 0);
    return { revenue, bookings: monthlyBookings.length };
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth() + 1;

  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    let month = currentMonthNum - i;
    let year = currentYear;

    if (month <= 0) {
      month += 12;
      year -= 1;
    }

    const monthData = calculateMonthlyRevenue(year, month);
    const monthName = new Date(year, month - 1).toLocaleDateString('en-US', { month: 'short' });

    monthlyTrend.push({
      month: monthName,
      revenue: monthData.revenue,
      bookings: monthData.bookings,
      year,
    });
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#c96b2c]"></div>
          <p className="mt-4 font-medium text-stone-500">Loading reports...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileReports
        dateRange={dateRange}
        setDateRange={setDateRange}
        reportType={reportType}
        setReportType={setReportType}
        reportScopeLabel={reportScopeLabel}
        reportTypeLabel={reportTypeLabel}
        totalRevenue={totalRevenue}
        monthlyRevenue={monthlyRevenue}
        totalBookings={totalBookings}
        activeBookings={activeBookings}
        overdueAmount={overdueAmount}
        completedBookingsCount={completedBookingsCount}
        paymentAnalysis={paymentAnalysis}
        monthlyTrend={monthlyTrend}
        cameraPerformance={cameraPerformance}
        topCustomers={topCustomers}
      />
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
                  <BarChart3 className="h-3.5 w-3.5 text-orange-300" />
                  Analytics desk
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-stone-50">Reports & Analytics</h1>
                  <p className="max-w-2xl text-sm leading-6 text-stone-400">
                    Review revenue, customer value, payments, and fleet performance through one cleaner reporting surface.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRange)}
                  className="admin-dark-select text-sm font-medium"
                >
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                </select>
                <select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as ReportType)}
                  className="admin-dark-select text-sm font-medium"
                >
                  <option value="revenue">Revenue</option>
                  <option value="bookings">Bookings</option>
                  <option value="customers">Customers</option>
                  <option value="payments">Payments</option>
                </select>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Scope</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{reportScopeLabel}</p>
                <p className="mt-2 text-sm text-stone-400">Current reporting window selected in the filters.</p>
              </div>
              <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Focus</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{reportTypeLabel}</p>
                <p className="mt-2 text-sm text-stone-400">Primary business lens currently selected for review.</p>
              </div>
              <div className="rounded-2xl border border-[#3f3125] bg-[#241b14] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Completed bookings</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{completedBookingsCount}</p>
                <p className="mt-2 text-sm text-stone-400">Closed bookings currently represented in the reporting dataset.</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-[#2d2722] bg-[#171411] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <CardTitle className="text-lg text-stone-50">Report Notes</CardTitle>
            <CardDescription className="text-stone-400">
              Quick context before you export or act on the numbers.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Main revenue rule</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Reported revenue excludes refundable deposit amounts and counts only real earned rental revenue.
              </p>
            </div>
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Booking scope</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                The main CAPTURA reports intentionally exclude Mother&apos;s R50 activity from the business summary.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4"
      >
        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Total Revenue</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">RM{totalRevenue}</p>
                <p className="mt-1 text-sm text-stone-400">All time</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f2b20] text-emerald-300">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Monthly Revenue</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">RM{monthlyRevenue}</p>
                <p className="mt-1 text-sm text-stone-400">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d2933] text-sky-300">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Total Bookings</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{totalBookings}</p>
                <p className="mt-1 text-sm text-stone-400">{activeBookings} active</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#221f1b] text-stone-300">
                <Calendar className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#3a2d22] bg-[#1c1511] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Overdue Amount</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">RM{overdueAmount}</p>
                <p className="mt-1 text-sm text-stone-400">{paymentAnalysis.overdue} customers</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#302219] text-orange-300">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-[30px] border border-[#2c2722] bg-[#171411] shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-stone-50">
              <TrendingUp className="h-5 w-5 text-orange-300" />
              Revenue Trend
            </CardTitle>
            <CardDescription className="text-stone-400">Last 6 months performance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {monthlyTrend.map((month) => (
              <div key={`${month.month}-${month.year}`} className="flex items-center gap-4">
                <div className="min-w-[140px] flex-shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#241b14] text-sm font-semibold text-orange-300">
                      {month.month}
                    </div>
                    <div>
                      <p className="font-semibold text-stone-50">RM{month.revenue}</p>
                      <p className="text-xs text-stone-500">{month.bookings} bookings</p>
                    </div>
                  </div>
                </div>
                <div className="flex-1">
                  <div className="h-3 w-full rounded-full bg-[#2a2521]">
                    <div
                      className="h-3 rounded-full bg-gradient-to-r from-[#c96b2c] to-[#f0a05b]"
                      style={{ width: `${Math.min((month.revenue / 1500) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-[#2c2722] bg-[#171411] shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-stone-50">
              <CreditCard className="h-5 w-5 text-orange-300" />
              Payment Status
            </CardTitle>
            <CardDescription className="text-stone-400">Current payment breakdown</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {[
              { label: 'Fully Paid', value: paymentAnalysis.fullyPaid, tone: 'green' as const },
              { label: 'Deposit Paid', value: paymentAnalysis.depositPaid, tone: 'orange' as const },
              { label: 'Pending', value: paymentAnalysis.pending, tone: 'stone' as const },
              { label: 'Overdue', value: paymentAnalysis.overdue, tone: 'red' as const },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between rounded-2xl border border-[#2d2722] bg-[#12100f] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`h-3 w-3 rounded-full ${item.tone === 'green' ? 'bg-emerald-400' : item.tone === 'orange' ? 'bg-orange-400' : item.tone === 'red' ? 'bg-rose-400' : 'bg-stone-400'}`}></div>
                  <span className="font-medium text-stone-200">{item.label}</span>
                </div>
                <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${getPillClasses(item.tone)}`}>
                  {item.value}
                </span>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="rounded-[30px] border border-[#2c2722] bg-[#171411] shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-stone-50">
              <CameraIcon className="h-5 w-5 text-orange-300" />
              Camera Performance
            </CardTitle>
            <CardDescription className="text-stone-400">Equipment utilization and revenue</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-5">
            {cameraPerformance.map((camera) => (
              <div key={camera.id} className="rounded-2xl border border-[#2d2722] bg-[#12100f] p-4">
                <div className="mb-3 flex items-center justify-between gap-4">
                  <h4 className="font-semibold text-stone-50">{camera.name}</h4>
                  <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPillClasses('blue')}`}>
                    {camera.utilization}% utilization
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-2xl border border-[#2b2520] bg-[#171411] p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Revenue</p>
                    <p className="mt-2 font-semibold text-emerald-300">RM{camera.revenue}</p>
                  </div>
                  <div className="rounded-2xl border border-[#2b2520] bg-[#171411] p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Bookings</p>
                    <p className="mt-2 font-semibold text-stone-50">{camera.bookings}</p>
                  </div>
                  <div className="rounded-2xl border border-[#2b2520] bg-[#171411] p-3">
                    <p className="text-[11px] uppercase tracking-[0.18em] text-stone-500">Avg/Booking</p>
                    <p className="mt-2 font-semibold text-orange-300">
                      RM{camera.bookings > 0 ? Math.round(camera.revenue / camera.bookings) : 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-[#2c2722] bg-[#171411] shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <CardTitle className="flex items-center gap-2 text-xl text-stone-50">
              <Crown className="h-5 w-5 text-orange-300" />
              Top Customers
            </CardTitle>
            <CardDescription className="text-stone-400">Highest spending customers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            {topCustomers.map((customer, index) => (
              <div
                key={customer.id}
                className="flex items-center justify-between rounded-2xl border border-[#2d2722] bg-[#12100f] p-4"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold ${
                    index === 0
                      ? 'bg-[#5c431f] text-amber-200'
                      : index === 1
                        ? 'bg-[#3c3f44] text-stone-200'
                        : index === 2
                          ? 'bg-[#553323] text-orange-200'
                          : 'bg-[#1d2933] text-sky-200'
                  }`}>
                    #{index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-stone-50">{customer.full_name}</p>
                    <p className="flex items-center gap-1 text-sm text-stone-500">
                      <ShoppingBag className="h-3.5 w-3.5" />
                      {customer.totalRentals} rentals
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-emerald-300">RM{customer.totalSpent}</p>
                  <p className="text-xs text-stone-500">
                    RM{customer.totalRentals > 0 ? Math.round(customer.totalSpent / customer.totalRentals) : 0}/rental
                  </p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card className="rounded-[30px] border border-[#2c2722] bg-[#171411] shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
        <CardHeader className="border-b border-[#26211d] pb-4">
          <CardTitle className="flex items-center gap-2 text-xl text-stone-50">
            <Download className="h-5 w-5 text-orange-300" />
            Export Reports
          </CardTitle>
          <CardDescription className="text-stone-400">
            Download detailed reports in various formats.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-2 lg:grid-cols-4">
          <Button className="h-auto flex-col gap-2 rounded-2xl bg-[#1f6b45] py-4 text-white hover:bg-[#258555]">
            <FileText className="h-5 w-5" />
            <span className="font-semibold">Revenue Report</span>
          </Button>
          <Button className="h-auto flex-col gap-2 rounded-2xl bg-[#1d2933] py-4 text-white hover:bg-[#243746]">
            <Calendar className="h-5 w-5" />
            <span className="font-semibold">Booking Report</span>
          </Button>
          <Button className="h-auto flex-col gap-2 rounded-2xl bg-[#241b14] py-4 text-white hover:bg-[#322117]">
            <Users className="h-5 w-5" />
            <span className="font-semibold">Customer Report</span>
          </Button>
          <Button className="h-auto flex-col gap-2 rounded-2xl bg-[#302219] py-4 text-white hover:bg-[#3a2719]">
            <CreditCard className="h-5 w-5" />
            <span className="font-semibold">Payment Report</span>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
