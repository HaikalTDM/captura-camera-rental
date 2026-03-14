-- Insert Fujifilm X-T30 II with base details (we use the highest variant or base as default)
-- The variant pricing will be injected dynamically on the frontend
INSERT INTO cameras (
  id,
  name,
  brand,
  model,
  type,
  daily_rate,
  weekly_rate,
  monthly_rate,
  deposit_amount,
  discount_threshold,
  description,
  specifications,
  image_url,
  is_available,
  total_quantity,
  available_quantity,
  display_order,
  condition
) VALUES (
  'fujifilm-xt30-mark-ii',
  'Fujifilm X-T30 II',
  'Fujifilm',
  'X-T30 II',
  'mirrorless',
  100,
  630, -- RM90 * 7
  2700,
  100,
  3,
  'The Fujifilm X-T30 II is a compact, lightweight mirrorless camera offering superior image quality and iconic Fujifilm color science. Perfect for photography enthusiasts who want exceptional performance in a portable body.',
  '{
    "Sensor": "26.1MP APS-C X-Trans BSI CMOS 4",
    "Focus": "Fast hybrid autofocus with advanced face/eye detection",
    "Video": "DCI and UHD 4K at up to 30p",
    "Screen": "3.0\" 1.62m-dot tilting touchscreen",
    "Film Simulations": "18 unique Fujifilm film simulation modes",
    "Weight": "378px (body only)",
    "Battery Life": "Approx. 390 frames"
  }'::jsonb,
  '/images/fujifilm-xt30-ii.jpg',
  true,
  1,
  1,
  1, -- High priority/new camera
  'excellent'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  daily_rate = EXCLUDED.daily_rate,
  weekly_rate = EXCLUDED.weekly_rate,
  description = EXCLUDED.description,
  specifications = EXCLUDED.specifications;
