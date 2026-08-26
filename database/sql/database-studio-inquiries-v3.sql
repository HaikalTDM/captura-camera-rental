-- ============================================
-- STUDIO INQUIRIES v3 — Graduation Photography
-- Adds the 'graduation' service type so the
-- graduation inquiry form saves to the same
-- table as the other services.
-- ============================================

ALTER TABLE studio_inquiries
  DROP CONSTRAINT IF EXISTS studio_inquiries_service_type_check;

ALTER TABLE studio_inquiries
  ADD CONSTRAINT studio_inquiries_service_type_check
  CHECK (service_type IN ('photography', 'videography', 'weddings', 'corporate', 'events', 'content', 'graduation'));

DROP INDEX IF EXISTS idx_studio_inquiries_service;
CREATE INDEX idx_studio_inquiries_service ON studio_inquiries(service_type, created_at DESC);

COMMENT ON TABLE studio_inquiries IS
  'All quote form submissions from /studio and /portfolio. service_type now includes graduation.';
