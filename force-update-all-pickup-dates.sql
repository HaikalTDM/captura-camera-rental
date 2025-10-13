-- Force update ALL existing bookings to recalculate pickup dates
-- This ensures every booking has the correct pickup date

UPDATE bookings 
SET pickup_date = (start_date::DATE - INTERVAL '1 day')::DATE
WHERE start_date IS NOT NULL;

-- Verify the update
SELECT 
    id,
    customer_id,
    start_date,
    pickup_date,
    (start_date::DATE - pickup_date::DATE) as days_difference,
    CASE 
        WHEN (start_date::DATE - pickup_date::DATE) = 1 THEN '✅ CORRECT'
        ELSE '❌ WRONG'
    END as status
FROM bookings
WHERE start_date IS NOT NULL
ORDER BY created_at DESC
LIMIT 10;

