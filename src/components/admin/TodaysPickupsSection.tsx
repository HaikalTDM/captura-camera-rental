'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getTodaysPickups, markEquipmentPickedUp, type PickupSchedule } from '@/lib/api/pickup-scheduling';
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter';
import toast from 'react-hot-toast';

interface TodaysPickupsSectionProps {
  onPickupUpdate?: () => void;
}

export default function TodaysPickupsSection({ onPickupUpdate }: TodaysPickupsSectionProps) {
  const [pickups, setPickups] = useState<PickupSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [processingPickup, setProcessingPickup] = useState<string | null>(null);

  useEffect(() => {
    loadTodaysPickups();
  }, []);

  const loadTodaysPickups = async () => {
    setIsLoading(true);
    try {
      const todaysPickups = await getTodaysPickups();
      setPickups(todaysPickups);
    } catch (error) {
      console.error('Error loading today\'s pickups:', error);
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
        toast.success('Equipment marked as picked up successfully');
      } else {
        toast.error('Failed to mark equipment as picked up. Please try again.');
      }
    } catch (error) {
      console.error('Error marking pickup:', error);
      toast.error('Error occurred while marking pickup. Please try again.');
    } finally {
      setProcessingPickup(null);
    }
  };

  const formatPhoneForWhatsApp = (phone: string) => {
    return formatPhoneWithCountryCode(phone);
  };

  const generateWhatsAppMessage = (pickup: PickupSchedule) => {
    return encodeURIComponent(
      `Hi ${pickup.customer_name}! 📷\n\n` +
      `This is a reminder that your camera rental pickup is scheduled for TODAY.\n\n` +
      `📋 Booking Details:\n` +
      `• Camera: ${pickup.camera_name}\n` +
      `• Pickup Date: ${new Date(pickup.pickup_date).toLocaleDateString()}\n` +
      `• Rental Period: ${new Date(pickup.start_date).toLocaleDateString()} - ${new Date(pickup.end_date).toLocaleDateString()}\n\n` +
      `Please come to our location to collect your camera equipment.\n\n` +
      `Thank you!\n` +
      `CAPTURA Camera Rental`
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📦</span>
            </span>
            Today's Pickups
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

  return (
    <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm">📦</span>
            </span>
            Today's Pickups
          </h3>
          <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
            {pickups.length} scheduled
          </div>
        </div>
        <p className="text-sm text-gray-600 mt-2">
          Customers scheduled to pick up cameras today (rental starts tomorrow)
        </p>
      </div>
      
      <div className="p-6">
        {pickups.length > 0 ? (
          <div className="space-y-4">
            {pickups.map((pickup) => (
              <div key={pickup.id} className="bg-green-50 rounded-lg border border-green-200 p-4">
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
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">
                      📷 <span className="font-medium">{pickup.camera_name}</span>
                      {pickup.camera_model && <span className="text-gray-500"> ({pickup.camera_model})</span>}
                    </p>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm mb-3">
                      <p className="text-green-600">
                        📦 <strong>Pickup:</strong> {new Date(pickup.pickup_date).toLocaleDateString()}
                      </p>
                      <p className="text-blue-600">
                        🎬 <strong>Rental:</strong> {new Date(pickup.start_date).toLocaleDateString()} - {new Date(pickup.end_date).toLocaleDateString()}
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
                      <p className="text-xs text-gray-600 mt-2 bg-gray-50 p-2 rounded">
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
                    
                    <button
                      onClick={() => handleMarkPickedUp(pickup.id)}
                      disabled={processingPickup === pickup.id}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-center whitespace-nowrap"
                    >
                      {processingPickup === pickup.id ? 'Processing...' : 'Mark Picked Up'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl">✅</span>
            </div>
            <p className="text-gray-600 font-medium">No pickups scheduled for today</p>
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
