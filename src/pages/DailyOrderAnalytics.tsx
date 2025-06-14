
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, Clock, Package, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, ProductDetail } from '@/types/orders';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';

const DailyOrderAnalytics = () => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Fetch orders data for the selected date
  const { data: orders = [], isLoading, refetch } = useQuery({
    queryKey: ['daily-orders', selectedDate],
    queryFn: async () => {
      const startDate = new Date(selectedDate);
      startDate.setHours(0, 0, 0, 0);
      
      const endDate = new Date(selectedDate);
      endDate.setHours(23, 59, 59, 999);

      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString())
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(order => ({
        ...order,
        product_details: Array.isArray(order.product_details) 
          ? (order.product_details as unknown as ProductDetail[])
          : []
      })) as Order[];
    }
  });

  // Calculate daily metrics
  const dailyMetrics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Status breakdown
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.order_status] = (acc[order.order_status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Recent updates (orders updated today)
    const today = new Date().toISOString().split('T')[0];
    const updatedToday = orders.filter(order => 
      order.updated_at.startsWith(today) && 
      order.created_at !== order.updated_at
    );

    // Payment status
    const paidOrders = orders.filter(order => order.payment_status === 'paid').length;
    const pendingPayments = orders.filter(order => order.payment_status === 'pending').length;

    return {
      totalOrders,
      totalRevenue,
      averageOrderValue,
      statusCounts,
      updatedToday: updatedToday.length,
      paidOrders,
      pendingPayments,
      completedOrders: statusCounts.delivered || 0,
      pendingOrders: statusCounts.pending || 0,
      processingOrders: (statusCounts.preparing || 0) + (statusCounts.prepared || 0) + (statusCounts.ready || 0)
    };
  }, [orders]);

  // Hourly creation data
  const hourlyData = useMemo(() => {
    const hourCounts = Array.from({ length: 24 }, (_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      orders: 0,
      revenue: 0
    }));

    orders.forEach(order => {
      const hour = new Date(order.created_at).getHours();
      hourCounts[hour].orders += 1;
      hourCounts[hour].revenue += Number(order.total_amount);
    });

    return hourCounts;
  }, [orders]);

  // Status distribution data
  const statusData = useMemo(() => {
    return Object.entries(dailyMetrics.statusCounts).map(([status, count]) => ({
      status: status.replace('_', ' ').toUpperCase(),
      count,
      percentage: ((count / dailyMetrics.totalOrders) * 100).toFixed(1)
    }));
  }, [dailyMetrics]);

  // Shop performance for the day
  const shopPerformance = useMemo(() => {
    const shopStats = orders.reduce((acc, order) => {
      if (!acc[order.shop_name]) {
        acc[order.shop_name] = { orders: 0, revenue: 0 };
      }
      acc[order.shop_name].orders += 1;
      acc[order.shop_name].revenue += Number(order.total_amount);
      return acc;
    }, {} as Record<string, { orders: number; revenue: number }>);

    return Object.entries(shopStats)
      .map(([shop, stats]) => ({
        shop,
        orders: stats.orders,
        revenue: stats.revenue
      }))
      .sort((a, b) => b.orders - a.orders);
  }, [orders]);

  const chartConfig = {
    orders: {
      label: "Orders",
      color: "hsl(var(--chart-1))",
    },
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-2))",
    },
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading daily analytics...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Daily Order Analytics</h1>
          <p className="text-muted-foreground">Track order creation and updates for {selectedDate}</p>
        </div>
        <div className="flex gap-2">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-3 py-2 border rounded-md"
          />
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Key Daily Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyMetrics.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Created today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Order Updates</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyMetrics.updatedToday}</div>
            <p className="text-xs text-muted-foreground">
              Status changes today
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyMetrics.completedOrders}</div>
            <p className="text-xs text-muted-foreground">
              Delivered orders
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dailyMetrics.processingOrders}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{dailyMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Avg ₹{dailyMetrics.averageOrderValue.toFixed(0)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Order Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Order Updates</CardTitle>
          <CardDescription>Orders that had status changes today</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 max-h-60 overflow-y-auto">
            {orders
              .filter(order => 
                order.updated_at.startsWith(selectedDate) && 
                order.created_at !== order.updated_at
              )
              .slice(0, 10)
              .map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 border rounded">
                  <div>
                    <p className="font-medium">#{order.order_number}</p>
                    <p className="text-sm text-muted-foreground">{order.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <Badge variant={order.order_status === 'delivered' ? 'default' : 'secondary'}>
                      {order.order_status.replace('_', ' ').toUpperCase()}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(order.updated_at).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
            {orders.filter(order => 
              order.updated_at.startsWith(selectedDate) && 
              order.created_at !== order.updated_at
            ).length === 0 && (
              <p className="text-center text-muted-foreground py-4">No order updates today</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="hourly-trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="hourly-trends">Hourly Trends</TabsTrigger>
          <TabsTrigger value="status-breakdown">Status Breakdown</TabsTrigger>
          <TabsTrigger value="shop-performance">Shop Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="hourly-trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Hourly Order Creation</CardTitle>
              <CardDescription>Number of orders created by hour</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={hourlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="orders" fill="var(--color-orders)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="status-breakdown" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Order Status Distribution</CardTitle>
              <CardDescription>Current status of all orders created today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="count"
                        label={({ status, percentage }) => `${status} ${percentage}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-white p-2 border rounded shadow">
                                <p>{data.status}: {data.count} orders</p>
                                <p>{data.percentage}% of total</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-3">
                  {statusData.map((item, index) => (
                    <div key={item.status} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-4 h-4 rounded" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm">{item.status}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-medium">{item.count}</span>
                        <span className="text-xs text-muted-foreground ml-2">({item.percentage}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Shop Performance Today</CardTitle>
              <CardDescription>Orders and revenue by shop</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {shopPerformance.map((shop, index) => (
                  <div key={shop.shop} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <p className="font-medium">{shop.shop}</p>
                      <p className="text-sm text-muted-foreground">{shop.orders} orders</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">₹{shop.revenue.toLocaleString()}</p>
                      <p className="text-xs text-muted-foreground">
                        Avg ₹{(shop.revenue / shop.orders).toFixed(0)}
                      </p>
                    </div>
                  </div>
                ))}
                {shopPerformance.length === 0 && (
                  <p className="text-center text-muted-foreground py-4">No orders today</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyOrderAnalytics;
