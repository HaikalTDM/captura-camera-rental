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
    Phone,
    RefreshCw,
    BookOpen,
    ChevronRight
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';

interface MobileApprovalsProps {
    pendingBookings: Array<{
        id: string;
        camera_id: string;
        total_amount: number;
        start_date: string;
        end_date: string;
        created_at?: string;
        notes?: string | null;
        customer?: {
            full_name?: string;
            phone?: string;
        };
    }>;
    cameras: Array<{
        id: string;
        name: string;
    }>;
    isLoading: boolean;
    processingBooking: string | null;
    onRefresh: () => void;
    onApprove: (bookingId: string) => void;
    onReject: (bookingId: string) => void;
    getCameraInfo: (cameraId: string) => { name: string; brand: string; model: string };
}

export default function MobileApprovals({
    pendingBookings,
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
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2c2722] border-t-[#c96b2c]"></div>
                    <p className="text-sm text-stone-400">Loading approvals...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-4 pb-24">
            {/* Compact Header - Pill Style */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-[#332b25] bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.18),_transparent_45%),linear-gradient(135deg,#1b1714_0%,#171411_60%,#141210_100%)] px-4 py-4 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5a4328] bg-[#332316]">
                            <Clock className="h-5 w-5 text-orange-300" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-stone-100">Approvals</h1>
                            <p className="text-xs text-stone-400">
                                {pendingBookings.length} pending
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onRefresh}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-[#332b25] bg-[#1f1a16] transition-transform active:scale-95"
                    >
                        <RefreshCw className="h-4 w-4 text-stone-300" />
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
                        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl border border-[#5a4328] bg-[#332316]">
                            <CheckCircle className="h-8 w-8 text-orange-300" />
                        </div>
                        <h2 className="mb-1 text-lg font-bold text-stone-100">All clear!</h2>
                        <p className="mb-6 text-sm text-stone-500">No pending approvals right now.</p>

                        {/* Quick Links */}
                        <div className="mx-auto max-w-xs space-y-2">
                            <Link href="/admin/bookings">
                                <div className="flex items-center justify-between rounded-xl border border-[#2c2722] bg-[#171411] p-3 transition-transform active:scale-[0.98]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#332b25] bg-[#1f1a16]">
                                            <BookOpen className="h-4 w-4 text-stone-300" />
                                        </div>
                                        <span className="text-sm font-medium text-stone-100">View All Bookings</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-stone-500" />
                                </div>
                            </Link>
                            <Link href="/admin/setup-pickup-scheduling">
                                <div className="flex items-center justify-between rounded-xl border border-[#4c3421] bg-[#231810] p-3 transition-transform active:scale-[0.98]">
                                    <div className="flex items-center gap-3">
                                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#5a4328] bg-[#332316]">
                                            <Calendar className="h-4 w-4 text-orange-300" />
                                        </div>
                                        <span className="text-sm font-medium text-stone-100">Setup Pickup Scheduling</span>
                                    </div>
                                    <ChevronRight className="h-4 w-4 text-orange-300" />
                                </div>
                            </Link>
                        </div>
                    </motion.div>
                ) : (
                    /* Pending Bookings List */
                    <div className="space-y-3">
                        <h3 className="flex items-center gap-2 text-sm font-bold text-stone-100">
                            <Clock className="h-4 w-4 text-orange-300" />
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
                                        <Card className="overflow-hidden border border-[#332b25] bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.12),_transparent_42%),linear-gradient(135deg,#1b1714_0%,#171411_70%,#141210_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                                            <CardContent className="p-0">
                                                {/* Card Header - Tappable */}
                                                <button
                                                    onClick={() => setExpandedBooking(isExpanded ? null : booking.id)}
                                                    className="w-full p-4 text-left"
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex items-center gap-3 flex-1 min-w-0 mr-3">
                                                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#5a4328] bg-[#332316]">
                                                                <span className="font-bold text-orange-200">
                                                                    {booking.customer?.full_name?.charAt(0).toUpperCase()}
                                                                </span>
                                                            </div>
                                                            <div className="min-w-0">
                                                                <h4 className="truncate text-sm font-semibold text-stone-100">
                                                                    {booking.customer?.full_name}
                                                                </h4>
                                                                <p className="truncate text-xs text-stone-500">
                                                                    {cameraInfo.name}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        <div className="text-right flex-shrink-0">
                                                            <p className="font-bold text-orange-300">RM{booking.total_amount}</p>
                                                            <p className="text-xs text-stone-500">
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
                                                            <div className="space-y-3 px-4 pb-4">
                                                                {/* Info Row */}
                                                                <div className="grid grid-cols-2 gap-2">
                                                                    <div className="rounded-lg border border-[#2c2722] bg-[#1b1714] p-2.5">
                                                                        <div className="flex items-center gap-2">
                                                                            <Phone className="h-3 w-3 text-stone-500" />
                                                                            <span className="text-xs text-stone-400">
                                                                                {booking.customer?.phone}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    <div className="rounded-lg border border-[#2c2722] bg-[#1b1714] p-2.5">
                                                                        <div className="flex items-center gap-2">
                                                                            <Calendar className="h-3 w-3 text-stone-500" />
                                                                            <span className="text-xs text-stone-400">
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
                                                                    <div className="rounded-lg border border-[#332b25] bg-[#1f1a16] p-3">
                                                                        <p className="text-xs text-stone-300">{booking.notes}</p>
                                                                    </div>
                                                                )}

                                                                {/* Action Buttons */}
                                                                <div className="flex gap-2">
                                                                    <button
                                                                        onClick={() => onApprove(booking.id)}
                                                                        disabled={isProcessing}
                                                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#c96b2c] py-3 text-sm font-semibold text-stone-950 transition-all active:scale-95 disabled:opacity-50"
                                                                    >
                                                                        {isProcessing ? (
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                                        ) : (
                                                                            <>
                                                                                <CheckCircle className="h-4 w-4" />
                                                                                Approve
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                    <button
                                                                        onClick={() => onReject(booking.id)}
                                                                        disabled={isProcessing}
                                                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#4a2d2d] bg-[#1e1515] py-3 text-sm font-semibold text-rose-200 transition-all active:scale-95 disabled:opacity-50"
                                                                    >
                                                                        {isProcessing ? (
                                                                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                                                                        ) : (
                                                                            <>
                                                                                <XCircle className="h-4 w-4" />
                                                                                Reject
                                                                            </>
                                                                        )}
                                                                    </button>
                                                                </div>

                                                                {/* Secondary Actions */}
                                                                <div className="flex gap-2">
                                                                    <Link
                                                                        href={`/admin/bookings/${booking.id}`}
                                                                        className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#332b25] bg-[#1f1a16] py-2.5 text-sm font-medium text-stone-200 transition-all active:scale-95"
                                                                    >
                                                                        <Eye className="h-4 w-4" />
                                                                        Details
                                                                    </Link>
                                                                    {booking.customer?.phone && (
                                                                        <a
                                                                            href={`https://wa.me/${formatPhoneWithCountryCode(booking.customer.phone)}`}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#5a4328] bg-[#332316] py-2.5 text-sm font-medium text-orange-200 transition-all active:scale-95"
                                                                        >
                                                                            <MessageCircle className="h-4 w-4" />
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
