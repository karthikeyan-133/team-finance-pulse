
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, TrendingUp, TrendingDown, DollarSign, Package, Users, Download } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Order, ProductDetail } from '@/types/orders';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, Legend } from 'recharts';

const FinancialAnalytics = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('7days');

  // Fetch orders data
  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['orders-financial'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform the data to match our Order interface
      return data.map(order => ({
        ...order,
        product_details: Array.isArray(order.product_details) 
          ? (order.product_details as unknown as ProductDetail[])
          : []
      })) as Order[];
    }
  });

  // Filter orders based on selected period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    const filterDate = new Date();
    
    switch (selectedPeriod) {
      case '7days':
        filterDate.setDate(now.getDate() - 7);
        break;
      case '30days':
        filterDate.setDate(now.getDate() - 30);
        break;
      case '90days':
        filterDate.setDate(now.getDate() - 90);
        break;
      default:
        return orders;
    }
    
    return orders.filter(order => new Date(order.created_at) >= filterDate);
  }, [orders, selectedPeriod]);

  // Calculate financial metrics
  const financialMetrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + Number(order.total_amount), 0);
    const totalCommission = filteredOrders.reduce((sum, order) => sum + Number(order.commission || 0), 0);
    const totalDeliveryCharges = filteredOrders.reduce((sum, order) => sum + Number(order.delivery_charge || 0), 0);
    const totalOrders = filteredOrders.length;
    const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    
    const paidOrders = filteredOrders.filter(order => order.payment_status === 'paid');
    const pendingPayments = filteredOrders.filter(order => order.payment_status === 'pending');
    
    const deliveredOrders = filteredOrders.filter(order => order.order_status === 'delivered');
    const completionRate = totalOrders > 0 ? (deliveredOrders.length / totalOrders) * 100 : 0;

    return {
      totalRevenue,
      totalCommission,
      totalDeliveryCharges,
      totalOrders,
      averageOrderValue,
      paidAmount: paidOrders.reduce((sum, order) => sum + Number(order.total_amount), 0),
      pendingAmount: pendingPayments.reduce((sum, order) => sum + Number(order.total_amount), 0),
      completionRate: Math.round(completionRate)
    };
  }, [filteredOrders]);

  // Prepare chart data
  const dailyRevenueData = useMemo(() => {
    const revenueByDate = filteredOrders.reduce((acc, order) => {
      const date = new Date(order.created_at).toLocaleDateString();
      acc[date] = (acc[date] || 0) + Number(order.total_amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(revenueByDate)
      .map(([date, revenue]) => ({ date, revenue }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [filteredOrders]);

  const shopRevenueData = useMemo(() => {
    const revenueByShop = filteredOrders.reduce((acc, order) => {
      acc[order.shop_name] = (acc[order.shop_name] || 0) + Number(order.total_amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(revenueByShop)
      .map(([shop, revenue]) => ({ shop, revenue }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredOrders]);

  const paymentMethodData = useMemo(() => {
    const methodCounts = filteredOrders.reduce((acc, order) => {
      acc[order.payment_method] = (acc[order.payment_method] || 0) + Number(order.total_amount);
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(methodCounts).map(([method, amount]) => ({
      method: method.toUpperCase(),
      amount,
      count: filteredOrders.filter(o => o.payment_method === method).length
    }));
  }, [filteredOrders]);

  const chartConfig = {
    revenue: {
      label: "Revenue",
      color: "hsl(var(--chart-1))",
    },
    amount: {
      label: "Amount",
      color: "hsl(var(--chart-2))",
    },
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading financial data...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Financial Analytics</h1>
          <p className="text-muted-foreground">Comprehensive financial insights for your orders</p>
        </div>
        <div className="flex gap-2">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="90days">Last 90 Days</option>
            <option value="all">All Time</option>
          </select>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{financialMetrics.totalRevenue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              From {financialMetrics.totalOrders} orders
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Commission Earned</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{financialMetrics.totalCommission.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Platform commission
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Order Value</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{financialMetrics.averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Per order average
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{financialMetrics.completionRate}%</div>
            <p className="text-xs text-muted-foreground">
              Orders delivered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Payment Status Overview */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
                  Paid Amount
                </span>
                <span className="font-bold">₹{financialMetrics.paidAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                  Pending Amount
                </span>
                <span className="font-bold">₹{financialMetrics.pendingAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center">
                  <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                  Delivery Charges
                </span>
                <span className="font-bold">₹{financialMetrics.totalDeliveryCharges.toLocaleString()}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Payment Methods</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paymentMethodData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                    label={({ method, percent }) => `${method} ${(percent * 100).toFixed(0)}%`}
                  >
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip 
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border rounded shadow">
                            <p>{data.method}: ₹{data.amount.toLocaleString()}</p>
                            <p>Orders: {data.count}</p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenue-trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue-trends">Revenue Trends</TabsTrigger>
          <TabsTrigger value="shop-performance">Shop Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue-trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Daily Revenue Trends</CardTitle>
              <CardDescription>Revenue generated over time</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dailyRevenueData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="var(--color-revenue)" 
                      strokeWidth={2}
                      dot={{ fill: "var(--color-revenue)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shop-performance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Shops</CardTitle>
              <CardDescription>Revenue by shop (top 10)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={chartConfig} className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={shopRevenueData} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="shop" type="category" width={150} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar dataKey="revenue" fill="var(--color-revenue)" />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialAnalytics;
