import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogOut, Package, TrendingUp, Clock, CheckCircle, RefreshCw, ChefHat, DollarSign, CreditCard } from 'lucide-react';
import { useShopOwner } from '@/context/ShopOwnerContext';
import { useShopPayments } from '@/hooks/useShopPayments';
import { formatCurrency } from '@/utils/reportUtils';
import OrderPreparationManager from '@/components/orders/OrderPreparationManager';
import ShopPaymentCard from '@/components/payments/ShopPaymentCard';
import DailyPaymentSummary from '@/components/payments/DailyPaymentSummary';

const ShopOwnerDashboard = () => {
  const navigate = useNavigate();
  const {
    shopName,
    setShopName,
    orders,
    todayOrders,
    totalRevenue,
    pendingOrders,
    deliveredOrders,
    isLoading,
    refreshOrders
  } = useShopOwner();

  const {
    payments,
    summaries,
    isLoading: paymentsLoading,
    getTotalPendingAmount,
    getTotalPaidAmount,
    refreshData: refreshPayments
  } = useShopPayments(shopName);

  useEffect(() => {
    console.log('ShopOwnerDashboard - checking authentication');
    
    const savedSession = localStorage.getItem('shop_owner_session');
    console.log('Saved shop session:', savedSession);
    
    if (!savedSession) {
      console.log('No shop session found, redirecting to login');
      navigate('/shop-login');
      return;
    }

    try {
      const shopData = JSON.parse(savedSession);
      console.log('Parsed shop data:', shopData);
      
      if (shopData && shopData.shopName) {
        console.log('Setting shop name from session:', shopData.shopName);
        setShopName(shopData.shopName);
      } else {
        console.log('Invalid shop session data, redirecting to login');
        localStorage.removeItem('shop_owner_session');
        navigate('/shop-login');
      }
    } catch (error) {
      console.error('Error parsing shop session:', error);
      localStorage.removeItem('shop_owner_session');
      navigate('/shop-login');
    }
  }, [navigate, setShopName]);

  const handleLogout = () => {
    localStorage.removeItem('shop_owner_session');
    setShopName('');
    navigate('/shop-login');
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

  const preparingOrders = orders.filter(order => 
    ['pending', 'preparing', 'prepared'].includes(order.order_status)
  );

  const readyAndActiveOrders = orders.filter(order => 
    ['ready', 'assigned', 'picked_up'].includes(order.order_status)
  );

  const pendingPayments = payments.filter(payment => payment.payment_status === 'pending');

  // Show loading state while checking authentication
  if (isLoading || (!shopName && localStorage.getItem('shop_owner_session'))) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading shop dashboard...</p>
        </div>
      </div>
    );
  }

  // Don't render anything if no shop name and no session (will redirect)
  if (!shopName && !localStorage.getItem('shop_owner_session')) {
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
                <h1 className="text-xl font-semibold text-gray-900">{shopName || 'Loading...'}</h1>
                <p className="text-sm text-gray-500">Shop Owner Portal</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button onClick={() => { refreshOrders(); refreshPayments(); }} variant="outline" size="sm" disabled={!shopName}>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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
              <CardTitle className="text-sm font-medium">Preparing</CardTitle>
              <ChefHat className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{preparingOrders.length}</div>
              <p className="text-xs text-muted-foreground">
                Orders to prepare
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
              <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{formatCurrency(getTotalPendingAmount())}</div>
              <p className="text-xs text-muted-foreground">
                {pendingPayments.length} pending payment{pendingPayments.length !== 1 ? 's' : ''}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid Amount</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(getTotalPaidAmount())}</div>
              <p className="text-xs text-muted-foreground">
                Total received
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Card>
          <CardHeader>
            <CardTitle>Dashboard</CardTitle>
            <CardDescription>
              Manage your orders and track payments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!shopName ? (
              <div className="text-center py-4">Setting up shop...</div>
            ) : isLoading ? (
              <div className="text-center py-4">Loading data...</div>
            ) : (
              <Tabs defaultValue="orders" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="orders">
                    Orders ({preparingOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="active">
                    Active ({readyAndActiveOrders.length})
                  </TabsTrigger>
                  <TabsTrigger value="payments">
                    Payments ({pendingPayments.length})
                  </TabsTrigger>
                  <TabsTrigger value="daily-summary">
                    Daily Summary
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="orders" className="space-y-4">
                  {preparingOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No orders to prepare at the moment
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {preparingOrders.map((order) => (
                        <OrderPreparationManager 
                          key={order.id} 
                          order={order} 
                          onStatusUpdate={refreshOrders}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="active" className="space-y-4">
                  {readyAndActiveOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No active orders for delivery
                    </div>
                  ) : (
                    readyAndActiveOrders.map((order) => (
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

                        {order.delivery_boy && (
                          <div className="bg-gray-50 p-3 rounded">
                            <p className="text-sm"><strong>Delivery Boy:</strong> {order.delivery_boy.name}</p>
                            <p className="text-sm"><strong>Phone:</strong> {order.delivery_boy.phone}</p>
                          </div>
                        )}

                        <div className="text-xs text-gray-500">
                          Ready since: {order.ready_at ? new Date(order.ready_at).toLocaleString() : 'N/A'}
                        </div>
                      </div>
                    ))
                  )}
                </TabsContent>

                <TabsContent value="payments" className="space-y-4">
                  {paymentsLoading ? (
                    <div className="text-center py-8">Loading payment data...</div>
                  ) : pendingPayments.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No pending payments
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {pendingPayments.map((payment) => (
                        <ShopPaymentCard
                          key={payment.id}
                          payment={payment}
                          onMarkAsPaid={() => {}}
                          onUpdateAmount={() => {}}
                          isAdmin={false}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="daily-summary" className="space-y-4">
                  {paymentsLoading ? (
                    <div className="text-center py-8">Loading payment summary...</div>
                  ) : (
                    <DailyPaymentSummary summaries={summaries} shopName={shopName} />
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ShopOwnerDashboard;
