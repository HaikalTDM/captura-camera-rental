'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    Eye,
    Edit,
    Trash2,
    Plus,
    Calendar,
    Camera,
    CheckCircle2,
    XCircle,
    ArrowLeft,
    Heart,
    ChevronLeft,
    Filter,
    X,
    Phone,
    DollarSign
} from 'lucide-react';
import { useAdminData } from '@/contexts/AdminDataContext';
import { Badge } from '@/components/ui/badge';

type FilterState = {
    search: string;
    status: string[];
    dateRange: {
        start: string;
        end: string;
    };
};

export default function MobileMotherBookingsPage() {
    const { bookings, cameras, isLoading, mutateBookings } = useAdminData();
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [quickFilter, setQuickFilter] = useState<'all' | 'pending' | 'confirmed' | 'completed'>('all');
    const [showFilters, setShowFilters] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const [filters, setFilters] = useState<FilterState>({
        search: '',
        status: [],
        dateRange: { start: '', end: '' },
    });

    useEffect(() => {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(darkMode);
    }, []);

    // Get Mother's camera
    const motherCamera = useMemo(() => {
        return cameras.find(c => c.name === 'Canon R50 - Mother');
    }, [cameras]);

    // Filter bookings for Mother's camera only
    const motherBookings = useMemo(() => {
        if (!motherCamera) return [];
        return bookings.filter(b => b.camera_id === motherCamera.id);
    }, [bookings, motherCamera]);

    // Apply filters
    const filteredBookings = useMemo(() => {
        return motherBookings.filter(booking => {
            // Quick filter
            if (quickFilter !== 'all') {
                if (quickFilter === 'pending' && booking.booking_status !== 'pending_approval') return false;
                if (quickFilter === 'confirmed' && booking.booking_status !== 'confirmed') return false;
                if (quickFilter === 'completed' && booking.booking_status !== 'completed') return false;
            }

            // Search filter
            if (filters.search) {
                const searchLower = filters.search.toLowerCase();
                const matchesName = booking.customer?.full_name?.toLowerCase().includes(searchLower);
                const matchesPhone = booking.customer?.phone?.toLowerCase().includes(searchLower);
                const matchesId = booking.id.toLowerCase().includes(searchLower);
                if (!matchesName && !matchesPhone && !matchesId) return false;
            }

            return true;
        });
    }, [motherBookings, quickFilter, filters]);

    // Sort by newest first
    const sortedBookings = useMemo(() => {
        return [...filteredBookings].sort((a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
    }, [filteredBookings]);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this booking?')) return;

        setDeletingId(id);
        try {
            const response = await fetch(`/api/bookings/${id}/delete`, {
                method: 'DELETE',
            });

            if (response.ok) {
                mutateBookings();
            } else {
                alert('Failed to delete booking');
            }
        } catch (error) {
            console.error('Error deleting booking:', error);
            alert('Error deleting booking');
        } finally {
            setDeletingId(null);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            pending_approval: { label: 'Pending', className: 'bg-orange-100 text-orange-800' },
            confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800' },
            approved: { label: 'Approved', className: 'bg-green-100 text-green-800' },
            completed: { label: 'Completed', className: 'bg-slate-100 text-slate-800' },
            cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800' },
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending_approval;
        return (
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-bold ${config.className}`}>
                {config.label}
            </span>
        );
    };

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
                            <XCircle className="w-8 h-8 text-red-600" />
                        </div>
                        <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Camera Not Found</h2>
                        <p className={`text-sm mb-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                            Mother's Canon R50 camera has not been set up yet.
                        </p>
                        <Link href="/admin/mobile/mother">
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
                    <Link href="/admin/mobile/mother">
                        <button className="flex items-center gap-1 text-white/90 hover:text-white mb-3 active:scale-95 transition-transform">
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm font-semibold">Back</span>
                        </button>
                    </Link>

                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <Heart className="w-7 h-7" />
                                <h1 className="text-xl font-bold">All Bookings</h1>
                            </div>
                            <p className="text-pink-100 text-sm">
                                Manage Mother's Canon R50 rentals
                            </p>
                        </div>
                        <Link href="/admin/bookings/add">
                            <button className="p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors active:scale-95">
                                <Plus className="w-6 h-6" />
                            </button>
                        </Link>
                    </div>
                </motion.div>

                {/* Search & Filters */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="space-y-3"
                >
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                        <input
                            type="text"
                            placeholder="Search bookings..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className={`w-full pl-10 pr-4 py-3 ${isDarkMode ? 'bg-slate-900 border-slate-800 text-white placeholder-slate-500' : 'bg-white border-slate-200 text-slate-900 placeholder-slate-400'} border rounded-xl focus:ring-2 focus:ring-pink-500 focus:border-transparent text-sm outline-none transition-all`}
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {(['all', 'pending', 'confirmed', 'completed'] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setQuickFilter(filter)}
                                className={`
                  whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all
                  ${quickFilter === filter
                                        ? 'bg-pink-500 text-white shadow-md'
                                        : (isDarkMode ? 'bg-slate-900 text-slate-400 border border-slate-800' : 'bg-white text-slate-600 border border-slate-200')}
                `}
                            >
                                {filter.charAt(0).toUpperCase() + filter.slice(1)}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Bookings List */}
                <div className="space-y-3">
                    {sortedBookings.length > 0 ? (
                        sortedBookings.map((booking, index) => (
                            <motion.div
                                key={booking.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 + index * 0.05 }}
                                className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 shadow-sm`}
                            >
                                {/* Header */}
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center flex-shrink-0 text-white font-bold shadow-sm">
                                            {booking.customer?.full_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className={`text-sm font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {booking.customer?.full_name}
                                            </h4>
                                            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>#{booking.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    {getStatusBadge(booking.booking_status || 'pending_approval')}
                                </div>

                                {/* Details */}
                                <div className={`grid grid-cols-2 gap-3 mb-3 pb-3 ${isDarkMode ? 'border-slate-800' : 'border-slate-100'} border-b`}>
                                    <div>
                                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Dates</p>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className={`w-3.5 h-3.5 ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`} />
                                            <p className={`text-xs font-medium ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                                                {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>
                                    <div>
                                        <p className={`text-xs mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Amount</p>
                                        <div className="flex items-center gap-1.5">
                                            <DollarSign className="w-3.5 h-3.5 text-pink-500" />
                                            <p className={`text-xs font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                RM{booking.total_amount}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Status Indicators */}
                                <div className="flex gap-2 mb-3">
                                    <Badge variant={booking.deposit_paid ? 'success' : 'secondary'} className="text-[10px] px-2 py-0.5 h-auto">
                                        {booking.deposit_paid ? '✓' : '○'} Deposit
                                    </Badge>
                                    <Badge variant={booking.equipment_picked_up ? 'info' : 'secondary'} className="text-[10px] px-2 py-0.5 h-auto">
                                        {booking.equipment_picked_up ? '✓' : '○'} Pickup
                                    </Badge>
                                    <Badge variant={booking.equipment_returned ? 'success' : 'secondary'} className="text-[10px] px-2 py-0.5 h-auto">
                                        {booking.equipment_returned ? '✓' : '○'} Return
                                    </Badge>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <Link href={`/admin/bookings/${booking.id}`} className="flex-1">
                                        <button className={`w-full py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} rounded-lg font-semibold text-xs transition-colors active:scale-95 flex items-center justify-center gap-1.5`}>
                                            <Eye className="w-3.5 h-3.5" />
                                            View
                                        </button>
                                    </Link>
                                    <Link href={`/admin/bookings/${booking.id}/edit`} className="flex-1">
                                        <button className={`w-full py-2 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} rounded-lg font-semibold text-xs transition-colors active:scale-95 flex items-center justify-center gap-1.5`}>
                                            <Edit className="w-3.5 h-3.5" />
                                            Edit
                                        </button>
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(booking.id)}
                                        disabled={deletingId === booking.id}
                                        className={`w-10 flex items-center justify-center ${isDarkMode ? 'bg-red-900/20 text-red-400' : 'bg-red-50 text-red-600'} rounded-lg transition-colors active:scale-95`}
                                    >
                                        {deletingId === booking.id ? (
                                            <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                                        ) : (
                                            <Trash2 className="w-3.5 h-3.5" />
                                        )}
                                    </button>
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-8 shadow-sm text-center`}
                        >
                            <div className={`w-16 h-16 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                                <Camera className={`w-8 h-8 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} />
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                No Bookings Found
                            </h3>
                            <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                {filters.search || quickFilter !== 'all'
                                    ? 'Try adjusting your filters or search terms.'
                                    : 'There are no bookings for Mother\'s Canon R50 yet.'}
                            </p>
                            <Link href="/admin/bookings/add">
                                <button className="px-6 py-2.5 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors active:scale-95">
                                    Create First Booking
                                </button>
                            </Link>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
