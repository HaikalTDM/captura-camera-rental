-- Add display_order column to cameras table
-- This allows drag-and-drop reordering of cameras on the rental site

-- Add the display_order column (default to 999 for existing cameras)
ALTER TABLE cameras 
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 999;

-- Set display_order for existing cameras based on their current order
-- Osmo Pocket 3 cameras will be first, then others
UPDATE cameras 
SET display_order = CASE 
    WHEN LOWER(name) LIKE '%osmo%pocket%3%' AND LOWER(name) NOT LIKE '%(ii)%' THEN 0
    WHEN LOWER(name) LIKE '%osmo%pocket%3%(ii)%' OR LOWER(name) LIKE '%osmo%pocket%3% (ii)%' THEN 1
    WHEN LOWER(name) LIKE '%action%5%pro%' THEN 2
    ELSE 999
END;

-- Create an index for faster sorting
CREATE INDEX IF NOT EXISTS idx_cameras_display_order ON cameras(display_order);

-- Show the updated cameras with their display order
SELECT id, name, display_order FROM cameras ORDER BY display_order;


