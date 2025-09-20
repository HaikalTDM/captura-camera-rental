-- CAPTURA Camera Rental Database Schema
-- Complete database structure for camera rental business

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cameras table
CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('action', 'mirrorless', 'dslr', 'compact')) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    weekly_rate DECIMAL(10,2) NOT NULL,
    monthly_rate DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    specifications JSONB,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    total_quantity INTEGER DEFAULT 1,
    available_quantity INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    address TEXT,
    id_number VARCHAR(50),
    emergency_contact_name VARCHAR(255),
    emergency_contact_phone VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_id UUID REFERENCES customers(id) ON DELETE CASCADE,
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    total_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    deposit_paid BOOLEAN DEFAULT false,
    deposit_paid_date TIMESTAMP WITH TIME ZONE,
    final_payment_amount DECIMAL(10,2) NOT NULL,
    final_payment_paid BOOLEAN DEFAULT false,
    final_payment_paid_date TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')) DEFAULT 'pending',
    pickup_method VARCHAR(20) CHECK (pickup_method IN ('pickup', 'delivery')) DEFAULT 'pickup',
    pickup_address TEXT,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    booking_source VARCHAR(20) CHECK (booking_source IN ('website', 'phone', 'whatsapp', 'walk-in', 'historical', 'manual')) DEFAULT 'website',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Gallery images table
CREATE TABLE gallery_images (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    customer_name VARCHAR(255) NOT NULL,
    camera_used VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    image_url TEXT NOT NULL,
    alt_text TEXT,
    is_active BOOLEAN DEFAULT true,
    upload_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business settings table
CREATE TABLE business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment records table
CREATE TABLE payment_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    booking_id UUID REFERENCES bookings(id) ON DELETE CASCADE,
    payment_type VARCHAR(20) CHECK (payment_type IN ('deposit', 'final', 'refund')) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(20) CHECK (payment_method IN ('cash', 'bank_transfer', 'online')) NOT NULL,
    payment_reference VARCHAR(255),
    payment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Maintenance records table
CREATE TABLE maintenance_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    camera_id UUID REFERENCES cameras(id) ON DELETE CASCADE,
    maintenance_type VARCHAR(20) CHECK (maintenance_type IN ('cleaning', 'repair', 'inspection', 'upgrade')) NOT NULL,
    description TEXT NOT NULL,
    cost DECIMAL(10,2) DEFAULT 0,
    maintenance_date DATE NOT NULL,
    performed_by VARCHAR(255) NOT NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_camera_id ON bookings(camera_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(start_date, end_date);
CREATE INDEX idx_gallery_images_active ON gallery_images(is_active);
CREATE INDEX idx_payment_records_booking_id ON payment_records(booking_id);
CREATE INDEX idx_maintenance_records_camera_id ON maintenance_records(camera_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON cameras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON gallery_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_records_updated_at BEFORE UPDATE ON payment_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_maintenance_records_updated_at BEFORE UPDATE ON maintenance_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Note: No sample data inserted - use admin panel to add cameras, customers, and bookings
-- Essential business settings only
INSERT INTO business_settings (setting_key, setting_value, description) VALUES
('business_name', 'CAPTURA', 'Business name'),
('contact_phone', '0177464121', 'Primary contact phone number'),
('whatsapp_number', '0177464121', 'WhatsApp Business number'),
('pickup_location', 'Caltex Selayang Pandang', 'Default pickup location'),
('delivery_base_fee', '20.00', 'Base delivery fee in RM'),
('late_return_penalty', '50.00', 'Late return penalty per day in RM');
