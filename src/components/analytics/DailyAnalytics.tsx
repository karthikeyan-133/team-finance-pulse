
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
  Cell,
  AreaChart,
  Area
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  Package,
  Users,
  DollarSign,
  Calendar as CalendarIcon,
  RefreshCw,
  ShoppingCart,
  IndianRupee,
  Truck,
  Wallet,
  CreditCard,
  PieChart as PieChartIcon
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

  // Enhanced financial calculations
  const calculateFinancialMetrics = () => {
    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalDeliveryCharges = transactions.reduce((sum, t) => sum + (t.deliveryCharge || 0), 0);
    const totalCommission = transactions.reduce((sum, t) => sum + (t.commission || 0), 0);
    const pendingAmount = transactions.filter(t => t.paymentStatus === 'pending').reduce((sum, t) => sum + t.amount, 0);
    const paidAmount = transactions.filter(t => t.paymentStatus === 'paid').reduce((sum, t) => sum + t.amount, 0);
    const grossProfit = totalDeliveryCharges + totalCommission;
    
    // Payment method breakdown
    const paymentMethods = {
      upi: { count: 0, amount: 0 },
      cash: { count: 0, amount: 0 },
      other: { count: 0, amount: 0 }
    };
    
    transactions.forEach(t => {
      if (paymentMethods[t.paymentMethod]) {
        paymentMethods[t.paymentMethod].count++;
        paymentMethods[t.paymentMethod].amount += t.amount;
      }
    });

    return {
      totalRevenue,
      totalDeliveryCharges,
      totalCommission,
      pendingAmount,
      paidAmount,
      grossProfit,
      paymentMethods,
      averageOrderValue: transactions.length > 0 ? totalRevenue / transactions.length : 0
    };
  };

  const financialMetrics = calculateFinancialMetrics();

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
      const orderGroups = new Map();
      
      dayTransactions.forEach(transaction => {
        let orderKey;
        
        if (transaction.orderId && transaction.orderId.trim() !== '') {
          orderKey = transaction.orderId;
        } else {
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
      const totalDeliveryCharges = dayTransactions.reduce((sum, t) => sum + (t.deliveryCharge || 0), 0);
      const totalCommission = dayTransactions.reduce((sum, t) => sum + (t.commission || 0), 0);
      const paidTransactions = dayTransactions.filter(t => t.paymentStatus === 'paid');
      const pendingTransactions = dayTransactions.filter(t => t.paymentStatus === 'pending');
      const paidAmount = paidTransactions.reduce((sum, t) => sum + t.amount, 0);
      const pendingAmount = pendingTransactions.reduce((sum, t) => sum + t.amount, 0);
      const paidOrders = paidTransactions.length;
      const pendingOrders = pendingTransactions.length;
      const newCustomers = dayCustomers.filter(c => c.isNew).length;
      const grossProfit = totalDeliveryCharges + totalCommission;

      data.push({
        date: format(date, timeRange === 'daily' ? 'MMM dd' : timeRange === 'weekly' ? 'MMM dd' : 'MMM dd'),
        fullDate: format(date, 'yyyy-MM-dd'),
        totalOrders,
        totalTransactions,
        newOrders,
        returnOrders,
        totalSales,
        totalDeliveryCharges,
        totalCommission,
        paidAmount,
        pendingAmount,
        paidOrders,
        pendingOrders,
        newCustomers,
        grossProfit,
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
    totalDeliveryCharges: 0,
    totalCommission: 0,
    paidAmount: 0,
    pendingAmount: 0,
    paidOrders: 0,
    pendingOrders: 0,
    newCustomers: 0,
    grossProfit: 0,
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
    totalDeliveryCharges: 0,
    totalCommission: 0,
    paidAmount: 0,
    pendingAmount: 0,
    paidOrders: 0,
    pendingOrders: 0,
    newCustomers: 0,
    grossProfit: 0,
    averageOrderValue: 0
  };
  
  const ordersTrend = calculateTrend(todayData.totalOrders, yesterdayData.totalOrders);
  const transactionsTrend = calculateTrend(todayData.totalTransactions, yesterdayData.totalTransactions);
  const salesTrend = calculateTrend(todayData.totalSales, yesterdayData.totalSales);
  const customersTrend = calculateTrend(todayData.newCustomers, yesterdayData.newCustomers);
  const revenueTrend = calculateTrend(todayData.totalSales, yesterdayData.totalSales);
  const profitTrend = calculateTrend(todayData.grossProfit, yesterdayData.grossProfit);

  // Chart colors
  const chartColors = ['#6950dd', '#4ade80', '#f97316', '#8b5cf6', '#06b6d4'];

  // Payment method chart data
  const paymentMethodChartData = [
    { name: 'UPI', value: financialMetrics.paymentMethods.upi.amount, count: financialMetrics.paymentMethods.upi.count, color: '#10b981' },
    { name: 'Cash', value: financialMetrics.paymentMethods.cash.amount, count: financialMetrics.paymentMethods.cash.count, color: '#f59e0b' },
    { name: 'Other', value: financialMetrics.paymentMethods.other.amount, count: financialMetrics.paymentMethods.other.count, color: '#8b5cf6' }
  ];

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Daily Analytics Dashboard</h2>
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

      {/* Enhanced Financial Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-green-600" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">₹{financialMetrics.totalRevenue.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {revenueTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={revenueTrend >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(revenueTrend).toFixed(1)}%
              </span>
              <span className="ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Truck className="h-4 w-4 text-purple-600" />
              Delivery Charges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">₹{financialMetrics.totalDeliveryCharges.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Total delivery income
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-indigo-600" />
              Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">₹{financialMetrics.totalCommission.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Total commission earned
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet className="h-4 w-4 text-blue-600" />
              Gross Profit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">₹{financialMetrics.grossProfit.toLocaleString('en-IN')}</div>
            <div className="flex items-center text-xs text-muted-foreground">
              {profitTrend >= 0 ? (
                <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              )}
              <span className={profitTrend >= 0 ? 'text-green-500' : 'text-red-500'}>
                {Math.abs(profitTrend).toFixed(1)}%
              </span>
              <span className="ml-1">from yesterday</span>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-amber-600" />
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">₹{financialMetrics.pendingAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Unpaid transactions
            </p>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Average Order
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{financialMetrics.averageOrderValue.toFixed(0)}</div>
            <p className="text-xs text-muted-foreground">
              Per transaction
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="financial-overview" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="financial-overview">Financial Overview</TabsTrigger>
          <TabsTrigger value="charts">Performance Charts</TabsTrigger>
          <TabsTrigger value="payment-methods">Payment Methods</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Report</TabsTrigger>
        </TabsList>

        <TabsContent value="financial-overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-800">Paid Amount</p>
                    <p className="text-2xl font-bold text-green-900">₹{financialMetrics.paidAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-green-600">Completed payments</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-800">Pending Amount</p>
                    <p className="text-2xl font-bold text-amber-900">₹{financialMetrics.pendingAmount.toLocaleString('en-IN')}</p>
                    <p className="text-xs text-amber-600">Awaiting payment</p>
                  </div>
                  <DollarSign className="h-8 w-8 text-amber-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-800">Total Orders</p>
                    <p className="text-2xl font-bold text-blue-900">{todayData.totalOrders}</p>
                    <p className="text-xs text-blue-600">Today's orders</p>
                  </div>
                  <Package className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-800">New Customers</p>
                    <p className="text-2xl font-bold text-purple-900">{todayData.newCustomers}</p>
                    <p className="text-xs text-purple-600">Today's new customers</p>
                  </div>
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Daily Financial Trend */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Daily Financial Performance (Last 7 Days)
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={analyticsData}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="date" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name]}
                    labelStyle={{ fontSize: '12px' }}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Area type="monotone" dataKey="totalSales" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Revenue" />
                  <Area type="monotone" dataKey="totalDeliveryCharges" stackId="2" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Delivery Charges" />
                  <Area type="monotone" dataKey="totalCommission" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} name="Commission" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend ({timeRange})</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Revenue']}
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

            <Card>
              <CardHeader>
                <CardTitle>Profit Components ({timeRange})</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`]}
                    />
                    <Bar dataKey="totalDeliveryCharges" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Delivery Charges" />
                    <Bar dataKey="totalCommission" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Commission" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Status ({timeRange})</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`]}
                    />
                    <Bar dataKey="paidAmount" fill="#10b981" radius={[4, 4, 0, 0]} name="Paid Amount" />
                    <Bar dataKey="pendingAmount" fill="#ef4444" radius={[4, 4, 0, 0]} name="Pending Amount" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="payment-methods" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChartIcon className="h-5 w-5" />
                  Payment Method Distribution
                </CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={paymentMethodChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {paymentMethodChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 flex justify-center gap-4 text-sm">
                  {paymentMethodChartData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: entry.color }}></span>
                      <span>{entry.name} ({entry.count})</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Payment Method Breakdown</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(financialMetrics.paymentMethods).map(([method, stats]) => (
                    <div key={method} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-full bg-white">
                          {method === 'upi' && <CreditCard className="h-5 w-5 text-green-600" />}
                          {method === 'cash' && <Wallet className="h-5 w-5 text-amber-600" />}
                          {method === 'other' && <DollarSign className="h-5 w-5 text-purple-600" />}
                        </div>
                        <div>
                          <p className="font-medium capitalize">{method}</p>
                          <p className="text-sm text-gray-600">{stats.count} transactions</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">₹{stats.amount.toLocaleString('en-IN')}</p>
                        <p className="text-sm text-gray-600">
                          {financialMetrics.totalRevenue > 0 ? ((stats.amount / financialMetrics.totalRevenue) * 100).toFixed(1) : '0'}%
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Detailed {timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Financial Report</CardTitle>
              <CardDescription>
                Comprehensive breakdown of all financial metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Delivery Charges</TableHead>
                      <TableHead>Commission</TableHead>
                      <TableHead>Gross Profit</TableHead>
                      <TableHead>Paid Amount</TableHead>
                      <TableHead>Pending Amount</TableHead>
                      <TableHead>Orders</TableHead>
                      <TableHead>Transactions</TableHead>
                      <TableHead>New Customers</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {analyticsData.slice().reverse().map((day, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{day.fullDate}</TableCell>
                        <TableCell className="text-green-600 font-medium">₹{day.totalSales.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-purple-600 font-medium">₹{day.totalDeliveryCharges.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-indigo-600 font-medium">₹{day.totalCommission.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-blue-600 font-medium">₹{day.grossProfit.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-green-600">₹{day.paidAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="text-amber-600">₹{day.pendingAmount.toLocaleString('en-IN')}</TableCell>
                        <TableCell>
                          <Badge variant="default" className="text-xs">{day.totalOrders}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-xs">{day.totalTransactions}</Badge>
                        </TableCell>
                        <TableCell>{day.newCustomers}</TableCell>
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
