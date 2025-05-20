
import { useState } from 'react';
import { Expense } from '../types';
import { toast } from '@/components/ui/sonner';

export const useExpenses = (initialExpenses: Expense[] = []) => {
  const [expenses, setExpenses] = useState<Expense[]>(initialExpenses);

  const addExpense = (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    const newExpense: Expense = {
      ...expense,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setExpenses(prev => [...prev, newExpense]);
    toast.success('Expense added successfully');
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

  return {
    expenses,
    setExpenses,
    addExpense,
    updateExpense
  };
};
