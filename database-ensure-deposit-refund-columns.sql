-- Ensure all deposit refund and equipment tracking columns exist
-- Run this in your Supabase SQL Editor

-- Add deposit refund tracking columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refunded BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_amount DECIMAL(10,2) DEFAULT 100.00;

-- Add equipment tracking columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_picked_up BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_pickup_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_pickup_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_returned BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_return_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_return_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_condition_pickup TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_condition_return TEXT;

-- Update existing NULL values to FALSE for boolean fields
UPDATE bookings SET deposit_refunded = FALSE WHERE deposit_refunded IS NULL;
UPDATE bookings SET equipment_picked_up = FALSE WHERE equipment_picked_up IS NULL;
UPDATE bookings SET equipment_returned = FALSE WHERE equipment_returned IS NULL;

-- Verify the columns exist
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND (
    column_name LIKE '%deposit_refund%' OR
    column_name LIKE '%equipment_%'
)
ORDER BY column_name;

