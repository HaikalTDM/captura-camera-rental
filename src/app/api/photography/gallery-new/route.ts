import { NextRequest, NextResponse } from 'next/server';
import { addPhotographyGalleryImage } from '@/lib/api/photography-gallery';
import { supabase } from '@/lib/supabase';

// GET - Fetch photography gallery images
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const isAdmin = searchParams.get('admin') === 'true';

    console.log(`Gallery API called - isAdmin: ${isAdmin}`);

    // For admin, we can load metadata first and images on demand
    // For client, we need the images but can limit the number
    let selectFields = isAdmin 
      ? 'id, title, description, alt_text, category, aspect_ratio, is_featured, is_active, created_at, photographer_name, location, shoot_date'
      : 'id, title, description, image_url, alt_text, category, aspect_ratio, is_featured, is_active, created_at';

    let query = supabase
      .from('photography_gallery_images')
      .select(selectFields)
      .order('created_at', { ascending: false })
      .limit(isAdmin ? 50 : 10); // Admin gets more records but without images

    // If not admin, only fetch active images
    if (!isAdmin) {
      query = query.eq('is_active', true);
    }

    console.log('Executing database query...');
    const { data, error } = await query;

    if (error) {
      console.error('Database error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch gallery images', details: error.message },
        { status: 500 }
      );
    }

    console.log(`Query successful - found ${data?.length || 0} images`);
    return NextResponse.json({ images: data || [] });
    
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
