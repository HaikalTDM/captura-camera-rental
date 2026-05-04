'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import useSWR from 'swr';
import { motion } from 'framer-motion';
import { useAdminData } from '@/contexts/AdminDataContext';
import { getAllCustomers } from '@/lib/api/bookings';
import type { Customer } from '@/lib/supabase';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import {
  ArrowUpDown,
  Calendar,
  DollarSign,
  Eye,
  Mail,
  MessageCircle,
  Phone,
  Search,
  ShoppingBag,
  Star,
  Trash2,
  TrendingUp,
  UserPlus,
  Users,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AnimatedToastContainer, useAnimatedToast } from '@/components/ui/animated-toast';

type CustomerSort = 'full_name' | 'totalSpent' | 'totalRentals' | 'created_at';

type CustomerWithMetrics = Customer & {
  totalRentals: number;
  totalSpent: number;
  lastRental: string | null;
};

function getReliabilityTone(totalRentals: number) {
  if (totalRentals >= 5) return 'border-[#30412f] bg-[#1f2b20] text-emerald-200';
  if (totalRentals >= 2) return 'border-[#31414f] bg-[#1c242c] text-sky-200';
  if (totalRentals >= 1) return 'border-[#4b3723] bg-[#2b2117] text-orange-200';
  return 'border-[#3a3129] bg-[#221f1b] text-stone-300';
}

function getReliabilityLabel(totalRentals: number) {
  if (totalRentals >= 5) return 'VIP';
  if (totalRentals >= 2) return 'Good';
  if (totalRentals >= 1) return 'Fair';
  return 'New';
}

export default function CustomersPage() {
  const { bookings, isLoading: bookingsLoading } = useAdminData();
  const { data: customers = [], isLoading: customersLoading, mutate } = useSWR<Customer[]>(
    'admin-customers',
    getAllCustomers,
    {
      revalidateOnFocus: false,
      refreshInterval: 0,
      shouldRetryOnError: false,
      revalidateIfStale: false,
      onError: (error) => {
        console.error('Error fetching customers:', error);
      },
    }
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<CustomerSort>('full_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedCustomers, setSelectedCustomers] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toasts, success, error, info, removeToast } = useAnimatedToast();

  const isLoading = bookingsLoading || customersLoading;

  const customersWithMetrics = useMemo<CustomerWithMetrics[]>(() => {
    return customers.map((customer) => {
      const customerBookings = bookings.filter((booking) => booking.customer_id === customer.id);
      const paidBookings = customerBookings.filter((booking) => booking.deposit_paid && booking.final_payment_paid);
      const totalSpent = paidBookings.reduce((sum, booking) => {
        const isNewPaymentSystem = booking.deposit_amount === 100;
        return sum + (isNewPaymentSystem ? booking.deposit_amount + booking.final_payment_amount : booking.total_amount);
      }, 0);
      const lastRental = customerBookings.length > 0
        ? Math.max(...customerBookings.map((booking) => new Date(booking.created_at).getTime()))
        : null;

      return {
        ...customer,
        totalRentals: customerBookings.length,
        totalSpent,
        lastRental: lastRental ? new Date(lastRental).toISOString().split('T')[0] : null,
      };
    });
  }, [customers, bookings]);

  const filteredCustomers = useMemo(() => {
    return customersWithMetrics
      .filter((customer) =>
        customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone.includes(searchTerm) ||
        customer.email.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        let aValue: string | number = a[sortBy] as string | number;
        let bValue: string | number = b[sortBy] as string | number;

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = String(bValue).toLowerCase();
        }

        if (sortOrder === 'asc') {
          return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        }

        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      });
  }, [customersWithMetrics, searchTerm, sortBy, sortOrder]);

  const getCustomerBookings = (customerId: string) => {
    return bookings.filter((booking) => booking.customer_id === customerId);
  };

  const handleSelectCustomer = (customerId: string) => {
    setSelectedCustomers((prev) =>
      prev.includes(customerId) ? prev.filter((id) => id !== customerId) : [...prev, customerId]
    );
  };

  const handleSelectAll = () => {
    if (selectedCustomers.length === filteredCustomers.length) {
      setSelectedCustomers([]);
    } else {
      setSelectedCustomers(filteredCustomers.map((customer) => customer.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedCustomers.length === 0) {
      info('No customers selected', 'Select one or more customers before deleting.');
      return;
    }

    const confirmMessage = `Are you sure you want to delete ${selectedCustomers.length} customer(s)? This action cannot be undone.`;
    if (!confirm(confirmMessage)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch('/api/customers/bulk-delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerIds: selectedCustomers }),
      });

      const data = await response.json();

      if (data.success) {
        const { summary } = data;
        const summaryParts = [`Deleted: ${summary.deleted}`];
        if (summary.skipped > 0) summaryParts.push(`Skipped: ${summary.skipped}`);
        if (summary.failed > 0) summaryParts.push(`Failed: ${summary.failed}`);

        success('Bulk delete completed', summaryParts.join(' • '));
        mutate();
        setSelectedCustomers([]);
      } else {
        error('Bulk delete failed', data.error || 'Please try again.');
      }
    } catch (deleteError) {
      console.error('Error deleting customers:', deleteError);
      error('Bulk delete failed', 'Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingleCustomer = async (customerId: string) => {
    const customer = customers.find((item) => item.id === customerId);
    if (!customer) return;

    if (!confirm(`Are you sure you want to delete ${customer.full_name}? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/customers/${customerId}/delete`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        success('Customer deleted', `${customer.full_name} was removed from the database.`);
        mutate();
      } else {
        error('Delete failed', data.error || 'Please try again.');
      }
    } catch (deleteError) {
      console.error('Error deleting customer:', deleteError);
      error('Delete failed', 'Please try again.');
    }
  };

  const customerStats = useMemo(() => {
    return {
      total: customers.length,
      excellent: customersWithMetrics.filter((customer) => customer.totalRentals >= 5).length,
      good: customersWithMetrics.filter((customer) => customer.totalRentals >= 2 && customer.totalRentals < 5).length,
      fair: customersWithMetrics.filter((customer) => customer.totalRentals >= 1 && customer.totalRentals < 2).length,
      new: customersWithMetrics.filter((customer) => customer.totalRentals === 0).length,
      totalSpent: customersWithMetrics.reduce((sum, customer) => sum + customer.totalSpent, 0),
    };
  }, [customers, customersWithMetrics]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#c96b2c]"></div>
          <p className="mt-4 text-stone-500">Loading customer database...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatedToastContainer toasts={toasts} onClose={removeToast} />
      <div className="space-y-6 px-2 pb-8 xl:px-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_340px]"
      >
        <Card className="rounded-[30px] border border-[#2d2722] bg-[radial-gradient(circle_at_top,_rgba(201,107,44,0.12),_transparent_42%),linear-gradient(180deg,#1c1713_0%,#141210_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
          <CardContent className="p-6 md:p-7">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#43372d] bg-[#1d1814] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
                <Users className="h-3.5 w-3.5 text-orange-300" />
                Customer desk
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-stone-50">Customer Database</h1>
                <p className="max-w-2xl text-sm leading-6 text-stone-400">
                  Review relationship history, spending, and reliability at a glance while keeping customer actions close to the booking workflow.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Visible customers</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-50">{filteredCustomers.length}</p>
                  <p className="mt-2 text-sm text-stone-400">Customers currently shown after search and sort.</p>
                </div>
                <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Total spend</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-50">RM{customerStats.totalSpent.toFixed(0)}</p>
                  <p className="mt-2 text-sm text-stone-400">Revenue collected from customers with fully paid bookings.</p>
                </div>
                <div className="rounded-2xl border border-[#3f3125] bg-[#241b14] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Selected</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-50">{selectedCustomers.length}</p>
                  <p className="mt-2 text-sm text-stone-400">Customers currently selected for bulk action.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-[#2d2722] bg-[#171411] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <CardTitle className="text-lg text-stone-50">Relationship Notes</CardTitle>
            <CardDescription className="text-stone-400">
              A fast read on the customer mix inside the current database.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">VIP customers</p>
              <p className="mt-2 text-2xl font-semibold text-stone-50">{customerStats.excellent}</p>
              <p className="mt-1 text-sm text-stone-400">Customers with five or more completed rental relationships.</p>
            </div>
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">New customers</p>
              <p className="mt-2 text-2xl font-semibold text-stone-50">{customerStats.new}</p>
              <p className="mt-1 text-sm text-stone-400">People in the database who have not rented yet.</p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid gap-3 md:grid-cols-2 xl:grid-cols-5"
      >
        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Total</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{customerStats.total}</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#26211d] text-stone-300">
                <Users className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Excellent</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{customerStats.excellent}</p>
                <p className="mt-1 text-sm text-stone-400">5+ rentals</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1f2b20] text-emerald-300">
                <Star className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Good</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{customerStats.good}</p>
                <p className="mt-1 text-sm text-stone-400">2-4 rentals</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#1d2933] text-sky-300">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#3a2d22] bg-[#1c1511] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Fair</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{customerStats.fair}</p>
                <p className="mt-1 text-sm text-stone-400">1 rental</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#302219] text-orange-300">
                <ShoppingBag className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-[#2c2722] bg-[#171411] shadow-[0_20px_45px_rgba(0,0,0,0.24)]">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">New</p>
                <p className="mt-3 text-3xl font-semibold text-stone-50">{customerStats.new}</p>
                <p className="mt-1 text-sm text-stone-400">No rentals yet</p>
              </div>
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#241b14] text-orange-300">
                <UserPlus className="h-5 w-5" />
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="space-y-6"
      >
        <Card className="rounded-[28px] border border-[#2c2722] bg-[#171411] shadow-[0_24px_55px_rgba(0,0,0,0.28)]">
          <CardContent className="space-y-5 p-5">
            <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Search customers
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Search by name, phone, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-dark-input pl-11 pr-4 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as CustomerSort)}
                  className="admin-dark-select text-sm"
                >
                  <option value="full_name">Name</option>
                  <option value="totalSpent">Total Spent</option>
                  <option value="totalRentals">Total Rentals</option>
                  <option value="created_at">Join Date</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Sort order
                </label>
                <Button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  variant="outline"
                  className="h-12 rounded-2xl border-[#3a3129] bg-[#191613] text-stone-200 hover:bg-[#221d18]"
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </div>
            </div>

            {filteredCustomers.length > 0 && (
              <div className="border-t border-[#26211d] pt-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-2 text-sm font-medium text-stone-300">
                      <input
                        type="checkbox"
                        checked={selectedCustomers.length === filteredCustomers.length && filteredCustomers.length > 0}
                        onChange={handleSelectAll}
                        className="h-5 w-5 rounded border-[#4b4137] bg-[#11100f] text-[#c96b2c] focus:ring-[#c96b2c]"
                      />
                      Select all ({filteredCustomers.length})
                    </label>
                    {selectedCustomers.length > 0 && (
                      <span className="rounded-full border border-[#4b3723] bg-[#2b2117] px-3 py-1.5 text-sm font-semibold text-orange-200">
                        {selectedCustomers.length} selected
                      </span>
                    )}
                  </div>

                  {selectedCustomers.length > 0 && (
                    <Button
                      onClick={handleBulkDelete}
                      disabled={isDeleting}
                      variant="outline"
                      className="h-11 rounded-2xl border-[#4a2d2d] bg-[#1e1515] text-rose-200 hover:border-[#7a3e3e] hover:bg-[#281818] hover:text-rose-100"
                    >
                      {isDeleting ? (
                        <>
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-rose-200/40 border-t-rose-100"></div>
                          Deleting...
                        </>
                      ) : (
                        <>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Selected ({selectedCustomers.length})
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
          {filteredCustomers.length > 0 ? (
            filteredCustomers.map((customer) => {
              const customerBookings = getCustomerBookings(customer.id);
              const activeBookings = customerBookings.filter((booking) => booking.status === 'active').length;
              const overduePayments = customerBookings.filter(
                (booking) =>
                  !booking.final_payment_paid &&
                  new Date(booking.end_date) < new Date() &&
                  booking.status === 'completed'
              ).length;

              return (
                <div
                  key={customer.id}
                  className="rounded-[26px] border border-[#2d2722] bg-[#12100f] p-5 shadow-[0_18px_40px_rgba(0,0,0,0.22)]"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <label className="mt-1 flex cursor-pointer items-center">
                        <input
                          type="checkbox"
                          checked={selectedCustomers.includes(customer.id)}
                          onChange={() => handleSelectCustomer(customer.id)}
                          className="h-5 w-5 rounded border-[#4b4137] bg-[#11100f] text-[#c96b2c] focus:ring-[#c96b2c]"
                        />
                      </label>
                      <div className="space-y-2">
                        <h3 className="text-xl font-semibold text-stone-50">{customer.full_name}</h3>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 text-sm text-stone-400">
                            <Phone className="h-4 w-4 text-stone-500" />
                            <span>{customer.phone}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-stone-400">
                            <Mail className="h-4 w-4 text-stone-500" />
                            <span>{customer.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <span className={`rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getReliabilityTone(customer.totalRentals)}`}>
                      {getReliabilityLabel(customer.totalRentals)}
                    </span>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl border border-[#2b2520] bg-[#171411] p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <ShoppingBag className="h-4 w-4 text-stone-500" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Rentals</p>
                      </div>
                      <p className="text-2xl font-semibold text-stone-50">{customer.totalRentals}</p>
                    </div>
                    <div className="rounded-2xl border border-[#3a2d22] bg-[#1c1511] p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <DollarSign className="h-4 w-4 text-orange-300" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-orange-300">Spent</p>
                      </div>
                      <p className="text-2xl font-semibold text-stone-50">RM{customer.totalSpent.toFixed(0)}</p>
                    </div>
                    <div className="col-span-2 rounded-2xl border border-[#2b2520] bg-[#171411] p-4">
                      <div className="mb-1 flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-stone-500" />
                        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">Last rental</p>
                      </div>
                      <p className="text-sm font-medium text-stone-100">{customer.lastRental || 'No rentals yet'}</p>
                    </div>
                  </div>

                  {(activeBookings > 0 || overduePayments > 0) && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {activeBookings > 0 && (
                        <span className="rounded-full border border-[#31414f] bg-[#1c242c] px-3 py-1.5 text-xs font-semibold text-sky-200">
                          {activeBookings} Active
                        </span>
                      )}
                      {overduePayments > 0 && (
                        <span className="rounded-full border border-[#503130] bg-[#2a1b1a] px-3 py-1.5 text-xs font-semibold text-rose-200">
                          {overduePayments} Overdue
                        </span>
                      )}
                    </div>
                  )}

                  {customer.notes && (
                    <div className="mt-4 rounded-2xl border border-[#4b3723] bg-[#2b2117] p-4">
                      <p className="text-sm text-orange-100">{customer.notes}</p>
                    </div>
                  )}

                  <div className="mt-5 flex gap-3">
                    <Button
                      asChild
                      variant="outline"
                      className="flex-1 h-11 rounded-2xl border-[#3a3129] bg-[#171411] text-stone-200 hover:bg-[#221d18]"
                    >
                      <Link href={`/admin/customers/${customer.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="flex-1 h-11 rounded-2xl bg-[#1f6b45] text-white hover:bg-[#258555]"
                    >
                      <a
                        href={`https://wa.me/${formatPhoneWithCountryCode(customer.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <MessageCircle className="mr-2 h-4 w-4" />
                        WhatsApp
                      </a>
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleDeleteSingleCustomer(customer.id)}
                    variant="outline"
                    className="mt-3 h-10 w-full rounded-2xl border-[#4a2d2d] bg-[#1e1515] text-rose-200 hover:border-[#7a3e3e] hover:bg-[#281818] hover:text-rose-100"
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Customer
                  </Button>
                </div>
              );
            })
          ) : customers.length === 0 ? (
            <div className="col-span-full rounded-[30px] border border-[#2c2722] bg-[#171411] p-16 text-center shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
              <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border border-[#312924] bg-[#12100f]">
                <Users className="h-12 w-12 text-stone-500" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-stone-50">No Customers Yet</h3>
              <p className="mt-2 text-stone-400">Start building your customer base by creating your first booking.</p>
              <Button asChild className="mt-8 h-12 rounded-2xl bg-[#c96b2c] text-black hover:bg-[#d97a39]">
                <Link href="/admin/bookings/add">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create First Booking
                </Link>
              </Button>
            </div>
          ) : (
            <div className="col-span-full rounded-[30px] border border-[#2c2722] bg-[#171411] p-16 text-center shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full border border-[#312924] bg-[#12100f]">
                <Search className="h-10 w-10 text-stone-500" />
              </div>
              <h3 className="mt-6 text-2xl font-semibold text-stone-50">No customers found</h3>
              <p className="mt-2 text-stone-400">Try adjusting your search terms or sort settings.</p>
            </div>
          )}
        </div>
      </motion.div>
      </div>
    </>
  );
}
