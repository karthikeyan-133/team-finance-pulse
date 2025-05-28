import React, { createContext, useState, useContext, useEffect } from 'react';
import { Customer, Transaction, Expense, DashboardStats } from '../types';
import { useAuth } from './AuthContext';
import { loadDataFromStorage, saveDataToStorage } from '../utils/localStorage';
import { useCustomers } from '../hooks/useCustomers';
import { useTransactions } from '../hooks/useTransactions';
import { useExpenses } from '../hooks/useExpenses';
import { useDashboardStats } from '../hooks/useDashboardStats';

interface DataContextType {
  customers: Customer[];
  transactions: Transaction[];
  expenses: Expense[];
  dashboardStats: DashboardStats;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => string;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => string;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  getCustomerById: (id: string) => Customer | undefined;
  isLoading: boolean;
  pendingAmount: number;
  totalAmount: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize data hooks with empty arrays
  const {
    customers, 
    setCustomers, 
    addCustomer, 
    getCustomerById
  } = useCustomers([]);
  
  const {
    transactions, 
    setTransactions, 
    addTransaction, 
    updateTransaction,
    calculateTransactionStats
  } = useTransactions([]);
  
  const {
    expenses, 
    setExpenses, 
    addExpense, 
    updateExpense
  } = useExpenses([]);

  // Load data from localStorage or use mock data
  useEffect(() => {
    const loadData = () => {
      const data = loadDataFromStorage(!!user);
      setCustomers(data.customers);
      setTransactions(data.transactions);
      setExpenses(data.expenses);
      setIsLoading(false);
    };

    if (user) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [user, setCustomers, setTransactions, setExpenses]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    saveDataToStorage(customers, transactions, expenses, !!user);
  }, [customers, transactions, expenses, user]);

  // Calculate transaction statistics
  const { pendingAmount, totalAmount } = calculateTransactionStats();

  // Calculate dashboard stats
  const { dashboardStats } = useDashboardStats(transactions, expenses);

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
