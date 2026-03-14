-- CAPTURA PHOTOGRAPHY DATABASE SCHEMA
-- Integrates with existing camera rental database
-- Adds photography-specific tables while reusing existing infrastructure

-- ==========================================
-- PHOTOGRAPHY CORE TABLES
-- ==========================================

-- 1. Photography Gallery (Portfolio Management)
CREATE TABLE photography_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    alt_text VARCHAR(255) NOT NULL,
    
    -- Categorization
    category VARCHAR(50) NOT NULL CHECK (category IN ('wedding', 'corporate', 'graduation', 'portrait', 'event')),
    aspect_ratio VARCHAR(20) NOT NULL CHECK (aspect_ratio IN ('portrait', 'landscape', 'square')),
    
    -- Portfolio Management
    is_featured BOOLEAN DEFAULT FALSE,
    is_public BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    
    -- Metadata
    camera_used VARCHAR(255),
    location VARCHAR(255),
    shoot_date DATE,
    
    -- Admin Management
    uploaded_by UUID REFERENCES auth.users(id),
    client_id UUID REFERENCES customers(id),
    event_id UUID, -- References photography_bookings(id)
    
    -- File Information
    file_name VARCHAR(255),
    file_size INTEGER, -- in bytes
    image_width INTEGER,
    image_height INTEGER,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Photography Packages (Base Packages)
CREATE TABLE photography_packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Package Details
    category VARCHAR(50) NOT NULL CHECK (category IN ('wedding', 'corporate', 'graduation', 'portrait', 'event')),
    duration_hours INTEGER NOT NULL,
    photographer_count INTEGER DEFAULT 1,
    
    -- Pricing
    base_price DECIMAL(10,2) NOT NULL,
    main_shooter_price DECIMAL(10,2) NOT NULL,
    second_shooter_price DECIMAL(10,2) DEFAULT 0.00,
    
    -- Package Inclusions
    included_photos INTEGER,
    edited_photos INTEGER,
    digital_gallery BOOLEAN DEFAULT TRUE,
    prints_included BOOLEAN DEFAULT FALSE,
    album_included BOOLEAN DEFAULT FALSE,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Photography Add-ons (Migrate from file-based system)
CREATE TABLE photography_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    
    -- Categorization
    category VARCHAR(50) NOT NULL CHECK (category IN ('extras', 'editing', 'products', 'logistics')),
    
    -- Pricing
    price DECIMAL(10,2) NOT NULL,
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INTEGER DEFAULT 0,
    icon VARCHAR(10), -- Emoji icon
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Photography Bookings (Main booking system)
CREATE TABLE photography_bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Customer Information (Reuse existing customers table)
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    
    -- Event Details
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('wedding', 'corporate', 'graduation', 'portrait', 'event')),
    event_date DATE NOT NULL,
    event_start_time TIME NOT NULL,
    event_duration_hours INTEGER NOT NULL,
    
    -- Location
    venue_name VARCHAR(255),
    venue_address TEXT NOT NULL,
    venue_contact_name VARCHAR(255),
    venue_contact_phone VARCHAR(20),
    
    -- Package Selection
    package_id UUID REFERENCES photography_packages(id),
    package_name VARCHAR(255), -- Snapshot of package name at booking time
    photographer_type VARCHAR(20) NOT NULL CHECK (photographer_type IN ('main_only', 'main_and_second')) DEFAULT 'main_only',
    
    -- Pricing
    package_price DECIMAL(10,2) NOT NULL,
    addons_total DECIMAL(10,2) DEFAULT 0.00,
    subtotal DECIMAL(10,2) NOT NULL,
    discount_amount DECIMAL(10,2) DEFAULT 0.00,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment Tracking (Reuse existing payment_records table)
    deposit_amount DECIMAL(10,2) NOT NULL,
    deposit_paid BOOLEAN DEFAULT FALSE,
    deposit_paid_date TIMESTAMP WITH TIME ZONE,
    final_payment_amount DECIMAL(10,2) NOT NULL,
    final_payment_paid BOOLEAN DEFAULT FALSE,
    final_payment_paid_date TIMESTAMP WITH TIME ZONE,
    
    -- Booking Management
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    booking_source VARCHAR(20) DEFAULT 'website' CHECK (booking_source IN ('website', 'whatsapp', 'phone', 'referral', 'walk-in')),
    
    -- Client Preferences
    special_requests TEXT,
    preferred_style TEXT,
    important_shots TEXT,
    
    -- Admin Management
    admin_notes TEXT,
    confirmed_by UUID REFERENCES auth.users(id),
    confirmed_at TIMESTAMP WITH TIME ZONE,
    
    -- WhatsApp Integration
    whatsapp_message_sent BOOLEAN DEFAULT FALSE,
    whatsapp_sent_at TIMESTAMP WITH TIME ZONE,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Photography Booking Add-ons (Junction table)
CREATE TABLE photography_booking_addons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES photography_bookings(id) ON DELETE CASCADE,
    addon_id UUID NOT NULL REFERENCES photography_addons(id) ON DELETE CASCADE,
    
    -- Snapshot data (prices can change over time)
    addon_name VARCHAR(255) NOT NULL,
    addon_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER DEFAULT 1,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Prevent duplicate add-ons per booking
    UNIQUE(booking_id, addon_id)
);

-- 6. Photography Calendar Events (Consultations, editing, etc.)
CREATE TABLE photography_calendar_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Event Details
    title VARCHAR(255) NOT NULL,
    event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('booking', 'consultation', 'editing', 'blocked')),
    
    -- Date/Time
    event_date DATE NOT NULL,
    start_time TIME,
    end_time TIME,
    duration_hours INTEGER,
    
    -- Relationships
    booking_id UUID REFERENCES photography_bookings(id) ON DELETE CASCADE,
    client_id UUID REFERENCES customers(id),
    
    -- Event Details
    location VARCHAR(255),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'pending', 'completed', 'cancelled')),
    
    -- Admin Management
    created_by UUID REFERENCES auth.users(id),
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ==========================================
-- INDEXES FOR PERFORMANCE
-- ==========================================

-- Photography Gallery
CREATE INDEX idx_photography_gallery_category ON photography_gallery(category);
CREATE INDEX idx_photography_gallery_featured ON photography_gallery(is_featured, is_public);
CREATE INDEX idx_photography_gallery_client ON photography_gallery(client_id);
CREATE INDEX idx_photography_gallery_event ON photography_gallery(event_id);

-- Photography Packages
CREATE INDEX idx_photography_packages_category ON photography_packages(category);
CREATE INDEX idx_photography_packages_active ON photography_packages(is_active);

-- Photography Add-ons
CREATE INDEX idx_photography_addons_category ON photography_addons(category);
CREATE INDEX idx_photography_addons_active ON photography_addons(is_active);

-- Photography Bookings
CREATE INDEX idx_photography_bookings_customer ON photography_bookings(customer_id);
CREATE INDEX idx_photography_bookings_event_date ON photography_bookings(event_date);
CREATE INDEX idx_photography_bookings_status ON photography_bookings(status);
CREATE INDEX idx_photography_bookings_event_type ON photography_bookings(event_type);
CREATE INDEX idx_photography_bookings_created ON photography_bookings(created_at);

-- Photography Calendar Events
CREATE INDEX idx_photography_calendar_date ON photography_calendar_events(event_date);
CREATE INDEX idx_photography_calendar_booking ON photography_calendar_events(booking_id);
CREATE INDEX idx_photography_calendar_type ON photography_calendar_events(event_type);

-- ==========================================
-- TRIGGERS AND FUNCTIONS
-- ==========================================

-- Updated at triggers for photography tables
CREATE TRIGGER update_photography_gallery_updated_at 
    BEFORE UPDATE ON photography_gallery 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photography_packages_updated_at 
    BEFORE UPDATE ON photography_packages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photography_addons_updated_at 
    BEFORE UPDATE ON photography_addons 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photography_bookings_updated_at 
    BEFORE UPDATE ON photography_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_photography_calendar_events_updated_at 
    BEFORE UPDATE ON photography_calendar_events 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to automatically create calendar events from confirmed bookings
CREATE OR REPLACE FUNCTION create_photography_calendar_event()
RETURNS TRIGGER AS $$
BEGIN
    -- When booking is confirmed, create calendar event
    IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
        INSERT INTO photography_calendar_events (
            title, event_type, event_date, start_time, duration_hours, 
            booking_id, client_id, location, notes, created_by
        ) VALUES (
            NEW.package_name || ' - ' || (SELECT full_name FROM customers WHERE id = NEW.customer_id),
            'booking',
            NEW.event_date,
            NEW.event_start_time,
            NEW.event_duration_hours,
            NEW.id,
            NEW.customer_id,
            NEW.venue_name || ', ' || NEW.venue_address,
            'Automatically created from confirmed booking',
            NEW.confirmed_by
        );
    END IF;
    
    -- When booking is cancelled, remove calendar event
    IF OLD.status = 'confirmed' AND NEW.status = 'cancelled' THEN
        DELETE FROM photography_calendar_events 
        WHERE booking_id = NEW.id AND event_type = 'booking';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_create_photography_calendar_event
    AFTER UPDATE ON photography_bookings
    FOR EACH ROW
    EXECUTE FUNCTION create_photography_calendar_event();

-- ==========================================
-- SAMPLE DATA (Photography Packages)
-- ==========================================

-- Insert default photography packages
INSERT INTO photography_packages (name, description, category, duration_hours, photographer_count, base_price, main_shooter_price, second_shooter_price, included_photos, edited_photos, digital_gallery, sort_order) VALUES
-- Wedding Packages
('Essential Wedding', 'Perfect for intimate weddings and elopements', 'wedding', 6, 1, 1200.00, 1200.00, 400.00, 300, 100, true, 1),
('Premium Wedding', 'Comprehensive coverage for your special day', 'wedding', 8, 1, 1800.00, 1800.00, 600.00, 500, 150, true, 2),
('Luxury Wedding', 'Complete wedding documentation with dual photographers', 'wedding', 10, 2, 2800.00, 1800.00, 1000.00, 800, 200, true, 3),

-- Corporate Packages
('Corporate Essential', 'Professional corporate event photography', 'corporate', 4, 1, 800.00, 800.00, 300.00, 200, 50, true, 4),
('Corporate Premium', 'Comprehensive corporate event coverage', 'corporate', 6, 1, 1200.00, 1200.00, 400.00, 400, 100, true, 5),

-- Portrait Packages
('Individual Portrait', 'Professional headshots and portraits', 'portrait', 2, 1, 350.00, 350.00, 0.00, 50, 20, true, 6),
('Family Portrait', 'Beautiful family photography session', 'portrait', 3, 1, 500.00, 500.00, 0.00, 80, 30, true, 7),

-- Graduation Packages
('Graduation Basic', 'Capture your graduation milestone', 'graduation', 2, 1, 250.00, 250.00, 0.00, 40, 15, true, 8),
('Graduation Premium', 'Extended graduation photography', 'graduation', 3, 1, 400.00, 400.00, 150.00, 80, 25, true, 9);

-- ==========================================
-- SAMPLE DATA (Photography Add-ons)
-- ==========================================

-- Migrate existing add-ons from file system to database
INSERT INTO photography_addons (name, description, category, price, icon, sort_order) VALUES
-- Extras
('Additional Hour', 'Extend your photography session by one hour', 'extras', 200.00, '⏰', 1),
('Drone Photography', 'Stunning aerial shots and videos', 'extras', 400.00, '🚁', 2),
('Second Photographer', 'Additional photographer for comprehensive coverage', 'extras', 500.00, '📷', 3),
('Videography Add-on', 'Professional video coverage of your event', 'extras', 800.00, '🎥', 4),

-- Editing
('Rush Editing (24h)', 'Get your photos edited within 24 hours', 'editing', 300.00, '⚡', 5),
('Advanced Retouching', 'Professional retouching for 20 photos', 'editing', 250.00, '✨', 6),
('Black & White Set', 'Artistic black and white versions of all photos', 'editing', 150.00, '🎨', 7),

-- Products
('Premium Photo Album', 'Luxurious photo album with premium finish', 'products', 350.00, '📖', 8),
('Canvas Prints Set', 'Set of 3 premium canvas prints', 'products', 200.00, '🖼️', 9),
('USB Drive with Photos', 'All photos delivered on premium USB drive', 'products', 50.00, '💾', 10),

-- Logistics
('Travel Fee (>50km)', 'Additional fee for locations beyond 50km', 'logistics', 100.00, '🚗', 11),
('Equipment Insurance', 'Comprehensive equipment and liability coverage', 'logistics', 80.00, '🛡️', 12);

-- ==========================================
-- VIEWS FOR ADMIN DASHBOARD
-- ==========================================

-- Photography dashboard overview
CREATE VIEW photography_admin_dashboard AS
SELECT 
    -- Booking Stats
    COUNT(CASE WHEN pb.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN 1 END) as bookings_this_month,
    COUNT(CASE WHEN pb.status = 'confirmed' THEN 1 END) as confirmed_bookings,
    COUNT(CASE WHEN pb.status = 'pending' THEN 1 END) as pending_bookings,
    
    -- Revenue Stats
    COALESCE(SUM(CASE WHEN pb.created_at >= CURRENT_DATE - INTERVAL '30 days' 
                 AND pb.status = 'confirmed' THEN pb.total_amount END), 0) as revenue_this_month,
    COALESCE(SUM(CASE WHEN pb.status = 'confirmed' THEN pb.total_amount END), 0) as total_revenue,
    COALESCE(AVG(CASE WHEN pb.status = 'confirmed' THEN pb.total_amount END), 0) as avg_booking_value,
    
    -- Gallery Stats
    (SELECT COUNT(*) FROM photography_gallery WHERE is_public = true) as public_gallery_photos,
    (SELECT COUNT(*) FROM photography_gallery WHERE created_at >= CURRENT_DATE - INTERVAL '30 days') as photos_uploaded_this_month,
    
    -- Client Stats
    COUNT(DISTINCT pb.customer_id) as total_clients,
    COUNT(DISTINCT CASE WHEN pb.created_at >= CURRENT_DATE - INTERVAL '30 days' THEN pb.customer_id END) as new_clients_this_month

FROM photography_bookings pb;

-- Recent photography bookings view
CREATE VIEW recent_photography_bookings AS
SELECT 
    pb.id,
    pb.event_date,
    pb.event_type,
    pb.package_name,
    pb.total_amount,
    pb.status,
    c.full_name as client_name,
    c.phone as client_phone,
    pb.venue_name,
    pb.created_at
FROM photography_bookings pb
JOIN customers c ON pb.customer_id = c.id
ORDER BY pb.created_at DESC
LIMIT 10;

-- Photography calendar view
CREATE VIEW photography_calendar_view AS
SELECT 
    pce.id,
    pce.title,
    pce.event_type,
    pce.event_date,
    pce.start_time,
    pce.end_time,
    pce.location,
    pce.status,
    c.full_name as client_name,
    pb.event_type as booking_type
FROM photography_calendar_events pce
LEFT JOIN customers c ON pce.client_id = c.id
LEFT JOIN photography_bookings pb ON pce.booking_id = pb.id
ORDER BY pce.event_date, pce.start_time;

-- ==========================================
-- COMPLETION MESSAGE
-- ==========================================

SELECT 'Photography database schema created successfully! 📸✨' as status,
       'Tables created: photography_gallery, photography_packages, photography_addons, photography_bookings, photography_booking_addons, photography_calendar_events' as tables_created,
       'Views created: photography_admin_dashboard, recent_photography_bookings, photography_calendar_view' as views_created,
       'Ready to integrate with existing Captura rental system!' as integration_status;
