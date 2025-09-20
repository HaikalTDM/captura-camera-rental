import { supabase } from '../supabase'

export interface CameraImage {
  id: string
  camera_id: string
  image_url: string
  image_path: string
  is_primary: boolean
  alt_text?: string
  order_index: number
  file_size?: number
  file_type?: string
  created_at: string
  updated_at: string
}

// Upload camera image to Supabase Storage
export async function uploadCameraImage(
  file: File, 
  cameraId: string, 
  isPrimary: boolean = false
): Promise<{ url: string; path: string } | null> {
  try {
    // Validate file
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }
    
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      throw new Error('File size must be less than 5MB')
    }

    // Generate unique filename
    const fileExt = file.name.split('.').pop()
    const fileName = `${cameraId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('camera-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Storage upload error:', error)
      throw error
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('camera-images')
      .getPublicUrl(fileName)

    return {
      url: publicUrl,
      path: fileName
    }
  } catch (error) {
    console.error('Error uploading camera image:', error)
    return null
  }
}

// Delete camera image from Supabase Storage
export async function deleteCameraImage(imagePath: string): Promise<boolean> {
  try {
    const { error } = await supabase.storage
      .from('camera-images')
      .remove([imagePath])

    if (error) {
      console.error('Storage delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error deleting camera image:', error)
    return false
  }
}

// Get all images for a camera
export async function getCameraImages(cameraId: string): Promise<CameraImage[]> {
  try {
    const { data, error } = await supabase
      .from('camera_images')
      .select('*')
      .eq('camera_id', cameraId)
      .order('order_index', { ascending: true })

    if (error) {
      console.error('Error fetching camera images:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error in getCameraImages:', error)
    return []
  }
}

// Add camera image record to database
export async function addCameraImageRecord(imageData: {
  camera_id: string
  image_url: string
  image_path: string
  is_primary: boolean
  alt_text?: string
  order_index: number
  file_size?: number
  file_type?: string
}): Promise<CameraImage | null> {
  try {
    const { data, error } = await supabase
      .from('camera_images')
      .insert([imageData])
      .select()
      .single()

    if (error) {
      console.error('Error adding camera image record:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in addCameraImageRecord:', error)
    return null
  }
}

// Update camera image record
export async function updateCameraImageRecord(
  id: string, 
  updates: Partial<CameraImage>
): Promise<CameraImage | null> {
  try {
    const { data, error } = await supabase
      .from('camera_images')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating camera image record:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Error in updateCameraImageRecord:', error)
    return null
  }
}

// Delete camera image record from database
export async function deleteCameraImageRecord(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('camera_images')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting camera image record:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in deleteCameraImageRecord:', error)
    return false
  }
}

// Set primary image for camera
export async function setPrimaryCameraImage(cameraId: string, imageId: string): Promise<boolean> {
  try {
    // First, unset all primary images for this camera
    await supabase
      .from('camera_images')
      .update({ is_primary: false })
      .eq('camera_id', cameraId)

    // Then set the selected image as primary
    const { error } = await supabase
      .from('camera_images')
      .update({ is_primary: true })
      .eq('id', imageId)

    if (error) {
      console.error('Error setting primary camera image:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Error in setPrimaryCameraImage:', error)
    return false
  }
}

// Upload multiple camera images
export async function uploadMultipleCameraImages(
  files: File[], 
  cameraId: string
): Promise<{ success: CameraImage[]; failed: { file: File; error: string }[] }> {
  const success: CameraImage[] = []
  const failed: { file: File; error: string }[] = []

  for (let i = 0; i < files.length; i++) {
    const file = files[i]
    try {
      // Upload to storage
      const uploadResult = await uploadCameraImage(file, cameraId, i === 0) // First image is primary
      
      if (!uploadResult) {
        failed.push({ file, error: 'Failed to upload to storage' })
        continue
      }

      // Add database record
      const imageRecord = await addCameraImageRecord({
        camera_id: cameraId,
        image_url: uploadResult.url,
        image_path: uploadResult.path,
        is_primary: i === 0,
        alt_text: `${file.name}`,
        order_index: i,
        file_size: file.size,
        file_type: file.type
      })

      if (imageRecord) {
        success.push(imageRecord)
      } else {
        // If database record fails, clean up storage
        await deleteCameraImage(uploadResult.path)
        failed.push({ file, error: 'Failed to save image record' })
      }
    } catch (error) {
      failed.push({ file, error: error instanceof Error ? error.message : 'Unknown error' })
    }
  }

  return { success, failed }
}

// Remove camera image (both storage and database)
export async function removeCameraImage(imageId: string): Promise<boolean> {
  try {
    // Get image record first
    const { data: imageRecord, error: fetchError } = await supabase
      .from('camera_images')
      .select('image_path')
      .eq('id', imageId)
      .single()

    if (fetchError || !imageRecord) {
      console.error('Error fetching image record:', fetchError)
      return false
    }

    // Delete from storage
    const storageDeleted = await deleteCameraImage(imageRecord.image_path)
    
    // Delete from database
    const dbDeleted = await deleteCameraImageRecord(imageId)

    return storageDeleted && dbDeleted
  } catch (error) {
    console.error('Error in removeCameraImage:', error)
    return false
  }
}
