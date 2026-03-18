'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { format } from 'date-fns';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Download,
  Eye,
  FileText,
  Printer,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { Booking, Camera, Customer } from '@/lib/supabase';
import RentalAgreementTemplate from '@/components/RentalAgreementTemplate';
import { exportToPDF, generatePDFFilename, printAgreement } from '@/utils/pdfExport';
import { useIsMobile } from '@/hooks/useIsMobile';
import MobileRentalAgreements from '@/components/admin/MobileRentalAgreements';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { customToast } from '@/components/ui/toast-config';

interface BookingWithDetails extends Booking {
  customer: Customer;
  camera: Camera;
}

type StatusTone = 'orange' | 'blue' | 'green' | 'red' | 'stone';

const agreementStatusConfig: Record<string, { label: string; tone: StatusTone }> = {
  pending_approval: { label: 'Pending Approval', tone: 'orange' },
  confirmed: { label: 'Confirmed', tone: 'blue' },
  completed: { label: 'Completed', tone: 'green' },
  cancelled: { label: 'Cancelled', tone: 'red' },
  rejected: { label: 'Rejected', tone: 'stone' },
};

function getStatusToneClasses(tone: StatusTone) {
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

export default function RentalAgreementsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const agreementRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile(768);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);

      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(
            id,
            full_name,
            email,
            phone,
            whatsapp,
            address,
            id_number,
            emergency_contact_name,
            emergency_contact_phone
          )
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      const bookingsWithCameras = await Promise.all(
        (bookingsData || []).map(async (booking) => {
          const { data: camera } = await supabase
            .from('cameras')
            .select('*')
            .eq('id', booking.camera_id)
            .single();

          return {
            ...booking,
            customer: booking.customer,
            camera: camera || { name: booking.camera_id, id: booking.camera_id },
          } as BookingWithDetails;
        })
      );

      setBookings(bookingsWithCameras);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async (booking: BookingWithDetails) => {
    if (!agreementRef.current) return;

    try {
      setExporting(true);
      const filename = generatePDFFilename(
        booking.customer.full_name,
        booking.id.substring(0, 8).toUpperCase(),
        booking.id
      );

      await exportToPDF(agreementRef.current, { filename });
    } catch (error) {
      console.error('Export failed:', error);
      customToast.error('Failed to export PDF', 'Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handlePrint = () => {
    printAgreement();
  };

  const filteredBookings = bookings.filter((booking) => {
    const matchesSearch =
      booking.customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      booking.customer.phone.includes(searchTerm) ||
      booking.id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || booking.booking_status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const agreementStats = useMemo(() => {
    return {
      total: bookings.length,
      confirmed: bookings.filter((booking) => booking.booking_status === 'confirmed').length,
      completed: bookings.filter((booking) => booking.booking_status === 'completed').length,
      visible: filteredBookings.length,
    };
  }, [bookings, filteredBookings]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const config = agreementStatusConfig[status] || {
      label: status.replace('_', ' ').toUpperCase(),
      tone: 'stone' as const,
    };

    return (
      <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] ${getStatusToneClasses(config.tone)}`}>
        {config.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-b-2 border-[#c96b2c]"></div>
          <p className="mt-4 text-stone-500">Loading rental agreements...</p>
        </div>
      </div>
    );
  }

  if (isMobile) {
    return (
      <MobileRentalAgreements
        bookings={bookings}
        selectedBooking={selectedBooking}
        loading={loading}
        exporting={exporting}
        searchTerm={searchTerm}
        statusFilter={statusFilter}
        onSearchChange={setSearchTerm}
        onStatusFilterChange={setStatusFilter}
        onSelectBooking={(booking) => setSelectedBooking(booking as BookingWithDetails)}
        onClearSelection={() => setSelectedBooking(null)}
        onExportPDF={(booking) => handleExportPDF(booking as BookingWithDetails)}
        onPrint={handlePrint}
        agreementRef={agreementRef as React.RefObject<HTMLDivElement>}
        AgreementTemplate={RentalAgreementTemplate as React.ComponentType<{
          booking: BookingWithDetails;
          customer: BookingWithDetails['customer'];
          camera: BookingWithDetails['camera'];
          confirmationNumber: string;
        }>}
      />
    );
  }

  return (
    <div className="space-y-6 px-2 pb-8 xl:px-0">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid gap-4 xl:grid-cols-[minmax(0,1.8fr)_340px]"
      >
        <Card className="rounded-[30px] border border-[#2d2722] bg-[radial-gradient(circle_at_top,_rgba(201,107,44,0.12),_transparent_42%),linear-gradient(180deg,#1c1713_0%,#141210_100%)] shadow-[0_30px_80px_rgba(0,0,0,0.34)]">
          <CardContent className="p-6 md:p-7">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#43372d] bg-[#1d1814] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-stone-300">
                <FileText className="h-3.5 w-3.5 text-orange-300" />
                Agreement desk
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-stone-50">Rental Agreements</h1>
                <p className="max-w-2xl text-sm leading-6 text-stone-400">
                  Review booking-backed agreements, open a polished contract preview, and print or export with a cleaner admin workflow.
                </p>
              </div>
              <div className="grid gap-3 md:grid-cols-3">
                <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Visible agreements</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-50">{agreementStats.visible}</p>
                  <p className="mt-2 text-sm text-stone-400">Filtered agreements currently shown in the desktop list.</p>
                </div>
                <div className="rounded-2xl border border-[#2f2924] bg-[#171411] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Confirmed rentals</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-50">{agreementStats.confirmed}</p>
                  <p className="mt-2 text-sm text-stone-400">Bookings that are agreement-ready and actively approved.</p>
                </div>
                <div className="rounded-2xl border border-[#3f3125] bg-[#241b14] p-4">
                  <p className="text-[11px] uppercase tracking-[0.22em] text-stone-500">Completed rentals</p>
                  <p className="mt-3 text-3xl font-semibold text-stone-50">{agreementStats.completed}</p>
                  <p className="mt-2 text-sm text-stone-400">Closed agreements still available for printing or export.</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[30px] border border-[#2d2722] bg-[#171411] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
          <CardHeader className="border-b border-[#26211d] pb-4">
            <CardTitle className="text-lg text-stone-50">Agreement Notes</CardTitle>
            <CardDescription className="text-stone-400">
              A quick read before you open or export a contract.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Total agreements</p>
              <p className="mt-2 text-2xl font-semibold text-stone-50">{agreementStats.total}</p>
              <p className="mt-1 text-sm text-stone-400">Every booking can be reviewed as a branded rental agreement.</p>
            </div>
            <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
              <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Current focus</p>
              <p className="mt-2 text-sm leading-6 text-stone-300">
                Use search to find a renter quickly, then open the agreement view to print or export a PDF.
              </p>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {!selectedBooking ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="rounded-[28px] border border-[#2c2722] bg-[#171411] shadow-[0_24px_55px_rgba(0,0,0,0.28)]">
            <CardContent className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_240px]">
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Search agreements
                </label>
                <div className="relative">
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or booking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="admin-dark-input pl-11 pr-4 text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                  Status filter
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="admin-dark-select text-sm"
                >
                  <option value="all">All statuses</option>
                  <option value="pending_approval">Pending Approval</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[30px] border border-[#2c2722] bg-[#171411] shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
            <CardHeader className="border-b border-[#26211d] pb-4">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <CardTitle className="text-xl text-stone-50">Agreement List</CardTitle>
                  <CardDescription className="mt-1 text-stone-400">
                    Open any booking to review its rental agreement before export.
                  </CardDescription>
                </div>
                <div className="rounded-full border border-[#39312a] bg-[#1a1714] px-3 py-1.5 text-sm text-stone-300">
                  {filteredBookings.length} shown
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-5">
              <div className="overflow-x-auto rounded-[24px] border border-[#2d2722] bg-[#12100f]">
                <table className="min-w-full divide-y divide-[#26211d]">
                  <thead className="bg-[#181512]">
                    <tr>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Camera
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Rental Period
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Total
                      </th>
                      <th className="px-6 py-4 text-right text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#211d19]">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-16 text-center">
                          <div className="flex flex-col items-center gap-3 text-center">
                            <div className="flex h-14 w-14 items-center justify-center rounded-full border border-[#312924] bg-[#171411]">
                              <FileText className="h-6 w-6 text-stone-500" />
                            </div>
                            <div className="space-y-1">
                              <p className="text-lg font-medium text-stone-100">No agreements found</p>
                              <p className="text-sm text-stone-500">Try widening the search or changing the current status filter.</p>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="transition-colors hover:bg-[#171411]">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-stone-100">
                              {booking.customer.full_name}
                            </div>
                            <div className="text-sm text-stone-400">
                              {booking.customer.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-stone-100">
                              {booking.camera?.name || booking.camera_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-stone-100">
                              {formatDate(booking.start_date)}
                            </div>
                            <div className="text-sm text-stone-500">
                              to {formatDate(booking.end_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(booking.booking_status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-stone-100">
                              RM{booking.total_amount.toFixed(2)}
                            </div>
                            <div className="text-sm text-stone-500">
                              {booking.total_days} day{booking.total_days > 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <Button
                              onClick={() => setSelectedBooking(booking)}
                              variant="outline"
                              className="h-10 rounded-2xl border-[#3a3129] bg-[#171411] text-stone-200 hover:bg-[#221d18] hover:text-stone-50"
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Open Agreement
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-6"
        >
          <Card className="rounded-[28px] border border-[#2c2722] bg-[#171411] shadow-[0_24px_55px_rgba(0,0,0,0.28)]">
            <CardContent className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="inline-flex items-center gap-2 text-sm text-stone-400 transition-colors hover:text-stone-100"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to agreement list
                </button>
                <div>
                  <p className="text-lg font-semibold text-stone-50">{selectedBooking.customer.full_name}</p>
                  <p className="text-sm text-stone-400">
                    {selectedBooking.camera?.name || selectedBooking.camera_id} • {formatDate(selectedBooking.start_date)} to {formatDate(selectedBooking.end_date)}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  onClick={handlePrint}
                  variant="outline"
                  className="h-11 gap-2 rounded-2xl border-[#3a3129] bg-[#191613] text-stone-100 hover:bg-[#221d18]"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </Button>
                <Button
                  onClick={() => handleExportPDF(selectedBooking)}
                  disabled={exporting}
                  className="h-11 gap-2 rounded-2xl bg-[#c96b2c] text-black hover:bg-[#d97a39] disabled:opacity-50"
                >
                  {exporting ? (
                    <>
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-black/30 border-t-black"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4" />
                      Export PDF
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_300px]">
            <Card className="rounded-[30px] border border-[#2c2722] bg-[#171411] shadow-[0_30px_70px_rgba(0,0,0,0.32)]">
              <CardContent className="p-6">
                <div ref={agreementRef} className="overflow-hidden rounded-[24px] bg-white shadow-[0_18px_45px_rgba(0,0,0,0.28)]">
                  <RentalAgreementTemplate
                    booking={selectedBooking}
                    customer={selectedBooking.customer}
                    camera={selectedBooking.camera}
                    confirmationNumber={selectedBooking.id.substring(0, 8).toUpperCase()}
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[30px] border border-[#2c2722] bg-[#171411] shadow-[0_24px_60px_rgba(0,0,0,0.32)]">
              <CardHeader className="border-b border-[#26211d] pb-4">
                <CardTitle className="text-lg text-stone-50">Agreement Summary</CardTitle>
                <CardDescription className="text-stone-400">
                  Quick context for this contract before export.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 p-5">
                <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Booking ID</p>
                  <p className="mt-2 font-mono text-sm text-stone-100">#{selectedBooking.id.slice(0, 8).toUpperCase()}</p>
                </div>
                <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Rental dates</p>
                  <p className="mt-2 text-sm text-stone-100">{formatDate(selectedBooking.start_date)} to {formatDate(selectedBooking.end_date)}</p>
                </div>
                <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Agreement status</p>
                  <div className="mt-2">{getStatusBadge(selectedBooking.booking_status)}</div>
                </div>
                <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
                  <p className="text-xs uppercase tracking-[0.2em] text-stone-500">Total value</p>
                  <p className="mt-2 text-2xl font-semibold text-stone-50">RM{selectedBooking.total_amount.toFixed(2)}</p>
                  <p className="mt-1 text-sm text-stone-400">{selectedBooking.total_days} rental day{selectedBooking.total_days > 1 ? 's' : ''}</p>
                </div>
                <div className="rounded-2xl border border-[#2c2621] bg-[#1d1a17] p-4">
                  <div className="flex items-start gap-3">
                    <ShieldCheck className="mt-0.5 h-5 w-5 text-orange-300" />
                    <p className="text-sm leading-6 text-stone-300">
                      Review the preview before export if booking details were recently updated, especially dates, amount, and camera assignment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}
