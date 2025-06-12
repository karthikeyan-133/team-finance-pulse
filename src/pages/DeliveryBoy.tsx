
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Truck, Package, MapPin, Phone, Store, User, Clock, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Order, DeliveryBoy, OrderAssignment, ProductDetail } from '@/types/orders';

const DeliveryBoyPage = () => {
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [assignments, setAssignments] = useState<OrderAssignment[]>([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch delivery boys
      const { data: deliveryBoysData, error: deliveryBoysError } = await supabase
        .from('delivery_boys')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (deliveryBoysError) throw deliveryBoysError;

      // Fetch pending orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_status', 'pending')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch pending assignments
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('order_assignments')
        .select(`
          *,
          orders(*),
          delivery_boys(*)
        `)
        .eq('status', 'pending')
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      // Type cast and convert Json to ProductDetail[]
      const typedDeliveryBoys = (deliveryBoysData || []).map(boy => ({
        ...boy,
        vehicle_type: boy.vehicle_type as 'bike' | 'bicycle' | 'car' | 'scooter' | null
      }));

      const typedOrders = (ordersData || []).map(order => ({
        ...order,
        product_details: order.product_details as ProductDetail[]
      }));

      const typedAssignments = (assignmentsData || []).map(assignment => ({
        ...assignment,
        status: assignment.status as 'pending' | 'accepted' | 'rejected',
        orders: assignment.orders ? {
          ...assignment.orders,
          product_details: assignment.orders.product_details as ProductDetail[]
        } : undefined
      }));

      setDeliveryBoys(typedDeliveryBoys);
      setPendingOrders(typedOrders);
      setAssignments(typedAssignments);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
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
      const { error } = await supabase
        .from('order_assignments')
        .insert([{
          order_id: selectedOrder,
          delivery_boy_id: selectedDeliveryBoy,
          notes: assignmentNotes || null
        }]);

      if (error) throw error;

      toast.success('Order assigned successfully!');
      setSelectedDeliveryBoy('');
      setSelectedOrder('');
      setAssignmentNotes('');
      fetchData();
    } catch (error) {
      console.error('Error assigning order:', error);
      toast.error('Failed to assign order');
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
        const assignment = assignments.find(a => a.id === assignmentId);
        if (assignment) {
          const { error: orderError } = await supabase
            .from('orders')
            .update({ 
              order_status: 'assigned',
              delivery_boy_id: assignment.delivery_boy_id,
              assigned_at: new Date().toISOString()
            })
            .eq('id', orderId);

          if (orderError) throw orderError;
        }
      }

      toast.success(`Order ${status} successfully!`);
      fetchData();
    } catch (error) {
      console.error('Error updating assignment:', error);
      toast.error('Failed to update assignment');
    }
  };

  if (isLoading) {
    return <div className="container mx-auto px-4 py-6">Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Delivery Management</h1>
        <p className="text-gray-600">Manage order assignments and delivery requests</p>
      </div>

      {/* Assign New Order */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Truck className="h-5 w-5" />
            Assign Order to Delivery Boy
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Select Delivery Boy</Label>
              <Select value={selectedDeliveryBoy} onValueChange={setSelectedDeliveryBoy}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose delivery boy" />
                </SelectTrigger>
                <SelectContent>
                  {deliveryBoys.map((boy) => (
                    <SelectItem key={boy.id} value={boy.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{boy.name}</span>
                        <span className="text-xs text-gray-500">{boy.phone} - {boy.vehicle_type || 'N/A'}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Select Order</Label>
              <Select value={selectedOrder} onValueChange={setSelectedOrder}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose order" />
                </SelectTrigger>
                <SelectContent>
                  {pendingOrders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{order.order_number}</span>
                        <span className="text-xs text-gray-500">{order.customer_name} - ₹{order.total_amount}</span>
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
          <Button onClick={assignOrder} className="w-full">
            Assign Order
          </Button>
        </CardContent>
      </Card>

      {/* Pending Assignments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Pending Assignment Requests
          </CardTitle>
          <CardDescription>Orders waiting for delivery boy response</CardDescription>
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
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <User className="h-3 w-3" />
                        <span>Assigned to: {assignment.delivery_boys?.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Phone className="h-3 w-3" />
                        <span>{assignment.delivery_boys?.phone}</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => updateAssignmentStatus(assignment.id, 'accepted', assignment.order_id)}
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
                        <div>{assignment.orders.customer_phone}</div>
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
                      </div>
                    </div>
                  )}
                  
                  {assignment.notes && (
                    <div className="text-sm">
                      <span className="font-medium">Notes: </span>
                      {assignment.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Available Delivery Boys */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Available Delivery Boys
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {deliveryBoys.map((boy) => (
              <div key={boy.id} className="border rounded-lg p-4">
                <div className="space-y-2">
                  <div className="font-medium">{boy.name}</div>
                  <div className="text-sm text-gray-600">{boy.phone}</div>
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
    </div>
  );
};

export default DeliveryBoyPage;
