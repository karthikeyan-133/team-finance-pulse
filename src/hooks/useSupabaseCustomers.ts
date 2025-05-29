import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '../types';
import { toast } from '@/components/ui/sonner';

export const useSupabaseCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load customers from Supabase
  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) throw error;

        const formattedCustomers: Customer[] = data.map(customer => ({
          id: customer.id,
          name: customer.name,
          phone: customer.phone,
          email: customer.email || '',
          address: customer.address || '',
          customerLocation: customer.customer_location || '',
          isNew: customer.is_new || false,
          createdAt: customer.created_at
        }));

        setCustomers(formattedCustomers);
      } catch (error) {
        console.error('Error loading customers:', error);
        toast.error('Failed to load customers');
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();

    // Set up real-time subscription
    const channel = supabase
      .channel('customers-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'customers' },
        () => {
          loadCustomers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addCustomer = async (customer: Omit<Customer, 'id' | 'createdAt'>): Promise<string> => {
    try {
      // Check if customer with same phone already exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('phone', customer.phone)
        .single();

      if (existingCustomer) {
        // Update existing customer
        const { error } = await supabase
          .from('customers')
          .update({
            name: customer.name,
            email: customer.email,
            address: customer.address,
            customer_location: customer.customerLocation,
            is_new: customer.isNew
          })
          .eq('phone', customer.phone);

        if (error) throw error;
        
        toast.success('Customer information updated');
        return existingCustomer.id;
      } else {
        // Create new customer
        const { data, error } = await supabase
          .from('customers')
          .insert([{
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
            address: customer.address,
            customer_location: customer.customerLocation,
            is_new: customer.isNew
          }])
          .select()
          .single();

        if (error) throw error;
        
        toast.success('Customer added successfully');
        return data.id;
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      toast.error('Failed to add customer');
      throw error;
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      toast.success('Customer deleted successfully');
    } catch (error) {
      console.error('Error deleting customer:', error);
      toast.error('Failed to delete customer');
      throw error;
    }
  };

  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

  return {
    customers,
    addCustomer,
    deleteCustomer,
    getCustomerById,
    isLoading
  };
};
