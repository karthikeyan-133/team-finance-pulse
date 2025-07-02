-- Recreate the shop payments trigger function with proper logic
CREATE OR REPLACE FUNCTION public.update_shop_payments_from_orders()
RETURNS TRIGGER AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    -- Insert commission payment record
    IF NEW.commission > 0 THEN
      INSERT INTO public.shop_payments (
        shop_name, 
        amount, 
        payment_date, 
        payment_type, 
        order_id
      ) VALUES (
        NEW.shop_name, 
        NEW.commission, 
        NEW.created_at::date, 
        'commission', 
        NEW.id
      );
    END IF;
    
    -- Insert delivery charge payment record  
    IF NEW.delivery_charge > 0 THEN
      INSERT INTO public.shop_payments (
        shop_name, 
        amount, 
        payment_date, 
        payment_type, 
        order_id
      ) VALUES (
        NEW.shop_name, 
        NEW.delivery_charge, 
        NEW.created_at::date, 
        'delivery_charge', 
        NEW.id
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Update existing payment records for this order
    UPDATE public.shop_payments 
    SET 
      amount = CASE 
        WHEN payment_type = 'commission' THEN NEW.commission
        WHEN payment_type = 'delivery_charge' THEN NEW.delivery_charge
        ELSE amount
      END,
      updated_at = now()
    WHERE order_id = NEW.id;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Recreate the trigger (drop first to avoid conflicts)
DROP TRIGGER IF EXISTS trigger_update_shop_payments ON public.orders;
CREATE TRIGGER trigger_update_shop_payments
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shop_payments_from_orders();