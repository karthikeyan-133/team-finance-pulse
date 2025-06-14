
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types/orders';
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
  const [isLoading, setIsLoading] = useState(true);

  const fetchOrders = async () => {
    if (!shopName) return;

    try {
      setIsLoading(true);
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

      if (error) throw error;
      setOrders(data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast.error('Failed to fetch orders');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
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
