-- Create shop payment records for the KL 70 order that should have been created by the trigger
INSERT INTO public.shop_payments (
  shop_name, 
  amount, 
  payment_date, 
  payment_type, 
  order_id
) VALUES 
  ('KL 70', 28, '2025-07-02', 'commission', 'bac72eb2-acc1-4f0c-91e9-d458e1d26eab'),
  ('KL 70', 20, '2025-07-02', 'delivery_charge', 'bac72eb2-acc1-4f0c-91e9-d458e1d26eab');