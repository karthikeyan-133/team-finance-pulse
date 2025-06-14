
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Package,
  Truck,
  User,
  Clock,
  CheckCircle,
  MapPin,
  Phone,
  IndianRupee,
  Calendar,
  Users,
  AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Order, DeliveryBoy, OrderAssignment } from '@/types/orders';
import { useSupabaseTransactions } from '@/hooks/useSupabaseTransactions';
import { useSupabaseExpenses } from '@/hooks/useSupabaseExpenses';
import { useDashboardStats } from '@/hooks/useDashboardStats';

const FinancialAnalyticsDashboard = () => {
  const { user } = useAuth();
  const { transactions } = useSupabaseTransactions();
  const { expenses } = useSupabaseExpenses();
  const { dashboardStats } = useDashboardStats(transactions, expenses);
  
  const [orders, setOrders] = useState<Order[]>([]);
  const [deliveryBoys, setDeliveryBoys] = useState<DeliveryBoy[]>([]);
  const [assignments, setAssignments] = useState<OrderAssignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Redirect non-admin users
  if (user?.role !== 'admin') {
    return <Navigate to="/delivery-update" replace />;
  }

  useEffect(() => {
    fetchDeliveryData();
  }, []);

  const fetchDeliveryData = async () => {
    try {
      setIsLoading(true);
      
      // Fetch orders with delivery boy details
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          delivery_boys(id, name, phone, vehicle_type)
        `)
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      // Fetch delivery boys
      const { data: deliveryBoysData, error: deliveryBoysError } = await supabase
        .from('delivery_boys')
        .select('*')
        .eq('is_active', true)
        .order('name');

      if (deliveryBoysError) throw deliveryBoysError;

      // Fetch assignments with relations
      const { data: assignmentsData, error: assignmentsError } = await supabase
        .from('order_assignments')
        .select(`
          *,
          orders(order_number, customer_name, total_amount),
          delivery_boys(name, phone)
        `)
        .order('assigned_at', { ascending: false });

      if (assignmentsError) throw assignmentsError;

      setOrders(ordersData || []);
      setDeliveryBoys(deliveryBoysData || []);
      setAssignments(assignmentsData || []);
    } catch (error) {
      console.error('Error fetching delivery data:', error);
      toast.error('Failed to load delivery data');
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate delivery metrics
  const deliveryMetrics = {
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.order_status === 'pending').length,
    assignedOrders: orders.filter(o => o.order_status === 'assigned').length,
    pickedUpOrders: orders.filter(o => o.order_status === 'picked_up').length,
    deliveredOrders: orders.filter(o => o.order_status === 'delivered').length,
    cancelledOrders: orders.filter(o => o.order_status === 'cancelled').length,
    activeDeliveryBoys: deliveryBoys.length,
    totalDeliveryRevenue: orders.reduce((sum, o) => sum + (o.delivery_charge || 0), 0),
    totalCommission: orders.reduce((sum, o) => sum + (o.commission || 0), 0)
  };

  // Financial overview data
  const financialOverviewData = [
    { name: 'Total Revenue', value: dashboardStats.totalRevenue, color: '#10b981' },
    { name: 'Delivery Revenue', value: deliveryMetrics.totalDeliveryRevenue, color: '#3b82f6' },
    { name: 'Commission', value: deliveryMetrics.totalCommission, color: '#8b5cf6' },
    { name: 'Expenses', value: dashboardStats.totalExpenses, color: '#ef4444' }
  ];

  // Order status distribution
  const orderStatusData = [
    { name: 'Pending', value: deliveryMetrics.pendingOrders, color: '#f59e0b' },
    { name: 'Assigned', value: deliveryMetrics.assignedOrders, color: '#3b82f6' },
    { name: 'Picked Up', value: deliveryMetrics.pickedUpOrders, color: '#8b5cf6' },
    { name: 'Delivered', value: deliveryMetrics.deliveredOrders, color: '#10b981' },
    { name: 'Cancelled', value: deliveryMetrics.cancelledOrders, color: '#ef4444' }
  ];

  // Daily delivery performance
  const getDailyDeliveryData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dailyOrders = orders.filter(o => 
        new Date(o.created_at).toISOString().split('T')[0] === dateStr
      );
      
      const delivered = dailyOrders.filter(o => o.order_status === 'delivered').length;
      const assigned = dailyOrders.filter(o => o.order_status === 'assigned').length;
      const pending = dailyOrders.filter(o => o.order_status === 'pending').length;
      const revenue = dailyOrders.reduce((sum, o) => sum + (o.delivery_charge || 0), 0);
      
      data.push({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        delivered,
        assigned,
        pending,
        revenue
      });
    }
    
    return data;
  };

  const dailyDeliveryData = getDailyDeliveryData();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Financial Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive financial and delivery insights</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
            Admin Dashboard
          </Badge>
        </div>

        {/* Key Metrics Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span className="truncate">Total Revenue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                ₹{dashboardStats.totalRevenue.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground">All transactions</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span className="truncate">Delivery Revenue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-600">
                ₹{deliveryMetrics.totalDeliveryRevenue.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground">From deliveries</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-purple-600" />
                <span className="truncate">Total Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">
                {deliveryMetrics.totalOrders}
              </div>
              <p className="text-xs text-muted-foreground">All time</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="truncate">Delivered</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">
                {deliveryMetrics.deliveredOrders}
              </div>
              <p className="text-xs text-muted-foreground">
                {deliveryMetrics.totalOrders > 0 ? 
                  Math.round((deliveryMetrics.deliveredOrders / deliveryMetrics.totalOrders) * 100) : 0}% success rate
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4 text-amber-600" />
                <span className="truncate">Pending</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-amber-600">
                {deliveryMetrics.pendingOrders}
              </div>
              <p className="text-xs text-muted-foreground">Awaiting assignment</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-indigo-600" />
                <span className="truncate">Delivery Boys</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-indigo-600">
                {deliveryMetrics.activeDeliveryBoys}
              </div>
              <p className="text-xs text-muted-foreground">Active team</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-max">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              <TabsTrigger value="delivery-boys">Delivery Team</TabsTrigger>
              <TabsTrigger value="assignments">Assignments</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Financial Overview
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={financialOverviewData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {financialOverviewData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {financialOverviewData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        <span className="truncate">{entry.name}: ₹{entry.value.toLocaleString('en-IN')}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={orderStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {orderStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    {orderStatusData.map((entry, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                        <span className="truncate">{entry.name}: {entry.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Daily Delivery Performance (Last 7 Days)
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={dailyDeliveryData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Area type="monotone" dataKey="delivered" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="assigned" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                    <Area type="monotone" dataKey="pending" stackId="1" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Recent Orders</CardTitle>
                <CardDescription>
                  All orders with delivery status ({orders.length} total)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <ScrollArea className="w-full">
                    <div className="min-w-[1000px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Shop</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Delivery Boy</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {orders.slice(0, 20).map((order) => (
                            <TableRow key={order.id}>
                              <TableCell className="font-medium">{order.order_number}</TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{order.customer_name}</p>
                                  <p className="text-sm text-gray-500">{order.customer_phone}</p>
                                </div>
                              </TableCell>
                              <TableCell>{order.shop_name}</TableCell>
                              <TableCell className="font-medium">₹{order.total_amount.toLocaleString('en-IN')}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    order.order_status === 'delivered' ? 'default' :
                                    order.order_status === 'pending' ? 'destructive' :
                                    order.order_status === 'cancelled' ? 'outline' : 'secondary'
                                  }
                                >
                                  {order.order_status}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                {order.delivery_boy ? (
                                  <div>
                                    <p className="font-medium">{order.delivery_boy.name}</p>
                                    <p className="text-sm text-gray-500">{order.delivery_boy.phone}</p>
                                  </div>
                                ) : (
                                  <span className="text-gray-500">Not assigned</span>
                                )}
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(order.created_at).toLocaleDateString('en-IN')}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="delivery-boys" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Delivery Team</CardTitle>
                <CardDescription>
                  Active delivery boys and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {deliveryBoys.map((boy) => {
                    const boyOrders = orders.filter(o => o.delivery_boy_id === boy.id);
                    const deliveredCount = boyOrders.filter(o => o.order_status === 'delivered').length;
                    const assignedCount = boyOrders.filter(o => o.order_status === 'assigned' || o.order_status === 'picked_up').length;
                    
                    return (
                      <Card key={boy.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <User className="h-4 w-4" />
                              <span className="font-medium">{boy.name}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Phone className="h-3 w-3" />
                              <span>{boy.phone}</span>
                            </div>
                            {boy.vehicle_type && (
                              <div className="flex items-center gap-2">
                                <Truck className="h-3 w-3" />
                                <Badge variant="outline" className="text-xs">
                                  {boy.vehicle_type}
                                </Badge>
                                {boy.vehicle_number && (
                                  <span className="text-xs text-gray-500">{boy.vehicle_number}</span>
                                )}
                              </div>
                            )}
                            {boy.current_location && (
                              <div className="flex items-center gap-2 text-sm text-gray-600">
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{boy.current_location}</span>
                              </div>
                            )}
                            <div className="pt-2 border-t">
                              <div className="flex justify-between text-sm">
                                <span className="text-green-600">Delivered: {deliveredCount}</span>
                                <span className="text-blue-600">Active: {assignedCount}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="assignments" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Order Assignments</CardTitle>
                <CardDescription>
                  Recent order assignments and their status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <ScrollArea className="w-full">
                    <div className="min-w-[800px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Order #</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Delivery Boy</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Assigned At</TableHead>
                            <TableHead>Notes</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {assignments.slice(0, 20).map((assignment) => (
                            <TableRow key={assignment.id}>
                              <TableCell className="font-medium">
                                {assignment.orders?.order_number || 'N/A'}
                              </TableCell>
                              <TableCell>
                                {assignment.orders?.customer_name || 'N/A'}
                              </TableCell>
                              <TableCell>
                                <div>
                                  <p className="font-medium">{assignment.delivery_boys?.name || 'N/A'}</p>
                                  <p className="text-sm text-gray-500">{assignment.delivery_boys?.phone || ''}</p>
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    assignment.status === 'accepted' ? 'default' :
                                    assignment.status === 'rejected' ? 'destructive' : 'secondary'
                                  }
                                >
                                  {assignment.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm">
                                {new Date(assignment.assigned_at).toLocaleString('en-IN')}
                              </TableCell>
                              <TableCell className="text-sm">
                                {assignment.notes || '-'}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Delivery Success Rate</p>
                      <p className="text-2xl font-bold text-green-900">
                        {deliveryMetrics.totalOrders > 0 ? 
                          Math.round((deliveryMetrics.deliveredOrders / deliveryMetrics.totalOrders) * 100) : 0}%
                      </p>
                      <p className="text-xs text-green-600">
                        {deliveryMetrics.deliveredOrders} of {deliveryMetrics.totalOrders} orders
                      </p>
                    </div>
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Avg Delivery Revenue</p>
                      <p className="text-2xl font-bold text-blue-900">
                        ₹{deliveryMetrics.totalOrders > 0 ? 
                          Math.round(deliveryMetrics.totalDeliveryRevenue / deliveryMetrics.totalOrders).toLocaleString('en-IN') : '0'}
                      </p>
                      <p className="text-xs text-blue-600">Per order</p>
                    </div>
                    <Truck className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Active Assignments</p>
                      <p className="text-2xl font-bold text-purple-900">
                        {deliveryMetrics.assignedOrders + deliveryMetrics.pickedUpOrders}
                      </p>
                      <p className="text-xs text-purple-600">In progress</p>
                    </div>
                    <Clock className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-800">Pending Orders</p>
                      <p className="text-2xl font-bold text-amber-900">{deliveryMetrics.pendingOrders}</p>
                      <p className="text-xs text-amber-600">Need assignment</p>
                    </div>
                    <AlertTriangle className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Daily Revenue Trend</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyDeliveryData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default FinancialAnalyticsDashboard;
