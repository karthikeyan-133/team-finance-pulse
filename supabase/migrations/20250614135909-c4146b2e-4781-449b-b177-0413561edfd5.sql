
-- Insert sample shops for different categories
INSERT INTO public.shops (name, category, address, phone, is_active) VALUES 
('Fresh Food Corner', 'Food', '123 Main Street, Downtown', '+1234567890', true),
('Green Grocery Store', 'Grocery', '456 Oak Avenue, City Center', '+1234567891', true),
('Farm Fresh Vegetables', 'Vegetables', '789 Garden Road, Suburb', '+1234567892', true),
('Premium Meat Market', 'Meat', '321 Butcher Lane, Market District', '+1234567893', true),
('Daily Essentials', 'Grocery', '654 Shopping Plaza, Mall Area', '+1234567894', true);

-- Insert sample products for Food category
INSERT INTO public.products (shop_id, name, description, price, category, image_url, is_available) 
SELECT 
    s.id,
    product.name,
    product.description,
    product.price,
    'Food',
    product.image_url,
    true
FROM shops s
CROSS JOIN (
    VALUES 
    ('Pizza Margherita', 'Classic pizza with tomato sauce, mozzarella, and basil', 12.99, 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b'),
    ('Chicken Burger', 'Grilled chicken breast with lettuce, tomato, and mayo', 8.99, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd'),
    ('Caesar Salad', 'Fresh romaine lettuce with Caesar dressing and croutons', 7.50, 'https://images.unsplash.com/photo-1551248429-40975aa4de74'),
    ('Pasta Carbonara', 'Creamy pasta with bacon, eggs, and parmesan cheese', 11.99, 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5'),
    ('Fish & Chips', 'Beer-battered fish with crispy fries', 13.50, 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0d'),
    ('Chocolate Cake', 'Rich chocolate cake with chocolate frosting', 5.99, 'https://images.unsplash.com/photo-1578985545062-69928b1d9587')
) AS product(name, description, price, image_url)
WHERE s.category = 'Food';

-- Insert sample products for Grocery category
INSERT INTO public.products (shop_id, name, description, price, category, image_url, is_available) 
SELECT 
    s.id,
    product.name,
    product.description,
    product.price,
    'Grocery',
    product.image_url,
    true
FROM shops s
CROSS JOIN (
    VALUES 
    ('Whole Wheat Bread', 'Fresh baked whole wheat bread loaf', 2.99, 'https://images.unsplash.com/photo-1509440159596-0249088772ff'),
    ('Organic Milk', '1 gallon organic whole milk', 4.50, 'https://images.unsplash.com/photo-1550583724-b2692b85b150'),
    ('Free Range Eggs', 'Dozen fresh free-range eggs', 3.99, 'https://images.unsplash.com/photo-1518569656558-1f25e69d93d7'),
    ('Basmati Rice', '5lb bag of premium basmati rice', 8.99, 'https://images.unsplash.com/photo-1586201375761-83865001e31c'),
    ('Olive Oil', 'Extra virgin olive oil 500ml', 12.99, 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5'),
    ('Canned Tomatoes', 'Organic crushed tomatoes 400g', 1.99, 'https://images.unsplash.com/photo-1571771019784-3ff35f4f4277'),
    ('Pasta', 'Italian durum wheat pasta 500g', 1.50, 'https://images.unsplash.com/photo-1551892374-ecf8db4ccc4b'),
    ('Honey', 'Raw wildflower honey 250g', 7.50, 'https://images.unsplash.com/photo-1587049352846-4a222e784d38')
) AS product(name, description, price, image_url)
WHERE s.category = 'Grocery';

-- Insert sample products for Vegetables category
INSERT INTO public.products (shop_id, name, description, price, category, image_url, is_available) 
SELECT 
    s.id,
    product.name,
    product.description,
    product.price,
    'Vegetables',
    product.image_url,
    true
FROM shops s
CROSS JOIN (
    VALUES 
    ('Fresh Tomatoes', 'Ripe red tomatoes per kg', 3.50, 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea'),
    ('Organic Carrots', 'Fresh organic carrots per kg', 2.99, 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37'),
    ('Green Lettuce', 'Fresh green lettuce head', 1.99, 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1'),
    ('Red Onions', 'Fresh red onions per kg', 2.50, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655'),
    ('Bell Peppers', 'Mixed color bell peppers per kg', 4.99, 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83'),
    ('Broccoli', 'Fresh green broccoli per piece', 3.25, 'https://images.unsplash.com/photo-1628773822503-930a7eaecf80'),
    ('Spinach', 'Fresh baby spinach 200g bag', 2.75, 'https://images.unsplash.com/photo-1576045057995-568f588f82fb'),
    ('Potatoes', 'Fresh potatoes per kg', 1.99, 'https://images.unsplash.com/photo-1518977676601-b53f82aba655'),
    ('Cucumbers', 'Fresh cucumbers per kg', 2.25, 'https://images.unsplash.com/photo-1449300079323-02e209d9d3a6'),
    ('Garlic', 'Fresh garlic bulbs per 100g', 1.50, 'https://images.unsplash.com/photo-1471197870014-70ebac018817')
) AS product(name, description, price, image_url)
WHERE s.category = 'Vegetables';

-- Insert sample products for Meat category
INSERT INTO public.products (shop_id, name, description, price, category, image_url, is_available) 
SELECT 
    s.id,
    product.name,
    product.description,
    product.price,
    'Meat',
    product.image_url,
    true
FROM shops s
CROSS JOIN (
    VALUES 
    ('Chicken Breast', 'Fresh boneless chicken breast per kg', 8.99, 'https://images.unsplash.com/photo-1604503468506-a8da13d82791'),
    ('Ground Beef', 'Fresh ground beef 80/20 per kg', 12.99, 'https://images.unsplash.com/photo-1588347818834-4c93c4b8820b'),
    ('Pork Chops', 'Fresh pork chops per kg', 10.50, 'https://images.unsplash.com/photo-1602470520998-f4a52199a3d6'),
    ('Salmon Fillet', 'Fresh Atlantic salmon fillet per kg', 18.99, 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2'),
    ('Lamb Leg', 'Fresh lamb leg per kg', 22.99, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d'),
    ('Chicken Wings', 'Fresh chicken wings per kg', 6.99, 'https://images.unsplash.com/photo-1562967914-608f82629710'),
    ('Beef Steak', 'Premium ribeye steak per kg', 28.99, 'https://images.unsplash.com/photo-1546833999-b9f581a1996d'),
    ('Turkey Breast', 'Fresh turkey breast sliced per kg', 11.99, 'https://images.unsplash.com/photo-1574672280600-4accfa5b6f98'),
    ('Bacon', 'Smoked bacon strips per 500g', 7.50, 'https://images.unsplash.com/photo-1528607929212-2636ec44253e'),
    ('Shrimp', 'Fresh jumbo shrimp per kg', 24.99, 'https://images.unsplash.com/photo-1565680018434-b513d5573b80')
) AS product(name, description, price, image_url)
WHERE s.category = 'Meat';
