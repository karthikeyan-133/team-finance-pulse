
import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Transaction } from '../../types';
import { useData } from '../../context/DataContext';
import { toast } from '@/components/ui/sonner';

const transactionSchema = z.object({
  shopName: z.string().min(1, 'Shop name is required'),
  amount: z.number().min(0, 'Amount must be positive'),
  paymentStatus: z.enum(['paid', 'pending']),
  paymentMethod: z.enum(['cash', 'upi', 'other']),
  deliveryCharge: z.number().nullable(),
  commission: z.number().nullable(),
  commissionStatus: z.enum(['paid', 'pending']),
  description: z.string().optional(),
  handledBy: z.string().optional(),
});

interface EditTransactionFormProps {
  transaction: Transaction;
  onSuccess: () => void;
  onCancel: () => void;
}

const EditTransactionForm: React.FC<EditTransactionFormProps> = ({ 
  transaction, 
  onSuccess, 
  onCancel 
}) => {
  const { updateTransaction } = useData();
  
  const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      shopName: transaction.shopName,
      amount: transaction.amount,
      paymentStatus: transaction.paymentStatus,
      paymentMethod: transaction.paymentMethod,
      deliveryCharge: transaction.deliveryCharge,
      commission: transaction.commission,
      commissionStatus: transaction.commissionStatus,
      description: transaction.description || '',
      handledBy: transaction.handledBy || '',
    }
  });

  const onSubmit = async (data: z.infer<typeof transactionSchema>) => {
    try {
      await updateTransaction(transaction.id, data);
      toast.success('Transaction updated successfully');
      onSuccess();
    } catch (error) {
      console.error('Failed to update transaction:', error);
      toast.error('Failed to update transaction');
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Label htmlFor="shopName">Shop Name</Label>
        <Input
          id="shopName"
          {...register('shopName')}
          className="mt-1"
        />
        {errors.shopName && (
          <p className="text-red-500 text-sm mt-1">{errors.shopName.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="amount">Amount (₹)</Label>
        <Input
          id="amount"
          type="number"
          step="0.01"
          {...register('amount', { valueAsNumber: true })}
          className="mt-1"
        />
        {errors.amount && (
          <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
        )}
      </div>

      <div>
        <Label htmlFor="paymentStatus">Payment Status</Label>
        <Select
          value={watch('paymentStatus')}
          onValueChange={(value) => setValue('paymentStatus', value as 'paid' | 'pending')}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="paymentMethod">Payment Method</Label>
        <Select
          value={watch('paymentMethod')}
          onValueChange={(value) => setValue('paymentMethod', value as 'cash' | 'upi' | 'other')}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="cash">Cash</SelectItem>
            <SelectItem value="upi">UPI</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="deliveryCharge">Delivery Charge (₹)</Label>
        <Input
          id="deliveryCharge"
          type="number"
          step="0.01"
          {...register('deliveryCharge', { valueAsNumber: true })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="commission">Commission (₹)</Label>
        <Input
          id="commission"
          type="number"
          step="0.01"
          {...register('commission', { valueAsNumber: true })}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="commissionStatus">Commission Status</Label>
        <Select
          value={watch('commissionStatus')}
          onValueChange={(value) => setValue('commissionStatus', value as 'paid' | 'pending')}
        >
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="paid">Paid</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          {...register('description')}
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="handledBy">Handled By</Label>
        <Input
          id="handledBy"
          {...register('handledBy')}
          className="mt-1"
        />
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          Update Transaction
        </Button>
      </div>
    </form>
  );
};

export default EditTransactionForm;
