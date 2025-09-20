'use client';

import { useState, useEffect } from 'react';
import { getAllBookings, getAllCameras, getAllCustomers, getBookingStats } from '@/lib/api/bookings';
import type { Booking, Camera, Customer } from '@/lib/supabase';

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
      </div>
    );
  }

  // Calculate revenue metrics
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, b) => sum + b.total_amount, 0);
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
  const monthlyRevenue = completedBookings
    .filter(b => b.end_date.startsWith(currentMonth))
    .reduce((sum, b) => sum + b.total_amount, 0);

  // Calculate booking metrics
  const totalBookings = bookings.length;
  const activeBookings = bookings.filter(b => b.status === 'active').length;
  const pendingBookings = bookings.filter(b => b.status === 'pending').length;
  const completedBookingsCount = completedBookings.length;

  // Calculate camera performance
  const cameraPerformance = cameras.map(camera => {
    const cameraBookings = bookings.filter(b => b.camera_id === camera.id);
    const revenue = cameraBookings.reduce((sum, b) => sum + b.total_amount, 0);
    const utilization = totalBookings > 0 ? (cameraBookings.length / totalBookings) * 100 : 0;

    return {
      ...camera,
      bookings: cameraBookings.length,
      revenue,
      utilization: Math.round(utilization)
    };
  }).sort((a, b) => b.revenue - a.revenue);

  // Calculate customer metrics
  const customerMetrics = customers.map(customer => {
    const customerBookings = bookings.filter(b => b.customer_id === customer.id);
    const totalSpent = customerBookings.reduce((sum, b) => sum + b.total_amount, 0);
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

  // Monthly trend (mock data for demo)
  const monthlyTrend = [
    { month: 'Oct', revenue: 850, bookings: 12 },
    { month: 'Nov', revenue: 1200, bookings: 18 },
    { month: 'Dec', revenue: 1450, bookings: 22 },
    { month: 'Jan', revenue: monthlyRevenue, bookings: completedBookingsCount },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Reports & Analytics</h1>
            <p className="text-blue-100 text-lg">Business insights and performance metrics</p>
          </div>
          <div className="flex gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-white border border-gray-300 text-gray-900 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Revenue</p>
              <p className="text-3xl font-bold text-green-600 mt-2">RM{totalRevenue}</p>
              <p className="text-sm text-gray-400 mt-1">All time</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">💰</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Monthly Revenue</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">RM{monthlyRevenue}</p>
              <p className="text-sm text-gray-400 mt-1">January 2024</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📈</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Bookings</p>
              <p className="text-3xl font-bold text-purple-600 mt-2">{totalBookings}</p>
              <p className="text-sm text-gray-400 mt-1">{activeBookings} active</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Overdue Amount</p>
              <p className="text-3xl font-bold text-red-600 mt-2">RM{overdueAmount}</p>
              <p className="text-sm text-gray-400 mt-1">{paymentAnalysis.overdue} customers</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚠️</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            📊 Revenue Trend
          </h3>
          <div className="space-y-4">
            {monthlyTrend.map((month, index) => (
              <div key={month.month} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">{month.month}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">RM{month.revenue}</p>
                    <p className="text-sm text-gray-500">{month.bookings} bookings</p>
                  </div>
                </div>
                <div className="w-32 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${(month.revenue / 1500) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Status */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            💳 Payment Status
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Fully Paid</span>
              </div>
              <span className="font-semibold text-gray-900">{paymentAnalysis.fullyPaid}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Deposit Paid</span>
              </div>
              <span className="font-semibold text-gray-900">{paymentAnalysis.depositPaid}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                <span className="text-gray-700">Pending</span>
              </div>
              <span className="font-semibold text-gray-900">{paymentAnalysis.pending}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Overdue</span>
              </div>
              <span className="font-semibold text-red-600">{paymentAnalysis.overdue}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Camera Performance */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            📷 Camera Performance
          </h3>
          <div className="space-y-4">
            {cameraPerformance.map((camera) => (
              <div key={camera.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{camera.name}</h4>
                  <span className="text-sm text-gray-500">{camera.utilization}% utilization</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Revenue</p>
                    <p className="font-semibold text-green-600">RM{camera.revenue}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Bookings</p>
                    <p className="font-semibold text-gray-900">{camera.bookings}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Avg/Booking</p>
                    <p className="font-semibold text-blue-600">
                      RM{camera.bookings > 0 ? Math.round(camera.revenue / camera.bookings) : 0}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Customers */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            👑 Top Customers
          </h3>
          <div className="space-y-4">
            {topCustomers.map((customer, index) => (
              <div key={customer.id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-600">#{index + 1}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-sm text-gray-500">{customer.totalRentals} rentals</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-green-600">RM{customer.totalSpent}</p>
                  <p className="text-xs text-gray-500">
                    RM{Math.round(customer.totalSpent / customer.totalRentals)}/rental
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Export Options */}
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          📄 Export Reports
        </h3>
        <div className="flex flex-wrap gap-3">
          <button className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            📊 Export Revenue Report
          </button>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            📋 Export Booking Report
          </button>
          <button className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            👥 Export Customer Report
          </button>
          <button className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2">
            💰 Export Payment Report
          </button>
        </div>
      </div>
    </div>
  );
}
