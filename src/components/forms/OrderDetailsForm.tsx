
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Package, Store, MapPin, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ProductDetail } from '@/types/orders';

const OrderDetailsForm = () => {
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_address: '',
    shop_name: '',
    shop_address: '',
    shop_phone: '',
    delivery_charge: '',
    commission: '',
    payment_status: 'pending',
    payment_method: 'cash',
    special_instructions: ''
  });

  const [products, setProducts] = useState<ProductDetail[]>([
    { name: '', quantity: 1, price: 0, description: '' }
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const addProduct = () => {
    setProducts(prev => [...prev, { name: '', quantity: 1, price: 0, description: '' }]);
  };

  const removeProduct = (index: number) => {
    setProducts(prev => prev.filter((_, i) => i !== index));
  };

  const updateProduct = (index: number, field: keyof ProductDetail, value: string | number) => {
    setProducts(prev => prev.map((product, i) => 
      i === index ? { ...product, [field]: value } : product
    ));
  };

  const calculateTotal = () => {
    const productTotal = products.reduce((sum, product) => sum + (product.quantity * product.price), 0);
    const deliveryCharge = parseFloat(formData.delivery_charge) || 0;
    return productTotal + deliveryCharge;
  };

  const generateOrderNumber = () => {
    return `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Validate products
      const validProducts = products.filter(p => p.name.trim() && p.quantity > 0 && p.price > 0);
      if (validProducts.length === 0) {
        toast.error('Please add at least one valid product');
        return;
      }

      const orderData = {
        order_number: generateOrderNumber(),
        customer_name: formData.customer_name,
        customer_phone: formData.customer_phone,
        customer_address: formData.customer_address,
        shop_name: formData.shop_name,
        shop_address: formData.shop_address || null,
        shop_phone: formData.shop_phone || null,
        product_details: validProducts as any, // Cast to Json type for Supabase
        total_amount: calculateTotal(),
        delivery_charge: parseFloat(formData.delivery_charge) || 0,
        commission: parseFloat(formData.commission) || 0,
        payment_status: formData.payment_status,
        payment_method: formData.payment_method,
        special_instructions: formData.special_instructions || null,
        created_by: user?.name || 'Admin'
      };

      const { error } = await supabase
        .from('orders')
        .insert([orderData]);

      if (error) throw error;

      toast.success('Order created successfully!');
      
      // Reset form
      setFormData({
        customer_name: '',
        customer_phone: '',
        customer_address: '',
        shop_name: '',
        shop_address: '',
        shop_phone: '',
        delivery_charge: '',
        commission: '',
        payment_status: 'pending',
        payment_method: 'cash',
        special_instructions: ''
      });
      setProducts([{ name: '', quantity: 1, price: 0, description: '' }]);

    } catch (error) {
      console.error('Error creating order:', error);
      toast.error('Failed to create order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Create New Order
        </CardTitle>
        <CardDescription>
          Fill in the order details including customer info, shop details, and products
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Customer Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <h3 className="text-lg font-medium">Customer Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer_name">Customer Name *</Label>
                <Input
                  id="customer_name"
                  name="customer_name"
                  value={formData.customer_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="customer_phone">Customer Phone *</Label>
                <Input
                  id="customer_phone"
                  name="customer_phone"
                  value={formData.customer_phone}
                  onChange={handleInputChange}
                  required
                />
              </div>
            </div>
            <div>
              <Label htmlFor="customer_address">Customer Address *</Label>
              <Textarea
                id="customer_address"
                name="customer_address"
                value={formData.customer_address}
                onChange={handleInputChange}
                required
              />
            </div>
          </div>

          {/* Shop Information */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Store className="h-4 w-4" />
              <h3 className="text-lg font-medium">Shop Information</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="shop_name">Shop Name *</Label>
                <Input
                  id="shop_name"
                  name="shop_name"
                  value={formData.shop_name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <Label htmlFor="shop_phone">Shop Phone</Label>
                <Input
                  id="shop_phone"
                  name="shop_phone"
                  value={formData.shop_phone}
                  onChange={handleInputChange}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="shop_address">Shop Address</Label>
              <Textarea
                id="shop_address"
                name="shop_address"
                value={formData.shop_address}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <h3 className="text-lg font-medium">Product Details</h3>
              </div>
              <Button type="button" onClick={addProduct} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                Add Product
              </Button>
            </div>
            {products.map((product, index) => (
              <div key={index} className="border rounded-lg p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">Product {index + 1}</h4>
                  {products.length > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeProduct(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <Label>Product Name *</Label>
                    <Input
                      value={product.name}
                      onChange={(e) => updateProduct(index, 'name', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Quantity *</Label>
                    <Input
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => updateProduct(index, 'quantity', parseInt(e.target.value) || 1)}
                      required
                    />
                  </div>
                  <div>
                    <Label>Price (₹) *</Label>
                    <Input
                      type="number"
                      min="0"
                      step="0.01"
                      value={product.price}
                      onChange={(e) => updateProduct(index, 'price', parseFloat(e.target.value) || 0)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <Label>Description</Label>
                  <Input
                    value={product.description}
                    onChange={(e) => updateProduct(index, 'description', e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Payment and Delivery */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Payment & Delivery</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="delivery_charge">Delivery Charge (₹)</Label>
                <Input
                  id="delivery_charge"
                  name="delivery_charge"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.delivery_charge}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="commission">Commission (₹)</Label>
                <Input
                  id="commission"
                  name="commission"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.commission}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <Label htmlFor="payment_status">Payment Status</Label>
                <Select value={formData.payment_status} onValueChange={(value) => handleSelectChange('payment_status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="payment_method">Payment Method</Label>
                <Select value={formData.payment_method} onValueChange={(value) => handleSelectChange('payment_method', value)}>
                  <SelectTrigger>
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
          </div>

          {/* Special Instructions */}
          <div>
            <Label htmlFor="special_instructions">Special Instructions</Label>
            <Textarea
              id="special_instructions"
              name="special_instructions"
              value={formData.special_instructions}
              onChange={handleInputChange}
              placeholder="Any special delivery instructions..."
            />
          </div>

          {/* Order Total */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="text-lg font-medium">
              Total Amount: ₹{calculateTotal().toFixed(2)}
            </div>
          </div>

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Creating Order...' : 'Create Order'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default OrderDetailsForm;
