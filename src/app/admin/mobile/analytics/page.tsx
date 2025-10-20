'use client';

import { useState, useEffect } from 'react';
import { getAllBookings } from '@/lib/api/bookings';
import type { Booking } from '@/lib/supabase';

type TimeFilter = 'monthly' | 'weekly' | 'today';

export default function MobileAnalytics() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [revenueFilter, setRevenueFilter] = useState<TimeFilter>('weekly');
  const [ordersFilter, setOrdersFilter] = useState<TimeFilter>('weekly');

  useEffect(() => {
    loadData();
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const bookingsData = await getAllBookings();
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading analytics data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics
  const totalBookings = bookings.length;
  const totalRevenue = bookings
    .filter(b => b.deposit_paid && b.final_payment_paid)
    .reduce((sum, b) => {
      const isNewPaymentSystem = b.deposit_amount === 100;
      return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
    }, 0);

  const avgBookingValue = totalBookings > 0 ? totalRevenue / totalBookings : 0;

  // Get chart data for revenue
  const getRevenueChartData = () => {
    const data = [];
    const days = revenueFilter === 'weekly' ? 7 : revenueFilter === 'monthly' ? 30 : 1;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayBookings = bookings.filter(b => b.created_at?.startsWith(dateStr));
      const revenue = dayBookings
        .filter(b => b.deposit_paid && b.final_payment_paid)
        .reduce((sum, b) => {
          const isNewPaymentSystem = b.deposit_amount === 100;
          return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
        }, 0);
      
      data.push({
        date: date,
        label: revenueFilter === 'monthly' 
          ? date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
          : revenueFilter === 'weekly'
          ? date.toLocaleDateString('en-MY', { day: 'numeric' })
          : date.toLocaleDateString('en-MY', { hour: '2-digit' }),
        revenue,
        bookings: dayBookings.length
      });
    }
    
    return data;
  };

  // Get chart data for bookings
  const getBookingsChartData = () => {
    const data = [];
    const days = ordersFilter === 'weekly' ? 7 : ordersFilter === 'monthly' ? 30 : 1;
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayBookings = bookings.filter(b => b.created_at?.startsWith(dateStr));
      
      data.push({
        date: date,
        label: ordersFilter === 'monthly' 
          ? date.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })
          : ordersFilter === 'weekly'
          ? date.toLocaleDateString('en-MY', { day: 'numeric' })
          : date.toLocaleDateString('en-MY', { hour: '2-digit' }),
        bookings: dayBookings.length
      });
    }
    
    return data;
  };

  const revenueChartData = getRevenueChartData();
  const bookingsChartData = getBookingsChartData();
  const maxRevenue = Math.max(...revenueChartData.map(d => d.revenue), 1);
  const maxBookings = Math.max(...bookingsChartData.map(d => d.bookings), 1);

  // Top cameras by bookings
  const topCameras = Object.entries(
    bookings.reduce((acc, b) => {
      const cameraName = b.camera?.name || 'Unknown';
      acc[cameraName] = (acc[cameraName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  )
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`px-4 pt-4 space-y-4 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className={`${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        } rounded-2xl p-3 border shadow-sm text-center`}>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            {totalBookings}
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Bookings
          </p>
        </div>
        
        <div className={`${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        } rounded-2xl p-3 border shadow-sm text-center`}>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            RM{totalRevenue.toFixed(0)}
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Total Revenue
          </p>
        </div>

        <div className={`${
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
        } rounded-2xl p-3 border shadow-sm text-center`}>
          <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            RM{avgBookingValue.toFixed(0)}
          </p>
          <p className={`text-xs mt-1 ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
            Avg. Value
          </p>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      } rounded-2xl border shadow-sm overflow-hidden`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Revenue Trend
            </h3>
            <div className="flex gap-1">
              {(['monthly', 'weekly', 'today'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setRevenueFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    revenueFilter === filter
                      ? 'bg-black text-white'
                      : 'text-gray-500'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Area Chart */}
          <div className="h-48 flex items-end justify-between gap-1 mt-4">
            {revenueChartData.map((data, index) => {
              const heightPercent = (data.revenue / maxRevenue) * 100;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="relative w-full h-40 flex items-end">
                    {/* Area fill */}
                    <div
                      className="w-full bg-gradient-to-t from-gray-300/50 to-gray-100/30 rounded-t-sm transition-all duration-300"
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                    {/* Top line */}
                    <div
                      className="absolute bottom-0 left-0 right-0 h-1 bg-black"
                      style={{ bottom: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Total Revenue</p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                RM{revenueChartData.reduce((sum, d) => sum + d.revenue, 0).toFixed(0)}
              </p>
            </div>
            <div>
              <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Avg. Daily</p>
              <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                RM{(revenueChartData.reduce((sum, d) => sum + d.revenue, 0) / revenueChartData.length).toFixed(0)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Chart */}
      <div className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      } rounded-2xl border shadow-sm overflow-hidden`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
              Bookings
            </h3>
            <div className="flex gap-1">
              {(['monthly', 'weekly', 'today'] as TimeFilter[]).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setOrdersFilter(filter)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    ordersFilter === filter
                      ? 'bg-black text-white'
                      : 'text-gray-500'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
          
          {/* Bar Chart */}
          <div className="h-40 flex items-end justify-between gap-2 mt-4">
            {bookingsChartData.map((data, index) => {
              const heightPercent = (data.bookings / maxBookings) * 100;
              const isEven = index % 2 === 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full h-32 flex items-end">
                    <div
                      className={`w-full ${
                        isEven 
                          ? 'bg-black' 
                          : 'bg-gray-300'
                      } rounded-t transition-all duration-300`}
                      style={{ height: `${heightPercent}%` }}
                    ></div>
                  </div>
                  <span className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                    {data.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Cameras */}
      <div className={`${
        isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-100'
      } rounded-2xl border shadow-sm overflow-hidden`}>
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            Popular Cameras
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {topCameras.map(([camera, count], index) => {
            const maxCount = topCameras[0][1];
            const widthPercent = (count / maxCount) * 100;
            return (
              <div key={camera}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs font-bold ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                      {index + 1}
                    </span>
                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {camera}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
                      {count}
                    </p>
                    <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>
                      bookings
                    </p>
                  </div>
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-black rounded-full transition-all duration-300"
                    style={{ width: `${widthPercent}%` }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

