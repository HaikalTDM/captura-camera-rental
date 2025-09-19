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

// Get inactive gallery images
export async function getInactiveGalleryImages(): Promise<GalleryImage[]> {
  try {
    const { data, error } = await supabase
      .from('gallery_images')
      .select('*')
      .eq('is_active', false)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching inactive gallery images:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getInactiveGalleryImages:', error)
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

// Update gallery image
export async function updateGalleryImage(
  id: string, 
  updates: Partial<GalleryImage>
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('gallery_images')
      .update(updates)
      .eq('id', id)

    if (error) {
      console.error('Error updating gallery image:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in updateGalleryImage:', error)
    return false
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

// Upload image to Supabase Storage
export async function uploadImage(file: File): Promise<string | null> {
  try {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `gallery/${fileName}`

    const { data, error } = await supabase.storage
      .from('images')
      .upload(filePath, file)

    if (error) {
      console.error('Error uploading image:', error)
      return null
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('images')
      .getPublicUrl(filePath)

    return publicUrl
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
