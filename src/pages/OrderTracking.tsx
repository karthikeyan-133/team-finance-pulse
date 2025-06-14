
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Order, ProductDetail } from '@/types/orders';
import OrderStatusTracker from '@/components/orders/OrderStatusTracker';

const OrderTracking = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('order-status-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders'
        },
        () => {
          console.log('Order updated, refetching orders');
          fetchOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchTerm, statusFilter]);

  const fetchOrders = async () => {
    try {
      console.log('Fetching orders...');
      setIsLoading(true);
      
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          delivery_boys(name)
        `)
        .order('created_at', { ascending: false });

      console.log('Orders query result:', { ordersData, error });

      if (error) {
        console.error('Error fetching orders:', error);
        toast.error('Failed to load orders: ' + error.message);
        return;
      }

      if (!ordersData) {
        console.log('No orders data returned');
        setOrders([]);
        return;
      }

      const typedOrders = ordersData.map(order => ({
        ...order,
        product_details: Array.isArray(order.product_details) ? order.product_details as ProductDetail[] : [],
        payment_status: (order.payment_status || 'pending') as 'pending' | 'paid',
        payment_method: (order.payment_method || 'cash') as 'cash' | 'upi' | 'card' | 'other',
        order_status: (order.order_status || 'pending') as 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'
      }));

      console.log('Processed orders:', typedOrders);
      setOrders(typedOrders);
    } catch (error) {
      console.error('Error in fetchOrders:', error);
      toast.error('Failed to load orders');
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.order_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shop_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.order_status === statusFilter);
    }

    setFilteredOrders(filtered);
  };

  const getStatusStats = () => {
    return {
      pending: orders.filter(o => o.order_status === 'pending').length,
      assigned: orders.filter(o => o.order_status === 'assigned').length,
      picked_up: orders.filter(o => o.order_status === 'picked_up').length,
      delivered: orders.filter(o => o.order_status === 'delivered').length,
      cancelled: orders.filter(o => o.order_status === 'cancelled').length,
    };
  };

  console.log('OrderTracking render - isLoading:', isLoading, 'orders count:', orders.length);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading orders...</p>
        </div>
      </div>
    );
  }

  const stats = getStatusStats();

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Order Tracking</h1>
        <p className="text-gray-600">Monitor all order statuses and delivery progress</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
            <div className="text-sm text-gray-600">Pending</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.assigned}</div>
            <div className="text-sm text-gray-600">Assigned</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-600">{stats.picked_up}</div>
            <div className="text-sm text-gray-600">Picked Up</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
            <div className="text-sm text-gray-600">Delivered</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
            <div className="text-sm text-gray-600">Cancelled</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Orders ({filteredOrders.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search by order number, customer, or shop..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="assigned">Assigned</SelectItem>
                <SelectItem value="picked_up">Picked Up</SelectItem>
                <SelectItem value="delivered">Delivered</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders.length === 0 ? (
              <div className="text-center py-8">
                <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">
                  {orders.length === 0 ? 'No orders found' : 'No orders match your search criteria'}
                </p>
              </div>
            ) : (
              filteredOrders.map((order) => (
                <OrderStatusTracker key={order.id} order={order} />
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrderTracking;
