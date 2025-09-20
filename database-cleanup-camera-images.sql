-- CAPTURA Camera Images System Cleanup
-- Run this in your Supabase SQL Editor to completely remove the camera image management system

-- 1. Drop all policies related to camera images storage
DROP POLICY IF EXISTS "Allow authenticated uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public downloads" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated deletes" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated updates" ON storage.objects;

-- 2. Remove storage bucket (this will also delete all uploaded files)
DELETE FROM storage.buckets WHERE id = 'camera-images';

-- 3. Drop triggers related to camera_images
DROP TRIGGER IF EXISTS trigger_ensure_single_primary_image ON camera_images;
DROP TRIGGER IF EXISTS trigger_update_camera_images_updated_at ON camera_images;

-- 4. Drop functions related to camera images
DROP FUNCTION IF EXISTS ensure_single_primary_image();
DROP FUNCTION IF EXISTS update_camera_images_updated_at();
DROP FUNCTION IF EXISTS get_camera_primary_image(UUID);
DROP FUNCTION IF EXISTS get_camera_images_array(UUID);

-- 5. Drop the cameras_with_images view
DROP VIEW IF EXISTS cameras_with_images;

-- 6. Drop the camera_images table completely
DROP TABLE IF EXISTS camera_images CASCADE;

-- 7. Verify cleanup - these queries should return no results
SELECT tablename FROM pg_tables WHERE tablename = 'camera_images';
SELECT viewname FROM pg_views WHERE viewname = 'cameras_with_images';
SELECT proname FROM pg_proc WHERE proname IN ('get_camera_primary_image', 'get_camera_images_array', 'ensure_single_primary_image', 'update_camera_images_updated_at');

-- 8. Check remaining storage policies (should not include camera-images policies)
SELECT policyname, cmd FROM pg_policies WHERE tablename = 'objects' AND schemaname = 'storage';

-- 9. Verify storage bucket is removed
SELECT * FROM storage.buckets WHERE id = 'camera-images';

-- Success message
SELECT 'Camera image management system successfully removed from database' as cleanup_status;
