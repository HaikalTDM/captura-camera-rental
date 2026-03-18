'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Camera,
    Wrench,
    Eye,
    Edit,
    TrendingUp,
    Plus,
    ChevronDown,
    DollarSign
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

interface MobileCamerasProps {
    cameras: Array<{
        id: string;
        name: string;
        model?: string;
        daily_rate: number;
        is_available: boolean;
        available_quantity: number;
        total_quantity: number;
        last_maintenance?: string | null;
    }>;
    bookings: Array<{
        camera_id?: string;
        status?: string;
        customerName?: string;
        endDate?: string;
    }>;
    statusCounts: {
        available: number;
        rented: number;
        maintenance: number;
        reserved: number;
    };
    cameraMetrics: Map<string, { totalRentals: number; totalRevenue: number; lastBooking: number | null }>;
    getCameraRentalInfo: (cameraId: string) => { customerName?: string; endDate?: string } | undefined;
}

export default function MobileCameras(props: MobileCamerasProps) {
    const {
        cameras,
        statusCounts,
        cameraMetrics,
        getCameraRentalInfo
    } = props;
    const [expandedCamera, setExpandedCamera] = useState<string | null>(null);

    const getStatusColor = (isAvailable: boolean, availableQuantity: number) => {
        if (!isAvailable) return 'border-[#4a2d2d] bg-[#1e1515] text-rose-200';
        if (availableQuantity === 0) return 'border-[#332b25] bg-[#1f1a16] text-stone-300';
        return 'border-[#5a4328] bg-[#332316] text-orange-200';
    };

    const getStatusText = (isAvailable: boolean, availableQuantity: number, totalQuantity: number) => {
        if (!isAvailable) return 'Unavailable';
        if (availableQuantity === 0) return 'Rented';
        if (availableQuantity < totalQuantity) return `${availableQuantity}/${totalQuantity}`;
        return 'Available';
    };

    return (
        <div className="p-4 pb-24">
            {/* Header - Pill Style */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-4 rounded-2xl border border-[#332b25] bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.18),_transparent_45%),linear-gradient(135deg,#1b1714_0%,#171411_60%,#141210_100%)] px-4 py-4 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
            >
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5a4328] bg-[#332316]">
                            <Camera className="h-5 w-5 text-orange-300" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-stone-100">Cameras</h1>
                            <p className="text-xs text-stone-400">{cameras.length} total</p>
                        </div>
                    </div>
                    <Link
                        href="/admin/mobile/cameras"
                        className="flex items-center gap-1.5 rounded-xl bg-[#c96b2c] px-3 py-2 text-sm font-semibold text-stone-950 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Add
                    </Link>
                </div>

                {/* Quick Stats Row */}
                <div className="flex gap-2">
                    <div className="flex-1 rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-2 text-center">
                        <p className="text-lg font-bold text-orange-300">{statusCounts.available}</p>
                        <p className="text-[10px] text-stone-500">Available</p>
                    </div>
                    <div className="flex-1 rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-2 text-center">
                        <p className="text-lg font-bold text-stone-300">{statusCounts.rented}</p>
                        <p className="text-[10px] text-stone-500">Rented</p>
                    </div>
                    <div className="flex-1 rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-2 text-center">
                        <p className="text-lg font-bold text-rose-200">{statusCounts.maintenance}</p>
                        <p className="text-[10px] text-stone-500">Maintenance</p>
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
                            <Card className="overflow-hidden border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
                                <CardContent className="p-0">
                                    {/* Card Header - Tappable */}
                                    <button
                                        onClick={() => setExpandedCamera(isExpanded ? null : camera.id)}
                                        className="w-full p-4 text-left"
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl border border-[#332b25] bg-[#1f1a16]">
                                                    <Camera className="h-6 w-6 text-stone-300" />
                                                </div>
                                                <div className="min-w-0">
                                                    <h4 className="truncate text-sm font-bold text-stone-100">
                                                        {camera.name}
                                                    </h4>
                                                    <p className="truncate text-xs text-stone-500">
                                                        {camera.model}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`rounded-lg border px-2 py-1 text-[10px] font-semibold ${getStatusColor(camera.is_available, camera.available_quantity)}`}>
                                                    {getStatusText(camera.is_available, camera.available_quantity, camera.total_quantity)}
                                                </span>
                                                <ChevronDown className={`h-4 w-4 text-stone-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                                            </div>
                                        </div>

                                        {/* Quick Info Row */}
                                        <div className="flex gap-4 mt-3">
                                            <div className="flex items-center gap-1.5">
                                                <DollarSign className="h-3 w-3 text-stone-500" />
                                                <span className="text-sm font-semibold text-stone-100">RM{camera.daily_rate}</span>
                                                <span className="text-xs text-stone-500">/day</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-sm font-semibold text-stone-100">{camera.available_quantity}/{camera.total_quantity}</span>
                                                <span className="text-xs text-stone-500">qty</span>
                                            </div>
                                            <div className="flex items-center gap-1.5 ml-auto">
                                                <TrendingUp className="h-3 w-3 text-orange-300" />
                                                <span className="text-sm font-semibold text-orange-300">RM{metrics.totalRevenue}</span>
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
                                                        <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] p-3">
                                                            <p className="mb-1 text-xs font-semibold text-orange-300">Currently Rented</p>
                                                            <p className="text-sm font-medium text-stone-100">{rentalInfo.customerName}</p>
                                                            <p className="text-xs text-stone-500">Return: {rentalInfo.endDate}</p>
                                                        </div>
                                                    )}

                                                    {/* Last Maintenance */}
                                                    <div className="flex items-center justify-between rounded-xl border border-[#2c2722] bg-[#1b1714] p-3">
                                                        <div className="flex items-center gap-2">
                                                            <Wrench className="h-4 w-4 text-stone-500" />
                                                            <span className="text-xs text-stone-500">Last Maintenance</span>
                                                        </div>
                                                        <span className="text-xs font-medium text-stone-300">
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
                                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#c96b2c] py-3 text-sm font-semibold text-stone-950 active:scale-95"
                                                        >
                                                            <Eye className="h-4 w-4" />
                                                            Details
                                                        </Link>
                                                        <Link
                                                            href={`/admin/cameras/${camera.id}/edit`}
                                                            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#332b25] bg-[#1f1a16] py-3 text-sm font-semibold text-stone-200 active:scale-95"
                                                        >
                                                            <Edit className="h-4 w-4" />
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
