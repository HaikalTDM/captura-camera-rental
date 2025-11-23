'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  Edit,
  Trash2,
  Plus,
  Calendar,
  User,
  Camera,
  DollarSign,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  X,
  ArrowLeft,
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
};

export default function MotherBookingsPage() {
  const router = useRouter();
  const { bookings, cameras, isLoading, mutateBookings } = useAdminData();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [quickFilter, setQuickFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');

  const [filters, setFilters] = useState<FilterState>({
    search: '',
    status: [],
    dateRange: { start: '', end: '' },
  });

  // Get Mother's camera
  const motherCamera = useMemo(() => {
    return cameras.find(c => c.name === 'Canon R50 - Mother');
  }, [cameras]);

  // Filter bookings for Mother's camera only
  const motherBookings = useMemo(() => {
    if (!motherCamera) return [];
    return bookings.filter(b => b.camera_id === motherCamera.id);
  }, [bookings, motherCamera]);

  // Apply filters
  const filteredBookings = useMemo(() => {
    return motherBookings.filter(booking => {
      // Quick filter
      if (quickFilter !== 'all') {
        if (quickFilter === 'pending' && booking.booking_status !== 'pending_approval') return false;
        if (quickFilter === 'confirmed' && booking.booking_status !== 'confirmed') return false;
        if (quickFilter === 'completed' && booking.booking_status !== 'completed') return false;
      }

      // Search filter
      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = booking.customer?.full_name?.toLowerCase().includes(searchLower);
        const matchesPhone = booking.customer?.phone?.toLowerCase().includes(searchLower);
        const matchesId = booking.id.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesPhone && !matchesId) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(booking.booking_status)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start && filters.dateRange.end) {
        const bookingDate = new Date(booking.created_at);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (bookingDate < startDate || bookingDate > endDate) return false;
      }

      return true;
    });
  }, [motherBookings, quickFilter, filters]);

  // Sort by newest first
  const sortedBookings = useMemo(() => {
    return [...filteredBookings].sort((a, b) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [filteredBookings]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this booking?')) return;

    setDeletingId(id);
    try {
      const response = await fetch(`/api/bookings/${id}/delete`, {
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending_approval: { label: 'Pending', className: 'bg-orange-100 text-orange-800' },
      confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
      approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
      completed: { label: 'Completed', className: 'bg-slate-100 text-slate-800' },
      cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_approval;
    return <Badge className={`${config.className} hover:${config.className}`}>{config.label}</Badge>;
  };

  const toggleStatus = (status: string) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
      </div>
    );
  }

  if (!motherCamera) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="text-red-600">Camera Not Found</CardTitle>
            <CardDescription>
              Canon R50 - Mother camera has not been set up yet.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 sm:p-6 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-6 sm:p-8 text-white shadow-lg"
      >
        <div className="flex items-center gap-3 mb-2">
          <Link href="/admin/mother">
            <Button variant="ghost" size="sm" className="text-white hover:bg-white/20 -ml-2">
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back
            </Button>
          </Link>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <Heart className="w-8 h-8" />
          <h1 className="text-2xl sm:text-3xl font-bold">Mother's Bookings</h1>
        </div>
        <p className="text-pink-100 text-sm sm:text-base">
          Manage all Mother's Canon R50 rental bookings
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Total</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">{motherBookings.length}</p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Clock className="w-4 h-4 text-orange-600" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Pending</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {motherBookings.filter(b => b.booking_status === 'pending_approval').length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Confirmed</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {motherBookings.filter(b => b.booking_status === 'confirmed').length}
            </p>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <XCircle className="w-4 h-4 text-slate-600" />
              <p className="text-xs font-semibold text-slate-500 uppercase">Completed</p>
            </div>
            <p className="text-2xl font-bold text-slate-900">
              {motherBookings.filter(b => b.booking_status === 'completed').length}
            </p>
          </CardContent>
        </Card>
      </motion.div>

      {/* Filters & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-slate-200 shadow-sm">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-4">
              <div className="relative flex-1 w-full sm:max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by name, phone, or ID..."
                  value={filters.search}
                  onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm"
                />
              </div>

              <Link href="/admin/bookings/add">
                <Button className="bg-pink-500 hover:bg-pink-600 text-white w-full sm:w-auto">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Booking
                </Button>
              </Link>
            </div>

            {/* Quick Filters */}
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'confirmed', 'completed'] as const).map((filter) => (
                <Button
                  key={filter}
                  onClick={() => setQuickFilter(filter)}
                  variant={quickFilter === filter ? 'default' : 'outline'}
                  size="sm"
                  className={quickFilter === filter ? 'bg-pink-500 hover:bg-pink-600' : ''}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Bookings Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">
              All Bookings ({sortedBookings.length})
            </CardTitle>
            <CardDescription className="text-xs">
              Complete list of Mother's Canon R50 bookings
            </CardDescription>
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            {/* Mobile Card View */}
            <div className="block md:hidden space-y-2 px-3">
              {sortedBookings.length > 0 ? (
                sortedBookings.map((booking, index) => (
                  <motion.div
                    key={booking.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 + index * 0.02 }}
                    className="bg-white border border-slate-200 rounded-lg p-3 space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="font-semibold text-sm text-slate-900">
                          {booking.customer?.full_name}
                        </p>
                        <p className="text-xs text-slate-500">{booking.customer?.phone}</p>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          #{booking.id.slice(0, 8)}
                        </p>
                      </div>
                      {getStatusBadge(booking.booking_status || 'pending_approval')}
                    </div>

                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" />
                      <span>
                        {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                      </span>
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

                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <p className="font-bold text-pink-600">RM{booking.total_amount}</p>
                      <div className="flex gap-1">
                        <Link href={`/admin/mother/bookings/${booking.id}`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Eye className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Link href={`/admin/bookings/${booking.id}/edit`}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <Edit className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                          onClick={() => handleDelete(booking.id)}
                          disabled={deletingId === booking.id}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-12">
                  <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
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
                    <TableHead className="font-semibold text-xs">Dates</TableHead>
                    <TableHead className="font-semibold text-xs">Amount</TableHead>
                    <TableHead className="font-semibold text-xs">Status</TableHead>
                    <TableHead className="font-semibold text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedBookings.length > 0 ? (
                    sortedBookings.map((booking, index) => (
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
                            <p className="font-medium text-slate-900">
                              {booking.customer?.full_name}
                            </p>
                            <p className="text-sm text-slate-500">{booking.customer?.phone}</p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm">
                            <p>
                              {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                            </p>
                            <p className="text-slate-500">
                              to {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <p className="font-bold text-pink-600">RM{booking.total_amount}</p>
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
                        <TableCell className="text-right">
                          <div className="flex gap-2 justify-end">
                            <Link href={`/admin/mother/bookings/${booking.id}`}>
                              <Button variant="ghost" size="sm">
                                <Eye className="w-4 h-4 mr-1" />
                                View
                              </Button>
                            </Link>
                            <Link href={`/admin/bookings/${booking.id}/edit`}>
                              <Button variant="ghost" size="sm">
                                <Edit className="w-4 h-4 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(booking.id)}
                              disabled={deletingId === booking.id}
                            >
                              <Trash2 className="w-4 h-4 mr-1" />
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <Camera className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-500 text-sm">No bookings found</p>
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

