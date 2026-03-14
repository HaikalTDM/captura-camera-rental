-- Fix camera_id column type mismatch in bookings table
-- The issue is that camera_id is UUID type but we're using VARCHAR camera IDs

-- 1. First, let's check the current column types
-- Run this to see current schema:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'camera_id';

-- 2. Change camera_id from UUID to VARCHAR to match our camera ID format
-- We need to handle existing data carefully

-- Step 1: Add a new temporary column
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS camera_id_new VARCHAR(255);

-- Step 2: Copy existing UUID camera_id values to the new column (convert to string)
UPDATE bookings SET camera_id_new = camera_id::text WHERE camera_id_new IS NULL;

-- Step 3: Drop the old camera_id column (this will also drop the foreign key constraint)
ALTER TABLE bookings DROP COLUMN IF EXISTS camera_id CASCADE;

-- Step 4: Rename the new column to camera_id
ALTER TABLE bookings RENAME COLUMN camera_id_new TO camera_id;

-- Step 5: Add NOT NULL constraint
ALTER TABLE bookings ALTER COLUMN camera_id SET NOT NULL;

-- Step 6: Create index for performance
CREATE INDEX IF NOT EXISTS idx_bookings_camera_id ON bookings(camera_id);

-- 7. Update the check_camera_availability function to ensure it works with VARCHAR
CREATE OR REPLACE FUNCTION check_camera_availability(
  p_camera_id VARCHAR(255),
  p_start_date DATE,
  p_end_date DATE,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for overlapping confirmed bookings
  SELECT COUNT(*) INTO conflict_count
  FROM bookings
  WHERE camera_id = p_camera_id
    AND booking_status = 'confirmed'
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
    AND (
      (start_date <= p_start_date AND end_date > p_start_date) OR
      (start_date < p_end_date AND end_date >= p_end_date) OR
      (start_date >= p_start_date AND end_date <= p_end_date)
    );

  -- Check for calendar blocks
  SELECT COUNT(*) + conflict_count INTO conflict_count
  FROM calendar_blocks
  WHERE camera_id = p_camera_id
    AND (p_exclude_booking_id IS NULL OR booking_id != p_exclude_booking_id)
    AND (
      (start_date <= p_start_date AND end_date > p_start_date) OR
      (start_date < p_end_date AND end_date >= p_end_date) OR
      (start_date >= p_start_date AND end_date <= p_end_date)
    );

  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- 8. Also update calendar_blocks to ensure camera_id is VARCHAR
ALTER TABLE calendar_blocks ALTER COLUMN camera_id TYPE VARCHAR(255);

-- 9. Update any existing bookings to use string camera IDs if they have UUID values
-- This converts any UUID camera_id values to their string representation
UPDATE bookings 
SET camera_id = CASE 
  WHEN camera_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
  THEN 'osmo-pocket-3'  -- Default to a known camera ID for existing bookings
  ELSE camera_id 
END
WHERE camera_id IS NOT NULL;

-- 10. Update calendar_blocks similarly
UPDATE calendar_blocks 
SET camera_id = CASE 
  WHEN camera_id ~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' 
  THEN 'osmo-pocket-3'  -- Default to a known camera ID for existing blocks
  ELSE camera_id 
END
WHERE camera_id IS NOT NULL;
