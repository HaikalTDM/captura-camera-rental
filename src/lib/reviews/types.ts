export type ReviewRequestStatus = 'pending' | 'opened' | 'submitted' | 'expired' | 'cancelled'

export type CustomerReviewStatus = 'pending' | 'approved' | 'rejected' | 'hidden'

export interface PublicReview {
  id: string
  name: string
  rating: number
  review: string
  featured: boolean
  date: string
  cameraName?: string | null
}

export interface ReviewFormContext {
  requestId: string
  customerName: string
  cameraName?: string | null
  rentalPeriod?: string | null
  expiresAt: string
}

export interface AdminReviewRecord {
  id: string
  customerId: string
  customerName: string
  customerEmail?: string | null
  rating: number
  review: string
  status: CustomerReviewStatus
  featured: boolean
  cameraName?: string | null
  submittedAt: string
  approvedAt?: string | null
  requestStatus?: ReviewRequestStatus
  requestExpiresAt?: string | null
  tokenLast4?: string | null
}
