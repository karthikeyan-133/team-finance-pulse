
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
        .eq('shop_name', shopName)
        .order('created_at', { ascending: false });

      console.log('Orders query result:', { data, error });

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

      console.log('Transformed orders:', transformedOrders);
      setOrders(transformedOrders);
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
        refreshOrders
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
