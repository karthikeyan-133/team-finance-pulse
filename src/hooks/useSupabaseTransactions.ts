
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Transaction } from '../types';
import { toast } from '@/components/ui/sonner';

export const useSupabaseTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load transactions from Supabase
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedTransactions: Transaction[] = data.map(transaction => ({
          id: transaction.id,
          customerId: transaction.customer_id || '',
          customerName: transaction.customer_name || '',
          customerPhone: transaction.customer_phone || '',
          customerLocation: transaction.customer_location || '',
          isNewCustomer: transaction.is_new_customer || 'false',
          shopName: transaction.shop_name,
          date: transaction.date,
          amount: Number(transaction.amount),
          paymentStatus: transaction.payment_status as 'paid' | 'pending',
          paymentMethod: transaction.payment_method as 'cash' | 'upi' | 'other',
          deliveryCharge: transaction.delivery_charge ? Number(transaction.delivery_charge) : null,
          commission: transaction.commission ? Number(transaction.commission) : null,
          commissionStatus: transaction.commission_status as 'paid' | 'pending',
          description: transaction.description || '',
          handledBy: transaction.handled_by || '',
          orderId: transaction.order_id || '',
          createdAt: transaction.created_at,
          updatedAt: transaction.updated_at
        }));

        setTransactions(formattedTransactions);
      } catch (error) {
        console.error('Error loading transactions:', error);
        toast.error('Failed to load transactions');
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();

    // Set up real-time subscription
    const channel = supabase
      .channel('transactions-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'transactions' },
        () => {
          loadTransactions();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .insert([{
          customer_id: transaction.customerId,
          customer_name: transaction.customerName,
          customer_phone: transaction.customerPhone,
          customer_location: transaction.customerLocation,
          is_new_customer: transaction.isNewCustomer,
          shop_name: transaction.shopName,
          date: transaction.date,
          amount: transaction.amount,
          payment_status: transaction.paymentStatus,
          payment_method: transaction.paymentMethod,
          delivery_charge: transaction.deliveryCharge,
          commission: transaction.commission,
          commission_status: transaction.commissionStatus,
          description: transaction.description,
          handled_by: transaction.handledBy,
          order_id: transaction.orderId
        }])
        .select()
        .single();

      if (error) throw error;
      
      toast.success('Transaction added successfully');
      return data.id;
    } catch (error) {
      console.error('Error adding transaction:', error);
      toast.error('Failed to add transaction');
      throw error;
    }
  };

  const updateTransaction = async (id: string, updates: Partial<Transaction>) => {
    try {
      console.log('Updating transaction:', id, updates);
      
      // Build the update object with only the fields that are provided
      const updateData: any = {
        updated_at: new Date().toISOString()
      };

      // Only include fields that are actually being updated
      if (updates.shopName !== undefined) updateData.shop_name = updates.shopName;
      if (updates.amount !== undefined) updateData.amount = updates.amount;
      if (updates.paymentStatus !== undefined) updateData.payment_status = updates.paymentStatus;
      if (updates.paymentMethod !== undefined) updateData.payment_method = updates.paymentMethod;
      if (updates.deliveryCharge !== undefined) updateData.delivery_charge = updates.deliveryCharge;
      if (updates.commission !== undefined) updateData.commission = updates.commission;
      if (updates.commissionStatus !== undefined) updateData.commission_status = updates.commissionStatus;
      if (updates.description !== undefined) updateData.description = updates.description;
      if (updates.handledBy !== undefined) updateData.handled_by = updates.handledBy;
      if (updates.customerId !== undefined) updateData.customer_id = updates.customerId;
      if (updates.customerName !== undefined) updateData.customer_name = updates.customerName;
      if (updates.customerPhone !== undefined) updateData.customer_phone = updates.customerPhone;
      if (updates.customerLocation !== undefined) updateData.customer_location = updates.customerLocation;
      if (updates.isNewCustomer !== undefined) updateData.is_new_customer = updates.isNewCustomer;
      if (updates.orderId !== undefined) updateData.order_id = updates.orderId;

      console.log('Update data being sent:', updateData);

      const { error } = await supabase
        .from('transactions')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('Supabase update error:', error);
        throw error;
      }
      
      console.log('Transaction updated successfully');
      toast.success('Transaction updated successfully');
    } catch (error) {
      console.error('Error updating transaction:', error);
      toast.error('Failed to update transaction');
      throw error;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Transaction deleted successfully');
    } catch (error) {
      console.error('Error deleting transaction:', error);
      toast.error('Failed to delete transaction');
      throw error;
    }
  };

  // Calculate transaction statistics
  const calculateTransactionStats = () => {
    const pendingAmount = transactions
      .filter(t => t.paymentStatus === 'pending')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);

    // Count unique orders instead of individual transactions
    const uniqueOrders = new Set(transactions.map(t => t.orderId)).size;

    return {
      pendingAmount,
      totalAmount,
      totalOrders: uniqueOrders
    };
  };

  return {
    transactions,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    calculateTransactionStats,
    isLoading
  };
};
