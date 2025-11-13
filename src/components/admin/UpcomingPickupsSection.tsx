'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { markEquipmentPickedUp } from '@/lib/api/pickup-scheduling';
import { getAllBookings } from '@/lib/api/bookings';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import type { Booking } from '@/lib/supabase';

interface UpcomingPickupsSectionProps {
  onPickupUpdate?: () => void;
}

interface PickupSchedule {
  id: string;
  customer_name: string;
  customer_phone?: string;
  customer_email?: string;
  camera_name: string;
  camera_model?: string;
  pickup_date: string;
  start_date: string;
  end_date: string;
  total_amount: number;
  booking_status: string;
  equipment_picked_up: boolean;
  notes?: string;
  days_until_pickup: number;
  is_today: boolean;
}

export default function UpcomingPickupsSection({ onPickupUpdate }: UpcomingPickupsSectionProps) {
  const [pickups, setPickups] = useState<PickupSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPickup, setProcessingPickup] = useState<string | null>(null);

  useEffect(() => {
    loadUpcomingPickups();
  }, []);

  const loadUpcomingPickups = async () => {
    setIsLoading(true);
    try {
      const allBookings = await getAllBookings();
      
      // Filter for confirmed/approved bookings that haven't been picked up yet
      const pendingPickups = allBookings.filter(booking => 
        (booking.booking_status === 'confirmed' || booking.booking_status === 'approved') &&
        !booking.equipment_picked_up
      );

      // Calculate pickup dates and days until pickup
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const pickupsWithCalculations = pendingPickups.map(booking => {
        // Use pickup_date directly from database (already calculated by trigger as start_date - 1 day)
        // Parse dates in local timezone to avoid timezone shift issues
        const pickupDateStr = booking.pickup_date || (() => {
          // Fallback: calculate if pickup_date is missing
          const startDate = new Date(booking.start_date + 'T00:00:00');
          startDate.setDate(startDate.getDate() - 1);
          return startDate.toISOString().split('T')[0];
        })();
        
        // Parse as local date (YYYY-MM-DD format)
        const [year, month, day] = pickupDateStr.split('-').map(Number);
        const pickupDate = new Date(year, month - 1, day);
        
        const timeDiff = pickupDate.getTime() - today.getTime();
        const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

        return {
          id: booking.id,
          customer_name: booking.customer?.full_name || 'Unknown Customer',
          customer_phone: booking.customer?.phone,
          customer_email: booking.customer?.email,
          camera_name: booking.camera?.name || booking.camera_name || 'Unknown Camera',
          camera_model: booking.camera?.model,
          pickup_date: pickupDateStr, // Use the string directly from database
          start_date: booking.start_date,
          end_date: booking.end_date,
          total_amount: booking.total_amount,
          booking_status: booking.booking_status,
          equipment_picked_up: booking.equipment_picked_up,
          notes: booking.notes,
          days_until_pickup: daysDiff,
          is_today: daysDiff === 0
        };
      });

      // Filter for today's pickups and upcoming pickups (within next 7 days)
      const relevantPickups = pickupsWithCalculations.filter(pickup => 
        pickup.days_until_pickup >= 0 && pickup.days_until_pickup <= 7
      );

      // Sort by urgency: today first, then by days until pickup
      relevantPickups.sort((a, b) => {
        if (a.is_today && !b.is_today) return -1;
        if (!a.is_today && b.is_today) return 1;
        return a.days_until_pickup - b.days_until_pickup;
      });

      setPickups(relevantPickups);
    } catch (error) {
      console.error('Error loading upcoming pickups:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPickedUp = async (bookingId: string) => {
    setProcessingPickup(bookingId);
    try {
      const success = await markEquipmentPickedUp(bookingId, 'Marked as picked up from admin dashboard');
      if (success) {
        // Remove from local state
        setPickups(prev => prev.filter(p => p.id !== bookingId));
        // Notify parent component
        onPickupUpdate?.();
      } else {
        alert('Failed to mark equipment as picked up. Please try again.');
      }
    } catch (error) {
      console.error('Error marking pickup:', error);
      alert('Error occurred while marking pickup. Please try again.');
    } finally {
      setProcessingPickup(null);
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    return formatPhoneWithCountryCode(phone);
  };

  const generateWhatsAppMessage = (pickup: PickupSchedule) => {
    const dayText = pickup.is_today 
      ? 'TODAY'
      : pickup.days_until_pickup === 1 
      ? 'tomorrow'
      : `in ${pickup.days_until_pickup} days`;

    // Parse dates in local timezone to avoid timezone issues
    const formatDate = (dateStr: string) => {
      const [y, m, d] = dateStr.split('-').map(Number);
      return new Date(y, m - 1, d).toLocaleDateString('en-MY', { day: 'numeric', month: 'numeric', year: 'numeric' });
    };

    return encodeURIComponent(
      `Hi ${pickup.customer_name}! 📷\n\n` +
      `This is a reminder that your camera rental pickup is scheduled for ${dayText.toUpperCase()}.\n\n` +
      `📋 Pickup Details:\n` +
      `• Camera: ${pickup.camera_name}\n` +
      `• Pickup Date: ${formatDate(pickup.pickup_date)}\n` +
      `• Rental Period: ${formatDate(pickup.start_date)} - ${formatDate(pickup.end_date)}\n\n` +
      `Please come to our location to collect your camera equipment.\n\n` +
      `Thank you!\n` +
      `CAPTURA Camera Rental`
    );
  };

  const getPickupStatusColor = (pickup: PickupSchedule) => {
    if (pickup.is_today) {
      return 'bg-green-50 border-green-200';
    } else if (pickup.days_until_pickup <= 2) {
      return 'bg-blue-50 border-blue-200';
    } else {
      return 'bg-gray-50 border-gray-200';
    }
  };

  const getPickupUrgencyText = (pickup: PickupSchedule) => {
    if (pickup.is_today) {
      return {
        text: 'TODAY',
        color: 'text-green-600',
        icon: '📦'
      };
    } else if (pickup.days_until_pickup === 1) {
      return {
        text: 'Tomorrow',
        color: 'text-blue-600',
        icon: '📅'
      };
    } else {
      return {
        text: `In ${pickup.days_until_pickup} days`,
        color: 'text-gray-600',
        icon: '📆'
      };
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📦</span>
            </span>
            Upcoming Pickups
          </h3>
        </div>
        <div className="p-6">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          </div>
        </div>
      </div>
    );
  }

  const todayPickups = pickups.filter(p => p.is_today);
  const upcomingPickups = pickups.filter(p => !p.is_today);

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900 flex items-center gap-3">
            <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📦</span>
            </span>
            Upcoming Pickups
          </h3>
          <div className="flex gap-2">
            {todayPickups.length > 0 && (
              <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                {todayPickups.length} today
              </div>
            )}
            {upcomingPickups.length > 0 && (
              <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {upcomingPickups.length} upcoming
              </div>
            )}
          </div>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Equipment pickups scheduled for today and the next week
        </p>
      </div>
      
      <div className="p-6">
        {pickups.length > 0 ? (
          <div className="space-y-4">
            {pickups.map((pickup) => {
              const urgency = getPickupUrgencyText(pickup);
              
              return (
                <div key={pickup.id} className={`rounded-lg border p-4 ${getPickupStatusColor(pickup)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-gray-900 truncate">{pickup.customer_name}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          pickup.booking_status === 'confirmed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-blue-100 text-blue-800'
                        }`}>
                          {pickup.booking_status}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${urgency.color} bg-white`}>
                          {urgency.icon} {urgency.text}
                        </span>
                      </div>
                      
                      <p className="text-sm text-gray-600 mb-2">
                        📷 <span className="font-medium">{pickup.camera_name}</span>
                        {pickup.camera_model && <span className="text-gray-500"> ({pickup.camera_model})</span>}
                      </p>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                        <p className="text-green-600">
                          📦 <strong>Pickup:</strong> {(() => {
                            const [y, m, d] = pickup.pickup_date.split('-').map(Number);
                            return new Date(y, m - 1, d).toLocaleDateString('en-MY', { day: 'numeric', month: 'numeric', year: 'numeric' });
                          })()}
                        </p>
                        <p className="text-blue-600">
                          🎬 <strong>Rental:</strong> {(() => {
                            const [y1, m1, d1] = pickup.start_date.split('-').map(Number);
                            const [y2, m2, d2] = pickup.end_date.split('-').map(Number);
                            return `${new Date(y1, m1 - 1, d1).toLocaleDateString('en-MY', { day: 'numeric', month: 'numeric', year: 'numeric' })} - ${new Date(y2, m2 - 1, d2).toLocaleDateString('en-MY', { day: 'numeric', month: 'numeric', year: 'numeric' })}`;
                          })()}
                        </p>
                      </div>
                      
                      <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                        {pickup.customer_phone && (
                          <span>📞 {pickup.customer_phone}</span>
                        )}
                        {pickup.customer_email && (
                          <span>✉️ {pickup.customer_email}</span>
                        )}
                        <span>💰 RM{pickup.total_amount}</span>
                      </div>
                      
                      {pickup.notes && (
                        <p className="text-xs text-gray-600 mt-2 bg-white p-2 rounded">
                          📝 {pickup.notes}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex flex-col gap-2 ml-4">
                      <Link
                        href={`/admin/bookings/${pickup.id}`}
                        className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 text-center whitespace-nowrap"
                      >
                        View Details
                      </Link>
                      
                      {pickup.customer_phone && (
                        <a
                          href={`https://wa.me/${formatPhoneForWhatsApp(pickup.customer_phone)}?text=${generateWhatsAppMessage(pickup)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600 text-center whitespace-nowrap"
                        >
                          WhatsApp
                        </a>
                      )}
                      
                      {pickup.is_today && (
                        <button
                          onClick={() => handleMarkPickedUp(pickup.id)}
                          disabled={processingPickup === pickup.id}
                          className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-center whitespace-nowrap"
                        >
                          {processingPickup === pickup.id ? 'Processing...' : 'Mark Picked Up'}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-gray-600 font-medium">No upcoming pickups</p>
            <p className="text-sm text-gray-500 mt-1">All caught up! 🎉</p>
          </div>
        )}
      </div>
      
      {pickups.length > 0 && (
        <div className="bg-gray-50 px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-gray-500 text-center">
            💡 <strong>Business Rule:</strong> Customers pick up cameras 1 day before rental start date
          </p>
        </div>
      )}
    </div>
  );
}
