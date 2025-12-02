'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Booking } from '@/lib/supabase';
import Link from 'next/link';
import { motion } from 'framer-motion';
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
    ArrowLeft,
    Heart,
    ChevronLeft
} from 'lucide-react';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';

export default function MobileMotherApprovalsPage() {
    const [pendingBookings, setPendingBookings] = useState<Booking[]>([]);
    const [motherCamera, setMotherCamera] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [processingBooking, setProcessingBooking] = useState<string | null>(null);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(darkMode);
        loadMotherCamera();
    }, []);

    useEffect(() => {
        if (motherCamera) {
            loadPendingBookings();
        }
    }, [motherCamera]);

    const loadMotherCamera = async () => {
        try {
            const { data: camera, error } = await supabase
                .from('cameras')
                .select('*')
                .eq('name', 'Canon R50 - Mother')
                .single();

            if (error) {
                console.error('Error loading Mother camera:', error);
            } else {
                setMotherCamera(camera);
            }
        } catch (error) {
            console.error('Error in loadMotherCamera:', error);
        }
    };

    const loadPendingBookings = async () => {
        if (!motherCamera) return;

        setIsLoading(true);
        try {
            const { data: bookings, error } = await supabase
                .from('bookings')
                .select(`
          *,
          customer:customers(*)
        `)
                .eq('booking_status', 'pending_approval')
                .eq('camera_id', motherCamera.id)
                .order('created_at', { ascending: true });

            if (error) {
                console.error('Error loading pending bookings:', error);
            } else {
                setPendingBookings(bookings || []);
            }
        } catch (error) {
            console.error('Error in loadPendingBookings:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleApproveBooking = async (bookingId: string, notes?: string) => {
        setProcessingBooking(bookingId);
        try {
            const response = await fetch(`/api/bookings/${bookingId}/approve`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ admin_notes: notes }),
            });

            const result = await response.json();

            if (result.success) {
                alert('Booking approved successfully!');
                loadPendingBookings();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error approving booking:', error);
            alert('Failed to approve booking');
        } finally {
            setProcessingBooking(null);
        }
    };

    const handleRejectBooking = async (bookingId: string, reason: string, notes?: string) => {
        setProcessingBooking(bookingId);
        try {
            const response = await fetch(`/api/bookings/${bookingId}/reject`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    rejection_reason: reason,
                    admin_notes: notes
                }),
            });

            const result = await response.json();

            if (result.success) {
                alert('Booking rejected successfully!');
                loadPendingBookings();
            } else {
                alert(`Error: ${result.error}`);
            }
        } catch (error) {
            console.error('Error rejecting booking:', error);
            alert('Failed to reject booking');
        } finally {
            setProcessingBooking(null);
        }
    };

    const quickApprove = (bookingId: string) => {
        if (confirm('Are you sure you want to approve this booking?')) {
            handleApproveBooking(bookingId, 'Quick approval from Mother mobile dashboard');
        }
    };

    const quickReject = (bookingId: string) => {
        const reason = prompt('Please enter rejection reason:');
        if (reason) {
            handleRejectBooking(bookingId, reason, 'Quick rejection from Mother mobile dashboard');
        }
    };

    const sendWhatsAppMessage = (booking: Booking) => {
        if (!booking.customer?.phone) return;

        const phone = formatPhoneWithCountryCode(booking.customer.phone);
        const message = `Hi ${booking.customer.full_name}, your booking for Canon R50 - Mother from ${new Date(booking.start_date).toLocaleDateString('en-MY')} to ${new Date(booking.end_date).toLocaleDateString('en-MY')} is pending approval. We'll get back to you soon!`;
        const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
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
                    className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-5 text-white shadow-lg"
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
                                <h1 className="text-xl font-bold">Pending Approvals</h1>
                            </div>
                            <p className="text-orange-100 text-sm">
                                Review Mother's Canon R50 bookings
                            </p>
                        </div>
                        <button
                            onClick={loadPendingBookings}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors active:scale-95"
                        >
                            <RefreshCw className="w-5 h-5" />
                        </button>
                    </div>
                </motion.div>

                {/* Stats */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`${isDarkMode ? 'bg-orange-900/20 border-orange-800' : 'bg-orange-50 border-orange-200'} border rounded-xl p-4 shadow-sm`}
                >
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-orange-500 flex items-center justify-center">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <p className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{pendingBookings.length}</p>
                            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                                {pendingBookings.length === 1 ? 'Booking' : 'Bookings'} Awaiting Approval
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Pending Bookings List */}
                <div className="space-y-3">
                    {pendingBookings.length > 0 ? (
                        pendingBookings.map((booking, index) => (
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
                                        <div className="w-12 h-12 bg-pink-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <span className="text-white text-lg font-bold">
                                                {booking.customer?.full_name?.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="min-w-0">
                                            <h4 className={`text-base font-bold truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {booking.customer?.full_name}
                                            </h4>
                                            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>#{booking.id.slice(0, 8)}</p>
                                        </div>
                                    </div>
                                    <span className="inline-flex px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-bold flex-shrink-0">
                                        Pending
                                    </span>
                                </div>

                                {/* Booking Details */}
                                <div className="space-y-2 mb-3">
                                    <div className="flex items-center gap-2">
                                        <Phone className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Phone</p>
                                            <p className={`text-sm font-medium truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {booking.customer?.phone}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Calendar className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Rental Period</p>
                                            <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                                {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })} - {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric' })}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <DollarSign className={`w-4 h-4 flex-shrink-0 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} />
                                        <div className="min-w-0 flex-1">
                                            <p className={`text-xs ${isDarkMode ? 'text-slate-600' : 'text-slate-500'}`}>Total Amount</p>
                                            <p className="text-sm font-bold text-pink-600">
                                                RM{booking.total_amount}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Notes */}
                                {booking.notes && (
                                    <div className={`mb-3 p-2.5 ${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-slate-50 border-slate-200'} rounded-lg border`}>
                                        <p className={`text-xs font-semibold uppercase mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                            Customer Notes
                                        </p>
                                        <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{booking.notes}</p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="grid grid-cols-2 gap-2">
                                    <Link href={`/admin/bookings/${booking.id}`}>
                                        <button className={`w-full py-2.5 px-3 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} rounded-lg font-semibold text-sm transition-colors active:scale-95 flex items-center justify-center gap-2`}>
                                            <Eye className="w-4 h-4" />
                                            View
                                        </button>
                                    </Link>

                                    <button
                                        onClick={() => sendWhatsAppMessage(booking)}
                                        className={`w-full py-2.5 px-3 ${isDarkMode ? 'bg-green-900/30 hover:bg-green-900/40 text-green-400' : 'bg-green-50 hover:bg-green-100 text-green-600'} rounded-lg font-semibold text-sm transition-colors active:scale-95 flex items-center justify-center gap-2`}
                                    >
                                        <MessageCircle className="w-4 h-4" />
                                        WhatsApp
                                    </button>

                                    <button
                                        onClick={() => quickReject(booking.id)}
                                        disabled={processingBooking === booking.id}
                                        className={`w-full py-2.5 px-3 ${isDarkMode ? 'bg-red-900/30 hover:bg-red-900/40 text-red-400' : 'bg-red-50 hover:bg-red-100 text-red-600'} rounded-lg font-semibold text-sm transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50`}
                                    >
                                        <XCircle className="w-4 h-4" />
                                        Reject
                                    </button>

                                    <button
                                        onClick={() => quickApprove(booking.id)}
                                        disabled={processingBooking === booking.id}
                                        className="w-full py-2.5 px-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold text-sm transition-colors active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
                                    >
                                        {processingBooking === booking.id ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 animate-spin" />
                                                Processing
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-4 h-4" />
                                                Approve
                                            </>
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
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-8 h-8 text-green-600" />
                            </div>
                            <h3 className={`text-lg font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                All Caught Up!
                            </h3>
                            <p className={`text-sm mb-6 ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                                No pending approvals for Mother's Canon R50 at the moment.
                            </p>
                            <div className="flex flex-col gap-2">
                                <Link href="/admin/mobile/mother">
                                    <button className={`w-full py-2.5 px-4 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-slate-100 hover:bg-slate-200 text-slate-900'} rounded-lg font-semibold transition-colors active:scale-95`}>
                                        Back to Dashboard
                                    </button>
                                </Link>
                                <Link href="/admin/mobile/mother/bookings">
                                    <button className="w-full py-2.5 px-4 bg-pink-500 hover:bg-pink-600 text-white rounded-lg font-semibold transition-colors active:scale-95">
                                        View All Bookings
                                    </button>
                                </Link>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>
        </div>
    );
}
