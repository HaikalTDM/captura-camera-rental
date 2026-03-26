import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import {
  buildReviewRequestMessage,
  buildReviewWhatsAppUrl,
  generateReviewToken,
  hashReviewToken,
  resolveBaseUrl,
} from '@/lib/reviews/server'

interface ReviewRequestPayload {
  customerId?: string
  bookingId?: string | null
}

export async function POST(request: NextRequest) {
  try {
    const payload = (await request.json()) as ReviewRequestPayload
    const customerId = payload.customerId?.trim()
    const bookingId = payload.bookingId?.trim() || null

    if (!customerId) {
      return NextResponse.json(
        { success: false, error: 'Customer ID is required' },
        { status: 400 },
      )
    }

    const supabase = getSupabaseAdmin()

    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, full_name, name, phone, email')
      .eq('id', customerId)
      .single()

    if (customerError || !customer) {
      return NextResponse.json(
        { success: false, error: 'Customer not found' },
        { status: 404 },
      )
    }

    if (!customer.phone) {
      return NextResponse.json(
        { success: false, error: 'Customer does not have a phone number for WhatsApp' },
        { status: 400 },
      )
    }

    let bookingGroupId: string | null = null
    let cameraName: string | null = null

    if (bookingId) {
      const { data: booking, error: bookingError } = await supabase
        .from('bookings')
        .select('id, customer_id, camera_id, booking_group_id')
        .eq('id', bookingId)
        .single()

      if (bookingError || !booking || booking.customer_id !== customerId) {
        return NextResponse.json(
          { success: false, error: 'Booking not found for this customer' },
          { status: 404 },
        )
      }

      bookingGroupId = booking.booking_group_id || null

      if (booking.camera_id) {
        const { data: camera } = await supabase
          .from('cameras')
          .select('name')
          .eq('id', booking.camera_id)
          .single()

        cameraName = camera?.name || null
      }
    }

    const rawToken = generateReviewToken()
    const tokenHash = hashReviewToken(rawToken)
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()

    const { data: reviewRequest, error: insertError } = await supabase
      .from('review_requests')
      .insert({
        customer_id: customerId,
        booking_id: bookingId,
        booking_group_id: bookingGroupId,
        token_hash: tokenHash,
        token_last4: rawToken.slice(-4),
        status: 'pending',
        sent_via: 'whatsapp',
        expires_at: expiresAt,
      })
      .select('id')
      .single()

    if (insertError || !reviewRequest) {
      console.error('Error creating review request:', insertError)
      return NextResponse.json(
        { success: false, error: 'Failed to create review request' },
        { status: 500 },
      )
    }

    const customerName = customer.full_name || customer.name || customer.email || 'Customer'
    const reviewUrl = `${resolveBaseUrl(request)}/review/${rawToken}`
    const message = buildReviewRequestMessage(customerName, reviewUrl, cameraName)
    const whatsappUrl = buildReviewWhatsAppUrl(customer.phone, message)

    return NextResponse.json({
      success: true,
      reviewRequestId: reviewRequest.id,
      reviewUrl,
      whatsappUrl,
      message,
      expiresAt,
    })
  } catch (error) {
    console.error('Review request API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to create review request' },
      { status: 500 },
    )
  }
}
