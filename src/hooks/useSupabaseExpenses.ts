import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Expense } from '../types';
import { toast } from '@/components/ui/sonner';

export const useSupabaseExpenses = () => {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load expenses from Supabase
  useEffect(() => {
    const loadExpenses = async () => {
      try {
        const { data, error } = await supabase
          .from('expenses')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedExpenses: Expense[] = data.map(expense => ({
          id: expense.id,
          title: expense.title,
          amount: Number(expense.amount),
          date: expense.date,
          category: expense.category || '',
          description: expense.description || '',
          addedBy: expense.added_by || '',
          createdAt: expense.created_at
        }));

        setExpenses(formattedExpenses);
      } catch (error) {
        console.error('Error loading expenses:', error);
        toast.error('Failed to load expenses');
      } finally {
        setIsLoading(false);
      }
    };

    loadExpenses();

    // Set up real-time subscription
    const channel = supabase
      .channel('expenses-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'expenses' },
        () => {
          loadExpenses();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addExpense = async (expense: Omit<Expense, 'id' | 'createdAt'>) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .insert([{
          title: expense.title,
          amount: expense.amount,
          date: expense.date,
          category: expense.category,
          description: expense.description,
          added_by: expense.addedBy
        }]);

      if (error) throw error;
      
      toast.success('Expense added successfully');
    } catch (error) {
      console.error('Error adding expense:', error);
      toast.error('Failed to add expense');
      throw error;
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .update({
          title: updates.title,
          amount: updates.amount,
          date: updates.date,
          category: updates.category,
          description: updates.description,
          added_by: updates.addedBy
        })
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Expense updated successfully');
    } catch (error) {
      console.error('Error updating expense:', error);
      toast.error('Failed to update expense');
      throw error;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      const { error } = await supabase
        .from('expenses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Expense deleted successfully');
    } catch (error) {
      console.error('Error deleting expense:', error);
      toast.error('Failed to delete expense');
      throw error;
    }
  };

  return {
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    isLoading
  };
};
