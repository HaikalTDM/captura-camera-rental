'use client';

import { useState, useEffect } from 'react';
import { getAllCustomers, getAllBookings } from '@/lib/api/bookings';
import type { Customer, Booking } from '@/lib/supabase';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';

export default function MobileCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'full_name' | 'totalSpent' | 'totalRentals' | 'created_at'>('full_name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isLoading, setIsLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error'>('success');

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    loadCustomersData();
  }, []);

  const loadCustomersData = async () => {
    setIsLoading(true);
    try {
      const [customersData, bookingsData] = await Promise.all([
        getAllCustomers(),
        getAllBookings()
      ]);
      setCustomers(customersData);
      setBookings(bookingsData);
    } catch (error) {
      console.error('Error loading customers data:', error);
      showCustomToast('Failed to load customers', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const showCustomToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Calculate customer metrics
  const customersWithMetrics = customers.map(customer => {
    const customerBookings = bookings.filter(b => b.customer_id === customer.id);
    const paidBookings = customerBookings.filter(b => b.deposit_paid && b.final_payment_paid);
    const totalSpent = paidBookings.reduce((sum, b) => {
      const isNewPaymentSystem = b.deposit_amount === 100;
      return sum + (isNewPaymentSystem ? (b.deposit_amount + b.final_payment_amount) : b.total_amount);
    }, 0);
    const lastRental = customerBookings.length > 0
      ? Math.max(...customerBookings.map(b => new Date(b.created_at).getTime()))
      : null;

    return {
      ...customer,
      totalRentals: customerBookings.length,
      totalSpent,
      lastRental: lastRental ? new Date(lastRental).toISOString().split('T')[0] : null
    };
  });

  // Filter and sort customers
  const filteredCustomers = customersWithMetrics
    .filter(customer =>
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = (bValue as string).toLowerCase();
      }

      if (sortOrder === 'asc') {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

  const getReliabilityBadge = (totalRentals: number) => {
    if (totalRentals >= 5) return { label: 'Excellent', color: 'bg-green-500/10 text-green-500 border-green-500/20' };
    if (totalRentals >= 2) return { label: 'Good', color: 'bg-blue-500/10 text-blue-500 border-blue-500/20' };
    if (totalRentals >= 1) return { label: 'Fair', color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' };
    return { label: 'New', color: 'bg-slate-500/10 text-slate-500 border-slate-500/20' };
  };

  const getCustomerBookings = (customerId: string) => {
    return bookings.filter(booking => booking.customer_id === customerId);
  };

  const customerStats = {
    total: customers.length,
    excellent: customersWithMetrics.filter(c => c.totalRentals >= 5).length,
    good: customersWithMetrics.filter(c => c.totalRentals >= 2 && c.totalRentals < 5).length,
    fair: customersWithMetrics.filter(c => c.totalRentals >= 1 && c.totalRentals < 2).length,
    new: customersWithMetrics.filter(c => c.totalRentals === 0).length,
  };

  return (
    <>
      {/* Loading State - Inline, doesn't block navigation */}
      {isLoading && (
        <div className={`flex items-center justify-center h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'}`}>
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-300 border-t-blue-600"></div>
            <p className={`text-sm font-medium ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
              Loading customers...
            </p>
          </div>
        </div>
      )}

      {/* Content - Always rendered, just hidden when loading */}
      <div className={isLoading ? 'hidden' : ''}>
      {/* Animated Toast Notification */}
      {showToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-slideDown">
          <div className={`${isDarkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'} border rounded-2xl shadow-2xl px-6 py-4 flex items-center gap-3 min-w-[300px]`}>
            <div className={`w-10 h-10 rounded-xl ${toastType === 'success' ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-rose-600'} flex items-center justify-center flex-shrink-0`}>
              {toastType === 'success' ? (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              )}
            </div>
            <p className={`font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
              {toastMessage}
            </p>
          </div>
        </div>
      )}

      <div className={`min-h-screen ${isDarkMode ? 'bg-slate-950' : 'bg-slate-50'} pb-24`}>
        {/* Stats Overview */}
        <div className="px-4 pt-4 space-y-4">
          {/* Top Stats */}
          <div className="grid grid-cols-2 gap-3 animate-fadeIn">
            <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-4`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Total
              </p>
              <p className={`text-3xl font-bold mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                {customerStats.total}
              </p>
            </div>
            <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-4`}>
              <p className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                Excellent
              </p>
              <p className="text-3xl font-bold text-green-500 mt-1">
                {customerStats.excellent}
              </p>
            </div>
          </div>

          {/* Search Bar */}
          <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-4 animate-fadeIn`} style={{ animationDelay: '100ms' }}>
            <div className="relative">
              <input
                type="text"
                placeholder="Search customers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={`w-full pl-12 pr-4 py-3 rounded-xl border ${
                  isDarkMode 
                    ? 'bg-slate-800 border-slate-700 text-white placeholder:text-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400'
                } focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200`}
              />
              <svg className={`absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className={`absolute right-4 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full ${isDarkMode ? 'bg-slate-700 hover:bg-slate-600' : 'bg-slate-200 hover:bg-slate-300'} flex items-center justify-center transition-colors`}
                >
                  <svg className={`w-4 h-4 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>

            {/* Sort Button */}
            <button
              onClick={() => setShowFilterModal(true)}
              className={`mt-3 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Sort & Filter
              </div>
            </button>
          </div>

          {/* Customers List */}
          <div className="space-y-3">
            {filteredCustomers.length > 0 ? filteredCustomers.map((customer, index) => {
              const customerBookings = getCustomerBookings(customer.id);
              const activeBookings = customerBookings.filter(b => b.status === 'active' || b.status === 'picked_up').length;
              const badge = getReliabilityBadge(customer.totalRentals);

              return (
                <div 
                  key={customer.id} 
                  className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm overflow-hidden animate-fadeIn`}
                  style={{ animationDelay: `${(index + 2) * 50}ms` }}
                >
                  <div className="p-4">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} truncate`}>
                          {customer.full_name}
                        </h3>
                        <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'} mt-0.5`}>
                          {customer.phone}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-bold border ${badge.color} flex-shrink-0`}>
                        {badge.label}
                      </span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-xl p-3`}>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-1`}>
                          Rentals
                        </p>
                        <p className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                          {customer.totalRentals}
                        </p>
                      </div>
                      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-xl p-3`}>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-1`}>
                          Spent
                        </p>
                        <p className="text-lg font-bold text-green-500">
                          RM{customer.totalSpent.toFixed(0)}
                        </p>
                      </div>
                      <div className={`${isDarkMode ? 'bg-slate-800' : 'bg-slate-50'} rounded-xl p-3`}>
                        <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-1`}>
                          Active
                        </p>
                        <p className={`text-lg font-bold ${activeBookings > 0 ? 'text-blue-500' : isDarkMode ? 'text-slate-600' : 'text-slate-400'}`}>
                          {activeBookings}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2">
                      <a
                        href={`https://wa.me/${formatPhoneWithCountryCode(customer.phone)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl text-sm font-bold text-center transition-all duration-200 active:scale-95 shadow-md"
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                          </svg>
                          WhatsApp
                        </div>
                      </a>
                      <a
                        href={`tel:${customer.phone}`}
                        className={`py-3 rounded-xl text-sm font-bold text-center transition-all duration-200 active:scale-95 ${isDarkMode ? 'bg-slate-800 text-white hover:bg-slate-700' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'}`}
                      >
                        <div className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                          Call
                        </div>
                      </a>
                    </div>
                  </div>
                </div>
              );
            }) : (
              <div className={`${isDarkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'} rounded-2xl border shadow-sm p-12 text-center animate-fadeIn`}>
                <div className={`w-20 h-20 ${isDarkMode ? 'bg-slate-800' : 'bg-slate-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <svg className={`w-10 h-10 ${isDarkMode ? 'text-slate-600' : 'text-slate-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'} mb-2`}>
                  {searchTerm ? 'No customers found' : 'No customers yet'}
                </h3>
                <p className={`text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-500'}`}>
                  {searchTerm ? 'Try a different search term' : 'Customers will appear here as you create bookings'}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Sort & Filter Modal */}
        {showFilterModal && (
          <div 
            className="fixed inset-0 z-50 flex items-end animate-backdropFadeIn"
            onClick={() => setShowFilterModal(false)}
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" style={{ touchAction: 'none' }}></div>
            
            <div 
              className={`relative w-full ${isDarkMode ? 'bg-slate-900' : 'bg-white'} rounded-t-3xl shadow-2xl max-h-[70vh] overflow-hidden animate-modalSlideUp`}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Handle Bar */}
              <div className="flex justify-center pt-3 pb-2">
                <div className={`w-10 h-1 rounded-full ${isDarkMode ? 'bg-slate-700' : 'bg-slate-300'}`}></div>
              </div>

              {/* Header */}
              <div className={`px-6 py-4 border-b ${isDarkMode ? 'border-slate-800' : 'border-slate-200'}`}>
                <h3 className={`text-lg font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                  Sort & Filter
                </h3>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Sort By */}
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-3 block`}>
                    Sort By
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { value: 'full_name', label: 'Name' },
                      { value: 'totalSpent', label: 'Total Spent' },
                      { value: 'totalRentals', label: 'Rentals' },
                      { value: 'created_at', label: 'Join Date' },
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as any)}
                        className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                          sortBy === option.value
                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                            : isDarkMode
                              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sort Order */}
                <div>
                  <label className={`text-xs font-bold uppercase tracking-wider ${isDarkMode ? 'text-slate-500' : 'text-slate-500'} mb-3 block`}>
                    Order
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setSortOrder('asc')}
                      className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        sortOrder === 'asc'
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                          : isDarkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Ascending ↑
                    </button>
                    <button
                      onClick={() => setSortOrder('desc')}
                      className={`py-3 rounded-xl font-semibold text-sm transition-all duration-200 ${
                        sortOrder === 'desc'
                          ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-md'
                          : isDarkMode
                            ? 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      Descending ↓
                    </button>
                  </div>
                </div>

                {/* Apply Button */}
                <button
                  onClick={() => setShowFilterModal(false)}
                  className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-4 rounded-xl font-bold transition-all duration-200 active:scale-95 shadow-lg"
                >
                  Apply
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translate(-50%, -20px);
          }
          to {
            opacity: 1;
            transform: translate(-50%, 0);
          }
        }
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes backdropFadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translateY(100%);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out forwards;
        }
        .animate-fadeIn {
          animation: fadeIn 0.4s ease-out forwards;
          opacity: 0;
        }
        .animate-backdropFadeIn {
          animation: backdropFadeIn 0.3s ease-out forwards;
        }
        .animate-modalSlideUp {
          animation: modalSlideUp 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) forwards;
        }
      `}</style>
    </>
  );
}

