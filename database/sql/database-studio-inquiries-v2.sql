-- ============================================
-- STUDIO INQUIRIES v2 — Production Services
-- Extends studio_inquiries to support the four
-- production service lines on /portfolio:
--   weddings, corporate, events, content
-- plus their service-specific columns.
-- ============================================

-- 1. Widen the service_type CHECK constraint
ALTER TABLE studio_inquiries
  DROP CONSTRAINT IF EXISTS studio_inquiries_service_type_check;

ALTER TABLE studio_inquiries
  ADD CONSTRAINT studio_inquiries_service_type_check
  CHECK (service_type IN ('photography', 'videography', 'weddings', 'corporate', 'events', 'content'));

-- 2. New columns for corporate / content inquiries
ALTER TABLE studio_inquiries
  ADD COLUMN IF NOT EXISTS project_timeline VARCHAR(100);

ALTER TABLE studio_inquiries
  ADD COLUMN IF NOT EXISTS budget_range VARCHAR(100);

ALTER TABLE studio_inquiries
  ADD COLUMN IF NOT EXISTS content_type VARCHAR(100);

ALTER TABLE studio_inquiries
  ADD COLUMN IF NOT EXISTS upload_frequency VARCHAR(100);

-- 3. Keep the index up to date for the new service types
DROP INDEX IF EXISTS idx_studio_inquiries_service;
CREATE INDEX idx_studio_inquiries_service ON studio_inquiries(service_type, created_at DESC);

COMMENT ON TABLE studio_inquiries IS
  'All quote form submissions from /studio and /portfolio. service_type now includes weddings, corporate, events, content.';
