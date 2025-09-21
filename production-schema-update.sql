-- CAPTURA Production Schema Update
-- Run this script in your PRODUCTION Supabase SQL Editor
-- This updates the database to support the new fixed deposit payment system

-- =============================================================================
-- STEP 1: UPDATE CAMERA DEPOSIT AMOUNTS TO FIXED RM100
-- =============================================================================

-- Update all cameras to use fixed RM100 deposit instead of percentage-based
UPDATE cameras SET deposit_amount = 100.00;

-- Verify camera updates
SELECT 'Camera deposit amounts updated to RM100' as status;

-- =============================================================================
-- STEP 2: ADD DEPOSIT REFUND TRACKING COLUMNS
-- =============================================================================

-- Add deposit refund tracking columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refunded BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_amount DECIMAL(10,2) DEFAULT 100.00;

-- Verify new columns added
SELECT 'Deposit refund tracking columns added successfully' as status;

-- =============================================================================
-- STEP 3: ADD EQUIPMENT PICKUP/RETURN TRACKING (IF NOT EXISTS)
-- =============================================================================

-- Add equipment tracking columns if they don't exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_picked_up BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_pickup_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_pickup_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_returned BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_return_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_return_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_condition_pickup TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_condition_return TEXT;

-- Verify equipment tracking columns
SELECT 'Equipment tracking columns verified/added successfully' as status;

-- =============================================================================
-- STEP 4: ENSURE MAINTENANCE TRACKING SCHEMA EXISTS
-- =============================================================================

-- Create maintenance_records table if it doesn't exist
CREATE TABLE IF NOT EXISTS maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(20) CHECK (maintenance_type IN ('cleaning', 'repair', 'inspection', 'upgrade')) NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    maintenance_date DATE NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add maintenance tracking columns to cameras if they don't exist
ALTER TABLE cameras ADD COLUMN IF NOT EXISTS last_maintenance DATE;
ALTER TABLE cameras ADD COLUMN IF NOT EXISTS next_maintenance DATE;
ALTER TABLE cameras ADD COLUMN IF NOT EXISTS condition VARCHAR(20) CHECK (condition IN ('excellent', 'good', 'fair', 'needs_repair')) DEFAULT 'excellent';

-- Create index for maintenance records if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_maintenance_records_camera_id ON maintenance_records(camera_id);

-- Verify maintenance schema
SELECT 'Maintenance tracking schema verified/created successfully' as status;

-- =============================================================================
-- STEP 5: VERIFICATION QUERIES
-- =============================================================================

-- Show camera deposit amounts (should all be 100.00)
SELECT 
    name, 
    deposit_amount,
    last_maintenance,
    condition
FROM cameras 
ORDER BY name;

-- Show new booking columns structure
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND (
    column_name LIKE '%deposit%' OR 
    column_name LIKE '%equipment%' OR
    column_name LIKE '%pickup%' OR
    column_name LIKE '%return%'
)
ORDER BY column_name;

-- Show maintenance records table structure
SELECT 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'maintenance_records'
ORDER BY ordinal_position;

-- Final status
SELECT 'CAPTURA Production Schema Update Completed Successfully!' as final_status;

-- =============================================================================
-- NOTES FOR ADMIN:
-- =============================================================================

/*
WHAT THIS SCRIPT DOES:
1. Updates all cameras to use fixed RM100 deposit
2. Adds deposit refund tracking to bookings
3. Ensures equipment pickup/return tracking exists
4. Creates maintenance tracking schema
5. Verifies all changes with queries

AFTER RUNNING THIS SCRIPT:
- All new bookings will use RM100 deposit + rental amount structure
- Admin can track deposit refunds when equipment is returned
- Equipment pickup/return status can be managed
- Maintenance records can be tracked per camera
- Revenue calculations will work correctly across all admin pages

BACKUP RECOMMENDATION:
Consider taking a database backup before running this script in production.
*/
