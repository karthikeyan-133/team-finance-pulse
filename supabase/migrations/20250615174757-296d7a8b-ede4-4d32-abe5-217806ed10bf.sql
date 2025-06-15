
-- Allow public read access to all shops
CREATE POLICY "Allow public read access on shops"
ON public.shops FOR SELECT
USING (true);

-- Allow public update access to all shops
CREATE POLICY "Allow public update access on shops"
ON public.shops FOR UPDATE
USING (true)
WITH CHECK (true);

-- Allow public delete access to all shops
CREATE POLICY "Allow public delete access on shops"
ON public.shops FOR DELETE
USING (true);
