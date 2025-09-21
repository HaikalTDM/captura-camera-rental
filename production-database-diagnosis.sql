-- CAPTURA Production Database Diagnosis
-- Run this script FIRST in your production Supabase SQL Editor to identify issues
-- This will help us understand what's missing or broken

-- =============================================================================
-- STEP 1: CHECK TABLE EXISTENCE AND STRUCTURE
-- =============================================================================

-- Check if all required tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('cameras', 'customers', 'bookings', 'payment_records', 'maintenance_records')
ORDER BY table_name;

-- =============================================================================
-- STEP 2: CHECK FOREIGN KEY CONSTRAINTS
-- =============================================================================

-- Check existing foreign key constraints
SELECT 
    tc.table_name,
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
AND tc.table_name IN ('bookings', 'payment_records', 'maintenance_records')
ORDER BY tc.table_name, tc.constraint_name;

-- =============================================================================
-- STEP 3: CHECK CRITICAL COLUMNS IN EACH TABLE
-- =============================================================================

-- Check cameras table structure
SELECT 'CAMERAS TABLE STRUCTURE:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'cameras'
ORDER BY ordinal_position;

-- Check customers table structure
SELECT 'CUSTOMERS TABLE STRUCTURE:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'customers'
ORDER BY ordinal_position;

-- Check bookings table structure
SELECT 'BOOKINGS TABLE STRUCTURE:' as info;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'bookings'
ORDER BY ordinal_position;

-- =============================================================================
-- STEP 4: CHECK ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================================================

-- Check RLS status for each table
SELECT
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('cameras', 'customers', 'bookings', 'payment_records');

-- Check existing RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE schemaname = 'public'
AND tablename IN ('cameras', 'customers', 'bookings', 'payment_records')
ORDER BY tablename, policyname;

-- =============================================================================
-- STEP 5: CHECK DATA INTEGRITY
-- =============================================================================

-- Count records in each table
SELECT 'cameras' as table_name, COUNT(*) as record_count FROM cameras
UNION ALL
SELECT 'customers' as table_name, COUNT(*) as record_count FROM customers
UNION ALL
SELECT 'bookings' as table_name, COUNT(*) as record_count FROM bookings
UNION ALL
SELECT 'payment_records' as table_name, COUNT(*) as record_count FROM payment_records;

-- Check for orphaned records (bookings without valid camera_id or customer_id)
SELECT 'ORPHANED BOOKINGS CHECK:' as info;

-- Bookings with invalid camera_id
SELECT 
    'Invalid camera_id' as issue,
    COUNT(*) as count
FROM bookings b
LEFT JOIN cameras c ON b.camera_id = c.id
WHERE c.id IS NULL;

-- Bookings with invalid customer_id
SELECT 
    'Invalid customer_id' as issue,
    COUNT(*) as count
FROM bookings b
LEFT JOIN customers c ON b.customer_id = c.id
WHERE c.id IS NULL;

-- =============================================================================
-- STEP 6: CHECK SPECIFIC MISSING COLUMNS
-- =============================================================================

-- Check for missing columns that cause errors
SELECT 'MISSING COLUMNS CHECK:' as info;

-- Check if customers table has 'name' column (vs 'full_name')
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'name') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as customers_name_column;

-- Check if customers table has 'reliability_score' column
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'reliability_score') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as customers_reliability_score_column;

-- Check if customers table has 'total_bookings' column
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'total_bookings') 
        THEN 'EXISTS' 
        ELSE 'MISSING' 
    END as customers_total_bookings_column;

-- =============================================================================
-- FINAL DIAGNOSIS SUMMARY
-- =============================================================================

SELECT 'DIAGNOSIS COMPLETE - Review the results above to identify issues' as final_status;
