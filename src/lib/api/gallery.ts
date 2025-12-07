import { supabase } from '../supabase'

export interface GalleryImage {
  id: string
  customer_name: string
  camera_used: string
  location: string
  image_url: string
  alt_text: string
  is_active: boolean
  upload_date: string
  created_at: string
  updated_at: string
}

// Get all gallery images
export async function getGalleryImages(): Promise<GalleryImage[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching gallery images:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getGalleryImages:', error)
    return []
  }
}

// Get only active gallery images (for main website)
export async function getActiveGalleryImages(): Promise<GalleryImage[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching active gallery images:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getActiveGalleryImages:', error)
    return []
  }
}

// Lightweight version for homepage - only essential fields to reduce page size
export async function getGalleryImagesLightweight(): Promise<Pick<GalleryImage, 'id' | 'customer_name' | 'camera_used' | 'location' | 'image_url' | 'alt_text'>[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('id, customer_name, camera_used, location, image_url, alt_text')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10) // Only fetch what we need

    if (error) {
      console.error('Error fetching lightweight gallery images:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getGalleryImagesLightweight:', error)
    return []
  }
}

// Add new gallery image
export async function addGalleryImage(imageData: {
  customer_name: string
  camera_used: string
  location: string
  image_url: string
  alt_text: string
  upload_date: string
}): Promise<GalleryImage | null> {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .insert([imageData])
      .select()
      .single()

    if (error) {
      console.error('Error adding gallery image:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in addGalleryImage:', error)
    return null
  }
}

// Toggle image active status
export async function toggleImageStatus(id: string): Promise<boolean> {
  try {
    // First get current status
    const { data: currentImage, error: fetchError } = await supabase
      .from('gallery_images')
      .select('is_active')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching current image status:', fetchError)
      return false
    }

    // Toggle the status
    const { error: updateError } = await supabase
      .from('gallery_images')
      .update({ is_active: !currentImage.is_active })
      .eq('id', id)

    if (updateError) {
      console.error('Error toggling image status:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in toggleImageStatus:', error)
    return false
  }
}

// Delete gallery image
export async function deleteGalleryImage(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('gallery_images')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting gallery image:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteGalleryImage:', error)
    return false
  }
}

// Upload image (temporary base64 solution)
export async function uploadImage(file: File): Promise<string | null> {
  try {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error in uploadImage:', error)
    return null
  }
}

// Get gallery statistics
export async function getGalleryStats(): Promise<{
  total: number
  active: number
  inactive: number
}> {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('is_active')

    if (error) {
      console.error('Error fetching gallery stats:', error)
      return { total: 0, active: 0, inactive: 0 }
    }

    const total = data.length
    const active = data.filter(img => img.is_active).length
    const inactive = total - active

    return { total, active, inactive }
  } catch (error) {
    console.error('Error in getGalleryStats:', error)
    return { total: 0, active: 0, inactive: 0 }
  }
}
