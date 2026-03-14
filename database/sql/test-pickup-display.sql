-- Check which bookings should appear in "Upcoming Pickups"
-- Only confirmed/approved bookings that haven't been picked up show there

SELECT 
    id,
    booking_status,
    equipment_picked_up,
    start_date,
    pickup_date,
    CASE 
        WHEN booking_status IN ('confirmed', 'approved') AND equipment_picked_up = false 
        THEN '✅ Will show in Upcoming Pickups'
        WHEN booking_status = 'pending_approval'
        THEN '⏳ Needs approval first'
        WHEN equipment_picked_up = true
        THEN '✅ Already picked up'
        ELSE '❌ Not eligible'
    END as status
FROM bookings
ORDER BY created_at DESC
LIMIT 10;

-- If you need to approve a booking for testing, use:
-- UPDATE bookings SET booking_status = 'confirmed' WHERE id = 'YOUR_BOOKING_ID';

