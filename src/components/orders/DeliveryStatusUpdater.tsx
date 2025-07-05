
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Package, Truck, CheckCircle, MapPin, Phone, ChefHat, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Order } from '@/types/orders';

interface DeliveryStatusUpdaterProps {
  order: Order;
  onStatusUpdate: () => void;
}

const DeliveryStatusUpdater: React.FC<DeliveryStatusUpdaterProps> = ({ order, onStatusUpdate }) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [notes, setNotes] = useState('');

  const updateOrderStatus = async (newStatus: 'picked_up' | 'delivered') => {
    setIsUpdating(true);
    try {
      const updateData: any = {
        order_status: newStatus,
        updated_at: new Date().toISOString()
      };

      if (newStatus === 'picked_up') {
        updateData.picked_up_at = new Date().toISOString();
      } else if (newStatus === 'delivered') {
        updateData.delivered_at = new Date().toISOString();
      }

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', order.id);

      if (error) throw error;

      toast.success(`Order marked as ${newStatus.replace('_', ' ')}!`);
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
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPreparationStatusInfo = () => {
    switch (order.order_status) {
      case 'pending':
        return { icon: Clock, text: 'Order received, waiting to be prepared', color: 'text-yellow-600' };
      case 'preparing':
        return { icon: ChefHat, text: 'Order is being prepared', color: 'text-orange-600' };
      case 'prepared':
        return { icon: Clock, text: 'Order prepared, waiting to be ready', color: 'text-blue-600' };
      case 'ready':
        return { icon: CheckCircle, text: 'Order ready for pickup', color: 'text-green-600' };
      default:
        return null;
    }
  };

  const canPickUp = order.order_status === 'assigned';
  const canDeliver = order.order_status === 'picked_up';
  const isDelivered = order.order_status === 'delivered';
  const preparationInfo = getPreparationStatusInfo();

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
        {/* Preparation Status */}
        {preparationInfo && (
          <div className={`p-3 rounded-lg bg-gray-50 border-l-4 border-gray-300`}>
            <div className="flex items-center gap-2">
              <preparationInfo.icon className={`h-5 w-5 ${preparationInfo.color}`} />
              <span className={`font-medium ${preparationInfo.color}`}>
                {preparationInfo.text}
              </span>
            </div>
            {order.prepared_at && (
              <p className="text-sm text-gray-600 mt-1">
                Prepared at: {new Date(order.prepared_at).toLocaleString()}
              </p>
            )}
            {order.ready_at && (
              <p className="text-sm text-gray-600 mt-1">
                Ready since: {new Date(order.ready_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        {/* Customer & Order Details */}
        <div className="space-y-2 text-sm bg-gray-50 p-3 rounded">
          <div className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            <span className="font-medium">{order.customer_name}</span>
          </div>
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            <span>{order.customer_phone}</span>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 mt-0.5" />
            <span>{order.customer_address}</span>
          </div>
          <div className="pt-2 border-t">
            <p><strong>Shop:</strong> {order.shop_name}</p>
            <p><strong>Amount:</strong> ₹{order.total_amount}</p>
            <p><strong>Delivery Charge:</strong> ₹{order.delivery_charge || 0}</p>
          </div>
        </div>

        {/* Product Details */}
        {order.product_details && order.product_details.length > 0 && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm">Items:</h4>
            <div className="space-y-1 text-sm">
              {order.product_details.map((item, index) => (
                <div key={index} className="flex justify-between">
                  <span>{item.name} x {item.quantity}</span>
                  <span>₹{item.price}</span>
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

        {/* Action Buttons */}
        {!isDelivered && (
          <div className="space-y-3">
            {canPickUp && (
              <Button
                onClick={() => updateOrderStatus('picked_up')}
                disabled={isUpdating}
                className="w-full bg-orange-600 hover:bg-orange-700"
              >
                <Truck className="h-4 w-4 mr-2" />
                Mark as Picked Up
              </Button>
            )}
            
            {canDeliver && (
              <div className="space-y-2">
                <Textarea
                  placeholder="Add delivery notes (optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                />
                <Button
                  onClick={() => updateOrderStatus('delivered')}
                  disabled={isUpdating}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Delivered
                </Button>
              </div>
            )}
          </div>
        )}

        {isDelivered && (
          <div className="text-center p-4 bg-green-50 rounded">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-green-700 font-medium">Order Delivered Successfully!</p>
            <p className="text-sm text-green-600 mt-1">
              Delivered at: {new Date(order.delivered_at!).toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DeliveryStatusUpdater;
