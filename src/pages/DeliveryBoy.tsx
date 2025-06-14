import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Package, MapPin, Phone, Store, User, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Order, DeliveryBoy, ProductDetail } from '@/types/orders';
import AddDeliveryBoyForm from '@/components/forms/AddDeliveryBoyForm';

const DeliveryBoyPage = () => {
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching delivery boys and orders...');
      
      // Fetch delivery boys
      const { data: deliveryBoysData, error: deliveryBoysError } = await supabase
        .from('delivery_boys')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (deliveryBoysError) {
        console.error('Error fetching delivery boys:', deliveryBoysError);
        throw deliveryBoysError;
      }

      // Fetch pending orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_status', 'pending')
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('Error fetching orders:', ordersError);
        throw ordersError;
      }

      console.log('Fetched data:', { deliveryBoysData, ordersData });

      // Type cast and convert Json to ProductDetail[]
      const typedDeliveryBoys = (deliveryBoysData || []).map(boy => ({
        ...boy,
        vehicle_type: boy.vehicle_type as 'bike' | 'bicycle' | 'car' | 'scooter' | null
      }));

      const typedOrders = (ordersData || []).map(order => ({
        ...order,
        product_details: (order.product_details as unknown) as ProductDetail[],
        payment_status: order.payment_status as 'pending' | 'paid',
        payment_method: order.payment_method as 'cash' | 'upi' | 'card' | 'other',
        order_status: order.order_status as 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'
      }));

      setDeliveryBoys(typedDeliveryBoys);
      setPendingOrders(typedOrders);
      
      console.log('Set state with:', { 
        deliveryBoysCount: typedDeliveryBoys.length, 
        ordersCount: typedOrders.length 
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data: ' + (error as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  const assignOrder = async () => {
    if (!selectedDeliveryBoy || !selectedOrder) {
      toast.error('Please select both delivery boy and order');
      return;
    }

    try {
      setIsAssigning(true);
      console.log('Assigning order:', { 
        orderId: selectedOrder, 
        deliveryBoyId: selectedDeliveryBoy 
      });

      // Start a transaction to update both tables
      const { error: assignmentError } = await supabase
        .from('order_assignments')
        .insert([{
          order_id: selectedOrder,
          delivery_boy_id: selectedDeliveryBoy,
          notes: assignmentNotes || null,
          status: 'pending'
        }]);

      if (assignmentError) {
        console.error('Error creating assignment:', assignmentError);
        throw assignmentError;
      }

      // Update the order status to 'assigned' and set delivery_boy_id
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ 
          order_status: 'assigned',
          delivery_boy_id: selectedDeliveryBoy,
          assigned_at: new Date().toISOString()
        })
        .eq('id', selectedOrder);

      if (orderUpdateError) {
        console.error('Error updating order:', orderUpdateError);
        throw orderUpdateError;
      }

      console.log('Order assigned successfully');
      toast.success('Order assigned successfully! Delivery boy will be notified.');
      
      // Reset form
      setSelectedDeliveryBoy('');
      setSelectedOrder('');
      setAssignmentNotes('');
      
      // Refresh data
      await fetchData();
    } catch (error) {
      console.error('Error assigning order:', error);
      toast.error('Failed to assign order: ' + (error as Error).message);
    } finally {
      setIsAssigning(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Delivery Management</h1>
        <p className="text-gray-600">Manage delivery boys and assign orders</p>
        <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Note:</strong> Delivery boys can access their assignments at{' '}
            <a href="/delivery-boy-login" className="font-medium underline">
              /delivery-boy-login
            </a>
          </p>
        </div>
      </div>

      <Tabs defaultValue="assignments" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="assignments">Order Assignments</TabsTrigger>
          <TabsTrigger value="delivery-boys">Delivery Boys</TabsTrigger>
          <TabsTrigger value="add-delivery-boy">Add Delivery Boy</TabsTrigger>
        </TabsList>

        <TabsContent value="assignments" className="space-y-4">
          {/* Assign New Order */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Assign Order to Delivery Boy
              </CardTitle>
              <CardDescription>
                Select a delivery boy and order to create an assignment
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {deliveryBoys.length === 0 && pendingOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No delivery boys or pending orders available</p>
                  <p className="text-sm">Add delivery boys and create orders to start assigning</p>
                </div>
              ) : deliveryBoys.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No delivery boys available</p>
                  <p className="text-sm">Add delivery boys first before assigning orders</p>
                </div>
              ) : pendingOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No pending orders available</p>
                  <p className="text-sm">All orders have been assigned or completed</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label>Select Delivery Boy ({deliveryBoys.length} available)</Label>
                      <Select value={selectedDeliveryBoy} onValueChange={setSelectedDeliveryBoy}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose delivery boy" />
                        </SelectTrigger>
                        <SelectContent>
                          {deliveryBoys.map((boy) => (
                            <SelectItem key={boy.id} value={boy.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{boy.name}</span>
                                <span className="text-xs text-gray-500">
                                  {boy.phone} - {boy.vehicle_type || 'N/A'}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Select Order ({pendingOrders.length} pending)</Label>
                      <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose order" />
                        </SelectTrigger>
                        <SelectContent>
                          {pendingOrders.map((order) => (
                            <SelectItem key={order.id} value={order.id}>
                              <div className="flex flex-col">
                                <span className="font-medium">{order.order_number}</span>
                                <span className="text-xs text-gray-500">
                                  {order.customer_name} - ₹{order.total_amount}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Assignment Notes (Optional)</Label>
                    <Textarea
                      value={assignmentNotes}
                      onChange={(e) => setAssignmentNotes(e.target.value)}
                      placeholder="Any special instructions for the delivery boy..."
                    />
                  </div>
                  <Button 
                    onClick={assignOrder} 
                    className="w-full"
                    disabled={isAssigning || !selectedDeliveryBoy || !selectedOrder}
                  >
                    {isAssigning ? 'Assigning Order...' : 'Assign Order'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="delivery-boys" className="space-y-4">
          {/* Available Delivery Boys */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Available Delivery Boys
              </CardTitle>
              <CardDescription>
                Manage your delivery team members
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deliveryBoys.map((boy) => (
                  <div key={boy.id} className="border rounded-lg p-4">
                    <div className="space-y-2">
                      <div className="font-medium">{boy.name}</div>
                      <div className="text-sm text-gray-600">{boy.phone}</div>
                      {boy.email && (
                        <div className="text-sm text-gray-600">{boy.email}</div>
                      )}
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{boy.vehicle_type || 'N/A'}</Badge>
                        {boy.vehicle_number && (
                          <span className="text-xs text-gray-500">{boy.vehicle_number}</span>
                        )}
                      </div>
                      {boy.current_location && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <MapPin className="h-3 w-3" />
                          <span>{boy.current_location}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-delivery-boy" className="space-y-4">
          <AddDeliveryBoyForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeliveryBoyPage;
