-- Fix the database function that's causing the "row_count" error
CREATE OR REPLACE FUNCTION public.update_shop_payments_on_delivery()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  affected_rows INTEGER;
BEGIN
  -- Check if order status changed to 'delivered'
  IF NEW.order_status = 'delivered' AND (OLD.order_status IS NULL OR OLD.order_status != 'delivered') THEN
    -- Update associated shop payment records to 'paid'
    UPDATE public.shop_payments 
    SET 
      payment_status = 'paid',
      paid_by = 'Auto - Delivery Completed',
      paid_at = now(),
      updated_at = now()
    WHERE order_id = NEW.id 
    AND payment_status = 'pending';
    
    -- Get the number of affected rows
    GET DIAGNOSTICS affected_rows = ROW_COUNT;
    
    -- Log the update for debugging
    RAISE NOTICE 'Updated shop payments for order: %, affected rows: %', NEW.id, affected_rows;
  END IF;
  
  RETURN NEW;
END;
$function$