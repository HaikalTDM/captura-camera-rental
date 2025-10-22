-- Check current camera display order
SELECT 
    id, 
    name, 
    display_order,
    is_available,
    created_at
FROM cameras 
ORDER BY display_order, name;

-- If display_order column doesn't exist or has NULL values, run this fix:
-- UPDATE cameras SET display_order = 999 WHERE display_order IS NULL;

-- To manually fix the order, run these:
-- UPDATE cameras SET display_order = 0 WHERE LOWER(name) LIKE '%osmo%pocket%3%' AND LOWER(name) NOT LIKE '%(ii)%';
-- UPDATE cameras SET display_order = 1 WHERE LOWER(name) LIKE '%osmo%pocket%3%(ii)%' OR LOWER(name) LIKE '%osmo%pocket%3% (ii)%';
-- UPDATE cameras SET display_order = 2 WHERE LOWER(name) LIKE '%action%5%pro%';

