-- CAPTURA Final Bookings Table Schema Update
-- This ensures ALL required columns exist in the bookings table

-- 1. Add ALL missing columns that might be needed
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS daily_rate DECIMAL(10,2) DEFAULT 50.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_method VARCHAR(20) DEFAULT 'pickup';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS pickup_address TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS delivery_fee DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_source VARCHAR(20) DEFAULT 'website';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS booking_status VARCHAR(50) DEFAULT 'pending_approval';
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS approved_by UUID;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS approved_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS whatsapp_message_sent BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS whatsapp_sent_at TIMESTAMP WITH TIME ZONE;

-- 2. Ensure payment tracking columns exist
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS deposit_paid_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_payment_paid BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS final_payment_paid_date TIMESTAMP WITH TIME ZONE;

-- 3. Update any NULL values to have proper defaults
UPDATE bookings SET daily_rate = 50.00 WHERE daily_rate IS NULL;
UPDATE bookings SET pickup_method = 'pickup' WHERE pickup_method IS NULL;
UPDATE bookings SET delivery_fee = 0.00 WHERE delivery_fee IS NULL;
UPDATE bookings SET booking_source = 'website' WHERE booking_source IS NULL;
UPDATE bookings SET booking_status = 'pending_approval' WHERE booking_status IS NULL;
UPDATE bookings SET deposit_paid = FALSE WHERE deposit_paid IS NULL;
UPDATE bookings SET final_payment_paid = FALSE WHERE final_payment_paid IS NULL;
UPDATE bookings SET whatsapp_message_sent = FALSE WHERE whatsapp_message_sent IS NULL;

-- 4. Add constraints for data integrity (drop existing first to avoid conflicts)
DO $$
BEGIN
    -- Drop constraints if they exist, then recreate them
    BEGIN
        ALTER TABLE bookings DROP CONSTRAINT IF EXISTS chk_pickup_method;
        ALTER TABLE bookings ADD CONSTRAINT chk_pickup_method
          CHECK (pickup_method IN ('pickup', 'delivery'));
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore errors
    END;

    BEGIN
        ALTER TABLE bookings DROP CONSTRAINT IF EXISTS chk_booking_source;
        ALTER TABLE bookings ADD CONSTRAINT chk_booking_source
          CHECK (booking_source IN ('website', 'phone', 'whatsapp', 'walk-in', 'historical', 'manual'));
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore errors
    END;

    BEGIN
        ALTER TABLE bookings DROP CONSTRAINT IF EXISTS chk_booking_status;
        ALTER TABLE bookings ADD CONSTRAINT chk_booking_status
          CHECK (booking_status IN ('pending_approval', 'confirmed', 'rejected', 'cancelled', 'completed'));
    EXCEPTION WHEN OTHERS THEN
        NULL; -- Ignore errors
    END;
END $$;

-- 5. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_status ON bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_camera_dates ON bookings(camera_id, start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_source ON bookings(booking_source);

-- 6. Force schema cache refresh by updating table comment
COMMENT ON TABLE bookings IS 'Camera rental bookings with approval workflow - Updated 2025-09-20';

-- 7. Verify all required columns exist
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    required_columns TEXT[] := ARRAY[
        'daily_rate', 'pickup_method', 'pickup_address', 'delivery_fee', 
        'booking_source', 'notes', 'booking_status', 'approved_by', 
        'approved_at', 'rejection_reason', 'admin_notes', 'whatsapp_message_sent', 
        'whatsapp_sent_at', 'deposit_paid', 'deposit_paid_date', 
        'final_payment_paid', 'final_payment_paid_date'
    ];
    col TEXT;
    col_exists BOOLEAN;
BEGIN
    FOREACH col IN ARRAY required_columns
    LOOP
        SELECT EXISTS (
            SELECT 1 FROM information_schema.columns 
            WHERE table_name = 'bookings' 
            AND column_name = col
        ) INTO col_exists;
        
        IF NOT col_exists THEN
            missing_columns := array_append(missing_columns, col);
        END IF;
    END LOOP;
    
    IF array_length(missing_columns, 1) > 0 THEN
        RAISE NOTICE 'Missing columns in bookings table: %', array_to_string(missing_columns, ', ');
    ELSE
        RAISE NOTICE 'All required columns exist in bookings table';
    END IF;
END $$;
