-- Fix shop name inconsistencies in shop_payments table
-- Update case-insensitive shop names to match exact names from shops table

-- Update 'al cafe' to 'AL Cafe'
UPDATE shop_payments 
SET shop_name = 'AL Cafe'
WHERE LOWER(TRIM(shop_name)) = 'al cafe';

-- Update 'kl 70' to 'KL 70 ' (note the trailing space in shops table)
UPDATE shop_payments 
SET shop_name = 'KL 70 '
WHERE LOWER(TRIM(shop_name)) = 'kl 70';

-- Update 'zyra' to 'ZYRA'
UPDATE shop_payments 
SET shop_name = 'ZYRA'
WHERE LOWER(TRIM(shop_name)) = 'zyra';