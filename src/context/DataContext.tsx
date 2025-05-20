
import React, { createContext, useState, useContext, useEffect } from 'react';
import { Customer, Transaction, Expense, DashboardStats } from '../types';
import { toast } from '@/components/ui/sonner';
import { useAuth } from './AuthContext';

interface DataContextType {
  customers: Customer[];
  transactions: Transaction[];
  expenses: Expense[];
  dashboardStats: DashboardStats;
  addCustomer: (customer: Omit<Customer, 'id' | 'createdAt'>) => void;
  addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  updateTransaction: (id: string, updates: Partial<Transaction>) => void;
  updateExpense: (id: string, updates: Partial<Expense>) => void;
  getCustomerById: (id: string) => Customer | undefined;
  isLoading: boolean;
  pendingAmount: number;
  totalAmount: number;
}

const mockCustomers: Customer[] = [
  {
    id: '1',
    name: 'Rajesh Kumar',
    phone: '9898989898',
    email: 'rajesh@example.com',
    address: 'Bangalore, Karnataka',
    isNew: false,
    createdAt: '2023-01-15T10:30:00Z',
  },
  {
    id: '2',
    name: 'Priya Sharma',
    phone: '8787878787',
    address: 'Delhi, NCR',
    isNew: true,
    createdAt: '2023-05-20T14:45:00Z',
  },
  {
    id: '3',
    name: 'Amit Patel',
    phone: '7676767676',
    email: 'amit@example.com',
    address: 'Mumbai, Maharashtra',
    isNew: false,
    createdAt: '2022-11-05T09:15:00Z',
  },
];

const mockTransactions: Transaction[] = [
  {
    id: '1',
    customerId: '1',
    shopName: 'Electronics Hub',
    date: '2023-06-10T12:30:00Z',
    amount: 12500,
    paymentStatus: 'paid',
    paymentMethod: 'upi',
    deliveryCharge: 200,
    commission: 500,
    commissionStatus: 'paid',
    description: 'Laptop delivery',
    handledBy: '3',
    updatedAt: '2023-06-10T12:30:00Z',
    createdAt: '2023-06-10T09:30:00Z',
  },
  {
    id: '2',
    customerId: '2',
    shopName: 'Fashion Store',
    date: '2023-06-12T15:45:00Z',
    amount: 3200,
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    deliveryCharge: 100,
    commission: 150,
    commissionStatus: 'pending',
    description: 'Clothing items delivery',
    handledBy: '3',
    updatedAt: '2023-06-12T15:45:00Z',
    createdAt: '2023-06-12T11:30:00Z',
  },
  {
    id: '3',
    customerId: '3',
    shopName: 'Grocery Mart',
    date: '2023-06-13T10:15:00Z',
    amount: 1800,
    paymentStatus: 'paid',
    paymentMethod: 'cash',
    deliveryCharge: null,
    commission: 80,
    commissionStatus: 'paid',
    handledBy: '2',
    updatedAt: '2023-06-13T10:15:00Z',
    createdAt: '2023-06-13T09:30:00Z',
  },
];

const mockExpenses: Expense[] = [
  {
    id: '1',
    title: 'Fuel',
    amount: 1200,
    date: '2023-06-10T08:00:00Z',
    category: 'Transportation',
    description: 'Monthly fuel expenses for delivery vehicles',
    addedBy: '1',
    createdAt: '2023-06-10T08:00:00Z',
  },
  {
    id: '2',
    title: 'Office Supplies',
    amount: 600,
    date: '2023-06-11T14:30:00Z',
    category: 'Office',
    description: 'Stationery and printer ink',
    addedBy: '1',
    createdAt: '2023-06-11T14:30:00Z',
  },
];

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage or use mock data
  useEffect(() => {
    const loadData = () => {
      try {
        const savedCustomers = localStorage.getItem('delivery_customers');
        const savedTransactions = localStorage.getItem('delivery_transactions');
        const savedExpenses = localStorage.getItem('delivery_expenses');

        setCustomers(savedCustomers ? JSON.parse(savedCustomers) : mockCustomers);
        setTransactions(savedTransactions ? JSON.parse(savedTransactions) : mockTransactions);
        setExpenses(savedExpenses ? JSON.parse(savedExpenses) : mockExpenses);
      } catch (error) {
        console.error('Error loading data:', error);
        toast.error('Error loading data');
        
        // Use mock data as fallback
        setCustomers(mockCustomers);
        setTransactions(mockTransactions);
        setExpenses(mockExpenses);
      } finally {
        setIsLoading(false);
      }
    };

    // Only load data if user is logged in
    if (user) {
      loadData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('delivery_customers', JSON.stringify(customers));
      localStorage.setItem('delivery_transactions', JSON.stringify(transactions));
      localStorage.setItem('delivery_expenses', JSON.stringify(expenses));
    }
  }, [customers, transactions, expenses, user]);

  // Calculate pending amount
  const pendingAmount = transactions
    .filter(t => t.paymentStatus === 'pending')
    .reduce((sum, t) => sum + t.amount, 0);

  // Calculate total amount
  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

  // Generate dashboard stats
  const dashboardStats: DashboardStats = {
    dailyTransactions: transactions.filter(t => {
      const today = new Date().toISOString().split('T')[0];
      return new Date(t.date).toISOString().split('T')[0] === today;
    }).length,
    weeklyTransactions: transactions.filter(t => {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return new Date(t.date) >= oneWeekAgo;
    }).length,
    pendingPayments: pendingAmount,
    totalCommission: transactions
      .reduce((sum, t) => sum + (t.commission || 0), 0),
    recentTransactions: [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
    recentExpenses: [...expenses]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5),
  };

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    toast.success('Customer added successfully');
  };

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    toast.success('Transaction added successfully');
  };

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setExpenses(prev => [...prev, newExpense]);
    toast.success('Expense added successfully');
  };

  const updateTransaction = (id: string, updates: Partial<Transaction>) => {
    setTransactions(prev =>
      prev.map(transaction => {
        if (transaction.id === id) {
          return { 
            ...transaction, 
            ...updates, 
            updatedAt: new Date().toISOString() 
          };
        }
        return transaction;
      })
    );
    toast.success('Transaction updated successfully');
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setExpenses(prev =>
      prev.map(expense => {
        if (expense.id === id) {
          return { ...expense, ...updates };
        }
        return expense;
      })
    );
    toast.success('Expense updated successfully');
  };

  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

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
