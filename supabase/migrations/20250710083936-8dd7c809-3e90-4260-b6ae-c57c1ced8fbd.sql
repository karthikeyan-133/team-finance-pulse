-- Clear ALL data in the correct order to avoid foreign key violations

-- First delete shop_payments (they reference orders and transactions)
DELETE FROM public.shop_payments;

-- Then delete order_assignments (they reference orders)
DELETE FROM public.order_assignments;

-- Then delete transactions
DELETE FROM public.transactions;

-- Finally delete orders
DELETE FROM public.orders;