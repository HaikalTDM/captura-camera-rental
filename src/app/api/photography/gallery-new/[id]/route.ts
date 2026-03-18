import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

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
      // Toggle active status
      const { data: currentImage, error: fetchError } = await supabase
        .from('photography_gallery_images')
        .select('is_active')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching current image status:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch current status' },
          { status: 500 }
        );
      }

      const { data, error } = await supabase
        .from('photography_gallery_images')
        .update({
          is_active: !currentImage.is_active,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling active status:', error);
        return NextResponse.json(
          { error: 'Failed to toggle active status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        image: data
      });
    }

    if (action === 'toggle_featured') {
      // Toggle featured status
      const { data: currentImage, error: fetchError } = await supabase
        .from('photography_gallery_images')
        .select('is_featured')
        .eq('id', id)
        .single();

      if (fetchError) {
        console.error('Error fetching current image status:', fetchError);
        return NextResponse.json(
          { error: 'Failed to fetch current status' },
          { status: 500 }
        );
      }

      const { data, error } = await supabase
        .from('photography_gallery_images')
        .update({
          is_featured: !currentImage.is_featured,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error toggling featured status:', error);
        return NextResponse.json(
          { error: 'Failed to toggle featured status' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        image: data
      });
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
      const { data, error } = await supabase
        .from('photography_gallery_images')
        .update({
          title,
          description: description || '',
          category,
          photographer_name: photographer_name || '',
          location: location || '',
          shoot_date: shoot_date || null,
          is_featured: is_featured ?? false,
          is_active: is_active ?? true,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error('Error updating image:', error);
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

    // Delete the image
    const { error } = await supabase
      .from('photography_gallery_images')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting image:', error);
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
