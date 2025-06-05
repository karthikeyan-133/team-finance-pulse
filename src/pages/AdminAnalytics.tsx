import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
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
  Clock
} from 'lucide-react';
import DailyAnalytics from '../components/analytics/DailyAnalytics';
import { toast } from '@/components/ui/sonner';

const AdminAnalytics = () => {
  const { user } = useAuth();
  const { transactions, customers, getCustomerById, dashboardStats, updateTransaction } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
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
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Admin Analytics</h1>
        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
          Admin View
        </Badge>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4" />
              Total Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              Unique submissions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTransactions}</div>
            <p className="text-xs text-muted-foreground">
              ₹{totalRevenue.toLocaleString('en-IN')} total revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Pending Amount
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              {pendingOrders} pending orders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Total Customers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {newCustomers} new, {oldCustomers} returning
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Total Commission
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalCommission.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              From all orders
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList>
          <TabsTrigger value="daily">
            <Calendar className="h-4 w-4 mr-2" />
            Daily Analytics
          </TabsTrigger>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="transactions">All Transactions</TabsTrigger>
          <TabsTrigger value="customers">Customer Details</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <DailyAnalytics transactions={transactions} customers={customers} />
        </TabsContent>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Daily Sales (Last 7 Days)</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={dailySalesData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                    />
                    <Bar dataKey="total" fill="#6950dd" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Customer Distribution</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={customerChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
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
                <div className="mt-2 flex justify-center gap-4">
                  <div className="flex items-center">
                    <span className="mr-1 h-3 w-3 rounded-full bg-[#4ade80]"></span>
                    <span className="text-sm">New ({newCustomers})</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-1 h-3 w-3 rounded-full bg-[#60a5fa]"></span>
                    <span className="text-sm">Old ({oldCustomers})</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>All Transaction Details</CardTitle>
              <CardDescription>
                Complete details of all delivery transactions - Page {currentPage} of {totalPages} ({filteredTransactions.length} total transactions)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by shop, customer name, or phone..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Reset to first page when searching
                    }}
                    className="max-w-sm"
                  />
                </div>

                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Shop</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Commission</TableHead>
                        <TableHead>Handled By</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentTransactions.map((transaction) => (
                        <TableRow key={transaction.id}>
                          <TableCell>
                            {new Date(transaction.date).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="font-medium">
                            {transaction.shopName}
                          </TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="flex items-center gap-1">
                                <User className="h-3 w-3" />
                                {transaction.customerDetails.name}
                              </span>
                              {transaction.customerDetails.isNew && (
                                <Badge variant="outline" className="mt-1 w-fit text-xs">
                                  New
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <span className="flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              {transaction.customerDetails.phone}
                            </span>
                          </TableCell>
                          <TableCell>
                            {transaction.customerLocation && (
                              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                <MapPin className="h-3 w-3" />
                                {transaction.customerLocation.substring(0, 20)}...
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            ₹{transaction.amount.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Badge
                                variant={transaction.paymentStatus === 'paid' ? 'default' : 'destructive'}
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
                          <TableCell className="capitalize">
                            {transaction.paymentMethod}
                          </TableCell>
                          <TableCell>
                            {transaction.commission ? `₹${transaction.commission}` : '-'}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {transaction.handledBy}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {totalPages > 1 && (
                  <div className="mt-4 flex justify-center">
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

                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredTransactions.length)} of {filteredTransactions.length} transactions
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Analytics</CardTitle>
              <CardDescription>
                Detailed breakdown of customer information
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3 mb-6">
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{newCustomers}</div>
                  <div className="text-sm text-green-600">New Customers</div>
                  <div className="text-xs text-muted-foreground">
                    {totalCustomers > 0 ? Math.round((newCustomers / totalCustomers) * 100) : 0}% of total
                  </div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{oldCustomers}</div>
                  <div className="text-sm text-blue-600">Returning Customers</div>
                  <div className="text-xs text-muted-foreground">
                    {totalCustomers > 0 ? Math.round((oldCustomers / totalCustomers) * 100) : 0}% of total
                  </div>
                </div>
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">{totalCustomers}</div>
                  <div className="text-sm text-gray-600">Total Customers</div>
                  <div className="text-xs text-muted-foreground">
                    All time customers
                  </div>
                </div>
              </div>

              <div className="rounded-md border">
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
                        <TableCell className="font-medium">{customer.name}</TableCell>
                        <TableCell>{customer.phone}</TableCell>
                        <TableCell>{customer.email || '-'}</TableCell>
                        <TableCell>{customer.address || '-'}</TableCell>
                        <TableCell>
                          <Badge variant={customer.isNew ? 'default' : 'outline'}>
                            {customer.isNew ? 'New' : 'Returning'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {new Date(customer.createdAt).toLocaleDateString()}
                        </TableCell>
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

export default AdminAnalytics;
