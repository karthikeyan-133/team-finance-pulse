
-- Allow anyone to insert into shops (public access, not secure for production)
CREATE POLICY "Allow public insert for shops"
  ON public.shops
  FOR INSERT
  WITH CHECK (true);

-- Optionally, you may want to allow update/select/delete by adding similar policies.
