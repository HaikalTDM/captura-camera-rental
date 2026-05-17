import { NextRequest, NextResponse } from 'next/server';
import { getPhotographyGalleryImages } from '@/lib/api/photography-gallery';

// GET - Fetch individual image data
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    console.log(`Loading image data for ID: ${id}`);

    const data = (await getPhotographyGalleryImages()).find(image => image.id === id);

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
