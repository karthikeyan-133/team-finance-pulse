

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

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
      
      let query = supabase
        .from('shop_payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (shopName) {
        query = query.eq('shop_name', shopName);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      // Type the data properly to ensure payment_status is correctly typed
      const typedData = (data || []).map(item => ({
        ...item,
        payment_status: item.payment_status as 'pending' | 'paid'
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
      let query = supabase
        .from('shop_payment_summary')
        .select('*')
        .order('payment_date', { ascending: false });

      if (shopName) {
        query = query.eq('shop_name', shopName);
      }

      const { data, error } = await query;

      if (error) throw error;
      setSummaries(data || []);
    } catch (error) {
      console.error('Error fetching payment summaries:', error);
      toast.error('Failed to fetch payment summaries');
    }
  };

  const markAsPaid = async (paymentId: string, paidBy: string) => {
    try {
      const { error } = await supabase
        .from('shop_payments')
        .update({
          payment_status: 'paid',
          paid_by: paidBy,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Payment marked as paid successfully');
      await fetchPayments();
      await fetchSummaries();
    } catch (error) {
      console.error('Error marking payment as paid:', error);
      toast.error('Failed to update payment status');
    }
  };

  const updatePaymentAmount = async (paymentId: string, newAmount: number) => {
    try {
      const { error } = await supabase
        .from('shop_payments')
        .update({
          amount: newAmount,
          updated_at: new Date().toISOString()
        })
        .eq('id', paymentId);

      if (error) throw error;

      toast.success('Payment amount updated successfully');
      await fetchPayments();
      await fetchSummaries();
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

  useEffect(() => {
    fetchPayments();
    fetchSummaries();
  }, [shopName]);

  return {
    payments,
    summaries,
    isLoading,
    markAsPaid,
    updatePaymentAmount,
    getTotalPendingAmount,
    getTotalPaidAmount,
    refreshData: () => {
      fetchPayments();
      fetchSummaries();
    }
  };
};

