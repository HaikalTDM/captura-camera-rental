'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FileText,
    Search,
    User,
    Calendar,
    Camera,
    ChevronRight,
    ArrowLeft,
    Download,
    Printer,
    Filter
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { format } from 'date-fns';

interface MobileRentalAgreementsProps {
    bookings: any[];
    selectedBooking: any | null;
    loading: boolean;
    exporting: boolean;
    searchTerm: string;
    statusFilter: string;
    onSearchChange: (term: string) => void;
    onStatusFilterChange: (status: string) => void;
    onSelectBooking: (booking: any) => void;
    onClearSelection: () => void;
    onExportPDF: (booking: any) => void;
    onPrint: () => void;
    agreementRef: React.RefObject<HTMLDivElement>;
    AgreementTemplate: React.ComponentType<any>;
}

export default function MobileRentalAgreements({
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
}: MobileRentalAgreementsProps) {
    const [showFilters, setShowFilters] = useState(false);

    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'dd MMM');
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            pending_approval: 'bg-yellow-100 text-yellow-700',
            confirmed: 'bg-green-100 text-green-700',
            completed: 'bg-blue-100 text-blue-700',
            cancelled: 'bg-red-100 text-red-700',
            rejected: 'bg-slate-100 text-slate-700'
        };
        return colors[status] || 'bg-slate-100 text-slate-700';
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
                    <div className="animate-spin rounded-full h-10 w-10 border-4 border-slate-200 border-t-blue-500"></div>
                    <p className="text-sm text-slate-600">Loading agreements...</p>
                </div>
            </div>
        );
    }

    // Agreement View
    if (selectedBooking) {
        return (
            <div className="pb-20 p-4">
                {/* Back Header */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={onClearSelection}
                        className="flex items-center gap-2 text-slate-600"
                    >
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-sm font-medium">Back</span>
                    </button>
                    <div className="flex gap-2">
                        <button
                            onClick={onPrint}
                            className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center active:scale-95"
                        >
                            <Printer className="w-5 h-5 text-slate-600" />
                        </button>
                        <button
                            onClick={() => onExportPDF(selectedBooking)}
                            disabled={exporting}
                            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl text-sm font-semibold active:scale-95 disabled:opacity-50"
                        >
                            {exporting ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            PDF
                        </button>
                    </div>
                </div>

                {/* Agreement */}
                <div ref={agreementRef} className="bg-white rounded-xl shadow-sm overflow-hidden">
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
        <div className="pb-20 p-4">
            {/* Header - Pill Style */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-4 rounded-2xl shadow-lg mb-4"
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Agreements</h1>
                            <p className="text-xs text-slate-400">{filteredBookings.length} bookings</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${showFilters ? 'bg-blue-500' : 'bg-white/10'
                            }`}
                    >
                        <Filter className="w-4 h-4 text-white" />
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
                        <Card className="border-slate-200 mb-4">
                            <CardContent className="p-3 space-y-3">
                                {/* Search */}
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Search name, email, phone..."
                                        value={searchTerm}
                                        onChange={(e) => onSearchChange(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    />
                                </div>

                                {/* Status Pills */}
                                <div className="flex flex-wrap gap-2">
                                    {['all', 'confirmed', 'completed', 'pending_approval'].map((status) => (
                                        <button
                                            key={status}
                                            onClick={() => onStatusFilterChange(status)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === status
                                                    ? 'bg-slate-900 text-white'
                                                    : 'bg-slate-100 text-slate-600'
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
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search customer..."
                        value={searchTerm}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            )}

            {/* Bookings List */}
            <div className="space-y-2">
                {filteredBookings.length === 0 ? (
                    <Card className="border-slate-200">
                        <CardContent className="p-8 text-center">
                            <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-500 text-sm">No bookings found</p>
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
                                <Card className="border-slate-200 active:scale-[0.98] transition-transform">
                                    <CardContent className="p-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-1 min-w-0">
                                                <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <User className="w-5 h-5 text-slate-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-semibold text-slate-900 text-sm truncate">
                                                        {booking.customer?.full_name}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {booking.camera?.name || 'Camera'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-medium ${getStatusColor(booking.booking_status)}`}>
                                                    {booking.booking_status?.replace('_', ' ').toUpperCase()}
                                                </span>
                                                <ChevronRight className="w-4 h-4 text-slate-400" />
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
