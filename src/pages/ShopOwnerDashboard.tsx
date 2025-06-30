import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Package, DollarSign, Clock, CheckCircle, Plus } from 'lucide-react';
import { useShopOwner } from '@/context/ShopOwnerContext';
import { formatCurrency } from '@/utils/reportUtils';
import ShopOwnerOrderForm from '@/components/forms/ShopOwnerOrderForm';
import OrderPreparationManager from '@/components/orders/OrderPreparationManager';

const ShopOwnerDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const { 
    shopName, 
    orders, 
    todayOrders, 
    totalRevenue, 
    pendingOrders, 
    deliveredOrders, 
    isLoading, 
    refreshOrders 
  } = useShopOwner();

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

  const handleOrderCreated = () => {
    setActiveTab('orders');
    refreshOrders();
  };

  // Filter orders that need preparation management
  const ordersNeedingPreparation = orders.filter(order => 
    ['pending', 'preparing', 'prepared'].includes(order.order_status)
  );

  if (!shopName) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Shop Owner Dashboard</h1>
          <p className="text-gray-600">Please log in to access your shop dashboard.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Welcome, {shopName}</h1>
          <p className="text-gray-600">Manage your shop orders and track performance</p>
        </div>
        <Button onClick={refreshOrders} disabled={isLoading}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayOrders.length}</div>
            <p className="text-xs text-muted-foreground">
              Orders received today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting processing
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{deliveredOrders}</div>
            <p className="text-xs text-muted-foreground">
              Successfully completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">
              From delivered orders
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="preparation">
            Preparation ({ordersNeedingPreparation.length})
          </TabsTrigger>
          <TabsTrigger value="create-order">
            <Plus className="w-4 h-4 mr-2" />
            Create Order
          </TabsTrigger>
          <TabsTrigger value="orders">Orders ({orders.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>
                Your latest order activity
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No orders found</p>
                  <p className="text-sm">Start by creating your first order</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.slice(0, 5).map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <div className="font-medium">{order.order_number}</div>
                        <div className="text-sm text-gray-600">{order.customer_name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">{formatCurrency(order.total_amount)}</div>
                        <Badge className={getStatusColor(order.order_status)}>
                          {order.order_status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preparation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Preparation</CardTitle>
              <CardDescription>
                Manage order preparation and mark items as ready
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading orders...</div>
              ) : ordersNeedingPreparation.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No orders need preparation</p>
                  <p className="text-sm">All orders are ready or completed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ordersNeedingPreparation.map((order) => (
                    <OrderPreparationManager
                      key={order.id}
                      order={order}
                      onStatusUpdate={refreshOrders}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create-order" className="space-y-4">
          <ShopOwnerOrderForm onSuccess={handleOrderCreated} />
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Orders</CardTitle>
              <CardDescription>
                Complete list of your orders
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>No orders found</p>
                  <p className="text-sm">Start by creating your first order</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <Card key={order.id}>
                      <CardContent className="pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <div className="font-medium text-lg">{order.order_number}</div>
                            <div className="text-sm text-gray-600">
                              Created: {new Date(order.created_at).toLocaleString()}
                            </div>
                          </div>
                          <Badge className={getStatusColor(order.order_status)}>
                            {order.order_status}
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <h4 className="font-medium mb-2">Customer Details</h4>
                            <p className="text-sm">{order.customer_name}</p>
                            <p className="text-sm text-gray-600">{order.customer_phone}</p>
                            <p className="text-sm text-gray-600">{order.customer_address}</p>
                          </div>
                          
                          <div>
                            <h4 className="font-medium mb-2">Order Details</h4>
                            <p className="text-sm">Amount: {formatCurrency(order.total_amount)}</p>
                            <p className="text-sm">Delivery: {formatCurrency(order.delivery_charge)}</p>
                            <p className="text-sm">Payment: {order.payment_method}</p>
                          </div>
                        </div>

                        {order.product_details && order.product_details.length > 0 && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Products</h4>
                            <div className="space-y-2">
                              {order.product_details.map((product, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                  <span>{product.name} x {product.quantity}</span>
                                  <span>{formatCurrency(product.price * product.quantity)}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {order.special_instructions && (
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Special Instructions</h4>
                            <p className="text-sm text-gray-600">{order.special_instructions}</p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ShopOwnerDashboard;
