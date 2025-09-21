-- Sample Maintenance Data for CAPTURA
-- Run this in Supabase SQL Editor to add sample maintenance records

-- Insert sample maintenance records
INSERT INTO maintenance_records (camera_id, maintenance_type, description, cost, maintenance_date, performed_by, notes) VALUES
(
  '12290ecb-a4b2-4c6c-9709-c3ac6151a553', 
  'cleaning', 
  'Regular cleaning and lens inspection', 
  25.00, 
  '2025-09-15', 
  'Tech Team', 
  'Camera cleaned thoroughly, lens checked for scratches'
),
(
  '67cf0e0b-90f4-4bd9-a0f9-b9cbb652cc44', 
  'inspection', 
  'Monthly equipment inspection', 
  0.00, 
  '2025-09-10', 
  'Admin', 
  'All components working properly'
),
(
  '12290ecb-a4b2-4c6c-9709-c3ac6151a553', 
  'repair', 
  'Battery replacement', 
  80.00, 
  '2025-08-20', 
  'Service Center', 
  'Original battery replaced with new one'
);

-- Update cameras with last maintenance dates
UPDATE cameras 
SET last_maintenance = '2025-09-15' 
WHERE id = '12290ecb-a4b2-4c6c-9709-c3ac6151a553';

UPDATE cameras 
SET last_maintenance = '2025-09-10' 
WHERE id = '67cf0e0b-90f4-4bd9-a0f9-b9cbb652cc44';

-- Verify the data
SELECT 'Maintenance records created successfully' as status;
SELECT COUNT(*) as maintenance_count FROM maintenance_records;
SELECT id, name, last_maintenance FROM cameras WHERE last_maintenance IS NOT NULL;
