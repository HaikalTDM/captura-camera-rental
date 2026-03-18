'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Search,
    User,
    ChevronRight,
    ArrowLeft,
    Download,
    Printer,
    Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

type AgreementBookingBase = {
        id: string;
        booking_status?: string;
        customer?: {
            full_name?: string;
            email?: string;
            phone?: string;
        };
        camera?: {
            name?: string;
        };
    };

interface MobileRentalAgreementsProps<TBooking extends AgreementBookingBase> {
    bookings: TBooking[];
    selectedBooking: TBooking | null;
    loading: boolean;
    exporting: boolean;
    searchTerm: string;
    statusFilter: string;
    onSearchChange: (term: string) => void;
    onStatusFilterChange: (status: string) => void;
    onSelectBooking: (booking: TBooking) => void;
    onClearSelection: () => void;
    onExportPDF: (booking: TBooking) => void;
    onPrint: () => void;
    agreementRef: React.RefObject<HTMLDivElement>;
    AgreementTemplate: React.ComponentType<{
        booking: TBooking;
        customer: TBooking['customer'];
        camera: TBooking['camera'];
        confirmationNumber: string;
    }>;
}

export default function MobileRentalAgreements<TBooking extends AgreementBookingBase>({
    bookings,
    selectedBooking,
    loading,
    exporting,
    searchTerm,
    statusFilter,
    onSearchChange,
    onStatusFilterChange,
    onSelectBooking,
    onClearSelection,
    onExportPDF,
    onPrint,
    agreementRef,
    AgreementTemplate
}: MobileRentalAgreementsProps<TBooking>) {
    const [showFilters, setShowFilters] = useState(false);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending_approval: 'border-[#5a4328] bg-[#332316] text-orange-200',
            confirmed: 'border-[#3f352d] bg-[#221d18] text-stone-300',
            completed: 'border-[#5a4328] bg-[#332316] text-orange-200',
            cancelled: 'border-[#4a2d2d] bg-[#1e1515] text-rose-200',
            rejected: 'border-[#332b25] bg-[#1f1a16] text-stone-300'
        };
        return colors[status] || 'border-[#332b25] bg-[#1f1a16] text-stone-300';
    };

    const filteredBookings = bookings.filter((booking) => {
        const matchesSearch =
            booking.customer?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            booking.customer?.phone?.includes(searchTerm) ||
            booking.id?.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesStatus = statusFilter === 'all' || booking.booking_status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#2c2722] border-t-[#c96b2c]"></div>
                    <p className="text-sm text-stone-400">Loading agreements...</p>
                </div>
            </div>
        );
    }

    // Agreement View
    if (selectedBooking) {
        return (
            <div className="p-4 pb-24">
                {/* Back Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onClearSelection}
                        className="flex items-center gap-2 text-stone-300"
                    >
                        <ArrowLeft className="h-5 w-5" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onPrint}
                            className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#332b25] bg-[#1f1a16] active:scale-95"
                        >
                            <Printer className="h-5 w-5 text-stone-300" />
                        </button>
                        <button
                            onClick={() => onExportPDF(selectedBooking)}
                            disabled={exporting}
                            className="flex items-center gap-2 rounded-xl bg-[#c96b2c] px-4 py-2 text-sm font-semibold text-stone-950 active:scale-95 disabled:opacity-50"
                        >
                            {exporting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                                <Download className="h-4 w-4" />
                            )}
                            PDF
                        </button>
                    </div>
                </div>

                {/* Agreement */}
                <div ref={agreementRef} className="overflow-hidden rounded-xl border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                    <AgreementTemplate
                        booking={selectedBooking}
                        customer={selectedBooking.customer}
                        camera={selectedBooking.camera}
                        confirmationNumber={selectedBooking.id.substring(0, 8).toUpperCase()}
                    />
                </div>
            </div>
        );
    }

    // List View
    return (
        <div className="p-4 pb-24">
            {/* Header - Pill Style */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-2xl border border-[#332b25] bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.18),_transparent_45%),linear-gradient(135deg,#1b1714_0%,#171411_60%,#141210_100%)] px-4 py-4 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5a4328] bg-[#332316]">
                            <FileText className="h-5 w-5 text-orange-300" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-stone-100">Agreements</h1>
                            <p className="text-xs text-stone-400">{filteredBookings.length} bookings</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`flex h-9 w-9 items-center justify-center rounded-xl border transition-colors ${showFilters ? 'border-[#5a4328] bg-[#332316]' : 'border-[#332b25] bg-[#1f1a16]'
                            }`}
                    >
                        <Filter className="h-4 w-4 text-stone-300" />
                    </button>
                </div>
            </motion.div>

            {/* Search & Filters */}
            <AnimatePresence>
                {showFilters && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <Card className="mb-4 border border-[#2c2722] bg-[#171411]">
                            <CardContent className="p-3 space-y-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                                    <input
                                        type="text"
                                        placeholder="Search name, email, phone..."
                                        value={searchTerm}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        className="w-full rounded-xl border border-[#332b25] bg-[#1b1714] py-2.5 pl-10 pr-4 text-sm text-stone-100 placeholder:text-stone-500 focus:border-[#c96b2c] focus:outline-none"
                                    />
                                </div>

                                {/* Status Pills */}
                                <div className="flex flex-wrap gap-2">
                                    {['all', 'confirmed', 'completed', 'pending_approval'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => onStatusFilterChange(status)}
                                            className={`rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors ${statusFilter === status
                                                    ? 'border-[#5a4328] bg-[#332316] text-orange-200'
                                                    : 'border-[#332b25] bg-[#1f1a16] text-stone-400'
                                                }`}
                                        >
                                            {status === 'all' ? 'All' : status.replace('_', ' ').charAt(0).toUpperCase() + status.replace('_', ' ').slice(1)}
                                        </button>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Quick Search (always visible) */}
            {!showFilters && (
                <div className="relative mb-4">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                    <input
                        type="text"
                        placeholder="Search customer..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full rounded-xl border border-[#332b25] bg-[#1b1714] py-2.5 pl-10 pr-4 text-sm text-stone-100 placeholder:text-stone-500 focus:border-[#c96b2c] focus:outline-none"
                    />
                </div>
            )}

            {/* Bookings List */}
            <div className="space-y-2">
                {filteredBookings.length === 0 ? (
                    <Card className="border border-[#2c2722] bg-[#171411]">
                        <CardContent className="p-8 text-center">
                            <FileText className="mx-auto mb-3 h-10 w-10 text-stone-600" />
                            <p className="text-sm text-stone-500">No bookings found</p>
                        </CardContent>
                    </Card>
                ) : (
                    filteredBookings.map((booking, index) => (
                        <motion.div
                            key={booking.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.03, 0.3) }}
                        >
                            <button
                                onClick={() => onSelectBooking(booking)}
                                className="w-full text-left"
                            >
                                <Card className="border border-[#2c2722] bg-[#171411] transition-transform active:scale-[0.98]">
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl border border-[#332b25] bg-[#1f1a16]">
                                                    <User className="h-5 w-5 text-stone-400" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="truncate text-sm font-semibold text-stone-100">
                                                        {booking.customer?.full_name}
                                                    </h4>
                                                    <p className="truncate text-xs text-stone-500">
                                                        {booking.camera?.name || 'Camera'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`rounded-lg border px-2 py-1 text-[10px] font-medium ${getStatusColor(booking.booking_status)}`}>
                                                    {booking.booking_status?.replace('_', ' ').toUpperCase()}
                                                </span>
                                                <ChevronRight className="h-4 w-4 text-stone-500" />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </button>
                        </motion.div>
                    ))
                )}
            </div>
        </div>
    );
}
