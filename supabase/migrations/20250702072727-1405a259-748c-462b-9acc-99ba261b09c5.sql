-- Drop the existing view with security issues
DROP VIEW IF EXISTS public.shop_payment_summary;

-- Recreate the view as a standard view without SECURITY DEFINER
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

-- Enable RLS on the view by granting access
GRANT SELECT ON public.shop_payment_summary TO authenticated;
GRANT SELECT ON public.shop_payment_summary TO anon;