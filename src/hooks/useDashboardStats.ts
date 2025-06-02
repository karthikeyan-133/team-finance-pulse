
import { useMemo } from 'react';
import { Transaction, Expense, DashboardStats } from '../types';

export const useDashboardStats = (transactions: Transaction[], expenses: Expense[]) => {
  const dashboardStats = useMemo((): DashboardStats => {
    // Calculate unique orders instead of individual transactions
    const uniqueOrderIds = new Set(transactions.map(t => t.orderId).filter(Boolean));
    const totalOrders = uniqueOrderIds.size;

    // Calculate pending orders (orders with at least one pending transaction)
    const pendingOrderIds = new Set(
      transactions
        .filter(t => t.paymentStatus === 'pending')
        .map(t => t.orderId)
        .filter(Boolean)
    );
    const pendingOrders = pendingOrderIds.size;

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

    return {
      dailyTransactions: transactions.length, // Total individual transactions
      weeklyTransactions: transactions.length, // Total individual transactions 
      pendingPayments: pendingOrders, // Pending orders count
      totalCommission,
      recentTransactions,
      recentExpenses,
      totalOrders, // Unique orders count
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
