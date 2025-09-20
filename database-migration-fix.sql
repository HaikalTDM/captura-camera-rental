-- CAPTURA Database Migration - Fix Missing Columns
-- Run this script in your Supabase SQL Editor to add missing columns

-- Add missing columns to existing tables
DO $$ 
BEGIN
    -- Add booking_source column to bookings table if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'bookings' AND column_name = 'booking_source') THEN
        ALTER TABLE bookings ADD COLUMN booking_source VARCHAR(20) CHECK (booking_source IN ('website', 'phone', 'whatsapp', 'walk-in', 'historical', 'manual')) DEFAULT 'website';
        RAISE NOTICE 'Added booking_source column to bookings table';
    ELSE
        RAISE NOTICE 'booking_source column already exists in bookings table';
    END IF;

    -- Add full_name column to customers table if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'full_name') THEN
        ALTER TABLE customers ADD COLUMN full_name VARCHAR(255);
        RAISE NOTICE 'Added full_name column to customers table';
        
        -- If customers table has existing data, populate full_name from name column
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'name') THEN
            UPDATE customers SET full_name = name WHERE full_name IS NULL;
            RAISE NOTICE 'Populated full_name from existing name column';
        END IF;
        
        -- Make full_name NOT NULL after populating data
        ALTER TABLE customers ALTER COLUMN full_name SET NOT NULL;
        RAISE NOTICE 'Set full_name column to NOT NULL';
    ELSE
        RAISE NOTICE 'full_name column already exists in customers table';
    END IF;

    -- Add notes column to customers table if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'notes') THEN
        ALTER TABLE customers ADD COLUMN notes TEXT;
        RAISE NOTICE 'Added notes column to customers table';
    ELSE
        RAISE NOTICE 'notes column already exists in customers table';
    END IF;

    -- Add whatsapp column to customers table if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'whatsapp') THEN
        ALTER TABLE customers ADD COLUMN whatsapp VARCHAR(20);
        RAISE NOTICE 'Added whatsapp column to customers table';
        
        -- Populate whatsapp with phone number as default
        UPDATE customers SET whatsapp = phone WHERE whatsapp IS NULL;
        RAISE NOTICE 'Populated whatsapp with phone numbers';
    ELSE
        RAISE NOTICE 'whatsapp column already exists in customers table';
    END IF;

    -- Add address column to customers table if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'address') THEN
        ALTER TABLE customers ADD COLUMN address TEXT;
        RAISE NOTICE 'Added address column to customers table';
    ELSE
        RAISE NOTICE 'address column already exists in customers table';
    END IF;

    -- Add id_number column to customers table if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'id_number') THEN
        ALTER TABLE customers ADD COLUMN id_number VARCHAR(50);
        RAISE NOTICE 'Added id_number column to customers table';
    ELSE
        RAISE NOTICE 'id_number column already exists in customers table';
    END IF;

    -- Add emergency contact columns to customers table if missing
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'emergency_contact_name') THEN
        ALTER TABLE customers ADD COLUMN emergency_contact_name VARCHAR(255);
        RAISE NOTICE 'Added emergency_contact_name column to customers table';
    ELSE
        RAISE NOTICE 'emergency_contact_name column already exists in customers table';
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'emergency_contact_phone') THEN
        ALTER TABLE customers ADD COLUMN emergency_contact_phone VARCHAR(20);
        RAISE NOTICE 'Added emergency_contact_phone column to customers table';
    ELSE
        RAISE NOTICE 'emergency_contact_phone column already exists in customers table';
    END IF;

END $$;

-- Update any existing bookings to have a default booking_source
UPDATE bookings SET booking_source = 'historical' WHERE booking_source IS NULL;

-- Create indexes if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_bookings_booking_source') THEN
        CREATE INDEX idx_bookings_booking_source ON bookings(booking_source);
        RAISE NOTICE 'Created index on booking_source';
    END IF;
END $$;

-- Verify the changes
SELECT 'Migration completed successfully!' as status;

-- Show current table structure for verification
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns 
WHERE table_name IN ('bookings', 'customers') 
AND table_schema = 'public'
ORDER BY table_name, ordinal_position;
