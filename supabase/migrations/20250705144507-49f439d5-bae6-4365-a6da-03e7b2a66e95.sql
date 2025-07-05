-- Create function to auto-update shop payments when order is delivered
CREATE OR REPLACE FUNCTION public.update_shop_payments_on_delivery()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if order status changed to 'delivered'
  IF NEW.order_status = 'delivered' AND OLD.order_status != 'delivered' THEN
    -- Update associated shop payment records to 'paid'
    UPDATE public.shop_payments 
    SET 
      payment_status = 'paid',
      paid_by = 'Auto - Delivery Completed',
      paid_at = now(),
      updated_at = now()
    WHERE order_id = NEW.id 
    AND payment_status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on orders table for delivery completion
CREATE TRIGGER trigger_update_shop_payments_on_delivery
  AFTER UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shop_payments_on_delivery();

-- Update existing delivered orders to mark their payments as paid
UPDATE public.shop_payments 
SET 
  payment_status = 'paid',
  paid_by = 'Auto - Delivery Completed (Backfill)',
  paid_at = now(),
  updated_at = now()
WHERE order_id IN (
  SELECT id FROM public.orders WHERE order_status = 'delivered'
) 
AND payment_status = 'pending';