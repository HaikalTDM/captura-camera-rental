-- CAPTURA Fixed Deposit Payment System Update
-- Run this script in your Supabase SQL Editor

-- 1. Update all cameras to have fixed RM100 deposit
UPDATE cameras SET deposit_amount = 100.00;

-- 2. Add deposit refund tracking columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refunded BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_amount DECIMAL(10,2) DEFAULT 100.00;

-- 3. Create business_settings table if it doesn't exist
CREATE TABLE IF NOT EXISTS business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Add business setting for fixed deposit amount
INSERT INTO business_settings (setting_key, setting_value, description) VALUES
('fixed_deposit_amount', '100.00', 'Fixed deposit amount for all camera rentals in RM')
ON CONFLICT (setting_key) DO UPDATE SET
    setting_value = EXCLUDED.setting_value,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 4. Create deposit refund API endpoint support
-- Add payment_records entry type for deposit refunds
-- (payment_records table already supports 'refund' type)

-- 5. Update any existing bookings to use new payment structure
-- Note: This will only affect future bookings, existing bookings remain unchanged
-- to maintain historical accuracy

-- 6. Verify the changes
SELECT 'Fixed deposit schema update completed successfully' as status;

-- Show updated camera deposit amounts
SELECT name, deposit_amount FROM cameras ORDER BY name;

-- Show new booking columns
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name LIKE '%deposit%'
ORDER BY column_name;
