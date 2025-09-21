-- CAPTURA Production Complete Fix
-- Run this script in your PRODUCTION Supabase SQL Editor to fix all booking registration issues
-- This addresses foreign keys, missing columns, and RLS policies

-- =============================================================================
-- STEP 1: ADD MISSING COLUMNS TO CUSTOMERS TABLE
-- =============================================================================

-- Add 'name' column if it doesn't exist (maps to full_name)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'name') THEN
        ALTER TABLE customers ADD COLUMN name VARCHAR(255);
        -- Populate name with full_name data
        UPDATE customers SET name = full_name WHERE name IS NULL;
        RAISE NOTICE 'Added name column to customers table';
    ELSE
        RAISE NOTICE 'name column already exists in customers table';
    END IF;
END $$;

-- Add 'reliability_score' column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'reliability_score') THEN
        ALTER TABLE customers ADD COLUMN reliability_score INTEGER DEFAULT 100;
        RAISE NOTICE 'Added reliability_score column to customers table';
    ELSE
        RAISE NOTICE 'reliability_score column already exists in customers table';
    END IF;
END $$;

-- Add 'total_bookings' column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'total_bookings') THEN
        ALTER TABLE customers ADD COLUMN total_bookings INTEGER DEFAULT 0;
        RAISE NOTICE 'Added total_bookings column to customers table';
    ELSE
        RAISE NOTICE 'total_bookings column already exists in customers table';
    END IF;
END $$;

-- Add 'whatsapp' column to customers if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'whatsapp') THEN
        ALTER TABLE customers ADD COLUMN whatsapp VARCHAR(20);
        -- Populate whatsapp with phone number as default
        UPDATE customers SET whatsapp = phone WHERE whatsapp IS NULL;
        RAISE NOTICE 'Added whatsapp column to customers table';
    ELSE
        RAISE NOTICE 'whatsapp column already exists in customers table';
    END IF;
END $$;

-- =============================================================================
-- STEP 2: ADD MISSING COLUMNS TO BOOKINGS TABLE
-- =============================================================================

-- Add booking_source column if missing
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_source') THEN
        ALTER TABLE bookings ADD COLUMN booking_source VARCHAR(20) CHECK (booking_source IN ('website', 'phone', 'whatsapp', 'walk-in', 'historical', 'manual')) DEFAULT 'website';
        RAISE NOTICE 'Added booking_source column to bookings table';
    ELSE
        RAISE NOTICE 'booking_source column already exists in bookings table';
    END IF;
END $$;

-- =============================================================================
-- STEP 3: FIX FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- Drop and recreate foreign key constraints to ensure they work properly
DO $$ 
BEGIN
    -- Drop existing foreign key constraints if they exist
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'bookings_camera_id_fkey' 
               AND table_name = 'bookings') THEN
        ALTER TABLE bookings DROP CONSTRAINT bookings_camera_id_fkey;
        RAISE NOTICE 'Dropped existing bookings_camera_id_fkey constraint';
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'bookings_customer_id_fkey' 
               AND table_name = 'bookings') THEN
        ALTER TABLE bookings DROP CONSTRAINT bookings_customer_id_fkey;
        RAISE NOTICE 'Dropped existing bookings_customer_id_fkey constraint';
    END IF;
END $$;

-- Add proper foreign key constraints
ALTER TABLE bookings 
ADD CONSTRAINT bookings_camera_id_fkey 
FOREIGN KEY (camera_id) REFERENCES cameras(id) ON DELETE CASCADE;

ALTER TABLE bookings 
ADD CONSTRAINT bookings_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE;

-- =============================================================================
-- STEP 4: CREATE ESSENTIAL INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_camera_id ON bookings(camera_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);

-- =============================================================================
-- STEP 5: UPDATE DATA CONSISTENCY
-- =============================================================================

-- Ensure name and full_name are synchronized
UPDATE customers SET name = full_name WHERE name IS NULL OR name = '';
UPDATE customers SET full_name = name WHERE full_name IS NULL OR full_name = '';

-- Update total_bookings count for existing customers
UPDATE customers SET total_bookings = (
    SELECT COUNT(*) 
    FROM bookings 
    WHERE bookings.customer_id = customers.id
) WHERE total_bookings = 0 OR total_bookings IS NULL;

-- =============================================================================
-- STEP 6: FIX ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Disable RLS temporarily to allow public inserts
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE cameras DISABLE ROW LEVEL SECURITY;

-- Enable RLS with proper policies
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow public read access to cameras" ON cameras;
DROP POLICY IF EXISTS "Allow public insert to customers" ON customers;
DROP POLICY IF EXISTS "Allow public insert to bookings" ON bookings;
DROP POLICY IF EXISTS "Allow public read access to customers" ON customers;
DROP POLICY IF EXISTS "Allow public read access to bookings" ON bookings;

-- Create permissive policies for public access
CREATE POLICY "Allow public read access to cameras" ON cameras
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to customers" ON customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to customers" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert to bookings" ON bookings
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read access to bookings" ON bookings
    FOR SELECT USING (true);

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Verify the fixes
SELECT 'PRODUCTION DATABASE FIX COMPLETED!' as status;

-- Show foreign key constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name = 'bookings';

-- Show customer table structure
SELECT column_name, data_type, is_nullable
FROM information_schema.columns 
WHERE table_name = 'customers' 
AND column_name IN ('name', 'full_name', 'reliability_score', 'total_bookings', 'whatsapp')
ORDER BY column_name;
