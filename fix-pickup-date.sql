-- CAPTURA Pickup Date Fix
-- This creates a trigger to automatically calculate pickup_date = start_date - 1 day

-- 1. Add pickup_date field to bookings table (if not exists)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_date DATE;

-- 2. Create function to automatically calculate pickup date
CREATE OR REPLACE FUNCTION calculate_pickup_date(rental_start_date DATE)
RETURNS DATE AS $$
BEGIN
    -- Pickup date is one day before rental start date
    RETURN rental_start_date - INTERVAL '1 day';
END;
$$ LANGUAGE plpgsql;

-- 3. Create trigger function to automatically set pickup_date
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

-- 5. Fix existing bookings (update all existing records)
UPDATE bookings 
SET pickup_date = calculate_pickup_date(start_date::DATE)
WHERE pickup_date IS NULL OR pickup_date != (start_date::DATE - INTERVAL '1 day')::DATE;

-- 6. Verify the fix
SELECT 
    id,
    start_date,
    pickup_date,
    start_date::DATE - pickup_date::DATE as days_difference
FROM bookings
ORDER BY created_at DESC
LIMIT 10;

