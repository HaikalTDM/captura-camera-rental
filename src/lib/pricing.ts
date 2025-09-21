import { Camera } from '@/types';
import { calculateDaysBetween } from './dateUtils';

export function calculateRentalCost(
  camera: Camera,
  startDate: Date,
  endDate: Date
): {
  totalDays: number;
  dailyRate: number;
  totalCost: number;
} {
  // Use the utility function for consistent date calculation
  const totalDays = calculateDaysBetween(startDate, endDate);

  // Apply discount for 3+ days
  const dailyRate = totalDays >= 3 ? camera.discountRate : camera.dailyRate;
  const totalCost = dailyRate * totalDays;

  return {
    totalDays,
    dailyRate,
    totalCost,
  };
}

export function formatCurrency(amount: number): string {
  return `RM${amount.toFixed(0)}`;
}
