-- Update RLS policies for shop_payments to allow public read access for admin panel
-- Keep the existing policies and add a public read policy

-- Allow public read access to shop payments (for admin panel)
CREATE POLICY "Allow public read access on shop_payments" 
ON public.shop_payments 
FOR SELECT 
USING (true);

-- Allow public update access to shop payments (for admin panel)
CREATE POLICY "Allow public update access on shop_payments" 
ON public.shop_payments 
FOR UPDATE 
USING (true);