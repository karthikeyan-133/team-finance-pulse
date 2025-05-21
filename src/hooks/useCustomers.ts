
import { useState } from 'react';
import { Customer } from '../types';
import { toast } from '@/components/ui/sonner';

export const useCustomers = (initialCustomers: Customer[] = []) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>) => {
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    toast.success('Customer added successfully');
    
    return newCustomer.id; // Return the ID so it can be used in transactions
  };

  const getCustomerById = (id: string) => {
    return customers.find(customer => customer.id === id);
  };

  return {
    customers,
    setCustomers,
    addCustomer,
    getCustomerById
  };
};
