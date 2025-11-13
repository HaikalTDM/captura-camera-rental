-- Add Canon R50 - Mother camera entry
-- This camera is hidden from client website (is_available = false)
-- Revenue from this camera is tracked separately from main CAPTURA business

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
  display_order,
  condition,
  location,
  notes,
  discount_threshold,
  purchase_date
) VALUES (
  'Canon R50 - Mother',
  'Canon',
  'EOS R50',
  'mirrorless',
  50,
  315,
  1350,
  100,
  'Canon EOS R50 mirrorless camera. Managed separately for Mother''s rental business. Not displayed on client website.',
  '{
    "Sensor": "24.2MP APS-C CMOS",
    "Video Resolution": "4K/30fps, 1080p/120fps",
    "Autofocus": "Dual Pixel CMOS AF II",
    "ISO Range": "100-32000 (expandable to 51200)",
    "Screen": "3-inch vari-angle touchscreen",
    "Viewfinder": "2.36M-dot OLED EVF",
    "Battery Life": "Approx. 370 shots",
    "Weight": "375g (body only)",
    "Mount": "Canon RF",
    "Connectivity": "Wi-Fi, Bluetooth"
  }'::jsonb,
  '/images/canon-r50.jpg',
  false, -- Hidden from client website
  1,
  1,
  999, -- Display order (doesn't matter since hidden)
  'excellent',
  'Mother''s Location',
  'MOTHER CAMERA - Revenue tracked separately. Not shown on client website. AI booking keyword: "R50 mother"',
  3, -- 3+ days for discount rate
  CURRENT_DATE -- Purchase date (today)
);

-- Verify the camera was added
SELECT 
  id, 
  name, 
  brand, 
  model, 
  daily_rate, 
  is_available,
  notes
FROM cameras 
WHERE name = 'Canon R50 - Mother';

-- Show confirmation
DO $$
DECLARE
  camera_id UUID;
BEGIN
  SELECT id INTO camera_id FROM cameras WHERE name = 'Canon R50 - Mother';
  RAISE NOTICE 'Canon R50 - Mother camera added successfully!';
  RAISE NOTICE 'Camera ID: %', camera_id;
  RAISE NOTICE 'Hidden from client website: is_available = false';
  RAISE NOTICE 'Revenue will be tracked separately from main CAPTURA business';
END $$;

