-- Clear all orders created today
DELETE FROM public.orders 
WHERE DATE(created_at) = CURRENT_DATE;

-- Clear all transactions created today
DELETE FROM public.transactions 
WHERE DATE(created_at) = CURRENT_DATE;

-- Clear all order assignments created today
DELETE FROM public.order_assignments 
WHERE DATE(assigned_at) = CURRENT_DATE;

-- Clear all shop payments created today
DELETE FROM public.shop_payments 
WHERE DATE(created_at) = CURRENT_DATE;