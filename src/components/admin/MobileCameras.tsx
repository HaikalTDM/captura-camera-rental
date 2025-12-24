'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    CheckCircle,
    Wrench,
    Calendar,
    Eye,
    Edit,
    TrendingUp,
    Plus,
    ChevronDown,
    DollarSign
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MobileCamerasProps {
    cameras: any[];
    bookings: any[];
    statusCounts: {
        available: number;
        rented: number;
        maintenance: number;
        reserved: number;
    };
    cameraMetrics: Map<string, { totalRentals: number; totalRevenue: number; lastBooking: number | null }>;
    getCameraRentalInfo: (cameraId: string) => any;
}

export default function MobileCameras({
    cameras,
    bookings,
    statusCounts,
    cameraMetrics,
    getCameraRentalInfo
}: MobileCamerasProps) {
    const [expandedCamera, setExpandedCamera] = useState<string | null>(null);

    const getStatusColor = (isAvailable: boolean, availableQuantity: number) => {
        if (!isAvailable) return 'bg-red-100 text-red-700';
        if (availableQuantity === 0) return 'bg-blue-100 text-blue-700';
        return 'bg-green-100 text-green-700';
    };

    const getStatusText = (isAvailable: boolean, availableQuantity: number, totalQuantity: number) => {
        if (!isAvailable) return 'Unavailable';
        if (availableQuantity === 0) return 'Rented';
        if (availableQuantity < totalQuantity) return `${availableQuantity}/${totalQuantity}`;
        return 'Available';
    };

    return (
        <div className="pb-20 p-4">
            {/* Header - Pill Style */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-4 py-4 rounded-2xl shadow-lg mb-4"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-purple-500 rounded-xl flex items-center justify-center">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white">Cameras</h1>
                            <p className="text-xs text-slate-400">{cameras.length} total</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/mobile/cameras"
                        className="flex items-center gap-1.5 bg-purple-500 text-white px-3 py-2 rounded-xl text-sm font-semibold active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        Add
                    </Link>
                </div>

                {/* Quick Stats Row */}
                <div className="flex gap-2">
                    <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
                        <p className="text-lg font-bold text-green-400">{statusCounts.available}</p>
                        <p className="text-[10px] text-slate-400">Available</p>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
                        <p className="text-lg font-bold text-blue-400">{statusCounts.rented}</p>
                        <p className="text-[10px] text-slate-400">Rented</p>
                    </div>
                    <div className="flex-1 bg-white/10 rounded-xl px-3 py-2 text-center">
                        <p className="text-lg font-bold text-amber-400">{statusCounts.maintenance}</p>
                        <p className="text-[10px] text-slate-400">Maintenance</p>
                    </div>
                </div>
            </motion.div>

            {/* Cameras List */}
            <div className="space-y-3">
                {cameras.map((camera, index) => {
                    const metrics = cameraMetrics.get(camera.id) || { totalRentals: 0, totalRevenue: 0, lastBooking: null };
                    const isExpanded = expandedCamera === camera.id;
                    const rentalInfo = getCameraRentalInfo(camera.id);

                    return (
                        <motion.div
                            key={camera.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: Math.min(index * 0.05, 0.3) }}
                        >
                            <Card className="border-slate-200 overflow-hidden">
                                <CardContent className="p-0">
                                    {/* Card Header - Tappable */}
                                    <button
                                        onClick={() => setExpandedCamera(isExpanded ? null : camera.id)}
                                        className="w-full p-4 text-left"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center flex-shrink-0">
                                                    <Camera className="w-6 h-6 text-slate-600" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="font-bold text-slate-900 text-sm truncate">
                                                        {camera.name}
                                                    </h4>
                                                    <p className="text-xs text-slate-500 truncate">
                                                        {camera.model}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-semibold ${getStatusColor(camera.is_available, camera.available_quantity)}`}>
                                                    {getStatusText(camera.is_available, camera.available_quantity, camera.total_quantity)}
                                                </span>
                                                <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>

                                        {/* Quick Info Row */}
                                        <div className="flex gap-4 mt-3">
                                            <div className="flex items-center gap-1.5">
                                                <DollarSign className="w-3 h-3 text-slate-400" />
                                                <span className="text-sm font-semibold text-slate-900">RM{camera.daily_rate}</span>
                                                <span className="text-xs text-slate-400">/day</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-semibold text-slate-900">{camera.available_quantity}/{camera.total_quantity}</span>
                                                <span className="text-xs text-slate-400">qty</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                <TrendingUp className="w-3 h-3 text-green-500" />
                                                <span className="text-sm font-semibold text-green-600">RM{metrics.totalRevenue}</span>
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
                                                    {/* Currently Rented Info */}
                                                    {rentalInfo && (
                                                        <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                                                            <p className="text-xs font-semibold text-blue-600 mb-1">Currently Rented</p>
                                                            <p className="text-sm font-medium text-blue-900">{rentalInfo.customerName}</p>
                                                            <p className="text-xs text-blue-600">Return: {rentalInfo.endDate}</p>
                                                        </div>
                                                    )}

                                                    {/* Last Maintenance */}
                                                    <div className="flex items-center justify-between bg-slate-50 rounded-xl p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Wrench className="w-4 h-4 text-slate-400" />
                                                            <span className="text-xs text-slate-500">Last Maintenance</span>
                                                        </div>
                                                        <span className="text-xs font-medium text-slate-700">
                                                            {camera.last_maintenance
                                                                ? new Date(camera.last_maintenance).toLocaleDateString('en-MY', { month: 'short', day: 'numeric', year: 'numeric' })
                                                                : 'No records'
                                                            }
                                                        </span>
                                                    </div>

                                                    {/* Action Buttons */}
                                                    <div className="flex gap-2">
                                                        <Link
                                                            href={`/admin/cameras/${camera.id}`}
                                                            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-xl font-semibold text-sm active:scale-95"
                                                        >
                                                            <Eye className="w-4 h-4" />
                                                            Details
                                                        </Link>
                                                        <Link
                                                            href={`/admin/cameras/${camera.id}/edit`}
                                                            className="flex-1 flex items-center justify-center gap-2 bg-slate-600 text-white py-3 rounded-xl font-semibold text-sm active:scale-95"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Edit
                                                        </Link>
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
            </div>
        </div>
    );
}
