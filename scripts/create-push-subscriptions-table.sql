-- Create push_subscriptions table for Web Push Notifications
-- Run this in your Supabase SQL Editor

CREATE TABLE IF NOT EXISTS push_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint TEXT UNIQUE NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create index on endpoint for faster lookups
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);

-- Create index on is_active for filtering active subscriptions
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_is_active ON push_subscriptions(is_active);

-- Add comment to table
COMMENT ON TABLE push_subscriptions IS 'Stores Web Push Notification subscriptions for admin devices';

-- Add comments to columns
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Unique push notification endpoint URL';
COMMENT ON COLUMN push_subscriptions.p256dh_key IS 'Public key for encryption (p256dh)';
COMMENT ON COLUMN push_subscriptions.auth_key IS 'Authentication secret for encryption';
COMMENT ON COLUMN push_subscriptions.is_active IS 'Whether this subscription is active';

