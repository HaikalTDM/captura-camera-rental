'use client';

import { useState, useEffect } from 'react';

interface AnalyticsData {
  revenue: {
    thisMonth: number;
    lastMonth: number;
    thisYear: number;
    lastYear: number;
  };
  bookings: {
    thisMonth: number;
    lastMonth: number;
    pending: number;
    confirmed: number;
    completed: number;
  };
  clients: {
    total: number;
    new: number;
    returning: number;
    retention: number;
  };
  performance: {
    averageBookingValue: number;
    conversionRate: number;
    responseTime: number;
    customerSatisfaction: number;
  };
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    revenue: {
      thisMonth: 8750,
      lastMonth: 7200,
      thisYear: 89500,
      lastYear: 76300
    },
    bookings: {
      thisMonth: 12,
      lastMonth: 9,
      pending: 3,
      confirmed: 7,
      completed: 2
    },
    clients: {
      total: 45,
      new: 8,
      returning: 15,
      retention: 85
    },
    performance: {
      averageBookingValue: 729,
      conversionRate: 68,
      responseTime: 2.4,
      customerSatisfaction: 4.8
    }
  });

  const revenueGrowth = ((analytics.revenue.thisMonth - analytics.revenue.lastMonth) / analytics.revenue.lastMonth * 100);
  const bookingGrowth = ((analytics.bookings.thisMonth - analytics.bookings.lastMonth) / analytics.bookings.lastMonth * 100);
  const yearlyGrowth = ((analytics.revenue.thisYear - analytics.revenue.lastYear) / analytics.revenue.lastYear * 100);

  // Mock data for charts
  const monthlyRevenue = [
    { month: 'Jan', revenue: 6500, bookings: 8 },
    { month: 'Feb', revenue: 7200, bookings: 9 },
    { month: 'Mar', revenue: 8100, bookings: 11 },
    { month: 'Apr', revenue: 7800, bookings: 10 },
    { month: 'May', revenue: 8750, bookings: 12 },
    { month: 'Jun', revenue: 9200, bookings: 13 }
  ];

  const eventTypes = [
    { type: 'Wedding', bookings: 18, revenue: 27600, percentage: 45 },
    { type: 'Corporate', bookings: 12, revenue: 15600, percentage: 30 },
    { type: 'Graduation', bookings: 8, revenue: 4200, percentage: 15 },
    { type: 'Portrait', bookings: 6, revenue: 3900, percentage: 10 }
  ];

  const topClients = [
    { name: 'Corporate Events Sdn Bhd', bookings: 8, spent: 6400 },
    { name: 'Ahmad & Siti Rahman', bookings: 3, spent: 2850 },
    { name: 'Sarah & James Thompson', bookings: 2, spent: 1450 },
    { name: 'David Lim Photography', bookings: 2, spent: 1200 },
    { name: 'Fatimah Abdullah', bookings: 1, spent: 350 }
  ];

  const getGrowthColor = (growth: number) => {
    if (growth > 0) return 'text-green-600';
    if (growth < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getGrowthIcon = (growth: number) => {
    if (growth > 0) return '↗';
    if (growth < 0) return '↘';
    return '→';
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-4 font-serif">Analytics & Reports</h1>
            <div className="w-16 h-px bg-[#d4af37] mx-auto mb-4"></div>
            <p className="text-black/60 text-lg max-w-2xl mx-auto">
              Track your photography business performance and growth
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Time Range Filter */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-black font-serif">Business Overview</h2>
          <div className="flex items-center space-x-2">
            {(['7d', '30d', '90d', '1y'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  timeRange === range
                    ? 'bg-[#d4af37] text-black'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === '7d' ? 'Last 7 Days' :
                 range === '30d' ? 'Last 30 Days' :
                 range === '90d' ? 'Last 90 Days' : 'Last Year'}
              </button>
            ))}
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Monthly Revenue</p>
                <p className="text-3xl font-bold text-black">RM{analytics.revenue.thisMonth.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${getGrowthColor(revenueGrowth)}`}>
                {getGrowthIcon(revenueGrowth)} {Math.abs(revenueGrowth).toFixed(1)}%
              </span>
              <span className="text-sm text-black/60">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Monthly Bookings</p>
                <p className="text-3xl font-bold text-black">{analytics.bookings.thisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm font-medium ${getGrowthColor(bookingGrowth)}`}>
                {getGrowthIcon(bookingGrowth)} {Math.abs(bookingGrowth).toFixed(1)}%
              </span>
              <span className="text-sm text-black/60">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Avg. Booking Value</p>
                <p className="text-3xl font-bold text-black">RM{analytics.performance.averageBookingValue}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-600">
                ↗ 12.5%
              </span>
              <span className="text-sm text-black/60">vs last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Client Satisfaction</p>
                <p className="text-3xl font-bold text-black">{analytics.performance.customerSatisfaction}/5.0</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-green-600">
                ↗ Excellent
              </span>
              <span className="text-sm text-black/60">98% positive</span>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Revenue Chart */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
            <h3 className="text-xl font-bold text-black mb-6 font-serif">Revenue Trend</h3>
            <div className="space-y-4">
              {monthlyRevenue.map((data, index) => (
                <div key={data.month} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-black w-8">{data.month}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                      <div 
                        className="bg-[#d4af37] h-2 rounded-full" 
                        style={{ width: `${(data.revenue / 10000) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-black">RM{data.revenue.toLocaleString()}</p>
                    <p className="text-xs text-black/60">{data.bookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Event Types Distribution */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
            <h3 className="text-xl font-bold text-black mb-6 font-serif">Event Types</h3>
            <div className="space-y-4">
              {eventTypes.map((event, index) => (
                <div key={event.type} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-sm font-medium text-black w-20">{event.type}</span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2 w-32">
                      <div 
                        className="bg-[#d4af37] h-2 rounded-full" 
                        style={{ width: `${event.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-black">RM{event.revenue.toLocaleString()}</p>
                    <p className="text-xs text-black/60">{event.bookings} bookings</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Key Performance Indicators */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
            <h3 className="text-xl font-bold text-black mb-6 font-serif">Performance Metrics</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-black/60">Conversion Rate</p>
                  <p className="text-2xl font-bold text-black">{analytics.performance.conversionRate}%</p>
                </div>
                <div className="w-16 h-16 relative">
                  <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="2"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#d4af37"
                      strokeWidth="2"
                      strokeDasharray={`${analytics.performance.conversionRate}, 100`}
                    />
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-black/60">Avg. Response Time</p>
                  <p className="text-2xl font-bold text-black">{analytics.performance.responseTime}h</p>
                </div>
                <div className="text-green-600">
                  <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                </div>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-black/60">Client Retention</p>
                  <p className="text-2xl font-bold text-black">{analytics.clients.retention}%</p>
                </div>
                <div className="text-blue-600">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Top Clients */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
            <h3 className="text-xl font-bold text-black mb-6 font-serif">Top Clients</h3>
            <div className="space-y-4">
              {topClients.map((client, index) => (
                <div key={client.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-[#d4af37]/20 rounded-full flex items-center justify-center">
                      <span className="text-[#d4af37] font-bold text-sm">{index + 1}</span>
                    </div>
                    <div>
                      <p className="font-medium text-black">{client.name}</p>
                      <p className="text-sm text-black/60">{client.bookings} bookings</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black">RM{client.spent.toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Yearly Overview */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
          <h3 className="text-xl font-bold text-black mb-6 font-serif">Yearly Overview</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-black/60 mb-2">Total Revenue</p>
              <p className="text-3xl font-bold text-black">RM{analytics.revenue.thisYear.toLocaleString()}</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className={`text-sm font-medium ${getGrowthColor(yearlyGrowth)}`}>
                  {getGrowthIcon(yearlyGrowth)} {Math.abs(yearlyGrowth).toFixed(1)}%
                </span>
                <span className="text-sm text-black/60">vs last year</span>
              </div>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-black/60 mb-2">Total Clients</p>
              <p className="text-3xl font-bold text-black">{analytics.clients.total}</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className="text-sm font-medium text-green-600">
                  ↗ {analytics.clients.new} new
                </span>
                <span className="text-sm text-black/60">this month</span>
              </div>
            </div>
            
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <p className="text-sm text-black/60 mb-2">Business Growth</p>
              <p className="text-3xl font-bold text-[#d4af37]">Strong</p>
              <div className="flex items-center justify-center space-x-2 mt-2">
                <span className="text-sm font-medium text-green-600">
                  ↗ Trending upward
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
