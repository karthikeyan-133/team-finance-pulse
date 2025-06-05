
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
  Cell
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
  Edit
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

  // Calculate analytics using dashboardStats
  const totalOrders = dashboardStats.totalOrders;
  const totalTransactions = dashboardStats.totalTransactions;
  const totalRevenue = dashboardStats.totalRevenue;
  const pendingAmount = dashboardStats.pendingAmount;
  const totalCommission = dashboardStats.totalCommission;
  const pendingOrders = dashboardStats.pendingOrders;

  // Customer analytics
  const newCustomers = customers.filter(c => c.isNew).length;
  const oldCustomers = customers.filter(c => !c.isNew).length;
  const totalCustomers = customers.length;

  // Payment method distribution
  const paymentMethods = {
    upi: transactions.filter(t => t.paymentMethod === 'upi').length,
    cash: transactions.filter(t => t.paymentMethod === 'cash').length,
    other: transactions.filter(t => t.paymentMethod === 'other').length,
  };

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

  // Chart data
  const customerChartData = [
    { name: 'New Customers', value: newCustomers, color: '#4ade80' },
    { name: 'Old Customers', value: oldCustomers, color: '#60a5fa' }
  ];

  const paymentMethodData = [
    { name: 'UPI', value: paymentMethods.upi, color: '#4ade80' },
    { name: 'Cash', value: paymentMethods.cash, color: '#f97316' },
    { name: 'Other', value: paymentMethods.other, color: '#8b5cf6' }
  ];

  // Daily sales for last 7 days
  const getDailySales = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dailyTransactions = transactions.filter(t => 
        new Date(t.date).toISOString().split('T')[0] === dateStr
      );
      
      const total = dailyTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        total,
        count: dailyTransactions.length
      });
    }
    
    return data;
  };

  const dailySalesData = getDailySales();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Admin Analytics</h1>
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
            Admin View
          </Badge>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Package className="h-4 w-4 text-blue-600" />
                <span className="truncate">Total Orders</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{totalOrders}</div>
              <p className="text-xs text-muted-foreground">
                Unique submissions
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="truncate">Transactions</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                ₹{totalRevenue.toLocaleString('en-IN')} revenue
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
              <div className="text-xl sm:text-2xl font-bold">₹{pendingAmount.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                {pendingOrders} pending orders
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-600" />
                <span className="truncate">Total Customers</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">{totalCustomers}</div>
              <p className="text-xs text-muted-foreground">
                {newCustomers} new, {oldCustomers} returning
              </p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow sm:col-span-2 lg:col-span-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-indigo-600" />
                <span className="truncate">Commission</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold">₹{totalCommission.toLocaleString('en-IN')}</div>
              <p className="text-xs text-muted-foreground">
                From all orders
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="daily" className="w-full">
          <div className="overflow-x-auto">
            <TabsList className="grid w-full grid-cols-5 min-w-max">
              <TabsTrigger value="daily" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Daily Analytics</span>
                <span className="sm:hidden">Daily</span>
              </TabsTrigger>
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="transactions" className="text-xs sm:text-sm">Transactions</TabsTrigger>
              <TabsTrigger value="customers" className="text-xs sm:text-sm">Customers</TabsTrigger>
              <TabsTrigger value="expenses" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Receipt className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Expenses</span>
                <span className="sm:hidden">Exp</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="daily" className="space-y-4">
            <DailyAnalytics transactions={transactions} customers={customers} />
          </TabsContent>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 grid-cols-1 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Daily Sales (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={dailySalesData}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                      <XAxis 
                        dataKey="date" 
                        fontSize={12}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        fontSize={12}
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                        labelStyle={{ fontSize: '12px' }}
                        contentStyle={{ fontSize: '12px' }}
                      />
                      <Bar dataKey="total" fill="#6950dd" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg sm:text-xl">Customer Distribution</CardTitle>
                </CardHeader>
                <CardContent className="h-[250px] sm:h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={customerChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {customerChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="mt-2 flex justify-center gap-4 text-sm">
                    <div className="flex items-center">
                      <span className="mr-1 h-3 w-3 rounded-full bg-[#4ade80]"></span>
                      <span>New ({newCustomers})</span>
                    </div>
                    <div className="flex items-center">
                      <span className="mr-1 h-3 w-3 rounded-full bg-[#60a5fa]"></span>
                      <span>Old ({oldCustomers})</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
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
                      <div className="min-w-[800px]">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[80px]">Date</TableHead>
                              <TableHead className="w-[120px]">Shop</TableHead>
                              <TableHead className="w-[100px]">Customer</TableHead>
                              <TableHead className="w-[100px]">Phone</TableHead>
                              <TableHead className="w-[120px]">Location</TableHead>
                              <TableHead className="w-[80px]">Amount</TableHead>
                              <TableHead className="w-[100px]">Status</TableHead>
                              <TableHead className="w-[80px]">Method</TableHead>
                              <TableHead className="w-[80px]">Commission</TableHead>
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
                                <TableCell>
                                  {transaction.customerLocation && (
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                      <MapPin className="h-3 w-3" />
                                      <span className="max-w-[100px] truncate" title={transaction.customerLocation}>
                                        {transaction.customerLocation.substring(0, 15)}...
                                      </span>
                                    </span>
                                  )}
                                </TableCell>
                                <TableCell className="text-xs font-medium">
                                  ₹{transaction.amount.toLocaleString('en-IN')}
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
                                <TableCell className="text-xs">
                                  {transaction.commission ? `₹${transaction.commission}` : '-'}
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
                  All business expenses ({expenses.length} total)
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
                                <TableCell className="text-sm font-medium">
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
