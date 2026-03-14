-- CAPTURA Fixed Deposit Payment System - Simple Update
-- Run these commands one by one in Supabase SQL Editor

-- Step 1: Update all cameras to have fixed RM100 deposit
UPDATE cameras SET deposit_amount = 100.00;

-- Step 2: Add deposit refund tracking columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refunded BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_amount DECIMAL(10,2) DEFAULT 100.00;

-- Step 3: Verify the changes
SELECT 'Fixed deposit schema update completed successfully' as status;

-- Step 4: Show updated camera deposit amounts
SELECT name, deposit_amount FROM cameras ORDER BY name;

-- Step 5: Show new booking columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name LIKE '%deposit%'
ORDER BY column_name;
