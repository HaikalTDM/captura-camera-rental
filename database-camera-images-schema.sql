-- CAPTURA Camera Image Management Schema
-- Run this script in your Supabase SQL Editor to add camera image management

-- Create camera_images table for multiple images per camera
CREATE TABLE IF NOT EXISTS camera_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    image_path TEXT NOT NULL, -- Storage path for deletion
    is_primary BOOLEAN DEFAULT false,
    alt_text TEXT,
    order_index INTEGER DEFAULT 0,
    file_size INTEGER, -- File size in bytes
    file_type VARCHAR(50), -- MIME type
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_camera_images_camera_id ON camera_images(camera_id);
CREATE INDEX IF NOT EXISTS idx_camera_images_primary ON camera_images(camera_id, is_primary);
CREATE INDEX IF NOT EXISTS idx_camera_images_order ON camera_images(camera_id, order_index);

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_camera_images_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_camera_images_updated_at
    BEFORE UPDATE ON camera_images
    FOR EACH ROW
    EXECUTE FUNCTION update_camera_images_updated_at();

-- Ensure only one primary image per camera
CREATE OR REPLACE FUNCTION ensure_single_primary_image()
RETURNS TRIGGER AS $$
BEGIN
    -- If setting this image as primary, unset all other primary images for this camera
    IF NEW.is_primary = true THEN
        UPDATE camera_images 
        SET is_primary = false 
        WHERE camera_id = NEW.camera_id AND id != NEW.id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_single_primary_image
    BEFORE INSERT OR UPDATE ON camera_images
    FOR EACH ROW
    EXECUTE FUNCTION ensure_single_primary_image();

-- Create Supabase Storage bucket for camera images
-- Note: This needs to be run in Supabase Dashboard or via API
-- INSERT INTO storage.buckets (id, name, public) VALUES ('camera-images', 'camera-images', true);

-- Storage policies for camera images bucket
-- Allow authenticated users to upload images
-- CREATE POLICY "Allow authenticated uploads" ON storage.objects
--   FOR INSERT WITH CHECK (bucket_id = 'camera-images' AND auth.role() = 'authenticated');

-- Allow public read access to images
-- CREATE POLICY "Allow public downloads" ON storage.objects
--   FOR SELECT USING (bucket_id = 'camera-images');

-- Allow authenticated users to delete their uploads
-- CREATE POLICY "Allow authenticated deletes" ON storage.objects
--   FOR DELETE USING (bucket_id = 'camera-images' AND auth.role() = 'authenticated');

-- Function to get primary image URL for a camera
CREATE OR REPLACE FUNCTION get_camera_primary_image(camera_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    primary_image_url TEXT;
BEGIN
    SELECT image_url INTO primary_image_url
    FROM camera_images
    WHERE camera_id = camera_uuid AND is_primary = true
    LIMIT 1;
    
    -- If no primary image, get the first image
    IF primary_image_url IS NULL THEN
        SELECT image_url INTO primary_image_url
        FROM camera_images
        WHERE camera_id = camera_uuid
        ORDER BY order_index ASC, created_at ASC
        LIMIT 1;
    END IF;
    
    RETURN primary_image_url;
END;
$$ LANGUAGE plpgsql;

-- Function to get all image URLs for a camera as JSON array
CREATE OR REPLACE FUNCTION get_camera_images_array(camera_uuid UUID)
RETURNS JSON AS $$
DECLARE
    images_json JSON;
BEGIN
    SELECT json_agg(
        json_build_object(
            'id', id,
            'url', image_url,
            'alt', alt_text,
            'is_primary', is_primary,
            'order_index', order_index
        ) ORDER BY order_index ASC, created_at ASC
    ) INTO images_json
    FROM camera_images
    WHERE camera_id = camera_uuid;
    
    -- Return empty array if no images
    IF images_json IS NULL THEN
        RETURN '[]'::JSON;
    END IF;
    
    RETURN images_json;
END;
$$ LANGUAGE plpgsql;

-- Update cameras table to include computed image fields
-- Add a view that includes image information
CREATE OR REPLACE VIEW cameras_with_images AS
SELECT 
    c.*,
    get_camera_primary_image(c.id) as primary_image_url,
    get_camera_images_array(c.id) as images_array,
    (SELECT COUNT(*) FROM camera_images WHERE camera_id = c.id) as image_count
FROM cameras c;

-- Grant necessary permissions
GRANT SELECT ON cameras_with_images TO anon, authenticated;
GRANT ALL ON camera_images TO authenticated;
GRANT USAGE ON SEQUENCE camera_images_id_seq TO authenticated;

-- Sample data migration (optional)
-- Migrate existing image_url to camera_images table
-- INSERT INTO camera_images (camera_id, image_url, image_path, is_primary, order_index)
-- SELECT 
--     id as camera_id,
--     image_url,
--     'legacy/' || id || '.jpg' as image_path,
--     true as is_primary,
--     0 as order_index
-- FROM cameras 
-- WHERE image_url IS NOT NULL AND image_url != '';

COMMENT ON TABLE camera_images IS 'Stores multiple images for each camera with ordering and primary image designation';
COMMENT ON COLUMN camera_images.is_primary IS 'Only one image per camera should be marked as primary';
COMMENT ON COLUMN camera_images.order_index IS 'Display order for images in gallery (0 = first)';
COMMENT ON COLUMN camera_images.image_path IS 'Storage path for file deletion operations';
COMMENT ON FUNCTION get_camera_primary_image(UUID) IS 'Returns the primary image URL for a camera, or first image if no primary set';
COMMENT ON FUNCTION get_camera_images_array(UUID) IS 'Returns all images for a camera as JSON array with metadata';
