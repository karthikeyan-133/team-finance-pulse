
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LogOut, Package, TrendingUp, Clock, CheckCircle, RefreshCw } from 'lucide-react';
import { useShopOwner } from '@/context/ShopOwnerContext';
import { formatCurrency } from '@/utils/reportUtils';

const ShopOwnerDashboard = () => {
  const navigate = useNavigate();
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

  useEffect(() => {
    if (!shopName) {
      navigate('/shop-login');
    }
  }, [shopName, navigate]);

  const handleLogout = () => {
    navigate('/shop-login');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'assigned': return 'bg-blue-100 text-blue-800';
      case 'picked_up': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!shopName) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Package className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-semibold text-gray-900">{shopName}</h1>
                <p className="text-sm text-gray-500">Shop Owner Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={refreshOrders} variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-1" />
                Refresh
              </Button>
              <Button onClick={handleLogout} variant="outline" size="sm">
                <LogOut className="w-4 h-4 mr-1" />
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
              <p className="text-xs text-muted-foreground">
                From delivered orders
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-muted-foreground">
                Awaiting delivery
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Delivered Orders</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{deliveredOrders}</div>
              <p className="text-xs text-muted-foreground">
                Successfully completed
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Orders List */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              All orders for your shop
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">Loading orders...</div>
            ) : orders.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No orders found for this shop
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium">Order #{order.order_number}</h3>
                        <p className="text-sm text-gray-600">{order.customer_name}</p>
                        <p className="text-sm text-gray-500">{order.customer_phone}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(order.order_status)}>
                          {order.order_status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        <p className="text-lg font-semibold mt-1">
                          {formatCurrency(order.total_amount)}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p><strong>Address:</strong> {order.customer_address}</p>
                        <p><strong>Payment:</strong> {order.payment_method} - {order.payment_status}</p>
                      </div>
                      <div>
                        <p><strong>Delivery Charge:</strong> {formatCurrency(order.delivery_charge || 0)}</p>
                        <p><strong>Commission:</strong> {formatCurrency(order.commission || 0)}</p>
                      </div>
                    </div>

                    {order.delivery_boys && (
                      <div className="bg-gray-50 p-3 rounded">
                        <p className="text-sm"><strong>Delivery Boy:</strong> {order.delivery_boys.name}</p>
                        <p className="text-sm"><strong>Phone:</strong> {order.delivery_boys.phone}</p>
                      </div>
                    )}

                    {order.special_instructions && (
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-sm"><strong>Special Instructions:</strong> {order.special_instructions}</p>
                      </div>
                    )}

                    <div className="text-xs text-gray-500">
                      Created: {new Date(order.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShopOwnerDashboard;
