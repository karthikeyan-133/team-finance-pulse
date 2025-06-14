
-- Add new order statuses for preparation stages
ALTER TABLE public.orders 
ADD COLUMN prepared_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN ready_at TIMESTAMP WITH TIME ZONE;

-- Update the order_status check constraint to include new statuses
ALTER TABLE public.orders 
DROP CONSTRAINT IF EXISTS orders_order_status_check;

ALTER TABLE public.orders 
ADD CONSTRAINT orders_order_status_check 
CHECK (order_status IN ('pending', 'preparing', 'prepared', 'ready', 'assigned', 'picked_up', 'delivered', 'cancelled'));

-- Update default status for new orders
ALTER TABLE public.orders 
ALTER COLUMN order_status SET DEFAULT 'pending';
