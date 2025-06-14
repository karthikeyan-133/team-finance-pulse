
-- Add foreign key constraint between orders and delivery_boys tables
ALTER TABLE public.orders 
ADD CONSTRAINT orders_delivery_boy_id_fkey 
FOREIGN KEY (delivery_boy_id) 
REFERENCES public.delivery_boys(id);
