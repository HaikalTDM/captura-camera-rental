-- Events Table for Malaysian event calendar
-- Run this in Supabase SQL Editor

CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  date DATE NOT NULL,
  end_date DATE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('holiday', 'season', 'concert', 'sports', 'festival')),
  demand VARCHAR(20) NOT NULL CHECK (demand IN ('peak', 'high', 'medium')),
  description TEXT,
  recommended_camera VARCHAR(255),
  special_offer TEXT,
  icon VARCHAR(10),
  color VARCHAR(100),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Create indexes for better query performance
CREATE INDEX idx_events_date ON events(date);
CREATE INDEX idx_events_category ON events(category);
CREATE INDEX idx_events_demand ON events(demand);
CREATE INDEX idx_events_is_active ON events(is_active);

-- Enable Row Level Security (RLS)
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view active events
CREATE POLICY "Public can view active events"
  ON events FOR SELECT
  USING (is_active = true);

-- Policy: Only authenticated admins can insert events
CREATE POLICY "Admins can insert events"
  ON events FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');

-- Policy: Only authenticated admins can update events
CREATE POLICY "Admins can update events"
  ON events FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Policy: Only authenticated admins can delete events
CREATE POLICY "Admins can delete events"
  ON events FOR DELETE
  USING (auth.role() = 'authenticated');

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_events_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc'::text, NOW());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to call the function
CREATE TRIGGER events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_events_updated_at();

-- Insert sample Malaysian events for 2025
INSERT INTO events (title, date, end_date, category, demand, description, recommended_camera, special_offer, icon, color) VALUES
('Chinese New Year 2025', '2025-01-29', '2025-02-02', 'holiday', 'peak', 'Capture family gatherings, lion dances, and festive moments', 'DJI Osmo Pocket 3', '15% off early bookings', '🎊', 'from-red-500 to-orange-600'),
('Wedding Season (Spring)', '2025-02-01', '2025-04-30', 'season', 'peak', 'Peak wedding season - book your camera now', 'Both cameras available', '3-day package deals', '💒', 'from-pink-500 to-rose-600'),
('Hari Raya Aidilfitri', '2025-03-30', '2025-04-02', 'holiday', 'peak', 'Perfect for Raya celebrations and family portraits', 'DJI Action 5 Pro', '10% off for early birds', '🌙', 'from-emerald-500 to-teal-600'),
('School Holidays', '2025-03-15', '2025-03-23', 'season', 'high', 'Family trips and vacation content creation', 'DJI Action 5 Pro', NULL, '✈️', 'from-blue-500 to-indigo-600'),
('Wesak Day', '2025-05-12', NULL, 'holiday', 'medium', 'Temple visits and cultural documentation', 'DJI Osmo Pocket 3', NULL, '🪔', 'from-amber-500 to-yellow-600'),
('Graduation Season', '2025-05-01', '2025-05-31', 'season', 'high', 'Capture graduation moments and celebrations', 'DJI Osmo Pocket 3', 'Student discount available', '🎓', 'from-purple-500 to-indigo-600'),
('Merdeka Day', '2025-08-31', NULL, 'holiday', 'medium', 'National day celebrations and parades', 'DJI Action 5 Pro', NULL, '🇲🇾', 'from-red-500 to-blue-600'),
('Malaysia Day', '2025-09-16', NULL, 'holiday', 'medium', 'Patriotic events and celebrations', 'DJI Action 5 Pro', NULL, '🎌', 'from-yellow-500 to-red-600'),
('Deepavali', '2025-10-20', NULL, 'holiday', 'high', 'Festival of lights celebrations', 'DJI Osmo Pocket 3', '10% festival discount', '🪔', 'from-orange-500 to-red-600'),
('Wedding Season (Fall)', '2025-10-01', '2025-12-31', 'season', 'peak', 'Year-end wedding peak season', 'Both cameras available', 'Package deals available', '💍', 'from-rose-500 to-pink-600'),
('Graduation Season', '2025-11-01', '2025-11-30', 'season', 'high', 'End of year graduation ceremonies', 'DJI Osmo Pocket 3', NULL, '🎓', 'from-blue-500 to-purple-600'),
('Christmas', '2025-12-25', NULL, 'holiday', 'high', 'Holiday festivities and family gatherings', 'DJI Osmo Pocket 3', 'Holiday special rates', '🎄', 'from-green-500 to-red-600'),
('New Year''s Eve', '2025-12-31', NULL, 'festival', 'peak', 'Countdown celebrations and fireworks', 'DJI Action 5 Pro', 'NYE package available', '🎆', 'from-indigo-500 to-purple-600');

COMMENT ON TABLE events IS 'Malaysian event calendar for camera rental planning';

