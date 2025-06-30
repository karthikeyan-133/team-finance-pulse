
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, ProductDetail } from '@/types/orders';
import { toast } from '@/components/ui/sonner';

interface ShopOwnerContextType {
  shopName: string;
  setShopName: (name: string) => void;
  orders: Order[];
  todayOrders: Order[];
  totalRevenue: number;
  pendingOrders: number;
  deliveredOrders: number;
  isLoading: boolean;
  refreshOrders: () => void;
  createOrder: (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_number'>) => Promise<string>;
}

const ShopOwnerContext = createContext<ShopOwnerContextType | undefined>(undefined);

export const ShopOwnerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [shopName, setShopName] = useState<string>('');
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize shop name from localStorage on mount
  useEffect(() => {
    const savedShopName = localStorage.getItem('shop_owner_session');
    if (savedShopName) {
      try {
        const shopData = JSON.parse(savedShopName);
        console.log('Initializing shop context with session data:', shopData);
        if (shopData && shopData.shopName) {
          setShopName(shopData.shopName);
        }
      } catch (error) {
        console.error('Error parsing shop session:', error);
        localStorage.removeItem('shop_owner_session');
      }
    }
  }, []);

  const fetchOrders = async () => {
    if (!shopName) {
      console.log('No shop name provided, skipping order fetch');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      console.log('Fetching orders for shop:', shopName);
      
      // First, let's check what shop names exist in the database
      const { data: allOrders, error: debugError } = await supabase
        .from('orders')
        .select('shop_name')
        .limit(10);
      
      console.log('Sample shop names in database:', allOrders?.map(o => o.shop_name));
      
      // Use case-insensitive search with ILIKE instead of exact match
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          delivery_boys (
            id,
            name,
            phone
          )
        `)
        .ilike('shop_name', `%${shopName}%`)
        .order('created_at', { ascending: false });

      console.log('Orders query with ILIKE result:', { data, error });
      console.log('Shop name being searched:', shopName);
      console.log('Number of orders found:', data?.length || 0);

      if (error) {
        console.error('Supabase error:', error);
        toast.error('Failed to fetch orders: ' + error.message);
        return;
      }
      
      // Transform the data to match Order type
      const transformedOrders = (data || []).map(order => ({
        ...order,
        product_details: (order.product_details as unknown) as ProductDetail[],
        payment_status: order.payment_status as 'pending' | 'paid',
        payment_method: order.payment_method as 'cash' | 'upi' | 'card' | 'other',
        order_status: order.order_status as 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled',
        delivery_boy: order.delivery_boys ? {
          id: order.delivery_boys.id,
          name: order.delivery_boys.name,
          phone: order.delivery_boys.phone
        } : undefined
      }));

      console.log('Transformed orders for shop:', transformedOrders);
      setOrders(transformedOrders);
      
      if (transformedOrders.length === 0) {
        // Try exact match as fallback
        const { data: exactData, error: exactError } = await supabase
          .from('orders')
          .select(`
            *,
            delivery_boys (
              id,
              name,
              phone
            )
          `)
          .eq('shop_name', shopName)
          .order('created_at', { ascending: false });
          
        console.log('Exact match fallback result:', { data: exactData, error: exactError });
        
        if (exactData && exactData.length > 0) {
          const exactTransformed = exactData.map(order => ({
            ...order,
            product_details: (order.product_details as unknown) as ProductDetail[],
            payment_status: order.payment_status as 'pending' | 'paid',
            payment_method: order.payment_method as 'cash' | 'upi' | 'card' | 'other',
            order_status: order.order_status as 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled',
            delivery_boy: order.delivery_boys ? {
              id: order.delivery_boys.id,
              name: order.delivery_boys.name,
              phone: order.delivery_boys.phone
            } : undefined
          }));
          setOrders(exactTransformed);
        }
      }
      
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (shopName) {
      console.log('Shop name changed, fetching orders for:', shopName);
      fetchOrders();
    } else {
      console.log('No shop name, clearing orders');
      setOrders([]);
    }
  }, [shopName]);

  // Calculate statistics
  const todayOrders = orders.filter(order => {
    const today = new Date().toDateString();
    const orderDate = new Date(order.created_at).toDateString();
    return today === orderDate;
  });

  const totalRevenue = orders
    .filter(order => order.order_status === 'delivered')
    .reduce((sum, order) => sum + order.total_amount, 0);

  const pendingOrders = orders.filter(order => 
    ['pending', 'assigned', 'picked_up'].includes(order.order_status)
  ).length;

  const deliveredOrders = orders.filter(order => 
    order.order_status === 'delivered'
  ).length;

  const refreshOrders = () => {
    console.log('Manual refresh triggered');
    fetchOrders();
  };

  const createOrder = async (orderData: Omit<Order, 'id' | 'created_at' | 'updated_at' | 'order_number'>): Promise<string> => {
    try {
      console.log('Creating order for shop:', shopName);
      
      // Generate order number
      const timestamp = Date.now();
      const orderNumber = `ORD-${shopName.substring(0, 3).toUpperCase()}-${timestamp}`;
      
      // Convert ProductDetail[] to Json format for Supabase
      const productDetailsJson = JSON.parse(JSON.stringify(orderData.product_details));
      
      const { data, error } = await supabase
        .from('orders')
        .insert({
          order_number: orderNumber,
          customer_name: orderData.customer_name,
          customer_phone: orderData.customer_phone,
          customer_address: orderData.customer_address,
          shop_name: shopName, // Use the current shop's name
          shop_address: orderData.shop_address || '',
          shop_phone: orderData.shop_phone || '',
          product_details: productDetailsJson,
          total_amount: orderData.total_amount,
          delivery_charge: orderData.delivery_charge || 0,
          commission: orderData.commission || 0,
          payment_status: orderData.payment_status || 'pending',
          payment_method: orderData.payment_method || 'cash',
          order_status: 'pending', // Always start as pending for admin assignment
          special_instructions: orderData.special_instructions || '',
          created_by: `Shop Owner - ${shopName}`
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating order:', error);
        throw error;
      }

      console.log('Order created successfully:', data);
      toast.success(`Order ${orderNumber} created successfully and sent to admin for assignment`);
      
      // Refresh orders to show the new order
      await fetchOrders();
      
      return data.id;
    } catch (error) {
      console.error('Failed to create order:', error);
      toast.error('Failed to create order');
      throw error;
    }
  };

  return (
    <ShopOwnerContext.Provider
      value={{
        shopName,
        setShopName,
        orders,
        todayOrders,
        totalRevenue,
        pendingOrders,
        deliveredOrders,
        isLoading,
        refreshOrders,
        createOrder
      }}
    >
      {children}
    </ShopOwnerContext.Provider>
  );
};

export const useShopOwner = (): ShopOwnerContextType => {
  const context = useContext(ShopOwnerContext);
  if (context === undefined) {
    throw new Error('useShopOwner must be used within a ShopOwnerProvider');
  }
  return context;
};
