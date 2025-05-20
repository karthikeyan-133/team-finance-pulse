
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
  const { dashboardStats, isLoading, transactions, expenses, totalAmount, pendingAmount } = useData();

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

  const dailyData = getDailyData();
  const paymentStatusData = getPaymentStatusData();
  const COLORS = ['#4ade80', '#fb7185'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <div className="text-sm text-muted-foreground">
          Welcome back, {user?.name}
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
              ₹{dashboardStats.totalCommission.toLocaleString('en-IN')}
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
