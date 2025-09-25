-- CAPTURA Pickup Scheduling System Database Schema
-- Business Rule: Customers must pick up cameras one day before rental start date

-- 1. Add pickup_date field to bookings table
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_date DATE;

-- 2. Create function to automatically calculate pickup date
CREATE OR REPLACE FUNCTION calculate_pickup_date(rental_start_date DATE)
RETURNS DATE AS $$
BEGIN
    -- Pickup date is one day before rental start date
    RETURN rental_start_date - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger function to automatically set pickup_date when booking is created/updated
CREATE OR REPLACE FUNCTION set_pickup_date()
RETURNS TRIGGER AS $$
BEGIN
    -- Automatically calculate pickup_date based on start_date
    NEW.pickup_date := calculate_pickup_date(NEW.start_date);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Create trigger to automatically set pickup_date
DROP TRIGGER IF EXISTS trigger_set_pickup_date ON bookings;
CREATE TRIGGER trigger_set_pickup_date
    BEFORE INSERT OR UPDATE OF start_date ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION set_pickup_date();

-- 5. Update existing bookings to have pickup_date
UPDATE bookings 
SET pickup_date = calculate_pickup_date(start_date)
WHERE pickup_date IS NULL;

-- 6. Create index for efficient pickup date queries
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON bookings(pickup_date);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_status ON bookings(pickup_date, equipment_picked_up);

-- 7. Create view for today's pickups
CREATE OR REPLACE VIEW todays_pickups AS
SELECT 
    b.*,
    c.full_name as customer_name,
    c.phone as customer_phone,
    c.email as customer_email,
    cam.name as camera_name,
    cam.model as camera_model
FROM bookings b
LEFT JOIN customers c ON b.customer_id = c.id
LEFT JOIN cameras cam ON b.camera_id = cam.id
WHERE b.pickup_date = CURRENT_DATE
  AND b.booking_status = 'confirmed'
  AND b.equipment_picked_up = FALSE
ORDER BY b.created_at ASC;

-- 8. Add comments for documentation
COMMENT ON COLUMN bookings.pickup_date IS 'Date when customer should pick up equipment (start_date - 1 day)';
COMMENT ON FUNCTION calculate_pickup_date(DATE) IS 'Calculates pickup date as one day before rental start date';
COMMENT ON VIEW todays_pickups IS 'View showing all pickups scheduled for today that have not been completed';

-- 9. Verify the schema
SELECT 
    'pickup_date column exists' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'bookings' AND column_name = 'pickup_date'
        ) THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
UNION ALL
SELECT 
    'pickup_date trigger exists' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.triggers 
            WHERE trigger_name = 'trigger_set_pickup_date'
        ) THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status
UNION ALL
SELECT 
    'todays_pickups view exists' as check_name,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.views 
            WHERE table_name = 'todays_pickups'
        ) THEN '✅ PASS' 
        ELSE '❌ FAIL' 
    END as status;
