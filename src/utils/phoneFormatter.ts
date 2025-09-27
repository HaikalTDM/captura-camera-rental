// Phone number formatting utilities for Malaysian numbers
// Ensures all phone numbers have country code "60"

/**
 * Formats a phone number to include Malaysian country code "60"
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number with country code
 */
export function formatPhoneWithCountryCode(phoneNumber: string): string {
  if (!phoneNumber) return '';
  
  // Remove all non-digit characters
  const cleaned = phoneNumber.replace(/\D/g, '');
  
  // If already has country code 60, return as is
  if (cleaned.startsWith('60')) {
    return cleaned;
  }
  
  // If starts with 0, remove the 0 and add 60
  if (cleaned.startsWith('0')) {
    return '60' + cleaned.substring(1);
  }
  
  // If doesn't start with 0 or 60, add 60
  return '60' + cleaned;
}

/**
 * Formats a phone number for display (with + prefix)
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number with + prefix
 */
export function formatPhoneForDisplay(phoneNumber: string): string {
  const formatted = formatPhoneWithCountryCode(phoneNumber);
  return formatted ? '+' + formatted : '';
}

/**
 * Validates if a phone number is a valid Malaysian number
 * @param phoneNumber - The phone number to validate
 * @returns True if valid Malaysian number
 */
export function isValidMalaysianPhone(phoneNumber: string): boolean {
  const formatted = formatPhoneWithCountryCode(phoneNumber);
  
  // Malaysian mobile numbers are typically 10-11 digits after country code
  // Format: 60 + 1X-XXXX-XXXX (10 digits) or 60 + 1XX-XXXX-XXXX (11 digits)
  const malaysianMobileRegex = /^60(1[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-9]|7[0-9]|8[0-9]|9[0-9])\d{7,8}$/;
  
  return malaysianMobileRegex.test(formatted);
}

/**
 * Gets WhatsApp URL for a phone number
 * @param phoneNumber - The phone number to create WhatsApp URL for
 * @returns WhatsApp URL
 */
export function getWhatsAppUrl(phoneNumber: string): string {
  const formatted = formatPhoneWithCountryCode(phoneNumber);
  return `https://wa.me/${formatted}`;
}
