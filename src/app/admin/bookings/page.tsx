'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  AlertCircle
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

export default function BookingsPage() {
  const router = useRouter();
  const { bookings, isLoading, mutateBookings } = useAdminData();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter and search bookings
  const filteredBookings = useMemo(() => {
    return bookings.filter(booking => {
      const matchesSearch = 
        booking.customer?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.customer?.phone?.includes(searchQuery) ||
        booking.camera?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        booking.id.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || booking.booking_status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [bookings, searchQuery, statusFilter]);

  // Stats
  const stats = useMemo(() => {
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.booking_status === 'pending_approval').length,
      confirmed: bookings.filter(b => b.booking_status === 'confirmed').length,
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
    <div className="space-y-4">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500 mt-0.5 text-sm">Manage all camera rental bookings</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" className="gap-2 text-sm h-9">
            <Download className="w-4 h-4" />
            Export
          </Button>
          <Link href="/admin/bookings/add">
            <Button className="gap-2 text-sm h-9">
              <Plus className="w-4 h-4" />
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
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <motion.div variants={item}>
          <Card className="border-slate-200 rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Total Bookings</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats.total}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-slate-200 rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Pending</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats.pending}</p>
                </div>
                <div className="w-10 h-10 bg-orange-50 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-slate-200 rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Confirmed</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats.confirmed}</p>
                </div>
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="border-slate-200 rounded-xl">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-600 uppercase tracking-wide">Completed</p>
                  <p className="text-2xl font-bold text-slate-900 mt-2">{stats.completed}</p>
                </div>
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Filters and Search */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="border-slate-200 rounded-xl">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by customer, phone, camera, or booking ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent placeholder:text-slate-400"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending_approval">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="rejected">Rejected</option>
                <option value="cancelled">Cancelled</option>
              </select>
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
        <Card className="border-slate-200 rounded-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-bold text-slate-900">All Bookings ({filteredBookings.length})</CardTitle>
            <CardDescription className="text-xs text-slate-600 mt-1">Complete list of camera rental bookings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-lg border border-slate-200 overflow-hidden">
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
                          {getStatusBadge(booking.booking_status || 'pending_approval')}
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

