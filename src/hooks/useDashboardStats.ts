
import { useMemo } from 'react';
import { Transaction, Expense, DashboardStats } from '../types';

export const useDashboardStats = (transactions: Transaction[], expenses: Expense[]) => {
  const dashboardStats = useMemo((): DashboardStats => {
    // Calculate unique orders based on orderId - each form submission creates one unique orderId
    const uniqueOrderIds = new Set(
      transactions
        .map(t => t.orderId)
        .filter(orderId => orderId && orderId.trim() !== '')
    );
    const totalOrders = uniqueOrderIds.size;

    // Calculate pending orders (orders with pending status)
    const pendingOrderIds = new Set(
      transactions
        .filter(t => t.paymentStatus === 'pending' && t.orderId && t.orderId.trim() !== '')
        .map(t => t.orderId)
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
      dailyTransactions: totalOrders, // Now shows total orders (each submission = 1 order)
      weeklyTransactions: totalOrders, // Now shows total orders (each submission = 1 order)
      pendingPayments: pendingOrders, // Pending orders count
      totalCommission,
      recentTransactions,
      recentExpenses,
      totalOrders, // Unique orders count (each form submission = 1 order)
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
