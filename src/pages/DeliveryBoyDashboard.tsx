import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, Phone, Store, User, Clock, CheckCircle, XCircle, LogOut, Truck } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OrderAssignment, ProductDetail, Order } from '@/types/orders';
import DeliveryStatusUpdater from '@/components/orders/DeliveryStatusUpdater';
import OrderStatusTracker from '@/components/orders/OrderStatusTracker';

const DeliveryBoyDashboard = () => {
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [assignments, setAssignments] = useState<OrderAssignment[]>([]);
  const [acceptedOrders, setAcceptedOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log('Dashboard useEffect running');
    
    // Check if delivery boy is logged in
    const savedSession = localStorage.getItem('delivery_boy_session');
    console.log('Saved session in dashboard:', savedSession);
    
    if (!savedSession) {
      console.log('No saved session found, should redirect to login');
      setIsLoading(false);
      return;
    }
    
    try {
      const deliveryBoyData = JSON.parse(savedSession);
      console.log('Parsed delivery boy data:', deliveryBoyData);
      setDeliveryBoy(deliveryBoyData);
      fetchAssignments(deliveryBoyData.id);
      fetchAcceptedOrders(deliveryBoyData.id);
    } catch (error) {
      console.error('Error parsing delivery boy session:', error);
      localStorage.removeItem('delivery_boy_session');
      setIsLoading(false);
    }
  }, []);

  const fetchAssignments = async (deliveryBoyId: string) => {
    try {
      console.log('Fetching assignments for delivery boy:', deliveryBoyId);
      
      const { data: assignmentsData, error } = await supabase
        .from('order_assignments')
        .select(`
          *,
          orders(*)
        `)
        .eq('delivery_boy_id', deliveryBoyId)
        .eq('status', 'pending')
        .order('assigned_at', { ascending: false });

      console.log('Assignments query result:', { assignmentsData, error });

      if (error) throw error;

      // Type cast the assignments data
      const typedAssignments = (assignmentsData || []).map(assignment => ({
        ...assignment,
        status: assignment.status as 'pending' | 'accepted' | 'rejected',
        orders: assignment.orders ? {
          ...assignment.orders,
          product_details: (assignment.orders.product_details as unknown) as ProductDetail[],
          payment_status: assignment.orders.payment_status as 'pending' | 'paid',
          payment_method: assignment.orders.payment_method as 'cash' | 'upi' | 'card' | 'other',
          order_status: assignment.orders.order_status as 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'
        } : undefined
      }));

      setAssignments(typedAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      toast.error('Failed to load assignments');
    }
  };

  const fetchAcceptedOrders = async (deliveryBoyId: string) => {
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('delivery_boy_id', deliveryBoyId)
        .in('order_status', ['assigned', 'picked_up'])
        .order('assigned_at', { ascending: false });

      if (error) throw error;

      const typedOrders = (ordersData || []).map(order => ({
        ...order,
        product_details: (order.product_details as unknown) as ProductDetail[],
        payment_status: order.payment_status as 'pending' | 'paid',
        payment_method: order.payment_method as 'cash' | 'upi' | 'card' | 'other',
        order_status: order.order_status as 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'
      }));

      setAcceptedOrders(typedOrders);
    } catch (error) {
      console.error('Error fetching accepted orders:', error);
      toast.error('Failed to load accepted orders');
    } finally {
      setIsLoading(false);
    }
  };

  const updateAssignmentStatus = async (assignmentId: string, status: 'accepted' | 'rejected', orderId: string) => {
    try {
      const { error: assignmentError } = await supabase
        .from('order_assignments')
        .update({ 
          status, 
          responded_at: new Date().toISOString() 
        })
        .eq('id', assignmentId);

      if (assignmentError) throw assignmentError;

      if (status === 'accepted') {
        const { error: orderError } = await supabase
          .from('orders')
          .update({ 
            order_status: 'assigned',
            delivery_boy_id: deliveryBoy.id,
            assigned_at: new Date().toISOString()
          })
          .eq('id', orderId);

        if (orderError) throw orderError;
      }

      toast.success(`Order ${status} successfully!`);
      fetchAssignments(deliveryBoy.id);
      fetchAcceptedOrders(deliveryBoy.id);
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  const handleStatusUpdate = () => {
    fetchAcceptedOrders(deliveryBoy.id);
  };

  const handleLogout = () => {
    localStorage.removeItem('delivery_boy_session');
    setDeliveryBoy(null);
    toast.info('Logged out successfully');
  };

  console.log('Dashboard render - deliveryBoy:', deliveryBoy, 'isLoading:', isLoading);

  if (!deliveryBoy && !isLoading) {
    console.log('No delivery boy and not loading, redirecting to login');
    return <Navigate to="/delivery-boy-login" replace />;
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">Loading dashboard...</div>
      </div>
    );
  }

  if (!deliveryBoy) {
    console.log('No delivery boy data, should redirect');
    return <Navigate to="/delivery-boy-login" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Delivery Dashboard</h1>
          <p className="text-gray-600">Welcome back, {deliveryBoy.name}! (ID: {deliveryBoy.id})</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pending Requests ({assignments.length})
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Active Orders ({acceptedOrders.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Pending Assignment Requests
              </CardTitle>
              <CardDescription>Orders waiting for your response</CardDescription>
            </CardHeader>
            <CardContent>
              {assignments.length === 0 ? (
                <p className="text-gray-500 text-center py-6">No pending assignments</p>
              ) : (
                <div className="space-y-4">
                  {assignments.map((assignment) => (
                    <div key={assignment.id} className="border rounded-lg p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <Package className="h-4 w-4" />
                            <span className="font-medium">{assignment.orders?.order_number}</span>
                            <Badge variant="outline">Pending Response</Badge>
                          </div>
                          <div className="text-sm text-gray-600">
                            Assigned at: {new Date(assignment.assigned_at).toLocaleString()}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => updateAssignmentStatus(assignment.id, 'accepted', assignment.order_id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Accept
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => updateAssignmentStatus(assignment.id, 'rejected', assignment.order_id)}
                          >
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </div>
                      </div>
                      
                      {assignment.orders && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded">
                          <div>
                            <div className="font-medium mb-1">Customer Details:</div>
                            <div>{assignment.orders.customer_name}</div>
                            <div className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              <span>{assignment.orders.customer_phone}</span>
                            </div>
                            <div className="flex items-start gap-1">
                              <MapPin className="h-3 w-3 mt-0.5" />
                              <span>{assignment.orders.customer_address}</span>
                            </div>
                          </div>
                          <div>
                            <div className="font-medium mb-1">Order Details:</div>
                            <div className="flex items-center gap-1">
                              <Store className="h-3 w-3" />
                              <span>{assignment.orders.shop_name}</span>
                            </div>
                            <div>Amount: ₹{assignment.orders.total_amount}</div>
                            <div>Payment: {assignment.orders.payment_method}</div>
                            <div>Delivery Charge: ₹{assignment.orders.delivery_charge || 0}</div>
                          </div>
                        </div>
                      )}
                      
                      {assignment.notes && (
                        <div className="text-sm">
                          <span className="font-medium">Special Instructions: </span>
                          {assignment.notes}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="active">
          <div className="space-y-4">
            {acceptedOrders.length === 0 ? (
              <Card>
                <CardContent className="text-center py-6">
                  <p className="text-gray-500">No active orders</p>
                </CardContent>
              </Card>
            ) : (
              acceptedOrders.map((order) => (
                <DeliveryStatusUpdater
                  key={order.id}
                  order={order}
                  onStatusUpdate={handleStatusUpdate}
                />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryBoyDashboard;
