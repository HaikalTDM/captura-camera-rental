'use client';

import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import type { Booking, Customer, Camera } from '@/lib/supabase';
import RentalAgreementTemplate from '@/components/RentalAgreementTemplate';
import { exportToPDF, generatePDFFilename, printAgreement } from '@/utils/pdfExport';
import { format } from 'date-fns';

interface BookingWithDetails extends Booking {
  customer: Customer;
  camera: Camera;
}

export default function RentalAgreementsPage() {
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [selectedBooking, setSelectedBooking] = useState<BookingWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const agreementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      
      // Fetch bookings with customer and camera details
      const { data: bookingsData, error: bookingsError } = await supabase
        .from('bookings')
        .select(`
          *,
          customer:customers(*)
        `)
        .order('created_at', { ascending: false });

      if (bookingsError) throw bookingsError;

      // Fetch camera details separately
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
            camera: camera || { name: booking.camera_id, id: booking.camera_id }
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
      alert('Failed to export PDF. Please try again.');
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

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy');
    } catch {
      return dateString;
    }
  };

  const getStatusBadge = (status: string) => {
    const statusColors: Record<string, string> = {
      pending_approval: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      completed: 'bg-blue-100 text-blue-800',
      cancelled: 'bg-red-100 text-red-800',
      rejected: 'bg-gray-100 text-gray-800'
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading rental agreements...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Rental Agreements</h1>
          <p className="text-gray-600">View and export personalized rental agreements for each booking</p>
        </div>

        {!selectedBooking ? (
          <>
            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Search
                  </label>
                  <input
                    type="text"
                    placeholder="Search by name, email, phone, or booking ID..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending_approval">Pending Approval</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Bookings List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Customer
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Camera
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rental Period
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredBookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                          No bookings found
                        </td>
                      </tr>
                    ) : (
                      filteredBookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {booking.customer.full_name}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.customer.email}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {booking.camera?.name || booking.camera_id}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-gray-900">
                              {formatDate(booking.start_date)}
                            </div>
                            <div className="text-sm text-gray-500">
                              to {formatDate(booking.end_date)}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getStatusBadge(booking.booking_status)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              RM{booking.total_amount.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {booking.total_days} day{booking.total_days > 1 ? 's' : ''}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => setSelectedBooking(booking)}
                              className="text-blue-600 hover:text-blue-900 font-medium"
                            >
                              View Agreement →
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : (
          <>
            {/* Agreement View */}
            <div className="mb-6 flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
              <button
                onClick={() => setSelectedBooking(null)}
                className="flex items-center text-gray-600 hover:text-gray-900"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back to List
              </button>

              <div className="flex gap-3">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={() => handleExportPDF(selectedBooking)}
                  disabled={exporting}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {exporting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Exporting...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Export PDF
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Agreement Template */}
            <div ref={agreementRef} className="bg-white rounded-lg shadow-lg">
              <RentalAgreementTemplate
                booking={selectedBooking}
                customer={selectedBooking.customer}
                camera={selectedBooking.camera}
                confirmationNumber={selectedBooking.id.substring(0, 8).toUpperCase()}
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

