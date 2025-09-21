/**
 * Date utility functions to handle timezone-safe date operations
 * for the CAPTURA booking system
 */

/**
 * Format a Date object to YYYY-MM-DD string without timezone conversion
 * This ensures consistent date formatting across the application
 */
export function formatDateForAPI(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Create a Date object from YYYY-MM-DD string in local timezone
 * This prevents timezone conversion issues when parsing date strings
 */
export function parseDateFromAPI(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number);
  return new Date(year, month - 1, day);
}

/**
 * Get today's date in YYYY-MM-DD format
 */
export function getTodayString(): string {
  return formatDateForAPI(new Date());
}

/**
 * Check if a date is in the past (before today)
 */
export function isDateInPast(date: Date): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkDate = new Date(date);
  checkDate.setHours(0, 0, 0, 0);
  return checkDate < today;
}

/**
 * Calculate the number of days between two dates (inclusive)
 * This is used for rental duration calculations
 */
export function calculateDaysBetween(startDate: Date, endDate: Date): number {
  // Create new Date objects to avoid timezone issues
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  const timeDiff = end.getTime() - start.getTime();
  let totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

  // For same day rentals, set to 1 day
  if (totalDays <= 0) {
    totalDays = 1;
  } else {
    // For multi-day rentals, add 1 to include both start and end dates
    // Example: Sept 29-30 should be 2 days (29th and 30th)
    totalDays = totalDays + 1;
  }

  return totalDays;
}

/**
 * Generate an array of date strings between start and end dates (inclusive)
 * Used for calendar availability blocking
 */
export function generateDateRange(startDate: Date, endDate: Date): string[] {
  const dates: string[] = [];
  const start = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
  
  for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
    dates.push(formatDateForAPI(date));
  }
  
  return dates;
}

/**
 * Format a date for display in the UI
 */
export function formatDateForDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Format a date range for display
 */
export function formatDateRangeForDisplay(startDate: Date, endDate: Date): string {
  const start = formatDateForDisplay(startDate);
  const end = formatDateForDisplay(endDate);
  
  if (startDate.getTime() === endDate.getTime()) {
    return start;
  }
  
  return `${start} - ${end}`;
}
