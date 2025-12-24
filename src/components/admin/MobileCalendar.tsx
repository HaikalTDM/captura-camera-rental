'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Camera,
    User,
    Clock,
    Eye,
    Info,
    X
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MobileCalendarProps {
    bookings: any[];
    cameras: any[];
    currentDate: Date;
    onDateChange: (date: Date) => void;
}

// Helper: check if two dates are the same day
const isSameDay = (d1: Date, d2: Date) =>
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate();

// Get camera color
const getCameraColor = (cameraName: string) => {
    if (cameraName.includes('Action 5 Pro')) return 'bg-blue-500';
    if (cameraName.includes('Osmo Pocket 3 (ii)')) return 'bg-teal-500';
    if (cameraName.includes('Osmo Pocket 3')) return 'bg-orange-500';
    if (cameraName.includes('Canon R50 - Mother')) return 'bg-pink-500';
    if (cameraName.includes('Canon R50')) return 'bg-indigo-500';
    return 'bg-purple-500';
};

const getCameraBgColor = (cameraName: string) => {
    if (cameraName.includes('Action 5 Pro')) return 'bg-blue-50 border-blue-200';
    if (cameraName.includes('Osmo Pocket 3 (ii)')) return 'bg-teal-50 border-teal-200';
    if (cameraName.includes('Osmo Pocket 3')) return 'bg-orange-50 border-orange-200';
    if (cameraName.includes('Canon R50 - Mother')) return 'bg-pink-50 border-pink-200';
    if (cameraName.includes('Canon R50')) return 'bg-indigo-50 border-indigo-200';
    return 'bg-purple-50 border-purple-200';
};

export default function MobileCalendar({ bookings, cameras, currentDate, onDateChange }: MobileCalendarProps) {
    const [showLegend, setShowLegend] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    const monthNames = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];

    // Filter bookings for display (confirmed + completed)
    const displayBookings = useMemo(() => {
        return bookings.filter(b => {
            const status = b.booking_status || b.status;
            return status === 'confirmed' || status === 'completed';
        });
    }, [bookings]);

    // Get bookings for the current month, grouped by date
    const monthBookings = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        return displayBookings.filter(b => {
            const start = new Date(b.start_date);
            const end = new Date(b.end_date);
            // Check if booking overlaps with current month
            const monthStart = new Date(year, month, 1);
            const monthEnd = new Date(year, month + 1, 0);
            return start <= monthEnd && end >= monthStart;
        }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    }, [displayBookings, currentDate]);

    // Generate mini calendar days
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());

        const days: { date: Date; isCurrentMonth: boolean; isToday: boolean; hasBookings: boolean; bookingColors: string[] }[] = [];
        const today = new Date();

        for (let i = 0; i < 35; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);

            // Find bookings for this day
            const dayBookings = displayBookings.filter(b => {
                const bookingStart = new Date(b.start_date);
                const bookingEnd = new Date(b.end_date);
                bookingStart.setHours(0, 0, 0, 0);
                bookingEnd.setHours(0, 0, 0, 0);
                const compareDate = new Date(date);
                compareDate.setHours(0, 0, 0, 0);
                return compareDate >= bookingStart && compareDate <= bookingEnd;
            });

            const bookingColors = [...new Set(dayBookings.map(b => getCameraColor(b.camera?.name || '')))];

            days.push({
                date: new Date(date),
                isCurrentMonth: date.getMonth() === month,
                isToday: isSameDay(date, today),
                hasBookings: dayBookings.length > 0,
                bookingColors
            });
        }

        return days;
    }, [displayBookings, currentDate]);

    // Get upcoming bookings (next 7 days from today)
    const upcomingBookings = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const weekLater = new Date(today);
        weekLater.setDate(today.getDate() + 7);

        return displayBookings.filter(b => {
            const start = new Date(b.start_date);
            start.setHours(0, 0, 0, 0);
            return start >= today && start <= weekLater;
        }).sort((a, b) => new Date(a.start_date).getTime() - new Date(b.start_date).getTime());
    }, [displayBookings]);

    // Stats
    const stats = useMemo(() => {
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const activeNow = displayBookings.filter(b => {
            const start = new Date(b.start_date);
            const end = new Date(b.end_date);
            start.setHours(0, 0, 0, 0);
            end.setHours(0, 0, 0, 0);
            return today >= start && today <= end;
        }).length;

        const thisMonth = monthBookings.length;
        const available = cameras.filter(c => c.is_available && c.available_quantity > 0).length;

        return { activeNow, thisMonth, available };
    }, [displayBookings, monthBookings, cameras]);

    // Get bookings for selected date
    const selectedDateBookings = useMemo(() => {
        if (!selectedDate) return [];

        return displayBookings.filter(b => {
            const bookingStart = new Date(b.start_date);
            const bookingEnd = new Date(b.end_date);
            bookingStart.setHours(0, 0, 0, 0);
            bookingEnd.setHours(0, 0, 0, 0);
            const compareDate = new Date(selectedDate);
            compareDate.setHours(0, 0, 0, 0);
            return compareDate >= bookingStart && compareDate <= bookingEnd;
        });
    }, [displayBookings, selectedDate]);

    const navigateMonth = (direction: 'prev' | 'next') => {
        const newDate = new Date(currentDate);
        newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
        onDateChange(newDate);
    };

    const formatDateRange = (startStr: string, endStr: string) => {
        const start = new Date(startStr);
        const end = new Date(endStr);
        const startDay = start.getDate();
        const endDay = end.getDate();
        const month = start.toLocaleDateString('en-MY', { month: 'short' });

        if (isSameDay(start, end)) {
            return `${startDay} ${month}`;
        }
        if (start.getMonth() === end.getMonth()) {
            return `${startDay}-${endDay} ${month}`;
        }
        const endMonth = end.toLocaleDateString('en-MY', { month: 'short' });
        return `${startDay} ${month} - ${endDay} ${endMonth}`;
    };

    const getRelativeDay = (dateStr: string) => {
        const date = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        date.setHours(0, 0, 0, 0);

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        if (isSameDay(date, today)) return 'Today';
        if (isSameDay(date, tomorrow)) return 'Tomorrow';
        return date.toLocaleDateString('en-MY', { weekday: 'short', day: 'numeric', month: 'short' });
    };

    return (
        <div className="pb-20 p-4">
            {/* Header with Stats - Pill Style */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-4 rounded-2xl shadow-lg"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                            <Calendar className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Calendar</h1>
                            <p className="text-xs text-slate-400">Rental Schedule</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowLegend(!showLegend)}
                        className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center"
                    >
                        <Info className="w-4 h-4 text-white" />
                    </button>
                </div>

                {/* Quick Stats Row */}
                <div className="flex gap-2">
                    <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
                        <p className="text-lg font-bold text-white">{stats.activeNow}</p>
                        <p className="text-[10px] text-slate-400">Active</p>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
                        <p className="text-lg font-bold text-white">{stats.thisMonth}</p>
                        <p className="text-[10px] text-slate-400">This Month</p>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
                        <p className="text-lg font-bold text-white">{stats.available}</p>
                        <p className="text-[10px] text-slate-400">Available</p>
                    </div>
                </div>

                {/* Collapsible Legend */}
                <AnimatePresence>
                    {showLegend && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <div className="mt-3 pt-3 border-t border-white/10">
                                <p className="text-xs text-slate-400 mb-2">Camera Colors</p>
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { name: 'Action 5 Pro', color: 'bg-blue-500' },
                                        { name: 'Osmo Pocket', color: 'bg-orange-500' },
                                        { name: 'Osmo (ii)', color: 'bg-teal-500' },
                                        { name: 'Canon R50', color: 'bg-indigo-500' },
                                        { name: 'Mother', color: 'bg-pink-500' },
                                    ].map(cam => (
                                        <div key={cam.name} className="flex items-center gap-1.5 bg-white/10 rounded-lg px-2 py-1">
                                            <div className={`w-2 h-2 rounded-full ${cam.color}`} />
                                            <span className="text-[10px] text-white">{cam.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Month Navigation + Mini Calendar */}
            <div className="mt-4 bg-white rounded-2xl border border-slate-200 overflow-hidden">
                {/* Month Nav */}
                <div className="flex items-center justify-between p-3 border-b border-slate-100">
                    <button
                        onClick={() => navigateMonth('prev')}
                        className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"
                    >
                        <ChevronLeft className="w-4 h-4 text-slate-600" />
                    </button>
                    <h2 className="font-bold text-slate-900">
                        {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                    </h2>
                    <button
                        onClick={() => navigateMonth('next')}
                        className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center"
                    >
                        <ChevronRight className="w-4 h-4 text-slate-600" />
                    </button>
                </div>

                {/* Mini Calendar Grid */}
                <div className="p-2">
                    {/* Day Headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className="text-center text-[10px] font-semibold text-slate-400 py-1">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar Days */}
                    <div className="grid grid-cols-7 gap-0.5">
                        {calendarDays.map((day, index) => (
                            <button
                                key={index}
                                onClick={() => setSelectedDate(day.date)}
                                className={`aspect-square rounded-lg flex flex-col items-center justify-center relative transition-colors ${!day.isCurrentMonth ? 'text-slate-300' : 'text-slate-700'
                                    } ${day.isToday ? 'bg-blue-100 text-blue-600 font-bold' : ''} ${selectedDate && isSameDay(day.date, selectedDate) ? 'ring-2 ring-blue-500' : ''
                                    }`}
                            >
                                <span className="text-xs">{day.date.getDate()}</span>
                                {/* Booking Dots */}
                                {day.bookingColors.length > 0 && (
                                    <div className="flex gap-0.5 mt-0.5">
                                        {day.bookingColors.slice(0, 3).map((color, i) => (
                                            <div key={i} className={`w-1 h-1 rounded-full ${color}`} />
                                        ))}
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Date Details Popup */}
            <AnimatePresence>
                {selectedDate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end justify-center p-4"
                        onClick={() => setSelectedDate(null)}
                    >
                        <motion.div
                            initial={{ y: 100, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            exit={{ y: 100, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white w-full max-w-lg rounded-t-3xl overflow-hidden shadow-xl"
                        >
                            {/* Popup Header */}
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                                            <Calendar className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-white">
                                                {selectedDate.toLocaleDateString('en-MY', {
                                                    weekday: 'long',
                                                    day: 'numeric',
                                                    month: 'long'
                                                })}
                                            </h3>
                                            <p className="text-xs text-slate-300">
                                                {selectedDateBookings.length} booking{selectedDateBookings.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedDate(null)}
                                        className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>
                            </div>

                            {/* Popup Content */}
                            <div className="p-4 max-h-[50vh] overflow-y-auto">
                                {selectedDateBookings.length === 0 ? (
                                    <div className="text-center py-8">
                                        <Calendar className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500">No bookings on this date</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {selectedDateBookings.map((booking) => {
                                            const cameraName = booking.camera?.name || 'Camera';
                                            const customerName = booking.customer?.full_name || 'Unknown';
                                            const customerPhone = booking.customer?.phone || '';
                                            const dotColor = getCameraColor(cameraName);
                                            const bgColor = getCameraBgColor(cameraName);

                                            return (
                                                <Link
                                                    key={booking.id}
                                                    href={`/admin/bookings/${booking.id}`}
                                                    onClick={() => setSelectedDate(null)}
                                                >
                                                    <div className={`p-3 rounded-xl border ${bgColor} active:scale-[0.98] transition-transform`}>
                                                        <div className="flex items-start gap-3">
                                                            <div className={`w-3 h-3 rounded-full ${dotColor} mt-1.5 flex-shrink-0`} />
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="font-semibold text-slate-900 text-sm">
                                                                    {cameraName}
                                                                </h4>
                                                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                                                                    <User className="w-3 h-3" />
                                                                    <span>{customerName}</span>
                                                                </div>
                                                                {customerPhone && (
                                                                    <p className="text-xs text-slate-500 mt-0.5 ml-5">
                                                                        {customerPhone}
                                                                    </p>
                                                                )}
                                                                <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                                    <Calendar className="w-3 h-3" />
                                                                    <span>{formatDateRange(booking.start_date, booking.end_date)}</span>
                                                                </div>
                                                            </div>
                                                            <span className="text-sm font-semibold text-slate-900">
                                                                RM{booking.total_amount}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Upcoming Bookings (Agenda View) */}
            <div className="mt-4">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-500" />
                    Upcoming Bookings
                </h3>

                {upcomingBookings.length === 0 ? (
                    <Card className="border-slate-200">
                        <CardContent className="p-6 text-center">
                            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No upcoming bookings this week</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {upcomingBookings.map((booking, index) => {
                            const cameraName = booking.camera?.name || 'Camera';
                            const customerName = booking.customer?.full_name || 'Customer';
                            const dotColor = getCameraColor(cameraName);
                            const bgColor = getCameraBgColor(cameraName);

                            return (
                                <motion.div
                                    key={booking.id}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <Link href={`/admin/bookings/${booking.id}`}>
                                        <Card className={`border ${bgColor} active:scale-[0.98] transition-transform`}>
                                            <CardContent className="p-3">
                                                <div className="flex items-start gap-3">
                                                    {/* Color Dot */}
                                                    <div className={`w-3 h-3 rounded-full ${dotColor} mt-1 flex-shrink-0`} />

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center justify-between">
                                                            <h4 className="font-semibold text-slate-900 text-sm truncate">
                                                                {cameraName}
                                                            </h4>
                                                            <span className="text-xs text-slate-500 flex-shrink-0 ml-2">
                                                                {getRelativeDay(booking.start_date)}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-600">
                                                            <User className="w-3 h-3" />
                                                            <span className="truncate">{customerName}</span>
                                                        </div>
                                                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500">
                                                            <Calendar className="w-3 h-3" />
                                                            <span>{formatDateRange(booking.start_date, booking.end_date)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </Link>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* This Month's Bookings */}
            <div className="mt-6">
                <h3 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    {monthNames[currentDate.getMonth()]} Bookings ({monthBookings.length})
                </h3>

                {monthBookings.length === 0 ? (
                    <Card className="border-slate-200">
                        <CardContent className="p-6 text-center">
                            <Calendar className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">No bookings this month</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-2">
                        {monthBookings.slice(0, 10).map((booking, index) => {
                            const cameraName = booking.camera?.name || 'Camera';
                            const customerName = booking.customer?.full_name || 'Customer';
                            const dotColor = getCameraColor(cameraName);
                            const isCompleted = booking.booking_status === 'completed';

                            return (
                                <Link key={booking.id} href={`/admin/bookings/${booking.id}`}>
                                    <div className={`flex items-center gap-3 p-2.5 rounded-xl border border-slate-100 bg-white ${isCompleted ? 'opacity-50' : ''
                                        }`}>
                                        <div className={`w-2 h-2 rounded-full ${dotColor} flex-shrink-0`} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-900 truncate">{cameraName}</p>
                                            <p className="text-xs text-slate-500 truncate">{customerName}</p>
                                        </div>
                                        <span className="text-xs text-slate-400 flex-shrink-0">
                                            {formatDateRange(booking.start_date, booking.end_date)}
                                        </span>
                                    </div>
                                </Link>
                            );
                        })}

                        {monthBookings.length > 10 && (
                            <p className="text-center text-xs text-slate-500 py-2">
                                +{monthBookings.length - 10} more bookings
                            </p>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
