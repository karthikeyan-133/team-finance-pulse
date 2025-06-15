
import React from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Plus, Trash2 } from 'lucide-react';
import { useShopOwner } from '@/context/ShopOwnerContext';
import { toast } from '@/components/ui/sonner';

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  quantity: z.number().min(1, 'Quantity must be at least 1'),
  price: z.number().min(0, 'Price must be positive'),
  description: z.string().optional(),
});

const orderSchema = z.object({
  customer_name: z.string().min(1, 'Customer name is required'),
  customer_phone: z.string().min(10, 'Valid phone number is required'),
  customer_address: z.string().min(1, 'Customer address is required'),
  product_details: z.array(productSchema).min(1, 'At least one product is required'),
  delivery_charge: z.number().min(0, 'Delivery charge must be positive').optional(),
  commission: z.number().min(0, 'Commission must be positive').optional(),
  payment_method: z.enum(['cash', 'upi', 'card', 'other']),
  special_instructions: z.string().optional(),
});

type OrderFormData = z.infer<typeof orderSchema>;

interface ShopOwnerOrderFormProps {
  onSuccess?: () => void;
}

const ShopOwnerOrderForm: React.FC<ShopOwnerOrderFormProps> = ({ onSuccess }) => {
  const { createOrder, shopName } = useShopOwner();
  
  const { register, handleSubmit, control, watch, setValue, formState: { errors, isSubmitting } } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      product_details: [{ name: '', quantity: 1, price: 0, description: '' }],
      delivery_charge: 0,
      commission: 0,
      payment_method: 'cash',
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'product_details'
  });

  const productDetails = watch('product_details');
  const deliveryCharge = watch('delivery_charge') || 0;

  // Calculate total amount
  const totalAmount = productDetails.reduce((sum, product) => {
    return sum + (product.quantity * product.price);
  }, 0) + deliveryCharge;

  const onSubmit = async (data: OrderFormData) => {
    try {
      await createOrder({
        customer_name: data.customer_name,
        customer_phone: data.customer_phone,
        customer_address: data.customer_address,
        shop_name: shopName,
        product_details: data.product_details,
        total_amount: totalAmount,
        delivery_charge: data.delivery_charge || 0,
        commission: data.commission || 0,
        payment_method: data.payment_method,
        payment_status: 'pending',
        order_status: 'pending',
        special_instructions: data.special_instructions,
        created_by: `Shop Owner - ${shopName}`
      });
      
      onSuccess?.();
    } catch (error) {
      console.error('Failed to create order:', error);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Order</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="customer_name">Customer Name</Label>
              <Input
                id="customer_name"
                {...register('customer_name')}
                className="mt-1"
              />
              {errors.customer_name && (
                <p className="text-red-500 text-sm mt-1">{errors.customer_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="customer_phone">Customer Phone</Label>
              <Input
                id="customer_phone"
                {...register('customer_phone')}
                className="mt-1"
              />
              {errors.customer_phone && (
                <p className="text-red-500 text-sm mt-1">{errors.customer_phone.message}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="customer_address">Customer Address</Label>
            <Textarea
              id="customer_address"
              {...register('customer_address')}
              className="mt-1"
            />
            {errors.customer_address && (
              <p className="text-red-500 text-sm mt-1">{errors.customer_address.message}</p>
            )}
          </div>

          {/* Product Details */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <Label className="text-lg font-medium">Product Details</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => append({ name: '', quantity: 1, price: 0, description: '' })}
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Product
              </Button>
            </div>

            {fields.map((field, index) => (
              <Card key={field.id} className="mb-4">
                <CardContent className="pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <Label>Product Name</Label>
                      <Input
                        {...register(`product_details.${index}.name`)}
                        placeholder="Enter product name"
                      />
                      {errors.product_details?.[index]?.name && (
                        <p className="text-red-500 text-sm mt-1">
                          {errors.product_details[index]?.name?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <Label>Quantity</Label>
                      <Input
                        type="number"
                        {...register(`product_details.${index}.quantity`, { valueAsNumber: true })}
                        min="1"
                      />
                    </div>

                    <div>
                      <Label>Price (₹)</Label>
                      <Input
                        type="number"
                        step="0.01"
                        {...register(`product_details.${index}.price`, { valueAsNumber: true })}
                        min="0"
                      />
                    </div>

                    <div className="flex items-end">
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => remove(index)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="mt-2">
                    <Label>Description (Optional)</Label>
                    <Input
                      {...register(`product_details.${index}.description`)}
                      placeholder="Product description"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="delivery_charge">Delivery Charge (₹)</Label>
              <Input
                id="delivery_charge"
                type="number"
                step="0.01"
                {...register('delivery_charge', { valueAsNumber: true })}
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
              <Label htmlFor="payment_method">Payment Method</Label>
              <Select
                value={watch('payment_method')}
                onValueChange={(value) => setValue('payment_method', value as any)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Cash</SelectItem>
                  <SelectItem value="upi">UPI</SelectItem>
                  <SelectItem value="card">Card</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              {...register('special_instructions')}
              className="mt-1"
              placeholder="Any special instructions for the order"
            />
          </div>

          {/* Total Amount Display */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-lg font-medium">
              Total Amount: ₹{totalAmount.toFixed(2)}
            </div>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? 'Creating Order...' : 'Create Order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default ShopOwnerOrderForm;
