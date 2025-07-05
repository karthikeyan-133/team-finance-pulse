-- Update Aswin's order with commission and delivery charges
UPDATE public.orders 
SET 
  commission = 80,  -- 10% commission on 800 = 80
  delivery_charge = 25,  -- Standard delivery charge
  updated_at = now()
WHERE id = '6e387926-54d1-4c4a-ae61-c1fea1dca6e3';