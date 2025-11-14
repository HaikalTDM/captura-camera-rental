'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Filter,
  Eye,
  Edit,
  Trash2,
  Plus,
  Download,
  Calendar,
  User,
  Camera,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  SlidersHorizontal,
  ArrowUpDown,
  Heart
} from 'lucide-react';
import { useAdminData } from '@/contexts/AdminDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { Booking } from '@/lib/supabase';

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

export default function BookingsPage() {
  const router = useRouter();
  const { bookings, isLoading, mutateBookings } = useAdminData();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [includeMotherBookings, setIncludeMotherBookings] = useState(false);

  // Load saved sort option
  const getSavedSort = (): SortOption => {
    try {
      const saved = localStorage.getItem('desktopBookingSort');
      if (saved && ['name_asc', 'name_desc', 'date_newest', 'date_oldest', 'start_newest', 'start_oldest', 'amount_high', 'amount_low'].includes(saved)) {
        return saved as SortOption;
      }
    } catch (error) {
      console.error('Error loading saved sort:', error);
    }
    return 'date_newest';
  };

  const [sortBy, setSortBy] = useState<SortOption>(getSavedSort());

  // Load saved filters from localStorage
  const loadSavedFilters = (): FilterState => {
    try {
      const savedFilters = localStorage.getItem('desktopBookingFilters');
      if (savedFilters) {
        return JSON.parse(savedFilters);
      }
    } catch (error) {
      console.error('Error loading saved filters:', error);
    }
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
      localStorage.setItem('desktopBookingFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }, [filters]);

  // Save sort to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('desktopBookingSort', sortBy);
    } catch (error) {
      console.error('Error saving sort:', error);
    }
  }, [sortBy]);

  // Refresh bookings data when page becomes visible (e.g., navigating back from detail page)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        mutateBookings();
      }
    };

    const handleFocus = () => {
      mutateBookings();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);

    // Also refresh on mount
    mutateBookings();

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
    };
  }, [mutateBookings]);

  // Filter out Mother's R50 bookings from main admin (unless toggle is on)
  const adminBookings = useMemo(() => {
    if (includeMotherBookings) {
      return bookings; // Show all bookings including Mother's
    }
    return bookings.filter(b => b.camera?.name !== 'Canon R50 - Mother');
  }, [bookings, includeMotherBookings]);

  // Get unique cameras for filter
  const uniqueCameras = useMemo(() => {
    const cameras = adminBookings.map(b => b.camera?.name).filter(Boolean);
    return Array.from(new Set(cameras));
  }, [adminBookings]);

  // Advanced filtering logic
  const filteredBookings = useMemo(() => {
    return adminBookings.filter(booking => {
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
        const matchesId = booking.id.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesPhone && !matchesCamera && !matchesId) return false;
      }

      // Status filter (multi-select)
      if (filters.status.length > 0) {
        // Check for special "active_deposit" filter
        if (filters.status.includes('active_deposit')) {
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
      paymentStatus: 'all' as const,
      equipmentPickup: 'all' as const,
      equipmentReturn: 'all' as const,
      camera: '',
    };
    setFilters(defaultFilters);
    setQuickFilter('all');
    setSortBy('date_newest');
    try {
      localStorage.setItem('desktopBookingFilters', JSON.stringify(defaultFilters));
      localStorage.setItem('desktopBookingSort', 'date_newest');
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

  // Stats
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.booking_status === 'pending_approval').length,
      confirmed: bookings.filter(b => b.booking_status === 'confirmed' || b.booking_status === 'approved').length,
      completed: bookings.filter(b => b.booking_status === 'completed').length,
    };
  }, [bookings]);

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'pending_approval': { variant: 'warning', icon: Clock },
      'confirmed': { variant: 'info', icon: CheckCircle2 },
      'completed': { variant: 'success', icon: CheckCircle2 },
      'rejected': { variant: 'destructive', icon: XCircle },
      'cancelled': { variant: 'secondary', icon: XCircle },
    };

    const config = variants[status] || { variant: 'secondary', icon: AlertCircle };
    const Icon = config.icon;

    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;
    
    setDeletingId(id);
    try {
      const response = await fetch(`/api/bookings/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        mutateBookings();
      } else {
        alert('Failed to delete booking');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      alert('Error deleting booking');
    } finally {
      setDeletingId(null);
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="space-y-3 sm:space-y-4 px-3 sm:px-0">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
      >
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500 mt-0.5 text-xs sm:text-sm">Manage all camera rental bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-xs sm:text-sm h-8 sm:h-9 flex-1 sm:flex-none">
            <Download className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Export</span>
          </Button>
          <Link href="/admin/bookings/add" className="flex-1 sm:flex-none">
            <Button className="gap-2 text-xs sm:text-sm h-8 sm:h-9 w-full">
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              New Booking
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 md:gap-4"
      >
        <motion.div variants={item}>
          <Card className="border-slate-200 rounded-lg sm:rounded-xl">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">Total</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{stats.total}</p>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-slate-200 rounded-lg sm:rounded-xl">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">Pending</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{stats.pending}</p>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-slate-200 rounded-lg sm:rounded-xl">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">Confirmed</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{stats.confirmed}</p>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-slate-200 rounded-lg sm:rounded-xl">
            <CardContent className="p-3 sm:p-4 md:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-600 uppercase tracking-wide">Done</p>
                  <p className="text-lg sm:text-xl md:text-2xl font-bold text-slate-900 mt-1 sm:mt-2">{stats.completed}</p>
                </div>
                <div className="w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-4 h-4 sm:w-4.5 sm:h-4.5 md:w-5 md:h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Quick Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex gap-1.5 sm:gap-2 overflow-x-auto pb-2 scrollbar-hide"
      >
        {(['all', 'pending', 'confirmed', 'completed'] as const).map((tab) => (
          <Button
            key={tab}
            onClick={() => setQuickFilter(tab)}
            variant={quickFilter === tab ? 'default' : 'outline'}
            className={`whitespace-nowrap font-semibold text-xs sm:text-sm ${
              quickFilter === tab
                ? 'bg-slate-900 hover:bg-slate-800 text-white'
                : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
            }`}
            size="sm"
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="border-slate-200 rounded-lg sm:rounded-xl">
          <CardContent className="p-3 sm:p-4">
            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search customer, phone, camera..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-9 sm:pl-10 pr-9 sm:pr-10 py-2 text-xs sm:text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent placeholder:text-slate-400"
                />
                {filters.search && (
                  <button
                    onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                )}
              </div>
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={activeFilterCount > 0 ? 'default' : 'outline'}
                  className={`gap-1.5 sm:gap-2 text-xs sm:text-sm ${activeFilterCount > 0 ? 'bg-slate-900 hover:bg-slate-800' : ''}`}
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  size="sm"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="secondary" className="ml-1 bg-white text-slate-900 text-[10px] sm:text-xs px-1.5">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
                {activeFilterCount > 0 && (
                  <Button
                    variant="ghost"
                    onClick={clearAllFilters}
                    className="gap-1.5 sm:gap-2 text-xs sm:text-sm"
                    size="sm"
                  >
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Results count */}
            <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs sm:text-sm">
              <div className="flex items-center gap-3">
                <p className="text-slate-600">
                  Showing <span className="font-semibold text-slate-900">{filteredBookings.length}</span> of <span className="font-semibold text-slate-900">{adminBookings.length}</span> bookings
                </p>

                {/* Toggle Mother's Bookings */}
                <button
                  onClick={() => setIncludeMotherBookings(!includeMotherBookings)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                    includeMotherBookings
                      ? 'bg-pink-100 text-pink-700 border border-pink-300'
                      : 'bg-slate-100 text-slate-600 border border-slate-200 hover:bg-slate-200'
                  }`}
                  title={includeMotherBookings ? "Hide Mother's bookings" : "Show Mother's bookings"}
                >
                  <Heart className={`w-3.5 h-3.5 ${includeMotherBookings ? 'fill-pink-700' : ''}`} />
                  <span className="hidden sm:inline">Mother's R50</span>
                </button>
              </div>
              <div className="flex items-center gap-1.5 sm:gap-2">
                <ArrowUpDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-400" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-xs sm:text-sm border border-slate-200 rounded-lg px-2 sm:px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent flex-1 sm:flex-none"
                >
                  <option value="date_newest">Newest First</option>
                  <option value="date_oldest">Oldest First</option>
                  <option value="name_asc">Name (A-Z)</option>
                  <option value="name_desc">Name (Z-A)</option>
                  <option value="start_newest">Start Date (Latest)</option>
                  <option value="start_oldest">Start Date (Earliest)</option>
                  <option value="amount_high">Amount (High-Low)</option>
                  <option value="amount_low">Amount (Low-High)</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Advanced Filter Panel */}
      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="border-slate-200 rounded-xl overflow-hidden">
              <CardHeader className="pb-3 bg-slate-50">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-bold text-slate-900">Advanced Filters</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowFilterPanel(false)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                {/* Booking Status */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-3 block">Booking Status</label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {['pending_approval', 'confirmed', 'approved', 'completed', 'cancelled', 'active_deposit'].map(status => (
                      <Button
                        key={status}
                        onClick={() => toggleStatus(status)}
                        variant={filters.status.includes(status) ? 'default' : 'outline'}
                        className={`justify-start font-semibold ${
                          filters.status.includes(status)
                            ? 'bg-slate-900 hover:bg-slate-800 text-white'
                            : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                        }`}
                        size="sm"
                      >
                        {status === 'active_deposit' ? '💰 Active Deposit' : status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Date Filters */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Rental Date Range */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">Rental Date Range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Start Date</label>
                        <input
                          type="date"
                          value={filters.dateRange.start}
                          onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">End Date</label>
                        <input
                          type="date"
                          value={filters.dateRange.end}
                          onChange={(e) => setFilters(prev => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Pickup Date Range */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">Pickup Date Range</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">Start Date</label>
                        <input
                          type="date"
                          value={filters.pickupDate.start}
                          onChange={(e) => setFilters(prev => ({ ...prev, pickupDate: { ...prev.pickupDate, start: e.target.value } }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-600 mb-1 block">End Date</label>
                        <input
                          type="date"
                          value={filters.pickupDate.end}
                          onChange={(e) => setFilters(prev => ({ ...prev, pickupDate: { ...prev.pickupDate, end: e.target.value } }))}
                          className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Equipment & Payment Status */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Payment Status */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">Payment Status</label>
                    <div className="space-y-2">
                      {(['all', 'paid', 'unpaid'] as const).map(status => (
                        <Button
                          key={status}
                          onClick={() => setFilters(prev => ({ ...prev, paymentStatus: status }))}
                          variant={filters.paymentStatus === status ? 'default' : 'outline'}
                          className={`w-full justify-start font-semibold ${
                            filters.paymentStatus === status
                              ? 'bg-slate-900 hover:bg-slate-800 text-white'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                          size="sm"
                        >
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Equipment Pickup */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">Equipment Pickup</label>
                    <div className="space-y-2">
                      {(['all', 'picked', 'not_picked'] as const).map(status => (
                        <Button
                          key={status}
                          onClick={() => setFilters(prev => ({ ...prev, equipmentPickup: status }))}
                          variant={filters.equipmentPickup === status ? 'default' : 'outline'}
                          className={`w-full justify-start font-semibold ${
                            filters.equipmentPickup === status
                              ? 'bg-slate-900 hover:bg-slate-800 text-white'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                          size="sm"
                        >
                          {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Equipment Return */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">Equipment Return</label>
                    <div className="space-y-2">
                      {(['all', 'returned', 'not_returned'] as const).map(status => (
                        <Button
                          key={status}
                          onClick={() => setFilters(prev => ({ ...prev, equipmentReturn: status }))}
                          variant={filters.equipmentReturn === status ? 'default' : 'outline'}
                          className={`w-full justify-start font-semibold ${
                            filters.equipmentReturn === status
                              ? 'bg-slate-900 hover:bg-slate-800 text-white'
                              : 'bg-white hover:bg-slate-50 text-slate-700 border-slate-300'
                          }`}
                          size="sm"
                        >
                          {status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Camera Filter */}
                {uniqueCameras.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-3 block">Camera</label>
                    <select
                      value={filters.camera}
                      onChange={(e) => setFilters(prev => ({ ...prev, camera: e.target.value }))}
                      className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300"
                    >
                      <option value="">All Cameras</option>
                      {uniqueCameras.map(camera => (
                        <option key={camera} value={camera}>{camera}</option>
                      ))}
                    </select>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-slate-200 rounded-lg sm:rounded-xl">
          <CardHeader className="pb-2 sm:pb-3 px-3 sm:px-6">
            <CardTitle className="text-sm sm:text-base font-bold text-slate-900">All Bookings ({filteredBookings.length})</CardTitle>
            <CardDescription className="text-xs text-slate-600 mt-0.5 sm:mt-1">Complete list of camera rental bookings</CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-2 px-3">
              {filteredBookings.length > 0 ? (
                filteredBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.02 }}
                    className="bg-white border border-slate-200 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900">{booking.customer?.full_name}</p>
                        <p className="text-xs text-slate-500">{booking.customer?.phone}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">#{booking.id.slice(0, 8)}</p>
                      </div>
                      {getStatusBadge(booking.booking_status || 'pending_approval')}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Camera className="w-3.5 h-3.5 text-slate-400" />
                      <span>{booking.camera?.name}</span>
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <div className="text-slate-600">
                        <span>{new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}</span>
                        <span className="mx-1">→</span>
                        <span>{new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}</span>
                      </div>
                      <div className="font-semibold text-slate-900">
                        RM{booking.total_amount}
                      </div>
                    </div>

                    <div className="flex gap-1.5 flex-wrap">
                      <Badge variant={booking.deposit_paid ? 'success' : 'secondary'} className="text-[10px] px-1.5 py-0.5">
                        {booking.deposit_paid ? '✓' : '○'} Deposit
                      </Badge>
                      <Badge variant={booking.equipment_picked_up ? 'info' : 'secondary'} className="text-[10px] px-1.5 py-0.5">
                        {booking.equipment_picked_up ? '✓' : '○'} Pickup
                      </Badge>
                      <Badge variant={booking.equipment_returned ? 'success' : 'secondary'} className="text-[10px] px-1.5 py-0.5">
                        {booking.equipment_returned ? '✓' : '○'} Return
                      </Badge>
                    </div>

                    <div className="flex gap-1.5 pt-1 border-t border-slate-100">
                      <Link href={`/admin/bookings/${booking.id}`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1.5 h-7 text-xs">
                          <Eye className="w-3 h-3" />
                          View
                        </Button>
                      </Link>
                      <Link href={`/admin/bookings/${booking.id}/edit`} className="flex-1">
                        <Button variant="outline" size="sm" className="w-full gap-1.5 h-7 text-xs">
                          <Edit className="w-3 h-3" />
                          Edit
                        </Button>
                      </Link>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(booking.id)}
                        disabled={deletingId === booking.id}
                        className="gap-1.5 h-7 text-xs px-2"
                      >
                        <Trash2 className="w-3 h-3 text-red-600" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <p className="text-slate-500 text-sm">No bookings found</p>
                </div>
              )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block rounded-lg border border-slate-200 overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead className="font-semibold text-xs">Booking ID</TableHead>
                    <TableHead className="font-semibold text-xs">Customer</TableHead>
                    <TableHead className="font-semibold text-xs">Camera</TableHead>
                    <TableHead className="font-semibold text-xs">Dates</TableHead>
                    <TableHead className="font-semibold text-xs">Amount</TableHead>
                    <TableHead className="font-semibold text-xs">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking, index) => (
                      <motion.tr
                        key={booking.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.4 + index * 0.02 }}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <TableCell className="font-mono text-sm">
                          #{booking.id.slice(0, 8)}
                        </TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium text-slate-900">{booking.customer?.full_name}</p>
                            <p className="text-sm text-slate-500">{booking.customer?.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-slate-400" />
                            <span className="text-sm">{booking.camera?.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>{new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}</p>
                            <p className="text-slate-500">to {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p className="font-semibold">RM{booking.total_amount}</p>
                            <p className="text-slate-500">{booking.total_days} days</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-2">
                            {getStatusBadge(booking.booking_status || 'pending_approval')}
                            <div className="flex gap-1.5">
                              <Badge
                                variant={booking.deposit_paid ? 'success' : 'secondary'}
                                className="text-xs"
                              >
                                {booking.deposit_paid ? '✓' : '○'} Deposit
                              </Badge>
                              <Badge
                                variant={booking.equipment_picked_up ? 'info' : 'secondary'}
                                className="text-xs"
                              >
                                {booking.equipment_picked_up ? '✓' : '○'} Pickup
                              </Badge>
                              <Badge
                                variant={booking.equipment_returned ? 'success' : 'secondary'}
                                className="text-xs"
                              >
                                {booking.equipment_returned ? '✓' : '○'} Return
                              </Badge>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/bookings/${booking.id}`}>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/bookings/${booking.id}/edit`}>
                              <Button variant="ghost" size="sm" className="gap-1">
                                <Edit className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="gap-1 text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(booking.id)}
                              disabled={deletingId === booking.id}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="w-12 h-12 text-slate-300" />
                          <p className="text-slate-500">No bookings found</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

