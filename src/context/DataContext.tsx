
import React, { createContext, useContext } from 'react';
import { Customer, Transaction, Expense, DashboardStats } from '../types';
import { useSupabaseCustomers } from '../hooks/useSupabaseCustomers';
import { useSupabaseTransactions } from '../hooks/useSupabaseTransactions';
import { useSupabaseExpenses } from '../hooks/useSupabaseExpenses';
import { useDashboardStats } from '../hooks/useDashboardStats';

interface DataContextType {
  customers: Customer[];
  transactions: Transaction[];
  expenses: Expense[];
  dashboardStats: DashboardStats;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => Promise<string>;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => Promise<void>;
  updateTransaction: (id: string, updates: Partial<Transaction>) => Promise<void>;
  updateExpense: (id: string, updates: Partial<Expense>) => Promise<void>;
  getCustomerById: (id: string) => Customer | undefined;
  isLoading: boolean;
  pendingAmount: number;
  totalAmount: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const {
    customers, 
    addCustomer, 
    getCustomerById,
    isLoading: customersLoading
  } = useSupabaseCustomers();
  
  const {
    transactions, 
    addTransaction, 
    updateTransaction,
    calculateTransactionStats,
    isLoading: transactionsLoading
  } = useSupabaseTransactions();
  
  const {
    expenses, 
    addExpense, 
    updateExpense,
    isLoading: expensesLoading
  } = useSupabaseExpenses();

  // Calculate transaction statistics
  const { pendingAmount, totalAmount } = calculateTransactionStats();

  // Calculate dashboard stats
  const { dashboardStats } = useDashboardStats(transactions, expenses);

  const isLoading = customersLoading || transactionsLoading || expensesLoading;

  return (
    <DataContext.Provider
      value={{
        customers,
        transactions,
        expenses,
        dashboardStats,
        addCustomer,
        addTransaction,
        addExpense,
        updateTransaction,
        updateExpense,
        getCustomerById,
        isLoading,
        pendingAmount,
        totalAmount
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};
