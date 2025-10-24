-- Add Insta360 X5 Motorcycle Bundle Set
-- Pricing: RM50/day for 1-3 days, RM45/day for 4+ days

INSERT INTO cameras (
    name,
    brand,
    model,
    description,
    daily_rate,
    weekly_rate,
    monthly_rate,
    discount_threshold,
    image_url,
    is_available,
    location,
    notes,
    display_order,
    purchase_price,
    deposit_amount,
    purchase_date,
    condition,
    status
) VALUES (
    'Insta360 X5',
    'Insta360',
    'X5',
    'Ultimate motorcycle bundle set with 360° capture. Perfect for action shots and immersive footage. Includes all mounting accessories.',
    50,  -- Daily rate for 1-3 days
    315, -- Weekly rate (45 x 7 = 315)
    1350, -- Monthly rate (45 x 30 = 1350)
    4, -- Discount threshold: 4+ days for discounted rate
    '/images/Insta360-X5-1.webp',
    true,
    'Kuala Lumpur',
    'Motorcycle bundle set. Special pricing: RM50/day for 1-3 days, RM45/day for 4+ days. Weekly rate: RM315 (RM45/day). Monthly rate: RM1350 (RM45/day).',
    3, -- Display after Osmo Pocket 3 (0), Osmo Pocket 3 (ii) (1), Action 5 Pro (2)
    0,
    100, -- Standard RM100 deposit
    CURRENT_DATE, -- Purchase date (today's date)
    'excellent', -- Condition
    'available' -- Status
);

-- Verify the camera was added
SELECT id, name, brand, model, daily_rate, weekly_rate, monthly_rate, display_order, is_available
FROM cameras 
WHERE name = 'Insta360 X5';

-- Show all cameras in order
SELECT id, name, display_order 
FROM cameras 
ORDER BY display_order;

