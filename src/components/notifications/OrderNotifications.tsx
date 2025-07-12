import React, { useState, useEffect } from 'react';
import { Bell, Package, ShoppingCart, Clock } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface OrderNotification {
  id: string;
  order_number: string;
  customer_name: string;
  shop_name: string;
  total_amount: number;
  created_at: string;
  delivery_time?: string;
  read: boolean;
}

const OrderNotifications = () => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchRecentOrders();
    
    // Set up real-time subscription for new orders
    const channel = supabase
      .channel('new-orders')
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'orders'
        },
        (payload) => {
          console.log('New order created:', payload);
          handleNewOrder(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchRecentOrders = async () => {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('id, order_number, customer_name, shop_name, total_amount, created_at, delivery_time')
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedNotifications = data.map(order => ({
        id: order.id,
        order_number: order.order_number,
        customer_name: order.customer_name,
        shop_name: order.shop_name,
        total_amount: order.total_amount,
        created_at: order.created_at,
        delivery_time: order.delivery_time,
        read: false
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.length);
    } catch (error) {
      console.error('Error fetching recent orders:', error);
    }
  };

  const handleNewOrder = (orderData: any) => {
    const newNotification: OrderNotification = {
      id: orderData.id,
      order_number: orderData.order_number,
      customer_name: orderData.customer_name,
      shop_name: orderData.shop_name,
      total_amount: orderData.total_amount,
      created_at: orderData.created_at,
      delivery_time: orderData.delivery_time,
      read: false
    };

    setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
    setUnreadCount(prev => prev + 1);

    // Show toast notification with order details
    toast.success(
      `New Order #${orderData.order_number}`,
      {
        description: `${orderData.customer_name} ordered from ${orderData.shop_name} - ₹${orderData.total_amount}`,
        duration: 5000,
      }
    );

    // Play notification sound (optional)
    try {
      const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+PyxH0pBSl+zPLaizsIGGS57+OZSBAJT6Xh8bl');
      audio.volume = 0.1;
      audio.play().catch(() => {
        // Ignore audio play errors (browser restrictions)
      });
    } catch (error) {
      // Ignore audio errors
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
        size="sm"
      >
        <ShoppingCart className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 px-1.5 py-0.5 text-xs min-w-5 h-5 flex items-center justify-center"
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 top-12 w-80 md:w-96 max-h-96 overflow-y-auto z-50 shadow-lg border">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2">
                <Package className="h-4 w-4" />
                New Orders
              </CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No new orders yet
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <Alert 
                    key={notification.id} 
                    className={`${!notification.read ? 'border-green-200 bg-green-50/50' : 'border-border'} hover:bg-accent/50 transition-colors cursor-pointer`}
                    onClick={() => setNotifications(prev => 
                      prev.map(n => n.id === notification.id ? { ...n, read: true } : n)
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <ShoppingCart className="h-4 w-4 mt-0.5 text-green-600" />
                      <div className="flex-1 min-w-0">
                        <AlertDescription>
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-sm">#{notification.order_number}</span>
                            {!notification.read && (
                              <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                                New
                              </Badge>
                            )}
                          </div>
                          <div className="text-sm text-foreground">
                            <span className="font-medium">{notification.customer_name}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {notification.shop_name} • ₹{notification.total_amount}
                          </div>
                          {notification.delivery_time && (
                            <div className="text-xs text-amber-600 flex items-center gap-1 mt-1">
                              <Clock className="h-3 w-3" />
                              {notification.delivery_time}
                            </div>
                          )}
                          <div className="text-xs text-muted-foreground mt-1">
                            {formatDateTime(notification.created_at)}
                          </div>
                        </AlertDescription>
                      </div>
                    </div>
                  </Alert>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderNotifications;