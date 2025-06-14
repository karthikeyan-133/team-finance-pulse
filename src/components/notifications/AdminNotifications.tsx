
import React, { useState, useEffect } from 'react';
import { Bell, CheckCircle, XCircle, Package } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Notification {
  id: string;
  order_id: string;
  delivery_boy_name: string;
  order_number: string;
  status: 'accepted' | 'rejected';
  responded_at: string;
  read: boolean;
}

const AdminNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    fetchNotifications();
    
    // Set up real-time subscription for order assignment updates
    const channel = supabase
      .channel('order-assignment-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'order_assignments',
          filter: 'status=neq.pending'
        },
        (payload) => {
          console.log('Assignment updated:', payload);
          handleNewNotification(payload.new);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('order_assignments')
        .select(`
          id,
          order_id,
          status,
          responded_at,
          orders(order_number),
          delivery_boys(name)
        `)
        .neq('status', 'pending')
        .order('responded_at', { ascending: false })
        .limit(20);

      if (error) throw error;

      const formattedNotifications = data.map(item => ({
        id: item.id,
        order_id: item.order_id,
        delivery_boy_name: item.delivery_boys?.name || 'Unknown',
        order_number: item.orders?.order_number || 'Unknown',
        status: item.status as 'accepted' | 'rejected',
        responded_at: item.responded_at || new Date().toISOString(),
        read: false
      }));

      setNotifications(formattedNotifications);
      setUnreadCount(formattedNotifications.length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleNewNotification = async (assignmentData: any) => {
    try {
      // Fetch complete assignment data with relations
      const { data, error } = await supabase
        .from('order_assignments')
        .select(`
          id,
          order_id,
          status,
          responded_at,
          orders(order_number),
          delivery_boys(name)
        `)
        .eq('id', assignmentData.id)
        .single();

      if (error) throw error;

      const newNotification: Notification = {
        id: data.id,
        order_id: data.order_id,
        delivery_boy_name: data.delivery_boys?.name || 'Unknown',
        order_number: data.orders?.order_number || 'Unknown',
        status: data.status as 'accepted' | 'rejected',
        responded_at: data.responded_at || new Date().toISOString(),
        read: false
      };

      setNotifications(prev => [newNotification, ...prev.slice(0, 19)]);
      setUnreadCount(prev => prev + 1);

      // Show toast notification
      const statusText = data.status === 'accepted' ? 'accepted' : 'rejected';
      toast.info(
        `${data.delivery_boys?.name} ${statusText} order ${data.orders?.order_number}`,
        {
          description: `Order assignment has been ${statusText}`,
          duration: 5000,
        }
      );
    } catch (error) {
      console.error('Error handling new notification:', error);
    }
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const getStatusIcon = (status: 'accepted' | 'rejected') => {
    return status === 'accepted' 
      ? <CheckCircle className="h-4 w-4 text-green-600" />
      : <XCircle className="h-4 w-4 text-red-600" />;
  };

  const getStatusColor = (status: 'accepted' | 'rejected') => {
    return status === 'accepted' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        onClick={() => setShowNotifications(!showNotifications)}
        className="relative"
      >
        <Bell className="h-4 w-4" />
        {unreadCount > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 px-2 py-1 text-xs"
          >
            {unreadCount}
          </Badge>
        )}
      </Button>

      {showNotifications && (
        <Card className="absolute right-0 top-12 w-96 max-h-96 overflow-y-auto z-50 shadow-lg">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm">Order Assignment Updates</CardTitle>
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={markAllAsRead}>
                  Mark all read
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {notifications.length === 0 ? (
              <p className="text-sm text-gray-500 text-center py-4">
                No notifications yet
              </p>
            ) : (
              <div className="space-y-2">
                {notifications.map((notification) => (
                  <Alert key={notification.id} className={`${!notification.read ? 'border-blue-200 bg-blue-50' : ''}`}>
                    <div className="flex items-start gap-2">
                      <Package className="h-4 w-4 mt-0.5" />
                      <div className="flex-1">
                        <AlertDescription>
                          <div className="flex items-center gap-2 mb-1">
                            {getStatusIcon(notification.status)}
                            <span className="font-medium">{notification.delivery_boy_name}</span>
                            <Badge 
                              variant="secondary" 
                              className={`text-xs ${getStatusColor(notification.status)}`}
                            >
                              {notification.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Order: <span className="font-medium">{notification.order_number}</span>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {new Date(notification.responded_at).toLocaleString()}
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

export default AdminNotifications;
