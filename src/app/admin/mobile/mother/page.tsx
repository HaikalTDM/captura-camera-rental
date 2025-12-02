'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import {
    Camera,
    DollarSign,
    TrendingUp,
    Calendar,
    Clock,
    CheckCircle2,
    Heart,
    ArrowUpRight,
    User,
    Phone,
    AlertCircle,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { getAllBookings, getAllCameras } from '@/lib/api/bookings';
import { Booking, Camera as CameraType } from '@/lib/supabase';

export default function MobileMotherDashboard() {
    const [bookings, setBookings] = useState<Booking[]>([]);
    const [motherCamera, setMotherCamera] = useState<CameraType | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(darkMode);
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [allBookings, allCameras] = await Promise.all([
                getAllBookings(),
                getAllCameras()
            ]);

            // Find Mother's R50 camera
            const r50Mother = allCameras.find(c => c.name === 'Canon R50 - Mother');
            setMotherCamera(r50Mother || null);

            // Filter bookings for Mother's R50 only
            if (r50Mother) {
                const motherBookings = allBookings.filter(b => b.camera_id === r50Mother.id);
                setBookings(motherBookings);
            }
        } catch (error) {
            console.error('Error loading Mother dashboard data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Calculate metrics
    const metrics = useMemo(() => {
        const today = new Date().toISOString().split('T')[0];

        // Total revenue (fully paid bookings OR completed bookings)
        const totalRevenue = bookings
            .filter(b =>
                (b.deposit_paid && b.final_payment_paid) ||
                b.booking_status === 'completed'
            )
            .reduce((sum, b) => {
                const isNewPaymentSystem = b.deposit_amount === 100;
                return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
            }, 0);

        // Monthly revenue
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        const monthlyRevenue = bookings
            .filter(b =>
                ((b.deposit_paid && b.final_payment_paid) || b.booking_status === 'completed') &&
                new Date(b.created_at).getMonth() === currentMonth &&
                new Date(b.created_at).getFullYear() === currentYear
            )
            .reduce((sum, b) => {
                const isNewPaymentSystem = b.deposit_amount === 100;
                return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
            }, 0);

        // Active bookings (currently rented)
        const activeBookings = bookings.filter(b =>
            b.booking_status === 'confirmed' &&
            b.equipment_picked_up &&
            !b.equipment_returned
        );

        // Upcoming bookings (next 7 days)
        const nextWeek = new Date();
        nextWeek.setDate(nextWeek.getDate() + 7);
        const upcomingBookings = bookings.filter(b =>
            b.booking_status === 'confirmed' &&
            !b.equipment_picked_up &&
            new Date(b.start_date) >= new Date(today) &&
            new Date(b.start_date) <= nextWeek
        );

        // Total bookings
        const totalBookings = bookings.length;

        // Pending approvals
        const pendingApprovals = bookings.filter(b => b.booking_status === 'pending_approval').length;

        return {
            totalRevenue,
            monthlyRevenue,
            totalBookings,
            activeBookings,
            upcomingBookings,
            pendingApprovals
        };
    }, [bookings]);

    // Calendar helper functions
    const getBookingsForDate = (date: Date): Booking[] => {
        return bookings.filter(booking => {
            const startDate = new Date(booking.start_date);
            const endDate = new Date(booking.end_date);
            startDate.setHours(0, 0, 0, 0);
            endDate.setHours(0, 0, 0, 0);
            const checkDate = new Date(date);
            checkDate.setHours(0, 0, 0, 0);

            return checkDate >= startDate && checkDate <= endDate;
        });
    };

    // Generate calendar days for current month
    const calendarDays = useMemo(() => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();

        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);

        const startingDayOfWeek = firstDay.getDay();
        const daysFromPrevMonth = startingDayOfWeek;

        const days = [];

        // Previous month days
        const prevMonthLastDay = new Date(year, month, 0);
        for (let i = daysFromPrevMonth - 1; i >= 0; i--) {
            const date = new Date(year, month - 1, prevMonthLastDay.getDate() - i);
            days.push({
                date,
                isCurrentMonth: false,
                isToday: false,
                bookings: getBookingsForDate(date)
            });
        }

        // Current month days
        for (let day = 1; day <= lastDay.getDate(); day++) {
            const date = new Date(year, month, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            date.setHours(0, 0, 0, 0);

            days.push({
                date,
                isCurrentMonth: true,
                isToday: date.getTime() === today.getTime(),
                bookings: getBookingsForDate(date)
            });
        }

        // Next month days
        const remainingDays = 42 - days.length;
        for (let day = 1; day <= remainingDays; day++) {
            const date = new Date(year, month + 1, day);
            days.push({
                date,
                isCurrentMonth: false,
                isToday: false,
                bookings: getBookingsForDate(date)
            });
        }

        return days;
    }, [currentDate, bookings]);

    const selectedDateBookings = selectedDate ? getBookingsForDate(selectedDate) : [];
    const currentRenter = metrics.activeBookings.length > 0 ? metrics.activeBookings[0] : null;

    if (isLoading) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} flex items-center justify-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (!motherCamera) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} p-4`}>
                <div className={`max-w-2xl mx-auto ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-6`}>
                    <div className="text-center">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Camera Not Found</h2>
                        <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Mother's Canon R50 camera has not been set up yet.
                        </p>
                        <Link href="/admin/mobile">
                            <button className="px-4 py-2 bg-pink-500 text-white rounded-lg font-semibold">
                                Back to Dashboard
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} pb-24`}>
            <div className="px-4 pt-4 space-y-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg"
                >
                    <div className="flex items-center gap-3 mb-3">
                        <Heart className="w-7 h-7" />
                        <h1 className="text-xl font-bold">Mother's Dashboard</h1>
                    </div>
                    <p className="text-pink-100 text-sm mb-4">
                        Canon R50 Rental Management
                    </p>

                    {/* Quick Actions */}
                    <div className="flex gap-2">
                        <Link href="/admin/bookings/add" className="flex-1">
                            <button className="w-full bg-white text-pink-600 hover:bg-pink-50 py-2.5 px-3 rounded-xl font-semibold text-sm shadow-md transition-all active:scale-95">
                                Create Booking
                            </button>
                        </Link>
                        <Link href="/admin/mobile/mother/bookings" className="flex-1">
                            <button className="w-full bg-white/20 hover:bg-white/30 text-white py-2.5 px-3 rounded-xl font-semibold text-sm transition-all active:scale-95">
                                All Bookings
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Pending Approvals Alert */}
                {metrics.pendingApprovals > 0 && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                    >
                        <Link href="/admin/mobile/mother/approvals">
                            <div className="bg-orange-500 hover:bg-orange-600 transition-colors rounded-xl p-4 cursor-pointer active:scale-[0.98]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                            <AlertCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-white text-sm">
                                                {metrics.pendingApprovals} {metrics.pendingApprovals === 1 ? 'Booking' : 'Bookings'} Awaiting
                                            </p>
                                            <p className="text-xs text-orange-100">
                                                Tap to review
                                            </p>
                                        </div>
                                    </div>
                                    <ArrowUpRight className="w-5 h-5 text-white" />
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                )}

                {/* Key Metrics - 2x2 Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {/* Total Revenue */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 shadow-sm`}
                    >
                        <DollarSign className="w-5 h-5 text-green-600 mb-2" />
                        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Total Revenue</p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>RM{metrics.totalRevenue}</p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>All time</p>
                    </motion.div>

                    {/* Monthly Revenue */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 shadow-sm`}
                    >
                        <TrendingUp className="w-5 h-5 text-blue-600 mb-2" />
                        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>This Month</p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>RM{metrics.monthlyRevenue}</p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>{new Date().toLocaleDateString('en-MY', { month: 'long' })}</p>
                    </motion.div>

                    {/* Total Bookings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 shadow-sm`}
                    >
                        <Calendar className="w-5 h-5 text-purple-600 mb-2" />
                        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Total Bookings</p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{metrics.totalBookings}</p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Lifetime</p>
                    </motion.div>

                    {/* Upcoming Bookings */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                        className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 shadow-sm`}
                    >
                        <Clock className="w-5 h-5 text-pink-600 mb-2" />
                        <p className={`text-xs font-bold uppercase tracking-wide mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Upcoming</p>
                        <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{metrics.upcomingBookings.length}</p>
                        <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>Next 7 days</p>
                    </motion.div>
                </div>

                {/* Camera Status Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 shadow-sm`}
                >
                    <div className="flex items-center gap-2 mb-3">
                        <Camera className="w-5 h-5 text-pink-600" />
                        <h3 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Canon R50 Status</h3>
                    </div>

                    {currentRenter ? (
                        <div className="space-y-3">
                            <div className="inline-flex px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold">
                                Currently Rented
                            </div>
                            <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} border rounded-lg p-3 space-y-2`}>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-pink-100 flex items-center justify-center">
                                        <User className="w-3 h-3 text-pink-600" />
                                    </div>
                                    <span className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {currentRenter.customer?.full_name || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center">
                                        <Phone className="w-3 h-3 text-blue-600" />
                                    </div>
                                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {currentRenter.customer?.phone || 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-purple-100 flex items-center justify-center">
                                        <Calendar className="w-3 h-3 text-purple-600" />
                                    </div>
                                    <span className={`text-xs ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                        {new Date(currentRenter.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - {new Date(currentRenter.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-4">
                            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-2">
                                <CheckCircle2 className="w-6 h-6 text-green-600" />
                            </div>
                            <p className={`text-sm font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Camera Available</p>
                            <p className={`text-xs mt-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>Ready for next booking</p>
                            {metrics.upcomingBookings.length > 0 && (
                                <div className={`mt-3 pt-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} border-t`}>
                                    <p className={`text-xs uppercase tracking-wide mb-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Next Booking</p>
                                    <p className={`text-xs font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {new Date(metrics.upcomingBookings[0].start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
                                    </p>
                                    <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                        {metrics.upcomingBookings[0].customer?.full_name || 'N/A'}
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </motion.div>

                {/* Booking Calendar */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 shadow-sm`}
                >
                    <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Booking Calendar</h3>

                    {/* Calendar Header */}
                    <div className="flex items-center justify-between mb-3">
                        <button
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                            className={`p-1.5 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} rounded-lg transition-colors`}
                        >
                            <ChevronLeft className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                        </button>
                        <div className="flex items-center gap-2">
                            <h4 className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                {currentDate.toLocaleDateString('en-MY', { month: 'long', year: 'numeric' })}
                            </h4>
                            <button
                                onClick={() => setCurrentDate(new Date())}
                                className={`text-xs px-2 py-1 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-slate-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600'} rounded transition-colors font-medium`}
                            >
                                Today
                            </button>
                        </div>
                        <button
                            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                            className={`p-1.5 ${isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100'} rounded-lg transition-colors`}
                        >
                            <ChevronRight className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} />
                        </button>
                    </div>

                    {/* Calendar Grid */}
                    <div className={`grid grid-cols-7 gap-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-200'} rounded-lg overflow-hidden shadow-sm mb-3`}>
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                            <div key={i} className={`text-center text-xs font-bold py-2 ${isDarkMode ? 'bg-slate-800 text-slate-500' : 'bg-slate-50 text-slate-600'} uppercase`}>
                                {day}
                            </div>
                        ))}

                        {calendarDays.map((day, index) => {
                            const hasBookings = day.bookings.length > 0;
                            const isSelected = selectedDate?.toDateString() === day.date.toDateString();
                            const isPast = day.date < new Date(new Date().setHours(0, 0, 0, 0));

                            return (
                                <button
                                    key={index}
                                    onClick={() => setSelectedDate(day.date)}
                                    className={`
                    relative min-h-[44px] p-2 transition-all
                    ${!day.isCurrentMonth ? (isDarkMode ? 'bg-slate-900 text-slate-700' : 'bg-slate-50 text-slate-300') : (isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-white text-slate-700')}
                    ${day.isToday ? '!bg-pink-500 shadow-md ring-2 ring-pink-300' : ''}
                    ${isSelected && !day.isToday ? (isDarkMode ? 'bg-pink-900/30 ring-2 ring-pink-500' : 'bg-pink-50 ring-2 ring-pink-400') : ''}
                    ${!day.isToday && !isSelected && day.isCurrentMonth ? (isDarkMode ? 'hover:bg-slate-800' : 'hover:bg-slate-100') : ''}
                    ${isPast && !day.isToday && day.isCurrentMonth ? 'opacity-60' : ''}
                  `}
                                >
                                    <span className={`block text-xs leading-none font-bold ${day.isToday ? 'text-slate-900' : ''}`}>{day.date.getDate()}</span>

                                    {/* Booking Indicator */}
                                    <div className="absolute bottom-1.5 left-1/2 transform -translate-x-1/2 flex gap-0.5">
                                        {day.isCurrentMonth && !isPast && (
                                            hasBookings ? (
                                                <div className={`w-1.5 h-1.5 rounded-full ${day.isToday ? 'bg-slate-900' : 'bg-red-500'}`} />
                                            ) : (
                                                <div className={`w-1.5 h-1.5 rounded-full ${day.isToday ? 'bg-slate-900/50' : (isDarkMode ? 'bg-slate-700' : 'bg-slate-300')}`} />
                                            )
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className={`flex items-center justify-center gap-4 py-2 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg mb-3`}>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
                            <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Available</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span className={`text-xs font-medium ${isDarkMode ? 'text-slate-500' : 'text-slate-600'}`}>Booked</span>
                        </div>
                    </div>

                    {/* Selected Date Info */}
                    {selectedDate && selectedDateBookings.length > 0 && (
                        <div className={`pt-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-200'} border-t`}>
                            <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                {selectedDate.toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                            </p>
                            <div className="space-y-2">
                                {selectedDateBookings.slice(0, 2).map(booking => (
                                    <div
                                        key={booking.id}
                                        className={`p-2 ${isDarkMode ? 'bg-pink-900/20 border-pink-800' : 'bg-pink-50 border-pink-100'} rounded border`}
                                    >
                                        <p className={`font-semibold text-xs ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {booking.customer?.full_name || 'N/A'}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                            {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} → {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                ))}
                                {selectedDateBookings.length > 2 && (
                                    <p className={`text-xs text-center ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                        +{selectedDateBookings.length - 2} more
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </motion.div>

                {/* Upcoming Bookings List */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 shadow-sm`}
                >
                    <h3 className={`text-sm font-bold mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Upcoming Bookings</h3>

                    {metrics.upcomingBookings.length > 0 ? (
                        <div className="space-y-2">
                            {metrics.upcomingBookings.slice(0, 4).map((booking) => (
                                <div
                                    key={booking.id}
                                    className={`flex items-center justify-between p-3 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700' : 'bg-slate-50 hover:bg-slate-100'} rounded-lg transition-colors`}
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className={`font-semibold text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                            {booking.customer?.full_name || 'N/A'}
                                        </p>
                                        <p className={`text-xs mt-0.5 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                            {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} → {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                                        </p>
                                    </div>
                                    <div className="text-right ml-2">
                                        <p className={`font-bold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>RM{booking.total_amount}</p>
                                        <span className="inline-block mt-0.5 px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-bold">
                                            {booking.total_days}d
                                        </span>
                                    </div>
                                </div>
                            ))}
                            {metrics.upcomingBookings.length > 4 && (
                                <p className={`text-xs text-center pt-1 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                                    +{metrics.upcomingBookings.length - 4} more bookings
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-center py-6">
                            <div className={`w-12 h-12 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-full flex items-center justify-center mx-auto mb-2`}>
                                <Calendar className={`w-6 h-6 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                            </div>
                            <p className={`text-sm font-semibold mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-700'}`}>No upcoming bookings</p>
                            <p className={`text-xs mb-3 ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Camera is available for rent</p>
                            <Link href="/admin/bookings/add">
                                <button className="px-4 py-2 bg-pink-500 hover:bg-pink-600 text-white text-sm font-semibold rounded-lg transition-colors active:scale-95">
                                    Create Booking
                                </button>
                            </Link>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
