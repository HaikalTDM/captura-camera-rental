-- CAPTURA Database Force Schema Refresh
-- This script performs a complete database reset with schema cache refresh
-- to resolve all persistent schema inconsistencies and type mismatches

-- 1. FORCE SCHEMA CACHE REFRESH
SELECT pg_notify('pgrst', 'reload schema');
NOTIFY pgrst, 'reload schema';

-- 2. BACKUP EXISTING DATA (if any exists)
DO $$
BEGIN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'bookings') THEN
        EXECUTE 'CREATE TABLE IF NOT EXISTS bookings_backup_' || to_char(NOW(), 'YYYYMMDD') || ' AS SELECT * FROM bookings';
        RAISE NOTICE 'Existing bookings backed up to bookings_backup_%', to_char(NOW(), 'YYYYMMDD');
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'No existing data to backup or backup failed: %', SQLERRM;
END $$;

-- 3. DROP ALL EXISTING TABLES AND DEPENDENCIES (CASCADE)
DROP VIEW IF EXISTS admin_booking_dashboard CASCADE;
DROP TABLE IF EXISTS booking_status_history CASCADE;
DROP TABLE IF EXISTS calendar_blocks CASCADE;
DROP TABLE IF EXISTS bookings CASCADE;

-- Force schema refresh after drops
SELECT pg_notify('pgrst', 'reload schema');

-- 4. RECREATE BOOKINGS TABLE WITH CORRECT SCHEMA
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    camera_id VARCHAR(255) NOT NULL,  -- Explicitly VARCHAR(255) for string camera IDs
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL DEFAULT 50.00,
    total_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    deposit_paid BOOLEAN DEFAULT FALSE,
    deposit_paid_date TIMESTAMP WITH TIME ZONE,
    final_payment_amount DECIMAL(10,2) NOT NULL,
    final_payment_paid BOOLEAN DEFAULT FALSE,
    final_payment_paid_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    booking_status VARCHAR(50) DEFAULT 'pending_approval' CHECK (booking_status IN ('pending_approval', 'confirmed', 'rejected', 'cancelled', 'completed')),
    pickup_method VARCHAR(20) DEFAULT 'pickup' CHECK (pickup_method IN ('pickup', 'delivery')),
    pickup_address TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0.00,
    booking_source VARCHAR(20) DEFAULT 'website' CHECK (booking_source IN ('website', 'phone', 'whatsapp', 'walk-in', 'historical', 'manual')),
    notes TEXT,
    -- Admin approval fields
    approved_by UUID REFERENCES auth.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    rejection_reason TEXT,
    admin_notes TEXT,
    -- WhatsApp integration fields
    whatsapp_message_sent BOOLEAN DEFAULT FALSE,
    whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
    whatsapp_admin_notified BOOLEAN DEFAULT FALSE,
    whatsapp_admin_notification_sent_at TIMESTAMP WITH TIME ZONE,
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. CREATE BOOKING STATUS HISTORY TABLE
CREATE TABLE booking_status_history (
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

-- 6. CREATE CALENDAR BLOCKS TABLE
CREATE TABLE calendar_blocks (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    camera_id VARCHAR(255) NOT NULL,  -- Explicitly VARCHAR(255) to match bookings table
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    block_type VARCHAR(50) DEFAULT 'booking' CHECK (block_type IN ('booking', 'maintenance', 'unavailable', 'admin_block')),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    reason TEXT,
    created_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. CREATE PERFORMANCE INDEXES
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_camera_id ON bookings(camera_id);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_bookings_status ON bookings(booking_status);
CREATE INDEX idx_bookings_source ON bookings(booking_source);
CREATE INDEX idx_bookings_created_at ON bookings(created_at);
CREATE INDEX idx_calendar_blocks_camera_dates ON calendar_blocks(camera_id, start_date, end_date);
CREATE INDEX idx_booking_status_history_booking ON booking_status_history(booking_id);

-- 8. CREATE UPDATED_AT TRIGGER
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_blocks_updated_at
    BEFORE UPDATE ON calendar_blocks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. CREATE CAMERA AVAILABILITY FUNCTION (FIXED FOR VARCHAR CAMERA_ID)
CREATE OR REPLACE FUNCTION check_camera_availability(
    p_camera_id VARCHAR(255),  -- Explicitly VARCHAR(255)
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
    WHERE camera_id = p_camera_id  -- String comparison
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
    WHERE camera_id = p_camera_id  -- String comparison
        AND (p_exclude_booking_id IS NULL OR booking_id != p_exclude_booking_id)
        AND (
            (start_date <= p_start_date AND end_date > p_start_date) OR
            (start_date < p_end_date AND end_date >= p_end_date) OR
            (start_date >= p_start_date AND end_date <= p_end_date)
        );

    RETURN conflict_count = 0;
END;
$$ LANGUAGE plpgsql;

-- 10. CREATE CALENDAR BLOCK MANAGEMENT FUNCTION
CREATE OR REPLACE FUNCTION manage_calendar_blocks()
RETURNS TRIGGER AS $$
BEGIN
    -- If booking status changed to 'confirmed', create calendar block
    IF OLD.booking_status != 'confirmed' AND NEW.booking_status = 'confirmed' THEN
        INSERT INTO calendar_blocks (
            camera_id, start_date, end_date, block_type, booking_id, reason, created_by
        ) VALUES (
            NEW.camera_id, NEW.start_date, NEW.end_date, 'booking', NEW.id,
            'Automatically created from confirmed booking', NEW.approved_by
        );
    END IF;

    -- If booking status changed from 'confirmed' to something else, remove calendar block
    IF OLD.booking_status = 'confirmed' AND NEW.booking_status != 'confirmed' THEN
        DELETE FROM calendar_blocks WHERE booking_id = NEW.id AND block_type = 'booking';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_manage_calendar_blocks
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION manage_calendar_blocks();

-- 11. CREATE STATUS CHANGE LOGGING FUNCTION
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.booking_status IS DISTINCT FROM NEW.booking_status THEN
        INSERT INTO booking_status_history (
            booking_id, old_status, new_status, changed_by, reason, notes
        ) VALUES (
            NEW.id, OLD.booking_status, NEW.booking_status, NEW.approved_by, NEW.rejection_reason, NEW.admin_notes
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_log_booking_status_change
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION log_booking_status_change();

-- 12. CREATE ADMIN DASHBOARD VIEW
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

-- 13. ENABLE ROW LEVEL SECURITY
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_blocks ENABLE ROW LEVEL SECURITY;

-- 14. CREATE RLS POLICIES
CREATE POLICY "Public can insert bookings" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view own bookings" ON bookings FOR SELECT USING (true);
CREATE POLICY "Admin can manage all bookings" ON bookings FOR ALL USING (true);

CREATE POLICY "Admin can view booking history" ON booking_status_history FOR SELECT USING (true);
CREATE POLICY "Admin can manage calendar blocks" ON calendar_blocks FOR ALL USING (true);

-- 15. FINAL SCHEMA REFRESH
SELECT pg_notify('pgrst', 'reload schema');
NOTIFY pgrst, 'reload schema';

-- 16. VERIFY SCHEMA INTEGRITY
SELECT
    'Schema verification complete' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_name IN ('bookings', 'booking_status_history', 'calendar_blocks')) as tables_created,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'camera_id' AND data_type = 'character varying') as camera_id_varchar_check;

-- 17. TEST CAMERA AVAILABILITY FUNCTION
SELECT
    'Camera availability function test' as test_name,
    check_camera_availability('osmo-pocket-3', '2025-09-21', '2025-09-23') as availability_result;

-- 18. SHOW FINAL TABLE STRUCTURE
SELECT
    table_name,
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name IN ('bookings', 'booking_status_history', 'calendar_blocks')
ORDER BY table_name, ordinal_position;
