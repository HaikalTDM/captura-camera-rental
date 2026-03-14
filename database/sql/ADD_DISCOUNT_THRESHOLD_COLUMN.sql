-- Add discount_threshold column to cameras table
-- This allows each camera to have its own discount trigger (default: 3 days)

ALTER TABLE cameras 
ADD COLUMN IF NOT EXISTS discount_threshold INTEGER DEFAULT 3;

COMMENT ON COLUMN cameras.discount_threshold IS 'Number of days required to qualify for discounted rate (default: 3)';

-- Verify the column was added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'cameras' AND column_name = 'discount_threshold';

