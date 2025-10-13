-- Verify pickup dates in the database
-- This will show you the actual data to see if the fix worked

SELECT 
    id,
    booking_status,
    start_date,
    pickup_date,
    CASE 
        WHEN pickup_date IS NULL THEN '❌ No pickup_date'
        WHEN pickup_date = (start_date::DATE - INTERVAL '1 day')::DATE THEN '✅ Correct (1 day before)'
        ELSE '❌ Wrong: ' || (start_date::DATE - pickup_date::DATE)::TEXT || ' days difference'
    END as status
FROM bookings
WHERE booking_status IN ('confirmed', 'approved', 'pending_approval')
ORDER BY start_date DESC
LIMIT 10;

