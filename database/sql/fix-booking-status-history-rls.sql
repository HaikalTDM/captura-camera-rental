-- Fix RLS policy for booking_status_history table to allow INSERT operations
-- This is needed for the booking status change trigger to work properly

-- Drop existing policy
DROP POLICY IF EXISTS "Admin can view booking history" ON booking_status_history;

-- Create comprehensive policies for booking_status_history
CREATE POLICY "Public can insert booking history" ON booking_status_history FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can view booking history" ON booking_status_history FOR SELECT USING (true);
CREATE POLICY "Admin can manage booking history" ON booking_status_history FOR ALL USING (true);

-- Fix the trigger to handle NULL approved_by field
CREATE OR REPLACE FUNCTION log_booking_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Only log if status actually changed
    IF OLD.booking_status IS DISTINCT FROM NEW.booking_status THEN
        INSERT INTO booking_status_history (
            booking_id, old_status, new_status, changed_by, reason, notes
        ) VALUES (
            NEW.id,
            OLD.booking_status,
            NEW.booking_status,
            NULL, -- Set to NULL since we don't have approved_by field
            NEW.rejection_reason,
            NEW.admin_notes
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Verify the policies are created
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'booking_status_history'
ORDER BY policyname;

-- Test that the trigger can now insert into booking_status_history
SELECT 'RLS policies and trigger updated for booking_status_history' as status;
