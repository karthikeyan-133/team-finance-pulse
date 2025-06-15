
-- Create a table for shop payments tracking
CREATE TABLE public.shop_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  shop_name TEXT NOT NULL,
  amount NUMERIC NOT NULL DEFAULT 0,
  payment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid')),
  payment_type TEXT NOT NULL DEFAULT 'commission' CHECK (payment_type IN ('commission', 'delivery_charge', 'other')),
  order_id UUID REFERENCES public.orders(id),
  transaction_id UUID REFERENCES public.transactions(id),
  paid_by TEXT,
  paid_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX idx_shop_payments_shop_name ON public.shop_payments(shop_name);
CREATE INDEX idx_shop_payments_date ON public.shop_payments(payment_date);
CREATE INDEX idx_shop_payments_status ON public.shop_payments(payment_status);

-- Create a view for shop payment summaries
CREATE OR REPLACE VIEW public.shop_payment_summary AS
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

-- Create trigger to update shop_payments when orders are created/updated
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

-- Create trigger on orders table
CREATE TRIGGER trigger_update_shop_payments
  AFTER INSERT OR UPDATE ON public.orders
  FOR EACH ROW
  EXECUTE FUNCTION public.update_shop_payments_from_orders();

-- Insert existing order data into shop_payments
INSERT INTO public.shop_payments (shop_name, amount, payment_date, payment_type, order_id)
SELECT 
  shop_name,
  commission,
  created_at::date,
  'commission',
  id
FROM public.orders 
WHERE commission > 0;

INSERT INTO public.shop_payments (shop_name, amount, payment_date, payment_type, order_id)
SELECT 
  shop_name,
  delivery_charge,
  created_at::date,
  'delivery_charge',
  id
FROM public.orders 
WHERE delivery_charge > 0;
