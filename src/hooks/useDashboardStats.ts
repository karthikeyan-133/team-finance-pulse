
import { Transaction, Expense, DashboardStats } from '../types';

export const useDashboardStats = (transactions: Transaction[], expenses: Expense[]) => {
  // Generate dashboard stats
  const calculateDashboardStats = (): DashboardStats => {
    return {
      dailyTransactions: transactions.filter(t => {
        const today = new Date().toISOString().split('T')[0];
        return new Date(t.date).toISOString().split('T')[0] === today;
      }).length,
      weeklyTransactions: transactions.filter(t => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        return new Date(t.date) >= oneWeekAgo;
      }).length,
      pendingPayments: transactions
        .filter(t => t.paymentStatus === 'pending')
        .reduce((sum, t) => sum + t.amount, 0),
      totalCommission: transactions
        .reduce((sum, t) => sum + (t.commission || 0), 0),
      recentTransactions: [...transactions]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
      recentExpenses: [...expenses]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 5),
    };
  };

  return {
    dashboardStats: calculateDashboardStats()
  };
};
