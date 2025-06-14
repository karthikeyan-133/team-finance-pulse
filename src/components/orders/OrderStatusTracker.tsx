
import React from 'react';
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Clock, Package, Truck, MapPin, Calendar } from 'lucide-react';

interface OrderStatusTrackerProps {
  order: {
    id: string;
    order_number: string;
    order_status: 'pending' | 'assigned' | 'picked_up' | 'delivered' | 'cancelled';
    assigned_at?: string;
    picked_up_at?: string;
    delivered_at?: string;
    customer_name: string;
    customer_address: string;
    shop_name: string;
    total_amount: number;
    deliveryBoyName?: string;
  };
  showTitle?: boolean;
}

const OrderStatusTracker: React.FC<OrderStatusTrackerProps> = ({ order, showTitle = true }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-orange-100 text-orange-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    const iconClass = isCompleted ? 'text-green-600' : 'text-gray-400';
    
    switch (status) {
      case 'assigned': return <Package className={`h-4 w-4 ${iconClass}`} />;
      case 'picked_up': return <Truck className={`h-4 w-4 ${iconClass}`} />;
      case 'delivered': return <CheckCircle className={`h-4 w-4 ${iconClass}`} />;
      default: return <Clock className={`h-4 w-4 ${iconClass}`} />;
    }
  };

  const formatDateTime = (dateTimeStr?: string) => {
    if (!dateTimeStr) return 'Pending';
    
    try {
      const date = new Date(dateTimeStr);
      return date.toLocaleString();
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
  };

  const statusSteps = [
    { status: 'assigned', label: 'Order Assigned', timestamp: order.assigned_at },
    { status: 'picked_up', label: 'Picked Up', timestamp: order.picked_up_at },
    { status: 'delivered', label: 'Delivered', timestamp: order.delivered_at }
  ];

  const getCurrentStepIndex = () => {
    switch (order.order_status) {
      case 'assigned': return 0;
      case 'picked_up': return 1;
      case 'delivered': return 2;
      default: return -1;
    }
  };

  const currentStepIndex = getCurrentStepIndex();
  const isCancelled = order.order_status === 'cancelled';

  return (
    <Card>
      {showTitle && (
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Order #{order.order_number}</CardTitle>
            <Badge className={getStatusColor(order.order_status)}>
              {order.order_status.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
      )}
      <CardContent className="space-y-4">
        {/* Order Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <p><strong>Customer:</strong> {order.customer_name}</p>
            <p className="flex items-start gap-1">
              <MapPin className="h-3 w-3 mt-0.5" />
              <span>{order.customer_address}</span>
            </p>
          </div>
          <div>
            <p><strong>Shop:</strong> {order.shop_name}</p>
            <p><strong>Amount:</strong> ₹{order.total_amount}</p>
            {order.deliveryBoyName && order.deliveryBoyName !== 'Not Assigned' && (
              <p><strong>Delivery Agent:</strong> {order.deliveryBoyName}</p>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="space-y-3">
          <h4 className="font-medium text-sm">Order Progress</h4>
          
          {isCancelled ? (
            <div className="bg-red-50 p-3 rounded text-red-700 text-sm">
              This order has been cancelled
            </div>
          ) : (
            statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;
              
              return (
                <div key={step.status} className="flex items-center gap-3">
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    isCompleted 
                      ? 'border-green-500 bg-green-50' 
                      : isCurrent 
                      ? 'border-blue-500 bg-blue-50' 
                      : 'border-gray-300 bg-gray-50'
                  }`}>
                    {getStatusIcon(step.status, isCompleted)}
                  </div>
                  <div className="flex-1">
                    <p className={`text-sm font-medium ${isCompleted ? 'text-green-700' : 'text-gray-600'}`}>
                      {step.label}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="h-3 w-3" />
                      {step.timestamp ? (
                        <span>{formatDateTime(step.timestamp)}</span>
                      ) : (
                        <span>Not yet</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default OrderStatusTracker;
