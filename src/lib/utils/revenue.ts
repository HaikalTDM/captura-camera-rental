/**
 * Revenue calculation utilities
 * Handles separation of Mother's R50 revenue from main CAPTURA business
 */

import { Booking, Camera } from '@/lib/supabase';

/**
 * Check if a booking is for Mother's R50 camera
 */
export function isMotherBooking(booking: Booking, cameras?: Camera[]): boolean {
  // Check by camera name if camera object is available
  if (booking.camera?.name === 'Canon R50 - Mother' || booking.camera?.name === 'R50 (ii)') {
    return true;
  }

  // Check by camera_id if cameras array is provided
  if (cameras && booking.camera_id) {
    const camera = cameras.find(c => c.id === booking.camera_id);
    return camera?.name === 'Canon R50 - Mother' || camera?.name === 'R50 (ii)';
  }

  return false;
}

/**
 * Filter out Mother's R50 bookings from a list of bookings
 * Use this for main CAPTURA revenue calculations
 */
export function excludeMotherBookings(bookings: Booking[], cameras?: Camera[]): Booking[] {
  return bookings.filter(booking => !isMotherBooking(booking, cameras));
}

/**
 * Filter to get only Mother's R50 bookings
 */
export function getMotherBookings(bookings: Booking[], cameras?: Camera[]): Booking[] {
  return bookings.filter(booking => isMotherBooking(booking, cameras));
}

/**
 * Calculate revenue from bookings (excluding refundable deposits)
 */
export function calculateRevenue(bookings: Booking[]): number {
  return bookings
    .filter(b => b.deposit_paid && b.final_payment_paid)
    .reduce((sum, b) => {
      // New payment system: deposit is RM100 (refundable), final_payment is actual revenue
      // Old system: total_amount includes deposit, so subtract it
      const isNewPaymentSystem = b.deposit_amount === 100;
      return sum + (isNewPaymentSystem ? b.final_payment_amount : (b.total_amount - b.deposit_amount));
    }, 0);
}

/**
 * Calculate CAPTURA revenue (excluding Mother's R50)
 */
export function calculateCapturaRevenue(bookings: Booking[], cameras?: Camera[]): number {
  const capturaBookings = excludeMotherBookings(bookings, cameras);
  return calculateRevenue(capturaBookings);
}

/**
 * Calculate Mother's R50 revenue only
 */
export function calculateMotherRevenue(bookings: Booking[], cameras?: Camera[]): number {
  const motherBookings = getMotherBookings(bookings, cameras);
  return calculateRevenue(motherBookings);
}

/**
 * Get Mother's R50 camera from cameras list
 */
export function getMotherCamera(cameras: Camera[]): Camera | undefined {
  return cameras.find(c => c.name === 'Canon R50 - Mother');
}

/**
 * Get Mother's R50 camera ID
 */
export async function getMotherCameraId(cameras: Camera[]): Promise<string | null> {
  const motherCamera = getMotherCamera(cameras);
  return motherCamera?.id || null;
}

