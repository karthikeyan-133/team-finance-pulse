
-- Create orders table for detailed order information
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID REFERENCES public.customers(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  shop_name TEXT NOT NULL,
  shop_address TEXT,
  shop_phone TEXT,
  product_details JSONB NOT NULL, -- Store array of products with details
  total_amount NUMERIC NOT NULL,
  delivery_charge NUMERIC DEFAULT 0,
  commission NUMERIC DEFAULT 0,
  payment_status TEXT DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  payment_method TEXT DEFAULT 'cash' CHECK (payment_method IN ('cash', 'upi', 'card', 'other')),
  order_status TEXT DEFAULT 'pending' CHECK (order_status IN ('pending', 'assigned', 'picked_up', 'delivered', 'cancelled')),
  delivery_boy_id UUID,
  assigned_at TIMESTAMP WITH TIME ZONE,
  picked_up_at TIMESTAMP WITH TIME ZONE,
  delivered_at TIMESTAMP WITH TIME ZONE,
  special_instructions TEXT,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create delivery boys table
CREATE TABLE public.delivery_boys (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL UNIQUE,
  email TEXT,
  vehicle_type TEXT CHECK (vehicle_type IN ('bike', 'bicycle', 'car', 'scooter')),
  vehicle_number TEXT,
  is_active BOOLEAN DEFAULT true,
  current_location TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create order assignments table for tracking delivery requests
CREATE TABLE public.order_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  delivery_boy_id UUID NOT NULL REFERENCES public.delivery_boys(id) ON DELETE CASCADE,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  responded_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  UNIQUE(order_id, delivery_boy_id)
);

-- Add indexes for better performance
CREATE INDEX idx_orders_status ON public.orders(order_status);
CREATE INDEX idx_orders_delivery_boy ON public.orders(delivery_boy_id);
CREATE INDEX idx_order_assignments_delivery_boy ON public.order_assignments(delivery_boy_id);
CREATE INDEX idx_order_assignments_status ON public.order_assignments(status);

-- Enable RLS (Row Level Security)
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.delivery_boys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for orders table (allow all operations for now)
CREATE POLICY "Allow all operations on orders" ON public.orders FOR ALL USING (true);

-- Create policies for delivery boys table
CREATE POLICY "Allow all operations on delivery_boys" ON public.delivery_boys FOR ALL USING (true);

-- Create policies for order assignments table
CREATE POLICY "Allow all operations on order_assignments" ON public.order_assignments FOR ALL USING (true);

-- Insert sample delivery boys
INSERT INTO public.delivery_boys (name, phone, email, vehicle_type, vehicle_number) VALUES
('Raj Kumar', '+919876543210', 'raj@delivery.com', 'bike', 'KA01AB1234'),
('Amit Singh', '+919876543211', 'amit@delivery.com', 'scooter', 'KA02CD5678'),
('Priya Sharma', '+919876543212', 'priya@delivery.com', 'bicycle', 'KA03EF9012');
