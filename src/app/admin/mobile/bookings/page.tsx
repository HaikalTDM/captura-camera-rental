'use client';

import { useState, useEffect, useMemo } from 'react';
import { getAllBookings } from '@/lib/api/bookings';
import type { Booking } from '@/lib/supabase';
import Link from 'next/link';

type FilterState = {
  search: string;
  status: string[];
  dateRange: {
    start: string;
    end: string;
  };
  pickupDate: {
    start: string;
    end: string;
  };
  paymentStatus: 'all' | 'paid' | 'unpaid';
  equipmentPickup: 'all' | 'picked' | 'not_picked';
  equipmentReturn: 'all' | 'returned' | 'not_returned';
  camera: string;
};

type SortOption = 
  | 'name_asc'        // A-Z
  | 'name_desc'       // Z-A
  | 'date_newest'     // Newest booking first
  | 'date_oldest'     // Oldest booking first
  | 'start_newest'    // Latest start date first
  | 'start_oldest'    // Earliest start date first
  | 'amount_high'     // Highest amount first
  | 'amount_low';     // Lowest amount first

export default function MobileBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  
  // Load saved quick filter on mount
  const getSavedQuickFilter = (): 'all' | 'pending' | 'confirmed' | 'completed' => {
    try {
      const saved = localStorage.getItem('bookingQuickFilter');
      if (saved && ['all', 'pending', 'confirmed', 'completed'].includes(saved)) {
        return saved as 'all' | 'pending' | 'confirmed' | 'completed';
      }
    } catch (error) {
      console.error('Error loading saved quick filter:', error);
    }
    return 'all';
  };
  
  const [quickFilter, setQuickFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>(getSavedQuickFilter());

  // Load saved sort option
  const getSavedSort = (): SortOption => {
    try {
      const saved = localStorage.getItem('bookingSort');
      if (saved && ['name_asc', 'name_desc', 'date_newest', 'date_oldest', 'start_newest', 'start_oldest', 'amount_high', 'amount_low'].includes(saved)) {
        return saved as SortOption;
      }
    } catch (error) {
      console.error('Error loading saved sort:', error);
    }
    return 'date_newest'; // Default to newest bookings first
  };

  const [sortBy, setSortBy] = useState<SortOption>(getSavedSort());

  // Save sort to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('bookingSort', sortBy);
    } catch (error) {
      console.error('Error saving sort:', error);
    }
  }, [sortBy]);

  // Prevent body scroll when filter drawer is open
  useEffect(() => {
    if (showFilterDrawer) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    // Cleanup on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [showFilterDrawer]);
  
  // Load saved filters from localStorage
  const loadSavedFilters = (): FilterState => {
    try {
      const savedFilters = localStorage.getItem('bookingFilters');
      if (savedFilters) {
        return JSON.parse(savedFilters);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
    // Return default filters if nothing saved
    return {
      search: '',
      status: [],
      dateRange: { start: '', end: '' },
      pickupDate: { start: '', end: '' },
      paymentStatus: 'all',
      equipmentPickup: 'all',
      equipmentReturn: 'all',
      camera: '',
    };
  };

  const [filters, setFilters] = useState<FilterState>(loadSavedFilters());

  // Save filters to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('bookingFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }, [filters]);

  // Save quick filter to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('bookingQuickFilter', quickFilter);
    } catch (error) {
      console.error('Error saving quick filter:', error);
    }
  }, [quickFilter]);

  useEffect(() => {
    loadBookings();
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
  }, []);

  const loadBookings = async () => {
    setIsLoading(true);
    try {
      const bookingsData = await getAllBookings();
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Get unique cameras for filter
  const uniqueCameras = useMemo(() => {
    const cameras = bookings.map(b => b.camera?.name).filter(Boolean);
    return Array.from(new Set(cameras));
  }, [bookings]);

  // Advanced filtering logic
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      // Quick filter
      if (quickFilter !== 'all') {
        if (quickFilter === 'pending' && booking.booking_status !== 'pending_approval') return false;
        if (quickFilter === 'confirmed' && booking.booking_status !== 'confirmed' && booking.booking_status !== 'approved') return false;
        if (quickFilter === 'completed' && booking.booking_status !== 'completed') return false;
      }

      // Search filter (name, phone, camera)
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = booking.customer?.full_name?.toLowerCase().includes(searchLower);
        const matchesPhone = booking.customer?.phone?.toLowerCase().includes(searchLower);
        const matchesCamera = booking.camera?.name?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesPhone && !matchesCamera) return false;
      }

      // Status filter (multi-select)
      if (filters.status.length > 0) {
        // Check for special "active_deposit" filter
        if (filters.status.includes('active_deposit')) {
          // Active deposit = deposit paid AND not yet completed/cancelled/refunded
          const hasActiveDeposit = booking.deposit_paid && 
                                   !booking.deposit_refunded && 
                                   booking.booking_status !== 'completed' && 
                                   booking.booking_status !== 'cancelled';
          if (!hasActiveDeposit) return false;
        }
        // Check regular booking statuses (exclude special filters)
        const regularStatuses = filters.status.filter(s => s !== 'active_deposit');
        if (regularStatuses.length > 0 && !regularStatuses.includes(booking.booking_status)) {
          return false;
        }
      }

      // Date range filter
      if (filters.dateRange.start && filters.dateRange.end) {
        const bookingDate = new Date(booking.start_date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (bookingDate < startDate || bookingDate > endDate) return false;
      }

      // Pickup date filter
      if (filters.pickupDate.start && filters.pickupDate.end && booking.pickup_date) {
        const pickupDate = new Date(booking.pickup_date);
        const startDate = new Date(filters.pickupDate.start);
        const endDate = new Date(filters.pickupDate.end);
        if (pickupDate < startDate || pickupDate > endDate) return false;
      }

      // Payment status filter
      if (filters.paymentStatus === 'paid' && !booking.deposit_paid) return false;
      if (filters.paymentStatus === 'unpaid' && booking.deposit_paid) return false;

      // Equipment pickup filter
      if (filters.equipmentPickup === 'picked' && !booking.equipment_picked_up) return false;
      if (filters.equipmentPickup === 'not_picked' && booking.equipment_picked_up) return false;

      // Equipment return filter
      if (filters.equipmentReturn === 'returned' && !booking.equipment_returned) return false;
      if (filters.equipmentReturn === 'not_returned' && booking.equipment_returned) return false;

      // Camera filter
      if (filters.camera && booking.camera?.name !== filters.camera) return false;

      return true;
    }).sort((a, b) => {
      // Sorting logic
      switch (sortBy) {
        case 'name_asc':
          return (a.customer?.full_name || '').localeCompare(b.customer?.full_name || '');
        
        case 'name_desc':
          return (b.customer?.full_name || '').localeCompare(a.customer?.full_name || '');
        
        case 'date_newest':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        
        case 'date_oldest':
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        
        case 'start_newest':
          return new Date(b.start_date).getTime() - new Date(a.start_date).getTime();
        
        case 'start_oldest':
          return new Date(a.start_date).getTime() - new Date(b.start_date).getTime();
        
        case 'amount_high':
          return (b.total_amount || 0) - (a.total_amount || 0);
        
        case 'amount_low':
          return (a.total_amount || 0) - (b.total_amount || 0);
        
        default:
          return 0;
      }
    });
  }, [bookings, filters, quickFilter, sortBy]);

  // Count active filters
  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.start && filters.dateRange.end) count++;
    if (filters.pickupDate.start && filters.pickupDate.end) count++;
    if (filters.paymentStatus !== 'all') count++;
    if (filters.equipmentPickup !== 'all') count++;
    if (filters.equipmentReturn !== 'all') count++;
    if (filters.camera) count++;
    return count;
  }, [filters]);

  const clearAllFilters = () => {
    const defaultFilters = {
      search: '',
      status: [],
      dateRange: { start: '', end: '' },
      pickupDate: { start: '', end: '' },
      paymentStatus: 'all',
      equipmentPickup: 'all',
      equipmentReturn: 'all',
      camera: '',
    };
    setFilters(defaultFilters);
    setQuickFilter('all');
    setSortBy('date_newest');
    // Clear from localStorage
    try {
      localStorage.setItem('bookingFilters', JSON.stringify(defaultFilters));
      localStorage.setItem('bookingQuickFilter', 'all');
      localStorage.setItem('bookingSort', 'date_newest');
    } catch (error) {
      console.error('Error clearing saved filters:', error);
    }
  };

  const toggleStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'approved':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300';
      case 'pending_approval':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-300';
      case 'completed':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300';
    }
  };

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center h-64 ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-slate-900"></div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} pb-24`}>
      <div className="px-4 pt-4 space-y-4">
        {/* Search & Filter Button */}
        <div className="flex gap-3">
          {/* Search Bar */}
          <div className={`flex-1 relative ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-2xl shadow-sm border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
            <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search name, phone, camera..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className={`w-full pl-12 pr-4 py-3.5 ${isDarkMode ? 'bg-transparent text-white placeholder-slate-500' : 'bg-transparent text-slate-900 placeholder-slate-400'} outline-none text-sm font-medium`}
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className={`absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center transition-all duration-200 active:scale-95`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>

          {/* Filter Button */}
          <button
            onClick={() => setShowFilterDrawer(true)}
            className={`relative px-4 py-3.5 rounded-2xl font-bold text-sm shadow-sm border transition-all duration-200 active:scale-95 ${
              activeFilterCount > 0
                ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white border-blue-500 shadow-lg shadow-blue-500/30'
                : isDarkMode ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-900 border-slate-200'
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </div>
          </button>
        </div>

        {/* Quick Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {(['all', 'pending', 'confirmed', 'completed'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setQuickFilter(tab)}
              className={`px-4 py-2 rounded-xl text-sm font-bold whitespace-nowrap transition-all duration-200 active:scale-95 shadow-sm ${
                quickFilter === tab
                  ? 'bg-slate-900 text-white'
                  : isDarkMode ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-white text-slate-600 border border-slate-200'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {/* Active Filters & Results */}
        <div className="flex items-center justify-between">
          <p className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            {filteredBookings.length} {filteredBookings.length === 1 ? 'Result' : 'Results'}
          </p>
          {activeFilterCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="text-sm font-bold text-blue-500 hover:text-blue-600 transition-colors"
            >
              Clear All
            </button>
          )}
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-4 gap-2">
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl p-3 border shadow-sm text-center`}>
            <p className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {bookings.length}
            </p>
            <p className={`text-xs mt-1 font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Total
            </p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl p-3 border shadow-sm text-center`}>
            <p className="text-xl font-bold text-amber-600">
              {bookings.filter(b => b.booking_status === 'pending_approval').length}
            </p>
            <p className={`text-xs mt-1 font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Pending
            </p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl p-3 border shadow-sm text-center`}>
            <p className="text-xl font-bold text-emerald-600">
              {bookings.filter(b => b.booking_status === 'confirmed' || b.booking_status === 'approved').length}
            </p>
            <p className={`text-xs mt-1 font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Active
            </p>
          </div>
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl p-3 border shadow-sm text-center`}>
            <p className="text-xl font-bold text-blue-600">
              {bookings.filter(b => b.booking_status === 'completed').length}
            </p>
            <p className={`text-xs mt-1 font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
              Done
            </p>
          </div>
        </div>

        {/* Bookings List */}
        <div className="space-y-3">
          {filteredBookings.length > 0 ? filteredBookings.map((booking, index) => (
            <Link
              key={booking.id}
              href={`/admin/mobile/bookings/${booking.id}`}
              className={`block ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm hover:shadow-lg transition-all duration-200 active:scale-[0.98] overflow-hidden animate-fadeIn`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <div className="p-4">
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 border-2 ${
                      isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-100 border-slate-200'
                    }`}>
                      <span className={`text-sm font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {booking.customer?.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {booking.customer?.full_name}
                      </p>
                      <p className={`text-xs truncate font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                        {booking.customer?.phone}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-xl text-xs font-bold flex-shrink-0 ml-2 shadow-sm ${
                    getStatusColor(booking.booking_status)
                  }`}>
                    {booking.booking_status === 'pending_approval' ? 'Pending' : booking.booking_status}
                  </span>
                </div>

                {/* Camera Info */}
                <div className={`${isDarkMode ? 'bg-slate-800/50 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-xl p-3 mb-3`}>
                  <div className="flex items-center gap-2">
                    <svg className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    </svg>
                    <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {booking.camera?.name}
                    </p>
                  </div>
                </div>

                {/* Dates and Amount */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} uppercase tracking-wider`}>
                      Rental Period
                    </p>
                    <p className={`text-sm font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                      {' - '}
                      {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                    </p>
                    <p className={`text-xs font-medium mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      {booking.total_days} {booking.total_days === 1 ? 'day' : 'days'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} uppercase tracking-wider`}>
                      Total Amount
                    </p>
                    <p className={`text-xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      RM{booking.total_amount}
                    </p>
                  </div>
                </div>

                {/* Status Indicators */}
                <div className="flex gap-2 mt-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                    booking.deposit_paid
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {booking.deposit_paid ? '✓' : '○'} Deposit
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                    booking.equipment_picked_up
                      ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {booking.equipment_picked_up ? '✓' : '○'} Pickup
                  </div>
                  <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                    booking.equipment_returned
                      ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                  }`}>
                    {booking.equipment_returned ? '✓' : '○'} Return
                  </div>
                </div>
              </div>
            </Link>
          )) : (
            <div className={`${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-3xl p-12 text-center border ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className={`text-lg font-bold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                No bookings found
              </p>
              <p className={`text-sm mt-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Try adjusting your filters
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Advanced Filter Drawer */}
      {showFilterDrawer && (
        <div 
          className="fixed inset-0 z-50 flex items-end animate-backdropFadeIn overflow-hidden"
          onClick={() => setShowFilterDrawer(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" style={{ touchAction: 'none' }}></div>
          <div 
            className={`relative w-full ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-t-3xl shadow-2xl animate-modalSlideUp max-h-[85vh] overflow-y-auto border-t-4 border-blue-500`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className={`sticky top-0 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} px-6 py-4 flex items-center justify-between z-10 backdrop-blur-lg bg-opacity-95`}>
              <div>
                <h3 className={`text-xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Advanced Filters
                </h3>
                <p className={`text-xs mt-1 font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  {activeFilterCount} active {activeFilterCount === 1 ? 'filter' : 'filters'}
                </p>
              </div>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className={`w-10 h-10 rounded-xl ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-100 hover:bg-slate-200'} flex items-center justify-center transition-all duration-200 active:scale-95`}
              >
                <svg className={`w-5 h-5 ${isDarkMode ? 'text-white' : 'text-slate-900'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-6 py-6 space-y-6">
              {/* Sort By Section - REDESIGNED */}
              <div>
                {/* Current Sort Indicator */}
                <div className={`flex items-center justify-between mb-4 p-3 rounded-xl ${isDarkMode ? 'bg-slate-800/50' : 'bg-slate-100'}`}>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                    </svg>
                    <span className={`text-xs font-semibold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                      Sorted By
                    </span>
                  </div>
                  <span className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {sortBy === 'name_asc' && '👤 Name (A-Z)'}
                    {sortBy === 'name_desc' && '👤 Name (Z-A)'}
                    {sortBy === 'start_newest' && '📅 Start Date (Newest)'}
                    {sortBy === 'start_oldest' && '📅 Start Date (Oldest)'}
                    {sortBy === 'amount_high' && '💰 Amount (High-Low)'}
                    {sortBy === 'amount_low' && '💰 Amount (Low-High)'}
                    {sortBy === 'date_newest' && '🕐 Created (Newest)'}
                    {sortBy === 'date_oldest' && '🕐 Created (Oldest)'}
                  </span>
                </div>

                <label className={`text-sm font-bold mb-3 block ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
                  Change Sort
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {/* Name Sort Toggle */}
                  <button
                    onClick={() => setSortBy(sortBy === 'name_asc' ? 'name_desc' : 'name_asc')}
                    className={`p-4 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                      sortBy === 'name_asc' || sortBy === 'name_desc'
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : isDarkMode ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span>👤</span>
                        <span>Name</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        {sortBy === 'name_asc' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            <span>A-Z</span>
                          </>
                        ) : sortBy === 'name_desc' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Z-A</span>
                          </>
                        ) : (
                          <span className="opacity-50">Tap to sort</span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Start Date Sort Toggle */}
                  <button
                    onClick={() => setSortBy(sortBy === 'start_newest' ? 'start_oldest' : 'start_newest')}
                    className={`p-4 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                      sortBy === 'start_newest' || sortBy === 'start_oldest'
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : isDarkMode ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span>📅</span>
                        <span>Start Date</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        {sortBy === 'start_newest' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Newest</span>
                          </>
                        ) : sortBy === 'start_oldest' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Oldest</span>
                          </>
                        ) : (
                          <span className="opacity-50">Tap to sort</span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Amount Sort Toggle */}
                  <button
                    onClick={() => setSortBy(sortBy === 'amount_high' ? 'amount_low' : 'amount_high')}
                    className={`p-4 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                      sortBy === 'amount_high' || sortBy === 'amount_low'
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : isDarkMode ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span>💰</span>
                        <span>Amount</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        {sortBy === 'amount_high' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            <span>High-Low</span>
                          </>
                        ) : sortBy === 'amount_low' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Low-High</span>
                          </>
                        ) : (
                          <span className="opacity-50">Tap to sort</span>
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Created Date Sort Toggle */}
                  <button
                    onClick={() => setSortBy(sortBy === 'date_newest' ? 'date_oldest' : 'date_newest')}
                    className={`p-4 rounded-2xl text-sm font-bold transition-all duration-200 active:scale-95 ${
                      sortBy === 'date_newest' || sortBy === 'date_oldest'
                        ? 'bg-gradient-to-br from-indigo-500 to-indigo-600 text-white shadow-lg shadow-indigo-500/30'
                        : isDarkMode ? 'bg-slate-800/50 text-slate-400 hover:bg-slate-800' : 'bg-white text-slate-600 hover:bg-slate-50 border-2 border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="flex items-center gap-2">
                        <span>🕐</span>
                        <span>Created</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs font-semibold">
                        {sortBy === 'date_newest' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M14.707 12.707a1 1 0 01-1.414 0L10 9.414l-3.293 3.293a1 1 0 01-1.414-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 010 1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Newest</span>
                          </>
                        ) : sortBy === 'date_oldest' ? (
                          <>
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span>Oldest</span>
                          </>
                        ) : (
                          <span className="opacity-50">Tap to sort</span>
                        )}
                      </div>
                    </div>
                  </button>
                </div>
              </div>

              {/* Booking Status */}
              <div>
                <label className={`text-sm font-bold mb-3 block ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
                  Booking Status
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {['pending_approval', 'confirmed', 'approved', 'completed', 'cancelled', 'active_deposit'].map(status => (
                    <button
                      key={status}
                      onClick={() => toggleStatus(status)}
                      className={`px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 border-2 ${
                        filters.status.includes(status)
                          ? status === 'active_deposit'
                            ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30'
                            : 'bg-blue-500 text-white border-blue-500 shadow-lg shadow-blue-500/30'
                          : isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {status === 'active_deposit' ? (
                        <div className="flex items-center justify-center gap-1.5">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          Active Deposit
                        </div>
                      ) : status.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Rental Date Range */}
              <div>
                <label className={`text-sm font-bold mb-3 block ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
                  Rental Date Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-semibold mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Start Date</label>
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
                      className={`w-full p-3 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-200'} border-2 outline-none font-semibold`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>End Date</label>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
                      className={`w-full p-3 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-200'} border-2 outline-none font-semibold`}
                    />
                  </div>
                </div>
              </div>

              {/* Pickup Date Range */}
              <div>
                <label className={`text-sm font-bold mb-3 block ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
                  Pickup Date Range
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={`text-xs font-semibold mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Start Date</label>
                    <input
                      type="date"
                      value={filters.pickupDate.start}
                      onChange={(e) => setFilters(prev => ({ ...prev, pickupDate: { ...prev.pickupDate, start: e.target.value } }))}
                      className={`w-full p-3 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-200'} border-2 outline-none font-semibold`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold mb-2 block ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>End Date</label>
                    <input
                      type="date"
                      value={filters.pickupDate.end}
                      onChange={(e) => setFilters(prev => ({ ...prev, pickupDate: { ...prev.pickupDate, end: e.target.value } }))}
                      className={`w-full p-3 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-200'} border-2 outline-none font-semibold`}
                    />
                  </div>
                </div>
              </div>

              {/* Payment Status */}
              <div>
                <label className={`text-sm font-bold mb-3 block ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
                  Payment Status
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['all', 'paid', 'unpaid'] as const).map(status => (
                    <button
                      key={status}
                      onClick={() => setFilters(prev => ({ ...prev, paymentStatus: status }))}
                      className={`px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 active:scale-95 border-2 ${
                        filters.paymentStatus === status
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-lg shadow-emerald-500/30'
                          : isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </div>

              {/* Equipment Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`text-sm font-bold mb-3 block ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
                    Pickup
                  </label>
                  <div className="space-y-2">
                    {(['all', 'picked', 'not_picked'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setFilters(prev => ({ ...prev, equipmentPickup: status }))}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 border-2 ${
                          filters.equipmentPickup === status
                            ? 'bg-blue-500 text-white border-blue-500'
                            : isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className={`text-sm font-bold mb-3 block ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
                    Return
                  </label>
                  <div className="space-y-2">
                    {(['all', 'returned', 'not_returned'] as const).map(status => (
                      <button
                        key={status}
                        onClick={() => setFilters(prev => ({ ...prev, equipmentReturn: status }))}
                        className={`w-full px-3 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 active:scale-95 border-2 ${
                          filters.equipmentReturn === status
                            ? 'bg-purple-500 text-white border-purple-500'
                            : isDarkMode ? 'bg-slate-800 text-slate-400 border-slate-700' : 'bg-slate-50 text-slate-600 border-slate-200'
                        }`}
                      >
                        {status.replace('_', ' ')}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Camera Filter */}
              {uniqueCameras.length > 0 && (
                <div>
                  <label className={`text-sm font-bold mb-3 block ${isDarkMode ? 'text-white' : 'text-slate-900'} uppercase tracking-wide`}>
                    Camera
                  </label>
                  <select
                    value={filters.camera}
                    onChange={(e) => setFilters(prev => ({ ...prev, camera: e.target.value }))}
                    className={`w-full p-4 rounded-xl ${isDarkMode ? 'bg-slate-800 text-white border-slate-700' : 'bg-slate-50 text-slate-900 border-slate-200'} border-2 outline-none font-bold`}
                  >
                    <option value="">All Cameras</option>
                    {uniqueCameras.map(camera => (
                      <option key={camera} value={camera}>{camera}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            {/* Footer Actions */}
            <div className={`sticky bottom-0 ${isDarkMode ? 'bg-slate-900' : 'bg-white'} border-t ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} px-6 py-4 flex gap-3 backdrop-blur-lg bg-opacity-95`}>
              <button
                onClick={clearAllFilters}
                className={`flex-1 py-4 rounded-xl font-bold text-base transition-all duration-200 active:scale-95 shadow-lg ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
              >
                Clear All
              </button>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold text-base transition-all duration-200 active:scale-95 shadow-xl shadow-blue-500/30"
              >
                Apply Filters
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
