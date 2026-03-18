'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Package,
    PackageOpen,
    DollarSign,
    ChevronRight,
    ChevronDown,
    Calendar,
    Camera,
    Clock,
    Bell,
    TrendingUp,
    AlertCircle,
    CheckCircle2,
    Sparkles
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import CameraRevenueBreakdown from './CameraRevenueBreakdown';

interface Booking {
    id: string;
    customer?: { full_name?: string; phone?: string };
    camera?: { id?: string; name?: string };
    camera_id?: string;
    start_date: string;
    end_date: string;
    pickup_date?: string;
    booking_status: string;
    status?: string;
    equipment_picked_up?: boolean;
    equipment_returned?: boolean;
    deposit_paid?: boolean;
    final_payment_paid?: boolean;
    deposit_amount?: number;
    final_payment_amount?: number;
    final_payment_paid_date?: string | null;
    total_amount: number;
    created_at?: string;
}

interface Camera {
    id: string;
    name: string;
    daily_rate: number;
    is_available: boolean;
    available_quantity?: number;
    total_quantity?: number;
}

interface MobileDashboardProps {
    bookings: Booking[];
    cameras: Camera[];
    onMutate?: () => void;
}

export default function MobileDashboard({ bookings, cameras }: MobileDashboardProps) {
    const [expandedSection, setExpandedSection] = useState<string | null>('actions');

    const today = new Date().toISOString().split('T')[0];

    // Calculate dashboard data
    const dashboardData = useMemo(() => {
        // Today's pickups
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

        // Today's returns
        const todayReturns = bookings.filter(b =>
            b.end_date === today &&
            b.equipment_picked_up &&
            !b.equipment_returned
        );

        // Active rentals
        const activeRentals = bookings.filter(b =>
            b.booking_status === 'confirmed' &&
            b.equipment_picked_up &&
            !b.equipment_returned
        );

        // Pending approvals
        const pendingApprovals = bookings.filter(b => b.booking_status === 'pending_approval');

        // Pending payments (equipment returned but not paid)
        const pendingPayments = bookings.filter(b =>
            !b.final_payment_paid &&
            b.equipment_returned
        );

        // Weekly revenue
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 7);
        const weeklyRevenue = bookings
            .filter(b =>
                b.deposit_paid &&
                b.final_payment_paid &&
                new Date(b.created_at || '') >= weekStart
            )
            .reduce((sum, b) => {
                const isNewPaymentSystem = b.deposit_amount === 100;
                return sum + (isNewPaymentSystem ? (b.final_payment_amount || 0) : (b.total_amount - (b.deposit_amount || 0)));
            }, 0);

        // Monthly revenue
        const monthlyRevenue = bookings
            .filter(b =>
                b.deposit_paid &&
                b.final_payment_paid &&
                b.final_payment_paid_date &&
                new Date(b.final_payment_paid_date).getMonth() === new Date().getMonth() &&
                new Date(b.final_payment_paid_date).getFullYear() === new Date().getFullYear()
            )
            .reduce((sum, b) => {
                const isNewPaymentSystem = b.deposit_amount === 100;
                return sum + (isNewPaymentSystem ? (b.final_payment_amount || 0) : (b.total_amount - (b.deposit_amount || 0)));
            }, 0);

        // Recent bookings
        const recentBookings = bookings.slice(0, 3);

        return {
            todayPickups,
            todayReturns,
            activeRentals,
            pendingApprovals,
            pendingPayments,
            weeklyRevenue,
            monthlyRevenue,
            recentBookings
        };
    }, [bookings, today]);

    const {
        todayPickups,
        todayReturns,
        activeRentals,
        pendingApprovals,
        pendingPayments,
        weeklyRevenue,
        monthlyRevenue,
        recentBookings
    } = dashboardData;

    // Combine all actions for today
    const todayActions = [
        ...todayPickups.map(b => ({ type: 'pickup' as const, booking: b })),
        ...todayReturns.map(b => ({ type: 'return' as const, booking: b })),
        ...pendingPayments.slice(0, 2).map(b => ({ type: 'payment' as const, booking: b }))
    ];

    const toggleSection = (section: string) => {
        setExpandedSection(expandedSection === section ? null : section);
    };

    return (
        <div className="space-y-4 pb-28">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-stone-50">Dashboard</h1>
                    <p className="text-sm text-stone-400">
                        {new Date().toLocaleDateString('en-MY', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-[#332b25] bg-[#1b1714]"
                >
                    <Bell className="h-5 w-5 text-stone-300" />
                </motion.div>
            </motion.div>

            {/* Today Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="border border-[#332b25] bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.18),_transparent_45%),linear-gradient(135deg,#1b1714_0%,#171411_60%,#141210_100%)] shadow-[0_20px_45px_rgba(0,0,0,0.35)]">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="h-4 w-4 text-orange-300" />
                            <span className="text-sm font-medium text-stone-200">Today's Overview</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[#3a3129] bg-[#221d18]">
                                    <Package className="h-5 w-5 text-orange-300" />
                                </div>
                                <p className="text-2xl font-bold text-stone-50">{todayPickups.length}</p>
                                <p className="text-xs text-stone-400">Pickups</p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[#3a3129] bg-[#221d18]">
                                    <PackageOpen className="h-5 w-5 text-stone-300" />
                                </div>
                                <p className="text-2xl font-bold text-stone-50">{todayReturns.length}</p>
                                <p className="text-xs text-stone-400">Returns</p>
                            </div>

                            <div className="text-center">
                                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl border border-[#3a3129] bg-[#221d18]">
                                    <Camera className="h-5 w-5 text-stone-300" />
                                </div>
                                <p className="text-2xl font-bold text-stone-50">{activeRentals.length}</p>
                                <p className="text-xs text-stone-400">Active</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Pending Approvals Alert */}
            {pendingApprovals.length > 0 && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15 }}
                >
                    <Link href="/admin/booking-approvals">
                        <Card className="cursor-pointer border border-[#4c3421] bg-[#231810] transition-transform active:scale-[0.98]">
                            <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#5a4328] bg-[#332316]">
                                        <AlertCircle className="h-4 w-4 text-orange-300" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-stone-100">
                                            {pendingApprovals.length} Pending Approval{pendingApprovals.length !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-xs text-stone-400">Tap to review</p>
                                    </div>
                                </div>
                                <ChevronRight className="h-5 w-5 text-orange-300" />
                            </CardContent>
                        </Card>
                    </Link>
                </motion.div>
            )}

            {/* Action Needed Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
            >
                <Card className="overflow-hidden border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                    <button
                        onClick={() => toggleSection('actions')}
                        className="flex w-full items-center justify-between border-b border-[#26211d] bg-[#1b1714] p-3"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-orange-300" />
                            <span className="text-sm font-semibold text-stone-100">Action Needed</span>
                            {todayActions.length > 0 && (
                                <Badge className="border-[#5a4328] bg-[#332316] text-[11px] text-orange-200 hover:bg-[#332316]">
                                    {todayActions.length}
                                </Badge>
                            )}
                        </div>
                        <motion.div
                            animate={{ rotate: expandedSection === 'actions' ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="h-5 w-5 text-stone-500" />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'actions' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <CardContent className="p-0">
                                    {todayActions.length > 0 ? (
                                        <div className="divide-y divide-[#26211d]">
                                            {todayActions.map((action, index) => (
                                                <Link
                                                    key={`${action.type}-${action.booking.id}`}
                                                    href={`/admin/bookings/${action.booking.id}`}
                                                >
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="flex items-center gap-3 p-3 transition-colors active:bg-[#1f1a16]"
                                                    >
                                                        <div className={`flex h-8 w-8 items-center justify-center rounded-lg border ${action.type === 'pickup' ? 'border-[#5a4328] bg-[#332316]' :
                                                            action.type === 'return' ? 'border-[#3f352d] bg-[#221d18]' :
                                                                'border-[#4b3422] bg-[#2a1d14]'
                                                            }`}>
                                                            {action.type === 'pickup' && <Package className="h-4 w-4 text-orange-300" />}
                                                            {action.type === 'return' && <PackageOpen className="h-4 w-4 text-stone-300" />}
                                                            {action.type === 'payment' && <DollarSign className="h-4 w-4 text-orange-300" />}
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <p className="truncate text-sm font-medium text-stone-100">
                                                                {action.booking.customer?.full_name || 'Unknown'}
                                                            </p>
                                                            <p className="truncate text-xs text-stone-500">
                                                                {action.booking.camera?.name} • {
                                                                    action.type === 'pickup' ? 'Pickup @10PM' :
                                                                        action.type === 'return' ? 'Return by 8PM' :
                                                                            `RM${action.booking.final_payment_amount} due`
                                                                }
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            className={`shrink-0 border text-xs ${action.type === 'pickup' ? 'border-[#5a4328] bg-[#332316] text-orange-200' :
                                                                action.type === 'return' ? 'border-[#3f352d] bg-[#221d18] text-stone-300' :
                                                                    'border-[#4b3422] bg-[#2a1d14] text-orange-200'
                                                                }`}
                                                        >
                                                            {action.type === 'pickup' ? 'Pickup' :
                                                                action.type === 'return' ? 'Return' : 'Payment'}
                                                        </Badge>
                                                    </motion.div>
                                                </Link>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="p-6 text-center">
                                            <CheckCircle2 className="mx-auto mb-2 h-8 w-8 text-orange-300" />
                                            <p className="text-sm text-stone-400">All caught up. No actions needed.</p>
                                        </div>
                                    )}
                                </CardContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>

            {/* Revenue Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
            >
                <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#5a4328] bg-[#332316]">
                                    <TrendingUp className="h-4 w-4 text-orange-300" />
                                </div>
                                <div>
                                    <p className="text-xs text-stone-500">This Month</p>
                                    <p className="text-lg font-bold text-stone-100">RM{monthlyRevenue.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-stone-500">This Week</p>
                                <p className="text-sm font-semibold text-orange-300">+RM{weeklyRevenue.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Simple progress indicator */}
                        <div className="h-2 w-full rounded-full bg-[#26211d]">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((monthlyRevenue / 5000) * 100, 100)}%` }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="h-2 rounded-full bg-gradient-to-r from-[#c96b2c] to-[#e08b45]"
                            />
                        </div>
                        <p className="mt-1.5 text-center text-xs text-stone-500">
                            {Math.round((monthlyRevenue / 5000) * 100)}% of RM5,000 goal
                        </p>
                    </CardContent>
                </Card>
            </motion.div>

            {/* Camera Status Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
            >
                <Card className="overflow-hidden border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                    <button
                        onClick={() => toggleSection('cameras')}
                        className="flex w-full items-center justify-between border-b border-[#26211d] bg-[#1b1714] p-3"
                    >
                        <div className="flex items-center gap-2">
                            <Camera className="h-4 w-4 text-orange-300" />
                            <span className="text-sm font-semibold text-stone-100">Camera Status</span>
                        </div>
                        <motion.div
                            animate={{ rotate: expandedSection === 'cameras' ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="h-5 w-5 text-stone-500" />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'cameras' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <CardContent className="p-3 space-y-2">
                                    {cameras.map((camera) => {
                                        // Check if this camera is currently rented
                                        // A camera is rented if there's a booking where:
                                        // 1. equipment_picked_up is true AND equipment_returned is false
                                        // OR
                                        // 2. The rental period includes today (start_date <= today <= end_date) 
                                        //    and booking is confirmed/approved
                                        const isRented = bookings.some(b => {
                                            // Check if this booking is for this camera
                                            const isSameCamera = b.camera_id === camera.id ||
                                                b.camera?.id === camera.id ||
                                                b.camera?.name === camera.name;

                                            if (!isSameCamera) return false;

                                            // Equipment picked up but not returned = definitely rented
                                            if (b.equipment_picked_up && !b.equipment_returned) {
                                                return true;
                                            }

                                            // Within rental period and confirmed
                                            const startDate = new Date(b.start_date);
                                            const endDate = new Date(b.end_date);
                                            const todayDate = new Date(today);

                                            const isWithinPeriod = startDate <= todayDate && todayDate <= endDate;
                                            const isConfirmed = b.booking_status === 'confirmed' ||
                                                b.booking_status === 'approved' ||
                                                b.booking_status === 'active';

                                            return isWithinPeriod && isConfirmed;
                                        });

                                        return (
                                            <div
                                                key={camera.id}
                                                className="flex items-center justify-between rounded-lg border border-[#2c2722] bg-[#1b1714] p-2"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${!isRented ? 'bg-orange-300' : 'bg-stone-500'}`} />
                                                    <span className="max-w-[180px] truncate text-sm font-medium text-stone-100">
                                                        {camera.name}
                                                    </span>
                                                </div>
                                                <Badge className={`text-xs ${!isRented ? 'border-[#5a4328] bg-[#332316] text-orange-200' : 'border-[#3f352d] bg-[#221d18] text-stone-300'}`}>
                                                    {!isRented ? 'Free' : 'Rented'}
                                                </Badge>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>

            {/* Camera Revenue Breakdown Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.32 }}
            >
                <CameraRevenueBreakdown
                    bookings={bookings}
                    cameras={cameras}
                    variant="mobile"
                />
            </motion.div>

            {/* Recent Bookings Section */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 }}
            >
                <Card className="overflow-hidden border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                    <button
                        onClick={() => toggleSection('bookings')}
                        className="flex w-full items-center justify-between border-b border-[#26211d] bg-[#1b1714] p-3"
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-orange-300" />
                            <span className="text-sm font-semibold text-stone-100">Recent Bookings</span>
                        </div>
                        <motion.div
                            animate={{ rotate: expandedSection === 'bookings' ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="h-5 w-5 text-stone-500" />
                        </motion.div>
                    </button>

                    <AnimatePresence>
                        {expandedSection === 'bookings' && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                            >
                                <CardContent className="p-0">
                                    {recentBookings.length > 0 ? (
                                        <>
                                            <div className="divide-y divide-[#26211d]">
                                                {recentBookings.map((booking) => (
                                                    <Link key={booking.id} href={`/admin/bookings/${booking.id}`}>
                                                        <div className="flex items-center justify-between p-3 transition-colors active:bg-[#1f1a16]">
                                                            <div className="min-w-0 flex-1">
                                                                <p className="truncate text-sm font-medium text-stone-100">
                                                                    {booking.customer?.full_name}
                                                                </p>
                                                                <p className="truncate text-xs text-stone-500">
                                                                    {booking.camera?.name} • {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-stone-100">RM{booking.total_amount}</span>
                                                                <ChevronRight className="h-4 w-4 text-stone-500" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                            <Link href="/admin/bookings">
                                                <div className="border-t border-[#26211d] p-3 text-center active:bg-[#1f1a16]">
                                                    <span className="text-sm font-medium text-orange-300">View All Bookings</span>
                                                </div>
                                            </Link>
                                        </>
                                    ) : (
                                        <div className="p-6 text-center">
                                            <p className="text-sm text-stone-500">No recent bookings</p>
                                        </div>
                                    )}
                                </CardContent>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </Card>
            </motion.div>

            {/* Quick Actions FAB */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="fixed bottom-5 left-4 right-4 z-50"
            >
                <div className="flex items-center justify-around rounded-2xl border border-[#332b25] bg-[#171411]/95 p-2 shadow-[0_18px_40px_rgba(0,0,0,0.38)] backdrop-blur">
                    <Link href="/admin/bookings/add" className="flex-1">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#c96b2c] px-2 py-3 text-sm font-medium text-stone-950"
                        >
                            <Package className="h-4 w-4" />
                            New Booking
                        </motion.button>
                    </Link>
                    <Link href="/admin/bookings" className="flex-1 ml-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#332b25] bg-[#1f1a16] px-2 py-3 text-sm font-medium text-stone-200"
                        >
                            <Clock className="h-4 w-4" />
                            All Bookings
                        </motion.button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
