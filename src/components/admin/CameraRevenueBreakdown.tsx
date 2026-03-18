'use client';

import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    BarChart3
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface Booking {
    id: string;
    camera_id?: string;
    camera?: { id?: string; name?: string };
    total_amount: number;
    deposit_amount?: number;
    final_payment_amount?: number;
    deposit_paid?: boolean;
    final_payment_paid?: boolean;
    final_payment_paid_date?: string | null;
    created_at?: string;
    start_date: string;
}

interface Camera {
    id: string;
    name: string;
}

interface CameraRevenueBreakdownProps {
    bookings: Booking[];
    cameras: Camera[];
    variant?: 'mobile' | 'desktop';
}

export default function CameraRevenueBreakdown({
    bookings,
    cameras,
    variant = 'mobile'
}: CameraRevenueBreakdownProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date());

    // Calculate revenue per camera for the selected month
    const revenueData = useMemo(() => {
        const monthStart = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
        const monthEnd = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

        // Filter bookings that are paid and within the selected month
        const monthlyBookings = bookings.filter(b => {
            // Only count fully paid bookings
            if (!b.deposit_paid || !b.final_payment_paid) return false;

            // Check if final payment was received within the selected month
            if (!b.final_payment_paid_date) return false;

            const paymentDate = new Date(b.final_payment_paid_date);
            return paymentDate >= monthStart && paymentDate <= monthEnd;
        });

        // Calculate revenue per camera
        const cameraRevenue: Record<string, { name: string; revenue: number; bookings: number }> = {};

        cameras.forEach(camera => {
            cameraRevenue[camera.id] = {
                name: camera.name,
                revenue: 0,
                bookings: 0
            };
        });

        monthlyBookings.forEach(booking => {
            const cameraId = booking.camera_id || booking.camera?.id;
            if (cameraId && cameraRevenue[cameraId]) {
                // Use the new payment system: final_payment_amount if deposit is RM100
                const isNewPaymentSystem = booking.deposit_amount === 100;
                const revenue = isNewPaymentSystem
                    ? (booking.final_payment_amount || 0)
                    : (booking.total_amount - (booking.deposit_amount || 0));

                cameraRevenue[cameraId].revenue += revenue;
                cameraRevenue[cameraId].bookings += 1;
            }
        });

        // Convert to array and sort by revenue
        const revenueArray = Object.values(cameraRevenue)
            .filter(c => c.name) // Only include cameras that exist
            .sort((a, b) => b.revenue - a.revenue);

        const totalRevenue = revenueArray.reduce((sum, c) => sum + c.revenue, 0);
        const maxRevenue = Math.max(...revenueArray.map(c => c.revenue), 1);

        return {
            cameras: revenueArray,
            totalRevenue,
            maxRevenue
        };
    }, [bookings, cameras, selectedMonth]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        setSelectedMonth(prev => {
            const newDate = new Date(prev);
            if (direction === 'prev') {
                newDate.setMonth(newDate.getMonth() - 1);
            } else {
                newDate.setMonth(newDate.getMonth() + 1);
            }
            return newDate;
        });
    };

    const monthName = selectedMonth.toLocaleDateString('en-MY', {
        month: 'long',
        year: 'numeric'
    });

    const isCurrentMonth = selectedMonth.getMonth() === new Date().getMonth() &&
        selectedMonth.getFullYear() === new Date().getFullYear();

    if (variant === 'mobile') {
        return (
            <Card className="overflow-hidden border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex w-full items-center justify-between border-b border-[#26211d] bg-[#1b1714] p-3"
                >
                    <div className="flex items-center gap-2">
                        <BarChart3 className="h-4 w-4 text-orange-300" />
                        <span className="text-sm font-semibold text-stone-100">Camera Revenue</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-orange-300">
                            RM{revenueData.totalRevenue.toFixed(0)}
                        </span>
                        <motion.div
                            animate={{ rotate: isExpanded ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ChevronDown className="h-5 w-5 text-stone-500" />
                        </motion.div>
                    </div>
                </button>

                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            <CardContent className="p-3 space-y-3">
                                {/* Month Navigator */}
                                <div className="flex items-center justify-between">
                                    <button
                                        onClick={() => navigateMonth('prev')}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#332b25] bg-[#1f1a16] transition-colors hover:bg-[#26211d]"
                                    >
                                        <ChevronLeft className="h-4 w-4 text-stone-300" />
                                    </button>
                                    <span className="text-sm font-semibold text-stone-200">{monthName}</span>
                                    <button
                                        onClick={() => navigateMonth('next')}
                                        disabled={isCurrentMonth}
                                        className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#332b25] bg-[#1f1a16] transition-colors hover:bg-[#26211d] disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <ChevronRight className="h-4 w-4 text-stone-300" />
                                    </button>
                                </div>

                                {/* Camera Revenue List */}
                                <div className="space-y-2">
                                    {revenueData.cameras.map((camera, index) => (
                                        <div key={camera.name} className="relative">
                                            <div className="relative z-10 flex items-center justify-between rounded-lg border border-[#2c2722] bg-[#1b1714] p-2">
                                                <div className="flex items-center gap-2">
                                                    <div className={`h-2 w-2 rounded-full ${camera.revenue > 0 ? 'bg-orange-300' : 'bg-stone-600'}`} />
                                                    <span className="max-w-[140px] truncate text-sm font-medium text-stone-100">
                                                        {camera.name}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs text-stone-500">
                                                        {camera.bookings} booking{camera.bookings !== 1 ? 's' : ''}
                                                    </span>
                                                    <span className={`text-sm font-bold ${camera.revenue > 0 ? 'text-orange-300' : 'text-stone-500'}`}>
                                                        RM{camera.revenue.toFixed(0)}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Revenue Bar */}
                                            {camera.revenue > 0 && (
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${(camera.revenue / revenueData.maxRevenue) * 100}%` }}
                                                    transition={{ delay: 0.1 * index, duration: 0.3 }}
                                                    className="absolute left-0 top-0 h-full rounded-lg bg-[#2a1d14]"
                                                    style={{ zIndex: 0 }}
                                                />
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {revenueData.cameras.length === 0 && (
                                    <p className="py-4 text-center text-sm text-stone-500">
                                        No revenue data for this month
                                    </p>
                                )}
                            </CardContent>
                        </motion.div>
                    )}
                </AnimatePresence>
            </Card>
        );
    }

    // Desktop variant
    return (
        <Card className="border-slate-200">
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-emerald-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-slate-900">Camera Revenue</h3>
                            <p className="text-xs text-slate-500">Monthly breakdown by camera</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">RM{revenueData.totalRevenue.toFixed(0)}</p>
                        <p className="text-xs text-slate-500">Total this month</p>
                    </div>
                </div>
            </div>

            <CardContent className="p-4 space-y-4">
                {/* Month Navigator */}
                <div className="flex items-center justify-center gap-4">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <span className="text-sm font-semibold text-slate-700 min-w-[140px] text-center">{monthName}</span>
                    <button
                        onClick={() => navigateMonth('next')}
                        disabled={isCurrentMonth}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                </div>

                {/* Bar Chart */}
                <div className="space-y-3">
                    {revenueData.cameras.map((camera, index) => (
                        <div key={camera.name} className="space-y-1">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-slate-700 truncate max-w-[200px]">
                                    {camera.name}
                                </span>
                                <span className={`text-sm font-bold ${camera.revenue > 0 ? 'text-emerald-600' : 'text-slate-400'}`}>
                                    RM{camera.revenue.toFixed(0)}
                                </span>
                            </div>
                            <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(camera.revenue / revenueData.maxRevenue) * 100}%` }}
                                    transition={{ delay: 0.05 * index, duration: 0.4 }}
                                    className="h-full bg-gradient-to-r from-emerald-400 to-green-500 rounded-full"
                                />
                            </div>
                            <div className="flex justify-between text-xs text-slate-500">
                                <span>{camera.bookings} booking{camera.bookings !== 1 ? 's' : ''}</span>
                                {revenueData.totalRevenue > 0 && (
                                    <span>{((camera.revenue / revenueData.totalRevenue) * 100).toFixed(0)}% of total</span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                {revenueData.cameras.length === 0 && (
                    <p className="text-center text-sm text-slate-500 py-8">
                        No revenue data for this month
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
