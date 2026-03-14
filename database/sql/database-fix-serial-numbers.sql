-- CAPTURA Database Fix: Serial Number Unique Constraint Issue
-- Run this in your Supabase SQL Editor to fix existing empty serial numbers

-- 1. Update all empty serial numbers to NULL
-- This prevents unique constraint violations when multiple cameras have empty serial numbers
UPDATE cameras 
SET serial_number = NULL 
WHERE serial_number = '' OR serial_number IS NULL OR TRIM(serial_number) = '';

-- 2. Verify the fix - this should show how many cameras now have NULL serial numbers
SELECT 
    COUNT(*) as total_cameras,
    COUNT(serial_number) as cameras_with_serial_numbers,
    COUNT(*) - COUNT(serial_number) as cameras_without_serial_numbers
FROM cameras;

-- 3. Check for any remaining duplicate serial numbers (should be empty result)
SELECT serial_number, COUNT(*) as count
FROM cameras 
WHERE serial_number IS NOT NULL 
GROUP BY serial_number 
HAVING COUNT(*) > 1;

-- 4. Optional: Add a check constraint to prevent empty strings in the future
-- This ensures only NULL or non-empty strings are allowed
ALTER TABLE cameras 
ADD CONSTRAINT check_serial_number_not_empty 
CHECK (serial_number IS NULL OR TRIM(serial_number) != '');

-- Success message
SELECT 'Serial number unique constraint issue fixed successfully!' as status;

-- 5. Show current camera data to verify
SELECT 
    id,
    name,
    brand,
    model,
    serial_number,
    CASE 
        WHEN serial_number IS NULL THEN 'No Serial Number'
        ELSE 'Has Serial Number'
    END as serial_status
FROM cameras 
ORDER BY name;
