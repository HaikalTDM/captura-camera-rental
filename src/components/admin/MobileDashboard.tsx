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
    bookings: any[];
    cameras: any[];
    onMutate?: () => void;
}

export default function MobileDashboard({ bookings, cameras, onMutate }: MobileDashboardProps) {
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
        <div className="pb-24 space-y-4">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between"
            >
                <div>
                    <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
                    <p className="text-sm text-slate-500">
                        {new Date().toLocaleDateString('en-MY', {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric'
                        })}
                    </p>
                </div>
                <motion.div
                    whileTap={{ scale: 0.95 }}
                    className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center"
                >
                    <Bell className="w-5 h-5 text-slate-600" />
                </motion.div>
            </motion.div>

            {/* Today Summary Card */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
            >
                <Card className="bg-gradient-to-br from-indigo-500 to-purple-600 border-0 shadow-lg">
                    <CardContent className="p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-4 h-4 text-white/80" />
                            <span className="text-white/80 text-sm font-medium">Today's Overview</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            <div className="text-center">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-1">
                                    <Package className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-2xl font-bold text-white">{todayPickups.length}</p>
                                <p className="text-xs text-white/70">Pickups</p>
                            </div>

                            <div className="text-center">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-1">
                                    <PackageOpen className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-2xl font-bold text-white">{todayReturns.length}</p>
                                <p className="text-xs text-white/70">Returns</p>
                            </div>

                            <div className="text-center">
                                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-1">
                                    <Camera className="w-5 h-5 text-white" />
                                </div>
                                <p className="text-2xl font-bold text-white">{activeRentals.length}</p>
                                <p className="text-xs text-white/70">Active</p>
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
                        <Card className="border-orange-200 bg-orange-50 cursor-pointer active:scale-[0.98] transition-transform">
                            <CardContent className="p-3 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
                                        <AlertCircle className="w-4 h-4 text-orange-600" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-900 text-sm">
                                            {pendingApprovals.length} Pending Approval{pendingApprovals.length !== 1 ? 's' : ''}
                                        </p>
                                        <p className="text-xs text-slate-600">Tap to review</p>
                                    </div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-orange-400" />
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
                <Card className="border-slate-200 overflow-hidden">
                    <button
                        onClick={() => toggleSection('actions')}
                        className="w-full p-3 flex items-center justify-between bg-slate-50 border-b border-slate-100"
                    >
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <span className="font-semibold text-slate-900 text-sm">Action Needed</span>
                            {todayActions.length > 0 && (
                                <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 text-xs">
                                    {todayActions.length}
                                </Badge>
                            )}
                        </div>
                        <motion.div
                            animate={{ rotate: expandedSection === 'actions' ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-5 h-5 text-slate-400" />
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
                                        <div className="divide-y divide-slate-100">
                                            {todayActions.map((action, index) => (
                                                <Link
                                                    key={`${action.type}-${action.booking.id}`}
                                                    href={`/admin/bookings/${action.booking.id}`}
                                                >
                                                    <motion.div
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: index * 0.05 }}
                                                        className="p-3 flex items-center gap-3 active:bg-slate-50 transition-colors"
                                                    >
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${action.type === 'pickup' ? 'bg-green-100' :
                                                            action.type === 'return' ? 'bg-orange-100' :
                                                                'bg-purple-100'
                                                            }`}>
                                                            {action.type === 'pickup' && <Package className="w-4 h-4 text-green-600" />}
                                                            {action.type === 'return' && <PackageOpen className="w-4 h-4 text-orange-600" />}
                                                            {action.type === 'payment' && <DollarSign className="w-4 h-4 text-purple-600" />}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="font-medium text-slate-900 text-sm truncate">
                                                                {action.booking.customer?.full_name || 'Unknown'}
                                                            </p>
                                                            <p className="text-xs text-slate-500 truncate">
                                                                {action.booking.camera?.name} • {
                                                                    action.type === 'pickup' ? 'Pickup @10PM' :
                                                                        action.type === 'return' ? 'Return by 8PM' :
                                                                            `RM${action.booking.final_payment_amount} due`
                                                                }
                                                            </p>
                                                        </div>
                                                        <Badge
                                                            variant={
                                                                action.type === 'pickup' ? 'success' :
                                                                    action.type === 'return' ? 'warning' :
                                                                        'secondary'
                                                            }
                                                            className="text-xs shrink-0"
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
                                            <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                            <p className="text-sm text-slate-600">All caught up! No actions needed.</p>
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
                <Card className="border-slate-200">
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-500">This Month</p>
                                    <p className="text-lg font-bold text-slate-900">RM{monthlyRevenue.toLocaleString()}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-xs text-slate-500">This Week</p>
                                <p className="text-sm font-semibold text-emerald-600">+RM{weeklyRevenue.toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Simple progress indicator */}
                        <div className="w-full bg-slate-100 rounded-full h-2">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${Math.min((monthlyRevenue / 5000) * 100, 100)}%` }}
                                transition={{ delay: 0.5, duration: 0.8 }}
                                className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full"
                            />
                        </div>
                        <p className="text-xs text-slate-500 mt-1.5 text-center">
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
                <Card className="border-slate-200 overflow-hidden">
                    <button
                        onClick={() => toggleSection('cameras')}
                        className="w-full p-3 flex items-center justify-between bg-slate-50 border-b border-slate-100"
                    >
                        <div className="flex items-center gap-2">
                            <Camera className="w-4 h-4 text-blue-600" />
                            <span className="font-semibold text-slate-900 text-sm">Camera Status</span>
                        </div>
                        <motion.div
                            animate={{ rotate: expandedSection === 'cameras' ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-5 h-5 text-slate-400" />
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
                                                className="flex items-center justify-between p-2 bg-slate-50 rounded-lg"
                                            >
                                                <div className="flex items-center gap-2">
                                                    <div className={`w-2 h-2 rounded-full ${!isRented ? 'bg-green-500' : 'bg-orange-500'}`} />
                                                    <span className="text-sm font-medium text-slate-900 truncate max-w-[180px]">
                                                        {camera.name}
                                                    </span>
                                                </div>
                                                <Badge variant={!isRented ? "success" : "secondary"} className="text-xs">
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
                <Card className="border-slate-200 overflow-hidden">
                    <button
                        onClick={() => toggleSection('bookings')}
                        className="w-full p-3 flex items-center justify-between bg-slate-50 border-b border-slate-100"
                    >
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-purple-600" />
                            <span className="font-semibold text-slate-900 text-sm">Recent Bookings</span>
                        </div>
                        <motion.div
                            animate={{ rotate: expandedSection === 'bookings' ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="w-5 h-5 text-slate-400" />
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
                                            <div className="divide-y divide-slate-100">
                                                {recentBookings.map((booking) => (
                                                    <Link key={booking.id} href={`/admin/bookings/${booking.id}`}>
                                                        <div className="p-3 flex items-center justify-between active:bg-slate-50 transition-colors">
                                                            <div className="flex-1 min-w-0">
                                                                <p className="font-medium text-slate-900 text-sm truncate">
                                                                    {booking.customer?.full_name}
                                                                </p>
                                                                <p className="text-xs text-slate-500 truncate">
                                                                    {booking.camera?.name} • {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="text-sm font-medium text-slate-900">RM{booking.total_amount}</span>
                                                                <ChevronRight className="w-4 h-4 text-slate-300" />
                                                            </div>
                                                        </div>
                                                    </Link>
                                                ))}
                                            </div>
                                            <Link href="/admin/bookings">
                                                <div className="p-3 text-center border-t border-slate-100 active:bg-slate-50">
                                                    <span className="text-sm font-medium text-indigo-600">View All Bookings</span>
                                                </div>
                                            </Link>
                                        </>
                                    ) : (
                                        <div className="p-6 text-center">
                                            <p className="text-sm text-slate-500">No recent bookings</p>
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
                className="fixed bottom-6 left-4 right-4 z-50"
            >
                <div className="bg-white border border-slate-200 rounded-2xl shadow-lg p-2 flex items-center justify-around">
                    <Link href="/admin/bookings/add" className="flex-1">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-3 px-2 rounded-xl bg-indigo-600 text-white font-medium text-sm flex items-center justify-center gap-2"
                        >
                            <Package className="w-4 h-4" />
                            New Booking
                        </motion.button>
                    </Link>
                    <Link href="/admin/bookings" className="flex-1 ml-2">
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            className="w-full py-3 px-2 rounded-xl bg-slate-100 text-slate-700 font-medium text-sm flex items-center justify-center gap-2"
                        >
                            <Clock className="w-4 h-4" />
                            All Bookings
                        </motion.button>
                    </Link>
                </div>
            </motion.div>
        </div>
    );
}
