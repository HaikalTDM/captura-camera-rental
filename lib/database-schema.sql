-- CAPTURA Camera Rental Database Schema
-- Run this in Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Cameras table
CREATE TABLE cameras (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    model VARCHAR(255) NOT NULL,
    daily_rate DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'available' CHECK (status IN ('available', 'rented', 'maintenance')),
    condition VARCHAR(20) DEFAULT 'excellent' CHECK (condition IN ('excellent', 'good', 'fair')),
    purchase_date DATE NOT NULL,
    last_maintenance DATE,
    total_rentals INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Customers table
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(50) NOT NULL,
    address TEXT,
    id_number VARCHAR(50),
    reliability_score INTEGER DEFAULT 100 CHECK (reliability_score >= 0 AND reliability_score <= 100),
    total_bookings INTEGER DEFAULT 0,
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
    total_amount DECIMAL(10,2) NOT NULL,
    deposit_amount DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'active', 'completed', 'cancelled')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed')),
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
    alt_text TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    upload_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Business settings table
CREATE TABLE business_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    business_name VARCHAR(255) NOT NULL,
    business_phone VARCHAR(50) NOT NULL,
    business_email VARCHAR(255),
    whatsapp_number VARCHAR(50) NOT NULL,
    business_address TEXT NOT NULL,
    default_deposit_percentage INTEGER DEFAULT 30,
    late_fee_per_day DECIMAL(10,2) DEFAULT 10.00,
    max_rental_days INTEGER DEFAULT 30,
    currency VARCHAR(10) DEFAULT 'RM',
    reminder_days_before INTEGER DEFAULT 1,
    opening_time TIME DEFAULT '09:00:00',
    closing_time TIME DEFAULT '18:00:00',
    timezone VARCHAR(50) DEFAULT 'Asia/Kuala_Lumpur',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_bookings_customer_id ON bookings(customer_id);
CREATE INDEX idx_bookings_camera_id ON bookings(camera_id);
CREATE INDEX idx_bookings_start_date ON bookings(start_date);
CREATE INDEX idx_bookings_end_date ON bookings(end_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_cameras_status ON cameras(status);
CREATE INDEX idx_gallery_images_is_active ON gallery_images(is_active);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_cameras_updated_at BEFORE UPDATE ON cameras FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_gallery_images_updated_at BEFORE UPDATE ON gallery_images FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_business_settings_updated_at BEFORE UPDATE ON business_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert initial data
INSERT INTO cameras (name, model, daily_rate, deposit_amount, purchase_date) VALUES
('DJI Osmo Pocket 3', 'DJI Pocket 3', 80.00, 500.00, '2024-01-15'),
('DJI Action 5 Pro', 'DJI Action 5 Pro', 60.00, 400.00, '2024-02-01');

INSERT INTO business_settings (
    business_name, 
    business_phone, 
    whatsapp_number, 
    business_address
) VALUES (
    'CAPTURA', 
    '0177464121', 
    '60177464121', 
    'Caltex Selayang Pandang, Selangor, Malaysia'
);

-- Insert sample gallery images
INSERT INTO gallery_images (customer_name, camera_used, location, image_url, alt_text, upload_date) VALUES
('Sarah', 'Osmo Pocket 3', 'Kuala Lumpur', '/api/placeholder/300/400', 'Customer with DJI Osmo Pocket 3', '2024-01-20'),
('Marcus', 'Action 5 Pro', 'Langkawi', '/api/placeholder/300/400', 'Customer with DJI Action 5 Pro', '2024-01-25'),
('Lisa', 'Osmo Pocket 3', 'Penang', '/api/placeholder/300/400', 'Customer with camera equipment', '2024-02-01'),
('Ahmad', 'Action 5 Pro', 'Genting', '/api/placeholder/300/400', 'Customer enjoying camera rental', '2024-02-05'),
('Emily', 'Osmo Pocket 3', 'KLCC', '/api/placeholder/300/400', 'Happy customer with rental camera', '2024-02-10'),
('David', 'Action 5 Pro', 'Melaka', '/api/placeholder/300/400', 'Customer creating content', '2024-02-15');
