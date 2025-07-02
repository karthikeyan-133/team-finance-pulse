-- Fix the security definer issue by setting security_invoker
ALTER VIEW public.shop_payment_summary
    SET (security_invoker = on);