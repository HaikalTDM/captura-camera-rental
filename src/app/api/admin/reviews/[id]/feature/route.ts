import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

interface FeaturePayload {
  featured?: boolean
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const payload = (await request.json()) as FeaturePayload
    const featured = Boolean(payload.featured)
    const supabase = getSupabaseAdmin()

    const { data: review, error } = await supabase
      .from('customer_reviews')
      .update({ featured })
      .eq('id', id)
      .eq('status', 'approved')
      .select('id')
      .single()

    if (error || !review) {
      return NextResponse.json(
        { success: false, error: 'Only approved reviews can be featured' },
        { status: 400 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Feature review API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update feature status' },
      { status: 500 },
    )
  }
}
