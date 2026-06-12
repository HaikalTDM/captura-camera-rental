-- ============================================
-- STUDIO ADMIN MIGRATION
-- Extends photography_bookings to support unified Studio admin
-- (videography + photography under one roof)
-- ============================================

-- 1. Add service_type to photography_bookings (defaults to 'photo' for existing rows)
ALTER TABLE photography_bookings
  ADD COLUMN IF NOT EXISTS service_type VARCHAR(20)
    DEFAULT 'photo'
    CHECK (service_type IN ('photo', 'video', 'combo'));

-- 2. Backfill existing rows
UPDATE photography_bookings
SET service_type = 'photo'
WHERE service_type IS NULL;

-- 3. Make NOT NULL after backfill
ALTER TABLE photography_bookings
  ALTER COLUMN service_type SET NOT NULL;

-- 4. Add index for fast filtering by service type
CREATE INDEX IF NOT EXISTS idx_photography_bookings_service_type
  ON photography_bookings(service_type);

-- 5. Add index for status + event_date (common dashboard query)
CREATE INDEX IF NOT EXISTS idx_photography_bookings_status_date
  ON photography_bookings(status, event_date);

-- 6. Optional: rename hint for future
-- The table is now logically a "studio_bookings" table.
-- We keep the name for backwards compat but treat it as unified studio bookings.

COMMENT ON COLUMN photography_bookings.service_type IS
  'Type of studio service: photo (photography only), video (videography only), or combo (both)';

-- ============================================
-- VIDEOGRAPHY PACKAGES (NEW TABLE)
-- ============================================
-- Mirrors photography_packages but for video offerings
CREATE TABLE IF NOT EXISTS videography_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN ('wedding', 'corporate', 'event', 'social-reel', 'highlight')),
  duration_hours INTEGER NOT NULL,

  -- Pricing
  base_price DECIMAL(10,2) NOT NULL,

  -- Deliverables
  highlight_length_min INTEGER, -- e.g. 3-5 min
  full_film_length_min INTEGER, -- e.g. 15-30 min
  drone_included BOOLEAN DEFAULT FALSE,
  same_day_edit BOOLEAN DEFAULT FALSE,

  -- Settings
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INTEGER DEFAULT 0,

  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_videography_packages_active
  ON videography_packages(is_active, sort_order);

-- Seed initial videography packages
INSERT INTO videography_packages (name, description, category, duration_hours, base_price, highlight_length_min, sort_order, is_active)
VALUES
  ('Wedding Highlight', 'Cinematic 3-5 minute highlight reel from your wedding day.', 'wedding', 8, 800.00, 5, 1, TRUE),
  ('Wedding Full Film', '15-30 minute documentary-style wedding film with highlight included.', 'wedding', 10, 1500.00, 30, 2, TRUE),
  ('Corporate Video', '1-3 minute brand video for company profiles, testimonials, recaps.', 'corporate', 4, 1200.00, 3, 3, TRUE),
  ('Social Reels Package', '3 short-form vertical videos optimized for Instagram & TikTok.', 'social-reel', 2, 500.00, 1, 4, TRUE),
  ('Event Recap', 'Dynamic 1-2 minute event recap video.', 'event', 4, 650.00, 2, 5, TRUE)
ON CONFLICT DO NOTHING;
