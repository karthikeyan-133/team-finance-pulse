-- Drop the existing function first
DROP FUNCTION IF EXISTS public.update_shop_payments_from_orders();

-- Recreate the function with new signature
CREATE OR REPLACE FUNCTION public.update_shop_payments_from_orders()
RETURNS void
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
    -- Your function logic here
END;
$$;