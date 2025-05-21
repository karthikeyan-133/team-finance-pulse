
import { useState } from 'react';
import { Transaction } from '../types';
import { toast } from '@/components/ui/sonner';
import { useCustomers } from './useCustomers';

export const useTransactions = (initialTransactions: Transaction[] = []) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);
  const { addCustomer } = useCustomers();

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    
    // If the transaction is for a new customer (starts with temp-), create a customer record
    if (transaction.customerId.startsWith('temp-') && 
        transaction.customerName && 
        transaction.customerPhone) {
      // Add customer to the system
      const customerId = addCustomer({
        name: transaction.customerName,
        phone: transaction.customerPhone,
        address: transaction.customerLocation,
        isNew: transaction.isNewCustomer === 'true',
      });
      
      // Update the transaction with the real customer ID
      newTransaction.customerId = customerId;
    }
    
    setTransactions(prev => [...prev, newTransaction]);
    toast.success('Transaction added successfully');
    
    return newTransaction.id;
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

  // Calculate transaction statistics
  const calculateTransactionStats = () => {
    const pendingAmount = transactions
      .filter(t => t.paymentStatus === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    return {
      pendingAmount,
      totalAmount
    };
  };

  return {
    transactions,
    setTransactions,
    addTransaction,
    updateTransaction,
    calculateTransactionStats
  };
};
