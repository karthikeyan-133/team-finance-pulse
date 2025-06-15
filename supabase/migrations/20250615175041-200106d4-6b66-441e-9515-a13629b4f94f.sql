
-- Allow public read access on products
CREATE POLICY "Allow public read access on products"
ON public.products FOR SELECT
USING (true);

-- Allow public insert access on products
CREATE POLICY "Allow public insert access on products"
ON public.products FOR INSERT
WITH CHECK (true);

-- Allow public update access on products
CREATE POLICY "Allow public update access on products"
ON public.products FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow public delete access on products
CREATE POLICY "Allow public delete access on products"
ON public.products FOR DELETE
USING (true);
