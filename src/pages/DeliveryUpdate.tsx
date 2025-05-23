
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useData } from '@/context/DataContext';
import { MapPin, Truck } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

const DeliveryUpdate = () => {
  const { addTransaction } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    shopName: '',
    customerName: '',
    customerPhone: '',
    customerStatus: 'old',
    customerLocation: '',
    amount: '',
    amountStatus: 'pending',
    deliveryCharge: '',
    commission: '',
    paymentMethod: 'upi'
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.shopName || !formData.customerName || !formData.customerPhone || !formData.amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    const newTransaction = {
      shopName: formData.shopName,
      customerId: 'temp-' + Date.now(),
      customerName: formData.customerName,
      customerPhone: formData.customerPhone,
      customerLocation: formData.customerLocation,
      isNewCustomer: formData.customerStatus === 'new' ? 'true' : 'false',
      date: new Date().toISOString(),
      amount: parseFloat(formData.amount) || 0,
      paymentStatus: formData.amountStatus as 'paid' | 'pending',
      paymentMethod: formData.paymentMethod as 'cash' | 'upi' | 'other',
      deliveryCharge: formData.deliveryCharge ? parseFloat(formData.deliveryCharge) : null,
      commission: formData.commission ? parseFloat(formData.commission) : null,
      commissionStatus: 'pending' as 'paid' | 'pending',
      description: '',
      handledBy: user?.name || 'Unknown',
    };

    addTransaction(newTransaction);
    
    // Reset form
    setFormData({
      shopName: '',
      customerName: '',
      customerPhone: '',
      customerStatus: 'old',
      customerLocation: '',
      amount: '',
      amountStatus: 'pending',
      deliveryCharge: '',
      commission: '',
      paymentMethod: 'upi'
    });

    toast.success('Delivery details updated successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-md mx-auto">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <Truck className="h-5 w-5" />
              Update Delivery
            </CardTitle>
            <CardDescription>
              Fill in the delivery details
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  name="shopName"
                  value={formData.shopName}
                  onChange={handleInputChange}
                  placeholder="e.g., Zyra"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  name="customerName"
                  value={formData.customerName}
                  onChange={handleInputChange}
                  placeholder="e.g., Hevana"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerStatus">Customer Status</Label>
                <Select 
                  value={formData.customerStatus} 
                  onValueChange={(value) => handleSelectChange('customerStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="old">Old</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="customerPhone">Customer Number</Label>
                <Input
                  id="customerPhone"
                  name="customerPhone"
                  value={formData.customerPhone}
                  onChange={handleInputChange}
                  placeholder="e.g., 9633981130"
                  required
                />
              </div>

              <div>
                <Label htmlFor="customerLocation" className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> Customer Location
                </Label>
                <Input
                  id="customerLocation"
                  name="customerLocation"
                  value={formData.customerLocation}
                  onChange={handleInputChange}
                  placeholder="e.g., 10.7373653,76.8244398"
                />
              </div>

              <div>
                <Label htmlFor="amountStatus">Amount Status</Label>
                <Select 
                  value={formData.amountStatus} 
                  onValueChange={(value) => handleSelectChange('amountStatus', value)}
                >
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
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="e.g., 380"
                  required
                />
              </div>

              <div>
                <Label htmlFor="deliveryCharge">Delivery Charge (₹)</Label>
                <Input
                  id="deliveryCharge"
                  name="deliveryCharge"
                  type="number"
                  value={formData.deliveryCharge}
                  onChange={handleInputChange}
                  placeholder="Leave empty if nil"
                />
              </div>

              <div>
                <Label htmlFor="commission">Commission (₹)</Label>
                <Input
                  id="commission"
                  name="commission"
                  type="number"
                  value={formData.commission}
                  onChange={handleInputChange}
                  placeholder="Leave empty if nil"
                />
              </div>

              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full">
                Update Delivery
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DeliveryUpdate;
