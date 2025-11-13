'use client';

import { useState, useEffect } from 'react';
import { getAllBookings, getAllCameras, getAllCustomers, getBookingStats } from '@/lib/api/bookings';
import type { Booking, Camera, Customer } from '@/lib/supabase';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  TrendingUp,
  DollarSign,
  Calendar,
  AlertTriangle,
  BarChart3,
  CreditCard,
  Camera as CameraIcon,
  Crown,
  Download,
  FileText,
  Users,
  ShoppingBag
} from 'lucide-react';
import { excludeMotherBookings } from '@/lib/utils/revenue';

export default function ReportsPage() {
  const [dateRange, setDateRange] = useState('month');
  const [reportType, setReportType] = useState('revenue');
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
        getAllCustomers()
      ]);
      setBookings(bookingsData);
      setCameras(camerasData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading reports data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <p className="ml-4 text-slate-600 font-medium">Loading reports...</p>
      </div>
    );
  }

  // Exclude Mother's R50 bookings from main CAPTURA reports
  const capturaBookings = excludeMotherBookings(bookings, cameras);

  // Calculate revenue metrics - only count fully paid bookings
  const fullyPaidBookings = capturaBookings.filter(b => b.deposit_paid && b.final_payment_paid);
  const totalRevenue = fullyPaidBookings.reduce((sum, b) => {
    // FIXED: Only count actual revenue (final payment), exclude refundable deposits
    // Backward compatible: new system (deposit=100) vs old system (use total_amount minus deposit)
    const isNewPaymentSystem = b.deposit_amount === 100;
    return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
  }, 0);
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const monthlyRevenue = fullyPaidBookings
    .filter(b => b.created_at.startsWith(currentMonth))
    .reduce((sum, b) => {
      // FIXED: Only count actual revenue (final payment), exclude refundable deposits
      const isNewPaymentSystem = b.deposit_amount === 100;
      return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
    }, 0);

  // Calculate booking metrics (using CAPTURA bookings only)
  const totalBookings = capturaBookings.length;
  const activeBookings = capturaBookings.filter(b => b.status === 'active').length;
  const pendingBookings = capturaBookings.filter(b => b.status === 'pending').length;
  const completedBookings = capturaBookings.filter(b => b.status === 'completed');
  const completedBookingsCount = completedBookings.length;

  // Calculate camera performance (exclude Mother's R50 from performance metrics)
  const cameraPerformance = cameras
    .filter(camera => camera.name !== 'Canon R50 - Mother')
    .map(camera => {
      const cameraBookings = capturaBookings.filter(b => b.camera_id === camera.id);
      const paidCameraBookings = cameraBookings.filter(b => b.deposit_paid && b.final_payment_paid);
      const revenue = paidCameraBookings.reduce((sum, b) => {
        // FIXED: Only count actual revenue (final payment), exclude refundable deposits
        const isNewPaymentSystem = b.deposit_amount === 100;
        return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
      }, 0);
      const utilization = totalBookings > 0 ? (cameraBookings.length / totalBookings) * 100 : 0;

      return {
        ...camera,
        bookings: cameraBookings.length,
        revenue,
        utilization: Math.round(utilization)
      };
    }).sort((a, b) => b.revenue - a.revenue);

  // Calculate customer metrics (using CAPTURA bookings only)
  const customerMetrics = customers.map(customer => {
    const customerBookings = capturaBookings.filter(b => b.customer_id === customer.id);
    const paidCustomerBookings = customerBookings.filter(b => b.deposit_paid && b.final_payment_paid);
    const totalSpent = paidCustomerBookings.reduce((sum, b) => {
      // FIXED: Only count actual revenue (final payment), exclude refundable deposits
      const isNewPaymentSystem = b.deposit_amount === 100;
      return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
    }, 0);
    return {
      ...customer,
      totalSpent,
      totalRentals: customerBookings.length
    };
  });

  const topCustomers = customerMetrics
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 5);

  // Payment status analysis
  const paymentAnalysis = {
    fullyPaid: bookings.filter(b => b.final_payment_paid).length,
    depositPaid: bookings.filter(b => b.deposit_paid && !b.final_payment_paid).length,
    pending: bookings.filter(b => !b.deposit_paid).length,
    overdue: bookings.filter(b =>
      !b.final_payment_paid &&
      new Date(b.end_date) < new Date() &&
      b.status === 'completed'
    ).length,
  };

  const overdueAmount = bookings
    .filter(b =>
      !b.final_payment_paid &&
      new Date(b.end_date) < new Date() &&
      b.status === 'completed'
    )
    .reduce((sum, b) => sum + b.final_payment_amount, 0);

  // Calculate real monthly revenue trend from database
  const calculateMonthlyRevenue = (year: number, month: number) => {
    const monthStr = `${year}-${String(month).padStart(2, '0')}`;
    const monthlyBookings = fullyPaidBookings.filter(b =>
      b.created_at.startsWith(monthStr)
    );
    const revenue = monthlyBookings.reduce((sum, b) => {
      // FIXED: Only count actual revenue (final payment), exclude refundable deposits
      const isNewPaymentSystem = b.deposit_amount === 100;
      return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
    }, 0);
    return { revenue, bookings: monthlyBookings.length };
  };

  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  const currentMonthNum = currentDate.getMonth() + 1; // getMonth() returns 0-11

  // Generate last 6 months of data
  const monthlyTrend = [];
  for (let i = 5; i >= 0; i--) {
    let month = currentMonthNum - i;
    let year = currentYear;

    // Handle year rollover
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
      year: year
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-8 text-white shadow-xl border border-slate-700">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-white/10 backdrop-blur-sm p-3 rounded-xl">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold">Reports & Analytics</h1>
                <p className="text-slate-300 text-lg mt-1">Business insights and performance metrics</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white/10 backdrop-blur-sm border border-white/20 text-white rounded-xl px-4 py-3 focus:ring-2 focus:ring-white/50 font-medium"
            >
              <option value="week" className="text-slate-900">This Week</option>
              <option value="month" className="text-slate-900">This Month</option>
              <option value="quarter" className="text-slate-900">This Quarter</option>
              <option value="year" className="text-slate-900">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Revenue</p>
                <p className="text-3xl font-bold text-green-600">RM{totalRevenue}</p>
                <p className="text-sm text-slate-500 mt-1 font-medium">All time</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <DollarSign className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Monthly Revenue</p>
                <p className="text-3xl font-bold text-blue-600">RM{monthlyRevenue}</p>
                <p className="text-sm text-slate-500 mt-1 font-medium">{new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Total Bookings</p>
                <p className="text-3xl font-bold text-purple-600">{totalBookings}</p>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  <Badge variant="info" className="text-xs">{activeBookings} active</Badge>
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Calendar className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Overdue Amount</p>
                <p className="text-3xl font-bold text-red-600">RM{overdueAmount}</p>
                <p className="text-sm text-slate-500 mt-1 font-medium">
                  <Badge variant="destructive" className="text-xs">{paymentAnalysis.overdue} customers</Badge>
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <TrendingUp className="w-5 h-5 text-blue-600" />
              Revenue Trend
            </CardTitle>
            <CardDescription>Last 6 months performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyTrend.map((month, index) => (
                <div key={`${month.month}-${month.year}`} className="flex items-center gap-4">
                  <div className="flex items-center gap-3 flex-shrink-0 min-w-[140px]">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm">
                      <span className="text-sm font-bold text-white">{month.month}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">RM{month.revenue}</p>
                      <p className="text-xs text-slate-500">{month.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="w-full bg-slate-200 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 shadow-sm"
                        style={{ width: `${Math.min((month.revenue / 1500) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CreditCard className="w-5 h-5 text-green-600" />
              Payment Status
            </CardTitle>
            <CardDescription>Current payment breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full shadow-sm"></div>
                  <span className="text-slate-700 font-semibold">Fully Paid</span>
                </div>
                <Badge variant="success" className="text-base px-3 py-1">{paymentAnalysis.fullyPaid}</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-orange-500 rounded-full shadow-sm"></div>
                  <span className="text-slate-700 font-semibold">Deposit Paid</span>
                </div>
                <Badge variant="warning" className="text-base px-3 py-1">{paymentAnalysis.depositPaid}</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full shadow-sm"></div>
                  <span className="text-slate-700 font-semibold">Pending</span>
                </div>
                <Badge variant="secondary" className="text-base px-3 py-1">{paymentAnalysis.pending}</Badge>
              </div>
              <div className="flex items-center justify-between p-4 bg-red-50 rounded-xl border border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full shadow-sm"></div>
                  <span className="text-slate-700 font-semibold">Overdue</span>
                </div>
                <Badge variant="destructive" className="text-base px-3 py-1">{paymentAnalysis.overdue}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Performance */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <CameraIcon className="w-5 h-5 text-purple-600" />
              Camera Performance
            </CardTitle>
            <CardDescription>Equipment utilization and revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {cameraPerformance.map((camera) => (
                <div key={camera.id} className="border border-slate-200 rounded-xl p-4 hover:shadow-md transition-shadow bg-slate-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-bold text-slate-900">{camera.name}</h4>
                    <Badge variant="info" className="text-xs">
                      {camera.utilization}% utilization
                    </Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Revenue</p>
                      <p className="font-bold text-green-600">RM{camera.revenue}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Bookings</p>
                      <p className="font-bold text-slate-900">{camera.bookings}</p>
                    </div>
                    <div className="bg-white rounded-lg p-3 border border-slate-200">
                      <p className="text-xs text-slate-500 font-semibold mb-1">Avg/Booking</p>
                      <p className="font-bold text-blue-600">
                        RM{camera.bookings > 0 ? Math.round(camera.revenue / camera.bookings) : 0}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Customers */}
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <Crown className="w-5 h-5 text-amber-500" />
              Top Customers
            </CardTitle>
            <CardDescription>Highest spending customers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topCustomers.map((customer, index) => (
                <div key={customer.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm ${
                      index === 0 ? 'bg-gradient-to-br from-amber-400 to-amber-500' :
                      index === 1 ? 'bg-gradient-to-br from-slate-400 to-slate-500' :
                      index === 2 ? 'bg-gradient-to-br from-orange-400 to-orange-500' :
                      'bg-gradient-to-br from-blue-400 to-blue-500'
                    }`}>
                      <span className="text-sm font-bold text-white">#{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">{customer.name}</p>
                      <p className="text-sm text-slate-600 flex items-center gap-1">
                        <ShoppingBag className="w-3 h-3" />
                        {customer.totalRentals} rentals
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600 text-lg">RM{customer.totalSpent}</p>
                    <p className="text-xs text-slate-500 font-medium">
                      RM{Math.round(customer.totalSpent / customer.totalRentals)}/rental
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Options */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <Download className="w-5 h-5 text-slate-600" />
            Export Reports
          </CardTitle>
          <CardDescription>Download detailed reports in various formats</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-md hover:shadow-lg transition-all h-auto py-4 flex-col gap-2"
            >
              <FileText className="w-5 h-5" />
              <span className="font-semibold">Revenue Report</span>
            </Button>
            <Button
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-md hover:shadow-lg transition-all h-auto py-4 flex-col gap-2"
            >
              <Calendar className="w-5 h-5" />
              <span className="font-semibold">Booking Report</span>
            </Button>
            <Button
              className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-md hover:shadow-lg transition-all h-auto py-4 flex-col gap-2"
            >
              <Users className="w-5 h-5" />
              <span className="font-semibold">Customer Report</span>
            </Button>
            <Button
              className="bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800 text-white shadow-md hover:shadow-lg transition-all h-auto py-4 flex-col gap-2"
            >
              <CreditCard className="w-5 h-5" />
              <span className="font-semibold">Payment Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
