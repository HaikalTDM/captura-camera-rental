'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Clock,
    CheckCircle,
    XCircle,
    Eye,
    MessageCircle,
    Calendar,
    Camera,
    DollarSign,
    Phone,
    RefreshCw,
    BookOpen,
    ChevronRight,
    User
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';

interface MobileApprovalsProps {
    pendingBookings: any[];
    cameras: any[];
    isLoading: boolean;
    processingBooking: string | null;
    onRefresh: () => void;
    onApprove: (bookingId: string) => void;
    onReject: (bookingId: string) => void;
    getCameraInfo: (cameraId: string) => { name: string; brand: string; model: string };
}

export default function MobileApprovals({
    pendingBookings,
    cameras,
    isLoading,
    processingBooking,
    onRefresh,
    onApprove,
    onReject,
    getCameraInfo
}: MobileApprovalsProps) {
    const [expandedBooking, setExpandedBooking] = useState<string | null>(null);

    const formatDateRange = (startStr: string, endStr: string) => {
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-amber-500"></div>
                    <p className="text-sm text-slate-600">Loading approvals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="pb-20 p-4">
            {/* Compact Header - Pill Style */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-4 rounded-2xl shadow-lg"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center">
                            <Clock className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Approvals</h1>
                            <p className="text-xs text-slate-400">
                                {pendingBookings.length} pending
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onRefresh}
                        className="w-9 h-9 bg-white/10 rounded-xl flex items-center justify-center active:scale-95 transition-transform"
                    >
                        <RefreshCw className="w-4 h-4 text-white" />
                    </button>
                </div>
            </motion.div>

            {/* Content */}
            <div className="mt-4">
                {pendingBookings.length === 0 ? (
                    /* Empty State - Compact */
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-center py-12"
                    >
                        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                        <h2 className="text-lg font-bold text-slate-900 mb-1">All clear!</h2>
                        <p className="text-sm text-slate-500 mb-6">No pending approvals 🎉</p>

                        {/* Quick Links */}
                        <div className="space-y-2 max-w-xs mx-auto">
                            <Link href="/admin/bookings">
                                <div className="flex items-center justify-between p-3 bg-white rounded-xl border border-slate-200 active:scale-[0.98] transition-transform">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center">
                                            <BookOpen className="w-4 h-4 text-slate-600" />
                                        </div>
                                        <span className="text-sm font-medium text-slate-900">View All Bookings</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-slate-400" />
                                </div>
                            </Link>
                            <Link href="/admin/setup-pickup-scheduling">
                                <div className="flex items-center justify-between p-3 bg-green-50 rounded-xl border border-green-200 active:scale-[0.98] transition-transform">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-green-100 rounded-lg flex items-center justify-center">
                                            <Calendar className="w-4 h-4 text-green-600" />
                                        </div>
                                        <span className="text-sm font-medium text-green-900">Setup Pickup Scheduling</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-green-500" />
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    /* Pending Bookings List */
                    <div className="space-y-3">
                        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-amber-500" />
                            Awaiting Your Review
                        </h3>

                        <AnimatePresence mode="popLayout">
                            {pendingBookings.map((booking, index) => {
                                const cameraInfo = getCameraInfo(booking.camera_id);
                                const isExpanded = expandedBooking === booking.id;
                                const isProcessing = processingBooking === booking.id;

                                return (
                                    <motion.div
                                        key={booking.id}
                                        layout
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, x: -100 }}
                                        transition={{ delay: index * 0.05 }}
                                    >
                                        <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50 overflow-hidden">
                                            <CardContent className="p-0">
                                                {/* Card Header - Tappable */}
                                                <button
                                                    onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                                                    className="w-full p-4 text-left"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center flex-shrink-0">
                                                                <span className="text-white font-bold">
                                                                    {booking.customer?.full_name?.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="font-semibold text-slate-900 text-sm truncate">
                                                                    {booking.customer?.full_name}
                                                                </h4>
                                                                <p className="text-xs text-slate-600 truncate">
                                                                    {cameraInfo.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="font-bold text-green-600">RM{booking.total_amount}</p>
                                                            <p className="text-xs text-slate-500">
                                                                {formatDateRange(booking.start_date, booking.end_date)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </button>

                                                {/* Expanded Details */}
                                                <AnimatePresence>
                                                    {isExpanded && (
                                                        <motion.div
                                                            initial={{ height: 0, opacity: 0 }}
                                                            animate={{ height: 'auto', opacity: 1 }}
                                                            exit={{ height: 0, opacity: 0 }}
                                                            className="overflow-hidden"
                                                        >
                                                            <div className="px-4 pb-4 space-y-3">
                                                                {/* Info Row */}
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                                                                        <div className="flex items-center gap-2">
                                                                            <Phone className="w-3 h-3 text-slate-400" />
                                                                            <span className="text-xs text-slate-600">
                                                                                {booking.customer?.phone}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="bg-white rounded-lg p-2.5 border border-slate-200">
                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar className="w-3 h-3 text-slate-400" />
                                                                            <span className="text-xs text-slate-600">
                                                                                {new Date(booking.created_at).toLocaleDateString('en-MY', {
                                                                                    month: 'short',
                                                                                    day: 'numeric'
                                                                                })}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                {/* Notes */}
                                                                {booking.notes && (
                                                                    <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
                                                                        <p className="text-xs text-blue-800">📝 {booking.notes}</p>
                                                                    </div>
                                                                )}

                                                                {/* Action Buttons */}
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => onApprove(booking.id)}
                                                                        disabled={isProcessing}
                                                                        className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all"
                                                                    >
                                                                        {isProcessing ? (
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                                        ) : (
                                                                            <>
                                                                                <CheckCircle className="w-4 h-4" />
                                                                                Approve
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => onReject(booking.id)}
                                                                        disabled={isProcessing}
                                                                        className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white py-3 rounded-xl font-semibold text-sm active:scale-95 transition-all"
                                                                    >
                                                                        {isProcessing ? (
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                                        ) : (
                                                                            <>
                                                                                <XCircle className="w-4 h-4" />
                                                                                Reject
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>

                                                                {/* Secondary Actions */}
                                                                <div className="flex gap-2">
                                                                    <Link
                                                                        href={`/admin/bookings/${booking.id}`}
                                                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-100 text-slate-700 py-2.5 rounded-xl font-medium text-sm active:scale-95 transition-all"
                                                                    >
                                                                        <Eye className="w-4 h-4" />
                                                                        Details
                                                                    </Link>
                                                                    {booking.customer?.phone && (
                                                                        <a
                                                                            href={`https://wa.me/${formatPhoneWithCountryCode(booking.customer.phone)}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-700 py-2.5 rounded-xl font-medium text-sm active:scale-95 transition-all"
                                                                        >
                                                                            <MessageCircle className="w-4 h-4" />
                                                                            WhatsApp
                                                                        </a>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    );
}
