import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

// GET - Fetch photography gallery images for homepage (10 images)
export async function GET(request: NextRequest) {
  try {
    console.log('Homepage Gallery API called');

    // Use Promise.race to implement our own timeout with better error handling
    const queryPromise = supabase
      .from('photography_gallery_images')
      .select('id, title, image_url, alt_text, is_active, created_at')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    // Create a timeout promise that resolves with a fallback response
    const timeoutPromise = new Promise<{ data: any[], error: null }>((resolve) => {
      setTimeout(() => {
        console.log('Database query taking longer than expected, but continuing...');
        // Don't reject - let the original query continue
        resolve({ data: [], error: null });
      }, 10000); // 10 second soft timeout
    });

    // Try the query, but if it takes too long, return empty array and let it continue in background
    const result = await Promise.race([queryPromise, timeoutPromise]);

    if (result.error) {
      console.error('Database error:', result.error);
      // Return empty array instead of error - let the beautiful loading animation show
      return NextResponse.json({ images: [] });
    }

    console.log(`Homepage query successful - found ${result.data?.length || 0} images`);
    return NextResponse.json({ images: result.data || [] });

  } catch (error) {
    console.error('API error:', error);
    // Return empty array instead of error - graceful degradation
    return NextResponse.json({ images: [] });
  }
}
