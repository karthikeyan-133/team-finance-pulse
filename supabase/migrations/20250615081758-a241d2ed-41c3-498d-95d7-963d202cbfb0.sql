
-- Enable Row Level Security on shop_payments table
ALTER TABLE public.shop_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for shop_payments table
-- Allow all authenticated users to view shop payments (for admin access)
CREATE POLICY "Allow authenticated users to view shop payments" 
ON public.shop_payments 
FOR SELECT 
TO authenticated 
USING (true);

-- Allow all authenticated users to insert shop payments (for system operations)
CREATE POLICY "Allow authenticated users to insert shop payments" 
ON public.shop_payments 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Allow all authenticated users to update shop payments (for payment status updates)
CREATE POLICY "Allow authenticated users to update shop payments" 
ON public.shop_payments 
FOR UPDATE 
TO authenticated 
USING (true);

-- Drop and recreate the shop_payment_summary view without SECURITY DEFINER
DROP VIEW IF EXISTS public.shop_payment_summary;

CREATE VIEW public.shop_payment_summary AS
SELECT 
  shop_name,
  payment_date,
  SUM(CASE WHEN payment_status = 'pending' THEN amount ELSE 0 END) as pending_amount,
  SUM(CASE WHEN payment_status = 'paid' THEN amount ELSE 0 END) as paid_amount,
  SUM(amount) as total_amount,
  COUNT(*) as total_transactions,
  COUNT(CASE WHEN payment_status = 'pending' THEN 1 END) as pending_transactions
FROM public.shop_payments
GROUP BY shop_name, payment_date
ORDER BY shop_name, payment_date DESC;
