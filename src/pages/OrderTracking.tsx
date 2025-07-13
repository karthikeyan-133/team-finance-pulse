
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Search, Package, Trash2 } from 'lucide-react';
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
  const [deleteOrderId, setDeleteOrderId] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
    
    // Set up real-time subscription with improved event handling
    const channel = supabase
      .channel('order-status-updates')
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'orders'
        },
        (payload) => {
          console.log('Order updated, payload:', payload);
          // Handle the updated order data
          const updatedOrder = payload.new;
          if (updatedOrder) {
            console.log('Status changed to:', updatedOrder.order_status);
            // Refresh orders to show the latest status
            fetchOrders();
            
            // Show toast notification for status updates
            if (updatedOrder.order_status === 'assigned') {
              toast.info(`Order #${updatedOrder.order_number} has been assigned to a delivery person`);
            } else if (updatedOrder.order_status === 'picked_up') {
              toast.info(`Order #${updatedOrder.order_number} has been picked up`);
            } else if (updatedOrder.order_status === 'delivered') {
              toast.success(`Order #${updatedOrder.order_number} has been delivered successfully`);
            }
          }
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

  // Helper function to safely convert Json to ProductDetail[]
  const parseProductDetails = (productDetails: any): ProductDetail[] => {
    if (!productDetails) return [];
    
    try {
      // If it's already an array, validate each item
      if (Array.isArray(productDetails)) {
        return productDetails.filter((item: any) => 
          item && 
          typeof item === 'object' && 
          typeof item.name === 'string' &&
          typeof item.quantity === 'number' &&
          typeof item.price === 'number'
        ) as ProductDetail[];
      }
      
      // If it's a string, try to parse it
      if (typeof productDetails === 'string') {
        const parsed = JSON.parse(productDetails);
        if (Array.isArray(parsed)) {
          return parsed.filter((item: any) => 
            item && 
            typeof item === 'object' && 
            typeof item.name === 'string' &&
            typeof item.quantity === 'number' &&
            typeof item.price === 'number'
          ) as ProductDetail[];
        }
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing product details:', error);
      return [];
    }
  };

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
        id: order.id,
        order_number: order.order_number || `ORD-${order.id.slice(0, 8)}`,
        customer_id: order.customer_id || undefined,
        customer_name: order.customer_name || 'Unknown Customer',
        customer_phone: order.customer_phone || '',
        customer_address: order.customer_address || 'No address provided',
        shop_name: order.shop_name || 'Unknown Shop',
        shop_address: order.shop_address || undefined,
        shop_phone: order.shop_phone || undefined,
        product_details: parseProductDetails(order.product_details),
        total_amount: Number(order.total_amount) || 0,
        delivery_charge: Number(order.delivery_charge) || 0,
        commission: Number(order.commission) || 0,
        payment_status: (order.payment_status || 'pending') as 'pending' | 'paid',
        payment_method: (order.payment_method || 'cash') as 'cash' | 'upi' | 'card' | 'other',
        order_status: (order.order_status || 'pending') as 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled',
        delivery_boy_id: order.delivery_boy_id || undefined,
        assigned_at: order.assigned_at || undefined,
        picked_up_at: order.picked_up_at || undefined,
        delivered_at: order.delivered_at || undefined,
        delivery_time: order.delivery_time || undefined,
        special_instructions: order.special_instructions || undefined,
        created_by: order.created_by || 'Unknown',
        created_at: order.created_at,
        updated_at: order.updated_at,
        // Now properly handle the delivery_boys join with the foreign key relationship
        deliveryBoyName: order.delivery_boys?.name || 'Not Assigned'
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

  const deleteOrder = async (orderId: string) => {
    try {
      console.log('Starting delete process for order:', orderId);
      
      // First, check what shop_payments exist for this order
      const { data: paymentsCheck, error: paymentsCheckError } = await supabase
        .from('shop_payments')
        .select('*')
        .eq('order_id', orderId);
      
      console.log('Shop payments for this order:', paymentsCheck);
      
      if (paymentsCheckError) {
        console.error('Error checking shop payments:', paymentsCheckError);
      }

      // Delete related shop_payments records first
      const { error: paymentsError } = await supabase
        .from('shop_payments')
        .delete()
        .eq('order_id', orderId);

      if (paymentsError) {
        console.error('Error deleting shop payments:', paymentsError);
        toast.error('Failed to delete related payments: ' + paymentsError.message);
        return;
      }

      console.log('Shop payments deleted successfully');

      // Check for other foreign key relationships that might block deletion
      const { data: orderAssignments, error: assignmentsCheckError } = await supabase
        .from('order_assignments')
        .select('*')
        .eq('order_id', orderId);
      
      console.log('Order assignments for this order:', orderAssignments);
      
      if (assignmentsCheckError) {
        console.error('Error checking order assignments:', assignmentsCheckError);
      }

      // Delete order assignments if they exist
      if (orderAssignments && orderAssignments.length > 0) {
        const { error: assignmentsError } = await supabase
          .from('order_assignments')
          .delete()
          .eq('order_id', orderId);

        if (assignmentsError) {
          console.error('Error deleting order assignments:', assignmentsError);
          toast.error('Failed to delete related assignments: ' + assignmentsError.message);
          return;
        }
        console.log('Order assignments deleted successfully');
      }

      // Finally delete the order
      const { error: orderError } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (orderError) {
        console.error('Error deleting order:', orderError);
        toast.error('Failed to delete order: ' + orderError.message);
        return;
      }

      console.log('Order deleted successfully');
      toast.success('Order deleted successfully');
      fetchOrders(); // Refresh the orders list
    } catch (error) {
      console.error('Error deleting order:', error);
      toast.error('Failed to delete order');
    }
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
                <div key={order.id} className="relative">
                  <OrderStatusTracker order={order} />
                  <Button
                    variant="outline"
                    size="sm"
                    className="absolute top-4 right-4 text-red-600 border-red-200 hover:bg-red-50"
                    onClick={() => setDeleteOrderId(order.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteOrderId} onOpenChange={() => setDeleteOrderId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => {
                if (deleteOrderId) {
                  deleteOrder(deleteOrderId);
                  setDeleteOrderId(null);
                }
              }}
            >
              Delete Order
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderTracking;
