-- Query to get the structure and data from existing Osmo Pocket 3 camera
SELECT * FROM cameras WHERE name LIKE '%Osmo Pocket 3%' AND name NOT LIKE '%(ii)%' LIMIT 1;

