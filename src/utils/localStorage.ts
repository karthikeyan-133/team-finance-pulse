
import { Customer, Transaction, Expense } from '../types';
import { toast } from '@/components/ui/sonner';

// Mock data for initial loading
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

// Load data from localStorage with fallback to mock data
export const loadDataFromStorage = (isLoggedIn: boolean) => {
  if (!isLoggedIn) {
    return {
      customers: [],
      transactions: [],
      expenses: [],
    };
  }

  try {
    const savedCustomers = localStorage.getItem('delivery_customers');
    const savedTransactions = localStorage.getItem('delivery_transactions');
    const savedExpenses = localStorage.getItem('delivery_expenses');

    return {
      customers: savedCustomers ? JSON.parse(savedCustomers) : mockCustomers,
      transactions: savedTransactions ? JSON.parse(savedTransactions) : mockTransactions,
      expenses: savedExpenses ? JSON.parse(savedExpenses) : mockExpenses,
    };
  } catch (error) {
    console.error('Error loading data:', error);
    toast.error('Error loading data');
    
    // Use mock data as fallback
    return {
      customers: mockCustomers,
      transactions: mockTransactions,
      expenses: mockExpenses,
    };
  }
};

// Save data to localStorage
export const saveDataToStorage = (
  customers: Customer[],
  transactions: Transaction[],
  expenses: Expense[],
  isLoggedIn: boolean
) => {
  if (!isLoggedIn) return;
  
  localStorage.setItem('delivery_customers', JSON.stringify(customers));
  localStorage.setItem('delivery_transactions', JSON.stringify(transactions));
  localStorage.setItem('delivery_expenses', JSON.stringify(expenses));
};
