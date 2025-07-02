-- Update the recent KL 70 order to have commission and delivery charges
-- This will trigger the shop payment creation
UPDATE public.orders 
SET 
  commission = 28,  -- 10% commission
  delivery_charge = 20,  -- delivery charge
  updated_at = now()
WHERE shop_name = 'KL 70' 
  AND total_amount = 280 
  AND id = 'bac72eb2-acc1-4f0c-91e9-d458e1d26eab';