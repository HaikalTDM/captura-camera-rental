-- CAPTURA Complete Booking System Database Schema
-- This script ensures all required columns exist in the bookings table

-- 1. First, ensure the bookings table has all required columns
-- Add missing columns if they don't exist

-- Core booking columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_method VARCHAR(20) DEFAULT 'pickup' CHECK (pickup_method IN ('pickup', 'delivery'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_source VARCHAR(20) DEFAULT 'website' CHECK (booking_source IN ('website', 'phone', 'whatsapp', 'walk-in', 'historical', 'manual'));
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;

-- Approval workflow columns
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_status VARCHAR(50) DEFAULT 'pending_approval' CHECK (booking_status IN (
  'pending_approval',
  'confirmed', 
  'rejected',
  'cancelled',
  'completed'
));

-- Admin approval fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES auth.users(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT;

-- WhatsApp booking fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS whatsapp_message_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS whatsapp_sent_at TIMESTAMP WITH TIME ZONE;

-- 2. Update existing bookings to have default values for new columns
UPDATE bookings SET daily_rate = 50.00 WHERE daily_rate IS NULL;
UPDATE bookings SET pickup_method = 'pickup' WHERE pickup_method IS NULL;
UPDATE bookings SET delivery_fee = 0.00 WHERE delivery_fee IS NULL;
UPDATE bookings SET booking_source = 'website' WHERE booking_source IS NULL;
UPDATE bookings SET booking_status = 'pending_approval' WHERE booking_status IS NULL;

-- 3. Create booking_status_history table if it doesn't exist
CREATE TABLE IF NOT EXISTS booking_status_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id UUID NOT NULL REFERENCES bookings(id) ON DELETE CASCADE,
  old_status VARCHAR(50),
  new_status VARCHAR(50) NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  changed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reason TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Create calendar_blocks table if it doesn't exist
CREATE TABLE IF NOT EXISTS calendar_blocks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  camera_id VARCHAR(255) NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  block_type VARCHAR(50) DEFAULT 'booking' CHECK (block_type IN (
    'booking',
    'maintenance', 
    'unavailable',
    'admin_block'
  )),
  booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
  reason TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_camera_dates ON bookings(camera_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_camera_dates ON calendar_blocks(camera_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_booking_status_history_booking ON booking_status_history(booking_id);

-- 6. Create function to automatically create calendar blocks when booking is confirmed
CREATE OR REPLACE FUNCTION create_calendar_block_on_confirmation()
RETURNS TRIGGER AS $$
BEGIN
  -- If booking status changed to 'confirmed', create calendar block
  IF OLD.booking_status != 'confirmed' AND NEW.booking_status = 'confirmed' THEN
    INSERT INTO calendar_blocks (
      camera_id,
      start_date,
      end_date,
      block_type,
      booking_id,
      reason,
      created_by
    ) VALUES (
      NEW.camera_id,
      NEW.start_date,
      NEW.end_date,
      'booking',
      NEW.id,
      'Automatically created from confirmed booking',
      NEW.approved_by
    );
  END IF;

  -- If booking status changed from 'confirmed' to something else, remove calendar block
  IF OLD.booking_status = 'confirmed' AND NEW.booking_status != 'confirmed' THEN
    DELETE FROM calendar_blocks 
    WHERE booking_id = NEW.id AND block_type = 'booking';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 7. Create trigger for automatic calendar block management
DROP TRIGGER IF EXISTS trigger_booking_status_calendar_block ON bookings;
CREATE TRIGGER trigger_booking_status_calendar_block
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION create_calendar_block_on_confirmation();

-- 8. Create function to log booking status changes
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.booking_status IS DISTINCT FROM NEW.booking_status THEN
    INSERT INTO booking_status_history (
      booking_id,
      old_status,
      new_status,
      changed_by,
      reason,
      notes
    ) VALUES (
      NEW.id,
      OLD.booking_status,
      NEW.booking_status,
      NEW.approved_by,
      NEW.rejection_reason,
      NEW.admin_notes
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. Create trigger for status change logging
DROP TRIGGER IF EXISTS trigger_log_booking_status_change ON bookings;
CREATE TRIGGER trigger_log_booking_status_change
  AFTER UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION log_booking_status_change();

-- 10. Create function to check camera availability
CREATE OR REPLACE FUNCTION check_camera_availability(
  p_camera_id VARCHAR(255),
  p_start_date DATE,
  p_end_date DATE,
  p_exclude_booking_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  conflict_count INTEGER;
BEGIN
  -- Check for overlapping confirmed bookings
  SELECT COUNT(*) INTO conflict_count
  FROM bookings
  WHERE camera_id = p_camera_id
    AND booking_status = 'confirmed'
    AND (p_exclude_booking_id IS NULL OR id != p_exclude_booking_id)
    AND (
      (start_date <= p_start_date AND end_date > p_start_date) OR
      (start_date < p_end_date AND end_date >= p_end_date) OR
      (start_date >= p_start_date AND end_date <= p_end_date)
    );

  -- Check for calendar blocks
  SELECT COUNT(*) + conflict_count INTO conflict_count
  FROM calendar_blocks
  WHERE camera_id = p_camera_id
    AND (p_exclude_booking_id IS NULL OR booking_id != p_exclude_booking_id)
    AND (
      (start_date <= p_start_date AND end_date > p_start_date) OR
      (start_date < p_end_date AND end_date >= p_end_date) OR
      (start_date >= p_start_date AND end_date <= p_end_date)
    );

  RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- 11. Enable Row Level Security (RLS) for new tables
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_blocks ENABLE ROW LEVEL SECURITY;

-- 12. Create RLS policies for admin access (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Admin can view all booking status history" ON booking_status_history;
CREATE POLICY "Admin can view all booking status history" ON booking_status_history
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can view all calendar blocks" ON calendar_blocks;
CREATE POLICY "Admin can view all calendar blocks" ON calendar_blocks
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage calendar blocks" ON calendar_blocks;
CREATE POLICY "Admin can manage calendar blocks" ON calendar_blocks
  FOR ALL USING (true);

-- 13. Create view for admin dashboard (drop existing first to avoid conflicts)
DROP VIEW IF EXISTS admin_booking_dashboard;
CREATE VIEW admin_booking_dashboard AS
SELECT
  b.*,
  c.name as customer_name,
  c.email as customer_email,
  c.phone as customer_phone,
  CASE
    WHEN b.booking_status = 'pending_approval' THEN 'Needs Review'
    WHEN b.booking_status = 'confirmed' THEN 'Confirmed'
    WHEN b.booking_status = 'rejected' THEN 'Rejected'
    WHEN b.booking_status = 'cancelled' THEN 'Cancelled'
    WHEN b.booking_status = 'completed' THEN 'Completed'
  END as status_display,
  (b.end_date < CURRENT_DATE) as is_past_due
FROM bookings b
LEFT JOIN customers c ON b.customer_id = c.id
ORDER BY
  CASE b.booking_status
    WHEN 'pending_approval' THEN 1
    WHEN 'confirmed' THEN 2
    ELSE 3
  END,
  b.created_at DESC;

-- 14. Refresh schema cache (PostgREST will automatically detect schema changes)
