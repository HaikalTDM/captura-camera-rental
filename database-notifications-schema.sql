-- CAPTURA Notification System Database Schema
-- Run this in your Supabase SQL Editor to create the notification system

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type VARCHAR(50) NOT NULL, -- 'new_booking', 'booking_update', 'payment_received', etc.
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}', -- Additional data like booking_id, customer_id, etc.
    is_read BOOLEAN DEFAULT FALSE,
    is_dismissed BOOLEAN DEFAULT FALSE,
    priority VARCHAR(20) DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
    action_url VARCHAR(500), -- URL to navigate when notification is clicked
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE,
    dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_priority ON notifications(priority);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(is_read, created_at DESC) WHERE is_read = FALSE;

-- Create notification preferences table for future use
CREATE TABLE IF NOT EXISTS notification_preferences (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(100) DEFAULT 'admin', -- For future multi-admin support
    notification_type VARCHAR(50) NOT NULL,
    is_enabled BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    email_enabled BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, notification_type)
);

-- Insert default notification preferences
INSERT INTO notification_preferences (notification_type, is_enabled, sound_enabled, email_enabled) VALUES
('new_booking', TRUE, TRUE, FALSE),
('booking_update', TRUE, FALSE, FALSE),
('payment_received', TRUE, TRUE, FALSE),
('booking_cancelled', TRUE, FALSE, FALSE),
('booking_confirmed', TRUE, FALSE, FALSE),
('overdue_payment', TRUE, TRUE, FALSE),
('maintenance_due', TRUE, FALSE, FALSE)
ON CONFLICT (user_id, notification_type) DO NOTHING;

-- Create function to automatically create notification for new bookings
CREATE OR REPLACE FUNCTION create_booking_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create notification for new bookings from website
    IF NEW.booking_source IN ('website', 'phone', 'whatsapp') THEN
        INSERT INTO notifications (
            type,
            title,
            message,
            data,
            priority,
            action_url
        ) VALUES (
            'new_booking',
            'New Booking Received',
            CASE 
                WHEN NEW.booking_source = 'website' THEN 'New booking submitted through website'
                WHEN NEW.booking_source = 'phone' THEN 'New booking received via phone'
                WHEN NEW.booking_source = 'whatsapp' THEN 'New booking received via WhatsApp'
                ELSE 'New booking received'
            END || ' for ' || COALESCE((SELECT name FROM cameras WHERE id = NEW.camera_id), 'Unknown Camera'),
            jsonb_build_object(
                'booking_id', NEW.id,
                'customer_id', NEW.customer_id,
                'camera_id', NEW.camera_id,
                'total_amount', NEW.total_amount,
                'start_date', NEW.start_date,
                'end_date', NEW.end_date,
                'booking_source', NEW.booking_source
            ),
            CASE 
                WHEN NEW.total_amount > 500 THEN 'high'
                WHEN NEW.total_amount > 200 THEN 'normal'
                ELSE 'normal'
            END,
            '/admin/bookings/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for new booking notifications
DROP TRIGGER IF EXISTS trigger_booking_notification ON bookings;
CREATE TRIGGER trigger_booking_notification
    AFTER INSERT ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION create_booking_notification();

-- Create function to create notification for booking status updates
CREATE OR REPLACE FUNCTION create_booking_update_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create notification for significant status changes
    IF OLD.status != NEW.status AND NEW.status IN ('confirmed', 'cancelled', 'completed') THEN
        INSERT INTO notifications (
            type,
            title,
            message,
            data,
            priority,
            action_url
        ) VALUES (
            'booking_update',
            'Booking Status Updated',
            'Booking #' || NEW.id || ' status changed to ' || UPPER(NEW.status) || 
            ' for ' || COALESCE((SELECT name FROM cameras WHERE id = NEW.camera_id), 'Unknown Camera'),
            jsonb_build_object(
                'booking_id', NEW.id,
                'customer_id', NEW.customer_id,
                'camera_id', NEW.camera_id,
                'old_status', OLD.status,
                'new_status', NEW.status,
                'total_amount', NEW.total_amount
            ),
            CASE 
                WHEN NEW.status = 'cancelled' THEN 'high'
                ELSE 'normal'
            END,
            '/admin/bookings/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for booking status update notifications
DROP TRIGGER IF EXISTS trigger_booking_update_notification ON bookings;
CREATE TRIGGER trigger_booking_update_notification
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION create_booking_update_notification();

-- Create function to create payment notifications
CREATE OR REPLACE FUNCTION create_payment_notification()
RETURNS TRIGGER AS $$
BEGIN
    -- Create notification when deposit is paid
    IF OLD.deposit_paid = FALSE AND NEW.deposit_paid = TRUE THEN
        INSERT INTO notifications (
            type,
            title,
            message,
            data,
            priority,
            action_url
        ) VALUES (
            'payment_received',
            'Deposit Payment Received',
            'Deposit payment of RM' || NEW.deposit_amount || ' received for booking #' || NEW.id,
            jsonb_build_object(
                'booking_id', NEW.id,
                'customer_id', NEW.customer_id,
                'payment_type', 'deposit',
                'amount', NEW.deposit_amount
            ),
            'normal',
            '/admin/bookings/' || NEW.id
        );
    END IF;
    
    -- Create notification when final payment is paid
    IF OLD.final_payment_paid = FALSE AND NEW.final_payment_paid = TRUE THEN
        INSERT INTO notifications (
            type,
            title,
            message,
            data,
            priority,
            action_url
        ) VALUES (
            'payment_received',
            'Final Payment Received',
            'Final payment of RM' || NEW.final_payment_amount || ' received for booking #' || NEW.id,
            jsonb_build_object(
                'booking_id', NEW.id,
                'customer_id', NEW.customer_id,
                'payment_type', 'final',
                'amount', NEW.final_payment_amount
            ),
            'normal',
            '/admin/bookings/' || NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for payment notifications
DROP TRIGGER IF EXISTS trigger_payment_notification ON bookings;
CREATE TRIGGER trigger_payment_notification
    AFTER UPDATE ON bookings
    FOR EACH ROW
    EXECUTE FUNCTION create_payment_notification();

-- Create updated_at trigger for notifications table
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to notification_preferences
DROP TRIGGER IF EXISTS update_notification_preferences_updated_at ON notification_preferences;
CREATE TRIGGER update_notification_preferences_updated_at 
    BEFORE UPDATE ON notification_preferences 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable Row Level Security (RLS) for notifications
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Create policies for admin access (adjust based on your auth setup)
CREATE POLICY "Admin can view all notifications" ON notifications
    FOR SELECT USING (true);

CREATE POLICY "Admin can update notifications" ON notifications
    FOR UPDATE USING (true);

CREATE POLICY "Admin can insert notifications" ON notifications
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view notification preferences" ON notification_preferences
    FOR ALL USING (true);

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION get_unread_notification_count()
RETURNS INTEGER AS $$
BEGIN
    RETURN (SELECT COUNT(*) FROM notifications WHERE is_read = FALSE AND is_dismissed = FALSE);
END;
$$ LANGUAGE plpgsql;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notification_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, read_at = NOW() 
    WHERE id = notification_id;
    
    RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Create function to mark all notifications as read
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS INTEGER AS $$
DECLARE
    updated_count INTEGER;
BEGIN
    UPDATE notifications 
    SET is_read = TRUE, read_at = NOW() 
    WHERE is_read = FALSE;
    
    GET DIAGNOSTICS updated_count = ROW_COUNT;
    RETURN updated_count;
END;
$$ LANGUAGE plpgsql;

-- Success message
SELECT 'Notification system database schema created successfully!' as status;

-- Show current notification count
SELECT 
    COUNT(*) as total_notifications,
    COUNT(*) FILTER (WHERE is_read = FALSE) as unread_notifications,
    COUNT(*) FILTER (WHERE priority = 'high') as high_priority_notifications
FROM notifications;
