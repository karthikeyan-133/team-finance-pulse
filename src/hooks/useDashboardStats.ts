
import { useMemo } from 'react';
import { Transaction, Expense } from '../types';

export const useDashboardStats = (transactions: Transaction[], expenses: Expense[]) => {
  const dashboardStats = useMemo(() => {
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

    return {
      totalOrders,
      pendingOrders,
      totalRevenue,
      totalExpenses,
      totalCommission,
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
