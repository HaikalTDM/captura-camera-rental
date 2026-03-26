-- CAPTURA Customer Reviews Schema
-- Verified review requests with moderation before public display.

CREATE TABLE IF NOT EXISTS review_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    booking_group_id UUID REFERENCES booking_groups(id) ON DELETE SET NULL,
    token_hash TEXT NOT NULL UNIQUE,
    token_last4 VARCHAR(8),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'opened', 'submitted', 'expired', 'cancelled')),
    sent_via VARCHAR(20) NOT NULL DEFAULT 'whatsapp'
      CHECK (sent_via IN ('whatsapp', 'email', 'manual')),
    expires_at TIMESTAMPTZ NOT NULL,
    opened_at TIMESTAMPTZ,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS customer_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_request_id UUID NOT NULL UNIQUE REFERENCES review_requests(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
    booking_id UUID REFERENCES bookings(id) ON DELETE SET NULL,
    booking_group_id UUID REFERENCES booking_groups(id) ON DELETE SET NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    review_text TEXT NOT NULL,
    display_name_masked VARCHAR(120) NOT NULL,
    camera_name_snapshot VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending'
      CHECK (status IN ('pending', 'approved', 'rejected', 'hidden')),
    featured BOOLEAN NOT NULL DEFAULT FALSE,
    submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_requests_customer_id ON review_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_booking_id ON review_requests(booking_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_status ON review_requests(status);
CREATE INDEX IF NOT EXISTS idx_review_requests_expires_at ON review_requests(expires_at);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_status ON customer_reviews(status);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_featured ON customer_reviews(featured);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_submitted_at ON customer_reviews(submitted_at DESC);
CREATE INDEX IF NOT EXISTS idx_customer_reviews_customer_id ON customer_reviews(customer_id);

DROP TRIGGER IF EXISTS update_review_requests_updated_at ON review_requests;
CREATE TRIGGER update_review_requests_updated_at
BEFORE UPDATE ON review_requests
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_customer_reviews_updated_at ON customer_reviews;
CREATE TRIGGER update_customer_reviews_updated_at
BEFORE UPDATE ON customer_reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
