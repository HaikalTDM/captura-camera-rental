'use client';

import { motion } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  Camera as CameraIcon,
  CreditCard,
  Crown,
  DollarSign,
  Download,
  FileText,
  ShoppingBag,
  TrendingUp,
  Users,
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

type DateRange = 'all' | 'week' | 'month' | 'quarter' | 'year';
type ReportType = 'revenue' | 'bookings' | 'customers' | 'payments';

interface MobileReportsProps {
  dateRange: DateRange;
  setDateRange: React.Dispatch<React.SetStateAction<DateRange>>;
  reportType: ReportType;
  setReportType: React.Dispatch<React.SetStateAction<ReportType>>;
  reportScopeLabel: string;
  reportTypeLabel: string;
  scopeRevenue: number;
  totalRevenue: number;
  totalBookings: number;
  activeBookings: number;
  completedBookingsCount: number;
  includedCameraCount: number;
  activeCameraCount: number;
  paymentAnalysis: {
    fullyPaid: number;
    depositPaid: number;
    pending: number;
    overdue: number;
  };
  monthlyTrend: Array<{ month: string; revenue: number; bookings: number; year: number }>;
  cameraPerformance: Array<{
    id: string;
    name: string;
    revenue: number;
    bookings: number;
    utilization: number;
  }>;
  topCustomers: Array<{
    id: string;
    full_name: string;
    totalSpent: number;
    totalRentals: number;
  }>;
}

function getPillClasses(tone: 'orange' | 'blue' | 'green' | 'red' | 'stone') {
  switch (tone) {
    case 'orange':
      return 'border-[#4b3723] bg-[#2b2117] text-orange-200';
    case 'blue':
      return 'border-[#31414f] bg-[#1c242c] text-sky-200';
    case 'green':
      return 'border-[#30412f] bg-[#1f2b20] text-emerald-200';
    case 'red':
      return 'border-[#503130] bg-[#2a1b1a] text-rose-200';
    default:
      return 'border-[#3a3129] bg-[#221f1b] text-stone-300';
  }
}

export default function MobileReports({
  dateRange,
  setDateRange,
  reportType,
  setReportType,
  reportScopeLabel,
  reportTypeLabel,
  scopeRevenue,
  totalRevenue,
  totalBookings,
  activeBookings,
  completedBookingsCount,
  includedCameraCount,
  activeCameraCount,
  paymentAnalysis,
  monthlyTrend,
  cameraPerformance,
  topCustomers,
}: MobileReportsProps) {
  return (
    <div className="space-y-4 px-4 pb-24">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-[#332b25] bg-[radial-gradient(circle_at_top_left,_rgba(201,107,44,0.18),_transparent_45%),linear-gradient(135deg,#1b1714_0%,#171411_60%,#141210_100%)] p-4 shadow-[0_20px_45px_rgba(0,0,0,0.35)]"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#5a4328] bg-[#332316]">
            <BarChart3 className="h-5 w-5 text-orange-300" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-stone-100">Reports</h1>
            <p className="text-xs text-stone-400">Revenue, bookings, customers, and payments</p>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-orange-300">RM{scopeRevenue}</p>
            <p className="text-[10px] text-stone-500">{reportScopeLabel}</p>
          </div>
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-stone-200">{totalBookings}</p>
            <p className="text-[10px] text-stone-500">In scope</p>
          </div>
          <div className="rounded-xl border border-[#332b25] bg-[#1f1a16] px-3 py-3 text-center">
            <p className="text-lg font-bold text-sky-200">{includedCameraCount}</p>
            <p className="text-[10px] text-stone-500">Cameras</p>
          </div>
        </div>
      </motion.div>

      <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <CardContent className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="h-11 w-full rounded-2xl border border-[#322b26] bg-[#11100f] px-4 text-sm text-stone-100 outline-none focus:border-[#c96b2c]"
            >
              <option value="all">All Time</option>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value as ReportType)}
              className="h-11 w-full rounded-2xl border border-[#322b26] bg-[#11100f] px-4 text-sm text-stone-100 outline-none focus:border-[#c96b2c]"
            >
              <option value="revenue">Revenue</option>
              <option value="bookings">Bookings</option>
              <option value="customers">Customers</option>
              <option value="payments">Payments</option>
            </select>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-[#2c2722] bg-[#1b1714] p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Scope</p>
              <p className="mt-2 text-sm font-semibold text-stone-100">{reportScopeLabel}</p>
            </div>
            <div className="rounded-xl border border-[#2c2722] bg-[#1b1714] p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Focus</p>
              <p className="mt-2 text-sm font-semibold text-stone-100">{reportTypeLabel}</p>
            </div>
            <div className="rounded-xl border border-[#2c2722] bg-[#1b1714] p-3">
              <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Closed</p>
              <p className="mt-2 text-sm font-semibold text-stone-100">{completedBookingsCount}</p>
            </div>
          </div>
          <div className="rounded-xl border border-[#2c2722] bg-[#1b1714] p-3">
            <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Coverage</p>
            <p className="mt-2 text-sm font-semibold text-stone-100">{activeCameraCount}/{includedCameraCount} active cameras</p>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Lifetime Revenue</p>
                <p className="mt-2 text-xl font-semibold text-stone-100">RM{totalRevenue}</p>
              </div>
              <DollarSign className="h-5 w-5 text-emerald-300" />
            </div>
          </CardContent>
        </Card>
        <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Active</p>
                <p className="mt-2 text-xl font-semibold text-stone-100">{activeBookings}</p>
              </div>
              <Calendar className="h-5 w-5 text-orange-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-300" />
            <h2 className="text-base font-semibold text-stone-100">Revenue Trend</h2>
          </div>
          {monthlyTrend.map((month) => (
            <div key={`${month.month}-${month.year}`} className="space-y-2 rounded-2xl border border-[#2d2722] bg-[#12100f] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-100">{month.month}</p>
                  <p className="text-xs text-stone-500">{month.bookings} bookings</p>
                </div>
                <p className="font-semibold text-orange-300">RM{month.revenue}</p>
              </div>
              <div className="h-2 w-full rounded-full bg-[#2a2521]">
                <div
                  className="h-2 rounded-full bg-gradient-to-r from-[#c96b2c] to-[#f0a05b]"
                  style={{ width: `${Math.min((month.revenue / 1500) * 100, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-orange-300" />
            <h2 className="text-base font-semibold text-stone-100">Payment Status</h2>
          </div>
          {[
            { label: 'Fully Paid', value: paymentAnalysis.fullyPaid, tone: 'green' as const },
            { label: 'Deposit Paid', value: paymentAnalysis.depositPaid, tone: 'orange' as const },
            { label: 'Pending', value: paymentAnalysis.pending, tone: 'stone' as const },
            { label: 'Overdue', value: paymentAnalysis.overdue, tone: 'red' as const },
          ].map((item) => (
            <div key={item.label} className="flex items-center justify-between rounded-2xl border border-[#2d2722] bg-[#12100f] p-3">
              <span className="text-sm font-medium text-stone-200">{item.label}</span>
              <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${getPillClasses(item.tone)}`}>
                {item.value}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <CameraIcon className="h-5 w-5 text-orange-300" />
            <h2 className="text-base font-semibold text-stone-100">Camera Performance</h2>
          </div>
          {cameraPerformance.slice(0, 5).map((camera) => (
            <div key={camera.id} className="rounded-2xl border border-[#2d2722] bg-[#12100f] p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-100">{camera.name}</p>
                  <p className="text-xs text-stone-500">{camera.bookings} bookings</p>
                </div>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${getPillClasses('blue')}`}>
                  {camera.utilization}%
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <div className="rounded-xl border border-[#2b2520] bg-[#171411] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Revenue</p>
                  <p className="mt-1 font-semibold text-emerald-300">RM{camera.revenue}</p>
                </div>
                <div className="rounded-xl border border-[#2b2520] bg-[#171411] p-3">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-stone-500">Avg / Booking</p>
                  <p className="mt-1 font-semibold text-orange-300">
                    RM{camera.bookings > 0 ? Math.round(camera.revenue / camera.bookings) : 0}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Crown className="h-5 w-5 text-orange-300" />
            <h2 className="text-base font-semibold text-stone-100">Top Customers</h2>
          </div>
          {topCustomers.slice(0, 5).map((customer, index) => (
            <div key={customer.id} className="flex items-center justify-between rounded-2xl border border-[#2d2722] bg-[#12100f] p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#2a1f16] text-xs font-bold text-orange-200">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-semibold text-stone-100">{customer.full_name}</p>
                  <p className="flex items-center gap-1 text-xs text-stone-500">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    {customer.totalRentals} rentals
                  </p>
                </div>
              </div>
              <p className="font-semibold text-emerald-300">RM{customer.totalSpent}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border border-[#2c2722] bg-[#171411] shadow-[0_18px_40px_rgba(0,0,0,0.28)]">
        <CardContent className="space-y-3 p-4">
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-orange-300" />
            <h2 className="text-base font-semibold text-stone-100">Export Reports</h2>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button className="h-auto flex-col gap-2 rounded-2xl bg-[#1f6b45] py-4 text-white hover:bg-[#258555]">
              <FileText className="h-5 w-5" />
              <span className="text-xs font-semibold">Revenue</span>
            </Button>
            <Button className="h-auto flex-col gap-2 rounded-2xl bg-[#1d2933] py-4 text-white hover:bg-[#243746]">
              <Calendar className="h-5 w-5" />
              <span className="text-xs font-semibold">Bookings</span>
            </Button>
            <Button className="h-auto flex-col gap-2 rounded-2xl bg-[#241b14] py-4 text-white hover:bg-[#322117]">
              <Users className="h-5 w-5" />
              <span className="text-xs font-semibold">Customers</span>
            </Button>
            <Button className="h-auto flex-col gap-2 rounded-2xl bg-[#302219] py-4 text-white hover:bg-[#3a2719]">
              <CreditCard className="h-5 w-5" />
              <span className="text-xs font-semibold">Payments</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
