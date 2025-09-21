-- CAPTURA Production RLS (Row Level Security) Fix
-- Run this script if you're still having permission issues after the main fix

-- =============================================================================
-- STEP 1: RESET RLS POLICIES COMPLETELY
-- =============================================================================

-- Disable RLS on all tables first
ALTER TABLE IF EXISTS cameras DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS bookings DISABLE ROW LEVEL SECURITY;

-- Drop ALL existing policies
DO $$ 
DECLARE
    pol RECORD;
BEGIN
    FOR pol IN 
        SELECT policyname, tablename 
        FROM pg_policies 
        WHERE schemaname = 'public' 
        AND tablename IN ('cameras', 'customers', 'bookings')
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I', pol.policyname, pol.tablename);
        RAISE NOTICE 'Dropped policy % on table %', pol.policyname, pol.tablename;
    END LOOP;
END $$;

-- =============================================================================
-- STEP 2: CREATE PERMISSIVE POLICIES FOR PUBLIC ACCESS
-- =============================================================================

-- Enable RLS on tables
ALTER TABLE cameras ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

-- CAMERAS - Allow public read access
CREATE POLICY "cameras_public_read" ON cameras
    FOR SELECT TO public USING (true);

-- CUSTOMERS - Allow public insert, read, update
CREATE POLICY "customers_public_insert" ON customers
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "customers_public_read" ON customers
    FOR SELECT TO public USING (true);

CREATE POLICY "customers_public_update" ON customers
    FOR UPDATE TO public USING (true) WITH CHECK (true);

-- BOOKINGS - Allow public insert, read, update
CREATE POLICY "bookings_public_insert" ON bookings
    FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "bookings_public_read" ON bookings
    FOR SELECT TO public USING (true);

CREATE POLICY "bookings_public_update" ON bookings
    FOR UPDATE TO public USING (true) WITH CHECK (true);

-- =============================================================================
-- STEP 3: GRANT NECESSARY PERMISSIONS
-- =============================================================================

-- Grant table permissions to public and anon roles
GRANT SELECT ON cameras TO public, anon;
GRANT SELECT, INSERT, UPDATE ON customers TO public, anon;
GRANT SELECT, INSERT, UPDATE ON bookings TO public, anon;

-- Grant sequence permissions for auto-incrementing IDs
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO public, anon;

-- =============================================================================
-- VERIFICATION
-- =============================================================================

SELECT 'RLS POLICIES FIXED - Public access enabled for booking registration!' as final_status;
