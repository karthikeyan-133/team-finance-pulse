
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ShopPayment {
  id: string;
  shop_name: string;
  amount: number;
  payment_date: string;
  payment_status: 'pending' | 'paid';
  payment_type: 'commission' | 'delivery_charge' | 'other';
  order_id?: string;
  transaction_id?: string;
  paid_by?: string;
  paid_at?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface ShopPaymentSummary {
  shop_name: string;
  payment_date: string;
  pending_amount: number;
  paid_amount: number;
  total_amount: number;
  total_transactions: number;
  pending_transactions: number;
}

export const useShopPayments = (shopName?: string) => {
  const [payments, setPayments] = useState<ShopPayment[]>([]);
  const [summaries, setSummaries] = useState<ShopPaymentSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPayments = async () => {
    try {
      setIsLoading(true);
      console.log('Fetching shop payments...', { shopName });
      
      let query = supabase
        .from('shop_payments')
        .select('*')
        .order('payment_date', { ascending: false })
        .order('created_at', { ascending: false });

      if (shopName) {
        query = query.ilike('shop_name', `%${shopName}%`);
        console.log('Filtering by shop name:', shopName);
      } else {
        console.log('Fetching all shop payments (no filter)');
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching shop payments:', error);
        toast.error('Failed to fetch payment data: ' + error.message);
        return;
      }
      
      console.log('Fetched shop payments:', data?.length || 0, 'records');
      
      const typedData = (data || []).map(item => ({
        ...item,
        payment_status: item.payment_status as 'pending' | 'paid',
        amount: Number(item.amount)
      })) as ShopPayment[];
      
      setPayments(typedData);
    } catch (error) {
      console.error('Error fetching shop payments:', error);
      toast.error('Failed to fetch payment data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSummaries = async () => {
    try {
      console.log('Fetching shop payment summaries...');
      
      let query = supabase
        .from('shop_payment_summary')
        .select('*')
        .order('payment_date', { ascending: false });

      if (shopName) {
        query = query.ilike('shop_name', `%${shopName}%`);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching payment summaries:', error);
        toast.error('Failed to fetch payment summaries: ' + error.message);
        return;
      }
      
      console.log('Fetched payment summaries:', data?.length || 0, 'records');
      setSummaries(data || []);
    } catch (error) {
      console.error('Error fetching payment summaries:', error);
      toast.error('Failed to fetch payment summaries');
    }
  };

  const markAsPaid = async (paymentId: string, paidBy: string) => {
    try {
      console.log('Marking payment as paid:', paymentId);
      
      const { error } = await supabase
        .from('shop_payments')
        .update({
          payment_status: 'paid',
          paid_by: paidBy,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) {
        console.error('Error marking payment as paid:', error);
        toast.error('Failed to update payment status: ' + error.message);
        return;
      }

      toast.success('Payment marked as paid successfully');
      await refreshData();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast.error('Failed to update payment status');
    }
  };

  const markAsPending = async (paymentId: string) => {
    try {
      console.log('Marking payment as pending:', paymentId);
      
      const { error } = await supabase
        .from('shop_payments')
        .update({
          payment_status: 'pending',
          paid_by: null,
          paid_at: null,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) {
        console.error('Error marking payment as pending:', error);
        toast.error('Failed to update payment status: ' + error.message);
        return;
      }

      toast.success('Payment marked as pending successfully');
      await refreshData();
    } catch (error) {
      console.error('Error marking payment as pending:', error);
      toast.error('Failed to update payment status');
    }
  };

  const updatePaymentAmount = async (paymentId: string, newAmount: number) => {
    try {
      console.log('Updating payment amount:', paymentId, 'to:', newAmount);
      
      const { error } = await supabase
        .from('shop_payments')
        .update({
          amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) {
        console.error('Error updating payment amount:', error);
        toast.error('Failed to update payment amount: ' + error.message);
        return;
      }

      toast.success('Payment amount updated successfully');
      await refreshData();
    } catch (error) {
      console.error('Error updating payment amount:', error);
      toast.error('Failed to update payment amount');
    }
  };

  const getTotalPendingAmount = () => {
    return payments
      .filter(payment => payment.payment_status === 'pending')
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
  };

  const getTotalPaidAmount = () => {
    return payments
      .filter(payment => payment.payment_status === 'paid')
      .reduce((sum, payment) => sum + Number(payment.amount), 0);
  };

  const refreshData = async () => {
    console.log('Refreshing shop payment data...');
    await Promise.all([
      fetchPayments(),
      fetchSummaries()
    ]);
  };

  useEffect(() => {
    refreshData();
  }, [shopName]);

  // Set up real-time subscription
  useEffect(() => {
    console.log('Setting up real-time subscription for shop_payments');
    
    const channel = supabase
      .channel('shop_payments_changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'shop_payments' }, 
        (payload) => {
          console.log('Shop payment change detected:', payload);
          fetchPayments();
        }
      )
      .subscribe();

    return () => {
      console.log('Cleaning up shop payments subscription');
      supabase.removeChannel(channel);
    };
  }, [shopName]);

  return {
    payments,
    summaries,
    isLoading,
    markAsPaid,
    markAsPending,
    updatePaymentAmount,
    getTotalPendingAmount,
    getTotalPaidAmount,
    refreshData
  };
};
