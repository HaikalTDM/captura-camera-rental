import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { AdminReviewRecord } from '@/lib/reviews/types'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data: reviews, error } = await supabase
      .from('customer_reviews')
      .select(`
        id,
        customer_id,
        rating,
        review_text,
        status,
        featured,
        camera_name_snapshot,
        submitted_at,
        approved_at,
        customer:customers(full_name, email),
        request:review_requests(status, expires_at, token_last4)
      `)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error loading admin reviews:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to load reviews' },
        { status: 500 },
      )
    }

    const mappedReviews: AdminReviewRecord[] = (reviews || []).map((review) => {
      const customer = Array.isArray(review.customer) ? review.customer[0] : review.customer
      const request = Array.isArray(review.request) ? review.request[0] : review.request

      return {
        id: review.id,
        customerId: review.customer_id,
        customerName: customer?.full_name || 'Unknown Customer',
        customerEmail: customer?.email || null,
        rating: review.rating,
        review: review.review_text,
        status: review.status,
        featured: review.featured,
        cameraName: review.camera_name_snapshot || null,
        submittedAt: review.submitted_at,
        approvedAt: review.approved_at,
        requestStatus: request?.status,
        requestExpiresAt: request?.expires_at,
        tokenLast4: request?.token_last4,
      }
    })

    return NextResponse.json({
      success: true,
      reviews: mappedReviews,
      summary: {
        total: mappedReviews.length,
        pending: mappedReviews.filter((review) => review.status === 'pending').length,
        approved: mappedReviews.filter((review) => review.status === 'approved').length,
        rejected: mappedReviews.filter((review) => review.status === 'rejected').length,
        featured: mappedReviews.filter((review) => review.featured).length,
      },
    })
  } catch (error) {
    console.error('Admin reviews API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load reviews' },
      { status: 500 },
    )
  }
}
