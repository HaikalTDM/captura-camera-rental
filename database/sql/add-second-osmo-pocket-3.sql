-- Add second DJI Osmo Pocket 3 to camera inventory
-- This script adds "DJI Osmo Pocket 3 (ii)" as a separate camera with its own calendar
-- Matches the exact structure of existing cameras

INSERT INTO cameras (
  name,
  brand,
  model,
  type,
  daily_rate,
  weekly_rate,
  monthly_rate,
  deposit_amount,
  description,
  specifications,
  image_url,
  is_available,
  total_quantity,
  available_quantity,
  condition,
  location,
  purchase_date,
  purchase_price,
  serial_number,
  warranty_expiry,
  last_maintenance,
  next_maintenance,
  notes
) VALUES (
  'DJI Osmo Pocket 3 (ii)',
  'DJI',
  'Osmo Pocket 3',
  'action',
  50,
  315,
  1350,
  100,
  'Professional compact camera with gimbal stabilization. Perfect for vlogging, content creation, and professional video production.',
  '{
    "Sensor": "1/1.3-inch CMOS, 9.4MP",
    "Video Resolution": "4K/120fps, 1080p/240fps",
    "Stabilization": "3-axis mechanical gimbal",
    "Screen": "2-inch rotatable touchscreen",
    "Battery Life": "Up to 166 minutes (4K/24fps)",
    "Storage": "Supports microSD up to 512GB",
    "Weight": "179g",
    "Special Features": "ActiveTrack 6.0, Face Tracking, Time-lapse, Slow Motion"
  }'::jsonb,
  '/images/osmo-pocket-31.jpg',
  true,
  1,
  1,
  'excellent',
  'Selayang',
  CURRENT_DATE,
  0,
  NULL,
  NULL,
  NULL,
  NULL,
  'Second Osmo Pocket 3 unit'
);

-- Get the ID of the newly inserted camera (for reference)
-- You can find it in the cameras table after running this script
SELECT id, name FROM cameras WHERE name = 'DJI Osmo Pocket 3 (ii)';

