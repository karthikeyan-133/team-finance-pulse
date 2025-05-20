import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useData } from '../context/DataContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Reports: React.FC = () => {
  const { transactions, customers, expenses } = useData();

  // Calculate monthly sales data
  const calculateMonthlySales = () => {
    const salesByMonth: Record<string, { total: number; count: number; paid: number; pending: number }> = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const month = date.toLocaleString('default', { month: 'long' });
      const year = date.getFullYear();
      const key = `${month} ${year}`;
      
      if (!salesByMonth[key]) {
        salesByMonth[key] = {
          total: 0,
          count: 0,
          paid: 0,
          pending: 0
        };
      }
      
      salesByMonth[key].total += transaction.amount;
      salesByMonth[key].count += 1;
      
      if (transaction.paymentStatus === 'paid') {
        salesByMonth[key].paid += transaction.amount;
      } else {
        salesByMonth[key].pending += transaction.amount;
      }
    });
    
    return Object.entries(salesByMonth).map(([month, data]) => ({
      month,
      total: data.total,
      count: data.count,
      paid: data.paid,
      pending: data.pending
    })).sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      return new Date(`${aMonth} 1, ${aYear}`).getTime() - new Date(`${bMonth} 1, ${bYear}`).getTime();
    });
  };

  // Calculate customer metrics
  const calculateCustomerMetrics = () => {
    const newCustomers = customers.filter(c => c.isNew).length;
    const returningCustomers = customers.length - newCustomers;
    
    return {
      total: customers.length,
      new: newCustomers,
      returning: returningCustomers,
      newPercentage: customers.length > 0 ? Math.round((newCustomers / customers.length) * 100) : 0
    };
  };

  // Calculate payment method distribution
  const calculatePaymentMethodDistribution = () => {
    const methods = {
      cash: 0,
      upi: 0,
      other: 0
    };
    
    transactions.forEach(t => {
      if (t.paymentMethod === 'cash') {
        methods.cash += t.amount;
      } else if (t.paymentMethod === 'upi') {
        methods.upi += t.amount;
      } else {
        methods.other += t.amount;
      }
    });
    
    return methods;
  };

  // Format date for export filename
  const formatDateForFilename = () => {
    const date = new Date();
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  // Generate CSV data for export
  const generateCsvData = (data: any[], type: string) => {
    let csvContent = '';
    
    if (type === 'transactions') {
      csvContent = 'Date,Shop Name,Customer ID,Amount,Payment Status,Payment Method,Commission,Commission Status\n';
      data.forEach(t => {
        csvContent += `${new Date(t.date).toLocaleDateString()},${t.shopName},${t.customerId},${t.amount},${t.paymentStatus},${t.paymentMethod},${t.commission || 0},${t.commissionStatus || 'N/A'}\n`;
      });
    } else if (type === 'customers') {
      csvContent = 'Name,Phone,Email,Address,Status,Created At\n';
      data.forEach(c => {
        csvContent += `${c.name},${c.phone},${c.email || 'N/A'},${c.address || 'N/A'},${c.isNew ? 'New' : 'Returning'},${new Date(c.createdAt).toLocaleDateString()}\n`;
      });
    } else if (type === 'expenses') {
      csvContent = 'Date,Title,Amount,Category,Description,Added By\n';
      data.forEach(e => {
        csvContent += `${new Date(e.date).toLocaleDateString()},${e.title},${e.amount},${e.category},${e.description || 'N/A'},${e.addedBy}\n`;
      });
    }
    
    return csvContent;
  };

  // Handle export data to CSV
  const handleExport = (type: string) => {
    let data;
    let filename;
    
    if (type === 'transactions') {
      data = generateCsvData(transactions, 'transactions');
      filename = `transactions_${formatDateForFilename()}.csv`;
    } else if (type === 'customers') {
      data = generateCsvData(customers, 'customers');
      filename = `customers_${formatDateForFilename()}.csv`;
    } else if (type === 'expenses') {
      data = generateCsvData(expenses, 'expenses');
      filename = `expenses_${formatDateForFilename()}.csv`;
    }
    
    const blob = new Blob([data as BlobPart], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename as string);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const monthlySales = calculateMonthlySales();
  const customerMetrics = calculateCustomerMetrics();
  const paymentMethods = calculatePaymentMethodDistribution();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
      </div>

      <Tabs defaultValue="summary" className="w-full">
        <TabsList>
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="space-y-4 pt-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ₹{transactions.reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {transactions.length} transactions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-600">
                  ₹{transactions.filter(t => t.paymentStatus === 'pending').reduce((sum, t) => sum + t.amount, 0).toLocaleString('en-IN')}
                </div>
                <p className="text-xs text-muted-foreground">
                  From {transactions.filter(t => t.paymentStatus === 'pending').length} transactions
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Customer Base</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {customers.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  {customerMetrics.new} new, {customerMetrics.returning} returning
                </p>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Monthly Sales Summary</CardTitle>
              <CardDescription>Revenue breakdown by month</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Month</TableHead>
                    <TableHead>Transactions</TableHead>
                    <TableHead>Total Amount</TableHead>
                    <TableHead>Paid Amount</TableHead>
                    <TableHead>Pending Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {monthlySales.map((month) => (
                    <TableRow key={month.month}>
                      <TableCell className="font-medium">{month.month}</TableCell>
                      <TableCell>{month.count}</TableCell>
                      <TableCell>₹{month.total.toLocaleString('en-IN')}</TableCell>
                      <TableCell>₹{month.paid.toLocaleString('en-IN')}</TableCell>
                      <TableCell>₹{month.pending.toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Customer Analytics</CardTitle>
                <CardDescription>Distribution of customer types</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Total Customers:</span>
                    <span className="font-bold">{customerMetrics.total}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>New Customers:</span>
                    <span className="font-bold text-green-600">{customerMetrics.new} ({customerMetrics.newPercentage}%)</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Returning Customers:</span>
                    <span className="font-bold text-blue-600">{customerMetrics.returning} ({100 - customerMetrics.newPercentage}%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Payment Methods</CardTitle>
                <CardDescription>Distribution by payment type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Cash:</span>
                    <span className="font-bold">₹{paymentMethods.cash.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>UPI:</span>
                    <span className="font-bold">₹{paymentMethods.upi.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Other:</span>
                    <span className="font-bold">₹{paymentMethods.other.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Transaction Report</CardTitle>
                <CardDescription>Comprehensive transaction history</CardDescription>
              </div>
              <Button size="sm" onClick={() => handleExport('transactions')} className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Shop</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Payment Method</TableHead>
                    <TableHead>Commission</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.slice(0, 10).map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>{new Date(transaction.date).toLocaleDateString()}</TableCell>
                      <TableCell>{transaction.shopName}</TableCell>
                      <TableCell>₹{transaction.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          transaction.paymentStatus === 'paid' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {transaction.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.paymentMethod}</TableCell>
                      <TableCell>₹{(transaction.commission || 0).toLocaleString('en-IN')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {transactions.length > 10 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Showing 10 of {transactions.length} transactions. Export to CSV for full data.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="customers" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Customer Report</CardTitle>
                <CardDescription>Comprehensive customer data</CardDescription>
              </div>
              <Button size="sm" onClick={() => handleExport('customers')} className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contact</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Since</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.slice(0, 10).map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.name}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>
                        <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                          customer.isNew 
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {customer.isNew ? 'New' : 'Returning'}
                        </span>
                      </TableCell>
                      <TableCell>{customer.address || 'N/A'}</TableCell>
                      <TableCell>{new Date(customer.createdAt).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {customers.length > 10 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Showing 10 of {customers.length} customers. Export to CSV for full data.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expenses" className="pt-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Expense Report</CardTitle>
                <CardDescription>Comprehensive expense history</CardDescription>
              </div>
              <Button size="sm" onClick={() => handleExport('expenses')} className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {expenses.slice(0, 10).map((expense) => (
                    <TableRow key={expense.id}>
                      <TableCell>{new Date(expense.date).toLocaleDateString()}</TableCell>
                      <TableCell>{expense.title}</TableCell>
                      <TableCell>{expense.category}</TableCell>
                      <TableCell>₹{expense.amount.toLocaleString('en-IN')}</TableCell>
                      <TableCell className="max-w-xs truncate">{expense.description || 'N/A'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {expenses.length > 10 && (
                <div className="mt-4 text-center text-sm text-muted-foreground">
                  Showing 10 of {expenses.length} expenses. Export to CSV for full data.
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Reports;
