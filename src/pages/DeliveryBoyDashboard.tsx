
import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, MapPin, Phone, Store, User, Clock, CheckCircle, XCircle, LogOut, Truck, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { OrderAssignment, ProductDetail, Order } from '@/types/orders';
import DeliveryStatusUpdater from '@/components/orders/DeliveryStatusUpdater';
import OrderStatusTracker from '@/components/orders/OrderStatusTracker';
import { useRealTimeOrders } from '@/hooks/useRealTimeOrders';

const DeliveryBoyDashboard = () => {
  const [deliveryBoy, setDeliveryBoy] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Use real-time hook for orders and assignments
  const { orders: acceptedOrders, assignments, loading: ordersLoading, refetch } = useRealTimeOrders(deliveryBoy?.id);

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
      setIsLoading(false);
    } catch (error) {
      console.error('Error parsing delivery boy session:', error);
      localStorage.removeItem('delivery_boy_session');
      setIsLoading(false);
    }
  }, []);

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
      // Use refetch instead of manual fetch functions
      refetch();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  const handleStatusUpdate = () => {
    // Use refetch instead of manual fetch function
    refetch();
  };

  const handleLogout = () => {
    localStorage.removeItem('delivery_boy_session');
    setDeliveryBoy(null);
    toast.info('Logged out successfully');
  };

  const handleRefresh = () => {
    if (deliveryBoy) {
      refetch();
    }
  };

  console.log('Dashboard render - deliveryBoy:', deliveryBoy, 'isLoading:', isLoading, 'ordersLoading:', ordersLoading);

  if (!deliveryBoy && !isLoading) {
    console.log('No delivery boy and not loading, redirecting to login');
    return <Navigate to="/delivery-boy-login" replace />;
  }

  if (isLoading || (deliveryBoy && ordersLoading)) {
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
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleLogout} className="flex items-center gap-2">
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
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
