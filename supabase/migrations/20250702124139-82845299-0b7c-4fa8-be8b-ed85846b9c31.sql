-- First, let's remove the manually created records
DELETE FROM public.shop_payments 
WHERE order_id = 'bac72eb2-acc1-4f0c-91e9-d458e1d26eab';

-- Now let's test the trigger by checking if it exists and works
-- Let's also add some logging to see what's happening

-- Drop and recreate the trigger function with better logic
DROP TRIGGER IF EXISTS trigger_update_shop_payments ON public.orders;
DROP FUNCTION IF EXISTS public.update_shop_payments_from_orders();

CREATE OR REPLACE FUNCTION public.update_shop_payments_from_orders()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Handle INSERT
  IF TG_OP = 'INSERT' THEN
    -- Insert commission payment record
    IF NEW.commission IS NOT NULL AND NEW.commission > 0 THEN
      INSERT INTO public.shop_payments (
        shop_name, 
        amount, 
        payment_date, 
        payment_type, 
        order_id,
        payment_status
      ) VALUES (
        NEW.shop_name, 
        NEW.commission, 
        NEW.created_at::date, 
        'commission', 
        NEW.id,
        'pending'
      );
    END IF;
    
    -- Insert delivery charge payment record  
    IF NEW.delivery_charge IS NOT NULL AND NEW.delivery_charge > 0 THEN
      INSERT INTO public.shop_payments (
        shop_name, 
        amount, 
        payment_date, 
        payment_type, 
        order_id,
        payment_status
      ) VALUES (
        NEW.shop_name, 
        NEW.delivery_charge, 
        NEW.created_at::date, 
        'delivery_charge', 
        NEW.id,
        'pending'
      );
    END IF;
    
    RETURN NEW;
  END IF;
  
  -- Handle UPDATE
  IF TG_OP = 'UPDATE' THEN
    -- Only process if commission or delivery_charge changed
    IF (OLD.commission IS DISTINCT FROM NEW.commission) OR (OLD.delivery_charge IS DISTINCT FROM NEW.delivery_charge) THEN
      
      -- Delete existing payment records for this order
      DELETE FROM public.shop_payments WHERE order_id = NEW.id;
      
      -- Insert new commission payment record if > 0
      IF NEW.commission IS NOT NULL AND NEW.commission > 0 THEN
        INSERT INTO public.shop_payments (
          shop_name, 
          amount, 
          payment_date, 
          payment_type, 
          order_id,
          payment_status
        ) VALUES (
          NEW.shop_name, 
          NEW.commission, 
          NEW.created_at::date, 
          'commission', 
          NEW.id,
          'pending'
        );
      END IF;
      
      -- Insert new delivery charge payment record if > 0
      IF NEW.delivery_charge IS NOT NULL AND NEW.delivery_charge > 0 THEN
        INSERT INTO public.shop_payments (
          shop_name, 
          amount, 
          payment_date, 
          payment_type, 
          order_id,
          payment_status
        ) VALUES (
          NEW.shop_name, 
          NEW.delivery_charge, 
          NEW.created_at::date, 
          'delivery_charge', 
          NEW.id,
          'pending'
        );
      END IF;
    END IF;
    
    RETURN NEW;
  END IF;
  
  RETURN NULL;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER trigger_update_shop_payments
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shop_payments_from_orders();