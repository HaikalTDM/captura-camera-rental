import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import {
  hashReviewToken,
  isReviewRequestExpired,
  maskCustomerName,
} from '@/lib/reviews/server'

interface SubmitReviewPayload {
  token?: string
  rating?: number
  reviewText?: string
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as SubmitReviewPayload
    const token = payload.token?.trim()
    const rating = Number(payload.rating)
    const reviewText = payload.reviewText?.trim()

    if (!token || !reviewText || Number.isNaN(rating)) {
      return NextResponse.json(
        { success: false, error: 'Token, rating, and review text are required' },
        { status: 400 },
      )
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json(
        { success: false, error: 'Rating must be between 1 and 5' },
        { status: 400 },
      )
    }

    if (reviewText.length < 10) {
      return NextResponse.json(
        { success: false, error: 'Please write at least 10 characters for the review' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseAdmin()
    const tokenHash = hashReviewToken(token)

    const { data: reviewRequest, error: requestError } = await supabase
      .from('review_requests')
      .select('id, customer_id, booking_id, booking_group_id, status, expires_at')
      .eq('token_hash', tokenHash)
      .single()

    if (requestError || !reviewRequest) {
      return NextResponse.json(
        { success: false, error: 'Review link not found' },
        { status: 404 },
      )
    }

    if (isReviewRequestExpired(reviewRequest.expires_at)) {
      await supabase
        .from('review_requests')
        .update({ status: 'expired' })
        .eq('id', reviewRequest.id)

      return NextResponse.json(
        { success: false, error: 'This review link has expired' },
        { status: 410 },
      )
    }

    if (reviewRequest.status === 'submitted') {
      return NextResponse.json(
        { success: false, error: 'This review has already been submitted' },
        { status: 409 },
      )
    }

    const { data: existingReview } = await supabase
      .from('customer_reviews')
      .select('id')
      .eq('review_request_id', reviewRequest.id)
      .maybeSingle()

    if (existingReview) {
      return NextResponse.json(
        { success: false, error: 'This review has already been submitted' },
        { status: 409 },
      )
    }

    const { data: customer } = await supabase
      .from('customers')
      .select('full_name, name, email')
      .eq('id', reviewRequest.customer_id)
      .single()

    let cameraName: string | null = null

    if (reviewRequest.booking_id) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('camera_id')
        .eq('id', reviewRequest.booking_id)
        .single()

      if (booking?.camera_id) {
        const { data: camera } = await supabase
          .from('cameras')
          .select('name')
          .eq('id', booking.camera_id)
          .single()

        cameraName = camera?.name || null
      }
    }

    const customerName = customer?.full_name || customer?.name || customer?.email || 'Customer'
    const maskedName = maskCustomerName(customerName)

    const { data: review, error: insertError } = await supabase
      .from('customer_reviews')
      .insert({
        review_request_id: reviewRequest.id,
        customer_id: reviewRequest.customer_id,
        booking_id: reviewRequest.booking_id,
        booking_group_id: reviewRequest.booking_group_id,
        rating,
        review_text: reviewText,
        display_name_masked: maskedName,
        camera_name_snapshot: cameraName,
        status: 'pending',
        featured: false,
        submitted_at: new Date().toISOString(),
      })
      .select('id')
      .single()

    if (insertError || !review) {
      console.error('Error saving review:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to submit review' },
        { status: 500 },
      )
    }

    const submittedAt = new Date().toISOString()
    await supabase
      .from('review_requests')
      .update({
        status: 'submitted',
        submitted_at: submittedAt,
      })
      .eq('id', reviewRequest.id)

    return NextResponse.json({
      success: true,
      reviewId: review.id,
      message: 'Thanks for your review. We’ll publish it after a quick approval check.',
    })
  } catch (error) {
    console.error('Review submit API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to submit review' },
      { status: 500 },
    )
  }
}
