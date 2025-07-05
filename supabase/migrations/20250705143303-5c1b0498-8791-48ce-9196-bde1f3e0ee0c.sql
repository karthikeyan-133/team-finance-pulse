-- Enable realtime for shop_payments table
ALTER TABLE public.shop_payments REPLICA IDENTITY FULL;

-- Add shop_payments to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.shop_payments;