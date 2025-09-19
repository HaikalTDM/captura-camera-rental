import { Camera } from '@/types';

export function calculateRentalCost(
  camera: Camera,
  startDate: Date,
  endDate: Date
): {
  totalDays: number;
  dailyRate: number;
  totalCost: number;
} {
  const timeDiff = endDate.getTime() - startDate.getTime();
  const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1; // Include both start and end dates
  
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
