-- SIMPLE PICKUP STATUS SCHEMA UPDATE
-- Run these commands one by one in Supabase SQL Editor

-- Step 1: Add the basic columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_picked_up BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_pickup_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_pickup_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_returned BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_return_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_return_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_condition_pickup TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_condition_return TEXT;

-- Step 2: Update existing records
UPDATE bookings SET equipment_picked_up = FALSE WHERE equipment_picked_up IS NULL;
UPDATE bookings SET equipment_returned = FALSE WHERE equipment_returned IS NULL;

-- Step 3: Add constraints (run separately if needed)
-- ALTER TABLE bookings ADD CONSTRAINT chk_equipment_condition_pickup 
--   CHECK (equipment_condition_pickup IS NULL OR equipment_condition_pickup IN ('excellent', 'good', 'fair', 'damaged'));

-- ALTER TABLE bookings ADD CONSTRAINT chk_equipment_condition_return 
--   CHECK (equipment_condition_return IS NULL OR equipment_condition_return IN ('excellent', 'good', 'fair', 'damaged'));
