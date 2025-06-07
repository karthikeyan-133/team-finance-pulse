import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
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
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Package,
  Users,
  DollarSign,
  Calendar as CalendarIcon,
  RefreshCw,
  ShoppingCart
} from 'lucide-react';
import { Transaction, Customer } from '../../types';
import { format, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfDay, endOfDay, isToday, isYesterday, parseISO, isSameDay } from 'date-fns';

interface DailyAnalyticsProps {
  transactions: Transaction[];
  customers: Customer[];
}

const DailyAnalytics: React.FC<DailyAnalyticsProps> = ({ transactions, customers }) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [timeRange, setTimeRange] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Calculate date ranges
  const getDateRange = () => {
    const today = new Date();
    switch (timeRange) {
      case 'weekly':
        return {
          start: startOfWeek(today),
          end: endOfWeek(today),
          days: 7
        };
      case 'monthly':
        return {
          start: startOfMonth(today),
          end: endOfMonth(today),
          days: 30
        };
      default:
        return {
          start: today,
          end: today,
          days: 7 // Show last 7 days for daily view
        };
    }
  };

  const { start: rangeStart, end: rangeEnd, days } = getDateRange();

  // Helper function to check if transaction date matches a specific day
  const isTransactionOnDate = (transaction: Transaction, targetDate: Date) => {
    try {
      let transactionDate: Date;
      
      if (typeof transaction.date === 'string') {
        // Handle ISO string format
        transactionDate = new Date(transaction.date);
      } else {
        transactionDate = new Date(transaction.date);
      }

      // Use isSameDay from date-fns for accurate comparison
      return isSameDay(transactionDate, targetDate);
    } catch (error) {
      console.error('Error parsing transaction date:', transaction.date, error);
      return false;
    }
  };

  // Generate analytics data for the time range
  const generateAnalyticsData = () => {
    const data = [];
    
    for (let i = days - 1; i >= 0; i--) {
      const date = subDays(new Date(), i);
      
      // Filter transactions for this specific day
      const dayTransactions = transactions.filter(t => isTransactionOnDate(t, date));
      
      // Filter customers for this specific day
      const dayCustomers = customers.filter(c => {
        try {
          const customerDate = new Date(c.createdAt);
          return isSameDay(customerDate, date);
        } catch (error) {
          console.error('Error parsing customer date:', c.createdAt, error);
          return false;
        }
      });

      // Calculate unique orders - improved logic
      // Use orderId if available, otherwise group by customer and approximate time
      const orderGroups = new Map();
      
      dayTransactions.forEach(transaction => {
        let orderKey;
        
        // If orderId exists and is not empty, use it as the primary key
        if (transaction.orderId && transaction.orderId.trim() !== '') {
          orderKey = transaction.orderId;
        } else {
          // Fallback: group by customer info and date/time (within same hour)
          const transactionDate = new Date(transaction.date);
          const hourKey = format(transactionDate, 'yyyy-MM-dd-HH');
          orderKey = `${transaction.customerId || transaction.customerName || 'unknown'}_${transaction.customerPhone || 'unknown'}_${hourKey}`;
        }
        
        if (!orderGroups.has(orderKey)) {
          orderGroups.set(orderKey, []);
        }
        orderGroups.get(orderKey).push(transaction);
      });

      const totalOrders = orderGroups.size;
      const totalTransactions = dayTransactions.length;
      const newOrders = dayTransactions.filter(t => t.isNewCustomer === 'true').length;
      const returnOrders = dayTransactions.filter(t => t.isNewCustomer === 'false').length;
      const totalSales = dayTransactions.reduce((sum, t) => sum + t.amount, 0);
      const paidTransactions = dayTransactions.filter(t => t.paymentStatus === 'paid');
      const pendingTransactions = dayTransactions.filter(t => t.paymentStatus === 'pending');
      const paidOrders = paidTransactions.length;
      const pendingOrders = pendingTransactions.length;
      const newCustomers = dayCustomers.filter(c => c.isNew).length;
      const totalCommission = dayTransactions.reduce((sum, t) => sum + (t.commission || 0), 0);

      console.log(`Analytics for ${format(date, 'yyyy-MM-dd')}:`, {
        totalTransactions,
        totalOrders,
        dayTransactions: dayTransactions.length,
        orderGroups: orderGroups.size,
        orderIds: Array.from(orderGroups.keys()).slice(0, 5), // Show first 5 order keys for debugging
        transactionsWithOrderId: dayTransactions.filter(t => t.orderId && t.orderId.trim() !== '').length
      });

      data.push({
        date: format(date, timeRange === 'daily' ? 'MMM dd' : timeRange === 'weekly' ? 'MMM dd' : 'MMM dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        totalOrders,
        totalTransactions,
        newOrders,
        returnOrders,
        totalSales,
        paidOrders,
        pendingOrders,
        newCustomers,
        totalCommission,
        averageOrderValue: totalOrders > 0 ? totalSales / totalOrders : 0
      });
    }
    
    return data;
  };

  const analyticsData = generateAnalyticsData();

  // Today's specific data
  const todayData = analyticsData[analyticsData.length - 1] || {
    totalOrders: 0,
    totalTransactions: 0,
    newOrders: 0,
    returnOrders: 0,
    totalSales: 0,
    paidOrders: 0,
    pendingOrders: 0,
    newCustomers: 0,
    totalCommission: 0,
    averageOrderValue: 0
  };

  // Calculate trends (comparing to previous period)
  const calculateTrend = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
  };

  const yesterdayData = analyticsData[analyticsData.length - 2] || {
    totalOrders: 0,
    totalTransactions: 0,
    newOrders: 0,
    returnOrders: 0,
    totalSales: 0,
    paidOrders: 0,
    pendingOrders: 0,
    newCustomers: 0,
    totalCommission: 0,
    averageOrderValue: 0
  };
  
  const ordersTrend = calculateTrend(todayData.totalOrders, yesterdayData.totalOrders);
  const transactionsTrend = calculateTrend(todayData.totalTransactions, yesterdayData.totalTransactions);
  const salesTrend = calculateTrend(todayData.totalSales, yesterdayData.totalSales);
  const customersTrend = calculateTrend(todayData.newCustomers, yesterdayData.newCustomers);

  // Chart colors
  const chartColors = ['#6950dd', '#4ade80', '#f97316', '#8b5cf6', '#06b6d4'];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daily Analytics</h2>
        <div className="flex items-center gap-2">
          <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as any)}>
            <TabsList>
              <TabsTrigger value="daily">Daily</TabsTrigger>
              <TabsTrigger value="weekly">Weekly</TabsTrigger>
              <TabsTrigger value="monthly">Monthly</TabsTrigger>
            </TabsList>
          </Tabs>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="ml-2">
                <CalendarIcon className="h-4 w-4 mr-2" />
                {format(selectedDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Debug Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-4">
          <p className="text-sm text-blue-800">
            Debug Info - Total DB transactions: {transactions.length} | 
            Today: {todayData.totalTransactions} transactions, {todayData.totalOrders} orders | 
            Yesterday: {yesterdayData.totalTransactions} transactions, {yesterdayData.totalOrders} orders |
            Analytics Data Points: {analyticsData.length}
          </p>
        </CardContent>
      </Card>

      {/* Key Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayData.totalOrders}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {ordersTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={ordersTrend >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(ordersTrend).toFixed(1)}%
              </span>
              <span className="ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <ShoppingCart className="h-4 w-4" />
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayData.totalTransactions}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {transactionsTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={transactionsTrend >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(transactionsTrend).toFixed(1)}%
              </span>
              <span className="ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Total Sales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayData.totalSales.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {salesTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={salesTrend >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(salesTrend).toFixed(1)}%
              </span>
              <span className="ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              New Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayData.newCustomers}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {customersTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={customersTrend >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(customersTrend).toFixed(1)}%
              </span>
              <span className="ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Average Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayData.averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              {todayData.paidOrders} paid, {todayData.pendingOrders} pending
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="charts" className="w-full">
        <TabsList>
          <TabsTrigger value="charts">Charts</TabsTrigger>
          <TabsTrigger value="breakdown">Order Breakdown</TabsTrigger>
          <TabsTrigger value="detailed">Detailed View</TabsTrigger>
        </TabsList>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Sales Trend ({timeRange})</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Sales']}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalSales" 
                      stroke="#6950dd" 
                      strokeWidth={2}
                      dot={{ fill: '#6950dd' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Orders vs Transactions ({timeRange})</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalOrders" fill="#6950dd" radius={[4, 4, 0, 0]} name="Orders" />
                    <Bar dataKey="totalTransactions" fill="#4ade80" radius={[4, 4, 0, 0]} name="Transactions" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="breakdown" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Order Types Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Orders</span>
                    <Badge variant="default">{todayData.totalOrders}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Total Transactions</span>
                    <Badge variant="secondary">{todayData.totalTransactions}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Orders</span>
                    <Badge variant="outline">{todayData.newOrders}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Return Orders</span>
                    <Badge variant="outline">{todayData.returnOrders}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status Today</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Paid Orders</span>
                    <Badge variant="default" className="bg-green-500">{todayData.paidOrders}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Pending Orders</span>
                    <Badge variant="destructive">{todayData.pendingOrders}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Commission</span>
                    <span className="text-sm font-medium">₹{todayData.totalCommission.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">New Customers</span>
                    <Badge variant="default">{todayData.newCustomers}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Avg. Order Value</span>
                    <span className="text-sm font-medium">₹{todayData.averageOrderValue.toFixed(0)}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Report</CardTitle>
              <CardDescription>
                Day-by-day breakdown of all metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Total Orders</TableHead>
                      <TableHead>Total Transactions</TableHead>
                      <TableHead>New Orders</TableHead>
                      <TableHead>Return Orders</TableHead>
                      <TableHead>Sales</TableHead>
                      <TableHead>Paid</TableHead>
                      <TableHead>Pending</TableHead>
                      <TableHead>New Customers</TableHead>
                      <TableHead>Commission</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.slice().reverse().map((day, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{day.fullDate}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="text-xs">{day.totalOrders}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{day.totalTransactions}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="default" className="text-xs">{day.newOrders}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="text-xs">{day.returnOrders}</Badge>
                        </TableCell>
                        <TableCell>₹{day.totalSales.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="bg-green-500 text-xs">{day.paidOrders}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="destructive" className="text-xs">{day.pendingOrders}</Badge>
                        </TableCell>
                        <TableCell>{day.newCustomers}</TableCell>
                        <TableCell>₹{day.totalCommission.toLocaleString('en-IN')}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyAnalytics;
