import { NextRequest, NextResponse } from 'next/server';
import {
  deletePhotographyGalleryImage,
  togglePhotographyImageFeatured,
  togglePhotographyImageStatus,
  updatePhotographyGalleryImage
} from '@/lib/api/photography-gallery';

// PUT - Update photography gallery image
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const { action, data: updateData } = body;

    if (action === 'toggle_active') {
      const success = await togglePhotographyImageStatus(id);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to toggle active status' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'toggle_featured') {
      const success = await togglePhotographyImageFeatured(id);
      if (!success) {
        return NextResponse.json(
          { error: 'Failed to toggle featured status' },
          { status: 500 }
        );
      }

      return NextResponse.json({ success: true });
    }

    if (action === 'update') {
      // Update image details
      const { title, description, category, photographer_name, location, shoot_date, is_featured, is_active } = updateData;

      // Validate required fields
      if (!title || !category) {
        return NextResponse.json(
          { error: 'Missing required fields: title, category' },
          { status: 400 }
        );
      }

      // Update the image
      const data = await updatePhotographyGalleryImage(id, {
        title,
        description: description || '',
        category,
        photographer_name: photographer_name || '',
        location: location || '',
        shoot_date: shoot_date || undefined,
        is_featured: is_featured ?? false,
        is_active: is_active ?? true
      });

      if (!data) {
        return NextResponse.json(
          { error: 'Failed to update image' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        image: data
      });
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Error updating image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Delete photography gallery image
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const success = await deletePhotographyGalleryImage(id);

    if (!success) {
      return NextResponse.json(
        { error: 'Failed to delete image' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting image:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
