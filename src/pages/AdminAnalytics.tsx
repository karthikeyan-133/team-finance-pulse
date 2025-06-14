import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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
  Users, 
  TrendingUp, 
  DollarSign, 
  Package,
  MapPin,
  Phone,
  User,
  Search,
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Receipt,
  Edit,
  IndianRupee,
  Truck,
  TrendingDown,
  Wallet,
  CreditCard,
  PieChart as PieChartIcon
} from 'lucide-react';
import DailyAnalytics from '../components/analytics/DailyAnalytics';
import { toast } from '@/components/ui/sonner';
import AddExpenseForm from '../components/forms/AddExpenseForm';
import EditTransactionForm from '../components/forms/EditTransactionForm';
import { Transaction } from '../types';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const { transactions, customers, expenses, getCustomerById, dashboardStats, updateTransaction } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const itemsPerPage = 20;

  // Redirect non-admin users to delivery update page
  if (user?.role !== 'admin') {
    return <Navigate to="/delivery-update" replace />;
  }

  // Enhanced financial calculations
  const totalRevenue = dashboardStats.totalRevenue;
  const totalExpenses = dashboardStats.totalExpenses;
  const totalDeliveryCharges = dashboardStats.totalDeliveryCharges;
  const totalCommission = dashboardStats.totalCommission;
  const netIncome = totalRevenue - totalExpenses;
  const grossProfit = totalDeliveryCharges + totalCommission;
  
  // Payment method breakdown
  const paymentMethodStats = {
    upi: {
      count: transactions.filter(t => t.paymentMethod === 'upi').length,
      amount: transactions.filter(t => t.paymentMethod === 'upi').reduce((sum, t) => sum + t.amount, 0)
    },
    cash: {
      count: transactions.filter(t => t.paymentMethod === 'cash').length,
      amount: transactions.filter(t => t.paymentMethod === 'cash').reduce((sum, t) => sum + t.amount, 0)
    },
    other: {
      count: transactions.filter(t => t.paymentMethod === 'other').length,
      amount: transactions.filter(t => t.paymentMethod === 'other').reduce((sum, t) => sum + t.amount, 0)
    }
  };

  // Customer analytics
  const newCustomers = customers.filter(c => c.isNew).length;
  const oldCustomers = customers.filter(c => !c.isNew).length;
  const totalCustomers = customers.length;

  // Recent transactions with customer details
  const recentTransactionsWithDetails = transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .map(transaction => {
      const customer = getCustomerById(transaction.customerId);
      return {
        ...transaction,
        customerDetails: customer || {
          name: transaction.customerName || 'Unknown',
          phone: transaction.customerPhone || 'Unknown',
          isNew: transaction.isNewCustomer === 'true'
        }
      };
    });

  // Filter transactions based on search
  const filteredTransactions = recentTransactionsWithDetails.filter(transaction => {
    const searchContent = `${transaction.shopName} ${transaction.customerDetails.name} ${transaction.customerDetails.phone}`.toLowerCase();
    return searchContent.includes(searchTerm.toLowerCase());
  });

  // Pagination for filtered transactions
  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = filteredTransactions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const generatePageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      const halfVisible = Math.floor(maxVisiblePages / 2);
      let startPage = Math.max(1, currentPage - halfVisible);
      let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
      
      if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }
      
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
    }
    
    return pages;
  };

  const handlePaymentStatusToggle = async (transactionId: string, currentStatus: 'paid' | 'pending') => {
    try {
      const newStatus = currentStatus === 'paid' ? 'pending' : 'paid';
      await updateTransaction(transactionId, { paymentStatus: newStatus });
      toast.success(`Payment status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update payment status:', error);
      toast.error('Failed to update payment status');
    }
  };

  const handleEditSuccess = () => {
    setEditingTransaction(null);
  };

  // Chart data for financial overview
  const financialOverviewData = [
    { name: 'Total Revenue', value: totalRevenue, color: '#10b981' },
    { name: 'Total Expenses', value: totalExpenses, color: '#ef4444' },
    { name: 'Delivery Charges', value: totalDeliveryCharges, color: '#3b82f6' },
    { name: 'Commission', value: totalCommission, color: '#8b5cf6' }
  ];

  const paymentMethodChartData = [
    { name: 'UPI', value: paymentMethodStats.upi.amount, count: paymentMethodStats.upi.count, color: '#10b981' },
    { name: 'Cash', value: paymentMethodStats.cash.amount, count: paymentMethodStats.cash.count, color: '#f59e0b' },
    { name: 'Other', value: paymentMethodStats.other.amount, count: paymentMethodStats.other.count, color: '#8b5cf6' }
  ];

  // Daily revenue vs expenses for last 7 days
  const getDailyFinancials = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dailyTransactions = transactions.filter(t => 
        new Date(t.date).toISOString().split('T')[0] === dateStr
      );
      
      const dailyExpenses = expenses.filter(e => 
        new Date(e.date).toISOString().split('T')[0] === dateStr
      );
      
      const revenue = dailyTransactions.reduce((sum, t) => sum + t.amount, 0);
      const expense = dailyExpenses.reduce((sum, e) => sum + e.amount, 0);
      const deliveryCharges = dailyTransactions.reduce((sum, t) => sum + (t.deliveryCharge || 0), 0);
      const commission = dailyTransactions.reduce((sum, t) => sum + (t.commission || 0), 0);
      
      data.push({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue,
        expense,
        deliveryCharges,
        commission,
        profit: revenue - expense
      });
    }
    
    return data;
  };

  const dailyFinancialData = getDailyFinancials();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Financial Analytics Dashboard</h1>
            <p className="text-gray-600">Comprehensive business insights and transaction analysis</p>
          </div>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
            Admin View
          </Badge>
        </div>

        {/* Enhanced Financial Overview Cards */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <IndianRupee className="h-4 w-4 text-green-600" />
                <span className="truncate">Total Revenue</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-600">₹{totalRevenue.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                From {dashboardStats.totalTransactions} transactions
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-red-600" />
                <span className="truncate">Total Expenses</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-red-600">₹{totalExpenses.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                From {expenses.length} expense entries
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Wallet className="h-4 w-4 text-blue-600" />
                <span className="truncate">Net Income</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-xl sm:text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{netIncome.toLocaleString('en-IN')}
              </div>
              <p className="text-xs text-muted-foreground">
                Revenue - Expenses
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Truck className="h-4 w-4 text-purple-600" />
                <span className="truncate">Delivery Charges</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-600">₹{totalDeliveryCharges.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                Total delivery income
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <span className="truncate">Commission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-indigo-600">₹{totalCommission.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                Total commission earned
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-amber-600" />
                <span className="truncate">Pending Amount</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-amber-600">₹{dashboardStats.pendingAmount.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                {dashboardStats.pendingOrders} pending payments
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="financial-overview" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-6 min-w-max">
              <TabsTrigger value="financial-overview" className="text-xs sm:text-sm">Financial Overview</TabsTrigger>
              <TabsTrigger value="daily" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Daily Analytics</span>
                <span className="sm:hidden">Daily</span>
              </TabsTrigger>
              <TabsTrigger value="transactions" className="text-xs sm:text-sm">All Transactions</TabsTrigger>
              <TabsTrigger value="payment-methods" className="text-xs sm:text-sm">Payment Methods</TabsTrigger>
              <TabsTrigger value="customers" className="text-xs sm:text-sm">Customers</TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Expenses</span>
                <span className="sm:hidden">Exp</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="financial-overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <BarChart className="h-5 w-5" />
                    Daily Revenue vs Expenses (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={dailyFinancialData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis dataKey="date" fontSize={12} />
                      <YAxis fontSize={12} />
                      <Tooltip 
                        formatter={(value, name) => [`₹${Number(value).toLocaleString('en-IN')}`, name]}
                        labelStyle={{ fontSize: '12px' }}
                        contentStyle={{ fontSize: '12px' }}
                      />
                      <Area type="monotone" dataKey="revenue" stackId="1" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="expense" stackId="1" stroke="#ef4444" fill="#ef4444" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Financial Breakdown
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
            </div>

            {/* Financial Summary Cards */}
            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
              <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-green-800">Gross Profit</p>
                      <p className="text-2xl font-bold text-green-900">₹{grossProfit.toLocaleString('en-IN')}</p>
                      <p className="text-xs text-green-600">Delivery + Commission</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-green-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-blue-800">Total Orders</p>
                      <p className="text-2xl font-bold text-blue-900">{dashboardStats.totalOrders}</p>
                      <p className="text-xs text-blue-600">Unique orders</p>
                    </div>
                    <Package className="h-8 w-8 text-blue-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-purple-800">Avg Order Value</p>
                      <p className="text-2xl font-bold text-purple-900">
                        ₹{dashboardStats.totalOrders > 0 ? Math.round(totalRevenue / dashboardStats.totalOrders).toLocaleString('en-IN') : '0'}
                      </p>
                      <p className="text-xs text-purple-600">Per order</p>
                    </div>
                    <IndianRupee className="h-8 w-8 text-purple-600" />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-r from-amber-50 to-amber-100 border-amber-200">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-amber-800">Profit Margin</p>
                      <p className="text-2xl font-bold text-amber-900">
                        {totalRevenue > 0 ? ((grossProfit / totalRevenue) * 100).toFixed(1) : '0'}%
                      </p>
                      <p className="text-xs text-amber-600">Of total revenue</p>
                    </div>
                    <TrendingUp className="h-8 w-8 text-amber-600" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="payment-methods" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Payment Method Distribution</CardTitle>
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
                  <CardTitle className="text-lg sm:text-xl">Payment Method Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(paymentMethodStats).map(([method, stats]) => (
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
                            {totalRevenue > 0 ? ((stats.amount / totalRevenue) * 100).toFixed(1) : '0'}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="daily" className="space-y-4">
            <DailyAnalytics transactions={transactions} customers={customers} />
          </TabsContent>

          <TabsContent value="transactions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">All Transaction Details</CardTitle>
                <CardDescription className="text-sm">
                  Complete details - Page {currentPage} of {totalPages} ({filteredTransactions.length} transactions)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search by shop, customer, phone..."
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchTerm(e.target.value);
                        setCurrentPage(1);
                      }}
                      className="flex-1"
                    />
                  </div>

                  <div className="border rounded-md">
                    <ScrollArea className="w-full">
                      <div className="min-w-[1000px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">Date</TableHead>
                              <TableHead className="w-[120px]">Shop</TableHead>
                              <TableHead className="w-[100px]">Customer</TableHead>
                              <TableHead className="w-[100px]">Phone</TableHead>
                              <TableHead className="w-[80px]">Amount</TableHead>
                              <TableHead className="w-[80px]">Delivery</TableHead>
                              <TableHead className="w-[80px]">Commission</TableHead>
                              <TableHead className="w-[100px]">Status</TableHead>
                              <TableHead className="w-[80px]">Method</TableHead>
                              <TableHead className="w-[100px]">Handled By</TableHead>
                              <TableHead className="w-[60px]">Actions</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {currentTransactions.map((transaction) => (
                              <TableRow key={transaction.id}>
                                <TableCell className="text-xs">
                                  {new Date(transaction.date).toLocaleDateString('en-IN')}
                                </TableCell>
                                <TableCell className="font-medium text-xs">
                                  <div className="max-w-[100px] truncate" title={transaction.shopName}>
                                    {transaction.shopName}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <div className="flex flex-col gap-1">
                                    <span className="flex items-center gap-1 text-xs">
                                      <User className="h-3 w-3" />
                                      <span className="max-w-[80px] truncate" title={transaction.customerDetails.name}>
                                        {transaction.customerDetails.name}
                                      </span>
                                    </span>
                                    {transaction.customerDetails.isNew && (
                                      <Badge variant="outline" className="w-fit text-xs py-0 px-1">
                                        New
                                      </Badge>
                                    )}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="flex items-center gap-1 text-xs">
                                    <Phone className="h-3 w-3" />
                                    <span className="max-w-[80px] truncate" title={transaction.customerDetails.phone}>
                                      {transaction.customerDetails.phone}
                                    </span>
                                  </span>
                                </TableCell>
                                <TableCell className="text-xs font-medium text-green-600">
                                  ₹{transaction.amount.toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell className="text-xs font-medium text-blue-600">
                                  ₹{(transaction.deliveryCharge || 0).toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell className="text-xs font-medium text-purple-600">
                                  ₹{(transaction.commission || 0).toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-1">
                                    <Badge
                                      variant={transaction.paymentStatus === 'paid' ? 'default' : 'destructive'}
                                      className="text-xs"
                                    >
                                      {transaction.paymentStatus}
                                    </Badge>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handlePaymentStatusToggle(transaction.id, transaction.paymentStatus)}
                                      className="h-6 w-6 p-0"
                                    >
                                      {transaction.paymentStatus === 'paid' ? (
                                        <Clock className="h-3 w-3 text-amber-600" />
                                      ) : (
                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                      )}
                                    </Button>
                                  </div>
                                </TableCell>
                                <TableCell className="capitalize text-xs">
                                  {transaction.paymentMethod}
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground">
                                  <div className="max-w-[80px] truncate" title={transaction.handledBy}>
                                    {transaction.handledBy}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setEditingTransaction(transaction)}
                                    className="h-6 w-6 p-0"
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </ScrollArea>
                  </div>

                  {totalPages > 1 && (
                    <div className="flex justify-center">
                      <Pagination>
                        <PaginationContent>
                          <PaginationItem>
                            <PaginationPrevious 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage > 1) handlePageChange(currentPage - 1);
                              }}
                              className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                          
                          {generatePageNumbers().map((pageNum) => (
                            <PaginationItem key={pageNum}>
                              <PaginationLink
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handlePageChange(pageNum);
                                }}
                                isActive={pageNum === currentPage}
                                className="text-sm"
                              >
                                {pageNum}
                              </PaginationLink>
                            </PaginationItem>
                          ))}
                          
                          {totalPages > 5 && currentPage < totalPages - 2 && (
                            <PaginationItem>
                              <PaginationEllipsis />
                            </PaginationItem>
                          )}
                          
                          <PaginationItem>
                            <PaginationNext 
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                if (currentPage < totalPages) handlePageChange(currentPage + 1);
                              }}
                              className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                            />
                          </PaginationItem>
                        </PaginationContent>
                      </Pagination>
                    </div>
                  )}

                  <div className="text-center text-sm text-muted-foreground">
                    Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Customer Analytics</CardTitle>
                <CardDescription>
                  Detailed breakdown of customer information
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-3 mb-6">
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-green-600">{newCustomers}</div>
                    <div className="text-sm text-green-600">New Customers</div>
                    <div className="text-xs text-muted-foreground">
                      {totalCustomers > 0 ? Math.round((newCustomers / totalCustomers) * 100) : 0}% of total
                    </div>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-blue-600">{oldCustomers}</div>
                    <div className="text-sm text-blue-600">Returning</div>
                    <div className="text-xs text-muted-foreground">
                      {totalCustomers > 0 ? Math.round((oldCustomers / totalCustomers) * 100) : 0}% of total
                    </div>
                  </div>
                  <div className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-xl sm:text-2xl font-bold text-gray-600">{totalCustomers}</div>
                    <div className="text-sm text-gray-600">Total</div>
                    <div className="text-xs text-muted-foreground">
                      All customers
                    </div>
                  </div>
                </div>

                <div className="border rounded-md">
                  <ScrollArea className="w-full">
                    <div className="min-w-[600px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Email</TableHead>
                            <TableHead>Address</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {customers.map((customer) => (
                            <TableRow key={customer.id}>
                              <TableCell className="font-medium text-sm">
                                <div className="max-w-[120px] truncate" title={customer.name}>
                                  {customer.name}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">{customer.phone}</TableCell>
                              <TableCell className="text-sm">
                                <div className="max-w-[150px] truncate" title={customer.email || '-'}>
                                  {customer.email || '-'}
                                </div>
                              </TableCell>
                              <TableCell className="text-sm">
                                <div className="max-w-[150px] truncate" title={customer.address || '-'}>
                                  {customer.address || '-'}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant={customer.isNew ? 'default' : 'outline'} className="text-xs">
                                  {customer.isNew ? 'New' : 'Returning'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-sm text-muted-foreground">
                                {new Date(customer.createdAt).toLocaleDateString('en-IN')}
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

          <TabsContent value="expenses" className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold">Expense Management</h2>
                <p className="text-muted-foreground text-sm">Add and manage business expenses</p>
              </div>
              <Button onClick={() => setShowAddExpense(true)} className="flex items-center gap-2 w-full sm:w-auto">
                <Plus className="h-4 w-4" />
                Add Expense
              </Button>
            </div>

            {showAddExpense && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Add New Expense</CardTitle>
                  <CardDescription>Enter expense details below</CardDescription>
                </CardHeader>
                <CardContent>
                  <AddExpenseForm onClose={() => setShowAddExpense(false)} />
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Recent Expenses</CardTitle>
                <CardDescription>
                  All business expenses ({expenses.length} total) - Total: ₹{totalExpenses.toLocaleString('en-IN')}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md">
                  <ScrollArea className="w-full">
                    <div className="min-w-[700px]">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Added By</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {expenses
                            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                            .map((expense) => (
                              <TableRow key={expense.id}>
                                <TableCell className="text-sm">
                                  {new Date(expense.date).toLocaleDateString('en-IN')}
                                </TableCell>
                                <TableCell className="font-medium text-sm">
                                  <div className="max-w-[120px] truncate" title={expense.title}>
                                    {expense.title}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">{expense.category}</Badge>
                                </TableCell>
                                <TableCell className="text-sm font-medium text-red-600">
                                  ₹{expense.amount.toLocaleString('en-IN')}
                                </TableCell>
                                <TableCell className="text-sm">
                                  <div className="max-w-[200px] truncate" title={expense.description || '-'}>
                                    {expense.description || '-'}
                                  </div>
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                  <div className="max-w-[100px] truncate" title={expense.addedBy}>
                                    {expense.addedBy}
                                  </div>
                                </TableCell>
                              </TableRow>
                            ))}
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </div>

                {expenses.length === 0 && (
                  <div className="text-center py-8">
                    <Receipt className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No expenses recorded yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Transaction Dialog */}
        <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
            <DialogHeader>
              <DialogTitle>Edit Transaction</DialogTitle>
            </DialogHeader>
            {editingTransaction && (
              <EditTransactionForm 
                transaction={editingTransaction}
                onSuccess={handleEditSuccess}
                onCancel={() => setEditingTransaction(null)}
              />
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default AdminAnalytics;
