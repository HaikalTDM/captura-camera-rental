import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// POST - Clear all sample images (images with unsplash URLs)
export async function POST() {
  try {
    // Delete all images that contain 'unsplash.com' in the URL
    const { error } = await supabase
      .from('photography_gallery')
      .delete()
      .like('image_url', '%unsplash.com%');

    if (error) {
      console.error('Error clearing sample images:', error);
      return NextResponse.json(
        { error: 'Failed to clear sample images' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Sample images cleared successfully'
    });

  } catch (error) {
    console.error('Clear sample images error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
