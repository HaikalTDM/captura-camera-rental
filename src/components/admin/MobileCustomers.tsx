'use client';

import type { Dispatch, SetStateAction } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
  Trash2,
  UserPlus,
  Users,
} from 'lucide-react';
import type { Booking, Customer } from '@/lib/supabase';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type CustomerSort = 'full_name' | 'totalSpent' | 'totalRentals' | 'created_at';

export type CustomerWithMetrics = Customer & {
  totalRentals: number;
  totalSpent: number;
  lastRental: string | null;
};

interface MobileCustomersProps {
  customers: Customer[];
  filteredCustomers: CustomerWithMetrics[];
  searchTerm: string;
  setSearchTerm: Dispatch<SetStateAction<string>>;
  sortBy: CustomerSort;
  setSortBy: Dispatch<SetStateAction<CustomerSort>>;
  sortOrder: 'asc' | 'desc';
  setSortOrder: Dispatch<SetStateAction<'asc' | 'desc'>>;
  selectedCustomers: string[];
  handleSelectCustomer: (customerId: string) => void;
  handleSelectAll: () => void;
  handleBulkDelete: () => void | Promise<void>;
  handleDeleteSingleCustomer: (customerId: string) => void | Promise<void>;
  isDeleting: boolean;
  customerStats: {
    total: number;
    excellent: number;
    good: number;
    fair: number;
    new: number;
    totalSpent: number;
  };
  getCustomerBookings: (customerId: string) => Booking[];
}

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

export default function MobileCustomers({
  customers,
  filteredCustomers,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  selectedCustomers,
  handleSelectCustomer,
  handleSelectAll,
  handleBulkDelete,
  handleDeleteSingleCustomer,
  isDeleting,
  customerStats,
  getCustomerBookings,
}: MobileCustomersProps) {
  return (
    <div className="space-y-4 px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#332b25] bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.18),_transparent_45%),linear-gradient(135deg,#1b1714_0%,#171411_60%,#141210_100%)] p-4 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5a4328] bg-[#332316]">
              <Users className="h-5 w-5 text-orange-300" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-100">Customers</h1>
              <p className="text-xs text-stone-400">{customers.length} people in your database</p>
            </div>
          </div>

          <Link
            href="/admin/bookings/add"
            className="flex items-center gap-2 rounded-xl bg-[#c96b2c] px-3 py-2 text-sm font-semibold text-stone-950 active:scale-95"
          >
            <UserPlus className="h-4 w-4" />
            Add
          </Link>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-orange-300">{filteredCustomers.length}</p>
            <p className="text-[10px] text-stone-500">Shown</p>
          </div>
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-stone-200">{customerStats.excellent}</p>
            <p className="text-[10px] text-stone-500">VIP</p>
          </div>
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-orange-200">RM{customerStats.totalSpent.toFixed(0)}</p>
            <p className="text-[10px] text-stone-500">Spend</p>
          </div>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
          <CardContent className="space-y-3 p-4">
            <div className="space-y-2">
              <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                Search customers
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Name, phone, or email..."
                  className="h-11 w-full rounded-2xl border border-[#322b26] bg-[#11100f] pl-11 pr-4 text-sm text-stone-100 outline-none placeholder:text-stone-500 focus:border-[#c96b2c]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as CustomerSort)}
                  className="h-11 w-full rounded-2xl border border-[#322b26] bg-[#11100f] px-4 text-sm text-stone-100 outline-none focus:border-[#c96b2c]"
                >
                  <option value="full_name">Name</option>
                  <option value="totalSpent">Spent</option>
                  <option value="totalRentals">Rentals</option>
                  <option value="created_at">Join date</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Order
                </label>
                <Button
                  onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                  variant="outline"
                  className="h-11 w-full rounded-2xl border-[#3a3129] bg-[#191613] text-stone-200 hover:bg-[#221d18]"
                >
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  {sortOrder === 'asc' ? 'Ascending' : 'Descending'}
                </Button>
              </div>
            </div>

            {filteredCustomers.length > 0 && (
              <div className="space-y-3 rounded-2xl border border-[#2c2722] bg-[#1b1714] p-3">
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
                  <Button
                    onClick={handleBulkDelete}
                    disabled={isDeleting}
                    variant="outline"
                    className="h-11 w-full rounded-2xl border-[#4a2d2d] bg-[#1e1515] text-rose-200 hover:border-[#7a3e3e] hover:bg-[#281818] hover:text-rose-100"
                  >
                    {isDeleting ? 'Deleting...' : `Delete Selected (${selectedCustomers.length})`}
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      <div className="space-y-3">
        {filteredCustomers.length > 0 ? (
          filteredCustomers.map((customer, index) => {
            const customerBookings = getCustomerBookings(customer.id);
            const activeBookings = customerBookings.filter((booking) => booking.status === 'active').length;
            const overduePayments = customerBookings.filter(
              (booking) =>
                !booking.final_payment_paid &&
                new Date(booking.end_date) < new Date() &&
                booking.status === 'completed'
            ).length;

            return (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: Math.min(index * 0.04, 0.25) }}
              >
                <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <label className="mt-1 flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={selectedCustomers.includes(customer.id)}
                            onChange={() => handleSelectCustomer(customer.id)}
                            className="h-5 w-5 rounded border-[#4b4137] bg-[#11100f] text-[#c96b2c] focus:ring-[#c96b2c]"
                          />
                        </label>
                        <div className="min-w-0">
                          <h3 className="truncate text-base font-semibold text-stone-100">{customer.full_name}</h3>
                          <div className="mt-1 space-y-1.5">
                            <div className="flex items-center gap-2 text-sm text-stone-400">
                              <Phone className="h-4 w-4 text-stone-500" />
                              <span className="truncate">{customer.phone}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-stone-400">
                              <Mail className="h-4 w-4 text-stone-500" />
                              <span className="truncate">{customer.email}</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <span className={`shrink-0 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] ${getReliabilityTone(customer.totalRentals)}`}>
                        {getReliabilityLabel(customer.totalRentals)}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <div className="rounded-xl border border-[#2c2722] bg-[#1b1714] p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <ShoppingBag className="h-4 w-4 text-stone-500" />
                          <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Rentals</p>
                        </div>
                        <p className="text-lg font-semibold text-stone-100">{customer.totalRentals}</p>
                      </div>
                      <div className="rounded-xl border border-[#3a2d22] bg-[#1c1511] p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <DollarSign className="h-4 w-4 text-orange-300" />
                          <p className="text-[10px] uppercase tracking-[0.18em] text-orange-300">Spent</p>
                        </div>
                        <p className="text-lg font-semibold text-stone-100">RM{customer.totalSpent.toFixed(0)}</p>
                      </div>
                      <div className="col-span-2 rounded-xl border border-[#2c2722] bg-[#1b1714] p-3">
                        <div className="mb-1 flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-stone-500" />
                          <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Last rental</p>
                        </div>
                        <p className="text-sm font-medium text-stone-100">{customer.lastRental || 'No rentals yet'}</p>
                      </div>
                    </div>

                    {(activeBookings > 0 || overduePayments > 0) && (
                      <div className="mt-3 flex flex-wrap gap-2">
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
                      <div className="mt-3 rounded-xl border border-[#4b3723] bg-[#2b2117] p-3">
                        <p className="text-sm text-orange-100">{customer.notes}</p>
                      </div>
                    )}

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <Button
                        asChild
                        variant="outline"
                        className="h-11 rounded-2xl border-[#3a3129] bg-[#171411] text-stone-200 hover:bg-[#221d18]"
                      >
                        <Link href={`/admin/customers/${customer.id}`}>
                          <Eye className="mr-2 h-4 w-4" />
                          Details
                        </Link>
                      </Button>
                      <Button asChild className="h-11 rounded-2xl bg-[#1f6b45] text-white hover:bg-[#258555]">
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
                      className="mt-2 h-10 w-full rounded-2xl border-[#4a2d2d] bg-[#1e1515] text-rose-200 hover:border-[#7a3e3e] hover:bg-[#281818] hover:text-rose-100"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Customer
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })
        ) : customers.length === 0 ? (
          <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
            <CardContent className="px-4 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#312924] bg-[#12100f]">
                <Users className="h-6 w-6 text-stone-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-stone-100">No Customers Yet</h3>
              <p className="mt-2 text-sm text-stone-500">Create your first booking to start building the customer base.</p>
              <Button asChild className="mt-5 rounded-2xl bg-[#c96b2c] text-stone-950 hover:bg-[#d97a39]">
                <Link href="/admin/bookings/add">
                  <UserPlus className="mr-2 h-4 w-4" />
                  Create First Booking
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
            <CardContent className="px-4 py-10 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[#312924] bg-[#12100f]">
                <Search className="h-6 w-6 text-stone-500" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-stone-100">No customers found</h3>
              <p className="mt-2 text-sm text-stone-500">Try adjusting the search or sort settings.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
