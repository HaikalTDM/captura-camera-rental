import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch individual image data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`Loading image data for ID: ${id}`);

    const { data, error } = await supabase
      .from('photography_gallery_images')
      .select('id, image_url')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error loading image:', error);
      return NextResponse.json(
        { error: 'Failed to load image' },
        { status: 500 }
      );
    }

    if (!data) {
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      id: data.id,
      image_url: data.image_url 
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
