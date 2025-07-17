
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface CustomerData {
  id: string;
  name: string;
  phone: string;
  address: string;
  email?: string;
}

export const useCustomerAuth = () => {
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginPhone, setLoginPhone] = useState('');
  const [registrationName, setRegistrationName] = useState('');

  useEffect(() => {
    const savedCustomer = localStorage.getItem('customer_data');
    if (savedCustomer) {
      try {
        const customerData = JSON.parse(savedCustomer);
        setCustomer(customerData);
      } catch (error) {
        console.error('Error parsing saved customer data:', error);
        localStorage.removeItem('customer_data');
      }
    }
  }, []);

  const handleLogin = async () => {
    if (!loginPhone.trim()) {
      toast.error('Please enter your phone number');
      return null;
    }

    try {
      const { data: existingCustomer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('phone', loginPhone.trim())
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Database error:', error);
        toast.error('Login failed. Please try again.');
        return null;
      }

      if (existingCustomer) {
        setCustomer(existingCustomer);
        localStorage.setItem('customer_data', JSON.stringify(existingCustomer));
        setShowLoginForm(false);
        toast.success(`Welcome back, ${existingCustomer.name}!`);
        return { type: 'existing', customer: existingCustomer };
      } else {
        return { type: 'new', phone: loginPhone };
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please try again.');
      return null;
    }
  };

  const handleRegistration = async (name: string, address: string) => {
    try {
      const newCustomer = {
        name,
        phone: loginPhone,
        address,
        is_new: true
      };

      const { data: createdCustomer, error } = await supabase
        .from('customers')
        .insert([newCustomer])
        .select()
        .single();

      if (error) {
        console.error('Registration error:', error);
        toast.error('Registration failed. Please try again.');
        return null;
      }

      setCustomer(createdCustomer);
      localStorage.setItem('customer_data', JSON.stringify(createdCustomer));
      toast.success('Registration successful!');
      return createdCustomer;
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Registration failed. Please try again.');
      return null;
    }
  };

  const handleLogout = () => {
    setCustomer(null);
    localStorage.removeItem('customer_data');
    setLoginPhone('');
    setRegistrationName('');
    toast.info('Logged out successfully');
  };

  return {
    customer,
    showLoginForm,
    setShowLoginForm,
    loginPhone,
    setLoginPhone,
    registrationName,
    setRegistrationName,
    handleLogin,
    handleRegistration,
    handleLogout
  };
};
