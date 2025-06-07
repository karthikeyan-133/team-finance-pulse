
import { useMemo } from 'react';
import { Transaction, Expense, DashboardStats } from '../types';
import { format } from 'date-fns';

export const useDashboardStats = (transactions: Transaction[], expenses: Expense[]) => {
  const dashboardStats = useMemo((): DashboardStats => {
    // Calculate total transactions (all individual records)
    const totalTransactions = transactions.length;

    // Calculate unique orders using improved logic
    const orderGroups = new Map();
    
    transactions.forEach(transaction => {
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

    // Calculate pending orders using the same logic
    const pendingOrderGroups = new Map();
    
    transactions
      .filter(t => t.paymentStatus === 'pending')
      .forEach(transaction => {
        let orderKey;
        
        if (transaction.orderId && transaction.orderId.trim() !== '') {
          orderKey = transaction.orderId;
        } else {
          const transactionDate = new Date(transaction.date);
          const hourKey = format(transactionDate, 'yyyy-MM-dd-HH');
          orderKey = `${transaction.customerId || transaction.customerName || 'unknown'}_${transaction.customerPhone || 'unknown'}_${hourKey}`;
        }
        
        if (!pendingOrderGroups.has(orderKey)) {
          pendingOrderGroups.set(orderKey, []);
        }
        pendingOrderGroups.get(orderKey).push(transaction);
      });

    const pendingOrders = pendingOrderGroups.size;

    const totalRevenue = transactions.reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalCommission = transactions.reduce((sum, t) => sum + (t.commission || 0), 0);
    const totalDeliveryCharges = transactions.reduce((sum, t) => sum + (t.deliveryCharge || 0), 0);

    const pendingAmount = transactions
      .filter(t => t.paymentStatus === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const paidAmount = transactions
      .filter(t => t.paymentStatus === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingCommission = transactions
      .filter(t => t.commissionStatus === 'pending')
      .reduce((sum, t) => sum + (t.commission || 0), 0);

    const paidCommission = transactions
      .filter(t => t.commissionStatus === 'paid')
      .reduce((sum, t) => sum + (t.commission || 0), 0);

    // New customers calculation
    const newCustomers = transactions.filter(t => t.isNewCustomer === 'true').length;

    // Get recent transactions and expenses
    const recentTransactions = transactions.slice(0, 5);
    const recentExpenses = expenses.slice(0, 5);

    console.log('Dashboard Stats - Order Count Debug:', {
      totalTransactions,
      totalOrders,
      orderGroupsSize: orderGroups.size,
      pendingOrders,
      pendingOrderGroupsSize: pendingOrderGroups.size,
      transactionsWithOrderId: transactions.filter(t => t.orderId && t.orderId.trim() !== '').length
    });

    return {
      dailyTransactions: totalTransactions, // Total transaction records
      weeklyTransactions: totalTransactions, // Total transaction records
      pendingPayments: pendingOrders, // Pending orders count
      totalCommission,
      recentTransactions,
      recentExpenses,
      totalOrders, // Unique orders count (using improved logic)
      totalTransactions, // Total transaction records
      pendingOrders,
      totalRevenue,
      totalExpenses,
      totalDeliveryCharges,
      pendingAmount,
      paidAmount,
      pendingCommission,
      paidCommission,
      newCustomers
    };
  }, [transactions, expenses]);

  return { dashboardStats };
};
