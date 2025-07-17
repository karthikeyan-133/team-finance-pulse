
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface OrderItem {
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export const useOrderManagement = () => {
  const [cart, setCart] = useState<OrderItem[]>([]);
  const [deliveryType, setDeliveryType] = useState<'urgent' | 'scheduled' | ''>('');
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');
  const [deliveryTime, setDeliveryTime] = useState('');
  const [orderHistory, setOrderHistory] = useState<any[]>([]);

  const fetchOrderHistory = async (customerPhone: string) => {
    try {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_phone', customerPhone)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching order history:', error);
        return;
      }
      setOrderHistory(orders || []);
    } catch (error) {
      console.error('Error fetching order history:', error);
    }
  };

  const addToCart = (product: any) => {
    const existingItem = cart.find(item => item.name === product.name);
    if (existingItem) {
      setCart(cart.map(item => 
        item.name === product.name 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const getTotalItems = () => {
    return cart.reduce((sum, item) => sum + item.quantity, 0);
  };

  const getTotalAmount = () => {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
    setDeliveryType('');
    setSelectedTimeSlot('');
    setDeliveryTime('');
  };

  return {
    cart,
    deliveryType,
    setDeliveryType,
    selectedTimeSlot,
    setSelectedTimeSlot,
    deliveryTime,
    setDeliveryTime,
    orderHistory,
    fetchOrderHistory,
    addToCart,
    getTotalItems,
    getTotalAmount,
    clearCart
  };
};
