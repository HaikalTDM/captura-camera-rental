'use client';

import { useState, useEffect } from 'react';
import { getAllBookings, getBookingStats, getAllCameras } from '@/lib/api/bookings';
import type { Booking, Camera } from '@/lib/supabase';
import Link from 'next/link';

export default function MobileDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    confirmed: 0,
    active: 0,
    completed: 0,
    cancelled: 0,
    bySource: {} as Record<string, number>
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedCard, setSelectedCard] = useState<'total' | 'pickups' | 'deposits' | 'returns'>('total');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalClosing, setIsModalClosing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    loadDashboardData();
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const [bookingsData, statsData] = await Promise.all([
        getAllBookings(),
        getBookingStats()
      ]);
      setBookings(bookingsData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate metrics
  const today = new Date().toISOString().split('T')[0];
  
  const todayPickups = bookings.filter(b => {
    if (b.pickup_date) {
      return b.pickup_date === today &&
             (b.booking_status === 'confirmed' || b.booking_status === 'approved') &&
             !b.equipment_picked_up;
    }
    const startDate = new Date(b.start_date);
    const pickupDate = new Date(startDate);
    pickupDate.setDate(pickupDate.getDate() - 1);
    const calculatedPickupDate = pickupDate.toISOString().split('T')[0];
    return calculatedPickupDate === today &&
           (b.booking_status === 'confirmed' || b.booking_status === 'approved') &&
           !b.equipment_picked_up;
  });

  const activeRentals = bookings.filter(b =>
    b.booking_status === 'confirmed' &&
    b.equipment_picked_up &&
    !b.equipment_returned
  );

  const todayReturns = bookings.filter(b =>
    b.end_date === today &&
    b.equipment_picked_up &&
    !b.equipment_returned
  );

  const monthlyRevenue = bookings
    .filter(b =>
      b.deposit_paid &&
      b.final_payment_paid &&
      new Date(b.created_at).getMonth() === new Date().getMonth() &&
      new Date(b.created_at).getFullYear() === new Date().getFullYear()
    )
    .reduce((sum, b) => {
      const isNewPaymentSystem = b.deposit_amount === 100;
      return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
    }, 0);

  const pendingApprovals = bookings.filter(b => b.booking_status === 'pending_approval');
  
  // Urgent alerts calculations
  const overdueReturns = bookings.filter(b => {
    const endDate = new Date(b.end_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return b.equipment_picked_up && !b.equipment_returned && endDate < today;
  });

  const upcomingPickups = todayPickups.filter(b => {
    // Show pickups in next 2 hours (simplified - showing all today's pickups)
    return !b.equipment_picked_up;
  });

  const pendingPayments = bookings.filter(b => 
    (b.booking_status === 'confirmed' || b.booking_status === 'approved') && 
    (!b.deposit_paid || (b.final_payment_amount > 0 && !b.final_payment_paid))
  );

  // Recent activity (mock data based on bookings)
  const recentActivity = bookings
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 5)
    .map(booking => {
      const timeAgo = getTimeAgo(new Date(booking.created_at));
      if (booking.equipment_returned) {
        return { text: `Camera returned - ${booking.customer?.full_name}`, time: timeAgo, icon: '✓' };
      } else if (booking.equipment_picked_up) {
        return { text: `Equipment picked up - ${booking.customer?.full_name}`, time: timeAgo, icon: '📦' };
      } else if (booking.deposit_paid) {
        return { text: `Payment received - ${booking.customer?.full_name}`, time: timeAgo, icon: '💰' };
      } else {
        return { text: `New booking - ${booking.customer?.full_name}`, time: timeAgo, icon: '📝' };
      }
    });

  // Helper function to calculate time ago
  function getTimeAgo(date: Date): string {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  }

  // Get current week dates for mini calendar
  const getCurrentWeekDates = () => {
    const today = new Date();
    const currentDay = today.getDay();
    const diff = currentDay === 0 ? -6 : 1 - currentDay; // Monday as first day
    const monday = new Date(today);
    monday.setDate(today.getDate() + diff);
    
    const week = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      const bookingsCount = bookings.filter(b => 
        b.start_date === dateStr || b.end_date === dateStr || b.pickup_date === dateStr
      ).length;
      week.push({
        date: date,
        day: date.toLocaleDateString('en-US', { weekday: 'short' }),
        dayNum: date.getDate(),
        isToday: dateStr === today.toISOString().split('T')[0],
        bookingsCount
      });
    }
    return week;
  };

  const weekDates = getCurrentWeekDates();
  
  // Get filtered data based on selected card
  const getFilteredBookings = () => {
    switch (selectedCard) {
      case 'total':
        return bookings.slice(0, 5); // Show recent bookings like before
      case 'pickups':
        return todayPickups;
      case 'deposits':
        return bookings.filter(b => 
          b.deposit_paid && 
          b.booking_status !== 'completed' && 
          b.booking_status !== 'cancelled' &&
          !b.deposit_refunded
        );
      case 'returns':
        return todayReturns;
      default:
        return bookings.slice(0, 5);
    }
  };

  const getSectionTitle = () => {
    switch (selectedCard) {
      case 'total':
        return 'Recent Bookings'; // Back to original name
      case 'pickups':
        return "Today's Pickups";
      case 'deposits':
        return 'Active Deposits';
      case 'returns':
        return "Today's Returns";
      default:
        return 'Recent Bookings';
    }
  };

  const filteredBookings = getFilteredBookings();

  const openBookingModal = (booking: Booking) => {
    setSelectedBooking(booking);
    setIsModalOpen(true);
    setIsModalClosing(false);
    // Prevent body scroll when modal is open
    document.body.style.overflow = 'hidden';
  };

  const closeBookingModal = () => {
    setIsModalClosing(true);
    // Wait for exit animation to complete (match animation duration)
    setTimeout(() => {
      setIsModalOpen(false);
      setIsModalClosing(false);
      document.body.style.overflow = 'auto';
      setSelectedBooking(null);
    }, 450);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className={`px-4 pt-4 space-y-4 ${isDarkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Quick Search Bar */}
      <div className="animate-fadeIn">
        <div className={`relative ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} rounded-2xl overflow-hidden transition-all duration-300`}>
          <input
            type="text"
            placeholder="Search bookings, customers, cameras..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full px-12 py-4 ${isDarkMode ? 'bg-gray-900 text-white placeholder-gray-500' : 'bg-gray-50 text-black placeholder-gray-400'} outline-none transition-all duration-200`}
          />
          <svg 
            className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'} transition-colors duration-200`}
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${isDarkMode ? 'bg-gray-800 text-gray-400 hover:bg-gray-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'} flex items-center justify-center transition-all duration-200 active:scale-95`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-2 gap-3">
        {/* Total Bookings */}
        <button
          onClick={() => setSelectedCard('total')}
          className={`rounded-2xl p-4 relative overflow-hidden text-left transition-all duration-300 ease-in-out transform ${
            selectedCard === 'total' 
              ? 'bg-black text-white scale-105 shadow-lg' 
              : `${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} ${isDarkMode ? 'text-white' : 'text-black'} opacity-60 hover:opacity-80`
          }`}
        >
          <div className={`relative z-10 transition-transform duration-200 ${selectedCard === 'total' ? 'translate-y-0' : ''}`}>
            <p className={`text-4xl font-bold mb-1 transition-all duration-300 ${selectedCard === 'total' ? 'text-white' : ''}`}>
              {bookings.length}
            </p>
            <p className={`text-sm transition-all duration-300 ${selectedCard === 'total' ? 'text-gray-300' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              Total Bookings
            </p>
          </div>
        </button>

        {/* Today's Pickups */}
        <button
          onClick={() => setSelectedCard('pickups')}
          className={`rounded-2xl p-4 relative overflow-hidden text-left transition-all duration-300 ease-in-out transform ${
            selectedCard === 'pickups' 
              ? 'bg-black text-white scale-105 shadow-lg' 
              : `${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} ${isDarkMode ? 'text-white' : 'text-black'} opacity-60 hover:opacity-80`
          }`}
        >
          <div className={`relative z-10 transition-transform duration-200 ${selectedCard === 'pickups' ? 'translate-y-0' : ''}`}>
            <p className={`text-4xl font-bold mb-1 transition-all duration-300 ${selectedCard === 'pickups' ? 'text-white' : ''}`}>
              {todayPickups.length}
            </p>
            <p className={`text-sm transition-all duration-300 ${selectedCard === 'pickups' ? 'text-gray-300' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              Today Pickups
            </p>
          </div>
        </button>

        {/* Active Deposit Held */}
        <button
          onClick={() => setSelectedCard('deposits')}
          className={`rounded-2xl p-4 relative overflow-hidden text-left transition-all duration-300 ease-in-out transform ${
            selectedCard === 'deposits' 
              ? 'bg-black text-white scale-105 shadow-lg' 
              : `${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} ${isDarkMode ? 'text-white' : 'text-black'} opacity-60 hover:opacity-80`
          }`}
        >
          <div className={`relative z-10 transition-transform duration-200 ${selectedCard === 'deposits' ? 'translate-y-0' : ''}`}>
            <p className={`text-4xl font-bold mb-1 transition-all duration-300 ${selectedCard === 'deposits' ? 'text-white' : ''}`}>
              {bookings.filter(b => 
                b.deposit_paid && 
                b.booking_status !== 'completed' && 
                b.booking_status !== 'cancelled' &&
                !b.deposit_refunded
              ).length}
            </p>
            <p className={`text-sm transition-all duration-300 ${selectedCard === 'deposits' ? 'text-gray-300' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              Active Deposits
            </p>
          </div>
        </button>

        {/* Today's Returns */}
        <button
          onClick={() => setSelectedCard('returns')}
          className={`rounded-2xl p-4 relative overflow-hidden text-left transition-all duration-300 ease-in-out transform ${
            selectedCard === 'returns' 
              ? 'bg-black text-white scale-105 shadow-lg' 
              : `${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'} ${isDarkMode ? 'text-white' : 'text-black'} opacity-60 hover:opacity-80`
          }`}
        >
          <div className={`relative z-10 transition-transform duration-200 ${selectedCard === 'returns' ? 'translate-y-0' : ''}`}>
            <p className={`text-4xl font-bold mb-1 transition-all duration-300 ${selectedCard === 'returns' ? 'text-white' : ''}`}>
              {todayReturns.length}
            </p>
            <p className={`text-sm transition-all duration-300 ${selectedCard === 'returns' ? 'text-gray-300' : (isDarkMode ? 'text-gray-400' : 'text-gray-600')}`}>
              Due Returns
            </p>
          </div>
        </button>
      </div>

      {/* Urgent Alerts Section */}
      <div className="space-y-3 animate-fadeIn">
        {pendingApprovals.length > 0 && (
          <Link href="/admin/mobile/bookings">
            <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl p-4 text-white shadow-lg transition-transform duration-200 active:scale-[0.98]">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{pendingApprovals.length} Pending Approval{pendingApprovals.length !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-orange-100">Tap to review</p>
                </div>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        )}

        {overdueReturns.length > 0 && (
          <Link href="/admin/mobile/bookings">
            <div className="bg-gradient-to-r from-red-600 to-red-700 rounded-2xl p-4 text-white shadow-lg transition-transform duration-200 active:scale-[0.98] animate-fadeIn">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🚨</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm">{overdueReturns.length} Overdue Return{overdueReturns.length !== 1 ? 's' : ''}</p>
                  <p className="text-xs text-red-100">Equipment not returned on time</p>
                </div>
                <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        )}

        {upcomingPickups.length > 0 && upcomingPickups.length <= 3 && (
          <Link href="/admin/mobile/bookings">
            <div className={`${isDarkMode ? 'bg-blue-900/50 border border-blue-800' : 'bg-blue-50 border border-blue-200'} rounded-2xl p-4 transition-transform duration-200 active:scale-[0.98] animate-fadeIn`}>
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 ${isDarkMode ? 'bg-blue-800/50' : 'bg-blue-100'} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xl">🔔</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`font-bold text-sm ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`}>
                    {upcomingPickups.length} Pickup{upcomingPickups.length !== 1 ? 's' : ''} Today
                  </p>
                  <p className={`text-xs ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>Equipment ready for collection</p>
                </div>
                <svg className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-blue-300' : 'text-blue-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </Link>
        )}
      </div>

      {/* Mini Calendar Preview - Only show on Total Bookings */}
      {selectedCard === 'total' && (
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl ${!isDarkMode && 'border border-gray-100'} overflow-hidden animate-fadeIn`}>
        <div className={`p-4 ${!isDarkMode && 'border-b border-gray-100'} flex items-center justify-between`}>
          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            This Week
          </h3>
          <Link href="/admin/mobile/bookings" className="text-gray-500 text-sm font-medium hover:text-black transition-colors duration-200">
            View Calendar
          </Link>
        </div>
        <div className="px-4 pb-4 pt-2">
          <div className="grid grid-cols-7 gap-2">
            {weekDates.map((day, index) => (
              <div
                key={index}
                className={`text-center transition-all duration-200 ${
                  day.isToday 
                    ? 'transform scale-105' 
                    : 'hover:scale-105'
                }`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className={`rounded-xl p-2 transition-all duration-200 ${
                  day.isToday 
                    ? 'bg-black text-white shadow-lg' 
                    : isDarkMode 
                      ? 'bg-gray-800 text-gray-400' 
                      : 'bg-gray-50 text-gray-600'
                }`}>
                  <p className="text-xs font-medium mb-1">{day.day}</p>
                  <p className={`text-lg font-bold ${day.isToday ? 'text-white' : isDarkMode ? 'text-white' : 'text-black'}`}>
                    {day.dayNum}
                  </p>
                  {day.bookingsCount > 0 && (
                    <div className={`mt-1 w-1 h-1 rounded-full mx-auto ${
                      day.isToday ? 'bg-white' : 'bg-blue-500'
                    }`}></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Upcoming Pickups Section - Only show when there are pickups */}
      {(() => {
        const upcomingPickupsDetailed = bookings.filter(b => {
          if (b.equipment_picked_up) return false;
          if (!(b.booking_status === 'confirmed' || b.booking_status === 'approved')) return false;
          
          const pickupDateStr = b.pickup_date || (() => {
            const startDate = new Date(b.start_date + 'T00:00:00');
            startDate.setDate(startDate.getDate() - 1);
            return startDate.toISOString().split('T')[0];
          })();
          
          const [year, month, day] = pickupDateStr.split('-').map(Number);
          const pickupDate = new Date(year, month - 1, day);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          
          const daysDiff = Math.ceil((pickupDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          
          return daysDiff >= 0 && daysDiff <= 7;
        }).sort((a, b) => {
          const getPickupDate = (booking: Booking) => {
            const pickupDateStr = booking.pickup_date || (() => {
              const startDate = new Date(booking.start_date + 'T00:00:00');
              startDate.setDate(startDate.getDate() - 1);
              return startDate.toISOString().split('T')[0];
            })();
            const [year, month, day] = pickupDateStr.split('-').map(Number);
            return new Date(year, month - 1, day);
          };
          return getPickupDate(a).getTime() - getPickupDate(b).getTime();
        });

        if (upcomingPickupsDetailed.length === 0) return null;

        return (
          <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl ${!isDarkMode && 'border border-gray-100'} overflow-hidden animate-fadeIn`}>
            <div className={`p-4 ${!isDarkMode && 'border-b border-gray-100'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm">📦</span>
                </div>
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Upcoming Pickups
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isDarkMode ? 'bg-green-900 text-green-300' : 'bg-green-100 text-green-800'}`}>
                {upcomingPickupsDetailed.length}
              </span>
            </div>
            <div className={`${!isDarkMode && 'divide-y divide-gray-100'}`}>
              {upcomingPickupsDetailed.slice(0, 3).map((booking, index) => {
                const pickupDateStr = booking.pickup_date || (() => {
                  const startDate = new Date(booking.start_date + 'T00:00:00');
                  startDate.setDate(startDate.getDate() - 1);
                  return startDate.toISOString().split('T')[0];
                })();
                const [year, month, day] = pickupDateStr.split('-').map(Number);
                const pickupDate = new Date(year, month - 1, day);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const daysDiff = Math.ceil((pickupDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                const isToday = daysDiff === 0;

                return (
                  <Link key={booking.id} href={`/admin/mobile/bookings/${booking.id}`}>
                    <div className={`p-4 transition-all duration-200 active:scale-[0.98] ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} animate-fadeIn`} style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isToday ? 'bg-gradient-to-br from-green-500 to-emerald-600 shadow-md shadow-green-500/30' : (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')
                        }`}>
                          <span className={`text-sm ${isToday ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {booking.customer?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-bold text-sm truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                              {booking.customer?.full_name}
                            </p>
                            {isToday && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-green-500 text-white shadow-sm">
                                TODAY
                              </span>
                            )}
                          </div>
                          <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                            📷 {booking.camera?.name}
                          </p>
                          <p className={`text-xs ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                            📅 Pickup: {pickupDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                            {!isToday && daysDiff === 1 && ' (Tomorrow)'}
                            {!isToday && daysDiff > 1 && ` (in ${daysDiff} days)`}
                          </p>
                        </div>
                        <svg className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {upcomingPickupsDetailed.length > 3 && (
              <div className={`p-3 ${!isDarkMode && 'border-t border-gray-100'} text-center`}>
                <Link href="/admin/mobile/bookings" className="text-sm font-medium text-gray-500 hover:text-black transition-colors duration-200">
                  View All {upcomingPickupsDetailed.length} Pickups →
                </Link>
              </div>
            )}
          </div>
        );
      })()}

      {/* Upcoming Returns Section - Only show when there are returns */}
      {(() => {
        const upcomingReturnsDetailed = bookings.filter(b => {
          if (b.equipment_returned) return false;
          if (!b.equipment_picked_up) return false;
          
          const [year, month, day] = b.end_date.split('-').map(Number);
          const returnDate = new Date(year, month - 1, day);
          const now = new Date();
          now.setHours(0, 0, 0, 0);
          
          const daysDiff = Math.ceil((returnDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
          
          return daysDiff >= -1 && daysDiff <= 7; // Include yesterday to show overdue
        }).sort((a, b) => {
          const getReturnDate = (booking: Booking) => {
            const [year, month, day] = booking.end_date.split('-').map(Number);
            return new Date(year, month - 1, day);
          };
          return getReturnDate(a).getTime() - getReturnDate(b).getTime();
        });

        if (upcomingReturnsDetailed.length === 0) return null;

        return (
          <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl ${!isDarkMode && 'border border-gray-100'} overflow-hidden animate-fadeIn`}>
            <div className={`p-4 ${!isDarkMode && 'border-b border-gray-100'} flex items-center justify-between`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-sm">
                  <span className="text-white text-sm">📤</span>
                </div>
                <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
                  Upcoming Returns
                </h3>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${isDarkMode ? 'bg-orange-900 text-orange-300' : 'bg-orange-100 text-orange-800'}`}>
                {upcomingReturnsDetailed.length}
              </span>
            </div>
            <div className={`${!isDarkMode && 'divide-y divide-gray-100'}`}>
              {upcomingReturnsDetailed.slice(0, 3).map((booking, index) => {
                const [year, month, day] = booking.end_date.split('-').map(Number);
                const returnDate = new Date(year, month - 1, day);
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const daysDiff = Math.ceil((returnDate.getTime() - now.getTime()) / (1000 * 3600 * 24));
                const isToday = daysDiff === 0;
                const isOverdue = daysDiff < 0;

                return (
                  <Link key={booking.id} href={`/admin/mobile/bookings/${booking.id}`}>
                    <div className={`p-4 transition-all duration-200 active:scale-[0.98] ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} animate-fadeIn`} style={{ animationDelay: `${index * 50}ms` }}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isOverdue ? 'bg-gradient-to-br from-red-500 to-red-600 shadow-md shadow-red-500/30' :
                          isToday ? 'bg-gradient-to-br from-orange-500 to-orange-600 shadow-md shadow-orange-500/30' : 
                          (isDarkMode ? 'bg-gray-800' : 'bg-gray-100')
                        }`}>
                          <span className={`text-sm ${(isToday || isOverdue) ? 'text-white' : isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                            {booking.customer?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className={`font-bold text-sm truncate ${isDarkMode ? 'text-white' : 'text-black'}`}>
                              {booking.customer?.full_name}
                            </p>
                            {isOverdue && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-red-500 text-white shadow-sm animate-pulse">
                                OVERDUE
                              </span>
                            )}
                            {isToday && !isOverdue && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-orange-500 text-white shadow-sm">
                                TODAY
                              </span>
                            )}
                          </div>
                          <p className={`text-xs truncate ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-1`}>
                            📷 {booking.camera?.name}
                          </p>
                          <p className={`text-xs ${isOverdue ? 'text-red-500 font-bold' : (isDarkMode ? 'text-gray-500' : 'text-gray-500')}`}>
                            📅 Return: {returnDate.toLocaleDateString('en-MY', { day: 'numeric', month: 'short' })}
                            {isOverdue && ` (${Math.abs(daysDiff)} day${Math.abs(daysDiff) > 1 ? 's' : ''} overdue)`}
                            {!isOverdue && !isToday && daysDiff === 1 && ' (Tomorrow)'}
                            {!isOverdue && !isToday && daysDiff > 1 && ` (in ${daysDiff} days)`}
                          </p>
                        </div>
                        <svg className={`w-5 h-5 flex-shrink-0 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
            {upcomingReturnsDetailed.length > 3 && (
              <div className={`p-3 ${!isDarkMode && 'border-t border-gray-100'} text-center`}>
                <Link href="/admin/mobile/bookings" className="text-sm font-medium text-gray-500 hover:text-black transition-colors duration-200">
                  View All {upcomingReturnsDetailed.length} Returns →
                </Link>
              </div>
            )}
          </div>
        );
      })()}

      {/* Recent Activity Feed - Only show on Total Bookings */}
      {selectedCard === 'total' && (
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl ${!isDarkMode && 'border border-gray-100'} overflow-hidden animate-fadeIn`}>
        <div className={`p-4 ${!isDarkMode && 'border-b border-gray-100'}`}>
          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'}`}>
            Recent Activity
          </h3>
        </div>
        <div className="p-4 space-y-3">
          {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
            <div 
              key={index}
              className={`flex items-start gap-3 ${isDarkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} -mx-4 px-4 py-2 rounded-xl transition-all duration-200 animate-fadeIn`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className={`w-8 h-8 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200`}>
                <span className="text-sm">{activity.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-700'} transition-colors duration-200`}>
                  {activity.text}
                </p>
                <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-gray-500' : 'text-gray-500'}`}>
                  {activity.time}
                </p>
              </div>
            </div>
          )) : (
            <div className="text-center py-6">
              <p className={`text-sm ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No recent activity</p>
            </div>
          )}
        </div>
      </div>
      )}

      {/* Filtered Bookings with Fade Animation */}
      <div className={`${isDarkMode ? 'bg-gray-900' : 'bg-white'} rounded-2xl ${!isDarkMode && 'border border-gray-100'} overflow-hidden transition-all duration-300 ease-in-out`}>
        <div className={`p-4 ${!isDarkMode && 'border-b border-gray-100'} flex items-center justify-between transition-all duration-200`}>
          <h3 className={`font-bold ${isDarkMode ? 'text-white' : 'text-black'} transition-all duration-300`}>
            {getSectionTitle()}
          </h3>
          <Link href="/admin/mobile/bookings" className="text-gray-500 text-sm font-medium hover:text-black transition-colors duration-200">
            View All
          </Link>
        </div>
        <div className={`${!isDarkMode && 'divide-y divide-gray-100'}`}>
          {filteredBookings.length > 0 ? filteredBookings.map((booking, index) => (
            <button
              key={booking.id} 
              onClick={() => openBookingModal(booking)}
              className="w-full p-4 transition-all duration-200 hover:bg-opacity-50 animate-fadeIn active:scale-[0.98] text-left"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 ${isDarkMode ? 'bg-gray-800' : 'bg-gray-100'} rounded-xl flex items-center justify-center flex-shrink-0 transition-transform duration-200`}>
                    <span className="text-lg">👤</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-medium truncate ${isDarkMode ? 'text-white' : 'text-black'} transition-colors duration-200`}>
                      {booking.customer?.full_name}
                    </p>
                    <p className={`text-xs truncate ${isDarkMode ? 'text-gray-500' : 'text-gray-500'} transition-colors duration-200`}>
                      {booking.camera?.name}
                    </p>
                  </div>
                </div>
                <div className="text-right flex-shrink-0 ml-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                    booking.booking_status === 'confirmed'
                      ? 'bg-green-100 text-green-800'
                      : booking.booking_status === 'pending_approval'
                      ? 'bg-orange-100 text-orange-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {booking.booking_status === 'pending_approval' ? 'Pending' : booking.booking_status}
                  </span>
                  <p className={`text-xs mt-1 font-semibold ${isDarkMode ? 'text-gray-400' : 'text-gray-600'} transition-colors duration-200`}>
                    RM{booking.total_amount}
                  </p>
                </div>
              </div>
            </button>
          )) : (
            <div className="p-8 text-center animate-fadeIn">
              <p className={`${isDarkMode ? 'text-gray-500' : 'text-gray-600'}`}>No {getSectionTitle().toLowerCase()} found</p>
            </div>
          )}
        </div>
      </div>

      {/* Booking Details Modal - PREMIUM REDESIGN */}
      {isModalOpen && selectedBooking && (
        <div 
          className={`fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 ${
            isModalClosing ? 'animate-backdropFadeOut' : 'animate-backdropFadeIn'
          }`}
          onClick={closeBookingModal}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md"></div>
          
          {/* Modal */}
          <div 
            className={`relative w-full sm:max-w-lg ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto border-t-4 border-blue-500 ${
              isModalClosing ? 'animate-modalSlideDown' : 'animate-modalSlideUp'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`sticky top-0 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} backdrop-blur-lg bg-opacity-95 px-6 py-5 z-10`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                    isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                  }`}>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      {selectedBooking.customer?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h2 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {selectedBooking.customer?.full_name}
                    </h2>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      #{selectedBooking.id?.slice(0, 8).toUpperCase()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={closeBookingModal}
                  className={`w-11 h-11 rounded-xl ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center transition-all duration-200 active:scale-95 shadow-sm`}
                >
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold shadow-sm ${
                  selectedBooking.booking_status === 'confirmed' || selectedBooking.booking_status === 'approved'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                    : selectedBooking.booking_status === 'pending_approval'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300'
                    : selectedBooking.booking_status === 'completed'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                    : 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300'
                }`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${
                    selectedBooking.booking_status === 'confirmed' || selectedBooking.booking_status === 'approved'
                      ? 'bg-emerald-600'
                      : selectedBooking.booking_status === 'pending_approval'
                      ? 'bg-amber-600'
                      : selectedBooking.booking_status === 'completed'
                      ? 'bg-blue-600'
                      : 'bg-slate-600'
                  }`}></div>
                  {selectedBooking.booking_status?.replace('_', ' ').toUpperCase()}
                </span>
                <span className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  RM{selectedBooking.total_amount}
                </span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-4">
              {/* Contact Cards */}
              <div className="space-y-3">
                <a 
                  href={`tel:${selectedBooking.customer?.phone || selectedBooking.customer?.phone_number}`}
                  className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-sm border ${
                    isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Phone Number
                    </p>
                    <p className={`text-base font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {selectedBooking.customer?.phone || selectedBooking.customer?.phone_number}
                    </p>
                  </div>
                  <svg className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </a>

                {selectedBooking.customer?.email && (
                  <a 
                    href={`mailto:${selectedBooking.customer?.email}`}
                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all duration-200 active:scale-[0.98] shadow-sm border ${
                      isDarkMode ? 'bg-slate-800 border-slate-700 hover:bg-slate-700' : 'bg-white border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-500/30">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        Email Address
                      </p>
                      <p className={`text-sm font-bold mt-0.5 truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {selectedBooking.customer?.email}
                      </p>
                    </div>
                    <svg className={`w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </a>
                )}
              </div>

              {/* Equipment Info */}
              <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-5 shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-md shadow-purple-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                  </div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Equipment
                  </h3>
                </div>
                <div className="space-y-3">
                  <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Camera
                    </p>
                    <p className={`text-base font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {selectedBooking.camera?.name}
                    </p>
                  </div>
                  {selectedBooking.addons && selectedBooking.addons.length > 0 && (
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        Add-ons
                      </p>
                      <div className="space-y-1">
                        {selectedBooking.addons.map((addon: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full bg-purple-500`}></div>
                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                              {addon}
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Rental Period */}
              <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-5 shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Rental Period
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Start
                    </p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {new Date(selectedBooking.start_date).toLocaleDateString('en-MY', { 
                        day: '2-digit', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      End
                    </p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {new Date(selectedBooking.end_date).toLocaleDateString('en-MY', { 
                        day: '2-digit', 
                        month: 'short',
                        year: 'numeric'
                      })}
                    </p>
                  </div>
                  <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                    <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Duration
                    </p>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {selectedBooking.total_days} {selectedBooking.total_days === 1 ? 'Day' : 'Days'}
                    </p>
                  </div>
                  {selectedBooking.pickup_date && (
                    <div className={`p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                      <p className={`text-xs font-semibold uppercase tracking-wider mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        Pickup
                      </p>
                      <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {new Date(selectedBooking.pickup_date).toLocaleDateString('en-MY', { 
                          day: '2-digit', 
                          month: 'short'
                        })}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Payment Info */}
              <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-5 shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Payment
                  </h3>
                </div>
                <div className="space-y-3">
                  {/* Deposit */}
                  <div className={`p-4 rounded-xl border-2 transition-all ${
                    selectedBooking.deposit_paid
                      ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700'
                      : 'bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600'
                  }`}>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                          Deposit
                        </p>
                        <p className={`text-lg font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          RM{selectedBooking.deposit_amount}
                        </p>
                      </div>
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${
                        selectedBooking.deposit_paid
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                          : 'bg-slate-400 text-white'
                      }`}>
                        {selectedBooking.deposit_paid ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            PAID
                          </>
                        ) : (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                            UNPAID
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Final Payment */}
                  {selectedBooking.final_payment_amount > 0 && (
                    <div className={`p-4 rounded-xl border-2 transition-all ${
                      selectedBooking.final_payment_paid
                        ? 'bg-emerald-50 border-emerald-300 dark:bg-emerald-900/20 dark:border-emerald-700'
                        : 'bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600'
                    }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                            Final Payment
                          </p>
                          <p className={`text-lg font-bold mt-0.5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                            RM{selectedBooking.final_payment_amount}
                          </p>
                        </div>
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold ${
                          selectedBooking.final_payment_paid
                            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
                            : 'bg-slate-400 text-white'
                        }`}>
                          {selectedBooking.final_payment_paid ? (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              PAID
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                              </svg>
                              UNPAID
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Equipment Status Tracking */}
              <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-5 shadow-sm`}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center shadow-md shadow-orange-500/30">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                    </svg>
                  </div>
                  <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                    Status Tracking
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className={`p-4 rounded-xl border-2 ${
                    selectedBooking.equipment_picked_up
                      ? 'bg-blue-50 border-blue-300 dark:bg-blue-900/20 dark:border-blue-700'
                      : 'bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {selectedBooking.equipment_picked_up ? (
                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      )}
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Pickup
                      </p>
                    </div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      {selectedBooking.equipment_picked_up ? 'Equipment Collected' : 'Pending Pickup'}
                    </p>
                  </div>

                  <div className={`p-4 rounded-xl border-2 ${
                    selectedBooking.equipment_returned
                      ? 'bg-purple-50 border-purple-300 dark:bg-purple-900/20 dark:border-purple-700'
                      : 'bg-slate-100 border-slate-300 dark:bg-slate-700 dark:border-slate-600'
                  }`}>
                    <div className="flex items-center gap-2 mb-2">
                      {selectedBooking.equipment_returned ? (
                        <svg className="w-5 h-5 text-purple-600" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-5 h-5 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9a1 1 0 000 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                        </svg>
                      )}
                      <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Return
                      </p>
                    </div>
                    <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      {selectedBooking.equipment_returned ? 'Equipment Returned' : 'Pending Return'}
                    </p>
                  </div>
                </div>

                {/* Created Date */}
                <div className={`mt-4 p-3 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                    Booking Created
                  </p>
                  <p className={`text-sm font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {new Date(selectedBooking.created_at).toLocaleDateString('en-MY', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              {/* Additional Notes */}
              {selectedBooking.notes && (
                <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-2xl p-5 shadow-sm`}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl flex items-center justify-center shadow-md shadow-amber-500/30">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <h3 className={`text-sm font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      Notes
                    </h3>
                  </div>
                  <div className={`p-4 rounded-xl ${isDarkMode ? 'bg-slate-700' : 'bg-white'}`}>
                    <p className={`text-sm leading-relaxed ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      {selectedBooking.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer - Action Buttons */}
            <div className={`sticky bottom-0 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} backdrop-blur-lg bg-opacity-95 border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} px-6 py-5 space-y-3`}>
              <Link href={`/admin/mobile/bookings/${selectedBooking.id}`}>
                <button className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-4 rounded-2xl font-bold transition-all duration-200 active:scale-[0.98] shadow-lg shadow-blue-500/30 hover:from-blue-700 hover:to-indigo-700 flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                  View Full Details
                </button>
              </Link>
              <button 
                onClick={closeBookingModal}
                className={`w-full py-3 rounded-xl font-semibold transition-all duration-200 active:scale-95 ${
                  isDarkMode ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
