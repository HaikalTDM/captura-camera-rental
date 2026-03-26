import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params
    const supabase = getSupabaseAdmin()

    const { data: review, error } = await supabase
      .from('customer_reviews')
      .update({
        status: 'approved',
        approved_at: new Date().toISOString(),
        approved_by: 'admin',
      })
      .eq('id', id)
      .select('id')
      .single()

    if (error || !review) {
      return NextResponse.json(
        { success: false, error: 'Failed to approve review' },
        { status: 500 },
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Approve review API error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to approve review' },
      { status: 500 },
    )
  }
}
