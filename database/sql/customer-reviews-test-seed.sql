-- CAPTURA Customer Reviews Test Seed
-- Creates one approved mock review for a specific booking so you can verify the UI flow.
-- Update the booking UUID below if you want to target a different booking.

WITH booking_target AS (
    SELECT
        b.id AS booking_id,
        b.customer_id,
        b.booking_group_id,
        b.camera_id,
        c.full_name,
        cam.name AS camera_name
    FROM bookings b
    JOIN customers c ON c.id = b.customer_id
    LEFT JOIN cameras cam ON cam.id::text = b.camera_id::text
    WHERE b.id = 'c1415a22-9417-420c-82e8-1a656c4b677b'
    LIMIT 1
),
inserted_request AS (
    INSERT INTO review_requests (
        customer_id,
        booking_id,
        booking_group_id,
        token_hash,
        token_last4,
        status,
        sent_via,
        expires_at,
        opened_at,
        submitted_at
    )
    SELECT
        booking_target.customer_id,
        booking_target.booking_id,
        booking_target.booking_group_id,
        'mock-test-review-c1415a22-9417-420c-82e8-1a656c4b677b',
        'TEST',
        'submitted',
        'manual',
        NOW() + INTERVAL '30 days',
        NOW(),
        NOW()
    FROM booking_target
    WHERE NOT EXISTS (
        SELECT 1
        FROM review_requests
        WHERE token_hash = 'mock-test-review-c1415a22-9417-420c-82e8-1a656c4b677b'
    )
    RETURNING id, customer_id, booking_id, booking_group_id
),
request_target AS (
    SELECT id, customer_id, booking_id, booking_group_id
    FROM inserted_request
    UNION ALL
    SELECT rr.id, rr.customer_id, rr.booking_id, rr.booking_group_id
    FROM review_requests rr
    WHERE rr.token_hash = 'mock-test-review-c1415a22-9417-420c-82e8-1a656c4b677b'
    LIMIT 1
)
INSERT INTO customer_reviews (
    review_request_id,
    customer_id,
    booking_id,
    booking_group_id,
    rating,
    review_text,
    display_name_masked,
    camera_name_snapshot,
    status,
    featured,
    submitted_at,
    approved_at,
    approved_by
)
SELECT
    request_target.id,
    request_target.customer_id,
    request_target.booking_id,
    request_target.booking_group_id,
    5,
    'Smooth pickup, clear communication, and the camera was exactly as described. Would rent from CAPTURA again.',
    'Tes***',
    booking_target.camera_name,
    'approved',
    TRUE,
    NOW(),
    NOW(),
    'seed-script'
FROM request_target
JOIN booking_target ON booking_target.booking_id = request_target.booking_id
WHERE NOT EXISTS (
    SELECT 1
    FROM customer_reviews
    WHERE review_request_id = request_target.id
);
