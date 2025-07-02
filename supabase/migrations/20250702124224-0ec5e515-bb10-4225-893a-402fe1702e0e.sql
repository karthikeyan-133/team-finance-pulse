-- Test the trigger by updating the order to trigger payment creation
UPDATE public.orders 
SET 
  commission = 28,
  delivery_charge = 20,
  updated_at = now()
WHERE id = 'bac72eb2-acc1-4f0c-91e9-d458e1d26eab';