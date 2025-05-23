
import { useState } from 'react';
import { Transaction } from '../types';
import { toast } from '@/components/ui/sonner';

export const useTransactions = (initialTransactions: Transaction[] = []) => {
  const [transactions, setTransactions] = useState<Transaction[]>(initialTransactions);

  const addTransaction = (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
      createdAt: now,
      updatedAt: now,
    };
    
    setTransactions(prev => [...prev, newTransaction]);
    
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
