import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { data: review, error: reviewLookupError } = await supabase
      .from('customer_reviews')
      .select('id, review_request_id')
      .eq('id', id)
      .single()

    if (reviewLookupError || !review) {
      return NextResponse.json(
        { success: false, error: 'Review not found' },
        { status: 404 },
      )
    }

    const { error: deleteReviewError } = await supabase
      .from('customer_reviews')
      .delete()
      .eq('id', id)

    if (deleteReviewError) {
      console.error('Delete review error:', deleteReviewError)
      return NextResponse.json(
        { success: false, error: 'Failed to delete review' },
        { status: 500 },
      )
    }

    const { error: deleteRequestError } = await supabase
      .from('review_requests')
      .delete()
      .eq('id', review.review_request_id)

    if (deleteRequestError) {
      console.error('Delete review request error:', deleteRequestError)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete review API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete review' },
      { status: 500 },
    )
  }
}
