import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    const { data: addons, error } = await supabase
      .from('photography_addons')
      .select(`
        id,
        name,
        description,
        category,
        price,
        is_active,
        sort_order
      `)
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      console.error('Error fetching photography add-ons:', error);
      return NextResponse.json(
        { error: 'Failed to fetch add-ons' },
        { status: 500 }
      );
    }

    return NextResponse.json({ addons: addons || [] });

  } catch (error) {
    console.error('Photography add-ons API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
