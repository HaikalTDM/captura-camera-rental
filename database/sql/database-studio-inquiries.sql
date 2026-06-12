-- ============================================
-- STUDIO INQUIRIES TABLE
-- Captures all "Get Quote" form submissions for paper trail
-- Independent of WhatsApp — every inquiry is saved
-- ============================================

CREATE TABLE IF NOT EXISTS studio_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Service & contact
  service_type VARCHAR(20) NOT NULL CHECK (service_type IN ('photography', 'videography')),
  client_name VARCHAR(255) NOT NULL,
  client_phone VARCHAR(50) NOT NULL,
  client_email VARCHAR(255),

  -- Event/project details (shared)
  event_type VARCHAR(100) NOT NULL,
  event_date DATE,
  event_start_time TIME,
  venue TEXT NOT NULL,
  coverage_duration VARCHAR(100),

  -- Photography-specific
  guest_count VARCHAR(50),
  shooter_setup VARCHAR(100),

  -- Videography-specific
  final_video_length VARCHAR(100),
  drone_needed VARCHAR(50),
  style_preference VARCHAR(100),

  -- Notes & status
  special_requests TEXT,
  status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'quoted', 'booked', 'lost')),
  source VARCHAR(50) DEFAULT 'website',

  -- Admin tracking
  admin_notes TEXT,
  contacted_at TIMESTAMP WITH TIME ZONE,
  converted_booking_id UUID REFERENCES photography_bookings(id) ON DELETE SET NULL,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_studio_inquiries_status ON studio_inquiries(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_inquiries_service ON studio_inquiries(service_type, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_studio_inquiries_event_date ON studio_inquiries(event_date);
CREATE INDEX IF NOT EXISTS idx_studio_inquiries_phone ON studio_inquiries(client_phone);

-- Auto-update updated_at on changes
CREATE OR REPLACE FUNCTION update_studio_inquiries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_studio_inquiries_updated_at ON studio_inquiries;
CREATE TRIGGER trg_studio_inquiries_updated_at
  BEFORE UPDATE ON studio_inquiries
  FOR EACH ROW
  EXECUTE FUNCTION update_studio_inquiries_updated_at();

COMMENT ON TABLE studio_inquiries IS
  'All quote form submissions from /studio. Independent of bookings - inquiries become bookings when confirmed.';
