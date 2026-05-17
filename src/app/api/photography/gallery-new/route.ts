import { NextRequest, NextResponse } from 'next/server';
import {
  addPhotographyGalleryImage,
  getActivePhotographyGalleryImages,
  getPhotographyGalleryImages
} from '@/lib/api/photography-gallery';

// GET - Fetch photography gallery images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : (isAdmin ? 50 : 20);

    console.log(`Gallery API called - isAdmin: ${isAdmin}, limit: ${limit}`);
    const images = isAdmin
      ? await getPhotographyGalleryImages()
      : await getActivePhotographyGalleryImages();

    const limitedImages = images.slice(0, Math.min(limit, isAdmin ? 100 : 20));

    console.log(`Query successful - found ${limitedImages.length} images`);
    return NextResponse.json({ images: limitedImages });
    
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST - Add new photography gallery image
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const category = formData.get('category') as string;
    const photographer_name = formData.get('photographer_name') as string;
    const location = formData.get('location') as string;
    const shoot_date = formData.get('shoot_date') as string;
    const is_featured = formData.get('is_featured') === 'true';
    const isPublic = formData.get('isPublic');

    // Validate required fields
    if (!file || !title || !category) {
      return NextResponse.json(
        { error: 'Missing required fields: file, title, category' },
        { status: 400 }
      );
    }

    // Check file size (limit to 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Please upload images smaller than 5MB.' },
        { status: 400 }
      );
    }

    // Convert file to base64 for storage
    const arrayBuffer = await file.arrayBuffer();
    const base64 = Buffer.from(arrayBuffer).toString('base64');
    const imageUrl = `data:${file.type};base64,${base64}`;

    // Determine aspect ratio from file dimensions
    let aspectRatio = 'square'; // Default
    if (file.name.toLowerCase().includes('portrait') || file.name.toLowerCase().includes('vertical')) {
      aspectRatio = 'portrait';
    } else if (file.name.toLowerCase().includes('landscape') || file.name.toLowerCase().includes('horizontal')) {
      aspectRatio = 'landscape';
    }
    
    const altText = title.replace(/[^a-zA-Z0-9\s]/g, '').toLowerCase();

    // Add to database
    const newImage = await addPhotographyGalleryImage({
      title,
      description: description || '',
      image_url: imageUrl,
      alt_text: altText,
      category: category as 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event',
      aspect_ratio: aspectRatio as 'portrait' | 'landscape' | 'square',
      is_featured: is_featured,
      is_active: isPublic !== null ? isPublic === 'true' : true,
      photographer_name: photographer_name || '',
      location: location || '',
      shoot_date: shoot_date || undefined,
      file_name: file.name,
      file_size: file.size
    });

    if (!newImage) {
      return NextResponse.json(
        { error: 'Failed to save image to database' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      image: newImage
    });

  } catch (error) {
    console.error('Photography gallery image creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
