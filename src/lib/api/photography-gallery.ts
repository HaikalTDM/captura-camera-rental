import { supabase } from '../supabase'

export interface PhotographyGalleryImage {
  id: string
  title: string
  description?: string
  image_url: string
  alt_text?: string
  category: 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event'
  aspect_ratio: 'portrait' | 'landscape' | 'square'
  is_featured: boolean
  is_active: boolean
  sort_order: number
  photographer_name?: string
  location?: string
  shoot_date?: string
  file_name?: string
  file_size?: number
  image_width?: number
  image_height?: number
  created_at: string
  updated_at: string
}

// Get all photography gallery images
export async function getPhotographyGalleryImages(): Promise<PhotographyGalleryImage[]> {
  try {
    const { data, error } = await supabase
      .from('photography_gallery_images')
      .select('*')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching photography gallery images:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getPhotographyGalleryImages:', error)
    return []
  }
}

// Get only active photography gallery images (for main website)
export async function getActivePhotographyGalleryImages(): Promise<PhotographyGalleryImage[]> {
  try {
    const { data, error } = await supabase
      .from('photography_gallery_images')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching active photography gallery images:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getActivePhotographyGalleryImages:', error)
    return []
  }
}

// Get featured photography gallery images
export async function getFeaturedPhotographyGalleryImages(): Promise<PhotographyGalleryImage[]> {
  try {
    const { data, error } = await supabase
      .from('photography_gallery_images')
      .select('*')
      .eq('is_active', true)
      .eq('is_featured', true)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching featured photography gallery images:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getFeaturedPhotographyGalleryImages:', error)
    return []
  }
}

// Add new photography gallery image
export async function addPhotographyGalleryImage(imageData: {
  title: string
  description?: string
  image_url: string
  alt_text?: string
  category: 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event'
  aspect_ratio: 'portrait' | 'landscape' | 'square'
  is_featured?: boolean
  is_active?: boolean
  sort_order?: number
  photographer_name?: string
  location?: string
  shoot_date?: string
  file_name?: string
  file_size?: number
  image_width?: number
  image_height?: number
}): Promise<PhotographyGalleryImage | null> {
  try {
    const { data, error } = await supabase
      .from('photography_gallery_images')
      .insert([{
        ...imageData,
        is_featured: imageData.is_featured ?? false,
        is_active: imageData.is_active ?? true,
        sort_order: imageData.sort_order ?? 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Error adding photography gallery image:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in addPhotographyGalleryImage:', error)
    return null
  }
}

// Toggle image active status
export async function togglePhotographyImageStatus(id: string): Promise<boolean> {
  try {
    // First get current status
    const { data: currentImage, error: fetchError } = await supabase
      .from('photography_gallery_images')
      .select('is_active')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching current image status:', fetchError)
      return false
    }

    // Toggle the status
    const { error: updateError } = await supabase
      .from('photography_gallery_images')
      .update({ is_active: !currentImage.is_active })
      .eq('id', id)

    if (updateError) {
      console.error('Error toggling image status:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in togglePhotographyImageStatus:', error)
    return false
  }
}

// Toggle featured status
export async function togglePhotographyImageFeatured(id: string): Promise<boolean> {
  try {
    // First get current status
    const { data: currentImage, error: fetchError } = await supabase
      .from('photography_gallery_images')
      .select('is_featured')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Error fetching current featured status:', fetchError)
      return false
    }

    // Toggle the status
    const { error: updateError } = await supabase
      .from('photography_gallery_images')
      .update({ is_featured: !currentImage.is_featured })
      .eq('id', id)

    if (updateError) {
      console.error('Error toggling featured status:', updateError)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in togglePhotographyImageFeatured:', error)
    return false
  }
}

// Update photography gallery image
export async function updatePhotographyGalleryImage(id: string, updateData: {
  title?: string
  description?: string
  category?: 'wedding' | 'corporate' | 'graduation' | 'portrait' | 'event'
  photographer_name?: string
  location?: string
  shoot_date?: string
  is_featured?: boolean
  is_active?: boolean
}): Promise<PhotographyGalleryImage | null> {
  try {
    const { data, error } = await supabase
      .from('photography_gallery_images')
      .update({
        ...updateData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating photography gallery image:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updatePhotographyGalleryImage:', error)
    return null
  }
}

// Delete photography gallery image
export async function deletePhotographyGalleryImage(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('photography_gallery_images')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting photography gallery image:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deletePhotographyGalleryImage:', error)
    return false
  }
}

// Upload image (base64 solution - same as rental)
export async function uploadPhotographyImage(file: File): Promise<string | null> {
  try {
    // Check if we're in browser environment
    if (typeof window === 'undefined') {
      console.error('FileReader is not available in server environment');
      return null;
    }
    
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        resolve(base64);
      };
      reader.readAsDataURL(file);
    });
  } catch (error) {
    console.error('Error in uploadPhotographyImage:', error)
    return null
  }
}

// Get photography gallery statistics
export async function getPhotographyGalleryStats(): Promise<{
  total: number
  active: number
  inactive: number
  featured: number
  by_category: Record<string, number>
}> {
  try {
    const { data, error } = await supabase
      .from('photography_gallery_images')
      .select('is_active, is_featured, category')

    if (error) {
      console.error('Error fetching photography gallery stats:', error)
      return { total: 0, active: 0, inactive: 0, featured: 0, by_category: {} }
    }

    const total = data.length
    const active = data.filter(img => img.is_active).length
    const inactive = total - active
    const featured = data.filter(img => img.is_featured && img.is_active).length
    
    const by_category = data.reduce((acc, img) => {
      acc[img.category] = (acc[img.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return { total, active, inactive, featured, by_category }
  } catch (error) {
    console.error('Error in getPhotographyGalleryStats:', error)
    return { total: 0, active: 0, inactive: 0, featured: 0, by_category: {} }
  }
}
