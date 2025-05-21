
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useData } from '@/context/DataContext';
import { MapPin, Truck, Tag, User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const DeliveryForm = () => {
  const { addTransaction, customers } = useData();
  const { user } = useAuth();
  
  const [formData, setFormData] = useState({
    shopName: '',
    customerId: '',
    customerName: '',
    customerPhone: '',
    customerLocation: '',
    isNewCustomer: 'false',
    amount: '',
    paymentStatus: 'pending',
    paymentMethod: 'cash',
    deliveryCharge: '',
    commission: '',
    commissionStatus: 'pending',
    description: ''
  });

  const [isManualCustomer, setIsManualCustomer] = useState(true);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCustomerSelect = (customerId: string) => {
    const selectedCustomer = customers.find(c => c.id === customerId);
    if (selectedCustomer) {
      setFormData(prev => ({
        ...prev,
        customerId,
        customerName: selectedCustomer.name,
        customerPhone: selectedCustomer.phone,
        customerLocation: selectedCustomer.address || '',
        isNewCustomer: selectedCustomer.isNew ? 'true' : 'false'
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newTransaction = {
      shopName: formData.shopName,
      customerId: isManualCustomer ? 'temp-' + Date.now() : formData.customerId,
      date: new Date().toISOString(),
      amount: parseFloat(formData.amount) || 0,
      paymentStatus: formData.paymentStatus as 'paid' | 'pending',
      paymentMethod: formData.paymentMethod as 'cash' | 'upi' | 'other',
      deliveryCharge: formData.deliveryCharge ? parseFloat(formData.deliveryCharge) : null,
      commission: formData.commission ? parseFloat(formData.commission) : null,
      commissionStatus: formData.commissionStatus as 'paid' | 'pending',
      description: formData.description,
      handledBy: user?.name || 'Unknown',
    };

    // Add transaction to the system
    addTransaction(newTransaction);
    
    // Reset form
    setFormData({
      shopName: '',
      customerId: '',
      customerName: '',
      customerPhone: '',
      customerLocation: '',
      isNewCustomer: 'false',
      amount: '',
      paymentStatus: 'pending',
      paymentMethod: 'cash',
      deliveryCharge: '',
      commission: '',
      commissionStatus: 'pending',
      description: ''
    });
  };

  return (
    <Card className="w-full max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Add Delivery Record
        </CardTitle>
        <CardDescription>
          Enter details about the delivery to update the system
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Shop Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4" />
              <h3 className="text-lg font-medium">Shop Information</h3>
            </div>
            <div>
              <Label htmlFor="shopName">Shop Name</Label>
              <Input
                id="shopName"
                name="shopName"
                value={formData.shopName}
                onChange={handleInputChange}
                placeholder="Enter shop name"
                required
              />
            </div>
          </div>
          
          {/* Customer Information */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <h3 className="text-lg font-medium">Customer Information</h3>
            </div>
            
            <div className="flex items-center space-x-2">
              <RadioGroup 
                value={isManualCustomer ? "manual" : "existing"} 
                onValueChange={(val) => setIsManualCustomer(val === "manual")}
                className="flex flex-row space-x-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="manual" id="manual" />
                  <Label htmlFor="manual">New Entry</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="existing" id="existing" />
                  <Label htmlFor="existing">Select Existing</Label>
                </div>
              </RadioGroup>
            </div>
            
            {!isManualCustomer ? (
              <div>
                <Label htmlFor="customerId">Select Customer</Label>
                <Select 
                  value={formData.customerId} 
                  onValueChange={(value) => handleCustomerSelect(value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map(customer => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.phone}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ) : (
              <>
                <div>
                  <Label htmlFor="customerName">Customer Name</Label>
                  <Input
                    id="customerName"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleInputChange}
                    placeholder="Enter customer name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerPhone">Customer Phone</Label>
                  <Input
                    id="customerPhone"
                    name="customerPhone"
                    value={formData.customerPhone}
                    onChange={handleInputChange}
                    placeholder="Enter phone number"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="isNewCustomer">Customer Status</Label>
                  <Select 
                    value={formData.isNewCustomer} 
                    onValueChange={(value) => handleSelectChange('isNewCustomer', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="true">New</SelectItem>
                      <SelectItem value="false">Old</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
            
            <div>
              <Label htmlFor="customerLocation" className="flex items-center gap-1">
                <MapPin className="h-3 w-3" /> Location
              </Label>
              <Input
                id="customerLocation"
                name="customerLocation"
                value={formData.customerLocation}
                onChange={handleInputChange}
                placeholder="Enter location or coordinates"
              />
            </div>
          </div>
          
          {/* Payment Information */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Payment Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="amount">Amount (₹)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  value={formData.amount}
                  onChange={handleInputChange}
                  placeholder="Enter amount"
                  required
                />
              </div>
              <div>
                <Label htmlFor="paymentStatus">Amount Status</Label>
                <Select 
                  value={formData.paymentStatus} 
                  onValueChange={(value) => handleSelectChange('paymentStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="paymentMethod">Payment Method</Label>
                <Select 
                  value={formData.paymentMethod} 
                  onValueChange={(value) => handleSelectChange('paymentMethod', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cash">Cash</SelectItem>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Delivery and Commission */}
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Delivery & Commission</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="deliveryCharge">Delivery Charge (₹)</Label>
                <Input
                  id="deliveryCharge"
                  name="deliveryCharge"
                  type="number"
                  value={formData.deliveryCharge}
                  onChange={handleInputChange}
                  placeholder="If none, leave empty"
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
                  placeholder="If none, leave empty"
                />
              </div>
              <div>
                <Label htmlFor="commissionStatus">Commission Status</Label>
                <Select 
                  value={formData.commissionStatus} 
                  onValueChange={(value) => handleSelectChange('commissionStatus', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paid">Paid</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          {/* Additional Info */}
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Input
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              placeholder="Add any additional notes"
            />
          </div>
          
          <Button type="submit" className="w-full">Submit Delivery Record</Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default DeliveryForm;
