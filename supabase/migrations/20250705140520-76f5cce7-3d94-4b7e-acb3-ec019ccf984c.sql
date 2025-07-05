-- Update the recent Sreesanth order with commission and delivery charges
UPDATE public.orders 
SET 
  commission = 10,  -- 10% commission on 100 = 10
  delivery_charge = 20,  -- Standard delivery charge
  updated_at = now()
WHERE id = '5ea4a6b5-1202-482a-aa91-04e218f13db4';