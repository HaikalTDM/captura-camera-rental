-- CAPTURA Equipment Pickup Status Management Schema
-- Add pickup and return tracking fields to bookings table

-- 1. Add equipment pickup/return status fields
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_picked_up BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_pickup_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_pickup_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_returned BOOLEAN DEFAULT FALSE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_return_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_return_notes TEXT;
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_condition_pickup TEXT; -- 'excellent', 'good', 'fair', 'damaged'
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS equipment_condition_return TEXT; -- 'excellent', 'good', 'fair', 'damaged'

-- 2. Update existing bookings to have default values
UPDATE bookings SET equipment_picked_up = FALSE WHERE equipment_picked_up IS NULL;
UPDATE bookings SET equipment_returned = FALSE WHERE equipment_returned IS NULL;

-- 3. Add constraints for data integrity (PostgreSQL doesn't support IF NOT EXISTS for constraints)
DO $$
BEGIN
    -- Drop existing constraints if they exist
    BEGIN
        ALTER TABLE bookings DROP CONSTRAINT chk_equipment_condition_pickup;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;

    BEGIN
        ALTER TABLE bookings DROP CONSTRAINT chk_equipment_condition_return;
    EXCEPTION
        WHEN undefined_object THEN NULL;
    END;

    -- Add the constraints
    ALTER TABLE bookings ADD CONSTRAINT chk_equipment_condition_pickup
      CHECK (equipment_condition_pickup IS NULL OR equipment_condition_pickup IN ('excellent', 'good', 'fair', 'damaged'));

    ALTER TABLE bookings ADD CONSTRAINT chk_equipment_condition_return
      CHECK (equipment_condition_return IS NULL OR equipment_condition_return IN ('excellent', 'good', 'fair', 'damaged'));
END $$;

-- 4. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_bookings_equipment_pickup ON bookings(equipment_picked_up);
CREATE INDEX IF NOT EXISTS idx_bookings_equipment_return ON bookings(equipment_returned);
CREATE INDEX IF NOT EXISTS idx_bookings_pickup_date ON bookings(equipment_pickup_date);
CREATE INDEX IF NOT EXISTS idx_bookings_return_date ON bookings(equipment_return_date);

-- 5. Create a function to automatically update booking status based on equipment status
CREATE OR REPLACE FUNCTION update_booking_status_on_equipment_change()
RETURNS TRIGGER AS $$
BEGIN
  -- If equipment is picked up and booking is confirmed, set status to active
  IF NEW.equipment_picked_up = TRUE AND OLD.equipment_picked_up = FALSE AND NEW.booking_status = 'confirmed' THEN
    NEW.status = 'active';
  END IF;
  
  -- If equipment is returned and booking is active, set status to completed
  IF NEW.equipment_returned = TRUE AND OLD.equipment_returned = FALSE AND NEW.status = 'active' THEN
    NEW.status = 'completed';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 6. Create trigger to automatically update booking status
DROP TRIGGER IF EXISTS trigger_update_booking_status_on_equipment_change ON bookings;
CREATE TRIGGER trigger_update_booking_status_on_equipment_change
  BEFORE UPDATE ON bookings
  FOR EACH ROW
  EXECUTE FUNCTION update_booking_status_on_equipment_change();

-- 7. Force schema cache refresh
COMMENT ON TABLE bookings IS 'Camera rental bookings with equipment pickup/return tracking - Updated 2025-09-21';

-- 8. Verify all required columns exist
DO $$
DECLARE
    missing_columns TEXT[] := ARRAY[]::TEXT[];
    required_columns TEXT[] := ARRAY[
        'equipment_picked_up', 'equipment_pickup_date', 'equipment_pickup_notes',
        'equipment_returned', 'equipment_return_date', 'equipment_return_notes',
        'equipment_condition_pickup', 'equipment_condition_return'
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
        RAISE NOTICE 'All required pickup/return tracking columns exist in bookings table';
    END IF;
END $$;
