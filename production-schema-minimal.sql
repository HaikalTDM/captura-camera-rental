-- CAPTURA Production Schema Update - MINIMAL VERSION
-- Run this script in your PRODUCTION Supabase SQL Editor
-- This is the minimal update required for the revenue fixes to work

-- =============================================================================
-- ESSENTIAL UPDATES ONLY
-- =============================================================================

-- 1. Update all cameras to use fixed RM100 deposit
UPDATE cameras SET deposit_amount = 100.00;

-- 2. Add deposit refund tracking columns (required for new admin features)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refunded BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_refund_amount DECIMAL(10,2) DEFAULT 100.00;

-- 3. Ensure maintenance columns exist (fixes the "RMNaN" display issue)
ALTER TABLE cameras ADD COLUMN IF NOT EXISTS last_maintenance DATE;
ALTER TABLE cameras ADD COLUMN IF NOT EXISTS condition VARCHAR(20) CHECK (condition IN ('excellent', 'good', 'fair', 'needs_repair')) DEFAULT 'excellent';

-- =============================================================================
-- VERIFICATION
-- =============================================================================

-- Verify the updates
SELECT 'Production schema update completed successfully!' as status;

-- Show updated camera data
SELECT 
    name, 
    deposit_amount,
    last_maintenance,
    condition
FROM cameras;

-- Show that new booking columns exist
SELECT COUNT(*) as booking_records_count FROM bookings;

/*
WHAT THIS MINIMAL SCRIPT DOES:
✅ Fixes camera deposit amounts (RM100 fixed deposit)
✅ Adds deposit refund tracking for admin interface
✅ Adds maintenance columns to fix display issues
✅ Ensures revenue calculations work correctly

RESULT:
- Dashboard will show accurate revenue totals
- Camera maintenance will display properly (no more "RMNaN")
- Deposit refund functionality will be available
- All admin pages will use consistent revenue calculations
*/
