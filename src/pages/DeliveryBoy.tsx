import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Truck, Package, User, Plus, AlertTriangle } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useRealTimeDeliveryBoys } from '@/hooks/useRealTimeDeliveryBoys';
import { DeliveryBoyForm } from '@/components/delivery/DeliveryBoyForm';
import { DeliveryBoyCard } from '@/components/delivery/DeliveryBoyCard';
import { Order, ProductDetail } from '@/types/orders';

const DeliveryBoyPage = () => {
  const { deliveryBoys, loading: deliveryBoysLoading, refetch } = useRealTimeDeliveryBoys();
  const [pendingOrders, setPendingOrders] = useState<Order[]>([]);
  const [selectedDeliveryBoy, setSelectedDeliveryBoy] = useState<string>('');
  const [selectedOrder, setSelectedOrder] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [isAssigning, setIsAssigning] = useState(false);
  const [editingDeliveryBoy, setEditingDeliveryBoy] = useState<any>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const fetchPendingOrders = async () => {
    try {
      setOrdersLoading(true);
      console.log('[DeliveryBoy] Fetching pending orders...');
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('order_status', 'pending')
        .is('delivery_boy_id', null)
        .order('created_at', { ascending: false });

      if (ordersError) {
        console.error('[DeliveryBoy] Error fetching orders:', ordersError);
        throw ordersError;
      }

      const typedOrders = (ordersData || []).map(order => ({
        ...order,
        product_details: (order.product_details as unknown) as ProductDetail[],
        payment_status: order.payment_status as 'pending' | 'paid',
        payment_method: order.payment_method as 'cash' | 'upi' | 'card' | 'other',
        order_status: order.order_status as 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled'
      }));

      setPendingOrders(typedOrders);
      console.log('[DeliveryBoy] Fetched pending orders:', typedOrders.length);
    } catch (error: any) {
      console.error('[DeliveryBoy] Error fetching orders:', error);
      toast.error('Failed to load orders: ' + error.message);
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingOrders();

    // Set up real-time subscription for orders
    const channel = supabase
      .channel('orders-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          console.log('[DeliveryBoy] Orders real-time update:', payload);
          fetchPendingOrders();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const assignOrder = async () => {
    if (!selectedDeliveryBoy || !selectedOrder) {
      toast.error('Please select both delivery boy and order');
      return;
    }

    try {
      setIsAssigning(true);
      console.log('[DeliveryBoy] Assigning order:', { 
        orderId: selectedOrder, 
        deliveryBoyId: selectedDeliveryBoy 
      });

      // Check if order is still available
      const { data: orderCheck, error: checkError } = await supabase
        .from('orders')
        .select('order_status, delivery_boy_id, order_number')
        .eq('id', selectedOrder)
        .single();

      if (checkError) {
        console.error('[DeliveryBoy] Error checking order:', checkError);
        throw checkError;
      }

      if (orderCheck.order_status !== 'pending' || orderCheck.delivery_boy_id) {
        toast.error(`Order ${orderCheck.order_number} is no longer available for assignment`);
        fetchPendingOrders();
        return;
      }

      // Update order
      const { error: orderUpdateError } = await supabase
        .from('orders')
        .update({ 
          order_status: 'assigned',
          delivery_boy_id: selectedDeliveryBoy,
          assigned_at: new Date().toISOString()
        })
        .eq('id', selectedOrder);

      if (orderUpdateError) {
        console.error('[DeliveryBoy] Error updating order:', orderUpdateError);
        throw orderUpdateError;
      }

      // Create assignment record
      const { error: assignmentError } = await supabase
        .from('order_assignments')
        .insert([{
          order_id: selectedOrder,
          delivery_boy_id: selectedDeliveryBoy,
          notes: assignmentNotes || null,
          status: 'pending'
        }]);

      if (assignmentError) {
        console.error('[DeliveryBoy] Error creating assignment:', assignmentError);
        
        // Rollback order update
        await supabase
          .from('orders')
          .update({ 
            order_status: 'pending',
            delivery_boy_id: null,
            assigned_at: null
          })
          .eq('id', selectedOrder);
        
        throw assignmentError;
      }

      console.log('[DeliveryBoy] Order assigned successfully');
      toast.success('Order assigned successfully!');
      
      // Reset form
      setSelectedDeliveryBoy('');
      setSelectedOrder('');
      setAssignmentNotes('');
      
      // Refresh data
      fetchPendingOrders();
    } catch (error: any) {
      console.error('[DeliveryBoy] Error assigning order:', error);
      toast.error('Failed to assign order: ' + error.message);
    } finally {
      setIsAssigning(false);
    }
  };

  const handleFormSuccess = () => {
    setIsAddDialogOpen(false);
    setEditingDeliveryBoy(null);
    setTimeout(() => {
      refetch();
    }, 300);
  };

  if (deliveryBoysLoading || ordersLoading) {
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
        <p className="text-sm text-gray-500 mt-1">
          Delivery Boys: {deliveryBoys.length} | Pending Orders: {pendingOrders.length}
        </p>
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
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <div className="flex items-center gap-2 text-amber-800">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        Each order can only be assigned to one delivery boy at a time
                      </span>
                    </div>
                  </div>

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
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Delivery Boys ({deliveryBoys.length})
                  </CardTitle>
                  <CardDescription>
                    Manage your delivery team members
                  </CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Delivery Boy
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add New Delivery Boy</DialogTitle>
                      <DialogDescription>
                        Register a new delivery boy to your team
                      </DialogDescription>
                    </DialogHeader>
                    <DeliveryBoyForm 
                      onSuccess={handleFormSuccess}
                      onCancel={() => setIsAddDialogOpen(false)}
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {deliveryBoys.map((boy) => (
                  <DeliveryBoyCard 
                    key={boy.id} 
                    deliveryBoy={boy} 
                    onEdit={setEditingDeliveryBoy}
                  />
                ))}
              </div>
              {deliveryBoys.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <User className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No delivery boys found</p>
                  <p className="text-sm">Add your first delivery boy to get started</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="add-delivery-boy" className="space-y-4">
          <DeliveryBoyForm onSuccess={handleFormSuccess} />
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      {editingDeliveryBoy && (
        <Dialog open={!!editingDeliveryBoy} onOpenChange={() => setEditingDeliveryBoy(null)}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Delivery Boy</DialogTitle>
              <DialogDescription>
                Update delivery boy information
              </DialogDescription>
            </DialogHeader>
            <DeliveryBoyForm 
              deliveryBoy={editingDeliveryBoy}
              onSuccess={handleFormSuccess}
              onCancel={() => setEditingDeliveryBoy(null)}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default DeliveryBoyPage;
