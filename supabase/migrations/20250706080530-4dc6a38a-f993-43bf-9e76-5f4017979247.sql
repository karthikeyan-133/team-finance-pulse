-- Enable real-time updates for orders table
ALTER TABLE public.orders REPLICA IDENTITY FULL;

-- Enable real-time updates for order_assignments table  
ALTER TABLE public.order_assignments REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;
ALTER PUBLICATION supabase_realtime ADD TABLE public.order_assignments;