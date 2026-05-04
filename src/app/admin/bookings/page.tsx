'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertCircle,
  ArrowUpDown,
  Calendar,
  Camera,
  CheckCircle2,
  Clock,
  Download,
  Edit,
  Eye,
  Heart,
  Plus,
  Search,
  SlidersHorizontal,
  Trash2,
  X,
  XCircle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAdminData } from '@/contexts/AdminDataContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { customToast } from '@/components/ui/toast-config';
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
  | 'name_asc'
  | 'name_desc'
  | 'date_newest'
  | 'date_oldest'
  | 'start_newest'
  | 'start_oldest'
  | 'amount_high'
  | 'amount_low';

type StatusTone = 'orange' | 'blue' | 'green' | 'red' | 'stone';

const statusConfig: Record<string, { label: string; icon: typeof Clock; tone: StatusTone }> = {
  pending_approval: { label: 'Pending Approval', icon: Clock, tone: 'orange' },
  confirmed: { label: 'Confirmed', icon: CheckCircle2, tone: 'blue' },
  approved: { label: 'Approved', icon: CheckCircle2, tone: 'blue' },
  completed: { label: 'Completed', icon: CheckCircle2, tone: 'green' },
  rejected: { label: 'Rejected', icon: XCircle, tone: 'red' },
  cancelled: { label: 'Cancelled', icon: XCircle, tone: 'stone' },
};

function formatShortDate(date: string) {
  return new Date(date).toLocaleDateString('en-MY', {
    month: 'short',
    day: 'numeric',
  });
}

function formatLongDate(date?: string | null) {
  if (!date) return 'Not scheduled';

  return new Date(date).toLocaleDateString('en-MY', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function formatDateRange(startDate: string, endDate: string) {
  return `${formatShortDate(startDate)} - ${formatShortDate(endDate)}`;
}

function titleCase(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getToneClasses(tone: StatusTone) {
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

function getToggleChipClasses(enabled: boolean, tone: 'orange' | 'green' | 'blue') {
  if (enabled) {
    if (tone === 'orange') {
      return 'border-[#664221] bg-[#352617] text-orange-200 hover:border-[#c96b2c]';
    }

    if (tone === 'green') {
      return 'border-[#335239] bg-[#1d2e21] text-emerald-200 hover:border-[#58a16a]';
    }

    return 'border-[#365066] bg-[#1d2933] text-sky-200 hover:border-[#6aa4c7]';
  }

  return 'border-[#39312a] bg-[#1a1714] text-stone-400 hover:border-[#5a4a3f] hover:text-stone-200';
}

export default function BookingsPage() {
  const { bookings, isLoading, mutateBookings } = useAdminData();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [processingActionId, setProcessingActionId] = useState<string | null>(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [quickFilter, setQuickFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
  const [includeMotherBookings, setIncludeMotherBookings] = useState(false);

  const getSavedSort = (): SortOption => {
    try {
      const saved = localStorage.getItem('desktopBookingSort');
      if (
        saved &&
        ['name_asc', 'name_desc', 'date_newest', 'date_oldest', 'start_newest', 'start_oldest', 'amount_high', 'amount_low'].includes(saved)
      ) {
        return saved as SortOption;
      }
    } catch (error) {
      console.error('Error loading saved sort:', error);
    }
    return 'date_newest';
  };

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

  const [sortBy, setSortBy] = useState<SortOption>(getSavedSort());
  const [filters, setFilters] = useState<FilterState>(loadSavedFilters());

  useEffect(() => {
    try {
      localStorage.setItem('desktopBookingFilters', JSON.stringify(filters));
    } catch (error) {
      console.error('Error saving filters:', error);
    }
  }, [filters]);

  useEffect(() => {
    try {
      localStorage.setItem('desktopBookingSort', sortBy);
    } catch (error) {
      console.error('Error saving sort:', error);
    }
  }, [sortBy]);

  useEffect(() => {
    mutateBookings();
  }, [mutateBookings]);

  const adminBookings = useMemo(() => {
    if (includeMotherBookings) {
      return bookings;
    }

    return bookings.filter((booking) => booking.camera?.name !== 'Canon R50 - Mother');
  }, [bookings, includeMotherBookings]);

  const uniqueCameras = useMemo(() => {
    const cameras = adminBookings.map((booking) => booking.camera?.name).filter(Boolean);
    return Array.from(new Set(cameras));
  }, [adminBookings]);

  const filteredBookings = useMemo(() => {
    const result = adminBookings.filter((booking) => {
      if (quickFilter !== 'all') {
        if (quickFilter === 'pending' && booking.booking_status !== 'pending_approval') return false;
        if (quickFilter === 'confirmed' && booking.booking_status !== 'confirmed') return false;
        if (quickFilter === 'completed' && booking.booking_status !== 'completed') return false;
      }

      if (filters.search) {
        const searchLower = filters.search.toLowerCase();
        const matchesName = booking.customer?.full_name?.toLowerCase().includes(searchLower);
        const matchesPhone = booking.customer?.phone?.toLowerCase().includes(searchLower);
        const matchesCamera = booking.camera?.name?.toLowerCase().includes(searchLower);
        const matchesId = booking.id.toLowerCase().includes(searchLower);

        if (!matchesName && !matchesPhone && !matchesCamera && !matchesId) return false;
      }

      if (filters.status.length > 0) {
        if (filters.status.includes('active_deposit')) {
          const hasActiveDeposit =
            booking.deposit_paid &&
            !booking.deposit_refunded &&
            booking.booking_status !== 'completed' &&
            booking.booking_status !== 'cancelled';

          if (!hasActiveDeposit) return false;
        }

        const regularStatuses = filters.status.filter((status) => status !== 'active_deposit');
        if (regularStatuses.length > 0 && !regularStatuses.includes(booking.booking_status)) {
          return false;
        }
      }

      if (filters.dateRange.start && filters.dateRange.end) {
        const bookingDate = new Date(booking.start_date);
        const startDate = new Date(filters.dateRange.start);
        const endDate = new Date(filters.dateRange.end);
        if (bookingDate < startDate || bookingDate > endDate) return false;
      }

      if (filters.pickupDate.start && filters.pickupDate.end && booking.pickup_date) {
        const pickupDate = new Date(booking.pickup_date);
        const startDate = new Date(filters.pickupDate.start);
        const endDate = new Date(filters.pickupDate.end);
        if (pickupDate < startDate || pickupDate > endDate) return false;
      }

      if (filters.paymentStatus === 'paid' && !booking.deposit_paid) return false;
      if (filters.paymentStatus === 'unpaid' && booking.deposit_paid) return false;

      if (filters.equipmentPickup === 'picked' && !booking.equipment_picked_up) return false;
      if (filters.equipmentPickup === 'not_picked' && booking.equipment_picked_up) return false;

      if (filters.equipmentReturn === 'returned' && !booking.equipment_returned) return false;
      if (filters.equipmentReturn === 'not_returned' && booking.equipment_returned) return false;

      if (filters.camera && booking.camera?.name !== filters.camera) return false;

      return true;
    });

    return result.sort((a, b) => {
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
  }, [adminBookings, filters, quickFilter, sortBy]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    if (quickFilter !== 'all') count++;
    if (filters.search) count++;
    if (filters.status.length > 0) count++;
    if (filters.dateRange.start && filters.dateRange.end) count++;
    if (filters.pickupDate.start && filters.pickupDate.end) count++;
    if (filters.paymentStatus !== 'all') count++;
    if (filters.equipmentPickup !== 'all') count++;
    if (filters.equipmentReturn !== 'all') count++;
    if (filters.camera) count++;
    return count;
  }, [filters, quickFilter]);

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
    setFilters((prev) => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter((item) => item !== status)
        : [...prev.status, status],
    }));
  };

  const stats = useMemo(() => {
    return {
      total: adminBookings.length,
      pending: adminBookings.filter((booking) => booking.booking_status === 'pending_approval').length,
      confirmed: adminBookings.filter((booking) => booking.booking_status === 'confirmed').length,
      completed: adminBookings.filter((booking) => booking.booking_status === 'completed').length,
    };
  }, [adminBookings]);

  const getStatusBadge = (status: string) => {
    const config = statusConfig[status] || { label: 'Needs Review', icon: AlertCircle, tone: 'stone' as const };
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getToneClasses(config.tone)}`}>
        <Icon className="h-3 w-3" />
        {config.label}
      </div>
    );
  };

  const getPrimaryAction = (booking: Booking) => {
    if (booking.booking_status === 'pending_approval') {
      return { id: 'approve', label: 'Approve booking' };
    }

    if (booking.booking_status === 'cancelled' || booking.booking_status === 'rejected') {
      return null;
    }

    if (!booking.final_payment_paid && !booking.equipment_picked_up) {
      return {
        id: 'customer_collected',
        label: booking.final_payment_amount > 0 ? 'Customer collected' : 'Mark collected',
      };
    }

    if (!booking.final_payment_paid && booking.final_payment_amount > 0) {
      return { id: 'final_payment', label: 'Collect final payment' };
    }

    if (!booking.equipment_picked_up) {
      return { id: 'pickup', label: 'Mark picked up' };
    }

    if (!booking.equipment_returned) {
      return { id: 'return', label: 'Complete return' };
    }

    return null;
  };

  const postBookingUpdate = async (endpoint: string, body: Record<string, unknown>) => {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to update booking');
    }

    return data;
  };

  const requestReviewAndOpen = async (booking: Booking) => {
    if (!booking.customer?.phone) {
      throw new Error('Customer phone number is required before sending a review link.');
    }

    const response = await fetch('/api/reviews/request', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerId: booking.customer_id,
        bookingId: booking.id,
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error || 'Failed to create review request');
    }

    const popup = window.open(data.whatsappUrl, '_blank', 'noopener,noreferrer');

    if (!popup && data.reviewUrl && navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(data.reviewUrl);
      return 'copied';
    }

    return 'opened';
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
        customToast.success('Booking deleted', 'The booking was removed from the board.');
      } else {
        customToast.error('Failed to delete booking', 'Please try again.');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
      customToast.error('Error deleting booking', 'Please try again.');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePrimaryAction = async (e: React.MouseEvent, booking: Booking) => {
    e.preventDefault();
    e.stopPropagation();

    const action = getPrimaryAction(booking);
    if (!action) return;

    const toastId = toast.loading('Processing booking...');
    setProcessingActionId(booking.id);

    try {
      const timestamp = new Date().toISOString();

      switch (action.id) {
        case 'approve':
          await postBookingUpdate(`/api/bookings/${booking.id}/approve`, {
            admin_notes: 'Approved from bookings board',
          });
          toast.success('Booking approved and deposit marked paid', { id: toastId });
          break;
        case 'customer_collected': {
          const updates = [];

          if (!booking.final_payment_paid && booking.final_payment_amount > 0) {
            updates.push(
              postBookingUpdate(`/api/bookings/${booking.id}/final-payment`, {
                final_payment_paid: true,
                final_payment_paid_date: timestamp,
              })
            );
          }

          if (!booking.equipment_picked_up) {
            updates.push(
              postBookingUpdate(`/api/bookings/${booking.id}/pickup-status`, {
                equipment_picked_up: true,
                equipment_pickup_notes: 'Marked from bookings board',
                equipment_condition_pickup: null,
              })
            );
          }

          await Promise.all(updates);
          toast.success('Customer collection completed', { id: toastId });
          break;
        }
        case 'final_payment':
          await postBookingUpdate(`/api/bookings/${booking.id}/final-payment`, {
            final_payment_paid: true,
            final_payment_paid_date: timestamp,
          });
          toast.success('Final payment collected', { id: toastId });
          break;
        case 'pickup':
          await postBookingUpdate(`/api/bookings/${booking.id}/pickup-status`, {
            equipment_picked_up: true,
            equipment_pickup_notes: 'Marked from bookings board',
            equipment_condition_pickup: null,
          });
          toast.success('Equipment marked picked up', { id: toastId });
          break;
        case 'return': {
          const updates = [
            postBookingUpdate(`/api/bookings/${booking.id}/return-status`, {
              equipment_returned: true,
              equipment_return_notes: 'Marked from bookings board',
              equipment_condition_return: null,
            }),
          ];

          if (!booking.equipment_picked_up) {
            updates.push(
              postBookingUpdate(`/api/bookings/${booking.id}/pickup-status`, {
                equipment_picked_up: true,
                equipment_pickup_notes: 'Marked from bookings board',
                equipment_condition_pickup: null,
              })
            );
          }

          if (!booking.final_payment_paid && booking.final_payment_amount > 0) {
            updates.push(
              postBookingUpdate(`/api/bookings/${booking.id}/final-payment`, {
                final_payment_paid: true,
                final_payment_paid_date: timestamp,
              })
            );
          }

          if (!booking.deposit_paid) {
            updates.push(
              postBookingUpdate(`/api/bookings/${booking.id}/deposit`, {
                deposit_paid: true,
                deposit_paid_date: timestamp,
              })
            );
          }

          await Promise.all(updates);

          try {
            const reviewResult = await requestReviewAndOpen(booking);

            if (reviewResult === 'copied') {
              toast.success('Return completed. Review link copied', { id: toastId });
            } else {
              toast.success('Return completed and review request opened', { id: toastId });
            }
          } catch (reviewError) {
            toast.success('Return completed', { id: toastId });
            customToast.error(
              'Review request not sent',
              reviewError instanceof Error ? reviewError.message : 'Send it manually from booking details.'
            );
          }
          break;
        }
      }

      mutateBookings();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Error processing booking', { id: toastId });
    } finally {
      setProcessingActionId(null);
    }
  };

  const handleToggleStatus = async (
    e: React.MouseEvent,
    booking: Booking,
    field: 'deposit_paid' | 'final_payment_paid' | 'equipment_picked_up' | 'equipment_returned'
  ) => {
    e.preventDefault();
    e.stopPropagation();

    const newValue = !booking[field];
    const toastId = toast.loading('Updating status...');

    try {
      if (field === 'equipment_picked_up' && newValue === true) {
        const timestamp = new Date().toISOString();
        const updates = [
          fetch(`/api/bookings/${booking.id}/pickup-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              equipment_picked_up: true,
              equipment_pickup_notes: null,
              equipment_condition_pickup: null,
            }),
          }),
        ];

        if (!booking.final_payment_paid && booking.final_payment_amount > 0) {
          updates.push(
            fetch(`/api/bookings/${booking.id}/final-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                final_payment_paid: true,
                final_payment_paid_date: timestamp,
              }),
            })
          );
        }

        await Promise.all(updates);
        toast.success('Pickup completed and final payment marked paid', { id: toastId });
        mutateBookings();
        return;
      }

      if (field === 'equipment_returned' && newValue === true) {
        const timestamp = new Date().toISOString();
        const updates = [
          fetch(`/api/bookings/${booking.id}/return-status`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              equipment_returned: true,
              equipment_return_notes: null,
              equipment_condition_return: null,
            }),
          }),
        ];

        if (!booking.equipment_picked_up) {
          updates.push(
            fetch(`/api/bookings/${booking.id}/pickup-status`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                equipment_picked_up: true,
                equipment_pickup_notes: null,
                equipment_condition_pickup: null,
              }),
            })
          );
        }

        if (!booking.final_payment_paid) {
          updates.push(
            fetch(`/api/bookings/${booking.id}/final-payment`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                final_payment_paid: true,
                final_payment_paid_date: timestamp,
              }),
            })
          );
        }

        if (!booking.deposit_paid) {
          updates.push(
            fetch(`/api/bookings/${booking.id}/deposit`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                deposit_paid: true,
                deposit_paid_date: timestamp,
              }),
            })
          );
        }

        await Promise.all(updates);
        toast.success('All items checked and return completed', { id: toastId });
        mutateBookings();
        return;
      }

      let endpoint = '';
      let body = {};
      const timestamp = newValue ? new Date().toISOString() : null;

      switch (field) {
        case 'deposit_paid':
          endpoint = `/api/bookings/${booking.id}/deposit`;
          body = { deposit_paid: newValue, deposit_paid_date: timestamp };
          break;
        case 'final_payment_paid':
          endpoint = `/api/bookings/${booking.id}/final-payment`;
          body = { final_payment_paid: newValue, final_payment_paid_date: timestamp };
          break;
        case 'equipment_picked_up':
          endpoint = `/api/bookings/${booking.id}/pickup-status`;
          body = { equipment_picked_up: newValue, equipment_pickup_notes: null, equipment_condition_pickup: null };
          break;
        case 'equipment_returned':
          endpoint = `/api/bookings/${booking.id}/return-status`;
          body = { equipment_returned: newValue, equipment_return_notes: null, equipment_condition_return: null };
          break;
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await response.json();

      if (data.success) {
        toast.success(`${field.replace(/_/g, ' ').replace('paid', '').trim()} updated`, { id: toastId });
        mutateBookings();
      } else {
        toast.error(data.error || 'Failed to update', { id: toastId });
      }
    } catch (error) {
      console.error(error);
      toast.error('Error updating status', { id: toastId });
    }
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  const attentionCount = stats.pending + filteredBookings.filter((booking) => !booking.deposit_paid).length;

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
                  <Calendar className="h-3.5 w-3.5 text-orange-300" />
                  Booking control
                </div>
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-stone-50">Bookings Board</h1>
                  <p className="max-w-2xl text-sm leading-6 text-stone-400">
                    Review the live rental pipeline, tighten filters, and manage every booking from one focused workspace.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
                <Button
                  variant="outline"
                  className="h-11 gap-2 border-[#3e342d] bg-[#191613] text-stone-100 hover:border-[#c96b2c] hover:bg-[#211b16] hover:text-orange-200"
                >
                  <Download className="h-4 w-4" />
                  Export list
                </Button>
                <Button
                  asChild
                  className="h-11 gap-2 rounded-xl bg-[#c96b2c] text-black hover:bg-[#d97a39]"
                >
                  <Link href="/admin/bookings/add">
                    <Plus className="h-4 w-4" />
                    New Booking
                  </Link>
                </Button>
              </div>
            </div>

            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Visible bookings</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{filteredBookings.length}</p>
                <p className="mt-2 text-sm text-stone-400">
                  {activeFilterCount > 0 ? `${activeFilterCount} filters active across the board.` : 'All current bookings are in view.'}
                </p>
              </div>
              <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Needs attention</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{attentionCount}</p>
                <p className="mt-2 text-sm text-stone-400">
                  Pending approvals plus bookings still waiting on deposit confirmation.
                </p>
              </div>
              <div className="rounded-2xl border border-[#3f3125] bg-[#241b14] p-4">
                <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Filter memory</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{includeMotherBookings ? 'ON' : 'OFF'}</p>
                <p className="mt-2 text-sm text-stone-400">
                  Sorting and filters are saved locally so your workspace stays the way you left it.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-[#2d2722] bg-[#171411] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <CardTitle className="text-lg text-stone-50">Board Insights</CardTitle>
            <CardDescription className="text-stone-400">
              A fast read on booking flow and payment readiness.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Confirmed rentals</p>
              <p className="mt-2 text-2xl font-semibold text-stone-50">{stats.confirmed}</p>
              <p className="mt-1 text-sm text-stone-400">Bookings already approved and ready to operate.</p>
            </div>
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Completed rentals</p>
              <p className="mt-2 text-2xl font-semibold text-stone-50">{stats.completed}</p>
              <p className="mt-1 text-sm text-stone-400">Closed bookings with equipment returned.</p>
            </div>
            <button
              type="button"
              onClick={() => setIncludeMotherBookings(!includeMotherBookings)}
              className={`flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left transition-colors ${
                includeMotherBookings
                  ? 'border-[#5a3b4b] bg-[#24161d] text-pink-100'
                  : 'border-[#2c2621] bg-[#1d1a17] text-stone-200 hover:border-[#4e4036]'
              }`}
              title={includeMotherBookings ? "Hide Mother's bookings" : "Show Mother's bookings"}
            >
              <div>
                <p className="text-sm font-semibold">Mother&apos;s R50 visibility</p>
                <p className="mt-1 text-xs text-stone-400">Toggle family-stock bookings into this desktop board.</p>
              </div>
              <div className={`flex h-10 w-10 items-center justify-center rounded-2xl ${includeMotherBookings ? 'bg-[#39232e] text-pink-200' : 'bg-[#26211d] text-stone-300'}`}>
                <Heart className={`h-4 w-4 ${includeMotherBookings ? 'fill-pink-200' : ''}`} />
              </div>
            </button>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-4"
      >
        <motion.div variants={item}>
          <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Total bookings</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-50">{stats.total}</p>
                  <p className="mt-1 text-sm text-stone-400">Current admin-visible booking count.</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#26211d] text-stone-300">
                  <Calendar className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="rounded-[24px] border border-[#3a2d22] bg-[#1c1511] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Pending approvals</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-50">{stats.pending}</p>
                  <p className="mt-1 text-sm text-stone-400">New requests still waiting for a decision.</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#302219] text-orange-300">
                  <Clock className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Confirmed</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-50">{stats.confirmed}</p>
                  <p className="mt-1 text-sm text-stone-400">Approved rentals currently moving through operations.</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d2933] text-sky-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={item}>
          <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Completed</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-50">{stats.completed}</p>
                  <p className="mt-1 text-sm text-stone-400">Rentals that have already fully closed out.</p>
                </div>
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f2b20] text-emerald-300">
                  <CheckCircle2 className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div>
          <Card className="w-full rounded-[28px] border border-[#2c2722] bg-[#171411] shadow-[0_24px_55px_rgba(0,0,0,0.28)]">
            <CardHeader className="border-b border-[#26211d] pb-4">
              <CardTitle className="text-lg text-stone-50">Queue Notes</CardTitle>
              <CardDescription className="text-stone-400">
                Small signals that help you triage the bookings board faster.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 p-5 md:grid-cols-3">
              <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Deposits outstanding</p>
                <p className="mt-2 text-2xl font-semibold text-stone-50">
                  {filteredBookings.filter((booking) => !booking.deposit_paid).length}
                </p>
                <p className="mt-1 text-sm text-stone-400">Bookings still waiting on the first payment checkpoint.</p>
              </div>
              <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Pickups scheduled</p>
                <p className="mt-2 text-2xl font-semibold text-stone-50">
                  {filteredBookings.filter((booking) => Boolean(booking.pickup_date)).length}
                </p>
                <p className="mt-1 text-sm text-stone-400">Bookings that already have a pickup date attached.</p>
              </div>
              <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Saved workspace</p>
                <p className="mt-2 text-sm leading-6 text-stone-300">
                  Search, sort, and advanced filters are stored in this browser to keep repeat admin sessions quick.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </motion.div>

      <AnimatePresence>
        {showFilterPanel && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Card className="overflow-hidden rounded-[28px] border border-[#2c2722] bg-[#171411] shadow-[0_24px_55px_rgba(0,0,0,0.28)]">
              <CardHeader className="border-b border-[#26211d] bg-[#1b1714] pb-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-lg text-stone-50">Advanced Filters</CardTitle>
                    <CardDescription className="mt-1 text-stone-400">
                      Narrow the board by booking lifecycle, payment status, equipment movement, or date ranges.
                    </CardDescription>
                  </div>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setShowFilterPanel(false)}
                    className="h-10 w-10 rounded-2xl border-[#3a3129] bg-[#191613] text-stone-200 hover:bg-[#221d18]"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-6 p-6">
                <div>
                  <label className="mb-3 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Booking status</label>
                  <div className="grid gap-2 md:grid-cols-3 xl:grid-cols-6">
                    {['pending_approval', 'confirmed', 'approved', 'completed', 'cancelled', 'active_deposit'].map((status) => (
                      <button
                        key={status}
                        type="button"
                        onClick={() => toggleStatus(status)}
                        className={`rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                          filters.status.includes(status)
                            ? 'border-[#c96b2c] bg-[#2a1f16] text-orange-200'
                            : 'border-[#39312a] bg-[#1a1714] text-stone-300 hover:border-[#57473c] hover:text-stone-100'
                        }`}
                      >
                        {status === 'active_deposit' ? 'Active Deposit' : titleCase(status)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-2">
                  <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                    <label className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Rental date range</label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs text-stone-500">Start date</label>
                        <input
                          type="date"
                          value={filters.dateRange.start}
                          onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: { ...prev.dateRange, start: e.target.value } }))}
                          className="admin-dark-input text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-stone-500">End date</label>
                        <input
                          type="date"
                          value={filters.dateRange.end}
                          onChange={(e) => setFilters((prev) => ({ ...prev, dateRange: { ...prev.dateRange, end: e.target.value } }))}
                          className="admin-dark-input text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                    <label className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Pickup date range</label>
                    <div className="grid gap-3 md:grid-cols-2">
                      <div className="space-y-2">
                        <label className="text-xs text-stone-500">Start date</label>
                        <input
                          type="date"
                          value={filters.pickupDate.start}
                          onChange={(e) => setFilters((prev) => ({ ...prev, pickupDate: { ...prev.pickupDate, start: e.target.value } }))}
                          className="admin-dark-input text-sm"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-xs text-stone-500">End date</label>
                        <input
                          type="date"
                          value={filters.pickupDate.end}
                          onChange={(e) => setFilters((prev) => ({ ...prev, pickupDate: { ...prev.pickupDate, end: e.target.value } }))}
                          className="admin-dark-input text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 lg:grid-cols-3">
                  <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                    <label className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Payment status</label>
                    <div className="space-y-2">
                      {(['all', 'paid', 'unpaid'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFilters((prev) => ({ ...prev, paymentStatus: status }))}
                          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                            filters.paymentStatus === status
                              ? 'border-[#c96b2c] bg-[#2a1f16] text-orange-200'
                              : 'border-[#39312a] bg-[#1a1714] text-stone-300 hover:border-[#57473c] hover:text-stone-100'
                          }`}
                        >
                          {titleCase(status)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                    <label className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Equipment pickup</label>
                    <div className="space-y-2">
                      {(['all', 'picked', 'not_picked'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFilters((prev) => ({ ...prev, equipmentPickup: status }))}
                          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                            filters.equipmentPickup === status
                              ? 'border-[#c96b2c] bg-[#2a1f16] text-orange-200'
                              : 'border-[#39312a] bg-[#1a1714] text-stone-300 hover:border-[#57473c] hover:text-stone-100'
                          }`}
                        >
                          {titleCase(status)}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#2b2520] bg-[#13110f] p-4">
                    <label className="mb-4 block text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Equipment return</label>
                    <div className="space-y-2">
                      {(['all', 'returned', 'not_returned'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setFilters((prev) => ({ ...prev, equipmentReturn: status }))}
                          className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-medium transition-colors ${
                            filters.equipmentReturn === status
                              ? 'border-[#c96b2c] bg-[#2a1f16] text-orange-200'
                              : 'border-[#39312a] bg-[#1a1714] text-stone-300 hover:border-[#57473c] hover:text-stone-100'
                          }`}
                        >
                          {titleCase(status)}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <Card className="rounded-[30px] border border-[#2c2722] bg-[#171411] shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <CardTitle className="text-xl text-stone-50">All Bookings</CardTitle>
                <CardDescription className="mt-1 text-stone-400">
                  Complete rental queue with live payment and equipment movement toggles.
                </CardDescription>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="rounded-full border border-[#39312a] bg-[#1a1714] px-3 py-1.5 text-stone-300">
                  Showing <span className="font-semibold text-stone-50">{filteredBookings.length}</span> of {adminBookings.length}
                </span>
                {isLoading && (
                  <span className="rounded-full border border-[#43372d] bg-[#241b14] px-3 py-1.5 text-orange-200">
                    Refreshing data...
                  </span>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-5 p-5">
            <div className="flex flex-wrap gap-2">
              {(['all', 'pending', 'confirmed', 'completed'] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setQuickFilter(tab)}
                  className={`rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition-colors ${
                    quickFilter === tab
                      ? 'border-[#c96b2c] bg-[#2d1f14] text-orange-200'
                      : 'border-[#39312a] bg-[#1a1714] text-stone-400 hover:border-[#56473c] hover:text-stone-100'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  placeholder="Search customer, phone, camera or booking ID..."
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  className="admin-dark-input pl-11 pr-11 text-sm"
                />
                {filters.search && (
                  <button
                    type="button"
                    onClick={() => setFilters((prev) => ({ ...prev, search: '' }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-500 transition-colors hover:text-stone-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => setShowFilterPanel(!showFilterPanel)}
                  className={`h-12 gap-2 rounded-2xl border-[#3a3129] text-stone-100 hover:bg-[#221d18] hover:text-stone-50 ${
                    activeFilterCount > 0 ? 'bg-[#241a12] text-orange-200' : 'bg-[#191613]'
                  }`}
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                  {activeFilterCount > 0 && (
                    <span className="rounded-full border border-[#5a4328] bg-[#332316] px-2 py-0.5 text-[11px] font-semibold text-orange-200">
                      {activeFilterCount}
                    </span>
                  )}
                </Button>

                {activeFilterCount > 0 && (
                  <Button
                    variant="outline"
                    onClick={clearAllFilters}
                    className="h-12 rounded-2xl border-[#3a3129] bg-[#191613] text-stone-200 hover:bg-[#221d18]"
                  >
                    Clear all
                  </Button>
                )}
              </div>
            </div>

            <div className={`grid gap-3 ${uniqueCameras.length > 0 ? 'lg:grid-cols-[minmax(0,1fr)_180px_180px]' : 'lg:grid-cols-[180px_180px]'}`}>
              {uniqueCameras.length > 0 && (
                <div className="space-y-2">
                  <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Camera filter</label>
                  <div className="relative">
                    <Camera className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                    <select
                      value={filters.camera}
                      onChange={(e) => setFilters((prev) => ({ ...prev, camera: e.target.value }))}
                      className="admin-dark-select appearance-none pl-11 pr-4 text-sm"
                    >
                      <option value="">All cameras</option>
                      {uniqueCameras.map((camera) => (
                        <option key={camera} value={camera}>{camera}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Sort order</label>
                <div className="relative">
                  <ArrowUpDown className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as SortOption)}
                    className="admin-dark-select appearance-none pl-11 pr-4 text-sm"
                  >
                    <option value="date_newest">Newest first</option>
                    <option value="date_oldest">Oldest first</option>
                    <option value="name_asc">Name A-Z</option>
                    <option value="name_desc">Name Z-A</option>
                    <option value="start_newest">Start date latest</option>
                    <option value="start_oldest">Start date earliest</option>
                    <option value="amount_high">Amount high-low</option>
                    <option value="amount_low">Amount low-high</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Results</label>
                <div className="flex h-12 items-center rounded-2xl border border-[#322b26] bg-[#11100f] px-4 text-sm text-stone-300">
                  <span className="font-semibold text-stone-50">{filteredBookings.length}</span>
                  <span className="ml-1 text-stone-500">of {adminBookings.length}</span>
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-[24px] border border-[#2d2722] bg-[#12100f]">
              <Table>
                <TableHeader>
                  <TableRow className="border-[#26211d] bg-[#181512] hover:bg-[#181512]">
                    <TableHead className="h-14 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Booking</TableHead>
                    <TableHead className="h-14 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Customer</TableHead>
                    <TableHead className="h-14 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Rental</TableHead>
                    <TableHead className="h-14 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Pickup</TableHead>
                    <TableHead className="h-14 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Amount</TableHead>
                    <TableHead className="h-14 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Status</TableHead>
                    <TableHead className="h-14 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBookings.length > 0 ? (
                    filteredBookings.map((booking) => {
                      const primaryAction = getPrimaryAction(booking);
                      const isProcessingAction = processingActionId === booking.id;

                      return (
                        <TableRow
                          key={booking.id}
                          className="border-[#211d19] transition-colors hover:bg-[#171411]"
                        >
                        <TableCell className="align-top">
                          <div className="space-y-2">
                            <div className="font-mono text-sm text-stone-200">#{booking.id.slice(0, 8)}</div>
                            <div className="text-xs text-stone-500">
                              Created {formatLongDate(booking.created_at)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="space-y-2">
                            <p className="font-semibold text-stone-100">{booking.customer?.full_name || 'No customer name'}</p>
                            <p className="text-sm text-stone-400">{booking.customer?.phone || 'No phone number'}</p>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2 text-stone-100">
                              <Camera className="h-4 w-4 text-stone-500" />
                              <span className="text-sm font-medium">{booking.camera?.name || 'No camera assigned'}</span>
                            </div>
                            <div className="text-sm text-stone-400">
                              <p>{formatDateRange(booking.start_date, booking.end_date)}</p>
                              <p className="text-xs text-stone-500">{booking.total_days} days</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="space-y-2 text-sm">
                            <p className="text-stone-200">{formatLongDate(booking.pickup_date)}</p>
                            <p className="text-xs text-stone-500">
                              {booking.equipment_picked_up ? 'Equipment picked up' : 'Pickup still pending'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="space-y-2">
                            <p className="text-lg font-semibold text-stone-50">RM{booking.total_amount}</p>
                            <p className="text-xs text-stone-500">
                              {booking.deposit_paid ? 'Deposit paid' : 'Deposit unpaid'}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="space-y-3">
                            <div className="flex flex-wrap items-center gap-2">
                              {getStatusBadge(booking.booking_status || 'pending_approval')}
                              {primaryAction && (
                                <button
                                  type="button"
                                  onClick={(e) => handlePrimaryAction(e, booking)}
                                  disabled={isProcessingAction}
                                  className="rounded-full border border-[#5a4328] bg-[#332316] px-3 py-1 text-[11px] font-semibold text-orange-200 transition-colors hover:border-[#c96b2c] hover:bg-[#3c2918] disabled:cursor-not-allowed disabled:opacity-60"
                                >
                                  {isProcessingAction ? 'Working...' : primaryAction.label}
                                </button>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-1.5">
                              <button
                                type="button"
                                onClick={(e) => handleToggleStatus(e, booking, 'deposit_paid')}
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${getToggleChipClasses(Boolean(booking.deposit_paid), 'orange')}`}
                              >
                                {booking.deposit_paid ? 'Paid deposit' : 'Deposit pending'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleToggleStatus(e, booking, 'final_payment_paid')}
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${getToggleChipClasses(Boolean(booking.final_payment_paid), 'green')}`}
                              >
                                {booking.final_payment_paid ? 'Final paid' : 'Final pending'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleToggleStatus(e, booking, 'equipment_picked_up')}
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${getToggleChipClasses(Boolean(booking.equipment_picked_up), 'blue')}`}
                              >
                                {booking.equipment_picked_up ? 'Picked up' : 'Pickup pending'}
                              </button>
                              <button
                                type="button"
                                onClick={(e) => handleToggleStatus(e, booking, 'equipment_returned')}
                                className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold transition-colors ${getToggleChipClasses(Boolean(booking.equipment_returned), 'green')}`}
                              >
                                {booking.equipment_returned ? 'Returned' : 'Return pending'}
                              </button>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="align-top">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              asChild
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-2xl border-[#3a3129] bg-[#171411] text-stone-200 hover:bg-[#221d18]"
                            >
                              <Link href={`/admin/bookings/${booking.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              asChild
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-2xl border-[#3a3129] bg-[#171411] text-stone-200 hover:bg-[#221d18]"
                            >
                              <Link href={`/admin/bookings/${booking.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-10 w-10 rounded-2xl border-[#4a2d2d] bg-[#1e1515] text-rose-200 hover:border-[#7a3e3e] hover:bg-[#281818] hover:text-rose-100"
                              onClick={() => handleDelete(booking.id)}
                              disabled={deletingId === booking.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow className="border-[#211d19] hover:bg-transparent">
                      <TableCell colSpan={7} className="py-16">
                        <div className="flex flex-col items-center gap-3 text-center">
                          <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#312924] bg-[#171411]">
                            <Calendar className="h-6 w-6 text-stone-500" />
                          </div>
                          <div className="space-y-1">
                            <p className="text-lg font-medium text-stone-100">No bookings found</p>
                            <p className="text-sm text-stone-500">Try widening the filters or clearing the current workspace.</p>
                          </div>
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
