'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getAllBookings } from '@/lib/api/bookings';
import type { Booking } from '@/lib/supabase';
import Link from 'next/link';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
    ArrowLeft,
    Heart,
    User,
    Camera,
    Calendar,
    DollarSign,
    Phone,
    MapPin,
    Clock,
    CheckCircle2,
    XCircle,
    AlertCircle,
    Package,
    MessageCircle,
    ChevronLeft,
    Mail,
    Edit,
    Trash2
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function MobileMotherBookingDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const bookingId = params.id as string;

    const [booking, setBooking] = useState<Booking | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdatingPayment, setIsUpdatingPayment] = useState(false);
    const [isUpdatingPickup, setIsUpdatingPickup] = useState(false);
    const [isUpdatingReturn, setIsUpdatingReturn] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    useEffect(() => {
        const darkMode = localStorage.getItem('darkMode') === 'true';
        setIsDarkMode(darkMode);
        loadBookingData();
    }, [bookingId]);

    const loadBookingData = async () => {
        setIsLoading(true);
        try {
            const bookings = await getAllBookings();
            const foundBooking = bookings.find(b => b.id === bookingId);

            // Verify this is a Mother's booking
            if (foundBooking && foundBooking.camera?.name === 'Canon R50 - Mother') {
                setBooking(foundBooking);
            } else {
                // Not a Mother's booking, redirect
                router.push('/admin/mobile/mother/bookings');
            }
        } catch (error) {
            console.error('Error loading booking data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig: Record<string, { label: string; className: string; icon: any }> = {
            pending_approval: { label: 'Pending', className: 'bg-orange-100 text-orange-800', icon: AlertCircle },
            confirmed: { label: 'Confirmed', className: 'bg-blue-100 text-blue-800', icon: CheckCircle2 },
            approved: { label: 'Approved', className: 'bg-green-100 text-green-800', icon: CheckCircle2 },
            completed: { label: 'Completed', className: 'bg-slate-100 text-slate-800', icon: CheckCircle2 },
            cancelled: { label: 'Cancelled', className: 'bg-red-100 text-red-800', icon: XCircle },
        };

        const config = statusConfig[status] || statusConfig.pending_approval;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${config.className}`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </span>
        );
    };

    const handleDepositPaymentUpdate = async (paid: boolean) => {
        if (!booking) return;

        setIsUpdatingPayment(true);
        try {
            const response = await fetch(`/api/bookings/${booking.id}/deposit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deposit_paid: paid,
                    deposit_paid_date: paid ? new Date().toISOString() : null
                }),
            });

            const data = await response.json();

            if (data.success) {
                setBooking(data.booking);
                toast.success(`Deposit marked as ${paid ? 'paid' : 'unpaid'}`);
            } else {
                toast.error('Failed to update deposit status');
            }
        } catch (error) {
            console.error('Error updating deposit status:', error);
            toast.error('Failed to update deposit status');
        } finally {
            setIsUpdatingPayment(false);
        }
    };

    const handleFinalPaymentUpdate = async (paid: boolean) => {
        if (!booking) return;

        setIsUpdatingPayment(true);
        try {
            const response = await fetch(`/api/bookings/${booking.id}/final-payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    final_payment_paid: paid,
                    final_payment_paid_date: paid ? new Date().toISOString() : null
                }),
            });

            const data = await response.json();

            if (data.success) {
                setBooking(data.booking);
                toast.success(`Final payment marked as ${paid ? 'paid' : 'unpaid'}`);
            } else {
                toast.error('Failed to update final payment status');
            }
        } catch (error) {
            console.error('Error updating final payment status:', error);
            toast.error('Failed to update final payment status');
        } finally {
            setIsUpdatingPayment(false);
        }
    };

    const handleDepositRefundUpdate = async (refunded: boolean) => {
        if (!booking) return;

        setIsUpdatingPayment(true);
        try {
            const response = await fetch(`/api/bookings/${booking.id}/deposit-refund`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    deposit_refunded: refunded,
                    deposit_refund_date: refunded ? new Date().toISOString() : null,
                    deposit_refund_notes: refunded ? 'Equipment returned in good condition' : null,
                    deposit_refund_amount: 100
                }),
            });

            const data = await response.json();

            if (data.success) {
                setBooking(data.booking);
                toast.success(data.message || `Deposit ${refunded ? 'refunded' : 'refund cancelled'}`);
                await loadBookingData();
            } else {
                toast.error('Failed to update deposit refund status');
            }
        } catch (error) {
            console.error('Error updating deposit refund status:', error);
            toast.error('Failed to update deposit refund status');
        } finally {
            setIsUpdatingPayment(false);
        }
    };

    const handlePickupStatusUpdate = async (pickedUp: boolean) => {
        if (!booking) return;

        setIsUpdatingPickup(true);
        try {
            const response = await fetch(`/api/bookings/${booking.id}/pickup-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    equipment_picked_up: pickedUp,
                    equipment_pickup_notes: null,
                    equipment_condition_pickup: null
                }),
            });

            const data = await response.json();

            if (data.success) {
                setBooking(data.booking);
                toast.success(`Equipment marked as ${pickedUp ? 'picked up' : 'not picked up'}`);
            } else {
                toast.error('Failed to update pickup status');
            }
        } catch (error) {
            console.error('Error updating pickup status:', error);
            toast.error('Failed to update pickup status');
        } finally {
            setIsUpdatingPickup(false);
        }
    };

    const handleReturnStatusUpdate = async (returned: boolean) => {
        if (!booking) return;

        setIsUpdatingReturn(true);
        try {
            const response = await fetch(`/api/bookings/${booking.id}/return-status`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    equipment_returned: returned,
                    equipment_return_notes: null,
                    equipment_condition_return: null
                }),
            });

            const data = await response.json();

            if (data.success) {
                setBooking(data.booking);
                toast.success(`Equipment marked as ${returned ? 'returned' : 'not returned'}`);
            } else {
                toast.error('Failed to update return status');
            }
        } catch (error) {
            console.error('Error updating return status:', error);
            toast.error('Failed to update return status');
        } finally {
            setIsUpdatingReturn(false);
        }
    };

    if (isLoading) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} flex items-center justify-center`}>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600"></div>
            </div>
        );
    }

    if (!booking) {
        return (
            <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} p-4`}>
                <div className={`max-w-2xl mx-auto ${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-6 text-center`}>
                    <h2 className={`text-xl font-bold mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Booking Not Found</h2>
                    <Link href="/admin/mobile/mother/bookings">
                        <button className="px-4 py-2 bg-pink-500 text-white rounded-lg font-semibold mt-4">
                            Back to Bookings
                        </button>
                    </Link>
                </div>
            </div>
        );
    }

    const customerPhone = booking.customer?.phone || '';
    const whatsappPhone = formatPhoneWithCountryCode(customerPhone);
    const whatsappMessage = `Hi ${booking.customer?.full_name || 'there'}! This is regarding your Canon R50 booking (${booking.id.slice(0, 8)}).`;
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`;

    return (
        <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} pb-24`}>
            <div className="px-4 pt-4 space-y-4">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl p-5 text-white shadow-lg"
                >
                    <Link href="/admin/mobile/mother/bookings">
                        <button className="flex items-center gap-1 text-white/90 hover:text-white mb-3 active:scale-95 transition-transform">
                            <ChevronLeft className="w-5 h-5" />
                            <span className="text-sm font-semibold">Back</span>
                        </button>
                    </Link>

                    <div className="flex items-center justify-between mb-2">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <Heart className="w-5 h-5" />
                                <h1 className="text-lg font-bold">Booking Details</h1>
                            </div>
                            <p className="text-pink-100 text-xs font-mono">
                                #{booking.id.slice(0, 8)}
                            </p>
                        </div>
                        {getStatusBadge(booking.booking_status)}
                    </div>
                </motion.div>

                {/* Customer Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 shadow-sm`}
                >
                    <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <User className="w-4 h-4 text-pink-500" />
                        Customer
                    </h3>

                    <div className="space-y-3">
                        <div className="flex items-start justify-between">
                            <div>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Full Name</p>
                                <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {booking.customer?.full_name || 'N/A'}
                                </p>
                            </div>
                            <div className="w-10 h-10 bg-gradient-to-br from-pink-400 to-rose-500 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
                                {booking.customer?.full_name?.charAt(0).toUpperCase()}
                            </div>
                        </div>

                        <div className={`h-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Phone</p>
                                <div className="flex items-center gap-2">
                                    <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                        {customerPhone || 'N/A'}
                                    </p>
                                    {customerPhone && (
                                        <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                                            <button className="p-1 bg-green-100 text-green-600 rounded-full hover:bg-green-200 transition-colors">
                                                <MessageCircle className="w-3 h-3" />
                                            </button>
                                        </a>
                                    )}
                                </div>
                            </div>
                            <div>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Email</p>
                                <p className={`font-medium text-sm truncate ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {booking.customer?.email || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {booking.customer?.address && (
                            <div>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Address</p>
                                <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {booking.customer.address}
                                </p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Booking Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 shadow-sm`}
                >
                    <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <Calendar className="w-4 h-4 text-pink-500" />
                        Booking Details
                    </h3>

                    <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Start Date</p>
                                <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {new Date(booking.start_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                            <div>
                                <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>End Date</p>
                                <p className={`font-semibold text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {new Date(booking.end_date).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div>
                            <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Camera</p>
                            <div className="flex items-center gap-2">
                                <Camera className="w-3.5 h-3.5 text-slate-400" />
                                <p className={`font-medium text-sm ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                                    {booking.camera?.name || 'N/A'}
                                </p>
                            </div>
                        </div>

                        {booking.notes && (
                            <div className={`p-3 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-lg`}>
                                <p className={`text-xs font-bold uppercase mb-1 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Notes</p>
                                <p className={`text-sm ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{booking.notes}</p>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Payment Info */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 shadow-sm`}
                >
                    <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <DollarSign className="w-4 h-4 text-pink-500" />
                        Payment
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Total Amount</p>
                            <p className="text-xl font-bold text-pink-600">RM{booking.total_amount}</p>
                        </div>

                        <div className={`h-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />

                        {/* Deposit */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Deposit</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>RM{booking.deposit_amount}</p>
                                </div>
                                {booking.deposit_paid ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Paid</span>
                                ) : (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">Unpaid</span>
                                )}
                            </div>

                            {!booking.deposit_paid && (
                                <button
                                    onClick={() => handleDepositPaymentUpdate(true)}
                                    disabled={isUpdatingPayment}
                                    className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-lg transition-colors active:scale-95 disabled:opacity-50"
                                >
                                    {isUpdatingPayment ? 'Processing...' : 'Mark Deposit Paid'}
                                </button>
                            )}

                            {booking.deposit_paid && !booking.deposit_refunded && (
                                <button
                                    onClick={() => handleDepositRefundUpdate(true)}
                                    disabled={isUpdatingPayment}
                                    className={`w-full py-2 border ${isDarkMode ? 'border-pink-900 text-pink-400' : 'border-pink-200 text-pink-600'} text-xs font-bold rounded-lg transition-colors active:scale-95 disabled:opacity-50`}
                                >
                                    {isUpdatingPayment ? 'Processing...' : 'Refund Deposit'}
                                </button>
                            )}
                        </div>

                        <div className={`h-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />

                        {/* Final Payment */}
                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className={`text-sm font-medium ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Final Payment</p>
                                    <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>RM{booking.final_payment_amount}</p>
                                </div>
                                {booking.final_payment_paid ? (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">Paid</span>
                                ) : (
                                    <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full">Unpaid</span>
                                )}
                            </div>

                            {booking.deposit_paid && !booking.final_payment_paid && (
                                <button
                                    onClick={() => handleFinalPaymentUpdate(true)}
                                    disabled={isUpdatingPayment}
                                    className="w-full py-2 bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold rounded-lg transition-colors active:scale-95 disabled:opacity-50"
                                >
                                    {isUpdatingPayment ? 'Processing...' : 'Mark Final Payment Paid'}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Equipment Status */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} border rounded-xl p-4 shadow-sm`}
                >
                    <h3 className={`text-sm font-bold mb-3 flex items-center gap-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        <Package className="w-4 h-4 text-pink-500" />
                        Equipment Status
                    </h3>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Picked Up</span>
                            {booking.equipment_picked_up ? (
                                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    <CheckCircle2 className="w-3 h-3" /> Yes
                                </span>
                            ) : (
                                <button
                                    onClick={() => handlePickupStatusUpdate(true)}
                                    disabled={isUpdatingPickup}
                                    className={`px-3 py-1.5 border ${isDarkMode ? 'border-pink-900 text-pink-400' : 'border-pink-200 text-pink-600'} text-xs font-bold rounded-lg transition-colors active:scale-95 disabled:opacity-50`}
                                >
                                    {isUpdatingPickup ? '...' : 'Mark Picked Up'}
                                </button>
                            )}
                        </div>

                        <div className={`h-px ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'}`} />

                        <div className="flex items-center justify-between">
                            <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Returned</span>
                            {booking.equipment_returned ? (
                                <span className="flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                                    <CheckCircle2 className="w-3 h-3" /> Yes
                                </span>
                            ) : (
                                <button
                                    onClick={() => handleReturnStatusUpdate(true)}
                                    disabled={isUpdatingReturn}
                                    className={`px-3 py-1.5 border ${isDarkMode ? 'border-pink-900 text-pink-400' : 'border-pink-200 text-pink-600'} text-xs font-bold rounded-lg transition-colors active:scale-95 disabled:opacity-50`}
                                >
                                    {isUpdatingReturn ? '...' : 'Mark Returned'}
                                </button>
                            )}
                        </div>
                    </div>
                </motion.div>

                {/* Edit Actions */}
                <div className="grid grid-cols-2 gap-3 pt-2">
                    <Link href={`/admin/bookings/${booking.id}/edit`}>
                        <button className={`w-full py-3 ${isDarkMode ? 'bg-slate-800 hover:bg-slate-700 text-white' : 'bg-white hover:bg-slate-50 text-slate-900'} border ${isDarkMode ? 'border-slate-700' : 'border-slate-200'} rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2`}>
                            <Edit className="w-4 h-4" />
                            Edit Booking
                        </button>
                    </Link>
                    <button
                        onClick={() => {
                            if (confirm('Are you sure you want to delete this booking?')) {
                                // Delete logic would go here
                                alert('Please use the desktop admin to delete bookings.');
                            }
                        }}
                        className={`w-full py-3 ${isDarkMode ? 'bg-red-900/20 text-red-400 border-red-900/30' : 'bg-red-50 text-red-600 border-red-100'} border rounded-xl font-bold text-sm shadow-sm active:scale-95 transition-all flex items-center justify-center gap-2`}
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete
                    </button>
                </div>
            </div>
        </div>
    );
}
