import { NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import type { PublicReview } from '@/lib/reviews/types'

export async function GET() {
  try {
    const supabase = getSupabaseAdmin()

    const { data, error } = await supabase
      .from('customer_reviews')
      .select('id, display_name_masked, rating, review_text, featured, submitted_at, camera_name_snapshot')
      .eq('status', 'approved')
      .order('featured', { ascending: false })
      .order('approved_at', { ascending: false })
      .order('submitted_at', { ascending: false })
      .limit(40)

    if (error) {
      console.error('Error loading public reviews:', error)
      return NextResponse.json({ reviews: [] as PublicReview[] })
    }

    const reviews: PublicReview[] = (data || []).map((review) => ({
      id: review.id,
      name: review.display_name_masked,
      rating: review.rating,
      review: review.review_text,
      featured: review.featured,
      date: review.submitted_at,
      cameraName: review.camera_name_snapshot,
    }))

    return NextResponse.json({ reviews })
  } catch (error) {
    console.error('Public reviews API error:', error)
    return NextResponse.json({ reviews: [] as PublicReview[] })
  }
}
