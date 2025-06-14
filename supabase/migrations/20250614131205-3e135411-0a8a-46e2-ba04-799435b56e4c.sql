
-- Create shops table
CREATE TABLE public.shops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  category TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_id UUID REFERENCES public.shops(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT,
  is_available BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_shops_category ON public.shops(category);
CREATE INDEX idx_shops_active ON public.shops(is_active);
CREATE INDEX idx_products_shop_id ON public.products(shop_id);
CREATE INDEX idx_products_category ON public.products(category);
CREATE INDEX idx_products_available ON public.products(is_available);

-- Enable RLS
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Create policies (allow read access for now)
CREATE POLICY "Allow read access to shops" ON public.shops FOR SELECT USING (true);
CREATE POLICY "Allow read access to products" ON public.products FOR SELECT USING (true);

-- Insert sample shops
INSERT INTO public.shops (name, address, phone, category) VALUES
('Zyra Restaurant', '123 Main St', '+919876543210', 'Food'),
('KL 70 Cafe', '456 Park Ave', '+919876543211', 'Food'),
('AL Cafe', '789 Center St', '+919876543212', 'Food'),
('Fresh Mart Grocery', '321 Oak St', '+919876543213', 'Grocery'),
('Green Valley Vegetables', '654 Pine St', '+919876543214', 'Vegetables'),
('Prime Meat Shop', '987 Elm St', '+919876543215', 'Meat');

-- Insert sample products for Food category
INSERT INTO public.products (shop_id, name, description, price, category, image_url) VALUES
((SELECT id FROM public.shops WHERE name = 'Zyra Restaurant'), 'Chicken Biryani', 'Delicious aromatic basmati rice cooked with tender chicken and spices', 250, 'Food', '/api/placeholder/300/200'),
((SELECT id FROM public.shops WHERE name = 'Zyra Restaurant'), 'Butter Chicken', 'Creamy tomato-based curry with tender chicken pieces', 280, 'Food', '/api/placeholder/300/200'),
((SELECT id FROM public.shops WHERE name = 'KL 70 Cafe'), 'Paneer Butter Masala', 'Rich and creamy paneer curry with butter and spices', 220, 'Food', '/api/placeholder/300/200'),
((SELECT id FROM public.shops WHERE name = 'AL Cafe'), 'Chicken Fried Rice', 'Wok-tossed rice with chicken and vegetables', 180, 'Food', '/api/placeholder/300/200');

-- Insert sample products for Grocery category
INSERT INTO public.products (shop_id, name, description, price, category, image_url) VALUES
((SELECT id FROM public.shops WHERE name = 'Fresh Mart Grocery'), 'Basmati Rice (1kg)', 'Premium quality basmati rice', 120, 'Grocery', '/api/placeholder/300/200'),
((SELECT id FROM public.shops WHERE name = 'Fresh Mart Grocery'), 'Cooking Oil (1L)', 'Refined sunflower oil', 150, 'Grocery', '/api/placeholder/300/200'),
((SELECT id FROM public.shops WHERE name = 'Fresh Mart Grocery'), 'Wheat Flour (1kg)', 'Fine quality wheat flour', 45, 'Grocery', '/api/placeholder/300/200'),
((SELECT id FROM public.shops WHERE name = 'Fresh Mart Grocery'), 'Sugar (1kg)', 'Crystal white sugar', 50, 'Grocery', '/api/placeholder/300/200');

-- Insert sample products for Vegetables category
INSERT INTO public.products (shop_id, name, description, price, category, image_url) VALUES
((SELECT id FROM public.shops WHERE name = 'Green Valley Vegetables'), 'Fresh Tomatoes (1kg)', 'Fresh red tomatoes', 40, 'Vegetables', '/api/placeholder/300/200'),
((SELECT id FROM public.shops WHERE name = 'Green Valley Vegetables'), 'Onions (1kg)', 'Fresh red onions', 35, 'Vegetables', '/api/placeholder/300/200'),
((SELECT id FROM public.shops WHERE name = 'Green Valley Vegetables'), 'Potatoes (1kg)', 'Fresh potatoes', 30, 'Vegetables', '/api/placeholder/300/200'),
((SELECT id FROM public.shops WHERE name = 'Green Valley Vegetables'), 'Green Chilies (250g)', 'Fresh green chilies', 20, 'Vegetables', '/api/placeholder/300/200');

-- Insert sample products for Meat category
INSERT INTO public.products (shop_id, name, description, price, category, image_url) VALUES
((SELECT id FROM public.shops WHERE name = 'Prime Meat Shop'), 'Chicken Breast (1kg)', 'Fresh chicken breast', 300, 'Meat', '/api/placeholder/300/200'),
((SELECT id FROM public.shops WHERE name = 'Prime Meat Shop'), 'Mutton (1kg)', 'Fresh mutton pieces', 650, 'Meat', '/api/placeholder/300/200'),
((SELECT id FROM public.shops WHERE name = 'Prime Meat Shop'), 'Fish Fillet (500g)', 'Fresh fish fillet', 200, 'Meat', '/api/placeholder/300/200'),
((SELECT id FROM public.shops WHERE name = 'Prime Meat Shop'), 'Prawns (500g)', 'Fresh prawns', 350, 'Meat', '/api/placeholder/300/200');
