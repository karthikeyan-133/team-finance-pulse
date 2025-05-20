import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
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

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { dashboardStats, isLoading, transactions, expenses, totalAmount, pendingAmount, customers } = useData();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-[200px] w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Calculate daily transaction totals for the last 7 days
  const getDailyData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toISOString().split('T')[0];
      
      // Get transactions for this date
      const dailyTransactions = transactions.filter(t => 
        new Date(t.date).toISOString().split('T')[0] === dateStr
      );
      
      // Calculate total
      const total = dailyTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        total
      });
    }
    
    return data;
  };

  // Calculate data for payment status pie chart
  const getPaymentStatusData = () => {
    const paid = transactions.filter(t => t.paymentStatus === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);
    
    return [
      { name: 'Paid', value: paid },
      { name: 'Pending', value: pendingAmount }
    ];
  };

  // New: Calculate monthly data
  const getMonthlyData = () => {
    const data = [];
    const today = new Date();
    const currentYear = today.getFullYear();
    
    // Get last 6 months
    for (let i = 5; i >= 0; i--) {
      const month = new Date(currentYear, today.getMonth() - i, 1);
      const monthName = month.toLocaleDateString('en-US', { month: 'short' });
      const monthYear = `${monthName} ${month.getFullYear()}`;
      
      // Get transactions for this month
      const monthTransactions = transactions.filter(t => {
        const tDate = new Date(t.date);
        return tDate.getMonth() === month.getMonth() && tDate.getFullYear() === month.getFullYear();
      });
      
      // Calculate total
      const total = monthTransactions.reduce((sum, t) => sum + t.amount, 0);
      
      data.push({
        month: monthName,
        total
      });
    }
    
    return data;
  };

  // Calculate customer statistics
  const customerStats = {
    total: customers.length,
    new: customers.filter(c => c.isNew).length,
    returning: customers.filter(c => !c.isNew).length
  };

  // Calculate commission statistics
  const commissionStats = {
    total: transactions.reduce((sum, t) => sum + (t.commission || 0), 0),
    paid: transactions.filter(t => t.commissionStatus === 'paid')
      .reduce((sum, t) => sum + (t.commission || 0), 0),
    pending: transactions.filter(t => t.commissionStatus === 'pending')
      .reduce((sum, t) => sum + (t.commission || 0), 0)
  };

  // Calculate payment method statistics
  const paymentMethodStats = {
    cash: transactions.filter(t => t.paymentMethod === 'cash')
      .reduce((sum, t) => sum + t.amount, 0),
    upi: transactions.filter(t => t.paymentMethod === 'upi')
      .reduce((sum, t) => sum + t.amount, 0),
    other: transactions.filter(t => t.paymentMethod === 'other')
      .reduce((sum, t) => sum + t.amount, 0)
  };

  const dailyData = getDailyData();
  const monthlyData = getMonthlyData();
  const paymentStatusData = getPaymentStatusData();
  const COLORS = ['#4ade80', '#fb7185'];
  const PAYMENT_METHOD_COLORS = ['#4ade80', '#60a5fa', '#f97316'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back, {user?.name} {user?.role === 'admin' && "(Admin View)"}
        </div>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{totalAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.length} transactions total
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{pendingAmount.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              {transactions.filter(t => t.paymentStatus === 'pending').length} transactions pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Commission</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{commissionStats.total.toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              From all transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ₹{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString('en-IN')}
            </div>
            <p className="text-xs text-muted-foreground">
              {expenses.length} expense entries
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Admin Section - Only visible to admins */}
      {user?.role === 'admin' && (
        <div className="p-4 border border-dashed rounded-lg border-gray-300 bg-slate-50">
          <h2 className="text-xl font-bold mb-4">Admin Analytics</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {/* Customer Statistics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Customer Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Customers:</span>
                    <span className="font-bold">{customerStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">New Customers:</span>
                    <span className="font-bold text-green-600">{customerStats.new}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Returning Customers:</span>
                    <span className="font-bold text-blue-600">{customerStats.returning}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">New Customer %:</span>
                    <span className="font-bold">
                      {customerStats.total > 0 
                        ? `${Math.round((customerStats.new / customerStats.total) * 100)}%` 
                        : '0%'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Statistics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Commission Analytics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total Commission:</span>
                    <span className="font-bold">₹{commissionStats.total.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Paid Commission:</span>
                    <span className="font-bold text-green-600">₹{commissionStats.paid.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Pending Commission:</span>
                    <span className="font-bold text-amber-600">₹{commissionStats.pending.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Collection Rate:</span>
                    <span className="font-bold">
                      {commissionStats.total > 0 
                        ? `${Math.round((commissionStats.paid / commissionStats.total) * 100)}%` 
                        : '0%'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Payment Method Statistics */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Payment Methods</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Cash Payments:</span>
                    <span className="font-bold">₹{paymentMethodStats.cash.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">UPI Payments:</span>
                    <span className="font-bold">₹{paymentMethodStats.upi.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Other Payments:</span>
                    <span className="font-bold">₹{paymentMethodStats.other.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Total:</span>
                    <span className="font-bold">₹{totalAmount.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Transaction Trends</CardTitle>
            <CardDescription>Daily transaction amounts for the past week</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dailyData}>
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

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Payment Status</CardTitle>
            <CardDescription>Distribution of paid vs pending payments</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={paymentStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {paymentStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="mt-2 flex justify-center gap-4">
              <div className="flex items-center">
                <span className="mr-1 h-3 w-3 rounded-full bg-[#4ade80]"></span>
                <span className="text-sm text-muted-foreground">Paid</span>
              </div>
              <div className="flex items-center">
                <span className="mr-1 h-3 w-3 rounded-full bg-[#fb7185]"></span>
                <span className="text-sm text-muted-foreground">Pending</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Monthly data chart - Only visible to admins */}
      {user?.role === 'admin' && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Transaction Summary</CardTitle>
            <CardDescription>Total transaction amounts for the past 6 months</CardDescription>
          </CardHeader>
          <CardContent className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`₹${Number(value).toLocaleString('en-IN')}`, 'Amount']}
                />
                <Bar dataKey="total" fill="#8884d8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Transactions</CardTitle>
            <CardDescription>Latest 5 transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.recentTransactions.map(transaction => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{transaction.shopName}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className={`text-sm font-medium ${
                      transaction.paymentStatus === 'paid' ? 'text-green-500' : 'text-red-500'
                    }`}>
                      ₹{transaction.amount.toLocaleString('en-IN')}
                    </div>
                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${
                      transaction.paymentStatus === 'paid' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {transaction.paymentStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Recent Expenses</CardTitle>
            <CardDescription>Latest 5 expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardStats.recentExpenses.map(expense => (
                <div key={expense.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">{expense.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {expense.category} • {new Date(expense.date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-sm font-medium">
                    ₹{expense.amount.toLocaleString('en-IN')}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
