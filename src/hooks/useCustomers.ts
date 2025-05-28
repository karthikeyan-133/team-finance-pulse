
import { useState } from 'react';
import { Customer } from '../types';
import { toast } from '@/components/ui/sonner';

export const useCustomers = (initialCustomers: Customer[] = []) => {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);

  const addCustomer = (customer: Omit<Customer, 'id' | 'createdAt'>): string => {
    // Check if customer with same phone already exists
    const existingCustomer = customers.find(c => c.phone === customer.phone);
    
    if (existingCustomer) {
      // Update existing customer instead of creating new one
      const updatedCustomers = customers.map(c => {
        if (c.phone === customer.phone) {
          return {
            ...c,
            name: customer.name || c.name,
            email: customer.email || c.email,
            address: customer.address || c.address,
            customerLocation: customer.customerLocation || c.customerLocation,
            isNew: customer.isNew
          };
        }
        return c;
      });
      
      setCustomers(updatedCustomers);
      toast.success('Customer information updated');
      
      return existingCustomer.id;
    }
    
    // Create new customer
    const newCustomer: Customer = {
      ...customer,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
    };
    
    setCustomers(prev => [...prev, newCustomer]);
    
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
