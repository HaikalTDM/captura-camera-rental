'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import { getAllBookings } from '@/lib/api/bookings';
import type { Booking } from '@/lib/supabase';

interface UpcomingReturnsSectionProps {
  onReturnUpdate?: () => void;
}

interface ReturnSchedule {
  id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  camera_name: string;
  camera_model?: string;
  return_date: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  booking_status: string;
  equipment_picked_up: boolean;
  equipment_returned: boolean;
  notes?: string;
  days_until_return: number;
  is_overdue: boolean;
}

export default function UpcomingReturnsSection({ onReturnUpdate }: UpcomingReturnsSectionProps) {
  const [returns, setReturns] = useState<ReturnSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUpcomingReturns();
  }, []);

  const loadUpcomingReturns = async () => {
    setIsLoading(true);
    try {
      const allBookings = await getAllBookings();
      
      // Filter for active rentals that need to be returned
      const activeRentals = allBookings.filter(booking => 
        booking.equipment_picked_up && 
        !booking.equipment_returned &&
        (booking.booking_status === 'confirmed' || booking.booking_status === 'approved')
      );

      // Calculate days until return and categorize
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const returnsWithCalculations = activeRentals.map(booking => {
        const returnDate = new Date(booking.end_date);
        returnDate.setHours(0, 0, 0, 0);
        
        const timeDiff = returnDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return {
          id: booking.id,
          customer_name: booking.customer?.full_name || 'Unknown Customer',
          customer_phone: booking.customer?.phone,
          customer_email: booking.customer?.email,
          camera_name: booking.camera?.name || booking.camera_name || 'Unknown Camera',
          camera_model: booking.camera?.model,
          return_date: booking.end_date,
          start_date: booking.start_date,
          end_date: booking.end_date,
          total_amount: booking.total_amount,
          booking_status: booking.booking_status,
          equipment_picked_up: booking.equipment_picked_up,
          equipment_returned: booking.equipment_returned,
          notes: booking.notes,
          days_until_return: daysDiff,
          is_overdue: daysDiff < 0
        };
      });

      // Filter for today's returns and upcoming returns (within next 7 days) + overdue
      const relevantReturns = returnsWithCalculations.filter(returnItem => 
        returnItem.days_until_return <= 7 || returnItem.is_overdue
      );

      // Sort by urgency: overdue first, then by days until return
      relevantReturns.sort((a, b) => {
        if (a.is_overdue && !b.is_overdue) return -1;
        if (!a.is_overdue && b.is_overdue) return 1;
        return a.days_until_return - b.days_until_return;
      });

      setReturns(relevantReturns);
    } catch (error) {
      console.error('Error loading upcoming returns:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    return formatPhoneWithCountryCode(phone);
  };

  const generateWhatsAppMessage = (returnItem: ReturnSchedule) => {
    const dayText = returnItem.is_overdue 
      ? `OVERDUE by ${Math.abs(returnItem.days_until_return)} day${Math.abs(returnItem.days_until_return) !== 1 ? 's' : ''}`
      : returnItem.days_until_return === 0 
      ? 'TODAY'
      : `in ${returnItem.days_until_return} day${returnItem.days_until_return !== 1 ? 's' : ''}`;

    return encodeURIComponent(
      `Hi ${returnItem.customer_name}! 📷\n\n` +
      `This is a ${returnItem.is_overdue ? 'urgent reminder' : 'reminder'} about your camera rental return.\n\n` +
      `📋 Return Details:\n` +
      `• Camera: ${returnItem.camera_name}\n` +
      `• Return Date: ${new Date(returnItem.return_date).toLocaleDateString()} (${dayText})\n` +
      `• Return Time: Before 10:00 PM\n\n` +
      (returnItem.is_overdue 
        ? `⚠️ Your equipment is overdue for return. Please return it as soon as possible to avoid additional late fees.\n\n`
        : `Please ensure the camera is returned by the due date to avoid any late fees.\n\n`
      ) +
      `Thank you!\n` +
      `CAPTURA Camera Rental`
    );
  };

  const getReturnStatusColor = (returnItem: ReturnSchedule) => {
    if (returnItem.is_overdue) {
      return 'bg-red-50 border-red-200';
    } else if (returnItem.days_until_return === 0) {
      return 'bg-orange-50 border-orange-200';
    } else if (returnItem.days_until_return <= 2) {
      return 'bg-yellow-50 border-yellow-200';
    } else {
      return 'bg-blue-50 border-blue-200';
    }
  };

  const getReturnUrgencyText = (returnItem: ReturnSchedule) => {
    if (returnItem.is_overdue) {
      return {
        text: `Overdue by ${Math.abs(returnItem.days_until_return)} day${Math.abs(returnItem.days_until_return) !== 1 ? 's' : ''}`,
        color: 'text-red-600',
        icon: '🚨'
      };
    } else if (returnItem.days_until_return === 0) {
      return {
        text: 'Due TODAY',
        color: 'text-orange-600',
        icon: '⏰'
      };
    } else if (returnItem.days_until_return === 1) {
      return {
        text: 'Due tomorrow',
        color: 'text-yellow-600',
        icon: '📅'
      };
    } else {
      return {
        text: `Due in ${returnItem.days_until_return} days`,
        color: 'text-blue-600',
        icon: '📆'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-orange-100">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📤</span>
            </span>
            Upcoming Returns
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-orange-50 to-red-50 p-6 border-b border-orange-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <span className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📤</span>
            </span>
            Upcoming Returns
          </h3>
          <div className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            {returns.length} due soon
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Equipment due for return today and within the next week
        </p>
      </div>
      
      <div className="p-6">
        {returns.length > 0 ? (
          <div className="space-y-4">
            {returns.map((returnItem) => {
              const urgency = getReturnUrgencyText(returnItem);
              
              return (
                <div key={returnItem.id} className={`rounded-lg border p-4 ${getReturnStatusColor(returnItem)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-slate-900 truncate">{returnItem.customer_name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgency.color} bg-white`}>
                          {urgency.icon} {urgency.text}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        📷 <span className="font-medium">{returnItem.camera_name}</span>
                        {returnItem.camera_model && <span className="text-gray-500"> ({returnItem.camera_model})</span>}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                        <p className="text-gray-600">
                          📅 <strong>Return:</strong> {new Date(returnItem.return_date).toLocaleDateString()}
                        </p>
                        <p className="text-gray-600">
                          🎬 <strong>Rental:</strong> {new Date(returnItem.start_date).toLocaleDateString()} - {new Date(returnItem.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        {returnItem.customer_phone && (
                          <span>📞 {returnItem.customer_phone}</span>
                        )}
                        {returnItem.customer_email && (
                          <span>✉️ {returnItem.customer_email}</span>
                        )}
                        <span>💰 RM{returnItem.total_amount}</span>
                      </div>
                      
                      {returnItem.notes && (
                        <p className="text-xs text-gray-600 mt-2 bg-white p-2 rounded">
                          📝 {returnItem.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Link
                        href={`/admin/bookings/${returnItem.id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 text-center whitespace-nowrap"
                      >
                        View Details
                      </Link>
                      
                      {returnItem.customer_phone && (
                        <a
                          href={`https://wa.me/${formatPhoneForWhatsApp(returnItem.customer_phone)}?text=${generateWhatsAppMessage(returnItem)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`text-white px-3 py-1 rounded text-sm text-center whitespace-nowrap ${
                            returnItem.is_overdue 
                              ? 'bg-red-500 hover:bg-red-600' 
                              : 'bg-orange-500 hover:bg-orange-600'
                          }`}
                        >
                          Return Reminder
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-gray-600 font-medium">No upcoming returns</p>
            <p className="text-sm text-gray-500 mt-1">All equipment returned on time! 🎉</p>
          </div>
        )}
      </div>
      
      {returns.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            💡 <strong>Return Policy:</strong> Equipment must be returned by 10:00 PM on the due date
          </p>
        </div>
      )}
    </div>
  );
}
