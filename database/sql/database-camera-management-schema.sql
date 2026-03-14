-- CAPTURA Enhanced Camera Management Schema
-- Run this script in your Supabase SQL Editor

-- Create accessories table
CREATE TABLE IF NOT EXISTS accessories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(100) NOT NULL, -- 'lens', 'battery', 'memory_card', 'tripod', 'case', 'charger', 'filter', 'other'
    brand VARCHAR(100),
    model VARCHAR(100),
    description TEXT,
    daily_rate DECIMAL(10,2) DEFAULT 0.00,
    weekly_rate DECIMAL(10,2) DEFAULT 0.00,
    monthly_rate DECIMAL(10,2) DEFAULT 0.00,
    deposit_amount DECIMAL(10,2) DEFAULT 0.00,
    total_quantity INTEGER DEFAULT 1,
    available_quantity INTEGER DEFAULT 1,
    is_available BOOLEAN DEFAULT true,
    specifications JSONB DEFAULT '{}',
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create camera_accessories junction table (many-to-many relationship)
CREATE TABLE IF NOT EXISTS camera_accessories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE,
    accessory_id UUID REFERENCES accessories(id) ON DELETE CASCADE,
    is_included BOOLEAN DEFAULT true, -- true if included with camera, false if optional
    quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(camera_id, accessory_id)
);

-- Create booking_accessories table to track accessory rentals
CREATE TABLE IF NOT EXISTS booking_accessories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    accessory_id UUID REFERENCES accessories(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    daily_rate DECIMAL(10,2) NOT NULL,
    total_days INTEGER NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add missing columns to cameras table if they don't exist
DO $$ 
BEGIN
    -- Add condition column for camera condition tracking
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'condition') THEN
        ALTER TABLE cameras ADD COLUMN condition VARCHAR(20) CHECK (condition IN ('excellent', 'good', 'fair', 'needs_repair')) DEFAULT 'excellent';
    END IF;

    -- Add last_maintenance column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'last_maintenance') THEN
        ALTER TABLE cameras ADD COLUMN last_maintenance DATE DEFAULT CURRENT_DATE;
    END IF;

    -- Add next_maintenance column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'next_maintenance') THEN
        ALTER TABLE cameras ADD COLUMN next_maintenance DATE;
    END IF;

    -- Add purchase_date column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'purchase_date') THEN
        ALTER TABLE cameras ADD COLUMN purchase_date DATE;
    END IF;

    -- Add purchase_price column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'purchase_price') THEN
        ALTER TABLE cameras ADD COLUMN purchase_price DECIMAL(10,2);
    END IF;

    -- Add serial_number column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'serial_number') THEN
        ALTER TABLE cameras ADD COLUMN serial_number VARCHAR(100) UNIQUE;
    END IF;

    -- Add warranty_expiry column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'warranty_expiry') THEN
        ALTER TABLE cameras ADD COLUMN warranty_expiry DATE;
    END IF;

    -- Add location column for tracking where camera is stored
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'location') THEN
        ALTER TABLE cameras ADD COLUMN location VARCHAR(255) DEFAULT 'Main Storage';
    END IF;

    -- Add notes column for additional information
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'cameras' AND column_name = 'notes') THEN
        ALTER TABLE cameras ADD COLUMN notes TEXT;
    END IF;

END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_accessories_type ON accessories(type);
CREATE INDEX IF NOT EXISTS idx_accessories_available ON accessories(is_available);
CREATE INDEX IF NOT EXISTS idx_camera_accessories_camera_id ON camera_accessories(camera_id);
CREATE INDEX IF NOT EXISTS idx_camera_accessories_accessory_id ON camera_accessories(accessory_id);
CREATE INDEX IF NOT EXISTS idx_booking_accessories_booking_id ON booking_accessories(booking_id);
CREATE INDEX IF NOT EXISTS idx_cameras_condition ON cameras(condition);
CREATE INDEX IF NOT EXISTS idx_cameras_serial_number ON cameras(serial_number);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
DROP TRIGGER IF EXISTS update_accessories_updated_at ON accessories;
CREATE TRIGGER update_accessories_updated_at 
    BEFORE UPDATE ON accessories 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_cameras_updated_at ON cameras;
CREATE TRIGGER update_cameras_updated_at 
    BEFORE UPDATE ON cameras 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample accessories data
INSERT INTO accessories (name, type, brand, model, description, daily_rate, weekly_rate, monthly_rate, deposit_amount, specifications) VALUES
('Extra Battery Pack', 'battery', 'DJI', 'DJI-BATTERY-001', 'High capacity battery for extended recording', 10.00, 60.00, 200.00, 50.00, '{"capacity": "3000mAh", "voltage": "11.1V", "type": "Li-Po"}'),
('64GB Memory Card', 'memory_card', 'SanDisk', 'Extreme Pro 64GB', 'High-speed memory card for 4K recording', 5.00, 30.00, 100.00, 25.00, '{"capacity": "64GB", "speed": "170MB/s", "type": "SDXC"}'),
('Compact Tripod', 'tripod', 'Manfrotto', 'PIXI Mini', 'Lightweight tripod for stable shots', 15.00, 90.00, 300.00, 75.00, '{"height": "13.5cm", "weight": "190g", "load_capacity": "1kg"}'),
('Protective Case', 'case', 'Pelican', 'Micro Case 1010', 'Waterproof protective case', 8.00, 48.00, 160.00, 40.00, '{"waterproof": true, "dimensions": "8.18 x 5.68 x 2.75 inches"}'),
('ND Filter Set', 'filter', 'PolarPro', 'Cinema Series', 'Neutral density filters for cinematic shots', 12.00, 72.00, 240.00, 60.00, '{"filters": ["ND4", "ND8", "ND16"], "thread_size": "37mm"}')
ON CONFLICT DO NOTHING;

RAISE NOTICE 'Enhanced camera management schema created successfully!';
