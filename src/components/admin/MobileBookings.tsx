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
    bookings: any[];
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

export default function MobileBookings({ bookings, onMutate }: MobileBookingsProps) {
    const [searchQuery, setSearchQuery] = useState('');
    // 🎯 Smart default: show "upcoming" instead of "all"
    const [quickFilter, setQuickFilter] = useState<QuickFilter>('upcoming');
    const [showSearch, setShowSearch] = useState(false);
    // 🎯 Pagination: show only 10 items initially
    const [displayLimit, setDisplayLimit] = useState(10);

    // Filter out Mother's bookings
    const adminBookings = useMemo(() => {
        return bookings.filter(b => b.camera?.name !== 'Canon R50 - Mother');
    }, [bookings]);

    // Stats with new "upcoming" count
    const stats = useMemo(() => {
        const now = new Date();
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

    const getStatusConfig = (booking: any) => {
        if (booking.booking_status === 'pending_approval') {
            return { label: 'Pending', color: 'bg-orange-100 text-orange-700', icon: Clock };
        }
        if (booking.booking_status === 'cancelled') {
            return { label: 'Cancelled', color: 'bg-red-100 text-red-700', icon: XCircle };
        }
        if (booking.booking_status === 'completed') {
            return { label: 'Done', color: 'bg-green-100 text-green-700', icon: CheckCircle2 };
        }
        if (booking.equipment_picked_up && !booking.equipment_returned) {
            return { label: 'Active', color: 'bg-blue-100 text-blue-700', icon: Package };
        }
        if (booking.booking_status === 'confirmed') {
            return { label: 'Confirmed', color: 'bg-indigo-100 text-indigo-700', icon: CheckCircle2 };
        }
        return { label: booking.booking_status, color: 'bg-slate-100 text-slate-700', icon: Clock };
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
    const getUrgencyBadge = (booking: any) => {
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
                className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-100 -mx-4 px-4 py-3"
            >
                <div className="flex items-center justify-between">
                    <h1 className="text-xl font-bold text-slate-900">Bookings</h1>
                    <div className="flex items-center gap-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            onClick={() => setShowSearch(!showSearch)}
                            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${showSearch ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            {showSearch ? <X className="w-5 h-5" /> : <Search className="w-5 h-5" />}
                        </motion.button>
                        <Link href="/admin/bookings/add">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                className="w-9 h-9 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200"
                            >
                                <Plus className="w-5 h-5" />
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
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search name, phone, camera..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        autoFocus
                                        className="w-full pl-10 pr-10 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 placeholder:text-slate-400"
                                    />
                                    {searchQuery && (
                                        <button
                                            onClick={() => setSearchQuery('')}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                                        >
                                            <X className="w-4 h-4" />
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
                <div className="flex gap-2 min-w-max">
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
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${quickFilter === tab.key
                                ? 'bg-slate-900 text-white shadow-sm'
                                : 'bg-slate-100 text-slate-600'
                                }`}
                        >
                            {tab.label}
                            <span className={`text-xs ${quickFilter === tab.key ? 'text-white/70' : 'text-slate-400'}`}>
                                {tab.count}
                            </span>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Results Count */}
            <div className="text-xs text-slate-500 mb-3">
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
                                    <Card className={`border-slate-200 active:scale-[0.98] transition-transform overflow-hidden ${urgencyBadge ? 'ring-2 ring-red-200' : ''
                                        }`}>
                                        <CardContent className="p-0">
                                            {/* Main Content */}
                                            <div className="p-3">
                                                <div className="flex items-start justify-between gap-3">
                                                    {/* Left: Customer & Camera Info */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h3 className="font-semibold text-slate-900 text-sm truncate">
                                                                {booking.customer?.full_name || 'Unknown'}
                                                            </h3>
                                                            {urgencyBadge}
                                                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium ${statusConfig.color}`}>
                                                                <StatusIcon className="w-3 h-3" />
                                                                {statusConfig.label}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-0.5 truncate">
                                                            {booking.camera?.name}
                                                        </p>
                                                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-600">
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="w-3 h-3" />
                                                                {formatDateCompact(booking.start_date, booking.end_date)}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Right: Amount & Arrow */}
                                                    <div className="flex items-center gap-2 shrink-0">
                                                        <div className="text-right">
                                                            <p className="font-semibold text-slate-900 text-sm">
                                                                RM{booking.total_amount}
                                                            </p>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-300" />
                                                    </div>
                                                </div>
                                            </div>

                                            {/* 🎯 Status Bar - Hide for completed bookings */}
                                            {!isCompleted && (
                                                <div className="flex items-center gap-1 px-3 py-2 bg-slate-50 border-t border-slate-100">
                                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${booking.deposit_paid ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                                                        }`}>
                                                        <DollarSign className="w-3 h-3" />
                                                        Deposit
                                                    </div>
                                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${booking.equipment_picked_up ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                                                        }`}>
                                                        <Package className="w-3 h-3" />
                                                        Pickup
                                                    </div>
                                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${booking.equipment_returned ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                                                        }`}>
                                                        <PackageOpen className="w-3 h-3" />
                                                        Return
                                                    </div>
                                                    <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium ${booking.final_payment_paid ? 'bg-green-100 text-green-700' : 'bg-slate-200 text-slate-500'
                                                        }`}>
                                                        <DollarSign className="w-3 h-3" />
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
                        className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium rounded-xl flex items-center justify-center gap-2 transition-colors"
                    >
                        <ChevronDown className="w-4 h-4" />
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
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Calendar className="w-8 h-8 text-slate-400" />
                        </div>
                        <p className="text-slate-600 font-medium">No bookings found</p>
                        <p className="text-sm text-slate-500 mt-1">
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
                    className="fixed bottom-6 right-4 w-14 h-14 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-300 flex items-center justify-center z-50"
                >
                    <Plus className="w-6 h-6" />
                </motion.button>
            </Link>
        </div>
    );
}
