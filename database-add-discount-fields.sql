-- Add discount tracking fields to bookings table
-- This allows tracking social media discounts and other promotional discounts

-- Add discount_amount column (stores the total discount in RM)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0;

-- Add discount_reason column (stores why discount was given)
ALTER TABLE bookings 
ADD COLUMN IF NOT EXISTS discount_reason TEXT;

-- Add comments for documentation
COMMENT ON COLUMN bookings.discount_amount IS 'Total discount amount in RM (e.g., RM5 per day for social media discount)';
COMMENT ON COLUMN bookings.discount_reason IS 'Reason for discount (e.g., "Social Media Discount - Instagram Follow", "Repeat Customer", "Promotional Offer")';

-- Verify the columns were added
SELECT column_name, data_type, column_default, is_nullable
FROM information_schema.columns 
WHERE table_name = 'bookings' 
AND column_name IN ('discount_amount', 'discount_reason')
ORDER BY column_name;

-- Example usage:
-- Social media discount: RM5 off per day for 3 days = RM15 total
-- UPDATE bookings SET discount_amount = 15, discount_reason = 'Social Media Discount - Instagram Follow' WHERE id = 'booking-id';

