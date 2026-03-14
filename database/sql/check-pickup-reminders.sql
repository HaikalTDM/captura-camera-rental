-- Check which bookings should get pickup reminders today
-- Run this in Supabase SQL Editor

SELECT 
  b.id,
  b.booking_status,
  b.pickup_date,
  b.start_date,
  b.equipment_picked_up,
  b.equipment_returned,
  c.full_name as customer_name,
  c.email as customer_email,
  cam.name as camera_name
FROM bookings b
LEFT JOIN customers c ON b.customer_id = c.id
LEFT JOIN cameras cam ON b.camera_id = cam.id
WHERE b.pickup_date = CURRENT_DATE
  AND b.equipment_picked_up = false
  AND b.booking_status = 'confirmed'
ORDER BY b.created_at DESC;

-- This will show you if there are any bookings that should get reminders today

