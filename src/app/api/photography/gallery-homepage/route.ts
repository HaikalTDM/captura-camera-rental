import { NextRequest, NextResponse } from 'next/server';
import { getActivePhotographyGalleryImages } from '@/lib/api/photography-gallery';

// GET - Fetch photography gallery images for homepage (10 images)
export async function GET(request: NextRequest) {
  try {
    console.log('Homepage Gallery API called');
    const images = await getActivePhotographyGalleryImages();
    const homepageImages = images
      .slice(0, 10)
      .map(({ id, title, image_url, alt_text, is_active, created_at }) => ({
        id,
        title,
        image_url,
        alt_text,
        is_active,
        created_at
      }));

    console.log(`Homepage query successful - found ${homepageImages.length} images`);
    return NextResponse.json({ images: homepageImages });

  } catch (error) {
    console.error('API error:', error);
    // Return empty array instead of error - graceful degradation
    return NextResponse.json({ images: [] });
  }
}
