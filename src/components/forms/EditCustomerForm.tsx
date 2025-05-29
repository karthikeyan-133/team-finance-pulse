
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Customer } from '../../types';
import { useData } from '../../context/DataContext';
import { toast } from '@/components/ui/sonner';

const customerSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  phone: z.string().min(10, 'Phone number must be at least 10 digits'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  address: z.string().optional(),
  customerLocation: z.string().optional(),
  isNew: z.boolean(),
});

interface EditCustomerFormProps {
  customer: Customer;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditCustomerForm: React.FC<EditCustomerFormProps> = ({ 
  customer, 
  onSuccess, 
  onCancel 
}) => {
  const { addCustomer } = useData(); // We use addCustomer as it handles updates for existing customers
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: customer.name,
      phone: customer.phone,
      email: customer.email || '',
      address: customer.address || '',
      customerLocation: customer.customerLocation || '',
      isNew: customer.isNew,
    }
  });

  const onSubmit = async (data: z.infer<typeof customerSchema>) => {
    try {
      await addCustomer({
        name: data.name,
        phone: data.phone,
        email: data.email || '',
        address: data.address || '',
        customerLocation: data.customerLocation || '',
        isNew: data.isNew,
      });
      toast.success('Customer updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Failed to update customer:', error);
      toast.error('Failed to update customer');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          {...register('name')}
          className="mt-1"
        />
        {errors.name && (
          <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          {...register('phone')}
          className="mt-1"
        />
        {errors.phone && (
          <p className="text-red-500 text-sm mt-1">{errors.phone.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          {...register('email')}
          className="mt-1"
        />
        {errors.email && (
          <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Textarea
          id="address"
          {...register('address')}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="customerLocation">Customer Location</Label>
        <Input
          id="customerLocation"
          {...register('customerLocation')}
          className="mt-1"
        />
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="isNew"
          checked={watch('isNew')}
          onCheckedChange={(checked) => setValue('isNew', checked)}
        />
        <Label htmlFor="isNew">New Customer</Label>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Customer
        </Button>
      </div>
    </form>
  );
};

export default EditCustomerForm;
