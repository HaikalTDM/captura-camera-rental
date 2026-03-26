import crypto from 'node:crypto'
import { formatPhoneWithCountryCode } from '@/utils/phoneFormatter'
import { extractFirstName, maskCustomerName } from './maskName'

export { extractFirstName, maskCustomerName }

export function generateReviewToken(): string {
  return crypto.randomBytes(24).toString('base64url')
}

export function hashReviewToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export function resolveBaseUrl(request: Request): string {
  return new URL(request.url).origin
}

export function isReviewRequestExpired(expiresAt: string | null | undefined): boolean {
  if (!expiresAt) return true
  return new Date(expiresAt).getTime() < Date.now()
}

export function formatRentalWindow(startDate?: string | null, endDate?: string | null): string | null {
  if (!startDate || !endDate) return null

  const formatter = new Intl.DateTimeFormat('en-MY', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  return `${formatter.format(new Date(startDate))} - ${formatter.format(new Date(endDate))}`
}

export function buildReviewRequestMessage(
  customerName: string,
  reviewUrl: string,
  cameraName?: string | null,
): string {
  const firstName = extractFirstName(customerName) || 'there'
  const gearLine = cameraName ? `\nGear: ${cameraName}` : ''

  return `Hi ${firstName}, thanks again for renting with CAPTURA.

We’d love a quick review about your experience.${gearLine}

Leave your review here:
${reviewUrl}

It only takes a minute and really helps future customers decide with confidence.`
}

export function buildReviewWhatsAppUrl(phone: string, message: string): string {
  const formattedPhone = formatPhoneWithCountryCode(phone)
  return `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`
}
