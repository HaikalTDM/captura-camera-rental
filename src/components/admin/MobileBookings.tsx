'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Plus,
    ChevronRight,
    Calendar,
    Clock,
    CheckCircle2,
    XCircle,
    Package,
    PackageOpen,
    DollarSign,
    X,
    ChevronDown
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MobileBookingsProps {
    bookings: Array<{
        id: string;
        booking_status?: string;
        status?: string;
        pickup_date?: string;
        start_date: string;
        end_date: string;
        total_amount: number;
        deposit_paid?: boolean;
        final_payment_paid?: boolean;
        equipment_picked_up?: boolean;
        equipment_returned?: boolean;
        customer?: {
            full_name?: string;
            phone?: string;
        };
        camera?: {
            name?: string;
        };
    }>;
    onMutate?: () => void;
}

type QuickFilter = 'all' | 'upcoming' | 'pending' | 'confirmed' | 'active' | 'completed';

// Helper: check if two dates are the same day
const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

// Helper: check if date is tomorrow
const isTomorrow = (date: Date) => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return isSameDay(date, tomorrow);
};

// Helper: check if date is within next N days
const isWithinDays = (date: Date, days: number) => {
    const now = new Date();
    const future = new Date();
    future.setDate(now.getDate() + days);
    return date >= now && date <= future;
};

export default function MobileBookings(props: MobileBookingsProps) {
    const { bookings } = props;
    const [searchQuery, setSearchQuery] = useState('');
    // 🎯 Smart default: show "upcoming" instead of "all"
    const [quickFilter, setQuickFilter] = useState<QuickFilter>('upcoming');
    const [showSearch, setShowSearch] = useState(false);
    // 🎯 Pagination: show only 10 items initially
    const [displayLimit, setDisplayLimit] = useState(10);

    // Use all bookings, including Mother's
    const adminBookings = useMemo(() => {
        return bookings;
    }, [bookings]);

    // Stats with new "upcoming" count
    const stats = useMemo(() => {
        const upcoming = adminBookings.filter(b => {
            if (b.booking_status === 'completed' || b.booking_status === 'cancelled') return false;
            const pickupDate = new Date(b.pickup_date || b.start_date);
            return isWithinDays(pickupDate, 7);
        });

        return {
            total: adminBookings.length,
            upcoming: upcoming.length,
            pending: adminBookings.filter(b => b.booking_status === 'pending_approval').length,
            confirmed: adminBookings.filter(b => b.booking_status === 'confirmed').length,
            active: adminBookings.filter(b => b.equipment_picked_up && !b.equipment_returned).length,
            completed: adminBookings.filter(b => b.booking_status === 'completed').length,
        };
    }, [adminBookings]);

    // Filtered bookings
    const filteredBookings = useMemo(() => {
        let result = adminBookings;

        // Quick filter
        if (quickFilter === 'upcoming') {
            result = result.filter(b => {
                if (b.booking_status === 'completed' || b.booking_status === 'cancelled') return false;
                const pickupDate = new Date(b.pickup_date || b.start_date);
                return isWithinDays(pickupDate, 7);
            });
        } else if (quickFilter === 'pending') {
            result = result.filter(b => b.booking_status === 'pending_approval');
        } else if (quickFilter === 'confirmed') {
            result = result.filter(b => b.booking_status === 'confirmed');
        } else if (quickFilter === 'active') {
            result = result.filter(b => b.equipment_picked_up && !b.equipment_returned);
        } else if (quickFilter === 'completed') {
            result = result.filter(b => b.booking_status === 'completed');
        }

        // Search filter
        if (searchQuery) {
            const query = searchQuery.toLowerCase();
            result = result.filter(b =>
                b.customer?.full_name?.toLowerCase().includes(query) ||
                b.customer?.phone?.includes(query) ||
                b.camera?.name?.toLowerCase().includes(query)
            );
        }

        // Sort: urgent pickups first, then by date
        return result.sort((a, b) => {
            const dateA = new Date(a.pickup_date || a.start_date);
            const dateB = new Date(b.pickup_date || b.start_date);
            return dateA.getTime() - dateB.getTime();
        });
    }, [adminBookings, quickFilter, searchQuery]);

    // Reset display limit when filter changes
    const handleFilterChange = (filter: QuickFilter) => {
        setQuickFilter(filter);
        setDisplayLimit(10);
    };

    const getStatusConfig = (booking: MobileBookingsProps['bookings'][number]) => {
        if (booking.booking_status === 'pending_approval') {
            return { label: 'Pending', color: 'border-[#5a4328] bg-[#332316] text-orange-200', icon: Clock };
        }
        if (booking.booking_status === 'cancelled') {
            return { label: 'Cancelled', color: 'border-[#4a2d2d] bg-[#1e1515] text-rose-200', icon: XCircle };
        }
        if (booking.booking_status === 'completed') {
            return { label: 'Done', color: 'border-[#3f352d] bg-[#221d18] text-stone-300', icon: CheckCircle2 };
        }
        if (booking.equipment_picked_up && !booking.equipment_returned) {
            return { label: 'Active', color: 'border-[#5a4328] bg-[#332316] text-orange-200', icon: Package };
        }
        if (booking.booking_status === 'confirmed') {
            return { label: 'Confirmed', color: 'border-[#3f352d] bg-[#221d18] text-stone-300', icon: CheckCircle2 };
        }
        return { label: booking.booking_status, color: 'border-[#332b25] bg-[#1f1a16] text-stone-300', icon: Clock };
    };

    // 🎯 Compact date format: "23-25 Dec"
    const formatDateCompact = (startStr: string, endStr: string) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const startDay = start.getDate();
        const endDay = end.getDate();
        const month = start.toLocaleDateString('en-MY', { month: 'short' });

        if (start.getMonth() === end.getMonth()) {
            return `${startDay}-${endDay} ${month}`;
        }
        const endMonth = end.toLocaleDateString('en-MY', { month: 'short' });
        return `${startDay} ${month} - ${endDay} ${endMonth}`;
    };

    // 🎯 Get urgency badge (TODAY, TOMORROW)
    const getUrgencyBadge = (booking: MobileBookingsProps['bookings'][number]) => {
        if (booking.booking_status === 'completed' || booking.booking_status === 'cancelled') {
            return null;
        }
        const pickupDate = new Date(booking.pickup_date || booking.start_date);
        const today = new Date();

        if (isSameDay(pickupDate, today)) {
            return <span className="px-1.5 py-0.5 bg-red-500 text-white text-[9px] font-bold rounded uppercase">Today</span>;
        }
        if (isTomorrow(pickupDate)) {
            return <span className="px-1.5 py-0.5 bg-amber-500 text-white text-[9px] font-bold rounded uppercase">Tomorrow</span>;
        }
        return null;
    };

    // Visible bookings (paginated)
    const visibleBookings = filteredBookings.slice(0, displayLimit);
    const hasMore = filteredBookings.length > displayLimit;

    return (
        <div className="pb-24">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="sticky top-0 z-40 -mx-4 border-b border-[#26211d] bg-[#171411]/95 px-4 py-3 backdrop-blur"
            >
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-stone-100">Bookings</h1>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSearch(!showSearch)}
                            className={`flex h-9 w-9 items-center justify-center rounded-full border transition-colors ${showSearch ? 'border-[#5a4328] bg-[#332316] text-orange-300' : 'border-[#332b25] bg-[#1f1a16] text-stone-300'
                                }`}
                        >
                            {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
                        </motion.button>
                        <Link href="/admin/bookings/add">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#c96b2c] text-stone-950 shadow-[0_12px_28px_rgba(201,107,44,0.35)]"
                            >
                                <Plus className="h-5 w-5" />
                            </motion.button>
                        </Link>
                    </div>
                </div>

                {/* Search Bar - Collapsible */}
                <AnimatePresence>
                    {showSearch && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                        >
                            <div className="pt-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                                    <input
                                        type="text"
                                        placeholder="Search name, phone, camera..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                        className="w-full rounded-xl border border-[#332b25] bg-[#1b1714] py-2.5 pl-10 pr-10 text-sm text-stone-100 placeholder:text-stone-500 focus:border-[#c96b2c] focus:outline-none"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Quick Filter Pills */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="overflow-x-auto py-3 scrollbar-hide -mx-4 px-4"
                style={{ WebkitOverflowScrolling: 'touch' }}
            >
                <div className="flex min-w-max gap-2">
                    {([
                        { key: 'upcoming', label: 'Upcoming', count: stats.upcoming },
                        { key: 'pending', label: 'Pending', count: stats.pending },
                        { key: 'confirmed', label: 'Confirmed', count: stats.confirmed },
                        { key: 'active', label: 'Active', count: stats.active },
                        { key: 'completed', label: 'Done', count: stats.completed },
                        { key: 'all', label: 'All', count: stats.total },
                    ] as const).map((tab) => (
                        <motion.button
                            key={tab.key}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleFilterChange(tab.key)}
                            className={`flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 text-sm font-medium transition-all ${quickFilter === tab.key
                                ? 'border-[#5a4328] bg-[#332316] text-orange-200 shadow-sm'
                                : 'border-[#332b25] bg-[#1f1a16] text-stone-400'
                                }`}
                        >
                            {tab.label}
                            <span className={`text-xs ${quickFilter === tab.key ? 'text-orange-100/70' : 'text-stone-500'}`}>
                                {tab.count}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Results Count */}
            <div className="mb-3 text-xs text-stone-500">
                Showing {visibleBookings.length} of {filteredBookings.length} booking{filteredBookings.length !== 1 ? 's' : ''}
                {searchQuery && ` for "${searchQuery}"`}
            </div>

            {/* Booking Cards */}
            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {visibleBookings.map((booking, index) => {
                        const statusConfig = getStatusConfig(booking);
                        const StatusIcon = statusConfig.icon;
                        const isCompleted = booking.booking_status === 'completed';
                        const urgencyBadge = getUrgencyBadge(booking);

                        return (
                            <motion.div
                                key={booking.id}
                                layout
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                // 🎯 Only animate first 5 items to reduce lag
                                transition={{ delay: index < 5 ? index * 0.02 : 0 }}
                            >
                                <Link href={`/admin/bookings/${booking.id}`}>
                                    <Card className={`overflow-hidden border border-[#2c2722] bg-[#171411] transition-transform active:scale-[0.98] ${urgencyBadge ? 'ring-2 ring-[#5a4328]' : ''
                                        }`}>
                                        <CardContent className="p-0">
                                            {/* Main Content */}
                                            <div className="p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    {/* Left: Customer & Camera Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="truncate text-sm font-semibold text-stone-100">
                                                                {booking.customer?.full_name || 'Unknown'}
                                                            </h3>
                                                            {urgencyBadge}
                                                            <span className={`inline-flex items-center gap-1 rounded border px-1.5 py-0.5 text-[10px] font-medium ${statusConfig.color}`}>
                                                                <StatusIcon className="h-3 w-3" />
                                                                {statusConfig.label}
                                                            </span>
                                                        </div>
                                                        <p className="mt-0.5 truncate text-xs text-stone-500">
                                                            {booking.camera?.name}
                                                        </p>
                                                        <div className="mt-1.5 flex items-center gap-2 text-xs text-stone-400">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-3 w-3" />
                                                                {formatDateCompact(booking.start_date, booking.end_date)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Right: Amount & Arrow */}
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <div className="text-right">
                                                            <p className="text-sm font-semibold text-orange-300">
                                                                RM{booking.total_amount}
                                                            </p>
                                                        </div>
                                                        <ChevronRight className="h-4 w-4 text-stone-500" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 🎯 Status Bar - Hide for completed bookings */}
                                            {!isCompleted && (
                                                <div className="flex items-center gap-1 border-t border-[#26211d] bg-[#1b1714] px-3 py-2">
                                                    <div className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium ${booking.deposit_paid ? 'border-[#5a4328] bg-[#332316] text-orange-200' : 'border-[#332b25] bg-[#1f1a16] text-stone-500'
                                                        }`}>
                                                        <DollarSign className="h-3 w-3" />
                                                        Deposit
                                                    </div>
                                                    <div className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium ${booking.equipment_picked_up ? 'border-[#5a4328] bg-[#332316] text-orange-200' : 'border-[#332b25] bg-[#1f1a16] text-stone-500'
                                                        }`}>
                                                        <Package className="h-3 w-3" />
                                                        Pickup
                                                    </div>
                                                    <div className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium ${booking.equipment_returned ? 'border-[#5a4328] bg-[#332316] text-orange-200' : 'border-[#332b25] bg-[#1f1a16] text-stone-500'
                                                        }`}>
                                                        <PackageOpen className="h-3 w-3" />
                                                        Return
                                                    </div>
                                                    <div className={`flex items-center gap-1 rounded border px-2 py-0.5 text-[10px] font-medium ${booking.final_payment_paid ? 'border-[#5a4328] bg-[#332316] text-orange-200' : 'border-[#332b25] bg-[#1f1a16] text-stone-500'
                                                        }`}>
                                                        <DollarSign className="h-3 w-3" />
                                                        Paid
                                                    </div>
                                                </div>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Link>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>

                {/* 🎯 Load More Button */}
                {hasMore && (
                    <motion.button
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setDisplayLimit(prev => prev + 10)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#332b25] bg-[#1f1a16] py-3 text-sm font-medium text-stone-300 transition-colors hover:bg-[#26211d]"
                    >
                        <ChevronDown className="h-4 w-4" />
                        Load {Math.min(10, filteredBookings.length - displayLimit)} more
                    </motion.button>
                )}

                {/* Empty State */}
                {filteredBookings.length === 0 && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-12"
                    >
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#332b25] bg-[#1f1a16]">
                            <Calendar className="h-8 w-8 text-stone-500" />
                        </div>
                        <p className="font-medium text-stone-300">No bookings found</p>
                        <p className="mt-1 text-sm text-stone-500">
                            {searchQuery ? 'Try a different search term' : quickFilter === 'upcoming' ? 'No upcoming bookings in the next 7 days' : 'No bookings in this category'}
                        </p>
                    </motion.div>
                )}
            </div>

            {/* Floating Action Button */}
            <Link href="/admin/bookings/add">
                <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    whileTap={{ scale: 0.95 }}
                    className="fixed bottom-6 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#c96b2c] text-stone-950 shadow-[0_18px_40px_rgba(201,107,44,0.35)]"
                >
                    <Plus className="h-6 w-6" />
                </motion.button>
            </Link>
        </div>
    );
}
