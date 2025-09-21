-- CAPTURA Production Database Fix
-- Run this script in your PRODUCTION Supabase SQL Editor to fix booking registration issues

-- =============================================================================
-- STEP 1: FIX FOREIGN KEY RELATIONSHIPS
-- =============================================================================

-- Drop existing foreign key constraints if they exist (to recreate them properly)
DO $$ 
BEGIN
    -- Drop existing foreign key constraints
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bookings_camera_id_fkey') THEN
        ALTER TABLE bookings DROP CONSTRAINT bookings_camera_id_fkey;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'bookings_customer_id_fkey') THEN
        ALTER TABLE bookings DROP CONSTRAINT bookings_customer_id_fkey;
    END IF;
END $$;

-- Recreate foreign key constraints properly
ALTER TABLE bookings 
ADD CONSTRAINT bookings_camera_id_fkey 
FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- =============================================================================
-- STEP 2: ENSURE ALL REQUIRED COLUMNS EXIST
-- =============================================================================

-- Add missing columns to customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS name VARCHAR(255);
ALTER TABLE customers ADD COLUMN IF NOT EXISTS reliability_score INTEGER DEFAULT 100;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS total_bookings INTEGER DEFAULT 0;

-- Update name field from full_name if empty
UPDATE customers SET name = full_name WHERE name IS NULL OR name = '';

-- Add missing columns to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_source VARCHAR(20) DEFAULT 'website';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_method VARCHAR(20) DEFAULT 'pickup';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;

-- =============================================================================
-- STEP 3: ENSURE CAMERAS TABLE IS PROPERLY CONFIGURED
-- =============================================================================

-- Add missing columns to cameras table
ALTER TABLE cameras ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'available';

-- Update camera status based on availability
UPDATE cameras SET status = CASE 
    WHEN is_available = true AND available_quantity > 0 THEN 'available'
    WHEN is_available = true AND available_quantity = 0 THEN 'rented'
    ELSE 'maintenance'
END;

-- =============================================================================
-- STEP 4: CREATE INDEXES FOR BETTER PERFORMANCE
-- =============================================================================

-- Create indexes if they don't exist
CREATE INDEX IF NOT EXISTS idx_bookings_camera_id ON bookings(camera_id);
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON customers(phone);

-- =============================================================================
-- STEP 5: REFRESH SCHEMA CACHE
-- =============================================================================

-- Force refresh of PostgREST schema cache
NOTIFY pgrst, 'reload schema';

-- =============================================================================
-- STEP 6: VERIFICATION QUERIES
-- =============================================================================

-- Check foreign key constraints
SELECT 
    tc.constraint_name, 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
    AND tc.table_name IN ('bookings', 'customers', 'cameras')
ORDER BY tc.table_name, tc.constraint_name;

-- Check table structures
SELECT 'bookings' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'bookings' 
ORDER BY ordinal_position;

SELECT 'customers' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'customers' 
ORDER BY ordinal_position;

SELECT 'cameras' as table_name, column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'cameras' 
ORDER BY ordinal_position;

-- Test data counts
SELECT 
    (SELECT COUNT(*) FROM cameras) as cameras_count,
    (SELECT COUNT(*) FROM customers) as customers_count,
    (SELECT COUNT(*) FROM bookings) as bookings_count;

-- Final status
SELECT 'Production database fix completed successfully!' as status;

-- =============================================================================
-- NOTES:
-- =============================================================================

/*
THIS SCRIPT FIXES:
1. ✅ Missing foreign key relationships between bookings and cameras
2. ✅ Missing foreign key relationships between bookings and customers  
3. ✅ Missing customer reliability_score field
4. ✅ Missing customer name field mapping
5. ✅ Missing booking source and pickup method fields
6. ✅ Refreshes PostgREST schema cache
7. ✅ Creates proper indexes for performance

AFTER RUNNING THIS SCRIPT:
- New bookings should register properly in the database
- Admin dashboard should load without errors
- Customer data should display correctly
- Foreign key relationships will be properly enforced

IF ERRORS PERSIST:
- Check Supabase logs for additional error details
- Verify RLS (Row Level Security) policies are not blocking inserts
- Ensure API keys have proper permissions
*/
