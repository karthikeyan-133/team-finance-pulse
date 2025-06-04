
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  TrendingUp, 
  Users, 
  Package,
  Edit,
  Check,
  X
} from 'lucide-react';
import { Transaction, Customer } from '../../types';
import { isSameDay, format, subDays } from 'date-fns';
import { useData } from '../../context/DataContext';
import { toast } from '@/components/ui/sonner';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface DailyAnalyticsProps {
  transactions: Transaction[];
  customers: Customer[];
}

interface OrderGroup {
  orderId: string;
  customerName: string;
  customerPhone: string;
  transactions: Transaction[];
  totalAmount: number;
  overallPaymentStatus: 'paid' | 'pending' | 'mixed';
  createdAt: string;
}

const DailyAnalytics: React.FC<DailyAnalyticsProps> = ({ transactions, customers }) => {
  const { updateTransaction } = useData();
  const [editingOrder, setEditingOrder] = useState<string | null>(null);
  const [updatingTransactions, setUpdatingTransactions] = useState<Set<string>>(new Set());

  const today = new Date();
  const yesterday = subDays(today, 1);

  // Helper function to group transactions into orders
  const groupTransactionsIntoOrders = (transactionList: Transaction[]): OrderGroup[] => {
    const orderMap = new Map<string, OrderGroup>();

    transactionList.forEach(transaction => {
      const key = transaction.orderId || `${transaction.customerName}_${transaction.customerPhone}_${format(new Date(transaction.date), 'yyyy-MM-dd_HH')}`;
      
      if (!orderMap.has(key)) {
        orderMap.set(key, {
          orderId: key,
          customerName: transaction.customerName || 'Unknown',
          customerPhone: transaction.customerPhone || 'Unknown',
          transactions: [],
          totalAmount: 0,
          overallPaymentStatus: 'pending',
          createdAt: transaction.date
        });
      }

      const order = orderMap.get(key)!;
      order.transactions.push(transaction);
      order.totalAmount += transaction.amount;
    });

    // Calculate overall payment status for each order
    orderMap.forEach(order => {
      const paidCount = order.transactions.filter(t => t.paymentStatus === 'paid').length;
      const totalCount = order.transactions.length;
      
      if (paidCount === totalCount) {
        order.overallPaymentStatus = 'paid';
      } else if (paidCount === 0) {
        order.overallPaymentStatus = 'pending';
      } else {
        order.overallPaymentStatus = 'mixed';
      }
    });

    return Array.from(orderMap.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  };

  // Filter transactions for today and yesterday
  const todayTransactions = transactions.filter(transaction => 
    isSameDay(new Date(transaction.date), today)
  );

  const yesterdayTransactions = transactions.filter(transaction => 
    isSameDay(new Date(transaction.date), yesterday)
  );

  // Group transactions into orders
  const todayOrders = groupTransactionsIntoOrders(todayTransactions);
  const yesterdayOrders = groupTransactionsIntoOrders(yesterdayTransactions);

  // Calculate stats
  const todayStats = {
    totalTransactions: todayTransactions.length,
    totalOrders: todayOrders.length,
    totalRevenue: todayTransactions.reduce((sum, t) => sum + t.amount, 0),
    paidOrders: todayOrders.filter(o => o.overallPaymentStatus === 'paid').length,
    pendingOrders: todayOrders.filter(o => o.overallPaymentStatus === 'pending').length,
    mixedOrders: todayOrders.filter(o => o.overallPaymentStatus === 'mixed').length
  };

  const yesterdayStats = {
    totalTransactions: yesterdayTransactions.length,
    totalOrders: yesterdayOrders.length,
    totalRevenue: yesterdayTransactions.reduce((sum, t) => sum + t.amount, 0),
    paidOrders: yesterdayOrders.filter(o => o.overallPaymentStatus === 'paid').length,
    pendingOrders: yesterdayOrders.filter(o => o.overallPaymentStatus === 'pending').length,
    mixedOrders: yesterdayOrders.filter(o => o.overallPaymentStatus === 'mixed').length
  };

  const handleUpdateTransactionStatus = async (transactionId: string, newStatus: 'paid' | 'pending') => {
    setUpdatingTransactions(prev => new Set(prev).add(transactionId));
    
    try {
      await updateTransaction(transactionId, { paymentStatus: newStatus });
      toast.success(`Transaction status updated to ${newStatus}`);
    } catch (error) {
      console.error('Failed to update transaction status:', error);
      toast.error('Failed to update transaction status');
    } finally {
      setUpdatingTransactions(prev => {
        const newSet = new Set(prev);
        newSet.delete(transactionId);
        return newSet;
      });
    }
  };

  const renderOrderDetails = (orders: OrderGroup[]) => (
    <div className="space-y-4">
      {orders.length === 0 ? (
        <p className="text-muted-foreground text-center py-4">No orders found</p>
      ) : (
        orders.map((order) => (
          <Card key={order.orderId} className="border-l-4 border-l-blue-500">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    Order #{order.orderId.substring(0, 8)}...
                  </CardTitle>
                  <CardDescription>
                    {order.customerName} • {order.customerPhone}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={
                    order.overallPaymentStatus === 'paid' ? 'default' :
                    order.overallPaymentStatus === 'pending' ? 'destructive' : 'secondary'
                  }>
                    {order.overallPaymentStatus === 'mixed' ? 'Partial' : order.overallPaymentStatus}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditingOrder(editingOrder === order.orderId ? null : order.orderId)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span>Total Amount:</span>
                  <span className="font-semibold">₹{order.totalAmount.toLocaleString('en-IN')}</span>
                </div>
                
                {editingOrder === order.orderId && (
                  <div className="space-y-2 border-t pt-3">
                    <h4 className="font-medium text-sm">Transaction Details:</h4>
                    {order.transactions.map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{transaction.shopName}</span>
                          <span className="text-xs text-gray-500">₹{transaction.amount}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select
                            value={transaction.paymentStatus}
                            onValueChange={(value: 'paid' | 'pending') => 
                              handleUpdateTransactionStatus(transaction.id, value)
                            }
                            disabled={updatingTransactions.has(transaction.id)}
                          >
                            <SelectTrigger className="w-24 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="pending">Pending</SelectItem>
                            </SelectContent>
                          </Select>
                          {updatingTransactions.has(transaction.id) && (
                            <div className="animate-spin h-4 w-4 border-2 border-gray-300 border-t-blue-600 rounded-full" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground">
                  <div>Transactions: {order.transactions.length}</div>
                  <div>Created: {format(new Date(order.createdAt), 'HH:mm')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Today's Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todayStats.totalOrders}</div>
            <p className="text-xs text-muted-foreground">
              {todayStats.totalTransactions} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Today's Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₹{todayStats.totalRevenue.toLocaleString('en-IN')}</div>
            <p className="text-xs text-muted-foreground">
              Total earnings today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Check className="h-4 w-4" />
              Paid Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{todayStats.paidOrders}</div>
            <p className="text-xs text-muted-foreground">
              Completed payments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <X className="h-4 w-4" />
              Pending Orders
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{todayStats.pendingOrders}</div>
            <p className="text-xs text-muted-foreground">
              Awaiting payment
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="today" className="w-full">
        <TabsList>
          <TabsTrigger value="today">Today's Orders</TabsTrigger>
          <TabsTrigger value="yesterday">Yesterday's Orders</TabsTrigger>
        </TabsList>

        <TabsContent value="today" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Today's Order Details</CardTitle>
              <CardDescription>
                {format(today, 'EEEE, MMMM d, yyyy')} - {todayStats.totalOrders} orders, {todayStats.totalTransactions} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderOrderDetails(todayOrders)}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="yesterday" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Yesterday's Order Details</CardTitle>
              <CardDescription>
                {format(yesterday, 'EEEE, MMMM d, yyyy')} - {yesterdayStats.totalOrders} orders, {yesterdayStats.totalTransactions} transactions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {renderOrderDetails(yesterdayOrders)}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DailyAnalytics;
