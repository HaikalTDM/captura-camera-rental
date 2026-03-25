-- CAPTURA Rental Kit / Booking Group Schema
-- Adds a grouped customer request layer above existing single-camera bookings.

CREATE TABLE IF NOT EXISTS booking_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_reference VARCHAR(32) UNIQUE NOT NULL,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days INTEGER NOT NULL CHECK (total_days > 0),
    pickup_method VARCHAR(20) NOT NULL CHECK (pickup_method IN ('pickup', 'delivery')),
    pickup_address TEXT,
    delivery_fee DECIMAL(10,2) NOT NULL DEFAULT 0,
    subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    final_payment_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    booking_source VARCHAR(20) NOT NULL DEFAULT 'website',
    notes TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'pending_approval'
      CHECK (status IN ('pending_approval', 'confirmed', 'partially_confirmed', 'completed', 'cancelled', 'rejected')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS booking_group_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_group_id UUID NOT NULL REFERENCES booking_groups(id) ON DELETE CASCADE,
    camera_id UUID NOT NULL REFERENCES cameras(id) ON DELETE CASCADE,
    daily_rate DECIMAL(10,2) NOT NULL,
    total_days INTEGER NOT NULL CHECK (total_days > 0),
    subtotal_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    deposit_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    final_payment_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    sort_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE bookings
ADD COLUMN IF NOT EXISTS booking_group_id UUID REFERENCES booking_groups(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_booking_groups_customer_id ON booking_groups(customer_id);
CREATE INDEX IF NOT EXISTS idx_booking_groups_status ON booking_groups(status);
CREATE INDEX IF NOT EXISTS idx_booking_groups_dates ON booking_groups(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_booking_group_items_group_id ON booking_group_items(booking_group_id);
CREATE INDEX IF NOT EXISTS idx_booking_group_items_camera_id ON booking_group_items(camera_id);
CREATE INDEX IF NOT EXISTS idx_bookings_booking_group_id ON bookings(booking_group_id);

DROP TRIGGER IF EXISTS update_booking_groups_updated_at ON booking_groups;
CREATE TRIGGER update_booking_groups_updated_at
BEFORE UPDATE ON booking_groups
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
