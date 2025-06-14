
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChefHat, Clock, CheckCircle2, Package } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';
import { Order } from '@/types/orders';
import { formatCurrency } from '@/utils/reportUtils';

interface OrderPreparationManagerProps {
  order: Order;
  onStatusUpdate: () => void;
}

const OrderPreparationManager: React.FC<OrderPreparationManagerProps> = ({ order, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateOrderStatus = async (newStatus: 'preparing' | 'prepared' | 'ready') => {
    setIsUpdating(true);
    try {
      const updateData: any = {
        order_status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'prepared') {
        updateData.prepared_at = new Date().toISOString();
      } else if (newStatus === 'ready') {
        updateData.ready_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;

      toast.success(`Order marked as ${newStatus}!`);
      onStatusUpdate();
    } catch (error) {
      console.error('Error updating order status:', error);
      toast.error('Failed to update order status');
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-orange-100 text-orange-800';
      case 'prepared': return 'bg-blue-100 text-blue-800';
      case 'ready': return 'bg-green-100 text-green-800';
      case 'assigned': return 'bg-purple-100 text-purple-800';
      case 'picked_up': return 'bg-indigo-100 text-indigo-800';
      case 'delivered': return 'bg-emerald-100 text-emerald-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const canStartPreparing = order.order_status === 'pending';
  const canMarkPrepared = order.order_status === 'preparing';
  const canMarkReady = order.order_status === 'prepared';
  const isReadyOrBeyond = ['ready', 'assigned', 'picked_up', 'delivered'].includes(order.order_status);

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
          <Badge className={getStatusColor(order.order_status)}>
            {order.order_status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Customer & Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm bg-gray-50 p-3 rounded">
          <div>
            <p><strong>Customer:</strong> {order.customer_name}</p>
            <p><strong>Phone:</strong> {order.customer_phone}</p>
            <p><strong>Address:</strong> {order.customer_address}</p>
          </div>
          <div>
            <p><strong>Total Amount:</strong> {formatCurrency(order.total_amount)}</p>
            <p><strong>Payment:</strong> {order.payment_method} - {order.payment_status}</p>
            <p><strong>Created:</strong> {new Date(order.created_at).toLocaleString()}</p>
          </div>
        </div>

        {/* Product Details */}
        {order.product_details && order.product_details.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm flex items-center gap-2">
              <Package className="h-4 w-4" />
              Items to Prepare:
            </h4>
            <div className="space-y-1 text-sm bg-blue-50 p-3 rounded">
              {order.product_details.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatCurrency(item.price)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Special Instructions */}
        {order.special_instructions && (
          <div className="text-sm">
            <strong>Special Instructions:</strong>
            <p className="mt-1 p-2 bg-yellow-50 rounded">{order.special_instructions}</p>
          </div>
        )}

        {/* Preparation Timeline */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm">Preparation Timeline:</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs">
            {order.prepared_at && (
              <div className="bg-blue-50 p-2 rounded">
                <p className="font-medium">Prepared At:</p>
                <p>{new Date(order.prepared_at).toLocaleString()}</p>
              </div>
            )}
            {order.ready_at && (
              <div className="bg-green-50 p-2 rounded">
                <p className="font-medium">Ready At:</p>
                <p>{new Date(order.ready_at).toLocaleString()}</p>
              </div>
            )}
            {order.assigned_at && (
              <div className="bg-purple-50 p-2 rounded">
                <p className="font-medium">Assigned At:</p>
                <p>{new Date(order.assigned_at).toLocaleString()}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {!isReadyOrBeyond && (
          <div className="space-y-3">
            {canStartPreparing && (
              <Button
                onClick={() => updateOrderStatus('preparing')}
                disabled={isUpdating}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <ChefHat className="h-4 w-4 mr-2" />
                Start Preparing
              </Button>
            )}
            
            {canMarkPrepared && (
              <Button
                onClick={() => updateOrderStatus('prepared')}
                disabled={isUpdating}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Clock className="h-4 w-4 mr-2" />
                Mark as Prepared
              </Button>
            )}

            {canMarkReady && (
              <Button
                onClick={() => updateOrderStatus('ready')}
                disabled={isUpdating}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Mark as Ready for Pickup
              </Button>
            )}
          </div>
        )}

        {isReadyOrBeyond && (
          <div className="text-center p-4 bg-green-50 rounded">
            <CheckCircle2 className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-medium">Order is Ready for Delivery!</p>
            {order.ready_at && (
              <p className="text-sm text-green-600 mt-1">
                Ready since: {new Date(order.ready_at).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default OrderPreparationManager;
