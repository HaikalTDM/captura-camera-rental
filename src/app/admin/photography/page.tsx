'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

// Mock data - will be replaced with Supabase
interface BookingSummary {
  total: number;
  pending: number;
  confirmed: number;
  completed: number;
}

interface RecentBooking {
  id: string;
  clientName: string;
  eventType: string;
  eventDate: string;
  package: string;
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
  amount: number;
}

interface GallerySummary {
  totalPhotos: number;
  recentUploads: number;
  categories: number;
  featured: number;
}

export default function PhotographyAdminDashboard() {
  const [mounted, setMounted] = useState(false);
  const [bookingSummary, setBookingSummary] = useState<BookingSummary>({
    total: 12,
    pending: 3,
    confirmed: 7,
    completed: 2
  });

  const [gallerySummary, setGallerySummary] = useState<GallerySummary>({
    totalPhotos: 245,
    recentUploads: 18,
    categories: 5,
    featured: 32
  });

  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([
    {
      id: '1',
      clientName: 'Ahmad & Siti',
      eventType: 'Wedding',
      eventDate: '2024-02-15',
      package: 'Combo Nikah + Sanding',
      status: 'confirmed',
      amount: 950
    },
    {
      id: '2',
      clientName: 'Corporate Event Sdn Bhd',
      eventType: 'Corporate',
      eventDate: '2024-02-18',
      package: 'Corporate Package',
      status: 'pending',
      amount: 800
    },
    {
      id: '3',
      clientName: 'Fatimah',
      eventType: 'Graduation',
      eventDate: '2024-02-20',
      package: 'Graduation Package',
      status: 'confirmed',
      amount: 350
    }
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#d4af37] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading photography dashboard...</p>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'completed': return 'bg-blue-100 text-blue-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const totalRevenue = recentBookings.reduce((sum, booking) => 
    booking.status !== 'cancelled' ? sum + booking.amount : sum, 0
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-4 font-serif">Photography Dashboard</h1>
            <div className="w-16 h-px bg-[#d4af37] mx-auto mb-4"></div>
            <p className="text-black/60 text-lg max-w-2xl mx-auto">
              Manage your photography business with precision and style
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 uppercase tracking-wide">Total Bookings</p>
                <p className="text-3xl font-bold text-gray-900">{bookingSummary.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4 flex space-x-4 text-sm">
              <span className="text-yellow-600">Pending: {bookingSummary.pending}</span>
              <span className="text-green-600">Confirmed: {bookingSummary.confirmed}</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">This Month Revenue</p>
                <p className="text-3xl font-bold text-black">RM{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-[#d4af37]/20 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-green-600 text-sm font-medium">↗ +15% from last month</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">Gallery Photos</p>
                <p className="text-3xl font-bold text-black">{gallerySummary.totalPhotos}</p>
              </div>
              <div className="w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-[#d4af37] text-sm font-medium">+{gallerySummary.recentUploads} this week</span>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] transition-all duration-300 hover:shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-black/60 uppercase tracking-wide font-medium">WhatsApp Inquiries</p>
                <p className="text-3xl font-bold text-black">8</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.687"/>
                </svg>
              </div>
            </div>
            <div className="mt-4">
              <span className="text-orange-600 text-sm font-medium">3 new today</span>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Quick Actions Panel */}
          <div className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
            <h3 className="text-xl font-bold text-black mb-6 font-serif">Quick Actions</h3>
            <div className="space-y-3">
              <Link 
                href="/admin/photography/bookings/new"
                className="w-full flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-100 hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center group-hover:bg-[#d4af37] transition-colors">
                  <svg className="w-5 h-5 text-[#d4af37] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-black">New Booking</p>
                  <p className="text-sm text-black/60">Add manual booking</p>
                </div>
              </Link>

              <Link 
                href="/admin/photography/gallery/upload"
                className="w-full flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-100 hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center group-hover:bg-[#d4af37] transition-colors">
                  <svg className="w-5 h-5 text-[#d4af37] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-black">Upload Photos</p>
                  <p className="text-sm text-black/60">Add to gallery</p>
                </div>
              </Link>

              <Link 
                href="/admin/photography/calendar"
                className="w-full flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-100 hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center group-hover:bg-[#d4af37] transition-colors">
                  <svg className="w-5 h-5 text-[#d4af37] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-black">Manage Calendar</p>
                  <p className="text-sm text-black/60">Set availability</p>
                </div>
              </Link>

              <Link 
                href="/admin/addons"
                className="w-full flex items-center space-x-3 p-3 rounded-lg border-2 border-gray-100 hover:border-[#d4af37] hover:bg-[#d4af37]/5 transition-all duration-200 group"
              >
                <div className="w-10 h-10 bg-[#d4af37]/20 rounded-lg flex items-center justify-center group-hover:bg-[#d4af37] transition-colors">
                  <svg className="w-5 h-5 text-[#d4af37] group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-black">Manage Add-ons</p>
                  <p className="text-sm text-black/60">Edit packages</p>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Bookings */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-black font-serif">Recent Bookings</h3>
              <Link 
                href="/admin/photography/bookings"
                className="text-[#d4af37] hover:text-[#d4af37]/80 text-sm font-medium"
              >
                View All
              </Link>
            </div>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div 
                  key={booking.id}
                  className="flex items-center justify-between p-4 border border-[#d4af37]/10 rounded-lg hover:bg-[#d4af37]/5 hover:border-[#d4af37]/30 transition-all duration-200"
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-black">{booking.clientName}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className="mt-1 text-sm text-black/60">
                      {booking.eventType} • {booking.package} • {new Date(booking.eventDate).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-black">RM{booking.amount}</p>
                    <button className="text-[#d4af37] hover:text-[#d4af37]/80 text-sm">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link 
            href="/admin/photography/bookings"
            className="bg-white rounded-xl shadow-lg p-6 border border-[#d4af37]/20 hover:border-[#d4af37] hover:shadow-xl transition-all duration-300 group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-black/10 rounded-lg flex items-center justify-center group-hover:bg-[#d4af37] transition-colors">
                <svg className="w-6 h-6 text-black group-hover:text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-black/40 group-hover:text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-black mb-2 font-serif">Booking Management</h3>
            <p className="text-black/60 text-sm">Manage all photography bookings, schedules, and client communications</p>
          </Link>

          <Link 
            href="/admin/photography/gallery"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Gallery Management</h3>
            <p className="text-gray-600 text-sm">Upload, organize, and manage your photography portfolio</p>
          </Link>

          <Link 
            href="/admin/photography/clients"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-[#d4af37]/20 rounded-lg flex items-center justify-center group-hover:bg-[#d4af37]/30 transition-colors">
                <svg className="w-6 h-6 text-[#d4af37]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Client Management</h3>
            <p className="text-gray-600 text-sm">Manage client relationships and communication history</p>
          </Link>

          <Link 
            href="/admin/photography/analytics"
            className="bg-white rounded-xl shadow-sm p-6 border border-gray-200 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center group-hover:bg-green-200 transition-colors">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                </svg>
              </div>
              <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Analytics & Reports</h3>
            <p className="text-gray-600 text-sm">View performance metrics and business insights</p>
          </Link>
        </div>
      </main>
    </div>
  );
}
