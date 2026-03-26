import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import {
  extractFirstName,
  formatRentalWindow,
  hashReviewToken,
  isReviewRequestExpired,
} from '@/lib/reviews/server'
import type { ReviewFormContext } from '@/lib/reviews/types'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> },
) {
  try {
    const { token } = await params
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

    const { data: customer } = await supabase
      .from('customers')
      .select('full_name, name, email')
      .eq('id', reviewRequest.customer_id)
      .single()

    let cameraName: string | null = null
    let rentalPeriod: string | null = null

    if (reviewRequest.booking_id) {
      const { data: booking } = await supabase
        .from('bookings')
        .select('camera_id, start_date, end_date')
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

      rentalPeriod = formatRentalWindow(booking?.start_date, booking?.end_date)
    }

    if (reviewRequest.status === 'pending') {
      await supabase
        .from('review_requests')
        .update({
          status: 'opened',
          opened_at: new Date().toISOString(),
        })
        .eq('id', reviewRequest.id)
    }

    const customerName = customer?.full_name || customer?.name || customer?.email || 'Customer'
    const context: ReviewFormContext = {
      requestId: reviewRequest.id,
      customerName: extractFirstName(customerName) || customerName,
      cameraName,
      rentalPeriod,
      expiresAt: reviewRequest.expires_at,
    }

    return NextResponse.json({
      success: true,
      context,
    })
  } catch (error) {
    console.error('Review form API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to load review form' },
      { status: 500 },
    )
  }
}
